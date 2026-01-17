import { useState } from 'react';
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
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  X,
  Mail,
  User,
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
import { useBoat } from '@/hooks/use-boats';
import { useMaintenance } from '@/hooks/use-maintenance';
import { useReservations, useCreateReservation, useDeleteReservation } from '@/hooks/use-reservations';
import { useDemoAuth } from '@/hooks/use-demo-auth';
import { useFeatureModal } from '@/hooks/use-feature-modal';
import { toast } from '@/hooks/use-toast';
import { formatDate, getOrganizationName, getOrganizationLogo } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Reservation } from '@/lib/types';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  isWithinInterval,
  parseISO,
  startOfWeek,
  endOfWeek,
} from 'date-fns';

// Reservations Section Component
function ReservationsSection({ boatId }: { boatId: string }) {
  const { reservations, isLoading } = useReservations(boatId);
  const createReservation = useCreateReservation();
  const deleteReservation = useDeleteReservation();
  const { permissions } = useDemoAuth();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reservedBy: '',
    email: '',
    reason: '',
  });

  const today = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const activeReservations = reservations.filter(
    (r) => parseISO(r.endDate) >= today
  );

  const getReservationForDate = (date: Date): Reservation | undefined => {
    return reservations.find((r) => {
      const start = parseISO(r.startDate);
      const end = parseISO(r.endDate);
      return isWithinInterval(date, { start, end });
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate || !formData.reservedBy || !formData.email) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createReservation.mutateAsync({
        boatId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reservedBy: formData.reservedBy,
        email: formData.email,
        reason: formData.reason || undefined,
      });

      toast({
        title: 'Reservation Created',
        description: 'Your reservation has been saved',
        variant: 'success',
      });

      setFormData({ startDate: '', endDate: '', reservedBy: '', email: '', reason: '' });
      setIsFormOpen(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to create reservation',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteReservation.mutateAsync(id);
      toast({
        title: 'Reservation Deleted',
        description: 'The reservation has been removed',
        variant: 'success',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete reservation',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Reservations
            {activeReservations.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeReservations.length}
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFormOpen(!isFormOpen)}
          >
            {isFormOpen ? 'Cancel' : 'Reserve Boat'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Reservation Form */}
        {isFormOpen && (
          <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  min={format(today, 'yyyy-MM-dd')}
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  min={formData.startDate || format(today, 'yyyy-MM-dd')}
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="bg-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reservedBy">Your Name *</Label>
                <Input
                  id="reservedBy"
                  placeholder="Enter your name"
                  value={formData.reservedBy}
                  onChange={(e) => setFormData({ ...formData, reservedBy: e.target.value })}
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Event/Reason (Optional)</Label>
              <Input
                id="reason"
                placeholder="e.g., Regatta practice, sailing lesson"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="bg-white"
              />
            </div>
            <Button type="submit" className="w-full" disabled={createReservation.isPending}>
              {createReservation.isPending ? 'Creating...' : 'Create Reservation'}
            </Button>
          </form>
        )}

        {/* Calendar */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="font-medium">{format(currentMonth, 'MMMM yyyy')}</span>
            <button
              type="button"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="py-1 font-medium text-muted-foreground">
                {day}
              </div>
            ))}
            {calendarDays.map((day) => {
              const reservation = getReservationForDate(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isDayToday = isToday(day);

              return (
                <div
                  key={day.toISOString()}
                  className={`py-2 text-sm rounded ${
                    !isCurrentMonth ? 'text-gray-300' : ''
                  } ${isDayToday ? 'ring-2 ring-primary ring-offset-1' : ''} ${
                    reservation ? 'bg-primary text-primary-foreground' : ''
                  }`}
                  title={reservation ? `Reserved by ${reservation.reservedBy}` : undefined}
                >
                  {format(day, 'd')}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Reservations */}
        {isLoading ? (
          <Skeleton className="h-20 w-full" />
        ) : activeReservations.length === 0 ? (
          <p className="text-center py-4 text-muted-foreground text-sm">
            No upcoming reservations
          </p>
        ) : (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Upcoming Reservations</h4>
            {activeReservations
              .sort((a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime())
              .map((reservation) => {
                const isActive = isWithinInterval(today, {
                  start: parseISO(reservation.startDate),
                  end: parseISO(reservation.endDate),
                });

                return (
                  <div
                    key={reservation.id}
                    className={`p-3 rounded-lg border ${
                      isActive ? 'border-primary bg-primary/5' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {format(parseISO(reservation.startDate), 'MMM d')} -{' '}
                            {format(parseISO(reservation.endDate), 'MMM d, yyyy')}
                          </span>
                          {isActive && (
                            <Badge variant="default" className="text-xs">Active</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {reservation.reservedBy}
                          </span>
                          <a
                            href={`mailto:${reservation.email}`}
                            className="flex items-center gap-1 hover:text-primary"
                          >
                            <Mail className="h-3 w-3" />
                            {reservation.email}
                          </a>
                        </div>
                        {reservation.reason && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {reservation.reason}
                          </p>
                        )}
                      </div>
                      {permissions.canEdit && (
                        <button
                          type="button"
                          onClick={() => handleDelete(reservation.id)}
                          className="p-1 text-gray-400 hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function BoatDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { boat, isLoading } = useBoat(id);
  const { maintenance, isLoading: maintenanceLoading } = useMaintenance(id);
  const { permissions } = useDemoAuth();
  const { showFeatureModal } = useFeatureModal();

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
              <img
                src={getOrganizationLogo(boat.organization)}
                alt={getOrganizationName(boat.organization)}
                className="h-8 w-auto"
              />
              <Badge variant="outline" className="bg-white">{boat.type}</Badge>
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
              <Button variant="outline" className="gap-2" onClick={() => showFeatureModal('flagIssue')}>
                <Flag className="h-4 w-4" />
                Flag Issue
              </Button>
            )}
            {permissions.canChangeStatus && (
              <Button
                className="gap-2 bg-green-500 hover:bg-green-600 text-white"
                onClick={() => showFeatureModal('markBoatOK')}
              >
                <CheckCircle className="h-4 w-4" />
                Mark OK
              </Button>
            )}
            {permissions.canEdit && (
              <Button variant="outline" className="gap-2" onClick={() => showFeatureModal('editBoat')}>
                <Edit className="h-4 w-4" />
                Edit Details
              </Button>
            )}
            {permissions.canDelete && (
              <Button variant="outline" size="icon" onClick={() => showFeatureModal('deleteBoat')}>
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
                  <Button onClick={() => showFeatureModal('saveLogEntry')}>
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

            {/* Reservations */}
            <ReservationsSection boatId={id!} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
