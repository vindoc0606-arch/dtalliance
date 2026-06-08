/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { useDatabase } from './DatabaseContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { GraduationCap, ArrowUpDown, Award, Flame } from 'lucide-react';

export const StudentDistribution: React.FC = () => {
  const { colleges } = useDatabase();
  const [sortBy, setSortBy] = useState<'desc' | 'asc' | 'alphabetical'>('desc');

  const activeColleges = useMemo(() => {
    return colleges.filter(c => c.type === 'active' || c.type === 'won');
  }, [colleges]);

  const distributionMetrics = useMemo(() => {
    if (activeColleges.length === 0) return { max: 0, min: 0, avg: 0, total: 0 };
    const counts = activeColleges.map(c => c.studentCount);
    const total = counts.reduce((a, b) => a + b, 0);
    const max = Math.max(...counts);
    const min = Math.min(...counts);
    const avg = Math.round(total / activeColleges.length);
    return { max, min, avg, total };
  }, [activeColleges]);

  const sortedData = useMemo(() => {
    const data = [...activeColleges];
    if (sortBy === 'desc') {
      return data.sort((a, b) => b.studentCount - a.studentCount);
    } else if (sortBy === 'asc') {
      return data.sort((a, b) => a.studentCount - b.studentCount);
    } else {
      return data.sort((a, b) => a.name.localeCompare(b.name));
    }
  }, [activeColleges, sortBy]);

  const topCollege = useMemo(() => {
    if (activeColleges.length === 0) return null;
    return [...activeColleges].sort((a, b) => b.studentCount - a.studentCount)[0];
  }, [activeColleges]);

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6 text-slate-800 bg-sky-50/45 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-blue-100/80 pb-5">
        <div>
          <h1 className="font-sans font-bold text-2xl text-slate-800 tracking-tight">Student Distribution</h1>
          <p className="text-slate-500 text-xs mt-1 mr-2">
            Cohort density analysis across active Alliance medical academies.
          </p>
        </div>

        {/* Sorting options */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">Sort By</span>
          
          <button
            id="sort-btn-desc"
            onClick={() => setSortBy('desc')}
            className={`flex items-center gap-1 px-3 py-1.5 border text-xs font-mono font-medium rounded-lg transition-colors cursor-pointer ${
              sortBy === 'desc'
                ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                : 'bg-white text-slate-600 border-blue-105 hover:bg-sky-50/50'
            }`}
          >
            <ArrowUpDown className="w-3 h-3" />
            Max Students
          </button>

          <button
            id="sort-btn-asc"
            onClick={() => setSortBy('asc')}
            className={`flex items-center gap-1 px-3 py-1.5 border text-xs font-mono font-medium rounded-lg transition-colors cursor-pointer ${
              sortBy === 'asc'
                ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                : 'bg-white text-slate-600 border-blue-105 hover:bg-sky-50/50'
            }`}
          >
            <ArrowUpDown className="w-3 h-3" />
            Min Students
          </button>
        </div>
      </div>

      {/* Summary KPI grid columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-4 bg-white rounded-xl border border-blue-100 flex items-center gap-4 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-600/30 flex items-center justify-center text-blue-600">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wilder leading-none block">Aggregate Connected</span>
            <span className="text-lg font-bold font-sans text-blue-600 mt-1.5 block">
              {distributionMetrics.total.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-blue-100 flex items-center gap-4 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-600/30 flex items-center justify-center text-indigo-600">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wilder leading-none block">Average College Size</span>
            <span className="text-lg font-bold font-sans text-slate-800 mt-1.5 block">
              {distributionMetrics.avg.toLocaleString('en-IN')} Students
            </span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-blue-100 flex items-center gap-4 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-sky-600/10 border border-sky-600/30 flex items-center justify-center text-sky-600">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wilder leading-none block">Max Academy Capacity</span>
            <span className="text-lg font-bold font-sans text-slate-800 mt-1.5 block">
              {distributionMetrics.max.toLocaleString('en-IN')} Students
            </span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-blue-100 flex items-center gap-4 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-teal-600/10 border border-teal-600/30 flex items-center justify-center text-teal-600">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wilder leading-none block">Highest Enrolled Institution</span>
            <span className="text-xs font-semibold font-sans text-slate-800 mt-1.5 block truncate max-w-44" title={topCollege ? topCollege.name : 'N/A'}>
              {topCollege ? topCollege.name : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Bar Chart Container */}
      <div className="p-5 bg-white rounded-xl border border-blue-100 shadow-2xs">
        <h2 className="text-xs font-mono font-bold tracking-wider uppercase text-slate-800 pb-3 border-b border-sky-100 mb-5">
          Student Counts Comparison View
        </h2>

        <div className="h-96 w-full">
          {sortedData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sortedData}
                margin={{ top: 10, right: 10, left: -20, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b" 
                  fontSize={9}
                  tickLine={false}
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  formatter={(value: any) => [`${value} Students`, 'Enrollment']}
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '8px' }}
                  labelStyle={{ color: '#0f172a', fontWeight: 'bold', fontSize: 11 }}
                />
                <Bar dataKey="studentCount" radius={[4, 4, 0, 0]}>
                  {sortedData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === 0 ? '#1e40af' : index === 1 ? '#2563eb' : index === 2 ? '#3b82f6' : '#60a5fa'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 font-mono text-xs">
              No Active Institutions to Display
            </div>
          )}
        </div>
      </div>

      {/* Numerical breakdown helper list */}
      <div className="p-5 bg-white rounded-xl border border-blue-100 shadow-2xs font-sans">
        <h2 className="text-xs font-mono font-bold tracking-wider uppercase text-slate-800 pb-3 border-b border-sky-100 mb-4">
          Data Audit logs
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {sortedData.map((col, idx) => (
            <div key={col.id} className="p-3 rounded-lg bg-sky-50/20 border border-blue-50 flex justify-between items-center hover:bg-sky-50/50 transition-all">
              <div className="flex flex-col truncate pr-2">
                <span className="text-[10px] font-mono text-blue-500 font-semibold">#{idx + 1} ACADEMY</span>
                <span className="text-xs font-semibold text-slate-800 tracking-tight truncate mt-0.5">{col.name}</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-blue-600 font-mono">{col.studentCount.toLocaleString('en-IN')}</span>
                <span className="text-[9px] font-mono text-slate-500 block">registered</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
