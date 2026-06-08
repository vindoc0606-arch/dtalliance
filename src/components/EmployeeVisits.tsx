/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useDatabase } from './DatabaseContext';
import { MapPin, User, Calendar, Plus, ChevronRight, CheckCircle, Clock, X } from 'lucide-react';

export const EmployeeVisits: React.FC = () => {
  const { visitLogs, addVisitLog, colleges } = useDatabase();
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [collegeName, setCollegeName] = useState('');
  const [rep, setRep] = useState('');
  const [date, setDate] = useState('2026-06-01');
  const [purpose, setPurpose] = useState('');
  const [feedback, setFeedback] = useState('');
  const [status, setStatus] = useState<'Completed' | 'Scheduled' | 'Cancelled'>('Completed');

  const activeCollegesOnly = colleges.filter(c => c.type === 'active' || c.type === 'won');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collegeName || !rep || !purpose) return;

    addVisitLog({
      collegeName,
      representative: rep,
      date,
      purpose,
      feedback,
      status
    });

    // Reset Form
    setCollegeName('');
    setRep('');
    setPurpose('');
    setFeedback('');
    setShowModal(false);
  };

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6 text-slate-800 bg-slate-50 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="font-sans font-bold text-2xl text-slate-800 tracking-tight">Executive Site Visits</h1>
          <p className="text-slate-500 text-xs mt-1">
            Log, classify, and track representative physical audits and on-premise onboarding visits.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-xs font-bold text-white rounded-lg transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Log Site Visit
        </button>
      </div>

      {/* Grid List of visits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {visitLogs.map((log) => (
          <div key={log.id} className="p-5 bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-xs transition-all flex flex-col justify-between text-slate-800">
            <div className="space-y-4">
              
              {/* College & status banner */}
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 flex-shrink-0 mt-0.5 border border-slate-100">
                    <MapPin className="w-4 h-4 text-orange-655" />
                  </div>
                  <div>
                    <h3 className="font-sans text-xs font-bold text-slate-800 leading-tight">
                      {log.collegeName}
                    </h3>
                    <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-wider leading-none">
                      PURPOSE: {log.purpose}
                    </p>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold leading-none select-none uppercase ${
                  log.status === 'Completed'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : log.status === 'Scheduled'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 animate-pulse'
                      : 'bg-slate-105 text-slate-500 border border-slate-200'
                }`}>
                  {log.status}
                </span>
              </div>

              {/* Feedback description text */}
              <p className="text-xs text-slate-600 leading-normal pl-[44px] font-sans italic">
                &ldquo;{log.feedback || 'Field report awaiting write-up.'}&rdquo;
              </p>

            </div>

            {/* Rep details and dates footer row */}
            <div className="mt-5 pt-3.5 border-t border-slate-100 flex justify-between items-center pl-[44px]">
              <div className="flex items-center gap-1.5 text-slate-500 font-sans text-xs">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-medium text-slate-700">{log.representative}</span>
              </div>

              <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[10px]">
                <Calendar className="w-3.5 h-3.5" />
                <span>{log.date}</span>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Log Visit Modal Overlay box */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 text-slate-800 shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex h-14 items-center justify-between px-5 bg-slate-50/70 border-b border-slate-100">
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-slate-800">
                Register Executive Field Log
              </span>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-650 rounded border border-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto text-slate-800">
              
              {/* Institution Select dropdown */}
              <div>
                <label className="text-[10px] font-mono tracking-widest uppercase text-slate-500 block mb-1">
                  Target Academy Campus *
                </label>
                <select
                  required
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-700 focus:outline-none focus:border-orange-550"
                >
                  <option value="">-- Choose institution --</option>
                  {colleges.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Representative and Schedule Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono tracking-widest uppercase text-slate-500 block mb-1">
                    Representative Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={rep}
                    onChange={(e) => setRep(e.target.value)}
                    placeholder="e.g. Nikhil Sathe"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono tracking-widest uppercase text-slate-500 block mb-1">
                    Visit Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Purpose and Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono tracking-widest uppercase text-slate-500 block mb-1">
                    Visit Mission / Purpose *
                  </label>
                  <input
                    type="text"
                    required
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="e.g. V5 distribution audit"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono tracking-widest uppercase text-slate-500 block mb-1">
                    Operational Status
                  </label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Completed">Completed</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Feedback description lines */}
              <div>
                <label className="text-[10px] font-mono tracking-widest uppercase text-slate-500 block mb-1">
                  Field Executive Notes / Feedback
                </label>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Minutes of conversation, dean satisfaction status, physical delivery confirmations..."
                  className="w-full bg-white border border-slate-300 rounded-lg p-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400"
                />
              </div>

              {/* Action feet */}
              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 text-xs font-semibold rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-xs text-white font-bold rounded cursor-pointer"
                >
                  Save Field Log
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
