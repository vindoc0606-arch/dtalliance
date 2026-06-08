/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface College {
  id: string;
  name: string;
  type: 'active' | 'pipeline' | 'won'; // 'won' is transitioned from pipeline to active
  studentCount: number;
  revenue: number; // In Rupees (INR)
  renewalDueDate: string; // "YYYY-MM-DD"
  isLapsed: boolean;
  
  // LMS Integration Status
  lmsStatus: 'Provided' | 'Not Provided' | 'Pending';
  courseProgress: number; // percentage (0-100)
  assessmentsConducted: number;
  hoursWatched: number;

  // Smart Library at a glance
  smartLibraryStatus: 'Active' | 'Inactive';
  eBooksAccessed: number;
  physicalCheckouts: number;
  activeReaders: number;

  // V5 Notes dispatch
  v5Status: 'Provided' | 'Not Provided';
  v5Address: string;
  v5Date: string;
  v5ReceiptConfirmed: 'Pending' | 'Done';

  // Faculty demo status
  facultyDemoConducted: number; // number of demos
  facultyDemoConductedDate: string; // "YYYY-MM-DD" or "N/A"
  facultyDemoAligned: number; // pending demos
  facultyDemoAlignedDate: string; // "YYYY-MM-DD" or "N/A"

  // Outstanding / pending payment details
  pendingPaymentAmount: number; // In Rupees
  pendingPaymentDueDate: string; // "YYYY-MM-DD" or "N/A"
  
  // Remarks for Pipeline views
  remarks: string[];
}

export interface WeeklyNote {
  id: string;
  type: 'college' | 'misc';
  collegeId?: string;
  collegeName?: string;
  content: string;
  date: string; // "YYYY-MM-DD"
  year: number;
  week: number;
}

export interface VisitLog {
  id: string;
  collegeName: string;
  representative: string;
  date: string; // YYYY-MM-DD
  purpose: string;
  feedback: string;
  status: 'Completed' | 'Scheduled' | 'Cancelled';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AllianceState {
  colleges: College[];
  weeklyNotes: WeeklyNote[];
  visitLogs: VisitLog[];
  users?: User[];
}
