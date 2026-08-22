import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

function json(res: VercelResponse, status: number, body: unknown) {
  return res.status(status).json(body);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { error: 'Method not allowed' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return json(res, 503, { error: 'AI service is not configured' });
  }

  let body: unknown;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return json(res, 400, { error: 'Invalid JSON body' });
  }

  if (!body || typeof body !== 'object') {
    return json(res, 400, { error: 'Request body must be an object' });
  }

  const { eventData } = body as { eventData?: unknown };
  if (!eventData) {
    return json(res, 400, { error: 'eventData is required' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `You are Glowify AI, an assistant for a beauty and commerce SaaS platform. Analyze the supplied business event data and return concise, actionable insights for the store operator. Do not invent facts. Return valid JSON with keys: summary, insights, recommendedActions. Event data: ${JSON.stringify(eventData)}`,
            },
          ],
        },
      ],
    });

    return json(res, 200, {
      success: true,
      analysis: response.text ?? '',
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    });
  } catch (error) {
    console.error('Glowify AI analysis failed', error);
    return json(res, 502, { error: 'AI analysis failed' });
  }
}
