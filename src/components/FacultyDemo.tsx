/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useDatabase } from './DatabaseContext';
import { Presentation, Edit2, CheckCircle, Calendar, Save } from 'lucide-react';

export const FacultyDemo: React.FC = () => {
  const { colleges, updateFacultyDemoStatus } = useDatabase();
  const [editingId, setEditingId] = useState<string | null>(null);

  // Edit states
  const [conducted, setConducted] = useState(0);
  const [conductedDate, setConductedDate] = useState('');
  const [aligned, setAligned] = useState(0);
  const [alignedDate, setAlignedDate] = useState('');

  const activeColleges = useMemo(() => {
    return colleges.filter(c => c.type === 'active' || c.type === 'won');
  }, [colleges]);

  const stats = useMemo(() => {
    return activeColleges.reduce((acc, c) => {
      acc.conductedTotal += c.facultyDemoConducted || 0;
      acc.alignedTotal += c.facultyDemoAligned || 0;
      if ((c.facultyDemoConducted || 0) > 0) acc.withDemosCount++;
      return acc;
    }, { conductedTotal: 0, alignedTotal: 0, withDemosCount: 0 });
  }, [activeColleges]);

  const handleStartEdit = (col: any) => {
    setEditingId(col.id);
    setConducted(col.facultyDemoConducted || 0);
    setConductedDate(col.facultyDemoConductedDate || 'N/A');
    setAligned(col.facultyDemoAligned || 0);
    setAlignedDate(col.facultyDemoAlignedDate || 'N/A');
  };

  const handleSave = (id: string) => {
    updateFacultyDemoStatus(id, {
      facultyDemoConducted: Number(conducted),
      facultyDemoConductedDate: conductedDate,
      facultyDemoAligned: Number(aligned),
      facultyDemoAlignedDate: alignedDate
    });
    setEditingId(null);
  };

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6 text-slate-800 bg-slate-50 min-h-screen font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="font-sans font-bold text-2xl text-slate-800 tracking-tight">Faculty Demo Status</h1>
          <p className="text-slate-500 text-xs mt-1">
            Overview of faculty demos that have been conducted and those that are aligned for the future.
          </p>
        </div>
      </div>

      {/* KPI Stats Block */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-orange-600/10 border border-orange-600/30 flex items-center justify-center text-orange-605">
            <Presentation className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block leading-none">Demos Conducted</span>
            <span className="text-lg font-bold font-sans text-slate-800 mt-1.5 block">{stats.conductedTotal} Sessions</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-600/30 flex items-center justify-center text-indigo-600">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block leading-none">Partner Academies</span>
            <span className="text-lg font-bold font-sans text-slate-800 mt-1.5 block">
              {stats.withDemosCount} / {activeColleges.length} Onboarded
            </span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-600/10 border border-amber-600/30 flex items-center justify-center text-amber-600">
            <Calendar className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block leading-none">Aligned / Future Demos</span>
            <span className="text-lg font-bold font-sans text-slate-800 mt-1.5 block">{stats.alignedTotal} Scheduled</span>
          </div>
        </div>
      </div>

      {/* Main Ledger card */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
        <h2 className="text-xs font-mono font-bold tracking-wider uppercase text-slate-800 pb-3 border-b border-slate-100 mb-4">
          Clinical Faculty Onboarding Ledger
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-mono text-slate-500 uppercase tracking-widest bg-slate-50/75">
                <th className="py-3 px-3">Academy Name</th>
                <th className="py-3 px-3 text-center">Conducted Demos</th>
                <th className="py-3 px-3 text-center">Conducted Date</th>
                <th className="py-3 px-3 text-center">Aligned (Pending) Demos</th>
                <th className="py-3 px-3 text-center">Aligned Date</th>
                <th className="py-3 px-3 text-center">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {activeColleges.map((col) => {
                const isEditing = editingId === col.id;
                return (
                  <tr key={col.id} className="hover:bg-slate-50/70 transition-colors">
                    
                    {/* Academy Name */}
                    <td className="py-3.5 px-3 font-semibold text-slate-800 max-w-xs truncate">
                      {col.name}
                    </td>
 
                    {/* Conducted Count */}
                    <td className="py-3.5 px-3 text-center">
                      {isEditing ? (
                        <input
                          type="number"
                          min={0}
                          value={conducted}
                          onChange={(e) => setConducted(Number(e.target.value))}
                          className="bg-white border border-slate-350 rounded p-1 text-xs text-slate-800 w-16 text-center font-mono focus:outline-none focus:border-orange-500"
                        />
                      ) : (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold leading-none ${
                          col.facultyDemoConducted > 0 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-250/50' 
                            : 'bg-slate-101 text-slate-500 border border-slate-200'
                        }`}>
                          {col.facultyDemoConducted > 0 ? `${col.facultyDemoConducted} sessions` : 'None'}
                        </span>
                      )}
                    </td>
 
                    {/* Conducted Date */}
                    <td className="py-3.5 px-3 text-center font-mono text-slate-600">
                      {isEditing ? (
                        <input
                          type="text"
                          value={conductedDate}
                          onChange={(e) => setConductedDate(e.target.value)}
                          placeholder="YYYY-MM-DD or N/A"
                          className="bg-white border border-slate-355 rounded p-1 text-xs text-slate-800 w-28 text-center focus:outline-none focus:border-orange-500"
                        />
                      ) : (
                        col.facultyDemoConductedDate || 'N/A'
                      )}
                    </td>
 
                    {/* Pending Aligned Demos */}
                    <td className="py-3.5 px-3 text-center font-mono text-slate-700">
                      {isEditing ? (
                        <input
                          type="number"
                          min={0}
                          value={aligned}
                          onChange={(e) => setAligned(Number(e.target.value))}
                          className="bg-white border border-slate-355 rounded p-1 text-xs text-slate-805 w-16 text-center focus:outline-none focus:border-orange-500"
                        />
                      ) : (
                        col.facultyDemoAligned > 0 ? (
                          <span className="text-amber-600 font-bold">+{col.facultyDemoAligned} aligned</span>
                        ) : 'None'
                      )}
                    </td>
 
                    {/* Aligned Schedule date */}
                    <td className="py-3.5 px-3 text-center font-mono text-slate-600">
                      {isEditing ? (
                        <input
                          type="text"
                          value={alignedDate}
                          onChange={(e) => setAlignedDate(e.target.value)}
                          placeholder="YYYY-MM-DD or N/A"
                          className="bg-white border border-slate-355 rounded p-1 text-xs text-slate-800 w-28 text-center focus:outline-none focus:border-orange-500"
                        />
                      ) : (
                        col.facultyDemoAlignedDate || 'N/A'
                      )}
                    </td>
 
                    {/* action triggers */}
                    <td className="py-3.5 px-3 text-center">
                      {isEditing ? (
                        <button
                          id={`btn-demo-save-${col.id}`}
                          onClick={() => handleSave(col.id)}
                          className="p-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded transition-colors cursor-pointer shadow-xs"
                        >
                          <Save className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          id={`btn-demo-edit-${col.id}`}
                          onClick={() => handleStartEdit(col)}
                          className="p-1 hover:bg-slate-100 hover:text-slate-800 text-slate-400 rounded transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
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
