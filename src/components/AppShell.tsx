import type { ReactNode } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { DemoBanner } from '@/components/DemoBanner';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <DemoBanner />

      {/* CSS Grid layout matching production RigReport */}
      <div className="grid h-[calc(100vh-40px)] w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        {/* Desktop Sidebar */}
        <Sidebar className="hidden md:flex border-r border-border bg-muted/40" />

        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Mobile Header */}
          <Header />

          {/* Main Content - matching production bg and spacing */}
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background/50 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
