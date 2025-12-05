import { Patient, Session } from '../types';

// In a real production environment, this would be replaced by Firestore calls.
// Using LocalStorage allows the app to be fully functional immediately without API keys.

const STORAGE_KEY = 'casa_betel_data';

const getInitialData = (): Patient[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  // Seed data for demonstration
  return [
    {
      id: '1',
      name: 'Juan Pérez',
      joinedAt: new Date().toISOString(),
      sessions: [
        { id: 's1', date: '2023-10-15', notes: 'Sesión inicial. Paciente presenta ansiedad leve.', createdAt: Date.now() }
      ]
    },
    {
      id: '2',
      name: 'Maria Gonzalez',
      joinedAt: new Date().toISOString(),
      sessions: []
    }
  ];
};

export const getPatients = (): Patient[] => {
  return getInitialData();
};

export const savePatient = (patient: Patient): void => {
  const patients = getPatients();
  const index = patients.findIndex(p => p.id === patient.id);
  if (index >= 0) {
    patients[index] = patient;
  } else {
    patients.push(patient);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
};

export const addSessionToPatient = (patientId: string, session: Session): Patient | null => {
  const patients = getPatients();
  const patient = patients.find(p => p.id === patientId);
  if (!patient) return null;

  patient.sessions.push(session);
  // Sort sessions by date descending
  patient.sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  savePatient(patient);
  return patient;
};

export const createPatient = (name: string, id?: string): Patient => {
  const newPatient: Patient = {
    id: id || crypto.randomUUID().slice(0, 8),
    name,
    joinedAt: new Date().toISOString(),
    sessions: []
  };
  savePatient(newPatient);
  return newPatient;
};