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

      <div className="flex h-[calc(100vh-40px)]">
        {/* Desktop Sidebar */}
        <Sidebar className="hidden lg:flex" />

        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Mobile Header */}
          <Header />

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-4 lg:p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
