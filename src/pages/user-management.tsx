import { useState } from 'react';
import { Clock, CheckCircle, Shield, Users } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDemoAuth } from '@/hooks/use-demo-auth';

// Mock users for demo
const MOCK_USERS = [
  { id: '1', name: 'Millie Smalley', email: 'millie@example.com', role: 'admin', status: 'active', avatar: 'M' },
  { id: '2', name: 'Daniel Fodera', email: 'daniel@example.com', role: 'coach', status: 'active', avatar: 'D' },
  { id: '3', name: 'Sarah Chen', email: 'sarah@example.com', role: 'coach', status: 'active', avatar: 'S' },
  { id: '4', name: 'Mike Wilson', email: 'mike@example.com', role: 'volunteer', status: 'active', avatar: 'M' },
  { id: '5', name: 'Emma Davis', email: 'emma@example.com', role: 'volunteer', status: 'active', avatar: 'E' },
  { id: '6', name: 'Alex Johnson', email: 'alex@example.com', role: 'junior_sailor', status: 'active', avatar: 'A' },
  { id: '7', name: 'Jamie Lee', email: 'jamie@example.com', role: 'junior_sailor', status: 'active', avatar: 'J' },
];

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
  const { permissions } = useDemoAuth();
  const [activeTab, setActiveTab] = useState('pending');

  const pendingApprovals = 0;
  const activeUsers = MOCK_USERS.length;
  const admins = MOCK_USERS.filter(u => u.role === 'admin').length;

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
            value={pendingApprovals}
            icon={Clock}
            iconBg="bg-orange-50"
            iconColor="text-orange-500"
          />
          <StatCard
            title="Active Users"
            value={activeUsers}
            icon={CheckCircle}
            iconBg="bg-green-50"
            iconColor="text-green-500"
          />
          <StatCard
            title="Administrators"
            value={admins}
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
                </TabsTrigger>
                <TabsTrigger value="all" className="data-[state=active]:bg-white">
                  All Users
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending">
                {pendingApprovals === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">No pending registrations</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Pending users would go here */}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="all">
                <div className="space-y-3">
                  {MOCK_USERS.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500 text-white font-semibold">
                          {user.avatar}
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : user.role === 'coach'
                            ? 'bg-blue-100 text-blue-700'
                            : user.role === 'volunteer'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1).replace('_', ' ')}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          Active
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
