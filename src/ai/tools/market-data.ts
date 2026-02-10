
'use server';
/**
 * @fileOverview A tool for fetching real-time market data for cryptocurrencies using the CoinGecko API.
 *
 * - getTokenInfo - A Genkit tool that fetches price and other information for any cryptocurrency.
 * - getNewPairs - A Genkit tool that fetches the latest coins added to CoinGecko.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import 'dotenv/config';

const GetTokenInfoInputSchema = z.object({
  tokenSymbolOrName: z.string().describe('The symbol or name of the cryptocurrency (e.g., "SOL", "Bitcoin", "WhiteWhale").'),
});

const GetTokenInfoOutputSchema = z.object({
  found: z.boolean().describe('Whether the token was found.'),
  id: z.string().optional().describe('The CoinGecko ID of the token.'),
  symbol: z.string().optional().describe('The symbol of the token.'),
  name: z.string().optional().describe('The name of the token.'),
  priceUsd: z.number().optional().describe('The price of the token in USD.'),
  explorerUrl: z.string().optional().describe('A link to a block explorer for the token.'),
  pairAddress: z.string().optional().describe('The pair address for charting on DexScreener (if available on Solana).')
});


export const getTokenInfo = ai.defineTool(
  {
    name: 'getTokenInfo',
    description: 'Gets the price and other market information for any given cryptocurrency symbol or name from CoinGecko. Can also find chartable pairs on Solana.',
    inputSchema: GetTokenInfoInputSchema,
    outputSchema: GetTokenInfoOutputSchema,
  },
  async (input) => {
    const { tokenSymbolOrName } = input;
    const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;
    const headers = { 'x-cg-demo-api-key': COINGECKO_API_KEY || '' };

    try {
      // 1. Search for the coin by name or symbol to get its CoinGecko ID
      const searchResponse = await fetch(`https://api.coingecko.com/api/v3/search?query=${tokenSymbolOrName}`, { headers });
      if (!searchResponse.ok) {
        console.error('CoinGecko search API error:', await searchResponse.text());
        return { found: false };
      }
      const searchData = await searchResponse.json();
      if (!searchData.coins || searchData.coins.length === 0) {
        return { found: false };
      }

      // Find the best match from search results
      const coin = searchData.coins.find((c: any) => c.symbol.toUpperCase() === tokenSymbolOrName.toUpperCase() || c.name.toUpperCase() === tokenSymbolOrName.toUpperCase()) || searchData.coins[0];
      const coinId = coin.id;

      // 2. Get detailed market data using the coin ID
      const marketResponse = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinId}`, { headers });
      if (!marketResponse.ok) {
        console.error('CoinGecko markets API error:', await marketResponse.text());
        return { found: false };
      }
      const marketData = await marketResponse.json();
      if (!marketData || marketData.length === 0) {
        return { found: false };
      }
      const tokenData = marketData[0];
      
      let explorerUrl: string | undefined;
      let pairAddress: string | undefined;

      // 3. (Solana specific) get contract address for explorer link and DexScreener search
      if (coin.asset_platform_id === 'solana' || tokenSymbolOrName.toLowerCase() === 'solana') {
          const coinDetailsResponse = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`, { headers });
          if (coinDetailsResponse.ok) {
              const coinDetails = await coinDetailsResponse.json();
              const contractAddress = coinDetails.platforms?.solana;
              if (contractAddress) {
                  explorerUrl = `https://solscan.io/token/${contractAddress}`;
                  // Try to find a chartable pair on DexScreener
                  const dexResponse = await fetch(`https://api.dexscreener.com/v1/dex/tokens/${contractAddress}`);
                  if(dexResponse.ok) {
                    const dexData = await dexResponse.json();
                    if(dexData.pairs && dexData.pairs.length > 0) {
                        // Prefer USDC or SOL pairs
                        const preferredPair = dexData.pairs.find((p:any) => p.quoteToken.symbol === 'USDC') || dexData.pairs.find((p:any) => p.quoteToken.symbol === 'SOL') || dexData.pairs[0];
                        pairAddress = preferredPair.pairAddress;
                    }
                  }
              } else {
                 explorerUrl = 'https://solscan.io/'; // For native SOL
              }
          }
      }

      return {
        found: true,
        id: tokenData.id,
        symbol: tokenData.symbol.toUpperCase(),
        name: tokenData.name,
        priceUsd: tokenData.current_price,
        explorerUrl: explorerUrl,
        pairAddress: pairAddress
      };

    } catch (error) {
      console.error(`Error fetching token info from CoinGecko for ${tokenSymbolOrName}:`, error);
      return { found: false };
    }
  }
);


const NewPairSchema = z.object({
  symbol: z.string().describe('The symbol of the token.'),
  name: z.string().describe('The name of the token.'),
  id: z.string().describe('The CoinGecko ID of the token.'),
});

const GetNewPairsOutputSchema = z.object({
  pairs: z.array(NewPairSchema),
});

export const getNewPairs = ai.defineTool(
  {
    name: 'getNewPairs',
    description: 'Fetches the most recently added coins on CoinGecko. Useful for finding new or potential tokens.',
    outputSchema: GetNewPairsOutputSchema,
  },
  async () => {
    const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;
    const headers = { 'x-cg-demo-api-key': COINGECKO_API_KEY || '' };

    try {
      const response = await fetch('https://api.coingecko.com/api/v3/coins/list?include_platform=false', { headers });
      if (!response.ok) {
        console.error('CoinGecko new coins API error:', await response.text());
        return { pairs: [] };
      }
      const data = await response.json();
      if (!data || data.length === 0) {
        return { pairs: [] };
      }
      
      // Get the last 10 coins added
      const newPairs = data.slice(-10).map((coin: any) => ({
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        id: coin.id,
      }));

      return { pairs: newPairs.reverse() }; // Reverse to show newest first
    } catch (error) {
      console.error('Error fetching new pairs from CoinGecko:', error);
      return { pairs: [] };
    }
  }
);
