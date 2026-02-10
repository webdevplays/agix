
'use server';
/**
 * @fileOverview A simple AI chat flow.
 *
 * - chat - A function that handles the chat interaction.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
 */

import { ai } from '@/ai/genkit';
import { getTokenInfo, getNewPairs } from '@/ai/tools/market-data';
import { z } from 'zod';

const ChatInputSchema = z.object({
  message: z.string().describe('The user message.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  message: z.string().describe('The AI response.'),
  chartInfo: z
    .object({
      pairAddress: z.string(),
      symbol: z.string(),
    })
    .optional()
    .describe('Information to display a token chart, if requested.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatPrompt',
  input: { schema: ChatInputSchema },
  output: { schema: ChatOutputSchema },
  tools: [getTokenInfo, getNewPairs],
  prompt: `You are an AI assistant for The Black Testicle, a decentralized finance platform. Your name is "BLASTICLE".
You are an expert on the Solana (SOL) cryptocurrency and its entire ecosystem. You can answer questions about any token, including brand new ones.
If a user asks about anything other than cryptocurrency, you MUST politely decline.
If the user asks for the price, contract address, chart, or any details for ANY token by its name or symbol, you MUST use the getTokenInfo tool to get the current information. Do not guess or use prior knowledge.
If the user asks for suggestions, potential tokens, new tokens, or what's hot, you MUST use the getNewPairs tool to provide a list of new tokens.
If the getTokenInfo tool returns 'found: false', you MUST inform the user that you could not find information for that token. Do not make up information or apologize. Just state the fact.
When providing token details from the getTokenInfo tool, you MUST include the price and the explorer URL if they are available.
If the user specifically asks for a chart of any Solana token, use the getTokenInfo tool to find its pair address and include the chartInfo in your response. The chart is from DexScreener, so it will only work for tokens on a DEX.
When returning a chart, you can also provide a brief message like "Here is the chart for [symbol]".
When suggesting tokens from the getNewPairs tool, present them as a list.
You are helpful, friendly, and knowledgeable about Solana, its technology, DeFi on Solana, and the broader crypto ecosystem.
Keep your answers concise and to the point.
The user said: {{{message}}}`,
});

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      return {
        message: 'Sorry, I encountered an error and could not get a response.',
      };
    }
    return output;
  }
);
