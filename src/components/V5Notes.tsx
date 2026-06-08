/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useDatabase } from './DatabaseContext';
import { FileSpreadsheet, Edit3, CheckCircle2, AlertCircle, Save } from 'lucide-react';

export const V5Notes: React.FC = () => {
  const { colleges, updateV5Status } = useDatabase();
  const [editingId, setEditingId] = useState<string | null>(null);

  // Edit states
  const [v5Status, setV5Status] = useState<'Provided' | 'Not Provided'>('Not Provided');
  const [v5Address, setV5Address] = useState('');
  const [v5Date, setV5Date] = useState('');
  const [v5Receipt, setV5Receipt] = useState<'Pending' | 'Done'>('Pending');

  const activeColleges = useMemo(() => {
    return colleges.filter(c => c.type === 'active' || c.type === 'won');
  }, [colleges]);

  const providedCount = useMemo(() => {
    return activeColleges.filter(c => c.v5Status === 'Provided').length;
  }, [activeColleges]);

  const handleStartEdit = (col: any) => {
    setEditingId(col.id);
    setV5Status(col.v5Status || 'Not Provided');
    setV5Address(col.v5Address || 'N/A');
    setV5Date(col.v5Date || 'N/A');
    setV5Receipt(col.v5ReceiptConfirmed || 'Pending');
  };

  const handleSave = (id: string) => {
    updateV5Status(id, {
      v5Status,
      v5Address,
      v5Date,
      v5ReceiptConfirmed: v5Receipt
    });
    setEditingId(null);
  };

  const toggleReceiptConfirmed = (id: string, current: string) => {
    const nextReceipt = current === 'Done' ? 'Pending' : 'Done';
    updateV5Status(id, {
      v5ReceiptConfirmed: nextReceipt
    });
  };

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6 text-slate-800 bg-slate-50 min-h-screen font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="font-sans font-bold text-2xl text-slate-800 tracking-tight">V5 Notes Dispatch Status</h1>
          <p className="text-slate-500 text-xs mt-1">
            Overview of physical V5 medical education modules dispatch and confirmation receipts.
          </p>
        </div>
      </div>

      {/* Aggregate indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-orange-600/10 border border-orange-600/30 flex items-center justify-center text-orange-600">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block leading-none">Modules Dispatched</span>
            <span className="text-lg font-bold font-sans text-slate-800 mt-1.5 block">
              {providedCount} {providedCount === 1 ? 'Institution' : 'Institutions'}
            </span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/10 border border-emerald-600/30 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block leading-none">Receipts Confirmed</span>
            <span className="text-lg font-bold font-sans text-slate-800 mt-1.5 block font-sans">
              {activeColleges.filter(c => c.v5ReceiptConfirmed === 'Done').length} Received list
            </span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-600/10 border border-rose-600/30 flex items-center justify-center text-rose-650">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block leading-none">Awaiting Receipts</span>
            <span className="text-lg font-bold font-sans text-slate-800 mt-1.5 block text-rose-600">
              {activeColleges.filter(c => c.v5Status === 'Provided' && c.v5ReceiptConfirmed === 'Pending').length} Pending
            </span>
          </div>
        </div>
      </div>

      {/* Dispatch Tracker Table card */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
        <h2 className="text-xs font-mono font-bold tracking-wider uppercase text-slate-850 pb-3 border-b border-slate-100 mb-4">
          Core Dispatch Consignment Ledger
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-mono text-slate-500 uppercase tracking-widest bg-slate-50/75">
                <th className="py-3 px-3">College Name</th>
                <th className="py-3 px-3 text-center">Modules Status</th>
                <th className="py-3 px-3">Dispatch Destination Address</th>
                <th className="py-3 px-3 text-center">Dispatch Date</th>
                <th className="py-3 px-3 text-center">Receipt Confirmation</th>
                <th className="py-3 px-3 text-center">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {activeColleges.map((col) => {
                const isEditing = editingId === col.id;
                return (
                  <tr key={col.id} className="hover:bg-slate-50/70 transition-colors">
                    
                    {/* name */}
                    <td className="py-3.5 px-3 font-semibold text-slate-800 max-w-xs truncate">
                      {col.name}
                    </td>

                    {/* provision status */}
                    <td className="py-3.5 px-3 text-center">
                      {isEditing ? (
                        <select
                          value={v5Status}
                          onChange={(e: any) => setV5Status(e.target.value)}
                          className="bg-white border border-slate-350 rounded p-1 text-xs text-slate-800 focus:outline-none focus:border-orange-500"
                        >
                          <option value="Provided">Provided</option>
                          <option value="Not Provided">Not Provided</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold leading-none ${
                          col.v5Status === 'Provided'
                            ? 'bg-orange-50 text-orange-700 border border-orange-250'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}>
                          {col.v5Status}
                        </span>
                      )}
                    </td>

                    {/* physical address */}
                    <td className="py-3.5 px-3 max-w-xs truncate">
                      {isEditing ? (
                        <input
                          type="text"
                          value={v5Address}
                          onChange={(e) => setV5Address(e.target.value)}
                          className="bg-white border border-slate-350 rounded p-1 text-xs text-slate-800 w-full font-sans focus:outline-none focus:border-orange-500"
                        />
                      ) : (
                        <span className="text-slate-650">{col.v5Address || 'N/A'}</span>
                      )}
                    </td>

                    {/* dispatch date */}
                    <td className="py-3.5 px-3 text-center font-mono text-slate-600">
                      {isEditing ? (
                        <input
                          type="text"
                          value={v5Date}
                          onChange={(e) => setV5Date(e.target.value)}
                          placeholder="YYYY-MM-DD or N/A"
                          className="bg-white border border-slate-355 rounded p-1 text-xs text-slate-800 w-28 text-center focus:outline-none focus:border-orange-500"
                        />
                      ) : (
                        col.v5Date || 'N/A'
                      )}
                    </td>

                    {/* receipt status click toggle */}
                    <td className="py-3.5 px-3 text-center">
                      {isEditing ? (
                        <select
                          value={v5Receipt}
                          onChange={(e: any) => setV5Receipt(e.target.value)}
                          className="bg-white border border-slate-355 rounded p-1 text-xs text-slate-805"
                        >
                          <option value="Done">Done</option>
                          <option value="Pending">Pending</option>
                        </select>
                      ) : (
                        <button
                          id={`btn-v5-confirm-${col.id}`}
                          onClick={() => toggleReceiptConfirmed(col.id, col.v5ReceiptConfirmed)}
                          className="focus:outline-none cursor-pointer"
                        >
                          {col.v5ReceiptConfirmed === 'Done' ? (
                            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-250">
                              CONFIRMED DONE
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-50 text-amber-705 border border-amber-250 animate-pulse">
                              AWAITING PENDING
                            </span>
                          )}
                        </button>
                      )}
                    </td>

                    {/* edit triggers */}
                    <td className="py-3.5 px-3 text-center">
                      {isEditing ? (
                        <button
                          id={`btn-v5-save-${col.id}`}
                          onClick={() => handleSave(col.id)}
                          className="p-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded transition-colors cursor-pointer shadow-xs"
                        >
                          <Save className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          id={`btn-v5-edit-${col.id}`}
                          onClick={() => handleStartEdit(col)}
                          className="p-1 hover:bg-slate-100 hover:text-slate-800 text-slate-400 rounded transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
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
