import React, { useEffect, useState } from 'react';
import { ViewState, Patient, PatientWithStatus } from './types';
import * as Storage from './services/storageService';
import { calculateStatus } from './utils/dateUtils';
import PatientDashboard from './components/PatientDashboard';
import PatientDetail from './components/PatientDetail';
import NewPatientModal from './components/NewPatientModal';
import { Users } from './components/Icons';

function App() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [view, setView] = useState<ViewState>('DASHBOARD');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load data on mount
  useEffect(() => {
    const data = Storage.getPatients();
    setPatients(data);
  }, []);

  // Derived state with calculated statuses
  const patientsWithStatus: PatientWithStatus[] = patients.map(calculateStatus);

  // Sorting: Red (Urgent) first, then Yellow, then Green
  patientsWithStatus.sort((a, b) => {
    const statusPriority = { RED: 0, YELLOW: 1, GREEN: 2 };
    if (statusPriority[a.status] !== statusPriority[b.status]) {
      return statusPriority[a.status] - statusPriority[b.status];
    }
    // Secondary sort by due date ascending
    if (a.daysRemaining !== b.daysRemaining) {
      return a.daysRemaining - b.daysRemaining;
    }
    return 0;
  });

  const handleCreatePatient = (name: string, id: string) => {
    const newPatient = Storage.createPatient(name, id);
    setPatients(prev => [...prev, newPatient]);
  };

  const handleAddSession = (patientId: string, sessionData: { date: string; notes: string }) => {
    const session = {
      id: crypto.randomUUID(),
      date: sessionData.date,
      notes: sessionData.notes,
      createdAt: Date.now(),
    };
    
    const updatedPatient = Storage.addSessionToPatient(patientId, session);
    
    if (updatedPatient) {
      setPatients(prev => prev.map(p => p.id === patientId ? updatedPatient : p));
    }
  };

  const selectedPatient = selectedPatientId 
    ? patientsWithStatus.find(p => p.id === selectedPatientId) 
    : null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => { setView('DASHBOARD'); setSelectedPatientId(null); }}
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold text-slate-800 tracking-tight">Casa Betel</span>
          </div>
          <div className="text-xs text-slate-400 font-medium bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
            v1.0.0
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {view === 'DASHBOARD' && (
          <PatientDashboard
            patients={patientsWithStatus}
            onSelectPatient={(id) => {
              setSelectedPatientId(id);
              setView('PATIENT_DETAIL');
            }}
            onAddPatient={() => setIsModalOpen(true)}
          />
        )}

        {view === 'PATIENT_DETAIL' && selectedPatient && (
          <PatientDetail
            patient={selectedPatient}
            onBack={() => {
              setView('DASHBOARD');
              setSelectedPatientId(null);
            }}
            onAddSession={handleAddSession}
          />
        )}
      </main>

      <NewPatientModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreatePatient}
      />
    </div>
  );
}

export default App;