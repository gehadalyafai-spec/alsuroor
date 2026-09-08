/**
 * Client service to communicate with server-side Gemini 3.8 Flash endpoints
 */

export interface StudentAnalysisRequest {
  studentName: string;
  currentRub: number;
  completedRubCount: number;
  gradeStats?: Record<string, number>;
  recentNotes?: string[];
  promptInstruction?: string;
}

export interface CircleReportRequest {
  totalStudents: number;
  activeStudents: number;
  totalCompletedRubs: number;
  gradesDistribution?: Record<string, number>;
  revisionCompletionRate?: number;
  customQuery?: string;
}

export async function analyzeStudentWithGemini(data: StudentAnalysisRequest): Promise<{ analysis: string; model: string }> {
  const res = await fetch('/api/ai/analyze-student', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error || 'فشل الاتصال بخدمة الذكاء الاصطناعي (Gemini 3.8 Flash)');
  }
  return body;
}

export async function generateCircleReportWithGemini(data: CircleReportRequest): Promise<{ report: string; model: string }> {
  const res = await fetch('/api/ai/circle-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error || 'فشل توليد التقرير من نموذج الذكاء الاصطناعي');
  }
  return body;
}

export async function askAiAssistant(message: string, context?: string): Promise<{ reply: string; model: string }> {
  const res = await fetch('/api/ai/assistant-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, context }),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error || 'فشل إرسال السؤال إلى مساعد الذكاء الاصطناعي');
  }
  return body;
}
