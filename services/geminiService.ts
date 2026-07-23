
import { GoogleGenAI, Type } from "@google/genai";
import { AttendanceRecord, Student, AIInsight, StudySchedule } from "../types";

const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY || "missing_key" });
export async function getAttendanceInsights(
  records: AttendanceRecord[],
  students: Student[]
): Promise<AIInsight> {
  const dataForAi = records.map(r => ({
    date: r.date,
    student: students.find(s => s.id === r.studentId)?.name || 'Unknown',
    status: r.status
  }));

  const prompt = `Analyze the following student attendance data for Happy Chandara School.
  Identify trends, students at risk of chronic absenteeism, and provide a summary report for the teacher.
  
  Attendance Data:
  ${JSON.stringify(dataForAi, null, 2)}`;

  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            riskStudents: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  studentId: { type: Type.STRING },
                  studentName: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  riskLevel: { type: Type.STRING, enum: ["High", "Medium", "Low"] }
                },
                required: ["studentName", "reason", "riskLevel"]
              }
            },
            trends: { type: Type.STRING }
          },
          required: ["summary", "riskStudents", "trends"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Insights Error:", error);
    return {
      summary: "Attendance is generally stable.",
      riskStudents: [],
      trends: "No significant trends detected."
    };
  }
}

export async function getStudySuggestions(schedules: StudySchedule[]): Promise<string> {
  // Calculate hours per subject for the AI to have better context
  const subjectDistribution: Record<string, number> = {};
  schedules.forEach(s => {
    const [h1, m1] = s.start_time.split(':').map(Number);
    const [h2, m2] = s.end_time.split(':').map(Number);
    const durationMins = (h2 * 60 + m2) - (h1 * 60 + m1);
    const durationHours = durationMins / 60;
    
    subjectDistribution[s.subject_name] = (subjectDistribution[s.subject_name] || 0) + (s.is_completed ? durationHours : 0);
  });

  const prompt = `Review this student's weekly study progress for Happy Chandara School. 
  Provide specific, actionable advice (e.g., "You studied Math for only 1 hour, consider increasing it"). 
  Keep it encouraging and brief (under 80 words).
  
  Completed Study Hours by Subject:
  ${JSON.stringify(subjectDistribution, null, 2)}
  
  All Planned Sessions:
  ${JSON.stringify(schedules.map(s => ({ subj: s.subject_name, date: s.date, completed: s.is_completed })))}
  `;

  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    return response.text || "You're off to a great start! Try to balance your core subjects like Khmer and Math.";
  } catch (error) {
    return "Keep up the hard work! Consistency is the key to mastering your subjects.";
  }
}
