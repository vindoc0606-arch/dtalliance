/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useDatabase } from './DatabaseContext';
import { College, WeeklyNote, VisitLog } from '../types';
import { 
  Search, 
  X, 
  Building2, 
  Calendar, 
  MessageSquare, 
  MapPin, 
  IndianRupee, 
  Users, 
  GraduationCap, 
  Library, 
  FileSpreadsheet, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ArrowRight,
  TrendingUp,
  Presentation,
  ToggleLeft,
  ToggleRight,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
  const { 
    colleges, 
    weeklyNotes, 
    visitLogs, 
    addRemark, 
    updateLmsStatus, 
    updateV5Status,
    setActiveView 
  } = useDatabase();

  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'colleges' | 'notes' | 'visits' | 'dues'>('all');
  const [selectedItem, setSelectedItem] = useState<{
    type: 'college' | 'note' | 'visit';
    id: string;
    data: any;
  } | null>(null);

  const [newRemarkText, setNewRemarkText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus search input on mount / when model becomes visible
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setQuery('');
      setSelectedItem(null);
    }
  }, [isOpen]);

  // Keyboard shortcut for closing Search Modal (Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Filter and search everything
  const searchResults = useMemo(() => {
    const q = query.toLowerCase().trim();

    // 1. Search Colleges / Prospects
    const matchedColleges = colleges.filter(c => {
      const matchName = c.name.toLowerCase().includes(q);
      const matchAddress = c.v5Address?.toLowerCase().includes(q) || false;
      const matchSchoolType = c.type.toLowerCase().includes(q);
      const matchLmsStatus = c.lmsStatus.toLowerCase().includes(q);
      const matchLibStatus = c.smartLibraryStatus.toLowerCase().includes(q);
      const matchRemarks = c.remarks.some(rem => rem.toLowerCase().includes(q));
      
      // Allow searching numeric values like "12000" revenue or student counts
      const matchStudent = c.studentCount.toString().includes(q);
      const matchRevenue = c.revenue.toString().includes(q);

      return matchName || matchAddress || matchSchoolType || matchLmsStatus || matchLibStatus || matchRemarks || matchStudent || matchRevenue;
    }).map(c => ({
      type: 'college' as const,
      id: c.id,
      title: c.name,
      subtitle: c.type === 'active' ? 'Active College' : 'Pipeline Prospect',
      meta: `${c.studentCount.toLocaleString('en-IN')} Students • ₹${c.revenue.toLocaleString('en-IN')}`,
      data: c
    }));

    // 2. Search Weekly Meeting Notes
    const matchedNotes = weeklyNotes.filter(n => {
      const matchContent = n.content.toLowerCase().includes(q);
      const matchCollegeName = n.collegeName?.toLowerCase().includes(q) || false;
      const matchType = n.type.toLowerCase().includes(q);
      const matchWeek = `week ${n.week}`.includes(q) || `w${n.week}`.includes(q);
      const matchYear = n.year.toString().includes(q);

      return matchContent || matchCollegeName || matchType || matchWeek || matchYear;
    }).map(n => ({
      type: 'note' as const,
      id: n.id,
      title: n.type === 'college' ? `Note: ${n.collegeName}` : 'Miscellaneous Operations Note',
      subtitle: `Year ${n.year}, Week ${n.week}`,
      meta: n.date,
      data: n
    }));

    // 3. Search Representative Logs
    const matchedVisits = visitLogs.filter(v => {
      const matchRep = v.representative.toLowerCase().includes(q);
      const matchCol = v.collegeName.toLowerCase().includes(q);
      const matchPurpose = v.purpose.toLowerCase().includes(q);
      const matchFeedback = v.feedback.toLowerCase().includes(q);
      const matchStatus = v.status.toLowerCase().includes(q);

      return matchRep || matchCol || matchPurpose || matchFeedback || matchStatus;
    }).map(v => ({
      type: 'visit' as const,
      id: v.id,
      title: v.representative,
      subtitle: `Visit @ ${v.collegeName}`,
      meta: `${v.date} • ${v.status}`,
      data: v
    }));

    // Grouping
    let all = [...matchedColleges, ...matchedNotes, ...matchedVisits];

    // Priority matching: if exact query matches start of title, boost priority
    if (q) {
      all.sort((a, b) => {
        const aStarts = a.title.toLowerCase().startsWith(q) ? 1 : 0;
        const bStarts = b.title.toLowerCase().startsWith(q) ? 1 : 0;
        return bStarts - aStarts;
      });
    }

    return {
      all,
      colleges: matchedColleges,
      notes: matchedNotes,
      visits: matchedVisits,
      dues: matchedColleges.filter(c => c.data.pendingPaymentAmount > 0)
    };
  }, [colleges, weeklyNotes, visitLogs, query]);

  // Handle automatic select of first result if nothing is selected or query changes
  const activeResults = useMemo(() => {
    switch (activeTab) {
      case 'colleges': return searchResults.colleges;
      case 'notes': return searchResults.notes;
      case 'visits': return searchResults.visits;
      case 'dues': return searchResults.dues;
      default: return searchResults.all;
    }
  }, [searchResults, activeTab]);

  useEffect(() => {
    if (activeResults.length > 0) {
      // Find currently selected in the active list
      const stillExists = activeResults.find(item => item.id === selectedItem?.id && item.type === selectedItem?.type);
      if (!stillExists) {
        setSelectedItem(activeResults[0]);
      } else {
        // Refresh reference with potentially updated data
        setSelectedItem(stillExists);
      }
    } else {
      setSelectedItem(null);
    }
  }, [activeResults, selectedItem?.id, selectedItem?.type]);

  const handleRemarkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRemarkText.trim() || !selectedItem || selectedItem.type !== 'college') return;
    
    addRemark(selectedItem.id, newRemarkText.trim());
    setNewRemarkText('');
  };

  const handleLmsToggle = (collegeId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Provided' ? 'Pending' : currentStatus === 'Pending' ? 'Not Provided' : 'Provided';
    updateLmsStatus(collegeId, { lmsStatus: nextStatus });
  };

  const handleV5ReceiptToggle = (collegeId: string, currentReceipt: string) => {
    const nextReceipt = currentReceipt === 'Done' ? 'Pending' : 'Done';
    updateV5Status(collegeId, { v5ReceiptConfirmed: nextReceipt });
  };

  const handleSmartLibraryToggle = (collegeId: string, currentStatus: 'Active' | 'Inactive') => {
    // We update via updateV5Status since Smart Library triggers could also be mapped on the college
    // Let's create an inline update in DatabaseContext directly on columns or write a quick general updater.
    // Looking at DatabaseContext, we have direct mutators. To modify smartLibraryStatus we can find and update.
    // Oh, since DatabaseContext's updateLmsStatus/updateV5Status updates college inline based on keys:
    // we can use any specific updater that maps keys, or since typescript lets us update on college,
    // let's look at updating properties. Let's check how smart library is saved. 
    // Right now, colleges is in the state so let's update it.
    // Wait, let's see how smart library is modified in SmartLibrary.tsx.
    // In SmartLibrary.tsx (lines 171), it toggles based on local updates or saveLibraryDetails.
    // Let's implement it carefully.
  };

  const inspectViewLink = (viewKey: string) => {
    setActiveView(viewKey);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
          
          {/* Ambient Backdrop Blur */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />

          {/* Search Workspace Window Frame */}
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative w-full max-w-5xl h-[85vh] bg-white rounded-2xl border border-blue-100 flex flex-col overflow-hidden shadow-2xl text-slate-800"
          >
            
            {/* Search Input Bar Header */}
            <div className="flex h-16 items-center px-5 border-b border-blue-50 bg-white flex-shrink-0">
              <Search className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
              
              <input
                ref={inputRef}
                type="text"
                placeholder="Type anything to search and fetch... (e.g. college name, V5 tracking, outstanding dues, representative...)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent border-none text-sm placeholder:text-slate-400 focus:outline-none focus:ring-0 text-slate-800 font-sans"
              />

              {query && (
                <button 
                  onClick={() => setQuery('')}
                  className="p-1 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-md transition-all mr-2"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              <div className="flex items-center gap-2 border-l border-blue-50 pl-4 ml-2">
                <span className="text-[10px] font-mono text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md select-none">
                  ESC to exit
                </span>
                <button 
                  onClick={onClose}
                  className="p-1 hover:bg-sky-50 rounded-lg text-slate-500 hover:text-slate-800 transition-colors border border-blue-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Keyword Suggesters */}
            <div className="bg-sky-50/20 px-5 py-2.5 border-b border-blue-50 flex items-center justify-between overflow-x-auto text-xs whitespace-nowrap gap-4 select-none scrollbar-none flex-shrink-0">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                <span className="text-[10px] font-mono font-semibold tracking-wider text-slate-400 uppercase">Quick Fetch Filters:</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { setQuery('Vellore'); setActiveTab('colleges'); }}
                  className="px-2.5 py-1 bg-white hover:bg-sky-50 border border-blue-105 rounded-full text-[11px] text-slate-600 transition-all font-sans font-medium"
                >
                  CMC Vellore
                </button>
                <button 
                  onClick={() => { setQuery('Pending'); setActiveTab('colleges'); }}
                  className="px-2.5 py-1 bg-white hover:bg-sky-50 border border-blue-105 rounded-full text-[11px] text-slate-600 transition-all font-sans font-medium"
                >
                  Pending LMS
                </button>
                <button 
                  onClick={() => { setQuery(''); setActiveTab('dues'); }}
                  className="px-2.5 py-1 bg-white hover:bg-sky-50 border border-blue-105 rounded-full text-[11px] text-slate-600 transition-all font-sans font-medium"
                >
                  Outstanding Dues 💸
                </button>
                <button 
                  onClick={() => { setQuery('Karan'); setActiveTab('visits'); }}
                  className="px-2.5 py-1 bg-white hover:bg-sky-50 border border-blue-105 rounded-full text-[11px] text-slate-600 transition-all font-sans font-medium"
                >
                  Rep: Karan
                </button>
                <button 
                  onClick={() => { setQuery('V5'); setActiveTab('colleges'); }}
                  className="px-2.5 py-1 bg-white hover:bg-sky-50 border border-blue-105 rounded-full text-[11px] text-slate-600 transition-all font-sans font-medium"
                >
                  V5 Book Modules
                </button>
              </div>
            </div>

            {/* Split layout: Results List (60%) vs Inspector Panel (40%) */}
            <div className="flex-1 flex min-h-0 bg-slate-50/20">
              
              {/* Left results column */}
              <div className="flex-1 flex flex-col min-w-0 border-r border-blue-50">
                
                {/* Visual Tabs bar */}
                <div className="flex bg-white px-5 border-b border-blue-50/60 overflow-x-auto flex-shrink-0 select-none">
                  {[
                    { id: 'all', label: 'All Results', count: searchResults.all.length },
                    { id: 'colleges', label: 'Institutions', count: searchResults.colleges.length },
                    { id: 'notes', label: 'Operational Notes', count: searchResults.notes.length },
                    { id: 'visits', label: 'Representative Visits', count: searchResults.visits.length },
                    { id: 'dues', label: 'With Outstanding Dues', count: searchResults.dues.length },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`relative py-3.5 px-3 text-[11px] font-mono uppercase tracking-widest font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                        activeTab === tab.id
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      {tab.label}
                      <span className="ml-1.5 px-1.5 py-0.5 bg-slate-100 text-[10px] rounded text-slate-500 font-bold font-sans">
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Scrollable list content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-slate-200">
                  {activeResults.length > 0 ? (
                    activeResults.map((item) => {
                      const isSelected = selectedItem?.id === item.id && selectedItem?.type === item.type;
                      
                      // Identify card styles
                      let categoryIcon = <Building2 className="w-4 h-4 text-slate-500" />;
                      let highlightText = '';
                      let badge = null;

                      if (item.type === 'college') {
                        categoryIcon = <Building2 className="w-4.5 h-4.5 text-blue-600" />;
                        highlightText = item.data.type === 'active' ? 'Active' : 'Pipeline Prospect';
                        badge = (
                          <span className={`px-2 py-0.5 rounded text-[8px] font-mono uppercase tracking-wider font-bold ${
                            item.data.type === 'active' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : 'bg-sky-50 text-blue-700 border border-blue-100'
                          }`}>
                            {item.data.type}
                          </span>
                        );
                      } else if (item.type === 'note') {
                        categoryIcon = <Calendar className="w-4.5 h-4.5 text-indigo-600" />;
                        highlightText = item.data.type === 'college' ? `${item.data.collegeName}` : 'Operational Corporate';
                        badge = (
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded text-[8px] font-mono uppercase tracking-widest font-bold">
                            Review Log
                          </span>
                        );
                      } else if (item.type === 'visit') {
                        categoryIcon = <MapPin className="w-4.5 h-4.5 text-rose-500" />;
                        highlightText = item.data.purpose;
                        badge = (
                          <span className={`px-2 py-0.5 rounded text-[8px] font-mono uppercase tracking-widest font-bold ${
                            item.data.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : 'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            Visit {item.data.status}
                          </span>
                        );
                      }

                      return (
                        <div
                          key={`${item.type}-${item.id}`}
                          onClick={() => setSelectedItem(item)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex gap-4 text-left shadow-2xs hover:shadow-xs group ${
                            isSelected 
                              ? 'bg-sky-50/60 border-blue-200' 
                              : 'bg-white border-blue-50/40 hover:border-blue-100'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0 transition-colors ${
                            isSelected ? 'bg-white border border-blue-100' : 'border border-blue-50/30'
                          }`}>
                            {categoryIcon}
                          </div>

                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div className="flex items-start justify-between gap-1">
                              <h4 className="text-xs font-semibold text-slate-800 tracking-tight truncate pr-2">
                                {item.title}
                              </h4>
                              {badge}
                            </div>
                            
                            <p className="text-[11px] text-slate-400 font-sans truncate mt-1 leading-normal">
                              {highlightText} <span className="mx-1.5">•</span> {item.meta}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-20 text-center flex flex-col items-center justify-center text-slate-400">
                      <Search className="w-10 h-10 text-slate-300 mb-3 animate-pulse" />
                      <span className="text-xs font-mono">No matching records found. Try another term.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right inspector detail column */}
              <div className="w-96 flex flex-col bg-slate-50/45 border-l border-blue-50/100">
                {selectedItem ? (
                  <div className="flex-1 flex flex-col min-h-0">
                    
                    {/* Inspector Title Header */}
                    <div className="p-5 border-b border-blue-50 bg-white flex-shrink-0">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400 block leading-none">
                        Interactive Fetch Deck
                      </span>
                      <h3 className="text-[14px] font-semibold text-slate-800 tracking-tight mt-1.5 leading-snug">
                        {selectedItem.title}
                      </h3>
                      <p className="text-[11px] font-sans text-slate-500 mt-1">
                        {selectedItem.subtitle}
                      </p>
                    </div>

                    {/* Scrollable details view */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin scrollbar-thumb-slate-200">
                      
                      {/* COLLEGE INSPECTOR DECK */}
                      {selectedItem.type === 'college' && (
                        <>
                          {/* Financials & Basic Info */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-white rounded-xl border border-blue-50 flex flex-col">
                              <span className="text-[8px] font-mono tracking-widest text-slate-400 uppercase">
                                Student Enrollment
                              </span>
                              <span className="text-sm font-bold text-slate-800 mt-1 font-sans">
                                {selectedItem.data.studentCount?.toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div className="p-3 bg-white rounded-xl border border-blue-50 flex flex-col">
                              <span className="text-[8px] font-mono tracking-widest text-slate-400 uppercase">
                                Total Deal Size
                              </span>
                              <span className="text-sm font-bold text-blue-600 mt-1 font-mono">
                                ₹{selectedItem.data.revenue?.toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>

                          {/* Quick Interactive Toggles */}
                          <div className="space-y-2.5 p-3.5 bg-white rounded-xl border border-blue-50">
                            <h4 className="text-[10px] font-mono tracking-widest uppercase text-slate-400 border-b border-blue-50/60 pb-1.5 mb-2 font-bold leading-none">
                              Live Operational States
                            </h4>
                            
                            {/* LMS Switch */}
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-600 font-sans font-medium">LMS Provided Status</span>
                              <button
                                onClick={() => handleLmsToggle(selectedItem.id, selectedItem.data.lmsStatus)}
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                                  selectedItem.data.lmsStatus === 'Provided'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : selectedItem.data.lmsStatus === 'Pending'
                                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                                      : 'bg-slate-100 text-slate-500 border-slate-200'
                                }`}
                              >
                                {selectedItem.data.lmsStatus}
                              </button>
                            </div>

                            {/* V5 Modules */}
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-600 font-sans font-medium">V5 Receipt Confirmed</span>
                              <button
                                onClick={() => handleV5ReceiptToggle(selectedItem.id, selectedItem.data.v5ReceiptConfirmed)}
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                                  selectedItem.data.v5ReceiptConfirmed === 'Done'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}
                              >
                                {selectedItem.data.v5ReceiptConfirmed}
                              </button>
                            </div>

                            {/* Smart Library */}
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-600 font-sans font-medium">Smart Library</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                                selectedItem.data.smartLibraryStatus === 'Active'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-slate-100 text-slate-500 border-slate-200'
                              }`}>
                                {selectedItem.data.smartLibraryStatus}
                              </span>
                            </div>
                          </div>

                          {/* Detail fields mapping */}
                          <div className="p-3.5 bg-white rounded-xl border border-blue-50 space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-slate-400 font-mono text-[9px]">OUTSTANDING DEBT:</span>
                              <span className={`font-semibold font-mono ${
                                selectedItem.data.pendingPaymentAmount > 0 ? 'text-amber-600' : 'text-slate-600'
                              }`}>
                                ₹{selectedItem.data.pendingPaymentAmount?.toLocaleString('en-IN') || 0}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400 font-mono text-[9px]">RENEWAL DUE DATE:</span>
                              <span className="font-semibold text-slate-700 font-mono">
                                {selectedItem.data.renewalDueDate || 'N/A'}
                              </span>
                            </div>
                            {selectedItem.data.v5Address && (
                              <div className="pt-2 border-t border-slate-100">
                                <span className="text-slate-400 font-mono text-[9px] block">DELIVERY DISPATCH ADDRESS:</span>
                                <span className="text-slate-600 mt-1 block leading-normal text-[11px]">
                                  {selectedItem.data.v5Address}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Remarks & Interactive adding box */}
                          <div className="space-y-3">
                            <h4 className="text-[10px] font-mono tracking-widest uppercase text-slate-400 font-bold leading-none">
                              Remarks Log ({selectedItem.data.remarks?.length || 0})
                            </h4>

                            <form onSubmit={handleRemarkSubmit} className="flex gap-1.5">
                              <input
                                type="text"
                                placeholder="Record quick comment..."
                                value={newRemarkText}
                                onChange={(e) => setNewRemarkText(e.target.value)}
                                className="flex-1 bg-white border border-blue-105 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800"
                              />
                              <button
                                type="submit"
                                className="px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer shadow-xs"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </form>

                            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                              {selectedItem.data.remarks && selectedItem.data.remarks.length > 0 ? (
                                selectedItem.data.remarks.map((rem: string, idx: number) => (
                                  <div key={idx} className="p-2.5 rounded-lg bg-white border border-blue-50/50 flex gap-2 text-xs text-slate-705 leading-normal">
                                    <MessageSquare className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                                    <span>{rem}</span>
                                  </div>
                                ))
                              ) : (
                                <span className="text-[10px] font-mono text-slate-400 block text-center py-2.5">No comments registered yet.</span>
                              )}
                            </div>
                          </div>

                          {/* Module Quick Nav Shortcuts */}
                          <div className="pt-2">
                            <span className="text-[9px] font-mono text-slate-400 block">JUMP TO SPECIFIC MODULES:</span>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <button 
                                onClick={() => inspectViewLink('dashboard')}
                                className="flex items-center justify-between p-2 bg-white hover:bg-sky-50 border border-blue-50 hover:border-blue-100 rounded-lg text-[11px] text-slate-600 font-medium transition-all text-left"
                              >
                                <span>Main Board</span>
                                <ArrowRight className="w-3 h-3 text-slate-400" />
                              </button>
                              <button 
                                onClick={() => inspectViewLink('lms')}
                                className="flex items-center justify-between p-2 bg-white hover:bg-sky-50 border border-blue-50 hover:border-blue-100 rounded-lg text-[11px] text-slate-600 font-medium transition-all text-left"
                              >
                                <span>LMS Module</span>
                                <ArrowRight className="w-3 h-3 text-slate-400" />
                              </button>
                              <button 
                                onClick={() => inspectViewLink('library')}
                                className="flex items-center justify-between p-2 bg-white hover:bg-sky-50 border border-blue-50 hover:border-blue-100 rounded-lg text-[11px] text-slate-600 font-medium transition-all text-left"
                              >
                                <span>Library Stat</span>
                                <ArrowRight className="w-3 h-3 text-slate-400" />
                              </button>
                              <button 
                                onClick={() => inspectViewLink('v5')}
                                className="flex items-center justify-between p-2 bg-white hover:bg-sky-50 border border-blue-50 hover:border-blue-100 rounded-lg text-[11px] text-slate-600 font-medium transition-all text-left"
                              >
                                <span>V5 Dispatch</span>
                                <ArrowRight className="w-3 h-3 text-slate-400" />
                              </button>
                            </div>
                          </div>
                        </>
                      )}

                      {/* OPERATIONAL WEEKLY NOTES INSPECTOR DECK */}
                      {selectedItem.type === 'note' && (
                        <div className="space-y-4">
                          <div className="p-4 bg-white rounded-xl border border-blue-50 space-y-3">
                            <div className="flex gap-2 items-center text-xs font-mono text-slate-400 leading-none">
                              <Clock className="w-3.5 h-3.5 text-indigo-500" />
                              <span>Logged: {selectedItem.data.date}</span>
                            </div>

                            <p className="text-xs text-slate-700 leading-relaxed font-sans mt-2 bg-sky-50/20 p-3 rounded-lg border border-blue-50/30 whitespace-pre-wrap">
                              {selectedItem.data.content}
                            </p>
                          </div>

                          <div className="p-3.5 bg-white rounded-xl border border-blue-50 text-xs text-slate-600 space-y-2 font-sans">
                            <div className="flex justify-between">
                              <span className="text-slate-400 font-mono text-[9px]">TYPE CATEGORY:</span>
                              <span className="font-semibold text-slate-800 uppercase font-mono">
                                {selectedItem.data.type} NOTE
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400 font-mono text-[9px]">SCHEDULING WEEK:</span>
                              <span className="font-semibold text-slate-800 font-mono">
                                Week {selectedItem.data.week}, Year {selectedItem.data.year}
                              </span>
                            </div>
                            {selectedItem.data.collegeName && (
                              <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                                <span className="text-slate-400 font-mono text-[9px]">LINKED COLLEGE:</span>
                                <span className="font-semibold text-blue-600 font-mono uppercase bg-sky-50/50 px-1.5 py-0.5 border border-blue-100 rounded text-[9px]">
                                  {selectedItem.data.collegeName}
                                </span>
                              </div>
                            )}
                          </div>

                          <button 
                            onClick={() => inspectViewLink('weekly')}
                            className="w-full flex items-center justify-between p-3 bg-white hover:bg-sky-50 border border-blue-105 rounded-xl text-xs text-blue-700 font-semibold transition-all shadow-3xs"
                          >
                            <span>Open Weekly review boards</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {/* VISIT LOGS INSPECTOR DECK */}
                      {selectedItem.type === 'visit' && (
                        <div className="space-y-4">
                          <div className="p-4 bg-white rounded-xl border border-blue-50 space-y-4">
                            <div>
                              <span className="text-[10px] font-mono text-slate-400 block tracking-widest uppercase">Visit Agenda / Purpose</span>
                              <span className="text-xs font-semibold text-slate-800 tracking-tight mt-1 block">
                                {selectedItem.data.purpose}
                              </span>
                            </div>

                            <div className="pt-3 border-t border-slate-50">
                              <span className="text-[10px] font-mono text-slate-400 block tracking-widest uppercase">Representative Feedback</span>
                              <p className="text-xs text-slate-605 mt-1.5 leading-relaxed bg-sky-50/20 p-3 rounded-lg border border-blue-50/20">
                                {selectedItem.data.feedback || "No feedback logged yet."}
                              </p>
                            </div>
                          </div>

                          <div className="p-3.5 bg-white rounded-xl border border-blue-50 text-xs text-slate-605 space-y-2">
                            <div className="flex justify-between">
                              <span className="text-slate-400 font-mono text-[9px]">REPRESENTATIVE:</span>
                              <span className="font-semibold text-slate-800">{selectedItem.data.representative}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400 font-mono text-[9px]">TARGET ACADEMY:</span>
                              <span className="font-semibold text-slate-800 text-right">{selectedItem.data.collegeName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400 font-mono text-[9px]">VISIT DATE:</span>
                              <span className="font-semibold text-slate-800 font-mono">{selectedItem.data.date}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400 font-mono text-[9px]">SCHEDULING STATUS:</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                                selectedItem.data.status === 'Completed'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                  : 'bg-amber-50 text-amber-700 border-amber-100'
                              }`}>
                                {selectedItem.data.status}
                              </span>
                            </div>
                          </div>

                          <button 
                            onClick={() => inspectViewLink('visits')}
                            className="w-full flex items-center justify-between p-3 bg-white hover:bg-sky-50 border border-blue-105 rounded-xl text-xs text-blue-700 font-semibold transition-all shadow-3xs"
                          >
                            <span>Open employee visits portal</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                    </div>

                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-slate-400 text-center select-none">
                    <Sparkles className="w-9 h-9 text-slate-300 mb-3 animate-bounce" />
                    <h5 className="text-xs font-semibold text-slate-650 tracking-tight">Interactive Inspector</h5>
                    <p className="text-[10px] font-mono text-slate-400 max-w-56 mt-2 leading-relaxed">
                      Select any record from the results stream to instantly inspect details, update state counters, and write comments.
                    </p>
                  </div>
                )}
              </div>

            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
