import { cn } from '@/lib/utils';

export function BlasticleBotIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn(className)}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M50,90 C27.9,90 10,72.1 10,50 C10,27.9 27.9,10 50,10 C72.1,10 90,27.9 90,50 C90,72.1 72.1,90 50,90 Z"
        fill="currentColor"
      />
      <circle cx="38" cy="45" r="5" fill="hsl(var(--background))" />
      <circle cx="62" cy="45" r="5" fill="hsl(var(--background))" />
      <path
        d="M40 65 Q50 75 60 65"
        stroke="hsl(var(--background))"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
