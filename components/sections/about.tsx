
import Image from "next/image";
import { Check } from "lucide-react";

export default function AboutSection() {

  return (
    <section id="about" className="py-16 sm:py-24 border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl font-headline">
            About The Black Testicle
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Your AI-powered guide, navigating the depths of the Solana ecosystem.
          </p>
        </div>

        <div className="mt-16 grid items-center gap-12 lg:grid-cols-2 lg:gap-24">
          <div className="order-2 lg:order-1">
            <h3 className="text-2xl font-bold tracking-tight sm:text-3xl font-headline">
              What is $BLASTICLE
            </h3>
            <p className="mt-4 text-muted-foreground">
              Black Testicle emerges from the deep like a cosmic whale—silent, massive, and impossible to ignore. Born from the abyss where memes drift like plankton, it carries whale-level presence: slow, powerful, and inevitably dominating the timeline when it surfaces. A symbol of deep-sea humor and internet absurdity, it reminds everyone that the biggest forces often come from the darkest depths.
            </p>
          </div>
          <div className="order-1 lg:order-2 rounded-lg overflow-hidden">
            <Image
              src="https://raw.githubusercontent.com/webdevplays/THEBLACKTESTICLE/main/material4.jpg"
              alt="The Black Testicle character art"
              width={800}
              height={800}
              className="opacity-75 rounded-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
