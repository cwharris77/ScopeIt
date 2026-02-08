/**
 * Gemini AI service for task performance analysis
 * Ported from web app
 */

import { Task } from '@/lib/supabase';
import { GoogleGenAI, Type } from '@google/genai';

export interface AIAnalysis {
  summary: string;
  accuracyRating: number; // 0 to 100
  insights: string[];
  recommendations: string[];
}

// Initialize the Gemini client
const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('Gemini API key not configured');
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeTaskPerformance = async (tasks: Task[]): Promise<AIAnalysis | null> => {
  const ai = getAI();
  if (!ai) return null;

  if (tasks.length === 0) return null;

  const completedTasks = tasks.filter((t) => t.status === 'completed');
  if (completedTasks.length === 0) return null;

  const taskDataSummary = completedTasks.map((t) => ({
    title: t.name,
    category: t.category || 'Uncategorized',
    expectedMin: t.estimated_minutes,
    actualMin: Math.round((t.actual_seconds || 0) / 60),
  }));

  const prompt = `Analyze these task completion data points for a productivity user. 
  Compare their expected vs actual times. 
  Identify patterns (e.g., they are always 20% over on "Coding", but under on "Meetings").
  Provide helpful, encouraging advice to improve their "scoping" accuracy.
  
  Data: ${JSON.stringify(taskDataSummary)}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            accuracyRating: { type: Type.NUMBER },
            insights: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
        },
      },
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as AIAnalysis;
  } catch (error) {
    console.error('Gemini Analysis Error:', error);
    return null;
  }
};
