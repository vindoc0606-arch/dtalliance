/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useDatabase } from './DatabaseContext';
import { Plus, Trash2, CheckCircle2, MessageSquare, Sparkles } from 'lucide-react';

export const PipelineView: React.FC = () => {
  const { colleges, addCollege, deleteCollege, markAsWon, addRemark } = useDatabase();
  const [showAddForm, setShowAddForm] = useState(false);
  const [remarkInput, setRemarkInput] = useState<Record<string, string>>({});

  // Form State
  const [name, setName] = useState('');
  const [students, setStudents] = useState(400);
  const [revenue, setRevenue] = useState(4500000);
  const [renewalDate, setRenewalDate] = useState('2026-12-01');

  const pipelineColleges = useMemo(() => {
    return colleges.filter(c => c.type === 'pipeline');
  }, [colleges]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addCollege({
      name: name.trim(),
      type: 'pipeline',
      studentCount: Number(students),
      revenue: Number(revenue),
      renewalDueDate: renewalDate,
      isLapsed: false,
      lmsStatus: 'Pending',
      courseProgress: 0,
      assessmentsConducted: 0,
      hoursWatched: 0,
      smartLibraryStatus: 'Inactive',
      eBooksAccessed: 0,
      physicalCheckouts: 0,
      activeReaders: 0,
      v5Status: 'Not Provided',
      v5Address: 'N/A',
      v5Date: 'N/A',
      v5ReceiptConfirmed: 'Pending',
      facultyDemoConducted: 0,
      facultyDemoConductedDate: 'N/A',
      facultyDemoAligned: 0,
      facultyDemoAlignedDate: 'N/A',
      pendingPaymentAmount: 0,
      pendingPaymentDueDate: 'N/A'
    });

    setName('');
    setShowAddForm(false);
  };

  const handleRemarkSave = (id: string) => {
    const text = remarkInput[id] || '';
    if (!text.trim()) return;

    addRemark(id, text);
    setRemarkInput(prev => ({ ...prev, [id]: '' }));
  };

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6 text-slate-800 bg-sky-50/45 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-blue-100/80 pb-5">
        <div>
          <h1 className="font-sans font-bold text-2xl text-slate-800 tracking-tight">Pipeline</h1>
          <p className="text-slate-500 text-xs mt-1">
            Tracking {pipelineColleges.length} prospective colleges for agreement closure.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-xs font-bold text-white rounded-lg transition-all shadow-md shadow-blue-500/10 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          {showAddForm ? 'Hide Form' : 'Add Prospect'}
        </button>
      </div>

      {/* Add Prospect Inline Form */}
      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="p-5 bg-white rounded-xl border border-blue-100 shadow-2xs space-y-4 max-w-2xl text-slate-800">
          <span className="text-xs font-mono font-bold uppercase text-blue-600">Add Prospective Institution</span>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">College Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Christian Medical College, Ludhiana"
                className="w-full bg-white border border-blue-200 rounded-lg p-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">Expected Renewal / Target Date</label>
              <input
                type="date"
                required
                value={renewalDate}
                onChange={(e) => setRenewalDate(e.target.value)}
                className="w-full bg-white border border-blue-200 rounded-lg p-2 text-xs text-slate-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">Estimated Students</label>
              <input
                type="number"
                min={1}
                required
                value={students}
                onChange={(e) => setStudents(Number(e.target.value))}
                className="w-full bg-white border border-blue-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-600 block mb-1">Estimated Deal Value (INR)</label>
              <input
                type="number"
                min={0}
                required
                value={revenue}
                onChange={(e) => setRevenue(Number(e.target.value))}
                className="w-full bg-white border border-blue-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
               type="button"
               onClick={() => setShowAddForm(false)}
               className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs text-slate-600 rounded border border-slate-200 font-semibold cursor-pointer animate-fade-in"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-xs text-white rounded font-bold transition-all cursor-pointer"
            >
              Add to Pipeline
            </button>
          </div>
        </form>
      )}

      {/* Grid of Prospects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pipelineColleges.map((col) => (
          <div key={col.id} className="p-5 bg-white rounded-xl border border-blue-100 flex flex-col justify-between hover:border-blue-200 transition-all shadow-2xs hover:shadow-xs text-slate-800">
            
            <div>
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-sans text-sm font-bold text-slate-800 max-w-[80%] leading-tight">
                  {col.name}
                </h3>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-sky-50 text-blue-700 border border-blue-150 uppercase animate-pulse">
                  pipeline
                </span>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-2 mt-4 p-2.5 bg-sky-50/40 rounded-lg border border-blue-50/60 text-[11px] font-mono text-slate-500">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">ESTIMATED STUDENTS</span>
                  <span className="text-slate-755 font-semibold">{col.studentCount.toLocaleString('en-IN')} Students</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">PROJECTED DEAL SIZE</span>
                  <span className="text-blue-600 font-bold">₹{col.revenue.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Remarks History */}
              <div className="mt-4 space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block font-bold">
                  Pipeline Remarks
                </span>
                
                <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                  {col.remarks && col.remarks.map((rem, i) => (
                    <div key={i} className="flex gap-2 text-xs text-slate-700 bg-sky-50/20 p-2 rounded border border-blue-50/50">
                      <MessageSquare className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <p className="leading-normal">{rem}</p>
                    </div>
                  ))}

                  {(!col.remarks || col.remarks.length === 0) && (
                    <span className="text-[11px] font-sans text-slate-400 block italic leading-none pl-1">
                      No historical remarks linked yet.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Inputs & Actions Bottom */}
            <div className="mt-5 pt-4 border-t border-sky-100 space-y-3">
              {/* Textarea */}
              <div className="flex gap-2">
                <textarea
                  id={`remark-text-${col.id}`}
                  rows={1}
                  placeholder="Add a new remark..."
                  value={remarkInput[col.id] || ''}
                  onChange={(e) => setRemarkInput(prev => ({ ...prev, [col.id]: e.target.value }))}
                  className="flex-1 bg-white border border-blue-105 rounded-lg p-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                
                <button
                  id={`btn-save-remark-${col.id}`}
                  onClick={() => handleRemarkSave(col.id)}
                  className="px-3 bg-sky-50 hover:bg-sky-100 border border-blue-100 rounded-lg text-xs text-blue-700 font-bold tracking-wide transition-colors cursor-pointer"
                >
                  Save
                </button>
              </div>

              {/* Main Actions row */}
              <div className="flex gap-2 justify-between items-center">
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete ${col.name}?`)) {
                      deleteCollege(col.id);
                    }
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 hover:bg-rose-50 font-semibold text-rose-600 hover:text-rose-700 hover:border-rose-200 border border-transparent rounded-lg text-xs transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>

                <button
                  id={`btn-won-${col.id}`}
                  onClick={() => markAsWon(col.id)}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 font-bold text-white rounded-lg text-xs transition-transform hover:scale-[1.02] cursor-pointer shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Mark as Won
                </button>
              </div>
            </div>

          </div>
        ))}

        {pipelineColleges.length === 0 && (
          <div className="col-span-2 py-16 bg-white rounded-xl border border-blue-100 text-center flex flex-col items-center justify-center text-slate-400 shadow-2xs">
            <Sparkles className="w-8 h-8 text-blue-500/65 mb-2 animate-bounce" />
            <span className="text-xs font-mono">No Prospective Pipeline Deals Registered</span>
          </div>
        )}
      </div>

    </div>
  );
};
