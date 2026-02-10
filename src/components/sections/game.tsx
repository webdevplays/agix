
import { Badge } from '../ui/badge';

export default function GameSection() {
  return (
    <section id="game" className="py-16 sm:py-24 border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl font-headline">
            BETA Game
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Engage with our ecosystem and earn rewards.
          </p>
        </div>
        <div className="relative mt-12 rounded-lg overflow-hidden border h-[80vh] md:h-[90vh]">
          <div className="absolute top-0 right-0 z-10 h-16 w-16 -translate-y-1/2 translate-x-1/2 rotate-45 transform bg-primary/80 backdrop-blur-sm"></div>
          <div className="absolute top-[18px] right-[4px] z-20 rotate-45 transform text-xs font-bold uppercase text-primary-foreground origin-center">BETA</div>
          
          <iframe
            src="https://theblacktesticle.netlify.app/"
            className="w-full h-full"
            title="The Black Testicle Game"
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </section>
  );
}
