'use client';

import { Button } from '@/components/ui/button';
import { CodePreview } from '@/components/code-preview';
import { ArrowLeft, Bot, Code, IterationCcw, User, Eye, Sparkles, Download, BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function WhitepaperPage() {
    const exampleCode = `
export const websiteBuilderPrompt = ai.definePrompt({
  name: 'websiteBuilderPrompt',
  input: { schema: GenerateComponentInputSchema },
  output: { schema: GenerateWebsiteOutputSchema },
  prompt: \`You are an expert AI web developer...

**USER'S REQUEST:**
"{{{prompt}}}"

**CURRENT PROJECT FILES:**
{{#each files}}
  \`\`\`{{name}}
  {{{content}}}
  \`\`\`
{{/each}}

**DEVELOPMENT GUIDELINES (VERY IMPORTANT):**
1.  **Mobile-First Responsive Design:** Your top priority is...
2.  **Clean, Formatted Code:** Your code must be...
3.  **Modern Web Standards:** Use semantic HTML5...

**OUTPUT INSTRUCTIONS (VERY IMPORTANT):**
Your response MUST be a JSON object containing "files" and "message".
1.  \`message\`: A friendly message explaining the changes.
2.  \`files\`: An array of ONLY the files you need to change.
    *   To CREATE or UPDATE: { name, content }
    *   To DELETE: { name, content: "DELETE" }
\`\`,
});
    `.trim();

    return (
        <ScrollArea className="h-full">
            <main className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <section id="introduction" className="text-center mb-16 animate-in fade-in-50 duration-500">
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl font-headline mb-4">The Agix Cloud AI Whitepaper</h1>
                        <p className="text-xl text-muted-foreground">
                            Bridging the gap between imagination and implementation.
                        </p>
                    </section>

                    <section id="vision" className="mb-16">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-headline mb-6">Our Vision: The Future of Creation</h2>
                        <div className="space-y-4 text-lg text-muted-foreground">
                            <p>
                                In the digital age, the ability to create on the web is a fundamental form of expression and innovation. Yet, for millions, the barrier of technical complexity remains. Traditional web development, with its steep learning curves and intricate syntax, can stifle creativity before an idea even takes its first breath.
                            </p>
                            <p>
                                Agix Cloud AI was born from a simple but powerful question: <strong className="text-foreground">What if building a website was as easy as describing it?</strong> We envision a world where anyone—entrepreneurs, artists, small business owners, and seasoned developers alike—can translate their ideas into fully functional, beautiful websites through natural, conversational language.
                            </p>
                            <p>
                                Our platform is more than just a code generator; it's a collaborative partner. It's an AI that understands context, iterates on feedback, and handles the complexities of modern web development, freeing you to focus on what truly matters: your vision.
                            </p>
                             <p>
                                Agix Cloud AI transforms your words into code. By simply describing the website you want to build or the changes you want to make, our advanced AI interprets your request and generates the necessary HTML, CSS, and JavaScript. It understands the context of your entire project, allowing for intelligent modifications across multiple files at once. Whether you're starting from scratch or refining an existing design, the platform handles the technical heavy lifting.
                            </p>
                            <p>
                                This conversational approach makes web development accessible to everyone. You can create multi-page layouts, implement responsive designs, and add complex features without writing a single line of code. For developers, it acts as a powerful assistant, accelerating prototyping and handling tedious refactoring tasks, allowing you to build faster and focus on more complex logic.
                            </p>
                        </div>
                    </section>

                    <section id="how-it-works" className="mb-16">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-headline mb-8">The Conversational Development Flow</h2>
                        <div className="space-y-10 relative">
                            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-border -z-10"></div>
                            
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                                    <User className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl mb-1">1. The Prompt: From Idea to Instruction</h3>
                                    <p className="text-muted-foreground">The journey begins in the chat interface. The user describes their goal in plain English—"Create a minimalist portfolio with a dark theme and a contact form," or "Change the hero section button to a vibrant blue." This is the seed of creation.</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                                    <Bot className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl mb-1">2. AI Analysis: Context is King</h3>
                                    <p className="text-muted-foreground">This is where the magic happens. The AI model receives not only the user's prompt but also the entire current project structure—all existing files and their content. It analyzes the request in the context of the project, understanding that "change the button" refers to a specific element in \`index.html\` that is styled by \`style.css\`.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                                    <Code className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl mb-1">3. Generation: Multi-File Modifications</h3>
                                    <p className="text-muted-foreground">The AI doesn't just generate a single block of code. It determines the optimal set of changes across the entire project. This could involve creating a new HTML file, modifying a CSS file, and adding a JavaScript file simultaneously. It returns a precise list of file modifications—creations, updates, or deletions.</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                                    <Eye className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl mb-1">4. Feedback: Instant Visuals</h3>
                                    <p className="text-muted-foreground">The platform's front-end instantly processes the AI's instructions. The file tree is updated, and the live preview refreshes to show the changes in real-time. This immediate visual feedback loop is critical for rapid, intuitive development.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                                    <IterationCcw className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl mb-1">5. Iteration: The Power of Conversation</h3>
                                    <p className="text-muted-foreground">Creation is rarely a single step. The user can continue the conversation to refine the result: "Make the header stick to the top," "Add a hover effect to the gallery images," "Animate the title on scroll." The AI remembers the context, allowing for a continuous, evolving development process.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="mb-16">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-headline mb-4">Key Features: Your Creative Toolkit</h2>
                        <div className="grid md:grid-cols-2 gap-8 mt-8">
                            <div className="flex gap-4">
                                <Sparkles className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-bold text-lg">AI-Powered Refactoring</h3>
                                    <p className="text-muted-foreground">Improve existing code with a single click. Ask the AI to convert CSS to Tailwind, refactor functions for better readability, or optimize for performance.</p>
                                </div>
                            </div>
                             <div className="flex gap-4">
                                <BrainCircuit className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-bold text-lg">Code Explanation</h3>
                                    <p className="text-muted-foreground">Don't understand a piece of code? Let the AI explain it to you in plain English, turning the platform into a powerful learning tool.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <Eye className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-bold text-lg">Instant Live Preview</h3>
                                    <p className="text-muted-foreground">No more switching between your editor and browser. See every change you make, whether by AI or by hand, reflected instantly in a fully interactive preview.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <Download className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-bold text-lg">Full Code Ownership</h3>
                                    <p className="text-muted-foreground">You are never locked in. At any point, you can download a complete, clean, and production-ready ZIP file of your entire project.</p>
                                </div>
                            </div>
                        </div>
                    </section>
                    
                    <section id="code-example" className="mb-16">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-headline mb-4">Under the Hood: The Builder Prompt</h2>
                        <p className="text-lg text-muted-foreground mb-6">
                            The heart of our platform is the Genkit flow that instructs the AI model. The prompt is carefully engineered to provide the AI with context (the user's request and existing files) and strict guidelines for its output. This ensures predictable, high-quality, and partial results for maximum efficiency.
                        </p>
                        <div className="rounded-lg border bg-card overflow-hidden">
                           <CodePreview 
                                code={exampleCode} 
                                language="javascript"
                                onCodeChange={() => {}}
                           />
                        </div>
                    </section>

                     <section id="conclusion" className="text-center mt-16">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-headline mb-4">Start Building Today</h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                            The power to create is now at your fingertips. Stop wrestling with code and start a conversation with your ideas. What will you build?
                        </p>
                        <Button size="lg" asChild>
                            <Link href="/">
                                Launch The Builder
                            </Link>
                        </Button>
                    </section>
                </div>
            </main>
        </ScrollArea>
    );
}
