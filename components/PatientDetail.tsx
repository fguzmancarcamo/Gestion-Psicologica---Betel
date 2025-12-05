import React, { useState } from 'react';
import { PatientWithStatus, Session } from '../types';
import { formatDate } from '../utils/dateUtils';
import StatusBadge from './StatusBadge';
import { ArrowLeft, Calendar, FileText, Plus, BrainCircuit } from './Icons';
import { analyzePatientProgress } from '../services/geminiService';

interface Props {
  patient: PatientWithStatus;
  onBack: () => void;
  onAddSession: (patientId: string, sessionData: { date: string; notes: string }) => void;
}

const PatientDetail: React.FC<Props> = ({ patient, onBack, onAddSession }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newNotes, setNewNotes] = useState('');
  
  // AI State
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDate && newNotes) {
      onAddSession(patient.id, { date: newDate, notes: newNotes });
      setNewDate('');
      setNewNotes('');
      setShowAddForm(false);
      // Clear analysis as data has changed
      setAiAnalysis(null);
    }
  };

  const handleAiAnalysis = async () => {
    setIsAnalyzing(true);
    const result = await analyzePatientProgress(patient.name, patient.sessions);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button 
        onClick={onBack}
        className="text-slate-500 hover:text-slate-800 flex items-center gap-2 text-sm font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al tablero
      </button>

      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">{patient.name}</h1>
            <p className="text-slate-500 text-sm">ID: {patient.id} • Ingreso: {formatDate(patient.joinedAt)}</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right">
                <p className="text-xs text-slate-400 uppercase font-semibold">Estado Actual</p>
                <div className="mt-1">
                   <StatusBadge status={patient.status} />
                </div>
             </div>
             <div className="h-10 w-px bg-slate-200 hidden md:block"></div>
             <div className="text-right">
                <p className="text-xs text-slate-400 uppercase font-semibold">Próxima Atención</p>
                <p className={`font-medium ${patient.daysRemaining < 0 ? 'text-red-600' : 'text-slate-700'}`}>
                  {patient.nextDueDate ? formatDate(patient.nextDueDate) : 'Pendiente'}
                </p>
             </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? 'Cancelar Registro' : 'Registrar Nueva Atención'}
        </button>
        <button
          onClick={handleAiAnalysis}
          disabled={isAnalyzing || patient.sessions.length === 0}
          className="flex-none bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 p-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <BrainCircuit className="w-4 h-4" />
          {isAnalyzing ? 'Analizando...' : 'Analizar Progreso con AI'}
        </button>
      </div>
      
      {/* AI Result Section */}
      {aiAnalysis && (
        <div className="bg-gradient-to-r from-purple-50 to-white border border-purple-100 rounded-xl p-6 shadow-sm animate-in fade-in slide-in-from-top-4">
          <h3 className="text-purple-900 font-semibold mb-2 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5" />
            Resumen Clínico (Gemini AI)
          </h3>
          <div className="prose prose-sm text-slate-700 whitespace-pre-line">
            {aiAnalysis}
          </div>
        </div>
      )}

      {/* Add Session Form */}
      {showAddForm && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 animate-in fade-in zoom-in-95">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Nueva Sesión</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Sesión</label>
              <input
                type="date"
                required
                max={new Date().toISOString().split('T')[0]}
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notas / Resumen Clínico</label>
              <textarea
                required
                rows={4}
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Describa el progreso del paciente, temas tratados y observaciones..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
              />
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Guardar Sesión
              </button>
            </div>
          </form>
        </div>
      )}

      {/* History List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" />
            Historial de Atenciones ({patient.sessions.length})
          </h3>
        </div>
        
        {patient.sessions.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <p>No hay atenciones registradas para este paciente.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {patient.sessions.map((session) => (
              <div key={session.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-2">
                  <span className="font-semibold text-indigo-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    {formatDate(session.date)}
                  </span>
                  <span className="text-xs text-slate-400 mt-1 sm:mt-0">
                    Registrado el: {new Date(session.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap pl-6 border-l-2 border-slate-200 ml-1.5">
                  {session.notes}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDetail;