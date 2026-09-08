import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Lazy initialize Google GenAI SDK
  let aiClient: GoogleGenAI | null = null;
  function getAiClient(): GoogleGenAI {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('مفتاح GEMINI_API_KEY غير مهيأ في بيئة العمل. يرجى تفعيله من قائمة الإعدادات (Settings > Secrets).');
      }
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    }
    return aiClient;
  }

  async function generateAiContent(prompt: string) {
    const ai = getAiClient();
    const modelsToTry = ['gemini-3.5-flash', 'gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-flash-latest'];
    let lastError: any = null;
    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
        });
        return { text: response.text, model };
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} warning:`, err?.message || err);
      }
    }
    throw lastError || new Error('تعذر معالجة الطلب عبر نماذج الذكاء الاصطناعي');
  }

  // Health Check Endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ 
      status: 'ok', 
      model: 'gemini-3.5-flash',
      hasApiKey: !!process.env.GEMINI_API_KEY 
    });
  });

  // Smart Student Progress Analysis powered by Gemini
  app.post('/api/ai/analyze-student', async (req: Request, res: Response) => {
    try {
      const { 
        studentName, 
        currentRub, 
        completedRubCount, 
        gradeStats, 
        recentNotes, 
        promptInstruction 
      } = req.body;

      const prompt = `أنت المساعد القرآني والتربوي الذكي لحلقات تحفيظ القرآن الكريم وتعمل بنماذج الذكاء الاصطناعي من Google (Gemini).

بيانات الطالب في الحلقة:
- اسم الطالب: ${studentName || 'الطالب'}
- موضع الحفظ الحالي: الربع ${currentRub || 1} من أصل 240 ربعاً (المصحف كاملاً)
- إجمالي الأرباع المنجزة: ${completedRubCount || 0} ربعاً
- ملخص درجات التسميع الأخيرة: ${JSON.stringify(gradeStats || {})}
- ملاحظات المعلم والمشرف الأخيرة: ${Array.isArray(recentNotes) && recentNotes.length > 0 ? recentNotes.join(' - ') : 'لا توجد ملاحظات مسجلة'}

طلب التحليل: ${promptInstruction || 'قدم تقييماً دقيقاً لمستوى تقدم الطالب، مع توجيهات تربوية عملية لتثبيت الأرباع السابقة ورفع جودة التسميع والورد اليومي.'}

المطلوب:
1. تقييم موجز لمستوى الحفظ والأداء العام.
2. نصائح عملية للطالب لضبط المتشابهات والتجويد في أرباعه الحالية.
3. مقترح للورد اليومي لتثبيت الحفظ القديم ومنع التفلت.
يرجى الكتابة بلغة عربية فصيحة ومحفزة وبنقاط واضحة ومختصرة.`;

      const result = await generateAiContent(prompt);

      res.json({ 
        analysis: result.text,
        model: result.model,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Error analyzing student with Gemini:', error);
      res.status(500).json({ 
        error: error.message || 'حدث خطأ أثناء الاتصال بنموذج الذكاء الاصطناعي',
        isKeyMissing: !process.env.GEMINI_API_KEY
      });
    }
  });

  // Circle Strategic Report for Supervisors powered by Gemini
  app.post('/api/ai/circle-report', async (req: Request, res: Response) => {
    try {
      const { 
        totalStudents, 
        activeStudents, 
        totalCompletedRubs, 
        gradesDistribution, 
        revisionCompletionRate,
        customQuery 
      } = req.body;

      const prompt = `أنت الخبير القرآني والمستشار التربوي لإدارة حلقات تحفيظ القرآن الكريم وتعمل بنماذج (Gemini).

إحصائيات الحلقة القرآنية العامة:
- إجمالي عدد الطلاب: ${totalStudents || 0}
- عدد الطلاب النشطين: ${activeStudents || 0}
- مجموع الأرباع المحفوظة في الحلقة: ${totalCompletedRubs || 0}
- توزيع تقديرات جلسات التسميع: ${JSON.stringify(gradesDistribution || {})}
- نسبة الالتزام بالورد اليومي (المراجعة الذاتية): ${revisionCompletionRate || 0}%

الاستفسار المطلوب: ${customQuery || 'قدم تقريراً إشرافياً شاملاً يلخص نقاط القوة في الحلقة، مع 3 توصيات استراتيجية لرفع همم الطلاب ونسب التسميع الممتاز.'}

المطلوب:
- ملخص تنفيذي لأداء الحلقة.
- أبرز المؤشرات الإيجابية ونقاط التحسين.
- خطة عمل عملية للمشرف خلال الأسابيع القادمة.
اكتب التقرير بأسلوب احترافي وتربوي مشرق.`;

      const result = await generateAiContent(prompt);

      res.json({ 
        report: result.text,
        model: result.model,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Error generating circle report with Gemini:', error);
      res.status(500).json({ 
        error: error.message || 'حدث خطأ أثناء توليد تقرير الحلقة عبر Gemini',
        isKeyMissing: !process.env.GEMINI_API_KEY
      });
    }
  });

  // Quranic Teaching & Tajweed Assistant Q&A
  app.post('/api/ai/assistant-chat', async (req: Request, res: Response) => {
    try {
      const { message, context } = req.body;

      if (!message || typeof message !== 'string') {
        res.status(400).json({ error: 'يرجى تقديم رسالة السؤال' });
        return;
      }

      const prompt = `أنت "مساعد حلقة جامع السرور الذكي" المعتمد على نماذج الذكاء الاصطناعي من Google (Gemini).
مهمتك: مساعدة المشرفين والمعلمين والطلاب في إدارة وتلاوة وتجويد وحفظ القرآن الكريم وفق المنهجية المعتمدة (تسميع 4 أرباع في الجلسة: ربع جديد + 3 أرباع ماضية، وورد يومي متدرج حتى 24 ربعاً = 3 أجزاء يومياً).

السياق الإضافي: ${context || 'استفسار عام'}
سؤال المستخدم: ${message}

أجب بدقة وفائدة تربوية وقرآنية رفيعة بلغة عربية واضحة وميسرة.`;

      const result = await generateAiContent(prompt);

      res.json({ 
        reply: result.text,
        model: result.model
      });
    } catch (error: any) {
      console.error('Error in AI assistant chat:', error);
      res.status(500).json({ 
        error: error.message || 'تعذر الحصول على إجابة من Gemini',
        isKeyMissing: !process.env.GEMINI_API_KEY
      });
    }
  });

  // Vite middleware for development vs Static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : undefined
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Quran Circle Tracker Server with Gemini 3.5 Flash running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
