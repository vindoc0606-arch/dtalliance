/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useDatabase } from './DatabaseContext';
import { 
  LayoutDashboard, 
  GitPullRequest, 
  Users, 
  CalendarRange, 
  GraduationCap, 
  Library, 
  FileSpreadsheet, 
  Presentation, 
  MapPin, 
  Download, 
  RefreshCw,
  Clock,
  LogOut,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { activeView, setActiveView, currentUser, logout } = useDatabase();

  const menuItems = [
    { key: 'dashboard', label: 'Master Dashboard', icon: LayoutDashboard },
    { key: 'pipeline', label: 'Pipeline View', icon: GitPullRequest },
    { key: 'students', label: 'Student Distribution', icon: Users },
    { key: 'weekly', label: 'Weekly Review', icon: CalendarRange },
    { key: 'lms', label: 'LMS At a Glance', icon: GraduationCap },
    { key: 'library', label: 'Smart Library At a Glance', icon: Library },
    { key: 'v5', label: 'V5 Notes Dispatch Status', icon: FileSpreadsheet },
    { key: 'faculty', label: 'Faculty Demo Status', icon: Presentation },
    { key: 'visits', label: 'Employee Visits', icon: MapPin },
    { key: 'reports', label: 'Download Reports', icon: Download },
  ];

  return (
    <div className={`fixed inset-y-0 left-0 z-40 md:relative md:translate-x-0 w-68 bg-sky-50/75 text-slate-700 flex flex-col h-full flex-shrink-0 border-r border-blue-100/90 shadow-sm transition-transform duration-300 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      
      {/* Brand Header */}
      <div className="p-5 border-b border-blue-100/80 bg-white/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/10">
            DT
          </div>
          <div className="flex flex-col">
            <span className="font-sans font-bold text-[15px] text-slate-800 tracking-wide leading-none">
              DocTutorials
            </span>
            <span className="text-[10px] font-mono text-blue-600 font-bold tracking-widest mt-1 uppercase">
              Alliance Console
            </span>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
          title="Close Navigation"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Dashboard Scope Pill Indicator */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-blue-100/80 text-[11px] font-mono text-slate-500 shadow-2xs">
          <Clock className="w-3.5 h-3.5 text-blue-600" />
          <span>Active Session: 2026 Admin</span>
        </div>
      </div>

      {/* Navigation Links list */}
      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-1 select-none scrollbar-thin scrollbar-thumb-slate-200">
        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest px-3 mb-2 block">
          Enterprise Modules
        </span>

        {menuItems.map((item) => {
          const isActive = activeView === item.key;
          const IconComponent = item.icon;
          return (
            <button
              key={item.key}
              id={`sidebar-link-${item.key}`}
              onClick={() => {
                setActiveView(item.key);
                onClose();
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-sans font-medium transition-all text-left cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-blue-900 hover:bg-sky-100/50'
              }`}
            >
              <IconComponent className={`w-4 h-4 flex-shrink-0 transition-colors ${
                isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-700'
              }`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Profile & Logout Block */}
      {currentUser && (
        <div className="p-3 mx-3 mb-2 bg-white rounded-xl border border-blue-100 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-7.5 h-7.5 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center uppercase border border-blue-100 select-none">
              {currentUser.name.slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0 select-none">
              <h4 className="text-[11.5px] font-sans font-bold text-slate-800 truncate leading-tight">
                {currentUser.name}
              </h4>
              <p className="text-[9.5px] font-mono text-slate-500 tracking-wider uppercase truncate mt-0.5 leading-none">
                {currentUser.role}
              </p>
            </div>
          </div>
          <button
            id="sidebar-logout-btn"
            onClick={() => {
              logout();
              onClose();
            }}
            className="w-full mt-2.5 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-rose-100/70 hover:border-rose-200 text-rose-600 hover:bg-rose-50/40 text-[10.5px] font-sans font-bold uppercase tracking-wider transition-all cursor-pointer shadow-3xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>log out</span>
          </button>
        </div>
      )}

      {/* Clean Premium Sidebar Footer */}
      <div className="p-4 bg-white/60 border-t border-blue-100/80 text-center text-xs text-slate-400">
        <span>© 2026 DocTutorials Alliance</span>
      </div>

    </div>
  );
};
