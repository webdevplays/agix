'use server';
/**
 * @fileOverview An AI flow for explaining code.
 *
 * - explainCode - A function that takes a code string and returns an explanation.
 * - ExplainCodeInput - The input type for the explainCode function.
 * - ExplainCodeOutput - The return type for the explainCode function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ExplainCodeInputSchema = z.object({
  code: z.string().describe('The code to be explained.'),
  language: z.string().describe('The programming language of the code (e.g., "html", "css", "javascript").'),
});
export type ExplainCodeInput = z.infer<typeof ExplainCodeInputSchema>;

const ExplainCodeOutputSchema = z.object({
  explanation: z.string().describe('A detailed explanation of the code.'),
});
export type ExplainCodeOutput = z.infer<typeof ExplainCodeOutputSchema>;

export async function explainCode(
  input: ExplainCodeInput
): Promise<ExplainCodeOutput> {
  return explainCodeFlow(input);
}

const explainPrompt = ai.definePrompt({
  name: 'explainPrompt',
  input: { schema: ExplainCodeInputSchema },
  output: { schema: ExplainCodeOutputSchema },
  prompt: `You are an expert programmer and a friendly code assistant. Your task is to explain the provided code snippet in a clear, concise, and easy-to-understand way.
  
**RULES:**
1.  Start with a high-level summary of what the code does.
2.  Break down the code into logical parts and explain each one.
3.  If there are any complex or non-obvious parts, explain them in more detail.
4.  The response should be formatted as simple text. Do not use Markdown.
5.  Be friendly and encouraging.

Language: {{{language}}}
Code to explain:
\`\`\`
{{{code}}}
\`\`\`
`,
});

const explainCodeFlow = ai.defineFlow(
  {
    name: 'explainCodeFlow',
    inputSchema: ExplainCodeInputSchema,
    outputSchema: ExplainCodeOutputSchema,
  },
  async (input) => {
    const { output } = await explainPrompt(input);
    if (!output) {
      throw new Error('AI failed to generate an explanation.');
    }
    return output;
  }
);
