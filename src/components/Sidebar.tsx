import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  LayoutDashboard,
  Ship,
  Map,
  Package,
  Search,
  AlertTriangle,
  Users,
  Bell,
  LogOut,
  ChevronRight,
  Shield,
  Check,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDemoAuth } from '@/hooks/use-demo-auth';
import { mockStore } from '@/lib/mockDataStore';
import { queryClient } from '@/lib/queryClient';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import type { Role } from '@/lib/types';
import logo from '@/assets/logo.png';

// Role descriptions for the switcher dialog
const ROLE_INFO: Record<Role, { name: string; description: string; permissions: { label: string; allowed: boolean }[] }> = {
  admin: {
    name: 'Administrator',
    description: 'Full access to all features and settings',
    permissions: [
      { label: 'Edit boats and equipment', allowed: true },
      { label: 'Delete boats and equipment', allowed: true },
      { label: 'Add new boats', allowed: true },
      { label: 'Manage users', allowed: true },
      { label: 'Change boat status', allowed: true },
      { label: 'Report damage', allowed: true },
      { label: 'Resolve maintenance', allowed: true },
    ],
  },
  coach: {
    name: 'Coach',
    description: 'Manage fleet operations and maintenance',
    permissions: [
      { label: 'Edit boats and equipment', allowed: true },
      { label: 'Delete boats and equipment', allowed: false },
      { label: 'Add new boats', allowed: true },
      { label: 'Manage users', allowed: false },
      { label: 'Change boat status', allowed: true },
      { label: 'Report damage', allowed: true },
      { label: 'Resolve maintenance', allowed: true },
    ],
  },
  volunteer: {
    name: 'Volunteer',
    description: 'View fleet and report issues',
    permissions: [
      { label: 'Edit boats and equipment', allowed: false },
      { label: 'Delete boats and equipment', allowed: false },
      { label: 'Add new boats', allowed: false },
      { label: 'Manage users', allowed: false },
      { label: 'Change boat status', allowed: false },
      { label: 'Report damage', allowed: true },
      { label: 'Resolve maintenance', allowed: false },
    ],
  },
  junior_sailor: {
    name: 'Junior Sailor',
    description: 'Limited access for youth members',
    permissions: [
      { label: 'Edit boats and equipment', allowed: false },
      { label: 'Delete boats and equipment', allowed: false },
      { label: 'Add new boats', allowed: false },
      { label: 'Manage users', allowed: false },
      { label: 'Change boat status', allowed: false },
      { label: 'Report damage', allowed: true },
      { label: 'Resolve maintenance', allowed: false },
    ],
  },
};

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Manage Fleet', href: '/fleet', icon: Ship },
  { name: 'Fleet Map', href: '/map', icon: Map },
  { name: 'Manage Equipment', href: '/equipment', icon: Package },
  { name: 'Find a Boat', href: '/regatta', icon: Search },
  { name: 'Report Damage', href: '/report', icon: AlertTriangle, highlight: true, requiresPermission: 'canReportDamage' as const },
  { name: 'User Management', href: '/users', icon: Users, badge: 2, requiresPermission: 'canManageUsers' as const },
  { name: 'Notifications', href: '/notifications', icon: Bell },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { user, role, setRole, permissions } = useDemoAuth();
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);

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
        'flex h-full flex-col',
        className
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center gap-3 px-4 lg:h-[60px] lg:px-6 border-b">
        <img src={logo} alt="RigReport Logo" className="h-8 w-8 rounded-full" />
        <span className="text-lg font-semibold text-foreground">RigReport</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          // Check if user has required permission
          const requiredPerm = item.requiresPermission;
          if (requiredPerm && !permissions[requiredPerm]) {
            return null;
          }

          const isActive = location === item.href ||
            (item.href !== '/dashboard' && location.startsWith(item.href));
          const isHighlight = item.highlight;
          const badge = item.badge;

          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer',
                  isHighlight && 'bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20',
                  isActive && !isHighlight && 'bg-primary text-primary-foreground',
                  !isActive && !isHighlight && 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="flex-1">{item.name}</span>
                {badge && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    {badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t">
        {user && (
          <button
            onClick={() => setIsRoleSwitcherOpen(true)}
            className="flex items-center gap-3 mb-3 w-full p-2 -m-2 rounded-lg hover:bg-muted transition-colors group"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold uppercase text-sm">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
              <span className={cn(
                'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                getRoleBadgeColor(role)
              )}>
                {role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>

      {/* Role Switcher Dialog */}
      <Dialog open={isRoleSwitcherOpen} onOpenChange={setIsRoleSwitcherOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Switch Account Type
            </DialogTitle>
            <DialogDescription>
              Test different user roles to see how permissions affect the app experience.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            {(Object.keys(ROLE_INFO) as Role[]).map((roleKey) => {
              const info = ROLE_INFO[roleKey];
              const isSelected = role === roleKey;

              return (
                <button
                  key={roleKey}
                  onClick={() => {
                    setRole(roleKey);
                    setIsRoleSwitcherOpen(false);
                  }}
                  className={cn(
                    'w-full text-left p-4 rounded-lg border-2 transition-all',
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                          getRoleBadgeColor(roleKey)
                        )}>
                          {info.name}
                        </span>
                        {isSelected && (
                          <span className="text-xs text-primary font-medium">Current</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{info.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3">
                    {info.permissions.map((perm) => (
                      <div key={perm.label} className="flex items-center gap-1.5 text-xs">
                        {perm.allowed ? (
                          <Check className="h-3 w-3 text-green-600 flex-shrink-0" />
                        ) : (
                          <X className="h-3 w-3 text-red-500 flex-shrink-0" />
                        )}
                        <span className={perm.allowed ? 'text-foreground' : 'text-muted-foreground'}>
                          {perm.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
