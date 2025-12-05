import { AlertStatus, Patient, PatientWithStatus } from '../types';

export const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
};

export const calculateStatus = (patient: Patient): PatientWithStatus => {
  const now = new Date();
  
  // Sort sessions to find last one
  const sortedSessions = [...patient.sessions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const lastSession = sortedSessions.length > 0 ? sortedSessions[0] : null;
  
  let nextDueDate: Date | null = null;
  let status = AlertStatus.RED;
  let daysRemaining = -999;

  if (!lastSession) {
    // New patient, no sessions yet. Urgent to schedule first one.
    status = AlertStatus.RED;
    daysRemaining = 0;
  } else {
    const lastDate = new Date(lastSession.date);
    // Rule: One session per calendar month OR next session within 30 days.
    // The prompt specifies: "Se requiere al menos una atención en el mes calendario".
    // And "Calculo de Proxima Atencion: 30 dias despues de la ultima".
    
    // Next due date logic
    nextDueDate = new Date(lastDate);
    nextDueDate.setDate(lastDate.getDate() + 30);
    
    const diffTime = nextDueDate.getTime() - now.getTime();
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Check if session happened in current calendar month
    const isCurrentMonth = lastDate.getMonth() === now.getMonth() && lastDate.getFullYear() === now.getFullYear();

    if (isCurrentMonth) {
      status = AlertStatus.GREEN;
    } else {
      if (daysRemaining > 7) {
        status = AlertStatus.GREEN;
      } else if (daysRemaining >= 0 && daysRemaining <= 7) {
        // "Verde: La próxima atención está programada dentro de los próximos 7 días"
        // Prompt logic is a bit ambiguous, but typically 0-7 days left is warning territory in UX.
        // However, prompt says: "Verde: ...dentro de los próximos 7 días".
        // Let's adhere to a safe interpretation for "Betel": 
        // If they have time (> 7 days) -> Green.
        // If they are close (0-7 days) -> Yellow (Warning).
        // If overdue (< 0) -> Red.
        status = AlertStatus.YELLOW; 
      } else {
        status = AlertStatus.RED;
      }
    }
  }

  return {
    ...patient,
    lastSessionDate: lastSession ? lastSession.date : null,
    nextDueDate: nextDueDate ? nextDueDate.toISOString() : null,
    status,
    daysRemaining
  };
};