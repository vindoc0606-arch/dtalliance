/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { DatabaseProvider, useDatabase } from './components/DatabaseContext';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { PipelineView } from './components/PipelineView';
import { StudentDistribution } from './components/StudentDistribution';
import { WeeklyReview } from './components/WeeklyReview';
import { LMSView } from './components/LMSView';
import { SmartLibrary } from './components/SmartLibrary';
import { V5Notes } from './components/V5Notes';
import { FacultyDemo } from './components/FacultyDemo';
import { EmployeeVisits } from './components/EmployeeVisits';
import { DownloadReports } from './components/DownloadReports';
import { ImportExport } from './components/ImportExport';
import { GlobalSearch } from './components/GlobalSearch';
import { Login } from './components/Login';
import { Search, Stethoscope, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function AllianceAppContent() {
  const { activeView, currentUser, loadingAuth } = useDatabase();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k')) {
        // Prevent opening if the user is typing inside input or textarea elements
        if (
          document.activeElement?.tagName === 'INPUT' || 
          document.activeElement?.tagName === 'TEXTAREA' ||
          document.activeElement?.getAttribute('contenteditable') === 'true'
        ) {
          return;
        }
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  // Display absolute medical heartbeat loader while initial session is verified
  if (loadingAuth) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-sky-50/45 text-slate-800">
        <motion.div
          animate={{ scale: [1, 1.12, 1], rotate: [0, 0, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-500 text-white shadow-xl shadow-blue-500/10 mb-5"
        >
          <Stethoscope className="w-7 h-7" />
        </motion.div>
        <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400 animate-pulse">Initializing DocTutorials Console...</span>
      </div>
    );
  }

  // Gate content with Login
  if (!currentUser) {
    return <Login />;
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'pipeline':
        return <PipelineView />;
      case 'students':
        return <StudentDistribution />;
      case 'weekly':
        return <WeeklyReview />;
      case 'lms':
        return <LMSView />;
      case 'library':
        return <SmartLibrary />;
      case 'v5':
        return <V5Notes />;
      case 'faculty':
        return <FacultyDemo />;
      case 'visits':
        return <EmployeeVisits />;
      case 'reports':
        return <DownloadReports />;
      case 'importexport':
        return <ImportExport />;
      default:
        return <Dashboard />;
    }
  };

  // Helper to get presentable view labels
  const getViewLabel = (view: string) => {
    switch (view) {
      case 'importexport': return 'Import & Export';
      case 'v5': return 'V5 Notes Dispatch';
      case 'faculty': return 'Faculty Demo Status';
      case 'weekly': return 'Weekly Review Logs';
      case 'students': return 'Student Distribution';
      case 'reports': return 'Download Reports';
      default:
        return view.charAt(0).toUpperCase() + view.slice(1).replace('-', ' ');
    }
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-sky-50/45 text-slate-800 font-sans antialiased selection:bg-blue-600/25 select-none">
      
      {/* Mobile Sidebar Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Navigation Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Primary Content Panel Frame */}
      <main className="flex-1 flex flex-col overflow-hidden min-h-0 bg-sky-50/45 relative">
        
        {/* Global Action Header Bar */}
        <div className="h-14 bg-white/70 backdrop-blur-md border-b border-blue-100/60 px-4 sm:px-6 flex items-center justify-between flex-shrink-0 z-10 select-none gap-2">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Toggle Hamburger */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer bg-white shadow-3xs"
              title="Open Navigation Menu"
            >
              <Menu className="w-4 h-4 text-slate-600" />
            </button>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest leading-none hidden sm:inline">Console Module</span>
            <span className="text-slate-300 hidden sm:inline">/</span>
            <span className="text-[11px] font-sans font-bold text-slate-700 truncate max-w-[150px] sm:max-w-none">
              {getViewLabel(activeView)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Elegant Premium Search trigger button */}
            <button
              id="topbar-search-trigger"
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 bg-white hover:bg-sky-50/50 border border-blue-100 rounded-xl text-slate-400 hover:text-slate-700 transition-all cursor-pointer shadow-sm hover:shadow text-xs"
              title="Search and fetch anything"
            >
              <Search className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
              <span className="font-sans font-medium text-slate-500 text-[11px] sm:text-[11.5px] hidden xs:inline">Search & fetch...</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-mono font-bold bg-slate-50 border border-slate-200 text-slate-500 rounded-md shadow-sm leading-none">
                /
              </kbd>
            </button>
          </div>
        </div>

        {/* Dynamic view viewport */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Global Spotlight Search Overlay Modal */}
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

    </div>
  );
}

export default function App() {
  return (
    <DatabaseProvider>
      <AllianceAppContent />
    </DatabaseProvider>
  );
}
