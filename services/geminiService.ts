import { GoogleGenAI } from "@google/genai";
import { Session } from "../types";

const apiKey = process.env.API_KEY;

export const analyzePatientProgress = async (patientName: string, sessions: Session[]): Promise<string> => {
  if (!apiKey) {
    return "API Key no configurada. No se puede generar el resumen con AI.";
  }

  if (sessions.length === 0) {
    return "No hay sesiones suficientes para realizar un análisis.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Construct the context from sessions
    const sessionText = sessions
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(s => `Fecha: ${s.date}\nNotas: ${s.notes}`)
      .join('\n---\n');

    const prompt = `
      Actúa como un psicólogo clínico senior supervisando un caso.
      Analiza las siguientes notas de sesión del paciente "${patientName}".
      
      Historial de Sesiones:
      ${sessionText}

      Por favor, genera un "Resumen Clínico Evolutivo" breve (máximo 2 párrafos) que destaque:
      1. Temas recurrentes o patrones de comportamiento.
      2. Progreso percibido (o estancamiento).
      3. Recomendación para la siguiente sesión.
      
      Usa un tono profesional, empático y clínico.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "No se pudo generar el análisis.";
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return "Error al conectar con el servicio de IA. Intente nuevamente más tarde.";
  }
};