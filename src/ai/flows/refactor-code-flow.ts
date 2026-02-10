'use server';
/**
 * @fileOverview An AI flow for refactoring and improving code.
 *
 * - refactorCode - A function that takes code and instructions and returns refactored code.
 * - RefactorCodeInput - The input type for the refactorCode function.
 * - RefactorCodeOutput - The return type for the refactorCode function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { beautifyCode } from './beautify-code-flow';


const RefactorCodeInputSchema = z.object({
  code: z.string().describe('The code to be refactored.'),
  language: z.string().describe('The programming language of the code (e.g., "html", "css", "javascript").'),
  instructions: z.string().describe('The user\'s instructions for how to refactor the code.'),
});
export type RefactorCodeInput = z.infer<typeof RefactorCodeInputSchema>;

const RefactorCodeOutputSchema = z.object({
  refactoredCode: z.string().describe('The refactored and improved code.'),
});
export type RefactorCodeOutput = z.infer<typeof RefactorCodeOutputSchema>;

export async function refactorCode(
  input: RefactorCodeInput
): Promise<RefactorCodeOutput> {
  return refactorCodeFlow(input);
}

const refactorPrompt = ai.definePrompt({
  name: 'refactorPrompt',
  input: { schema: RefactorCodeInputSchema },
  output: { schema: RefactorCodeOutputSchema },
  prompt: `You are an expert programmer. Your task is to refactor the given code based on the user's instructions.
  
**RULES:**
1.  Strictly follow the user's instructions for the refactoring.
2.  Improve the code's quality, readability, and performance where possible, even if not explicitly asked.
3.  When working with HTML/CSS, ensure the final result is responsive and mobile-friendly.
4.  Do not change the core logic unless instructed to.
5.  Return ONLY the raw, complete, refactored code in the 'refactoredCode' field. Do not include any explanations, apologies, or markdown formatting.

Language: {{{language}}}
Instructions: {{{instructions}}}

Code to refactor:
\`\`\`
{{{code}}}
\`\`\`
`,
});

const refactorCodeFlow = ai.defineFlow(
  {
    name: 'refactorCodeFlow',
    inputSchema: RefactorCodeInputSchema,
    outputSchema: RefactorCodeOutputSchema,
  },
  async (input) => {
    const { output } = await refactorPrompt(input);
    if (!output) {
      throw new Error('AI failed to refactor the code.');
    }

    // Beautify the result to ensure it's clean
    const beautifiedResult = await beautifyCode({
        code: output.refactoredCode,
        language: input.language
    });

    return {
        refactoredCode: beautifiedResult.beautifiedCode
    };
  }
);
