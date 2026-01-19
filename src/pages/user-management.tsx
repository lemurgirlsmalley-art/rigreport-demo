import { useState } from 'react';
import { Clock, CheckCircle, Shield, Users, Trash2, Check, X, Ship, Anchor } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDemoAuth } from '@/hooks/use-demo-auth';
import { useFeatureModal } from '@/hooks/use-feature-modal';
import { mockStore } from '@/lib/mockDataStore';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import type { Role } from '@/lib/types';

const ROLES: { value: Role; label: string }[] = [
  { value: 'admin', label: 'Administrator' },
  { value: 'coach', label: 'Coach' },
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'junior_sailor', label: 'Junior Sailor' },
];

function getRoleBadgeColor(role: Role) {
  switch (role) {
    case 'admin': return 'bg-purple-100 text-purple-700';
    case 'coach': return 'bg-blue-100 text-blue-700';
    case 'volunteer': return 'bg-green-100 text-green-700';
    case 'junior_sailor': return 'bg-orange-100 text-orange-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}

function getRoleIcon(role: Role) {
  switch (role) {
    case 'admin': return Shield;
    case 'coach': return Ship;
    case 'volunteer': return Users;
    case 'junior_sailor': return Anchor;
    default: return Users;
  }
}

function StatCard({
  title,
  value,
  icon: Icon,
  iconBg,
  iconColor,
}: {
  title: string;
  value: number;
  icon: typeof Clock;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-full ${iconBg}`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
          <div>
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground">{title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function UserManagementPage() {
  const { permissions, user: currentUser } = useDemoAuth();
  const { showFeatureModal } = useFeatureModal();
  const [activeTab, setActiveTab] = useState('pending');

  // Fetch all users
  const { data: allUsers = [], isLoading } = useQuery({
    queryKey: ['demo-users'],
    queryFn: () => mockStore.getDemoUsers(),
  });

  const pendingUsers = allUsers.filter(u => u.status === 'pending');
  const activeUsers = allUsers.filter(u => u.status === 'active');
  const adminsCount = allUsers.filter(u => u.role === 'admin' || u.role === 'coach').length;

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  // All user management actions use FeatureModal (demo restriction)
  const handleApproveUser = () => {
    showFeatureModal('approveUser');
  };

  const handleDenyUser = () => {
    showFeatureModal('denyUser');
  };

  const handleChangeRole = () => {
    showFeatureModal('changeUserRole');
  };

  const handleDeleteUser = () => {
    showFeatureModal('deleteUser');
  };

  if (!permissions.canManageUsers) {
    return (
      <AppShell>
        <div className="text-center py-12">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">Access Restricted</h3>
          <p className="text-muted-foreground mt-1">
            You don't have permission to view user management.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage user accounts, approve registrations, and assign roles.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            title="Pending Approval"
            value={pendingUsers.length}
            icon={Clock}
            iconBg="bg-orange-50"
            iconColor="text-orange-500"
          />
          <StatCard
            title="Active Users"
            value={activeUsers.length}
            icon={CheckCircle}
            iconBg="bg-green-50"
            iconColor="text-green-500"
          />
          <StatCard
            title="Administrators"
            value={adminsCount}
            icon={Shield}
            iconBg="bg-blue-50"
            iconColor="text-blue-500"
          />
        </div>

        {/* Users Card */}
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Users</h2>
              <p className="text-sm text-muted-foreground">Review and manage user accounts</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-gray-100 mb-6">
                <TabsTrigger value="pending" className="data-[state=active]:bg-white">
                  Pending Approval
                  {pendingUsers.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {pendingUsers.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="all" className="data-[state=active]:bg-white">
                  All Users
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending">
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : pendingUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">No pending registrations</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingUsers.map((user) => {
                      const RoleIcon = getRoleIcon(user.role);
                      return (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-4 rounded-lg border border-orange-200 bg-orange-50/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white font-semibold">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right mr-2">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                                <RoleIcon className="h-3 w-3" />
                                Requested: {ROLES.find(r => r.value === user.role)?.label || user.role}
                              </span>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatTimeAgo(user.createdAt)}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 gap-1"
                              onClick={handleApproveUser}
                            >
                              <Check className="h-4 w-4" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-300 text-red-600 hover:bg-red-50 gap-1"
                              onClick={handleDenyUser}
                            >
                              <X className="h-4 w-4" />
                              Deny
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="all">
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeUsers.map((user) => {
                      const isCurrentUser = currentUser?.name === user.name;
                      const RoleIcon = getRoleIcon(user.role);
                      return (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500 text-white font-semibold">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{user.name}</p>
                                {isCurrentUser && (
                                  <Badge variant="outline" className="text-xs">You</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Select
                              value={user.role}
                              onValueChange={handleChangeRole}
                              disabled={isCurrentUser}
                            >
                              <SelectTrigger className={`w-[150px] ${getRoleBadgeColor(user.role)}`}>
                                <div className="flex items-center gap-1">
                                  <RoleIcon className="h-3 w-3" />
                                  <SelectValue />
                                </div>
                              </SelectTrigger>
                              <SelectContent>
                                {ROLES.map((role) => (
                                  <SelectItem key={role.value} value={role.value}>
                                    {role.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {!isCurrentUser && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={handleDeleteUser}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
