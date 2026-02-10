import {
  refactorCode,
  RefactorCodeInput,
} from '@/ai/flows/refactor-code-flow';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 540;

export async function POST(req: NextRequest) {
  try {
    const body: RefactorCodeInput = await req.json();

    const result = await refactorCode(body);

    return NextResponse.json(result);
  } catch (e: any) {    
    return new NextResponse(
      JSON.stringify({ error: e.message || 'An error occurred during refactoring.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
