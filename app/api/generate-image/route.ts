import {
  generateImage,
  GenerateImageInput,
} from '@/ai/flows/generate-image-flow';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const body: GenerateImageInput = await req.json();

    const result = await generateImage(body);

    return NextResponse.json(result);
  } catch (e: any) {
    return new NextResponse(
      JSON.stringify({ error: e.message || 'An error occurred during image generation.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
