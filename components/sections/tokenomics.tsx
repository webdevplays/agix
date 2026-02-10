
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Wallet, Layers, Users, CircleDollarSign, Bot, Gamepad2, Copy, Check } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '../ui/button';

const metrics = [
    { title: 'Total Supply', value: '1,000,000,000 $BLASTICLE', icon: <Layers/> },
    { title: 'Token Name', value: 'The Black Testicle', icon: <CircleDollarSign/> },
    { title: 'Token Symbol', value: '$BLASTICLE', icon: <Wallet/> },
    { title: 'Blockchain', value: 'SOLANA', icon: <Users/> },
]

const contractAddress = '8qwjzpuaigGHKxwkSPbeqnL2XF9WqFBV1e9GJrVzpump';


export default function TokenomicsSection() {
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(contractAddress);
      setIsCopied(true);
      toast({
        title: "Copied!",
        description: "Contract address copied to clipboard.",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to copy",
        description: "Could not copy address to clipboard.",
      });
    }
  };

  return (
    <section id="tokenomics" className="py-16 sm:py-24 border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl font-headline">
            Tokenomics
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            A balanced and sustainable economic model designed for long-term growth and utility within the The Black Testicle ecosystem.
          </p>
        </div>

        <div className="mt-12 mb-12 rounded-lg overflow-hidden border">
            <Image 
                src="https://raw.githubusercontent.com/webdevplays/THEBLACKTESTICLE/main/black_banner.jpg" 
                alt="The Black Testicle Banner"
                width={1200}
                height={400}
                className="w-full h-auto object-cover"
            />
        </div>

        <div className="">
          <div className="space-y-8">
             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {metrics.map((metric) => (
                     <Card key={metric.title} className='text-center'>
                        <CardHeader>
                            <div className="flex justify-center mb-2 text-primary">{metric.icon}</div>
                            <CardDescription>{metric.title}</CardDescription>
                            <CardTitle className="text-2xl">{metric.value}</CardTitle>
                        </CardHeader>
                    </Card>
                ))}
             </div>
             <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">Token Utility</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground grid sm:grid-cols-2 gap-6 items-start justify-center max-w-3xl mx-auto">
                     <div className="flex flex-col items-center text-center gap-2">
                        <Gamepad2 className="h-8 w-8 shrink-0 text-primary" />
                        <p className='font-semibold text-foreground'>Games</p>
                        <p className='text-sm'>Engage in our play-to-earn games and get rewarded with $BLASTICLE.</p>
                    </div>
                     <div className="flex flex-col items-center text-center gap-2">
                        <Bot className="h-8 w-8 shrink-0 text-primary" />
                        <p className='font-semibold text-foreground'>BLASTICLE Ai</p>
                        <p className='text-sm'>Unlock premium features and capabilities within our advanced AI tools.</p>
                    </div>
                </CardContent>
             </Card>

             <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-headline">Contract Address</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center gap-4">
                    <div className="w-full max-w-md p-3 font-mono text-sm text-center border rounded-lg bg-secondary text-secondary-foreground break-words">
                        {contractAddress}
                    </div>
                    <Button onClick={handleCopy} variant="outline" size="sm">
                        {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        <span className="ml-2">{isCopied ? 'Copied!' : 'Copy Address'}</span>
                    </Button>
                </CardContent>
             </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
