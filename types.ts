export interface Session {
  id: string;
  date: string; // ISO Date string YYYY-MM-DD
  notes: string;
  createdAt: number;
}

export interface Patient {
  id: string;
  name: string;
  joinedAt: string;
  sessions: Session[];
}

export enum AlertStatus {
  GREEN = 'GREEN',
  YELLOW = 'YELLOW',
  RED = 'RED',
}

export interface PatientWithStatus extends Patient {
  lastSessionDate: string | null;
  nextDueDate: string | null;
  status: AlertStatus;
  daysRemaining: number;
}

export type ViewState = 'DASHBOARD' | 'PATIENT_DETAIL';