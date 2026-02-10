import {
  generateWebsite,
  GenerateComponentInput,
} from '@/ai/flows/website-builder-flow';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 540; // Increase the timeout to 540 seconds (9 minutes)

export async function POST(req: NextRequest) {
  try {
    const body: GenerateComponentInput = await req.json();

    const result = await generateWebsite(body);

    return NextResponse.json(result);
  } catch (e: any) {
    // Check if the response seems to be HTML, which indicates a server error page
    if (e instanceof SyntaxError && e.message.includes("Unexpected token '<'")) {
      return new NextResponse(
        JSON.stringify({ error: "The AI server returned an unexpected response. This can happen during high load or for very complex requests. Please try again." }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    return new NextResponse(
      JSON.stringify({ error: e.message || 'An error occurred.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
