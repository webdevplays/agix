import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Twitter,
  Send,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';

type LinkCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  href: string;
};

const links: LinkCardProps[] = [
  {
    icon: <Twitter className="h-6 w-6 text-primary" />,
    title: 'Twitter',
    description: 'Follow us for the latest news and updates.',
    href: 'https://x.com/blcktesticle',
  },
  {
    icon: <Send className="h-6 w-6 text-primary" />,
    title: 'Telegram',
    description: 'Join our community for real-time discussions.',
    href: 'https://t.me/blacktesticlesol',
  },
];

function LinkCard({ icon, title, description, href }: LinkCardProps) {
  const isExternal = href.startsWith('http');

  const cardContent = (
    <Card className="h-full transition-all duration-300 ease-in-out hover:border-primary">
      <CardHeader>
        <div className="flex items-center justify-between">
          {icon}
          <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </div>
        <CardTitle className="pt-4 text-xl font-semibold">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );

  if (isExternal) {
    return (
      <a href={href} className="group block" target="_blank" rel="noopener noreferrer">
        {cardContent}
      </a>
    );
  }

  return (
    <Link href={href} className="group block">
      {cardContent}
    </Link>
  );
}

export default function ImportantLinksSection() {
  return (
    <section id="contact" className="py-16 sm:py-24 border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl font-headline">
            Find Us
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Stay connected and informed with our official resources and community channels.
          </p>
        </div>
        <div className="mt-12 grid max-w-lg mx-auto grid-cols-1 gap-5 md:max-w-3xl md:grid-cols-2">
          {links.map((link) => (
            <LinkCard key={link.title} {...link} />
          ))}
        </div>
      </div>
    </section>
  );
}
