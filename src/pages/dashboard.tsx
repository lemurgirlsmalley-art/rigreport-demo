import { Link } from 'wouter';
import { Ship, Plus, Calendar, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useBoats } from '@/hooks/use-boats';
import { useMaintenance } from '@/hooks/use-maintenance';
import { useDemoAuth } from '@/hooks/use-demo-auth';
import { formatDate } from '@/lib/utils';

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  bgColor,
  iconBgColor,
  iconColor,
  isLoading,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: typeof Ship;
  bgColor: string;
  iconBgColor: string;
  iconColor: string;
  isLoading?: boolean;
}) {
  return (
    <Card className={`border-0 shadow-sm ${bgColor}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            {isLoading ? (
              <Skeleton className="h-10 w-16 mb-1" />
            ) : (
              <p className="text-4xl font-bold text-foreground">{value}</p>
            )}
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          </div>
          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${iconBgColor}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentBoatItem({
  name,
  type,
  location,
  date,
  updatedBy,
}: {
  name: string;
  type: string;
  location: string;
  date: string;
  updatedBy: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0" />
        <div>
          <p className="font-medium text-foreground">{name}</p>
          <p className="text-sm text-muted-foreground">{type} • {location}</p>
        </div>
      </div>
      <div className="text-right">
        <div className="flex items-center gap-1 text-sm text-muted-foreground justify-end">
          <Calendar className="h-3.5 w-3.5" />
          {date}
        </div>
        <p className="text-sm text-muted-foreground">{updatedBy}</p>
      </div>
    </div>
  );
}

function OpenIssuesCard({ maintenance, isLoading }: { maintenance: { severity: string }[], isLoading: boolean }) {
  const highPriority = maintenance.filter(m => m.severity === 'High').length;
  const mediumPriority = maintenance.filter(m => m.severity === 'Medium').length;
  const lowPriority = maintenance.filter(m => m.severity === 'Low').length;

  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Open Issues</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-sm">High Priority</span>
              </div>
              <span className="text-sm font-medium">{highPriority}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                <span className="text-sm">Medium Priority</span>
              </div>
              <span className="text-sm font-medium">{mediumPriority}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <span className="text-sm">Low Priority</span>
              </div>
              <span className="text-sm font-medium">{lowPriority}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function QuickActionsCard() {
  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Link href="/report">
          <Button className="w-full justify-start gap-2 h-10 bg-[#1e2a3b] hover:bg-[#2d3c4f] text-white">
            <Plus className="h-4 w-4" />
            Log Boat Inspection
          </Button>
        </Link>
        <Link href="/equipment">
          <Button variant="outline" className="w-full justify-start gap-2 h-10 border-gray-200">
            <Plus className="h-4 w-4" />
            Log Equipment Info
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const { boats, isLoading: boatsLoading } = useBoats();
  const { maintenance, isLoading: maintenanceLoading } = useMaintenance();
  const { user } = useDemoAuth();

  const operationalBoats = boats.filter((b) => b.status === 'OK').length;
  const needsAttention = boats.filter(
    (b) => b.status === 'Needs inspection' || b.status === 'Needs repair'
  ).length;
  const groundedBoats = boats.filter((b) => b.status === 'Do not sail').length;

  const openMaintenance = maintenance.filter((m) => m.status !== 'Resolved');

  // Get recently updated boats (using updatedAt)
  const recentBoats = [...boats]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.name.split(' ')[0] || 'Guest'}. Here's the fleet status.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Fleet"
            value={boats.length}
            subtitle="Active vessels"
            icon={Ship}
            bgColor="bg-white"
            iconBgColor="bg-gray-100"
            iconColor="text-gray-500"
            isLoading={boatsLoading}
          />
          <StatCard
            title="Operational"
            value={operationalBoats}
            subtitle="Ready to sail"
            icon={CheckCircle}
            bgColor="bg-green-50"
            iconBgColor="bg-green-100"
            iconColor="text-green-500"
            isLoading={boatsLoading}
          />
          <StatCard
            title="Needs Attention"
            value={needsAttention}
            subtitle="Inspection or Repair"
            icon={AlertTriangle}
            bgColor="bg-orange-50"
            iconBgColor="bg-orange-100"
            iconColor="text-orange-500"
            isLoading={boatsLoading}
          />
          <StatCard
            title="Grounded"
            value={groundedBoats}
            subtitle="Do not sail"
            icon={XCircle}
            bgColor="bg-red-50"
            iconBgColor="bg-red-100"
            iconColor="text-red-500"
            isLoading={boatsLoading}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recently Updated Boats - Takes 2 columns */}
          <Card className="border-0 shadow-sm lg:col-span-2 bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Recently Updated Boats</CardTitle>
            </CardHeader>
            <CardContent>
              {boatsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div>
                  {recentBoats.map((boat) => (
                    <RecentBoatItem
                      key={boat.id}
                      name={boat.displayName}
                      type={boat.type}
                      location={boat.location}
                      date={formatDate(boat.updatedAt, 'MMM d')}
                      updatedBy="Demo User"
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Column - Issues and Quick Actions */}
          <div className="space-y-6">
            <OpenIssuesCard maintenance={openMaintenance} isLoading={maintenanceLoading} />
            <QuickActionsCard />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
