import {
  explainCode,
  ExplainCodeInput,
} from '@/ai/flows/explain-code-flow';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 540;

export async function POST(req: NextRequest) {
  try {
    const body: ExplainCodeInput = await req.json();

    const result = await explainCode(body);

    return NextResponse.json(result);
  } catch (e: any) {
    return new NextResponse(
      JSON.stringify({ error: e.message || 'An error occurred during code explanation.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
