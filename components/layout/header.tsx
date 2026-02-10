
'use client';

import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { ArrowLeft, FileText } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  const pathname = usePathname();
  const isWhitepaper = pathname === '/whitepaper';

  return (
    <header
      className='flex h-14 shrink-0 items-center justify-between border-b bg-card px-4'
    >
      <div className="flex items-center gap-4">
        {isWhitepaper && (
              <Button variant="outline" size="icon" asChild>
                <Link href="/">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back to Builder</span>
                </Link>
            </Button>
        )}
        <Logo />
      </div>

      <nav className="flex items-center space-x-2">
        {!isWhitepaper && (
          <Button variant="ghost" size="icon" asChild>
            <Link href="/whitepaper" title="Whitepaper">
              <FileText className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
            </Link>
          </Button>
        )}
      </nav>
    </header>
  );
}
