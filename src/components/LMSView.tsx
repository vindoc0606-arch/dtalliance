/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useDatabase } from './DatabaseContext';
import { GraduationCap, Percent, Play, Award, Save } from 'lucide-react';

export const LMSView: React.FC = () => {
  const { colleges, updateLmsStatus } = useDatabase();
  const [editingColId, setEditingColId] = useState<string | null>(null);

  // Edit states
  const [lmsStatus, setLmsStatus] = useState<'Provided' | 'Not Provided' | 'Pending'>('Not Provided');
  const [progress, setProgress] = useState(0);
  const [hours, setHours] = useState(0);
  const [assessments, setAssessments] = useState(0);

  const activeColleges = useMemo(() => {
    return colleges.filter(c => c.type === 'active' || c.type === 'won');
  }, [colleges]);

  // Totals calculations
  const totalHours = useMemo(() => activeColleges.reduce((sum, c) => sum + (c.hoursWatched || 0), 0), [activeColleges]);
  const activeLmsCount = useMemo(() => activeColleges.filter(c => c.lmsStatus === 'Provided').length, [activeColleges]);

  const handleStartEdit = (col: any) => {
    setEditingColId(col.id);
    setLmsStatus(col.lmsStatus);
    setProgress(col.courseProgress);
    setHours(col.hoursWatched);
    setAssessments(col.assessmentsConducted);
  };

  const handleSave = (id: string) => {
    updateLmsStatus(id, {
      lmsStatus,
      courseProgress: Number(progress),
      hoursWatched: Number(hours),
      assessmentsConducted: Number(assessments)
    });
    setEditingColId(null);
  };

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6 text-slate-800 bg-slate-50 min-h-screen font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="font-sans font-bold text-2xl text-slate-800 tracking-tight">LMS At a Glance</h1>
          <p className="text-slate-500 text-xs mt-1">
            Overview of LMS performance metrics and deployment confirmations.
          </p>
        </div>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-orange-600/10 border border-orange-600/30 flex items-center justify-center text-orange-600">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block leading-none">Active LMS Servers</span>
            <span className="text-lg font-bold font-sans text-slate-800 mt-1.5 block">{activeLmsCount} / {activeColleges.length}</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-600/10 border border-amber-600/30 flex items-center justify-center text-amber-600">
            <Play className="w-4 h-4 text-orange-600" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block leading-none">Cumulative Hours Streamed</span>
            <span className="text-lg font-bold font-sans text-slate-800 mt-1.5 block">{totalHours.toLocaleString()} Hours</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-teal-600/10 border border-teal-600/30 flex items-center justify-center text-teal-600">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block leading-none">Assessments Taken</span>
            <span className="text-lg font-bold font-sans text-slate-800 mt-1.5 block font-sans">
              {activeColleges.reduce((sum, c) => sum + (c.assessmentsConducted || 0), 0)} Tests
            </span>
          </div>
        </div>
      </div>

      {/* Main LMS Records Grid */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
        <h2 className="text-xs font-mono font-bold tracking-wider uppercase text-slate-800 pb-3 border-b border-slate-100 mb-4">
          LMS Implementation Tracker
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-mono text-slate-500 uppercase tracking-widest bg-slate-50/75">
                <th className="py-3 px-3">Academy Name</th>
                <th className="py-3 px-3">Provision Link</th>
                <th className="py-3 px-3 text-center">Avg Progress</th>
                <th className="py-3 px-3 text-right">Hours Watched</th>
                <th className="py-3 px-3 text-right">Assessments</th>
                <th className="py-3 px-3 text-center">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {activeColleges.map((col) => {
                const isEditing = editingColId === col.id;
                return (
                  <tr key={col.id} className="hover:bg-slate-50/70 transition-colors">
                    
                    {/* Academy Name */}
                    <td className="py-3.5 px-3 font-semibold text-slate-805 max-w-xs truncate">
                      {col.name}
                    </td>

                    {/* Status Provisioning Choice */}
                    <td className="py-3.5 px-3">
                      {isEditing ? (
                        <select
                          value={lmsStatus}
                          onChange={(e: any) => setLmsStatus(e.target.value)}
                          className="bg-white border border-slate-350 rounded p-1 text-xs text-slate-800 focus:outline-none focus:border-orange-500"
                        >
                          <option value="Provided">Provided</option>
                          <option value="Not Provided">Not Provided</option>
                          <option value="Pending">Pending</option>
                        </select>
                      ) : (
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold leading-none ${
                          col.lmsStatus === 'Provided'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-250'
                            : col.lmsStatus === 'Pending'
                              ? 'bg-amber-50 text-amber-700 border border-amber-250 animate-pulse'
                              : 'bg-slate-105 text-slate-500 border border-slate-250/70'
                        }`}>
                          {col.lmsStatus}
                        </span>
                      )}
                    </td>

                    {/* Avg Progress Percentage */}
                    <td className="py-3.5 px-3">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5 justify-center">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={progress}
                            onChange={(e) => setProgress(Number(e.target.value))}
                            className="bg-white border border-slate-350 rounded p-1 text-xs text-slate-850 w-14 text-center focus:outline-none focus:border-orange-550"
                          />
                          <Percent className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2.5 justify-center max-w-[120px] mx-auto">
                          <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-orange-500 h-full rounded-full" 
                              style={{ width: `${col.courseProgress || 0}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] font-bold text-slate-600">{col.courseProgress || 0}%</span>
                        </div>
                      )}
                    </td>

                    {/* Cumulative Lecture Hours */}
                    <td className="py-3.5 px-3 text-right">
                      {isEditing ? (
                        <input
                          type="number"
                          min={0}
                          value={hours}
                          onChange={(e) => setHours(Number(e.target.value))}
                          className="bg-white border border-slate-350 rounded p-1 text-xs text-slate-850 w-20 text-right focus:outline-none focus:border-orange-550"
                        />
                      ) : (
                        <span className="font-mono font-medium text-slate-600">
                          {(col.hoursWatched || 0).toLocaleString()} hrs
                        </span>
                      )}
                    </td>

                    {/* Comprehensive tests */}
                    <td className="py-3.5 px-3 text-right">
                      {isEditing ? (
                        <input
                          type="number"
                          min={0}
                          value={assessments}
                          onChange={(e) => setAssessments(Number(e.target.value))}
                          className="bg-white border border-slate-350 rounded p-1 text-xs text-slate-850 w-16 text-right focus:outline-none"
                        />
                      ) : (
                        <span className="font-mono font-medium text-slate-600">
                          {col.assessmentsConducted || 0}
                        </span>
                      )}
                    </td>

                    {/* Action button triggers */}
                    <td className="py-3.5 px-3 text-center">
                      {isEditing ? (
                        <button
                          id={`btn-lms-save-${col.id}`}
                          onClick={() => handleSave(col.id)}
                          className="p-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded transition-colors cursor-pointer shadow-xs"
                          title="Save Updates"
                        >
                          <Save className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          id={`btn-lms-edit-${col.id}`}
                          onClick={() => handleStartEdit(col)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded text-[11px] font-sans font-bold text-slate-700 transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                      )}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
