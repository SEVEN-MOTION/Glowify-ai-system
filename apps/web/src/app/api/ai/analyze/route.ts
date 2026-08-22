import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { db } from '@/lib/firebase-admin';
import { requireStoreAccess } from '@/lib/server-auth';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { storeId, eventData } = await req.json();
    const auth = await requireStoreAccess(req, storeId);
    if ('response' in auth) return auth.response;

    const model = ai.models.generateContent({
      model: 'gemini-2.0-flash',
      config: {
        systemInstruction: `You are the "Glowify Autonomous Fleet Operator" managing "NEUROZEN LAB" (selling Lion's Mane, Reishi, and Cordyceps supplements). 
        Your primary goal is to protect profit margins and prevent stockouts. 
        Analyze the incoming store event and decide on necessary operational actions.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            reasoning: { type: 'string' },
            actionTaken: { type: 'string', enum: ['QUANTITY_RESTOCK_TRIGGERED', 'PRICE_TIER_ADJUSTED', 'NO_ACTION_REQUIRED'] },
            impactScore: { type: 'integer' },
          },
          required: ['reasoning', 'actionTaken', 'impactScore'],
        },
      },
    });

    const result = await model.generateContent(JSON.stringify(eventData));
    const analysis = JSON.parse(result.text());

    // Append telemetry to Firestore only after tenant authorization succeeds.
    await db.collection('stores')
      .doc(storeId)
      .collection('agent_telemetry')
      .add({
        ...analysis,
        timestamp: new Date().toISOString(),
        eventContext: eventData,
      });

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('AI Analysis Error:', error);
    return NextResponse.json({ error: 'Failed to process AI analysis' }, { status: 500 });
  }
}
