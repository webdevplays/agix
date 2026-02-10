import {
  beautifyCode,
  BeautifyCodeInput,
} from '@/ai/flows/beautify-code-flow';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body: BeautifyCodeInput = await req.json();

    const result = await beautifyCode(body);

    return NextResponse.json(result);
  } catch (e: any) {
    return new NextResponse(
      JSON.stringify({ error: e.message || 'An error occurred during beautification.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
