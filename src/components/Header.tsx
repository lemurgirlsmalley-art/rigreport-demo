import { useState } from 'react';
import { Menu, X, Anchor } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Fleet', href: '/fleet' },
  { name: 'Map', href: '/map' },
  { name: 'Regatta', href: '/regatta' },
  { name: 'Equipment', href: '/equipment' },
  { name: 'Report', href: '/report' },
];

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  return (
    <header className={cn('border-b bg-card lg:hidden', className)}>
      <div className="flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/dashboard">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Anchor className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-primary">RigReport</span>
          </div>
        </Link>

        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="border-t px-4 py-4 space-y-4">
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = location === item.href ||
                (item.href !== '/dashboard' && location.startsWith(item.href));
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    className={cn(
                      'w-full justify-start',
                      isActive && 'bg-primary/10 text-primary'
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </nav>

          <div className="pt-4 border-t">
            <RoleSwitcher />
          </div>
        </div>
      )}
    </header>
  );
}
