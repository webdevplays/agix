'use server';
/**
 * @fileOverview An AI flow for beautifying code.
 *
 * - beautifyCode - A function that takes a code string and returns a formatted version.
 * - BeautifyCodeInput - The input type for the beautifyCode function.
 * - BeautifyCodeOutput - The return type for the beautifyCode function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const BeautifyCodeInputSchema = z.object({
  code: z.string().describe('The code to be beautified.'),
  language: z.string().describe('The programming language of the code (e.g., "html", "css", "javascript").'),
});
export type BeautifyCodeInput = z.infer<typeof BeautifyCodeInputSchema>;

const BeautifyCodeOutputSchema = z.object({
  beautifiedCode: z.string().describe('The formatted and beautified code.'),
});
export type BeautifyCodeOutput = z.infer<typeof BeautifyCodeOutputSchema>;

export async function beautifyCode(
  input: BeautifyCodeInput
): Promise<BeautifyCodeOutput> {
  return beautifyCodeFlow(input);
}

const beautifyPrompt = ai.definePrompt({
  name: 'beautifyPrompt',
  input: { schema: BeautifyCodeInputSchema },
  output: { schema: BeautifyCodeOutputSchema },
  prompt: `You are a code formatter. Your task is to take a snippet of code and beautify it.
  
**RULES:**
1.  Format the code according to standard conventions for the given language.
2.  Use 2-space indentation.
3.  Ensure consistent spacing and line breaks.
4.  Do not add, remove, or change any part of the code's logic. Only format it.
5.  Return ONLY the raw, beautified code in the 'beautifiedCode' field. Do not include any explanations.

Language: {{{language}}}
Code to format:
\`\`\`
{{{code}}}
\`\`\`
`,
});

const beautifyCodeFlow = ai.defineFlow(
  {
    name: 'beautifyCodeFlow',
    inputSchema: BeautifyCodeInputSchema,
    outputSchema: BeautifyCodeOutputSchema,
  },
  async (input) => {
    const { output } = await beautifyPrompt(input);
    if (!output) {
      return {
        beautifiedCode: input.code, // return original code on failure
      };
    }
    return output;
  }
);
