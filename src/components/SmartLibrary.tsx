/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useDatabase } from './DatabaseContext';
import { Library, BookOpen, UserCheck, ToggleLeft, ToggleRight, Save } from 'lucide-react';

export const SmartLibrary: React.FC = () => {
  const { colleges, updateLmsStatus } = useDatabase();
  const [editingId, setEditingId] = useState<string | null>(null);

  // Edit states
  const [libraryStatus, setLibraryStatus] = useState<'Active' | 'Inactive'>('Inactive');
  const [ebooks, setEbooks] = useState(0);
  const [physical, setPhysical] = useState(0);
  const [readers, setReaders] = useState(0);

  const activeColleges = useMemo(() => {
    return colleges.filter(c => c.type === 'active' || c.type === 'won');
  }, [colleges]);

  // Aggregate totals
  const aggregates = useMemo(() => {
    return activeColleges.reduce((acc, c) => {
      acc.ebooks += c.eBooksAccessed || 0;
      acc.physical += c.physicalCheckouts || 0;
      acc.readers += c.activeReaders || 0;
      if (c.smartLibraryStatus === 'Active') acc.activeCount++;
      return acc;
    }, { ebooks: 0, physical: 0, readers: 0, activeCount: 0 });
  }, [activeColleges]);

  const handleStartEdit = (col: any) => {
    setEditingId(col.id);
    setLibraryStatus(col.smartLibraryStatus || 'Inactive');
    setEbooks(col.eBooksAccessed || 0);
    setPhysical(col.physicalCheckouts || 0);
    setReaders(col.activeReaders || 0);
  };

  const handleSave = (id: string) => {
    // We can cast the update using updateLmsStatus or update state values through context extension.
    // Let's use updateLmsStatus as a proxy or update appropriate fields
    updateLmsStatus(id, {
      smartLibraryStatus: libraryStatus,
      eBooksAccessed: Number(ebooks),
      physicalCheckouts: Number(physical),
      activeReaders: Number(readers)
    } as any);
    
    setEditingId(null);
  };

  const toggleStatusDirect = (id: string, current: string) => {
    const nextStatus = current === 'Active' ? 'Inactive' : 'Active';
    updateLmsStatus(id, {
      smartLibraryStatus: nextStatus
    } as any);
  };

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6 text-slate-800 bg-sky-50/45 min-h-screen font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-blue-100/80 pb-5">
        <div>
          <h1 className="font-sans font-bold text-2xl text-slate-800 tracking-tight">Smart Library At a Glance</h1>
          <p className="text-slate-500 text-xs mt-1">
            Track eBook analytics and physical study guide checkouts across connected institutions.
          </p>
        </div>
      </div>

      {/* Aggregate Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        <div className="p-4 bg-white rounded-xl border border-blue-100 shadow-2xs hover:shadow-xs transition-shadow flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-600/30 flex items-center justify-center text-blue-600 animate-pulse">
            <Library className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block leading-none">Configured Libraries</span>
            <span className="text-lg font-bold font-sans text-blue-600 mt-1.5 block">
              {aggregates.activeCount} / {activeColleges.length}
            </span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-blue-100 shadow-2xs hover:shadow-xs transition-shadow flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-600/30 flex items-center justify-center text-indigo-600">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block leading-none">eBooks Read</span>
            <span className="text-lg font-bold font-sans text-slate-800 mt-1.5 block">
              {aggregates.ebooks.toLocaleString()} Leaves
            </span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-blue-100 shadow-2xs hover:shadow-xs transition-shadow flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-sky-600/10 border border-sky-600/30 flex items-center justify-center text-sky-600">
            <BookOpen className="w-4 h-4 text-sky-600" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block leading-none">Journal Handouts</span>
            <span className="text-lg font-bold font-sans text-slate-800 mt-1.5 block">
              {aggregates.physical.toLocaleString()} Guides
            </span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-blue-100 shadow-2xs hover:shadow-xs transition-shadow flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-teal-600/10 border border-teal-600/30 flex items-center justify-center text-teal-600">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block leading-none">Monthly Readers</span>
            <span className="text-lg font-bold font-sans text-slate-800 mt-1.5 block font-sans">
              {aggregates.readers.toLocaleString()} Students
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Library states */}
      <div className="p-5 bg-white rounded-xl border border-blue-100 shadow-2xs hover:shadow-xs transition-shadow">
        <h2 className="text-xs font-mono font-bold tracking-wider uppercase text-slate-800 pb-3 border-b border-sky-100 mb-4 font-sans">
          Interactive Library Deployments
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-blue-100 text-[10px] font-mono text-slate-500 uppercase tracking-widest bg-sky-50/40">
                <th className="py-3 px-3">Academy Name</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">eBooks Accessed</th>
                <th className="py-3 px-3 text-right">Physical Checkouts</th>
                <th className="py-3 px-3 text-right">Active Readers</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50 font-sans">
              {activeColleges.map((col) => {
                const isEditing = editingId === col.id;
                const isLibActive = col.smartLibraryStatus === 'Active';
                return (
                  <tr key={col.id} className="hover:bg-sky-50/20 transition-colors">
                    
                    {/* name */}
                    <td className="py-3.5 px-3 font-semibold text-slate-800 max-w-xs truncate">
                      {col.name}
                    </td>

                    {/* status */}
                    <td className="py-3.5 px-3 text-center">
                      {isEditing ? (
                        <select
                          value={libraryStatus}
                          onChange={(e: any) => setLibraryStatus(e.target.value)}
                          className="bg-white border border-blue-200 rounded p-1 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      ) : (
                        <button
                          id={`btn-toggle-library-${col.id}`}
                          onClick={() => toggleStatusDirect(col.id, col.smartLibraryStatus || 'Inactive')}
                          className="inline-flex items-center gap-1.5 focus:outline-none cursor-pointer"
                        >
                          {isLibActive ? (
                            <span className="flex items-center gap-1 text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full shadow-3xs hover:bg-emerald-100/70 transition-all">
                              <ToggleRight className="w-4 h-4 text-emerald-600" /> ACTIVE
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] font-mono font-medium bg-slate-100 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full hover:bg-slate-150 transition-all">
                              <ToggleLeft className="w-4 h-4 text-slate-400" /> INACTIVE
                            </span>
                          )}
                        </button>
                      )}
                    </td>

                    {/* ebooks */}
                    <td className="py-3.5 px-3 text-right">
                      {isEditing ? (
                        <input
                          type="number"
                          min={0}
                          value={ebooks}
                          onChange={(e) => setEbooks(Number(e.target.value))}
                          className="bg-white border border-blue-200 rounded p-1 text-xs text-slate-850 w-20 text-right font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      ) : (
                        <span className="font-mono text-slate-600">
                          {(col.eBooksAccessed || 0).toLocaleString()}
                        </span>
                      )}
                    </td>

                    {/* physical checkouts */}
                    <td className="py-3.5 px-3 text-right">
                      {isEditing ? (
                        <input
                          type="number"
                          min={0}
                          value={physical}
                          onChange={(e) => setPhysical(Number(e.target.value))}
                          className="bg-white border border-blue-200 rounded p-1 text-xs text-slate-850 w-20 text-right font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      ) : (
                        <span className="font-mono text-slate-600">
                          {(col.physicalCheckouts || 0).toLocaleString()}
                        </span>
                      )}
                    </td>

                    {/* Monthly readers active */}
                    <td className="py-3.5 px-3 text-right">
                      {isEditing ? (
                        <input
                          type="number"
                          min={0}
                          value={readers}
                          onChange={(e) => setReaders(Number(e.target.value))}
                          className="bg-white border border-blue-200 rounded p-1 text-xs text-slate-850 w-16 text-right font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-505"
                        />
                      ) : (
                        <span className="font-mono text-slate-600">
                          {(col.activeReaders || 0).toLocaleString()}
                        </span>
                      )}
                    </td>

                    {/* Inline actions */}
                    <td className="py-3.5 px-3 text-center">
                      {isEditing ? (
                        <button
                          id={`btn-lib-save-${col.id}`}
                          onClick={() => handleSave(col.id)}
                          className="p-1 link bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white rounded transition-colors cursor-pointer shadow-sm"
                          title="Save Library Details"
                        >
                          <Save className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          id={`btn-lib-edit-${col.id}`}
                          onClick={() => handleStartEdit(col)}
                          className="px-2.5 py-1 bg-white hover:bg-sky-50 border border-blue-105 rounded text-[11px] font-sans font-semibold text-blue-700 transition-colors cursor-pointer shadow-3xs"
                        >
                          Modify
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
