/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useDatabase } from './DatabaseContext';
import { FileSpreadsheet, FileText, Download, CheckCircle, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

export const DownloadReports: React.FC = () => {
  const { colleges } = useDatabase();
  const [downloadingType, setDownloadingType] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleDownload = (type: string) => {
    setDownloadingType(type);
    setProgress(0);

    // Simulate progress animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            triggerFileDownload(type);
            setDownloadingType(null);
          }, 350);
          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  const triggerFileDownload = (type: string) => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = '';

    const activeColleges = colleges.filter(c => c.type === 'active' || c.type === 'won');

    if (type === 'all') {
      filename = `doctutorials_all_colleges_${new Date().toISOString().split('T')[0]}.csv`;
      headers = ['ID', 'NAME', 'SUBSCRIBERS', 'DEAL_VALUE_INR', 'RENEWAL_DATE', 'LMS_STATUS', 'LIBRARY_STATUS', 'PENDING_PAYMENT_INR'];
      rows = activeColleges.map((col) => [
        col.id,
        `"${col.name}"`,
        String(col.studentCount),
        String(col.revenue),
        col.renewalDueDate,
        col.lmsStatus,
        col.smartLibraryStatus || 'Inactive',
        String(col.pendingPaymentAmount || 0)
      ]);
    } else if (type === 'lapsed') {
      filename = `doctutorials_lapsed_renewals_${new Date().toISOString().split('T')[0]}.csv`;
      headers = ['ID', 'NAME', 'SUBSCRIBERS', 'DEAL_VALUE_INR', 'RENEWAL_DATE'];
      rows = activeColleges
        .filter(c => c.isLapsed)
        .map((col) => [
          col.id,
          `"${col.name}"`,
          String(col.studentCount),
          String(col.revenue),
          col.renewalDueDate
        ]);
    } else {
      filename = `doctutorials_outstanding_ledgers_${new Date().toISOString().split('T')[0]}.csv`;
      headers = ['ID', 'NAME', 'OUTSTANDING_DUE_INR', 'PAYMENT_DUE_DATE'];
      rows = activeColleges
        .filter(c => (c.pendingPaymentAmount || 0) > 0)
        .map((col) => [
          col.id,
          `"${col.name}"`,
          String(col.pendingPaymentAmount),
          col.pendingPaymentDueDate
        ]);
    }

    // Format string csv
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6 text-slate-800 bg-slate-50 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="font-sans font-bold text-2xl text-slate-800 tracking-tight">Enterprise Export Center</h1>
          <p className="text-slate-500 text-xs mt-1">
            Build and download official contract spreadsheets, lapsed renewals, or outstanding ledgers instantly.
          </p>
        </div>
      </div>

      {/* Grid of Report Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Report 1 */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 flex flex-col justify-between hover:border-slate-350 transition-all shadow-xs text-slate-850">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-orange-600/10 border border-orange-600/30 flex items-center justify-center text-orange-600">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-semibold text-slate-800 text-sm">Alliance Active Registry Map</h3>
              <p className="text-xs text-slate-500 mt-1 leading-normal">
                Generates a complete list of all 17 active medical academies, containing total connected student counts, deal sizes, V5 status details, and LMS metrics.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            {downloadingType === 'all' ? (
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-mono text-orange-600">
                  <span>Generating CSV...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-slate-105 h-1 rounded-full overflow-hidden">
                  <motion.div 
                    className="bg-orange-500 h-full" 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : (
              <button
                id="btn-download-all"
                onClick={() => handleDownload('all')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-xs font-bold text-white rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Download Spreadsheet
              </button>
            )}
          </div>
        </div>

        {/* Report 2 */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 flex flex-col justify-between hover:border-slate-350 transition-all shadow-xs text-slate-855">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-rose-600/10 border border-rose-600/30 flex items-center justify-center text-rose-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-semibold text-slate-800 text-sm">Lapsed & Q1 Renewals Log</h3>
              <p className="text-xs text-slate-500 mt-1 leading-normal">
                Generates a targeted log of institutions with lapsed renewal contracts of this fiscal year, including Dean follow-up alerts and contact deadlines.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            {downloadingType === 'lapsed' ? (
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-mono text-rose-600">
                  <span>Formatting Ledger...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-slate-105 h-1 rounded-full overflow-hidden">
                  <motion.div 
                    className="bg-rose-500 h-full" 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : (
              <button
                id="btn-download-lapsed"
                onClick={() => handleDownload('lapsed')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200/85 border border-slate-200 rounded-lg text-xs font-bold text-slate-705 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Build Lapsed Ledger
              </button>
            )}
          </div>
        </div>

        {/* Report 3 */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 flex flex-col justify-between hover:border-slate-350 transition-all shadow-xs text-slate-855">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-amber-600/10 border border-amber-600/30 flex items-center justify-center text-amber-600">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-semibold text-slate-800 text-sm">Outstanding Payments Ledger</h3>
              <p className="text-xs text-slate-500 mt-1 leading-normal">
                Extracts precise outstanding payment balances due across active clients like SMBT or Sri Balaji, mapping due dates and pending amounts for collection squads.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            {downloadingType === 'outstanding' ? (
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-mono text-amber-605">
                  <span>Calculating Balances...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-slate-105 h-1 rounded-full overflow-hidden">
                  <motion.div 
                    className="bg-amber-500 h-full" 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : (
              <button
                id="btn-download-outstanding"
                onClick={() => handleDownload('outstanding')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200/85 border border-slate-200 rounded-lg text-xs font-bold text-slate-705 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Generate Payments Due List
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Info notice box */}
      <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 flex gap-3 text-xs text-orange-850 max-w-3xl">
        <HelpCircle className="w-5 h-5 flex-shrink-0 text-orange-600 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Enterprise Report Guidelines:</strong> Reports are compiled using client-side State caches. This guarantees immediate generation without taxing server CPU resources, securing active confidentiality compliance.
        </p>
      </div>

    </div>
  );
};
