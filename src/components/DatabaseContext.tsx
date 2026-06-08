/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { College, WeeklyNote, VisitLog, User } from '../types';
import { INITIAL_COLLEGES, INITIAL_WEEKLY_NOTES, INITIAL_VISIT_LOGS } from '../data';

interface DatabaseContextType {
  colleges: College[];
  weeklyNotes: WeeklyNote[];
  visitLogs: VisitLog[];
  activeView: string; // The navigation key (current active screen)
  setActiveView: (view: string) => void;
  
  // Auth state & actions
  currentUser: User | null;
  loadingAuth: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  registerUser: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  
  // Custom API & state mutators
  addCollege: (college: Omit<College, 'id' | 'remarks'>) => void;
  deleteCollege: (id: string) => void;
  markAsWon: (id: string) => void;
  addRemark: (collegeId: string, remarkText: string) => void;
  saveWeeklyNote: (note: Omit<WeeklyNote, 'id' | 'date'>) => void;
  addVisitLog: (log: Omit<VisitLog, 'id'>) => void;
  updateV5Status: (collegeId: string, updates: Partial<Pick<College, 'v5Status' | 'v5Address' | 'v5Date' | 'v5ReceiptConfirmed'>>) => void;
  updateFacultyDemoStatus: (collegeId: string, updates: Partial<Pick<College, 'facultyDemoConducted' | 'facultyDemoConductedDate' | 'facultyDemoAligned' | 'facultyDemoAlignedDate'>>) => void;
  updateLmsStatus: (collegeId: string, updates: Partial<Pick<College, 'lmsStatus' | 'courseProgress' | 'hoursWatched' | 'assessmentsConducted'>>) => void;
  
  // Seeder and utility actions
  seedMiscNotes: () => void;
  clearDatabase: () => void;
  resetDatabase: () => void;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

const LOCAL_COLLEGES_KEY = 'dt-alliance:colleges-v1';
const LOCAL_NOTES_KEY = 'dt-alliance:notes-v1';
const LOCAL_VISITS_KEY = 'dt-alliance:visits-v1';
const LOCAL_NAV_KEY = 'dt-alliance:nav-view-v1';
const LOCAL_TOKEN_KEY = 'dt-alliance:token-v1';

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [weeklyNotes, setWeeklyNotes] = useState<WeeklyNote[]>([]);
  const [visitLogs, setVisitLogs] = useState<VisitLog[]>([]);
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);

  // Load initial states from Server API and localStorage routing
  useEffect(() => {
    const savedNav = localStorage.getItem(LOCAL_NAV_KEY);
    if (savedNav) {
      setActiveView(savedNav);
    }

    const verifyAndLoad = async () => {
      const token = localStorage.getItem(LOCAL_TOKEN_KEY);
      if (token) {
        try {
          const response = await fetch('/api/auth/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
          });
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.user) {
              setCurrentUser(data.user);
            } else {
              localStorage.removeItem(LOCAL_TOKEN_KEY);
            }
          } else {
            localStorage.removeItem(LOCAL_TOKEN_KEY);
          }
        } catch (e) {
          console.error("Error verifying current token", e);
          localStorage.removeItem(LOCAL_TOKEN_KEY);
        }
      }
      setLoadingAuth(false);

      try {
        const response = await fetch(`/api/db?t=${Date.now()}`);
        if (response.ok) {
          const data = await response.json();
          setColleges(data.colleges || []);
          setWeeklyNotes(data.weeklyNotes || []);
          setVisitLogs(data.visitLogs || []);
        } else {
          setColleges(INITIAL_COLLEGES);
          setWeeklyNotes(INITIAL_WEEKLY_NOTES);
          setVisitLogs(INITIAL_VISIT_LOGS);
        }
      } catch (err) {
        console.error("API error loading data, falling back to initial data", err);
        setColleges(INITIAL_COLLEGES);
        setWeeklyNotes(INITIAL_WEEKLY_NOTES);
        setVisitLogs(INITIAL_VISIT_LOGS);
      }
    };

    verifyAndLoad();
  }, []);

  const handleSetActiveView = (view: string) => {
    setActiveView(view);
    localStorage.setItem(LOCAL_NAV_KEY, view);
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setCurrentUser(data.user);
        localStorage.setItem(LOCAL_TOKEN_KEY, data.token);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Invalid email or password' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error connection' };
    }
  };

  const registerUser = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setCurrentUser(data.user);
        localStorage.setItem(LOCAL_TOKEN_KEY, data.token);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Registration failed' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error connection' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(LOCAL_TOKEN_KEY);
  };

  // Actions connecting directly to Express backend
  const addCollege = async (newCol: Omit<College, 'id' | 'remarks'>) => {
    try {
      const response = await fetch('/api/colleges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCol)
      });
      if (response.ok) {
        const fresh = await response.json();
        setColleges(prev => [fresh, ...prev]);
      }
    } catch (err) {
      console.error("Error creating college on backend", err);
    }
  };

  const deleteCollege = async (id: string) => {
    try {
      const response = await fetch(`/api/colleges/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setColleges(prev => prev.filter(c => c.id !== id));
      }
    } catch (err) {
      console.error("Error deleting college on backend", err);
    }
  };

  const markAsWon = async (id: string) => {
    try {
      const response = await fetch(`/api/colleges/${id}/won`, {
        method: 'POST'
      });
      if (response.ok) {
        const updated = await response.json();
        setColleges(prev => prev.map(c => c.id === id ? updated : c));
      }
    } catch (err) {
      console.error("Error marking college as won on backend", err);
    }
  };

  const addRemark = async (collegeId: string, remarkText: string) => {
    if (!remarkText.trim()) return;
    try {
      const response = await fetch(`/api/colleges/${collegeId}/remarks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remarkText })
      });
      if (response.ok) {
        const updated = await response.json();
        setColleges(prev => prev.map(c => c.id === collegeId ? updated : c));
      }
    } catch (err) {
      console.error("Error adding remark on backend", err);
    }
  };

  const saveWeeklyNote = async (note: Omit<WeeklyNote, 'id' | 'date'>) => {
    try {
      const response = await fetch('/api/weekly-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note)
      });
      if (response.ok) {
        const fresh = await response.json();
        setWeeklyNotes(prev => [fresh, ...prev]);
      }
    } catch (err) {
      console.error("Error saving weekly note on backend", err);
    }
  };

  const addVisitLog = async (log: Omit<VisitLog, 'id'>) => {
    try {
      const response = await fetch('/api/visit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log)
      });
      if (response.ok) {
        const fresh = await response.json();
        setVisitLogs(prev => [fresh, ...prev]);
      }
    } catch (err) {
      console.error("Error saving visit log on backend", err);
    }
  };

  const updateV5Status = async (collegeId: string, updates: Partial<Pick<College, 'v5Status' | 'v5Address' | 'v5Date' | 'v5ReceiptConfirmed'>>) => {
    try {
      const response = await fetch(`/api/colleges/${collegeId}/v5`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (response.ok) {
        const updated = await response.json();
        setColleges(prev => prev.map(c => c.id === collegeId ? updated : c));
      }
    } catch (err) {
      console.error("Error updating V5 status on backend", err);
    }
  };

  const updateFacultyDemoStatus = async (collegeId: string, updates: Partial<Pick<College, 'facultyDemoConducted' | 'facultyDemoConductedDate' | 'facultyDemoAligned' | 'facultyDemoAlignedDate'>>) => {
    try {
      const response = await fetch(`/api/colleges/${collegeId}/faculty`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (response.ok) {
        const updated = await response.json();
        setColleges(prev => prev.map(c => c.id === collegeId ? updated : c));
      }
    } catch (err) {
      console.error("Error updating faculty demo status on backend", err);
    }
  };

  const updateLmsStatus = async (collegeId: string, updates: Partial<Pick<College, 'lmsStatus' | 'courseProgress' | 'hoursWatched' | 'assessmentsConducted'>>) => {
    try {
      const response = await fetch(`/api/colleges/${collegeId}/lms`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (response.ok) {
        const updated = await response.json();
        setColleges(prev => prev.map(c => c.id === collegeId ? updated : c));
      }
    } catch (err) {
      console.error("Error updating LMS status on backend", err);
    }
  };

  const seedMiscNotes = async () => {
    try {
      const response = await fetch('/api/weekly-notes/seed-misc', {
        method: 'POST'
      });
      if (response.ok) {
        const seeded = await response.json();
        setWeeklyNotes(prev => [...seeded, ...prev]);
      }
    } catch (err) {
      console.error("Error seeding notes on backend", err);
    }
  };

  const clearDatabase = async () => {
    try {
      const response = await fetch('/api/db/clear', {
        method: 'POST'
      });
      if (response.ok) {
        setColleges([]);
        setWeeklyNotes([]);
        setVisitLogs([]);
      }
    } catch (err) {
      console.error("Error clearing backend database", err);
    }
  };

  const resetDatabase = async () => {
    try {
      const response = await fetch('/api/db/reset', {
        method: 'POST'
      });
      if (response.ok) {
        setColleges(INITIAL_COLLEGES);
        setWeeklyNotes(INITIAL_WEEKLY_NOTES);
        setVisitLogs(INITIAL_VISIT_LOGS);
      }
    } catch (err) {
      console.error("Error resetting backend database", err);
    }
  };

  return (
    <DatabaseContext.Provider value={{
      colleges,
      weeklyNotes,
      visitLogs,
      activeView,
      setActiveView: handleSetActiveView,
      currentUser,
      loadingAuth,
      login,
      logout,
      registerUser,
      addCollege,
      deleteCollege,
      markAsWon,
      addRemark,
      saveWeeklyNote,
      addVisitLog,
      updateV5Status,
      updateFacultyDemoStatus,
      updateLmsStatus,
      seedMiscNotes,
      clearDatabase,
      resetDatabase
    }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
