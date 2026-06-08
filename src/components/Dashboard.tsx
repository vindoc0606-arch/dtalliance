/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useDatabase } from './DatabaseContext';
import { 
  IndianRupee, 
  Users, 
  Building2, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Search,
  CheckCircle,
  FileText,
  TrendingUp,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { College } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export const Dashboard: React.FC = () => {
  const { 
    colleges, 
    addCollege, 
    deleteCollege, 
    seedMiscNotes, 
    clearDatabase, 
    resetDatabase 
  } = useDatabase();

  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Section collapse states
  const [isKpisCollapsed, setIsKpisCollapsed] = useState(() => {
    return localStorage.getItem('dt_dash_kpi_collapsed') === 'true';
  });
  const [isMiddleCollapsed, setIsMiddleCollapsed] = useState(() => {
    return localStorage.getItem('dt_dash_middle_collapsed') === 'true';
  });
  const [isOverviewCollapsed, setIsOverviewCollapsed] = useState(() => {
    return localStorage.getItem('dt_dash_overview_collapsed') === 'true';
  });

  const toggleKpis = () => {
    setIsKpisCollapsed(prev => {
      localStorage.setItem('dt_dash_kpi_collapsed', String(!prev));
      return !prev;
    });
  };

  const toggleMiddle = () => {
    setIsMiddleCollapsed(prev => {
      localStorage.setItem('dt_dash_middle_collapsed', String(!prev));
      return !prev;
    });
  };

  const toggleOverview = () => {
    setIsOverviewCollapsed(prev => {
      localStorage.setItem('dt_dash_overview_collapsed', String(!prev));
      return !prev;
    });
  };
  
  // Modal Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<'active' | 'pipeline'>('active');
  const [studentCount, setStudentCount] = useState(300);
  const [revenue, setRevenue] = useState(5000000);
  const [renewalDueDate, setRenewalDueDate] = useState('2027-06-30');
  const [pendingAmount, setPendingAmount] = useState(0);
  const [pendingDueDate, setPendingDueDate] = useState('N/A');

  // Active colleges only
  const activeColleges = useMemo(() => {
    return colleges.filter(c => c.type === 'active' || c.type === 'won');
  }, [colleges]);

  // Calculations
  const metrics = useMemo(() => {
    const totalRev = colleges.reduce((acc, c) => acc + c.revenue, 0);
    const totalStuds = colleges.reduce((acc, c) => acc + c.studentCount, 0);
    const activeCount = activeColleges.length;
    const lapsedCount = activeColleges.filter(c => c.isLapsed).length;
    
    // Overall payment status
    const pendingTotal = activeColleges.reduce((acc, c) => acc + (c.pendingPaymentAmount || 0), 0);
    const receivedTotal = totalRev > pendingTotal ? totalRev - pendingTotal : totalRev * 0.88; // fallback guard
    const receivedPercent = totalRev > 0 ? (receivedTotal / totalRev) * 100 : 0;

    return {
      totalRev,
      totalStuds,
      activeCount,
      lapsedCount,
      pendingTotal,
      receivedTotal,
      receivedPercent
    };
  }, [colleges, activeColleges]);

  // Lapsed list
  const lapsedCollegesList = useMemo(() => {
    return activeColleges
      .filter(c => c.isLapsed)
      .sort((a, b) => new Date(a.renewalDueDate).getTime() - new Date(b.renewalDueDate).getTime());
  }, [activeColleges]);

  // Pending payments list
  const pendingPaymentsList = useMemo(() => {
    return activeColleges
      .filter(c => (c.pendingPaymentAmount || 0) > 0)
      .sort((a, b) => b.pendingPaymentAmount - a.pendingPaymentAmount);
  }, [activeColleges]);

  // Filtered colleges for general table
  const filteredColleges = useMemo(() => {
    if (!searchTerm.trim()) return activeColleges;
    return activeColleges.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [activeColleges, searchTerm]);

  // Format Helper
  const formatINR = (val: number) => {
    return `₹${Math.round(val).toLocaleString('en-IN')}`;
  };

  // Pie Chart Data
  const chartData = [
    { name: 'Received', value: metrics.receivedTotal, color: '#2563eb' }, // Blue 600
    { name: 'Pending Dues', value: metrics.pendingTotal, color: '#38bdf8' } // Sky 400
  ];

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addCollege({
      name: name.trim(),
      type,
      studentCount: Number(studentCount),
      revenue: Number(revenue),
      renewalDueDate,
      isLapsed: type === 'active' && new Date(renewalDueDate).getTime() < Date.now(),
      lmsStatus: 'Not Provided',
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
      pendingPaymentAmount: Number(pendingAmount),
      pendingPaymentDueDate: pendingAmount > 0 ? pendingDueDate : 'N/A'
    });

    // Reset Form & Close
    setName('');
    setShowAddModal(false);
  };  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6 text-slate-800 bg-slate-50 min-h-screen">
      
      {/* Header and Quick Commands */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="font-sans font-bold text-2xl text-slate-800 tracking-tight">Master Dashboard</h1>
          <p className="text-slate-500 text-xs mt-1">A quick overview of all {metrics.activeCount} active colleges.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <button 
            id="btn-add-college-modal"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white rounded-lg transition-all shadow-sm hover:shadow cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add College
          </button>
        </div>
      </div>

      {/* KPI Section Header with Toggle */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2 select-none">
        <span className="text-xs font-bold tracking-wider uppercase text-slate-500">Key Performance Statistics</span>
        <button
          onClick={toggleKpis}
          className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 hover:text-blue-700 uppercase transition-all bg-sky-50/60 hover:bg-sky-100/50 px-3 py-1 rounded-lg border border-blue-100 cursor-pointer shadow-3xs"
        >
          {isKpisCollapsed ? (
            <>
              Expand KPIs <ChevronDown className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              Collapse KPIs <ChevronUp className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {!isKpisCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
            animate={{ height: 'auto', opacity: 1, overflow: 'visible' }}
            exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
            transition={{ duration: 0.15 }}
          >
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* Total Revenue */}
              <div className="p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-300 transition-all relative overflow-hidden group shadow-sm hover:shadow">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-blue-500 group-hover:scale-110 transition-transform">
                  <IndianRupee className="w-16 h-16" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Revenue</p>
                <p className="text-2xl font-bold font-sans text-blue-600 mt-2 leading-none">
                  {formatINR(metrics.totalRev)}
                </p>
                <div className="text-xs text-emerald-600 mt-2.5 flex items-center gap-1">
                  <span className="font-semibold">● 100% Locked Deals</span>
                </div>
              </div>

              {/* Total Students */}
              <div className="p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-300 transition-all relative overflow-hidden group shadow-sm hover:shadow">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-sky-500 group-hover:scale-110 transition-transform">
                  <Users className="w-16 h-16" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Connected Students</p>
                <p className="text-2xl font-bold font-sans text-slate-800 mt-2 leading-none">
                  {metrics.totalStuds.toLocaleString('en-IN')}
                </p>
                <div className="text-xs text-slate-500 mt-2.5">
                  <span>Across all medical modules</span>
                </div>
              </div>

              {/* Active Colleges */}
              <div className="p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-300 transition-all relative overflow-hidden group shadow-sm hover:shadow">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-blue-550 group-hover:scale-110 transition-transform">
                  <Building2 className="w-16 h-16" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Won Colleges</p>
                <p className="text-2xl font-bold font-sans text-blue-600 mt-2 leading-none">
                  {metrics.activeCount}
                </p>
                <div className="text-xs text-emerald-600 mt-2.5 flex items-center gap-1">
                  <span className="font-semibold">● Active Operations</span>
                </div>
              </div>

              {/* Renewals Requiring Attention */}
              <div className="p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-300 transition-all relative overflow-hidden group shadow-sm hover:shadow">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-amber-500 group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-16 h-16" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Renewals Due & Lapsed</p>
                <p className="text-2xl font-bold font-sans text-amber-600 mt-2 leading-none">
                  +{metrics.lapsedCount}
                </p>
                <div className="text-xs font-semibold text-amber-600 mt-2.5 flex items-center gap-1">
                  <span>● Action Required This Quarter</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Middle Section Header with Toggle */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2 select-none">
        <span className="text-xs font-bold tracking-wider uppercase text-slate-500 font-sans">Focus Renewals & Payment Analytics</span>
        <button
          onClick={toggleMiddle}
          className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 hover:text-blue-700 uppercase transition-all bg-sky-50/60 hover:bg-sky-100/50 px-3 py-1 rounded-lg border border-blue-100 cursor-pointer shadow-3xs"
        >
          {isMiddleCollapsed ? (
            <>
              Expand Charts <ChevronDown className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              Collapse Charts <ChevronUp className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {!isMiddleCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
            animate={{ height: 'auto', opacity: 1, overflow: 'visible' }}
            exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
            transition={{ duration: 0.15 }}
          >
            {/* Middle Split Panel: Renewals Lapsed vs Payment Status Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Lapsed Renewals Card */}
              <div className="p-5 bg-white rounded-xl border border-blue-100 flex flex-col min-h-80 shadow-2xs hover:shadow-xs transition-shadow">
                <div className="flex items-center gap-2 pb-3 border-b border-sky-100">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <h2 className="text-xs font-mono font-bold tracking-wider uppercase text-slate-800">
                    Lapsed & Current Quarter Renewals
                  </h2>
                </div>

                <div className="flex-1 overflow-y-auto mt-4 space-y-3 pr-1 max-h-72">
                  {lapsedCollegesList.map((col) => {
                    const renewalDateFormatted = new Date(col.renewalDueDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    });
                    return (
                      <div 
                        key={col.id} 
                        className="p-3 rounded-lg bg-sky-50/50 border border-blue-50/70 flex justify-between items-center transition-all hover:bg-sky-50"
                      >
                        <div className="flex flex-col max-w-[70%]">
                          <span className="font-sans text-[13px] font-semibold text-slate-800 truncate">
                            {col.name}
                          </span>
                          <span className="text-[9px] font-mono text-slate-500 mt-0.5 uppercase tracking-wide">
                            {col.studentCount} students Connected
                          </span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200/60">
                            {renewalDateFormatted}
                          </span>
                          <span className="text-[9px] font-mono text-rose-600 mt-1 italic font-semibold">
                            Lapsed
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {lapsedCollegesList.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-8 text-slate-400 h-full">
                      <CheckCircle className="w-8 h-8 text-emerald-500 mb-2 opacity-60" />
                      <span className="text-xs font-mono">No Lapsed Renewals Pending</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Status Pie Chart Card */}
              <div className="p-5 bg-white rounded-xl border border-blue-100 flex flex-col min-h-80 shadow-2xs hover:shadow-xs transition-shadow">
                <div className="flex items-center gap-2 pb-3 border-b border-sky-100">
                  <IndianRupee className="w-4 h-4 text-blue-600 animate-pulse" />
                  <h2 className="text-xs font-mono font-bold tracking-wider uppercase text-slate-800">
                    Overall Payment Status
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 flex-1 items-center">
                  {/* Left side: Pie Donut Chart */}
                  <div className="h-44 flex items-center justify-center relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={75}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: any) => formatINR(value)}
                          contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '8px', color: '#0f172a' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">Received</span>
                      <span className="text-lg font-bold font-sans text-blue-600 leading-tight">
                        {metrics.receivedPercent.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Right side: Colleges Pending Outstanding Payments */}
                  <div className="flex flex-col space-y-2 max-h-52 overflow-y-auto pr-1">
                    <span className="text-[10px] font-mono tracking-widest text-slate-500 font-bold uppercase mb-1">
                      Outstanding Balance Dues
                    </span>

                    {pendingPaymentsList.map((col) => {
                      const dueDateFormatted = new Date(col.pendingPaymentDueDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      });
                      return (
                        <div key={col.id} className="p-2.5 rounded bg-sky-50/50 border border-blue-50/50 hover:bg-sky-50 transition-all">
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-semibold text-slate-700 truncate pr-2 max-w-[65%]">
                              {col.name}
                            </span>
                            <span className="text-xs font-bold text-blue-600 font-mono flex-shrink-0">
                              {formatINR(col.pendingPaymentAmount)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-[9px] font-mono text-slate-500 leading-none">Due date: {dueDateFormatted}</span>
                            <span className="text-[9px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1 rounded">PENDING</span>
                          </div>
                        </div>
                      );
                    })}

                    {pendingPaymentsList.length === 0 && (
                      <div className="p-4 text-center text-slate-400 text-xs italic font-mono">
                        No Outstanding Payment Records
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overview Table Header with Toggle */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2 select-none">
        <span className="text-xs font-bold tracking-wider uppercase text-slate-500 font-sans">Institutional Contract Lines Overview</span>
        <button
          onClick={toggleOverview}
          className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 hover:text-blue-700 uppercase transition-all bg-sky-50/60 hover:bg-sky-100/50 px-3 py-1 rounded-lg border border-blue-100 cursor-pointer shadow-3xs"
        >
          {isOverviewCollapsed ? (
            <>
              Expand Overview <ChevronDown className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              Collapse Overview <ChevronUp className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {!isOverviewCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
            animate={{ height: 'auto', opacity: 1, overflow: 'visible' }}
            exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
            transition={{ duration: 0.15 }}
          >
            {/* Bottom General Active Colleges Overview Table */}
            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow transition-shadow">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold text-slate-800">
                    Active College Overview
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">Manage details and records of active contract lines.</p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search active institutions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-sky-50/50 border border-blue-100 rounded-lg pl-8.5 pr-2 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-300 font-sans"
                  />
                </div>
              </div>

              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs text-slate-600 uppercase tracking-wider font-semibold bg-slate-50/75">
                      <th className="py-3 px-3">College Name</th>
                      <th className="py-3 px-3 text-right">Student Count</th>
                      <th className="py-3 px-3 text-right">Deal Value</th>
                      <th className="py-3 px-3">LMS Integration</th>
                      <th className="py-3 px-3">Renewal Due</th>
                      <th className="py-3 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-50 font-sans text-xs">
                    {filteredColleges.map((col) => (
                      <tr key={col.id} className="hover:bg-sky-50/30 transition-colors">
                        <td className="py-3 px-3 font-semibold text-slate-800 max-w-xs truncate">
                          {col.name}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-medium text-slate-600">
                          {col.studentCount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-semibold text-blue-600">
                          {formatINR(col.revenue)}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-mono leading-none ${
                            col.lmsStatus === 'Provided'
                              ? 'bg-emerald-55 text-emerald-700 border border-emerald-200'
                              : col.lmsStatus === 'Pending'
                                ? 'bg-amber-55 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}>
                            {col.lmsStatus}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600">
                          {new Date(col.renewalDueDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            id={`btn-col-delete-${col.id}`}
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${col.name}?`)) {
                                deleteCollege(col.id);
                              }
                            }}
                            className="p-1 hover:bg-rose-50 hover:text-rose-600 text-slate-400 rounded transition-colors cursor-pointer"
                            title="Delete Contract Line"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}

                    {filteredColleges.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400 italic font-mono text-[11px]">
                          No active colleges mapping search query
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add College Dialog Modal */}
      {showAddModal && (
        <div id="add-college-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-xl border border-slate-250 text-slate-800 shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex h-14 items-center justify-between px-5 bg-sky-50 border-b border-blue-100">
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-blue-900">
                Register New Institution
              </span>
              <button 
                id="btn-close-modal"
                onClick={() => setShowAddModal(false)}
                className="p-1 bg-white hover:bg-blue-105 text-slate-500 hover:text-slate-800 rounded transition-colors cursor-pointer border border-blue-100 shadow-2xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
              
              {/* College Name */}
              <div>
                <label className="text-[10px] font-mono tracking-widest uppercase text-slate-500 block mb-1">
                  College Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Christian Medical College, Vellore"
                  className="w-full bg-white border border-blue-200 rounded-lg p-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>

              {/* Status Classification */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono tracking-widest uppercase text-slate-500 block mb-1">
                    Contract Type
                  </label>
                  <select
                     value={type}
                     onChange={(e: any) => setType(e.target.value)}
                     className="w-full bg-white border border-blue-200 rounded-lg p-2 text-xs text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  >
                    <option value="active">Active (Won)</option>
                    <option value="pipeline">Pipeline (Prospective)</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-[10px] font-mono tracking-widest uppercase text-slate-500 block mb-1">
                    Student Count
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={studentCount}
                    onChange={(e) => setStudentCount(Number(e.target.value))}
                    className="w-full bg-white border border-blue-200 rounded-lg p-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Revenue & Renewal Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono tracking-widest uppercase text-slate-500 block mb-1">
                    Total Deal Value (INR)
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={revenue}
                    onChange={(e) => setRevenue(Number(e.target.value))}
                    className="w-full bg-white border border-blue-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                   <label className="text-[10px] font-mono tracking-widest uppercase text-slate-500 block mb-1">
                    Contract Renewal Due
                  </label>
                  <input
                    type="date"
                    required
                    value={renewalDueDate}
                    onChange={(e) => setRenewalDueDate(e.target.value)}
                    className="w-full bg-white border border-blue-200 rounded-lg p-2 text-xs text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Pending Payment configuration */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="text-[10px] font-mono tracking-widest uppercase text-slate-500 block mb-1">
                    Pending Payment (INR) - Options
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={pendingAmount}
                    onChange={(e) => setPendingAmount(Number(e.target.value))}
                    className="w-full bg-white border border-blue-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono tracking-widest uppercase text-slate-500 block mb-1">
                    Pending Payment Due Date
                  </label>
                  <input
                    type="date"
                    value={pendingDueDate === 'N/A' ? '' : pendingDueDate}
                    onChange={(e) => setPendingDueDate(e.target.value || 'N/A')}
                    className="w-full bg-white border border-blue-200 rounded-lg p-2 text-xs text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  id="btn-add-modal-cancel"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs text-slate-600 font-semibold rounded-lg border border-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-add-modal-submit"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-xs font-bold text-white rounded-lg transition-colors shadow shadow-blue-500/15 cursor-pointer"
                >
                  Save Deal
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
