/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useDatabase } from './DatabaseContext';
import { Calendar, Plus, ChevronDown, ChevronRight, FileText, Filter, MessageSquare, ArrowUpRight } from 'lucide-react';
import { WeeklyNote } from '../types';

export const WeeklyReview: React.FC = () => {
  const { 
    weeklyNotes, 
    colleges, 
    saveWeeklyNote, 
    seedMiscNotes 
  } = useDatabase();

  const [activeCollegeId, setActiveCollegeId] = useState('');
  const [meetingNoteText, setMeetingNoteText] = useState('');
  const [miscNoteText, setMiscNoteText] = useState('');
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedWeek, setSelectedWeek] = useState(16);
  
  const [filterType, setFilterType] = useState<'all' | 'college' | 'misc'>('all');
  const [expandedWeeks, setExpandedWeeks] = useState<Record<string, boolean>>({
    '2026-16': true,
    '2026-5': true
  });

  const activeCollegesOnly = useMemo(() => {
    return colleges.filter(c => c.type === 'active' || c.type === 'won');
  }, [colleges]);

  const handleSaveCollegeNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCollegeId || !meetingNoteText.trim()) return;

    const matchedCol = activeCollegesOnly.find(c => c.id === activeCollegeId);
    if (!matchedCol) return;

    saveWeeklyNote({
      type: 'college',
      collegeId: activeCollegeId,
      collegeName: matchedCol.name,
      content: meetingNoteText.trim(),
      year: Number(selectedYear),
      week: Number(selectedWeek)
    });

    setMeetingNoteText('');
  };

  const handleSaveMiscNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!miscNoteText.trim()) return;

    saveWeeklyNote({
      type: 'misc',
      content: miscNoteText.trim(),
      year: Number(selectedYear),
      week: Number(selectedWeek)
    });

    setMiscNoteText('');
  };

  // Filter notes
  const filteredNotes = useMemo(() => {
    if (filterType === 'all') return weeklyNotes;
    return weeklyNotes.filter(n => n.type === filterType);
  }, [weeklyNotes, filterType]);

  // Group by (Year - Week)
  const groupedWeeklyNotes = useMemo(() => {
    const groups: Record<string, { year: number; week: number; notes: WeeklyNote[] }> = {};
    
    filteredNotes.forEach(note => {
      const gKey = `${note.year || 2026}-${note.week || 5}`;
      if (!groups[gKey]) {
        groups[gKey] = {
          year: note.year || 2026,
          week: note.week || 5,
          notes: []
        };
      }
      groups[gKey].notes.push(note);
    });

    // Sort key groupings descending by year and week
    return Object.entries(groups).sort((a, b) => {
      const [yearA, weekA] = a[0].split('-').map(Number);
      const [yearB, weekB] = b[0].split('-').map(Number);
      if (yearA !== yearB) return yearB - yearA;
      return weekB - weekA;
    });
  }, [filteredNotes]);

  const toggleWeekExpand = (gKey: string) => {
    setExpandedWeeks(prev => ({
      ...prev,
      [gKey]: !prev[gKey]
    }));
  };

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6 text-slate-800 bg-sky-50/45 min-h-screen font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-blue-100/80 pb-5">
        <div>
          <h1 className="font-sans font-bold text-2xl text-slate-800 tracking-tight">Weekly Review Notes</h1>
          <p className="text-slate-500 text-xs mt-1">
            Capture, classify, and track field reports and management meeting minutes weekly.
          </p>
        </div>

        <button 
          id="btn-seed-misc-sidebar"
          onClick={seedMiscNotes}
          className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-sky-50 text-xs font-semibold text-slate-700 rounded-lg border border-blue-105 transition-all cursor-pointer shadow-2xs"
        >
          <ArrowUpRight className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
          Auto-Seed Operational Notes
        </button>
      </div>

      {/* Grid: 2 columns for note entries (College & Miscellaneous) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* College-specific note */}
        <div className="p-5 bg-white rounded-xl border border-blue-100 shadow-2xs flex flex-col justify-between text-slate-800">
          <form onSubmit={handleSaveCollegeNote} className="space-y-4">
            <span className="text-xs font-mono font-bold uppercase text-blue-600 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" /> Academic Board Meeting Note
            </span>

            {/* Selector */}
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">Select College *</label>
              <select
                required
                value={activeCollegeId}
                onChange={(e) => setActiveCollegeId(e.target.value)}
                className="w-full bg-white border border-blue-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">-- Choose active college --</option>
                {activeCollegesOnly.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Note contents */}
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">Minutes / Conversation Details *</label>
              <textarea
                required
                rows={3}
                value={meetingNoteText}
                onChange={(e) => setMeetingNoteText(e.target.value)}
                placeholder="Details of discussions with Dean, LMS sign-offs, deployment issues, student reviews..."
                className="w-full bg-white border border-blue-200 rounded-lg p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Year & Week select block */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">Reporting Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full bg-white border border-blue-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none"
                >
                  <option value={2026}>Year 2026</option>
                  <option value={2025}>Year 2025</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">Operational Week No.</label>
                <input
                  type="number"
                  min={1}
                  max={53}
                  required
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(Number(e.target.value))}
                  className="w-full bg-white border border-blue-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                id="btn-save-meeting-note"
                className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-xs font-bold text-white rounded-lg transition-all shadow-md shadow-blue-500/10 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Save College Note
              </button>
            </div>
          </form>
        </div>

        {/* Miscellaneous Non-College operational notes */}
        <div className="p-5 bg-white rounded-xl border border-blue-100 shadow-2xs flex flex-col justify-between text-slate-800">
          <form onSubmit={handleSaveMiscNote} className="space-y-4 h-full flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-mono font-bold uppercase text-sky-600 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-500" /> Misc Corporate/Admin Note
              </span>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">Administrative Report *</label>
                <textarea
                  required
                  rows={4}
                  value={miscNoteText}
                  onChange={(e) => setMiscNoteText(e.target.value)}
                  placeholder="Record corporate announcements, product roadmap adjustments, Southern regional updates, server maintenance schedules, etc."
                  className="w-full bg-white border border-blue-200 rounded-lg p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                id="btn-save-misc-note"
                className="flex items-center gap-1 px-4 py-2 bg-sky-50 hover:bg-sky-100/80 text-xs text-blue-705 border border-blue-105 font-bold rounded-lg transition-all shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Save Miscellaneous Note
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* Interactive Folder Structure List */}
      <div className="p-5 bg-white rounded-xl border border-blue-105 shadow-2xs text-slate-800">
        
        {/* Table header control bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-sky-100 mb-6">
          <div>
            <h2 className="text-xs font-mono font-bold tracking-wider uppercase text-slate-800">
              Registered Weekly Reviews Log
            </h2>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">Explore grouped activity records dynamically.</p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={filterType}
              onChange={(e: any) => setFilterType(e.target.value)}
              className="bg-sky-50 border border-blue-100 rounded-lg p-1.5 text-xs text-slate-700 focus:outline-none"
            >
              <option value="all">All Notes</option>
              <option value="college">College notes only</option>
              <option value="misc">Misc notes only</option>
            </select>
          </div>
        </div>

        {/* Grouped Accordions */}
        <div className="space-y-4">
          {groupedWeeklyNotes.map(([gKey, group]) => {
            const isExpanded = expandedWeeks[gKey] || false;
            return (
              <div key={gKey} className="border border-blue-100 rounded-lg bg-sky-50/20 overflow-hidden shadow-2xs">
                {/* Header Row */}
                <button
                  onClick={() => toggleWeekExpand(gKey)}
                  className="w-full flex justify-between items-center px-4 py-3 bg-white hover:bg-sky-50/40 transition-colors text-left cursor-pointer border-b border-sky-100/60"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    )}
                    <span className="font-sans font-bold text-xs text-slate-800">
                      Year {group.year}, Week {group.week}
                    </span>
                    <span className="px-2 py-0.5 bg-sky-50 text-[9px] font-mono font-semibold text-blue-700 rounded-full border border-blue-100 leading-none">
                      {group.notes.length} {group.notes.length === 1 ? 'note' : 'notes'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest hidden sm:block">WEEK RECORD</span>
                </button>

                {/* Expanding body */}
                {isExpanded && (
                  <div className="p-4 divide-y divide-blue-50 max-h-96 overflow-y-auto bg-white/70">
                    {group.notes.map((note) => (
                      <div key={note.id} className="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 first:pt-0 last:pb-0">
                        <div className="max-w-[80%] pr-3">
                          <p className="text-xs text-slate-700 leading-normal font-sans">
                            {note.content}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            {note.type === 'college' ? (
                              <span className="text-[9px] font-mono bg-sky-50 text-blue-700 border border-blue-100 px-1.5 py-0.5 rounded">
                                COLLEGE: {note.collegeName}
                              </span>
                            ) : (
                              <span className="text-[9px] font-mono bg-sky-50 text-sky-800 border border-sky-200 px-1.5 py-0.5 rounded">
                                MISC OPERATIONS
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Note Date and Log indicators */}
                        <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[10px] uppercase flex-shrink-0">
                          <MessageSquare className="w-3 h-3 text-slate-400" />
                          <span>Logged {note.date || '2026-06-01'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {groupedWeeklyNotes.length === 0 && (
            <div className="py-12 text-center text-slate-550 italic font-mono text-xs">
              No matching weekly review logs found.
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
