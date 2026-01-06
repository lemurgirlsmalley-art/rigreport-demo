import { Link, useLocation } from 'wouter';
import {
  LayoutDashboard,
  Ship,
  Map,
  Package,
  Search,
  AlertTriangle,
  Users,
  LogOut,
  Anchor,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDemoAuth } from '@/hooks/use-demo-auth';
import { mockStore } from '@/lib/mockDataStore';
import { queryClient } from '@/lib/queryClient';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Manage Fleet', href: '/fleet', icon: Ship },
  { name: 'Fleet Map', href: '/map', icon: Map },
  { name: 'Manage Equipment', href: '/equipment', icon: Package },
  { name: 'Find a Boat', href: '/regatta', icon: Search },
  { name: 'Report Damage', href: '/report', icon: AlertTriangle, highlight: true },
  { name: 'User Management', href: '/users', icon: Users, badge: 1 },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { user, role } = useDemoAuth();

  const handleLogout = () => {
    if (window.confirm('Reset demo data and return to landing page?')) {
      mockStore.reset();
      queryClient.invalidateQueries();
      window.location.href = '/';
    }
  };

  // Get role badge color
  const getRoleBadgeColor = (r: string) => {
    switch (r) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'coach':
        return 'bg-blue-100 text-blue-800';
      case 'volunteer':
        return 'bg-green-100 text-green-800';
      case 'junior_sailor':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <aside
      className={cn(
        'flex h-full w-64 flex-col bg-primary text-primary-foreground',
        className
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center gap-3 px-4 lg:h-[60px] lg:px-6 border-b border-sidebar-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
          <Anchor className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-semibold text-white">RigReport</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location === item.href ||
            (item.href !== '/dashboard' && location.startsWith(item.href));
          const isHighlight = item.highlight;
          const badge = (item as { badge?: number }).badge;

          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer',
                  isHighlight && 'bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20',
                  isActive && !isHighlight && 'bg-muted text-primary',
                  !isActive && !isHighlight && 'text-muted-foreground hover:text-primary-foreground hover:bg-sidebar-accent'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="flex-1">{item.name}</span>
                {badge && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sidebar-accent text-xs text-primary-foreground">
                    {badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-sidebar-border">
        {user && (
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold uppercase text-sm">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary-foreground truncate">{user.name}</p>
              <span className={cn(
                'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                getRoleBadgeColor(role)
              )}>
                {role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-primary-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}
