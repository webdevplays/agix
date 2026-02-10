
'use client';

import { Logo } from '@/components/logo';
import { useEffect, useState } from 'react';

export default function Footer() {
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
          <div className="flex items-center justify-center md:justify-start">
            <Logo />
          </div>
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; {year} GenSite. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
