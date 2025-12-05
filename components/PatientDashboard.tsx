import React from 'react';
import { PatientWithStatus } from '../types';
import { formatDate } from '../utils/dateUtils';
import StatusBadge from './StatusBadge';
import { ChevronRight, Plus, Users } from './Icons';

interface Props {
  patients: PatientWithStatus[];
  onSelectPatient: (id: string) => void;
  onAddPatient: () => void;
}

const PatientDashboard: React.FC<Props> = ({ patients, onSelectPatient, onAddPatient }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tablero de Control</h1>
          <p className="text-slate-500 text-sm">Monitoreo de cumplimiento mensual</p>
        </div>
        <button
          onClick={onAddPatient}
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="w-4 h-4" />
          Nuevo Paciente
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {patients.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium text-slate-600">No hay pacientes registrados</p>
            <p className="text-sm">Comienza registrando un nuevo usuario.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Paciente</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Última Atención</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Próx. Límite</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.map((patient) => (
                  <tr 
                    key={patient.id} 
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                    onClick={() => onSelectPatient(patient.id)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">{patient.name}</span>
                        <span className="text-xs text-slate-400">ID: {patient.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatDate(patient.lastSessionDate || '')}
                    </td>
                    <td className="px-6 py-4 text-sm">
                       <span className={`${patient.daysRemaining < 0 ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
                         {patient.nextDueDate ? formatDate(patient.nextDueDate) : 'Pendiente'}
                       </span>
                       <div className="text-xs text-slate-400 mt-0.5">
                         {patient.lastSessionDate ? (
                            patient.daysRemaining < 0 
                              ? `Vencido hace ${Math.abs(patient.daysRemaining)} días`
                              : `Faltan ${patient.daysRemaining} días`
                         ) : 'Sin historial'}
                       </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={patient.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 inline-block" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;