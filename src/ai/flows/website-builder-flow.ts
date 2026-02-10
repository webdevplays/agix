'use server';
/**
 * @fileOverview An AI flow for generating and modifying multi-file websites.
 *
 * - generateWebsite - A function that takes a user prompt and project files, and returns updated files and a message.
 * - websiteBuilderFlow - The Genkit flow for generating and modifying the website.
 * - GenerateComponentInput - The input type for the generateWebsite function.
 * - GenerateWebsiteOutput - The return type for the generateWebsite function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { beautifyCode } from './beautify-code-flow';

const FileSchema = z.object({
  name: z.string().describe('The full path/name of the file.'),
  content: z.string().describe('The content of the file.'),
});

const GenerateComponentInputSchema = z.object({
  prompt: z
    .string()
    .describe("A user's description of what to build or modify."),
  files: z.array(FileSchema).describe('The current state of the project files.'),
});
export type GenerateComponentInput = z.infer<
  typeof GenerateComponentInputSchema
>;

const GenerateWebsiteOutputSchema = z.object({
  files: z.array(FileSchema).describe("A list of files that have been created, modified, or deleted."),
  message: z.string().describe("The AI's response to the user."),
});
export type GenerateWebsiteOutput = z.infer<
  typeof GenerateWebsiteOutputSchema
>;

export async function generateWebsite(
  input: GenerateComponentInput
): Promise<GenerateWebsiteOutput> {
  return websiteBuilderFlow(input);
}

export const websiteBuilderPrompt = ai.definePrompt({
  name: 'websiteBuilderPrompt',
  input: { schema: GenerateComponentInputSchema },
  output: { schema: GenerateWebsiteOutputSchema },
  prompt: `You are an expert AI web developer. Your user is building a website and you will help them by creating, modifying, or deleting files.

**USER'S REQUEST:**
"{{{prompt}}}"

**CURRENT PROJECT FILES:**
{{#if files.length}}
  {{#each files}}
    \`\`\`{{name}}
    {{{content}}}
    \`\`\`
  {{/each}}
{{else}}
  This is a new project.
{{/if}}

**DEVELOPMENT GUIDELINES (VERY IMPORTANT):**
1.  **Mobile-First Responsive Design:** Your top priority is to ensure the website is fully responsive and looks exceptional on all devices.
    *   **Layout:** Use modern CSS like Flexbox and CSS Grid for flexible layouts.
    *   **Navigation:** For mobile screens, implement a "hamburger" menu or a similar collapsible navigation pattern to save space and provide a clean user experience. Do not create horizontal navigation bars that will overflow on small screens.
    *   **Breakpoints:** Use media queries (\`@media\`) to adjust styles for different screen sizes (e.g., mobile, tablet, desktop).
2.  **Clean, Formatted Code:** Your code must be clean, well-structured, and perfectly formatted. Use 2-space indentation. This is not optional; the output must be beautiful and ready for production.
3.  **Modern Web Standards:** Use semantic HTML5 tags (e.g., \`<header>\`, \`<nav>\`, \`<main>\`, \`<footer>\`) and modern CSS3 features. Ensure the website is accessible by using ARIA attributes where appropriate.

**YOUR TASK:**
Analyze the user's request and the current files to determine what changes are needed.

**OUTPUT INSTRUCTIONS (VERY IMPORTANT):**
Your response MUST be a JSON object containing "files" and "message".
1.  \`message\`: A friendly message to the user explaining the changes you made.
2.  \`files\`: An array containing ONLY the files you need to change.
    *   **To CREATE or UPDATE a file:** Include an object with its \`name\` and the full new \`content\`.
    *   **To DELETE a file:** Include an object with its \`name\` and the \`content\` set to the exact string "DELETE".
    *   **DO NOT include any files that were not changed.** This is critical to avoid errors and timeouts.

Example response for modifying one file and deleting another:
\`\`\`json
{
  "files": [
    {
      "name": "index.html",
      "content": "<!DOCTYPE html>..."
    },
    {
      "name": "old-style.css",
      "content": "DELETE"
    }
  ],
  "message": "I've updated your homepage and removed the old stylesheet."
}
\`\`\`
`,
});

export const websiteBuilderFlow = ai.defineFlow(
  {
    name: 'websiteBuilderFlow',
    inputSchema: GenerateComponentInputSchema,
    outputSchema: GenerateWebsiteOutputSchema,
  },
  async (input) => {
    const { output } = await websiteBuilderPrompt(input);
    if (!output?.files) {
      return {
        files: [],
        message: "I'm sorry, I couldn't process that request. Please try rephrasing it.",
      };
    }
    
    // Beautify each generated/modified file
    const beautifiedFiles = await Promise.all(
      output.files.map(async (file) => {
        if (file.content === 'DELETE' || file.name.endsWith('.json')) {
            return file; // Don't format deleted files or JSON
        }
        
        const extension = file.name.split('.').pop()?.toLowerCase();
        let language;
        if (extension === 'html') language = 'html';
        else if (extension === 'css') language = 'css';
        else if (extension === 'js' || extension === 'jsx' || extension === 'ts' || extension === 'tsx') language = 'javascript';
        else {
            return file; // Don't try to beautify unknown file types
        }

        try {
          const beautifiedResult = await beautifyCode({
            code: file.content,
            language: language,
          });
          return { ...file, content: beautifiedResult.beautifiedCode };
        } catch (e) {
          console.error(`Failed to beautify ${file.name}, returning original.`, e);
          return file; // return original on failure
        }
      })
    );

    return {
      files: beautifiedFiles,
      message: output.message || "Here are the changes I've made.",
    };
  }
);
