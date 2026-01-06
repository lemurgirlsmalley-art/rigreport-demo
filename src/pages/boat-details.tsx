import { useParams, useLocation } from 'wouter';
import {
  ArrowLeft,
  Ship,
  MapPin,
  Calendar,
  Shield,
  FileText,
  Trophy,
  Edit,
  Trash2,
  Flag,
  CheckCircle,
} from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { StatusBadge } from '@/components/StatusBadge';
import { MaintenanceItem } from '@/components/MaintenanceItem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBoat, useUpdateBoat, useDeleteBoat } from '@/hooks/use-boats';
import { useMaintenance } from '@/hooks/use-maintenance';
import { useDemoAuth } from '@/hooks/use-demo-auth';
import { formatDate, getOrganizationName } from '@/lib/utils';
import type { BoatStatus } from '@/lib/types';

export function BoatDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { boat, isLoading } = useBoat(id);
  const { maintenance, isLoading: maintenanceLoading } = useMaintenance(id);
  const updateBoat = useUpdateBoat();
  const deleteBoat = useDeleteBoat();
  const { permissions } = useDemoAuth();

  const handleStatusChange = (newStatus: BoatStatus) => {
    if (id) {
      updateBoat.mutate({ id, data: { status: newStatus } });
    }
  };

  const handleDelete = () => {
    if (id && window.confirm('Are you sure you want to delete this boat? This cannot be undone.')) {
      deleteBoat.mutate(id, {
        onSuccess: () => setLocation('/fleet'),
      });
    }
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppShell>
    );
  }

  if (!boat) {
    return (
      <AppShell>
        <div className="text-center py-12">
          <Ship className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">Boat not found</h3>
          <p className="text-muted-foreground mt-1">
            The boat you're looking for doesn't exist or has been removed.
          </p>
          <Button variant="outline" className="mt-4" onClick={() => setLocation('/fleet')}>
            Back to Fleet
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Back Link */}
        <button
          onClick={() => setLocation('/fleet')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Fleet
        </button>

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge className="bg-[#1f2937] text-white hover:bg-[#1f2937]">{boat.type}</Badge>
              <Ship className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{boat.displayName}</h1>
              {boat.isRegattaPreferred && (
                <Trophy className="h-5 w-5 text-amber-500" />
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Status Badge */}
            <StatusBadge status={boat.status} size="lg" />

            {/* Action Buttons */}
            {permissions.canReportDamage && (
              <Button variant="outline" className="gap-2">
                <Flag className="h-4 w-4" />
                Flag Issue
              </Button>
            )}
            {permissions.canChangeStatus && (
              <Button
                className="gap-2 bg-green-500 hover:bg-green-600 text-white"
                onClick={() => handleStatusChange('OK')}
              >
                <CheckCircle className="h-4 w-4" />
                Mark OK
              </Button>
            )}
            {permissions.canEdit && (
              <Button variant="outline" className="gap-2">
                <Edit className="h-4 w-4" />
                Edit Details
              </Button>
            )}
            {permissions.canDelete && (
              <Button variant="outline" size="icon" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Description */}
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-50">
                    <Ship className="h-4 w-4 text-teal-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-teal-600">Description</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {boat.type} {boat.year || ''}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vessel Details */}
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Vessel Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{boat.location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Ship className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Program</p>
                    <p className="text-sm text-muted-foreground">{boat.organization} {boat.hullNumber}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Organization</p>
                    <p className="text-sm text-muted-foreground">{getOrganizationName(boat.organization)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Last Inspection</p>
                    <p className="text-sm text-muted-foreground">
                      {boat.lastInspection ? formatDate(boat.lastInspection, 'MMM d, yyyy') : 'Not recorded'}
                    </p>
                    <p className="text-xs text-muted-foreground">by Demo User</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Specifications - Collapsible */}
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between cursor-pointer">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Specifications
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Hull Number</dt>
                    <dd className="font-medium">{boat.hullNumber}</dd>
                  </div>
                  {boat.manufacturer && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Manufacturer</dt>
                      <dd className="font-medium">{boat.manufacturer}</dd>
                    </div>
                  )}
                  {boat.year && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Year</dt>
                      <dd className="font-medium">{boat.year}</dd>
                    </div>
                  )}
                  {boat.color && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Color</dt>
                      <dd className="font-medium">{boat.color}</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>

            {/* Registration */}
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Registration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Insurance Expiry</dt>
                    <dd className="font-medium">
                      {boat.insuranceExpiry ? formatDate(boat.insuranceExpiry) : 'Not recorded'}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Registration Expiry</dt>
                    <dd className="font-medium">
                      {boat.registrationExpiry ? formatDate(boat.registrationExpiry) : 'Not recorded'}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Log Maintenance Form */}
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Log Maintenance or Inspection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Select defaultValue="inspection">
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inspection">Routine Inspection</SelectItem>
                        <SelectItem value="repair">Repair</SelectItem>
                        <SelectItem value="rigging">Rigging Issue</SelectItem>
                        <SelectItem value="hull">Hull Damage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Severity</label>
                    <Select defaultValue="low">
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low (Info only)</SelectItem>
                        <SelectItem value="medium">Medium (Needs fixing)</SelectItem>
                        <SelectItem value="high">High (Do not sail)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-white placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Describe the issue or inspection results..."
                  />
                </div>
                <div className="flex justify-end">
                  <Button className="bg-[#1f2937] hover:bg-[#374151]">
                    Save Log Entry
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Maintenance History */}
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Maintenance History</CardTitle>
              </CardHeader>
              <CardContent>
                {maintenanceLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : maintenance.length === 0 ? (
                  <p className="text-center py-6 text-muted-foreground text-sm">
                    No maintenance history
                  </p>
                ) : (
                  <div className="space-y-3">
                    {maintenance.map((entry) => (
                      <MaintenanceItem key={entry.id} entry={entry} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
