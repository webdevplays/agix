
'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, User } from 'lucide-react';
import { chat, ChatInput } from '@/ai/flows/chat-flow';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback } from '../ui/avatar';
import Image from 'next/image';

type Message = {
  sender: 'user' | 'ai';
  text: string;
  chartInfo?: {
    pairAddress: string;
    symbol: string;
  };
};

export default function AiChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: "Welcome to The Black Testicle. I'm BLASTICLE, your guide to the Solana ecosystem. Ask me anything about SOL!",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chatInput: ChatInput = { message: input };
      const result = await chat(chatInput);
      const aiMessage: Message = {
        sender: 'ai',
        text: result.message,
        chartInfo: result.chartInfo,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI chat error:', error);
      const errorMessage: Message = {
        sender: 'ai',
        text: 'ERROR: Unable to get response.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <Card className="flex flex-col h-[70vh] max-h-[600px] w-full max-w-md mx-auto bg-background/80 backdrop-blur-sm rounded-lg shadow-2xl">
      <CardHeader className='border-b'>
        <CardTitle className="flex items-center gap-3 text-lg font-semibold">
          <Avatar className='h-8 w-8'>
            <Image
              src="https://raw.githubusercontent.com/webdevplays/THEBLACKTESTICLE/main/black_logo.png"
              alt="The Black Testicle Logo"
              width={32}
              height={32}
              className="rounded-full"
            />
          </Avatar>
          BLASTICLE
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-4">
        <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
           <div className="space-y-6">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-3',
                  msg.sender === 'user' ? 'justify-end' : ''
                )}
              >
                {msg.sender === 'ai' && (
                  <Avatar className='h-8 w-8'>
                     <Image
                        src="https://raw.githubusercontent.com/webdevplays/THEBLACKTESTICLE/main/black_logo.png"
                        alt="The Black Testicle Logo"
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                  </Avatar>
                )}
                <div
                  className={cn(
                    'p-3 rounded-lg max-w-xs text-sm',
                    msg.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary'
                  )}
                >
                  <p>{msg.text}</p>
                  {msg.chartInfo && (
                    <div className="mt-2 border-2 border-border p-1 rounded-md">
                      <style>{`.dexscreener-embed { position: relative; width: 100%; padding-bottom: 125%; } .dexscreener-embed iframe { position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: 0; }`}</style>
                      <div className="dexscreener-embed">
                        <iframe src={`https://dexscreener.com/solana/${msg.chartInfo.pairAddress}?embed=1&theme=dark&info=false`}></iframe>
                      </div>
                    </div>
                  )}
                </div>
                 {msg.sender === 'user' && (
                   <Avatar className='h-8 w-8 bg-muted border'>
                     <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                   </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                 <Avatar className='h-8 w-8'>
                    <Image
                      src="https://raw.githubusercontent.com/webdevplays/THEBLACKTESTICLE/main/black_logo.png"
                      alt="The Black Testicle Logo"
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                 </Avatar>
                <div className="p-3 bg-secondary rounded-lg">
                  <div className="flex items-center space-x-1">
                    <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse"></span>
                  </div>
                </div>
              </div>
            )}
           </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="pt-4 border-t">
        <div className="flex w-full items-center space-x-2">
          <Input
            type="text"
            placeholder="Ask BLASTICLE..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1 rounded-full"
          />
          <Button
            type="submit"
            size="icon"
            onClick={handleSendMessage}
            disabled={isLoading}
            className="rounded-full"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
