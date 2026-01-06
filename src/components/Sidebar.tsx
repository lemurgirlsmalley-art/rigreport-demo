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

  return (
    <aside
      className={cn(
        'flex h-full w-64 flex-col bg-white border-r border-gray-200',
        className
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fce8e6]">
          <Anchor className="h-4 w-4 text-[#e57373]" />
        </div>
        <span className="text-lg font-semibold text-gray-900">RigReport</span>
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
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer',
                  isHighlight && 'bg-[#fef2f2] text-[#ef6461] hover:bg-[#fee2e2]',
                  isActive && !isHighlight && 'bg-gray-100 text-gray-900',
                  !isActive && !isHighlight && 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="flex-1">{item.name}</span>
                {badge && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-xs text-gray-600">
                    {badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        {user && (
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-white font-semibold text-base">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-teal-100 text-teal-700">
                {role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors border border-gray-200"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}
