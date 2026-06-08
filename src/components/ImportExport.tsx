/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useDatabase } from './DatabaseContext';
import { RefreshCw, Clipboard, Database, AlertCircle, CheckCircle } from 'lucide-react';

export const ImportExport: React.FC = () => {
  const { colleges, weeklyNotes, visitLogs } = useDatabase();
  const [importPayload, setImportPayload] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const currentPayload = {
    colleges,
    weeklyNotes,
    visitLogs,
    version: '1.2.0',
    exportedAt: new Date().toISOString()
  };

  const strPayload = JSON.stringify(currentPayload, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(strPayload);
    setSuccessMsg('State copied to clipboard successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importPayload.trim()) return;

    try {
      const parsed = JSON.parse(importPayload);
      if (!parsed.colleges || !parsed.weeklyNotes || !parsed.visitLogs) {
        throw new Error('Invalid schema. Colleges, weeklyNotes, and visitLogs are required.');
      }

      localStorage.setItem('dt-alliance:colleges-v1', JSON.stringify(parsed.colleges));
      localStorage.setItem('dt-alliance:notes-v1', JSON.stringify(parsed.weeklyNotes));
      localStorage.setItem('dt-alliance:visits-v1', JSON.stringify(parsed.visitLogs));

      setSuccessMsg('Backup restored successfully! Refreshing browser...');
      setErrorMsg('');
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Invalid JSON string representation.');
      setSuccessMsg('');
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6 text-slate-800 bg-slate-50 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="font-sans font-bold text-2xl text-slate-800 tracking-tight">Database Backup & Recovery</h1>
          <p className="text-slate-500 text-xs mt-1">
            Export stringified JSON state backups or restore legacy databases seamlessly.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Export Card */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 flex flex-col space-y-4 shadow-xs text-slate-800">
          <span className="text-xs font-mono font-bold uppercase text-orange-600 flex items-center gap-1.5">
            <Clipboard className="w-4 h-4" /> Export State Backup
          </span>

          <p className="text-xs text-slate-500 leading-normal">
            Below is the complete, live system payload representing all active colleges, pipeline deals, weekly minutes, and representatives site visits logs. Copy and save this payload to a secure environment for offline archive purposes.
          </p>

          <div className="flex-1 flex flex-col">
            <textarea
              readOnly
              value={strPayload}
              rows={12}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-[10px] font-mono text-slate-600 focus:outline-none resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Copy Backup Payload
            </button>
          </div>
        </div>

        {/* Import Card */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 flex flex-col space-y-4 shadow-xs text-slate-800">
          <span className="text-xs font-mono font-bold uppercase text-amber-600 flex items-center gap-1.5">
            <RefreshCw className="w-4 h-4" /> Import State Backup
          </span>

          <p className="text-xs text-slate-500 leading-normal">
            To overwrite the active state with a previously archived database backup copy, paste the stringified JSON payload in the input console below and click Restore. 
            <span className="text-rose-600 font-bold block mt-1">WARNING: This operation immediately overrides any existing entries and reloads the browser!</span>
          </p>

          <form onSubmit={handleImport} className="flex-1 flex flex-col space-y-4">
            <div className="flex-1 flex flex-col">
              <textarea
                required
                value={importPayload}
                onChange={(e) => setImportPayload(e.target.value)}
                placeholder="Paste your JSON backup payload here..."
                rows={12}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-[10px] font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-orange-550"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-xs font-bold text-white rounded-lg transition-colors cursor-pointer"
              >
                <Database className="w-3.5 h-3.5" />
                Restore State
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
};
