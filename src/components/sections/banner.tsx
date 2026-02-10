
'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import AiChatbot from './ai-chatbot';
import { useEffect, useRef } from 'react';

export default function BannerSection() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.8;
    }
  }, []);
  return (
    <section className="relative overflow-hidden border-b-2 border-border">
      <div className="absolute inset-0 z-[-1] opacity-30">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          poster="https://images.unsplash.com/photo-1518770660439-4636190af475?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHx0ZWNobm9sb2d5fGVufDB8fHx8MTc2NzUyMjQwOXww&ixlib=rb-4.1.0&q=80&w=1080"
        >
          <source
            src="https://videos.pexels.com/video-files/3210189/3210189-hd_1920_1080_25fps.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      <div className="container relative z-10 mx-auto grid min-h-[calc(100vh-4rem)] items-center gap-8 px-4 py-16 lg:grid-cols-2 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center lg:text-left lg:mx-0">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl font-headline">
            The Black Testicle
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl lg:mx-0">
            Black Testicle emerges from the deep like a cosmic whale—silent, massive, and impossible to ignore. Born from the abyss where memes drift like plankton, it carries whale-level presence
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4 lg:justify-start">
            <Button size="lg" asChild>
              <a href="#chart">
                Dexscreener
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#">
                BUY $BLASTICLE
              </a>
            </Button>
          </div>
        </div>
        <div className="w-full max-w-md mx-auto">
          <AiChatbot />
        </div>
      </div>
    </section>
  );
}
