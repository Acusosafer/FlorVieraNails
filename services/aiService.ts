
import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `Eres "Flori", la asistente virtual amorosa de Flor Viera Nails & Makeup. 
Tu tono es extremadamente cálido, dulce, femenino y profesional. 
Siempre llamas a las clientas "Reina", "Diosa", "Linda" o por su nombre seguido de un emoji de corazón 💖.
Respondes dudas sobre servicios de uñas y maquillaje. 
Si preguntan por precios, diles que pueden verlos en la sección de reservas.
Tu misión principal es ser amable y SIEMPRE terminar con un llamado a la acción para que agenden su turno.
No uses respuestas muy largas. Usa emojis como 💅, ✨, 🌸, 💖.`;

export const getAIResponse = async (prompt: string, clientName: string = "Reina") => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION.replace("Reina", clientName),
      },
    });
    return response.text;
  } catch (error) {
    console.error("AI Error:", error);
    return "¡Hola Reina! 💖 Tuve un pequeño problemita técnico, pero acá estoy. ¿En qué puedo ayudarte con tus uñitas hoy? ✨💅";
  }
};
