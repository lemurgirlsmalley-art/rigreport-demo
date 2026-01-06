import { Info, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DemoBannerProps {
  className?: string;
}

export function DemoBanner({ className }: DemoBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 bg-primary px-4 py-2 text-primary-foreground',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Info className="h-4 w-4 shrink-0" />
        <p className="text-sm">
          You're viewing a demo of RigReport. Data is stored locally in your browser.
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0 text-primary-foreground hover:bg-primary-foreground/20"
        onClick={() => setDismissed(true)}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Dismiss</span>
      </Button>
    </div>
  );
}
