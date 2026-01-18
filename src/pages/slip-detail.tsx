import { useState } from 'react';
import { useRoute, Link, useLocation } from 'wouter';
import { AppShell } from '@/components/AppShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { mockStore } from '@/lib/mockDataStore';
import type {
  Slip, SlipStatus, SlipType, SlipMember, SlipMemberAssignment,
  SlipBoatAssignment, SlipPayment, SlipReservation, PaymentMethod,
  MemberAssignmentRole, Boat
} from '@/lib/types';
import {
  ChevronLeft, ChevronRight, ChevronDown, MapPin, Calendar, User,
  AlertTriangle, DollarSign, Mail, Pencil, Trash2,
  Anchor, Ruler, Loader2, Phone, Users, Ship, CreditCard,
  CalendarPlus, CalendarDays, Plus, Zap, Droplets, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameDay, addMonths, subMonths, isWithinInterval, parseISO } from 'date-fns';
import { useDemoAuth } from '@/hooks/use-demo-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

// Status badge styles
const statusStyles: Record<SlipStatus, string> = {
  'available': 'bg-green-500 text-white border-green-600',
  'occupied': 'bg-blue-500 text-white border-blue-600',
  'reserved': 'bg-purple-500 text-white border-purple-600',
  'maintenance': 'bg-orange-500 text-white border-orange-600',
  'unavailable': 'bg-gray-400 text-white border-gray-500',
};

const statusLabels: Record<SlipStatus, string> = {
  'available': 'Available',
  'occupied': 'Occupied',
  'reserved': 'Reserved',
  'maintenance': 'Maintenance',
  'unavailable': 'Unavailable',
};

const slipTypeLabels: Record<SlipType, string> = {
  'standard': 'Standard',
  'large': 'Large',
  'covered': 'Covered',
  'end-tie': 'End Tie',
  't-head': 'T-Head',
};

export function SlipDetailPage() {
  const [, params] = useRoute('/slips/:id');
  const id = params?.id;
  const { user, role } = useDemoAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Fetch slip data
  const { data: slip, isLoading: slipLoading } = useQuery({
    queryKey: ['slip', id],
    queryFn: () => mockStore.getSlip(id!),
    enabled: !!id,
  });

  // Fetch member assignments
  const { data: memberAssignments = [] } = useQuery({
    queryKey: ['slip-member-assignments', id],
    queryFn: () => mockStore.getSlipMemberAssignments(id!),
    enabled: !!id,
  });

  // Fetch all members for assignment dialog
  const { data: allMembers = [] } = useQuery({
    queryKey: ['slip-members'],
    queryFn: () => mockStore.getSlipMembers(),
  });

  // Fetch boat assignments
  const { data: boatAssignments = [] } = useQuery({
    queryKey: ['slip-boat-assignments', id],
    queryFn: () => mockStore.getSlipBoatAssignments(id!),
    enabled: !!id,
  });

  // Fetch all boats for assignment dialog
  const { data: allBoats = [] } = useQuery({
    queryKey: ['boats'],
    queryFn: () => mockStore.getBoats(),
  });

  // Fetch payments
  const { data: payments = [] } = useQuery({
    queryKey: ['slip-payments', id],
    queryFn: () => mockStore.getSlipPayments(id!),
    enabled: !!id,
  });

  // Fetch reservations
  const { data: reservations = [] } = useQuery({
    queryKey: ['slip-reservations', id],
    queryFn: () => mockStore.getSlipReservations(id!),
    enabled: !!id,
  });

  // Mutations
  const updateSlipMutation = useMutation({
    mutationFn: (data: Partial<Slip>) => mockStore.updateSlip(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slip', id] });
      queryClient.invalidateQueries({ queryKey: ['slips'] });
    },
  });

  const deleteSlipMutation = useMutation({
    mutationFn: () => mockStore.deleteSlip(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slips'] });
      toast({ title: 'Slip Deleted', description: 'Slip removed from marina.' });
      setLocation('/slips');
    },
  });

  // Redirect non-admins
  if (user && role !== 'admin') {
    setLocation('/');
    return null;
  }

  if (slipLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppShell>
    );
  }

  if (!slip) return <AppShell><div className="p-8">Slip not found</div></AppShell>;

  const handleStatusChange = (newStatus: SlipStatus) => {
    if (!id) return;
    updateSlipMutation.mutate({ status: newStatus });
    toast({
      title: 'Status Updated',
      description: `Slip marked as ${statusLabels[newStatus]}`,
    });
  };

  const handleDelete = () => {
    if (!id) return;
    deleteSlipMutation.mutate();
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
        <Link href="/slips">
          <Button variant="ghost" size="sm" className="self-start pl-0 text-muted-foreground hover:text-primary">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to Slips
          </Button>
        </Link>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <Badge variant="outline" className="text-sm py-1">{slipTypeLabels[slip.slipType] || slip.slipType}</Badge>
              <Badge variant="outline" className="text-sm py-1">Dock {slip.dock}</Badge>
              {slip.hasElectric && (
                <Badge variant="outline" className="text-sm py-1 gap-1">
                  <Zap className="h-3 w-3" /> Electric
                </Badge>
              )}
              {slip.hasWater && (
                <Badge variant="outline" className="text-sm py-1 gap-1">
                  <Droplets className="h-3 w-3" /> Water
                </Badge>
              )}
            </div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight mb-1">{slip.displayName}</h1>
            <p className="text-xl text-muted-foreground">Slip #{slip.slipNumber}</p>
          </div>

          <div className="flex flex-col items-end gap-3">
            <StatusBadge status={slip.status} className="text-lg px-4 py-1.5" />
            {user && (
              <div className="flex gap-2 flex-wrap justify-end">
                <Select value={slip.status} onValueChange={(v) => handleStatusChange(v as SlipStatus)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Change status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                  </SelectContent>
                </Select>

                <EditSlipDialog slip={slip} />

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="icon" className="text-destructive border-destructive/20 hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Slip?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete <b>{slip.displayName}</b> and remove all associated members, payments, and reservations.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Left Column: Info & Details */}
          <div className="space-y-6">
            {/* Notes */}
            {slip.notes && (
              <Card className="bg-yellow-50 border-yellow-200 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-yellow-800 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" /> Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-yellow-800/80">{slip.notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Slip Details */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Slip Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {slip.location && (
                  <>
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Location</p>
                        <p className="text-muted-foreground">{slip.location}</p>
                      </div>
                    </div>
                    <Separator />
                  </>
                )}
                {(slip.length || slip.width || slip.depth) && (
                  <>
                    <div className="flex items-center gap-3 text-sm">
                      <Ruler className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Dimensions</p>
                        <p className="text-muted-foreground">
                          {[
                            slip.length && `${slip.length} L`,
                            slip.width && `${slip.width} W`,
                            slip.depth && `${slip.depth} D`
                          ].filter(Boolean).join(' × ')}
                        </p>
                      </div>
                    </div>
                    <Separator />
                  </>
                )}
                {(slip.monthlyRate || slip.annualRate) && (
                  <div className="flex items-center gap-3 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Slip Rates</p>
                      <p className="text-muted-foreground">
                        {slip.monthlyRate && `$${slip.monthlyRate}/mo`}
                        {slip.monthlyRate && slip.annualRate && ' · '}
                        {slip.annualRate && `$${slip.annualRate}/yr`}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {slip.hasElectric ? (
                    <Badge variant="secondary" className="gap-1">
                      <Zap className="h-3 w-3" /> Electric Hookup
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1 text-muted-foreground">
                      <Zap className="h-3 w-3" /> No Electric
                    </Badge>
                  )}
                  {slip.hasWater ? (
                    <Badge variant="secondary" className="gap-1">
                      <Droplets className="h-3 w-3" /> Water Access
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1 text-muted-foreground">
                      <Droplets className="h-3 w-3" /> No Water
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Members, Boats, Payments, Reservations */}
          <div className="md:col-span-2 space-y-6">

            {/* Members Section */}
            <MembersSection
              slipId={id!}
              memberAssignments={memberAssignments}
              allMembers={allMembers}
            />

            {/* Boats Section */}
            <BoatsSection
              slipId={id!}
              boatAssignments={boatAssignments}
              allBoats={allBoats}
            />

            {/* Payments Section */}
            <PaymentsSection
              slipId={id!}
              payments={payments}
              members={allMembers}
            />

            {/* Reservations Section */}
            <ReservationsSection
              slipId={id!}
              reservations={reservations}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function StatusBadge({ status, className }: { status: SlipStatus, className?: string }) {
  return (
    <Badge className={cn('rounded-full font-bold shadow-sm', statusStyles[status] || statusStyles['unavailable'], className)}>
      {statusLabels[status] || status}
    </Badge>
  );
}

function EditSlipDialog({ slip }: { slip: Slip }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    slipNumber: slip.slipNumber,
    displayName: slip.displayName,
    dock: slip.dock,
    location: slip.location || '',
    slipType: slip.slipType,
    length: slip.length || '',
    width: slip.width || '',
    depth: slip.depth || '',
    hasElectric: slip.hasElectric || false,
    hasWater: slip.hasWater || false,
    monthlyRate: slip.monthlyRate?.toString() || '',
    annualRate: slip.annualRate?.toString() || '',
    notes: slip.notes || ''
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Slip>) => mockStore.updateSlip(slip.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slip', slip.id] });
      queryClient.invalidateQueries({ queryKey: ['slips'] });
      toast({
        title: 'Slip Updated',
        description: `${formData.displayName} details saved.`,
      });
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update slip details.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = () => {
    updateMutation.mutate({
      slipNumber: formData.slipNumber,
      displayName: formData.displayName,
      dock: formData.dock,
      location: formData.location || undefined,
      slipType: formData.slipType,
      length: formData.length || undefined,
      width: formData.width || undefined,
      depth: formData.depth || undefined,
      hasElectric: formData.hasElectric,
      hasWater: formData.hasWater,
      monthlyRate: formData.monthlyRate ? Number(formData.monthlyRate) : undefined,
      annualRate: formData.annualRate ? Number(formData.annualRate) : undefined,
      notes: formData.notes || undefined
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Pencil className="h-4 w-4" /> Edit Details
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Slip Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Basic Info */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Basic Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Slip Number</Label>
                <Input value={formData.slipNumber} onChange={e => setFormData({...formData, slipNumber: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label>Display Name</Label>
                <Input value={formData.displayName} onChange={e => setFormData({...formData, displayName: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Dock</Label>
                <Input value={formData.dock} onChange={e => setFormData({...formData, dock: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label>Slip Type</Label>
                <Select value={formData.slipType} onValueChange={v => setFormData({...formData, slipType: v as SlipType})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                    <SelectItem value="covered">Covered</SelectItem>
                    <SelectItem value="end-tie">End Tie</SelectItem>
                    <SelectItem value="t-head">T-Head</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Location Description</Label>
              <Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g., North side, near fuel dock" />
            </div>
          </div>

          <Separator />

          {/* Dimensions */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Dimensions</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>Length</Label>
                <Input value={formData.length} onChange={e => setFormData({...formData, length: e.target.value})} placeholder="e.g., 40 ft" />
              </div>
              <div className="grid gap-2">
                <Label>Width</Label>
                <Input value={formData.width} onChange={e => setFormData({...formData, width: e.target.value})} placeholder="e.g., 14 ft" />
              </div>
              <div className="grid gap-2">
                <Label>Depth</Label>
                <Input value={formData.depth} onChange={e => setFormData({...formData, depth: e.target.value})} placeholder="e.g., 8 ft" />
              </div>
            </div>
          </div>

          <Separator />

          {/* Amenities */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Amenities</h4>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasElectric}
                  onChange={e => setFormData({...formData, hasElectric: e.target.checked})}
                  className="rounded"
                />
                <Zap className="h-4 w-4" />
                Electric Hookup
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasWater}
                  onChange={e => setFormData({...formData, hasWater: e.target.checked})}
                  className="rounded"
                />
                <Droplets className="h-4 w-4" />
                Water Access
              </label>
            </div>
          </div>

          <Separator />

          {/* Rates */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Slip Rates</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Monthly Rate ($)</Label>
                <Input type="number" value={formData.monthlyRate} onChange={e => setFormData({...formData, monthlyRate: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label>Annual Rate ($)</Label>
                <Input type="number" value={formData.annualRate} onChange={e => setFormData({...formData, annualRate: e.target.value})} />
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid gap-2">
            <Label>Notes</Label>
            <Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Any additional notes about this slip" rows={3} />
          </div>

          <Button onClick={handleSubmit} disabled={updateMutation.isPending} className="bg-[#1f2937] hover:bg-[#374151]">
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MembersSection({ slipId, memberAssignments, allMembers }: {
  slipId: string;
  memberAssignments: SlipMemberAssignment[];
  allMembers: SlipMember[];
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const queryClient = useQueryClient();

  // Find members that are already assigned
  const assignedMemberIds = memberAssignments.map(a => a.memberId);
  const availableMembers = allMembers.filter(m => !assignedMemberIds.includes(m.id));

  const createMemberMutation = useMutation({
    mutationFn: (data: Partial<SlipMember>) => mockStore.createSlipMember(data as Omit<SlipMember, 'id' | 'createdAt' | 'updatedAt'>),
    onSuccess: (newMember) => {
      queryClient.invalidateQueries({ queryKey: ['slip-members'] });
      toast({ title: 'Member Created', description: 'New member has been added.' });
      setShowCreateDialog(false);
      // Auto-assign the new member
      assignMemberMutation.mutate({ slipId, memberId: newMember.id, role: 'primary' as MemberAssignmentRole });
    },
  });

  const assignMemberMutation = useMutation({
    mutationFn: (data: { slipId: string; memberId: string; role: MemberAssignmentRole }) =>
      mockStore.createSlipMemberAssignment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slip-member-assignments', slipId] });
      toast({ title: 'Member Assigned', description: 'Member has been assigned to this slip.' });
      setShowAddDialog(false);
    },
  });

  const unassignMemberMutation = useMutation({
    mutationFn: (assignmentId: string) => mockStore.deleteSlipMemberAssignment(assignmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slip-member-assignments', slipId] });
      toast({ title: 'Member Removed', description: 'Member has been removed from this slip.' });
    },
  });

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="shadow-sm overflow-hidden">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
            aria-expanded={isOpen}
          >
            <span className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" /> Members
              {memberAssignments.length > 0 && (
                <Badge variant="secondary" className="ml-2">{memberAssignments.length}</Badge>
              )}
            </span>
            <ChevronDown className={cn(
              'h-5 w-5 text-muted-foreground transition-transform duration-200',
              isOpen && 'rotate-180'
            )} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 border-t">
            <div className="py-4 space-y-4">
              {/* Add Member Buttons */}
              <div className="flex gap-2 flex-wrap">
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2" disabled={availableMembers.length === 0}>
                      <Plus className="h-4 w-4" /> Assign Existing Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Assign Member to Slip</DialogTitle>
                    </DialogHeader>
                    <AssignMemberForm
                      availableMembers={availableMembers}
                      onAssign={(memberId, role) => assignMemberMutation.mutate({ slipId, memberId, role })}
                      isLoading={assignMemberMutation.isPending}
                    />
                  </DialogContent>
                </Dialog>

                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Plus className="h-4 w-4" /> Create New Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Create New Member</DialogTitle>
                    </DialogHeader>
                    <CreateMemberForm
                      onSubmit={(data) => createMemberMutation.mutate(data)}
                      isLoading={createMemberMutation.isPending}
                    />
                  </DialogContent>
                </Dialog>
              </div>

              {/* Members List */}
              {memberAssignments.length === 0 ? (
                <p className="text-muted-foreground text-center py-4 italic">
                  No members assigned to this slip
                </p>
              ) : (
                <div className="space-y-3">
                  {memberAssignments.map((assignment) => {
                    const member = allMembers.find(m => m.id === assignment.memberId);
                    if (!member) return null;

                    return (
                      <Card key={assignment.id} className="shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{member.firstName} {member.lastName}</span>
                                <Badge variant="outline" className="text-xs">{assignment.role}</Badge>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                <a href={`mailto:${member.email}`} className="hover:underline">{member.email}</a>
                              </div>
                              {member.phone && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Phone className="h-3 w-3" />
                                  <span>{member.phone}</span>
                                </div>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => unassignMemberMutation.mutate(assignment.id)}
                              title="Remove member"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function AssignMemberForm({ availableMembers, onAssign, isLoading }: {
  availableMembers: SlipMember[];
  onAssign: (memberId: string, role: MemberAssignmentRole) => void;
  isLoading: boolean;
}) {
  const [memberId, setMemberId] = useState('');
  const [role, setRole] = useState<MemberAssignmentRole>('primary');

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Member</Label>
        <Select value={memberId} onValueChange={setMemberId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a member" />
          </SelectTrigger>
          <SelectContent>
            {availableMembers.map(m => (
              <SelectItem key={m.id} value={m.id}>{m.firstName} {m.lastName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Role</Label>
        <Select value={role} onValueChange={(v) => setRole(v as MemberAssignmentRole)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="primary">Primary</SelectItem>
            <SelectItem value="secondary">Secondary</SelectItem>
            <SelectItem value="emergency">Emergency Contact</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={() => onAssign(memberId, role)} disabled={!memberId || isLoading} className="w-full bg-[#1f2937] hover:bg-[#374151]">
        {isLoading ? 'Assigning...' : 'Assign Member'}
      </Button>
    </div>
  );
}

function CreateMemberForm({ onSubmit, isLoading }: {
  onSubmit: (data: Partial<SlipMember>) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    notes: '',
    isActive: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>First Name *</Label>
          <Input value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} required />
        </div>
        <div className="space-y-2">
          <Label>Last Name *</Label>
          <Input value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} required />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Email *</Label>
        <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
      </div>
      <div className="space-y-2">
        <Label>Phone</Label>
        <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
      </div>
      <Separator />
      <div className="space-y-2">
        <Label>Address</Label>
        <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>City</Label>
          <Input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
        </div>
        <div className="space-y-2">
          <Label>State</Label>
          <Input value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
        </div>
        <div className="space-y-2">
          <Label>Zip</Label>
          <Input value={formData.zipCode} onChange={e => setFormData({...formData, zipCode: e.target.value})} />
        </div>
      </div>
      <Separator />
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Emergency Contact</Label>
          <Input value={formData.emergencyContactName} onChange={e => setFormData({...formData, emergencyContactName: e.target.value})} placeholder="Name" />
        </div>
        <div className="space-y-2">
          <Label>Emergency Phone</Label>
          <Input value={formData.emergencyContactPhone} onChange={e => setFormData({...formData, emergencyContactPhone: e.target.value})} placeholder="Phone" />
        </div>
      </div>
      <Button type="submit" disabled={!formData.firstName || !formData.lastName || !formData.email || isLoading} className="w-full bg-[#1f2937] hover:bg-[#374151]">
        {isLoading ? 'Creating...' : 'Create Member'}
      </Button>
    </form>
  );
}

function BoatsSection({ slipId, boatAssignments, allBoats }: {
  slipId: string;
  boatAssignments: SlipBoatAssignment[];
  allBoats: Boat[];
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const queryClient = useQueryClient();

  // Find boats that are already assigned
  const assignedBoatIds = boatAssignments.map(a => a.boatId);
  const availableBoats = allBoats.filter(b => !assignedBoatIds.includes(b.id));

  const assignBoatMutation = useMutation({
    mutationFn: (data: { slipId: string; boatId: string; notes?: string }) =>
      mockStore.createSlipBoatAssignment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slip-boat-assignments', slipId] });
      toast({ title: 'Boat Assigned', description: 'Boat has been assigned to this slip.' });
      setShowAddDialog(false);
    },
  });

  const unassignBoatMutation = useMutation({
    mutationFn: (assignmentId: string) => mockStore.deleteSlipBoatAssignment(assignmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slip-boat-assignments', slipId] });
      toast({ title: 'Boat Removed', description: 'Boat has been removed from this slip.' });
    },
  });

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="shadow-sm overflow-hidden">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
            aria-expanded={isOpen}
          >
            <span className="text-lg font-semibold flex items-center gap-2">
              <Ship className="h-5 w-5" /> Boats
              {boatAssignments.length > 0 && (
                <Badge variant="secondary" className="ml-2">{boatAssignments.length}</Badge>
              )}
            </span>
            <ChevronDown className={cn(
              'h-5 w-5 text-muted-foreground transition-transform duration-200',
              isOpen && 'rotate-180'
            )} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 border-t">
            <div className="py-4 space-y-4">
              {/* Add Boat Button */}
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2" disabled={availableBoats.length === 0}>
                    <Plus className="h-4 w-4" /> Assign Boat from Fleet
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Assign Boat to Slip</DialogTitle>
                  </DialogHeader>
                  <AssignBoatForm
                    availableBoats={availableBoats}
                    onAssign={(boatId, notes) => assignBoatMutation.mutate({ slipId, boatId, notes })}
                    isLoading={assignBoatMutation.isPending}
                  />
                </DialogContent>
              </Dialog>

              {/* Boats List */}
              {boatAssignments.length === 0 ? (
                <p className="text-muted-foreground text-center py-4 italic">
                  No boats assigned to this slip
                </p>
              ) : (
                <div className="space-y-3">
                  {boatAssignments.map((assignment) => {
                    const boat = allBoats.find(b => b.id === assignment.boatId);
                    if (!boat) return null;

                    return (
                      <Card key={assignment.id} className="shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Anchor className="h-4 w-4 text-muted-foreground" />
                                <Link href={`/fleet/${boat.id}`} className="font-medium hover:underline text-primary">
                                  {boat.displayName}
                                </Link>
                                <Badge variant="outline" className="text-xs">{boat.type}</Badge>
                              </div>
                              {boat.hullNumber && (
                                <p className="text-sm text-muted-foreground">Hull #{boat.hullNumber}</p>
                              )}
                              {assignment.notes && (
                                <p className="text-sm text-muted-foreground italic">{assignment.notes}</p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => unassignBoatMutation.mutate(assignment.id)}
                              title="Remove boat"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function AssignBoatForm({ availableBoats, onAssign, isLoading }: {
  availableBoats: Boat[];
  onAssign: (boatId: string, notes?: string) => void;
  isLoading: boolean;
}) {
  const [boatId, setBoatId] = useState('');
  const [notes, setNotes] = useState('');

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Boat</Label>
        <Select value={boatId} onValueChange={setBoatId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a boat" />
          </SelectTrigger>
          <SelectContent>
            {availableBoats.map(b => (
              <SelectItem key={b.id} value={b.id}>{b.displayName} ({b.type})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Notes (optional)</Label>
        <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any notes about this assignment" />
      </div>
      <Button onClick={() => onAssign(boatId, notes || undefined)} disabled={!boatId || isLoading} className="w-full bg-[#1f2937] hover:bg-[#374151]">
        {isLoading ? 'Assigning...' : 'Assign Boat'}
      </Button>
    </div>
  );
}

function PaymentsSection({ slipId, payments, members }: {
  slipId: string;
  payments: SlipPayment[];
  members: SlipMember[];
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const queryClient = useQueryClient();

  const sortedPayments = [...payments].sort((a, b) =>
    new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
  );

  const createPaymentMutation = useMutation({
    mutationFn: (data: Omit<SlipPayment, 'id' | 'createdAt'>) => mockStore.createSlipPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slip-payments', slipId] });
      toast({ title: 'Payment Recorded', description: 'Payment has been recorded.' });
      setShowAddDialog(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Payment Failed',
        description: error.message || 'Could not record payment. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const deletePaymentMutation = useMutation({
    mutationFn: (paymentId: string) => mockStore.deleteSlipPayment(paymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slip-payments', slipId] });
      toast({ title: 'Payment Deleted', description: 'Payment record has been removed.' });
    },
  });

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="shadow-sm overflow-hidden">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
            aria-expanded={isOpen}
          >
            <span className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="h-5 w-5" /> Payments
              {payments.length > 0 && (
                <Badge variant="secondary" className="ml-2">{payments.length}</Badge>
              )}
            </span>
            <ChevronDown className={cn(
              'h-5 w-5 text-muted-foreground transition-transform duration-200',
              isOpen && 'rotate-180'
            )} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 border-t">
            <div className="py-4 space-y-4">
              {/* Add Payment Button */}
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" /> Record Payment
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Record Payment</DialogTitle>
                  </DialogHeader>
                  <RecordPaymentForm
                    slipId={slipId}
                    members={members}
                    onSubmit={(data) => createPaymentMutation.mutate(data)}
                    isLoading={createPaymentMutation.isPending}
                  />
                </DialogContent>
              </Dialog>

              {/* Payments List */}
              {sortedPayments.length === 0 ? (
                <p className="text-muted-foreground text-center py-4 italic">
                  No payments recorded
                </p>
              ) : (
                <div className="space-y-3">
                  {sortedPayments.map((payment) => {
                    const member = members.find(m => m.id === payment.memberId);

                    return (
                      <Card key={payment.id} className="shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <span className="font-bold text-lg">${payment.amount.toLocaleString()}</span>
                                <Badge variant={payment.status === 'completed' ? 'secondary' : 'outline'} className="text-xs">
                                  {payment.status}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>{format(parseISO(payment.paymentDate), 'MMM d, yyyy')}</span>
                                <span>·</span>
                                <span className="capitalize">{payment.paymentMethod}</span>
                              </div>
                              {member && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <User className="h-3 w-3" />
                                  <span>{member.firstName} {member.lastName}</span>
                                </div>
                              )}
                              {(payment.periodStart || payment.periodEnd) && (
                                <div className="text-xs text-muted-foreground">
                                  Period: {payment.periodStart && format(parseISO(payment.periodStart), 'MMM d')}
                                  {payment.periodEnd && ` - ${format(parseISO(payment.periodEnd), 'MMM d, yyyy')}`}
                                </div>
                              )}
                              {payment.notes && (
                                <p className="text-sm text-muted-foreground italic">{payment.notes}</p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => deletePaymentMutation.mutate(payment.id)}
                              title="Delete payment"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function RecordPaymentForm({ slipId, members, onSubmit, isLoading }: {
  slipId: string;
  members: SlipMember[];
  onSubmit: (data: Omit<SlipPayment, 'id' | 'createdAt'>) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    memberId: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'check' as PaymentMethod,
    periodStart: '',
    periodEnd: '',
    referenceNumber: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      slipId,
      memberId: formData.memberId || undefined,
      amount: Number(formData.amount),
      paymentDate: formData.paymentDate,
      paymentMethod: formData.paymentMethod,
      periodStart: formData.periodStart || undefined,
      periodEnd: formData.periodEnd || undefined,
      referenceNumber: formData.referenceNumber || undefined,
      notes: formData.notes || undefined,
      status: 'completed'
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Amount *</Label>
          <Input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="0.00" required />
        </div>
        <div className="space-y-2">
          <Label>Payment Date *</Label>
          <Input type="date" value={formData.paymentDate} onChange={e => setFormData({...formData, paymentDate: e.target.value})} required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Payment Method *</Label>
          <Select value={formData.paymentMethod} onValueChange={(v) => setFormData({...formData, paymentMethod: v as PaymentMethod})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="check">Check</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="card">Card</SelectItem>
              <SelectItem value="transfer">Bank Transfer</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Member (optional)</Label>
          <Select value={formData.memberId} onValueChange={v => setFormData({...formData, memberId: v})}>
            <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
            <SelectContent>
              {members.map(m => (
                <SelectItem key={m.id} value={m.id}>{m.firstName} {m.lastName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Period Start</Label>
          <Input type="date" value={formData.periodStart} onChange={e => setFormData({...formData, periodStart: e.target.value})} />
        </div>
        <div className="space-y-2">
          <Label>Period End</Label>
          <Input type="date" value={formData.periodEnd} onChange={e => setFormData({...formData, periodEnd: e.target.value})} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Reference Number</Label>
        <Input value={formData.referenceNumber} onChange={e => setFormData({...formData, referenceNumber: e.target.value})} placeholder="Check # or transaction ID" />
      </div>
      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Any notes about this payment" rows={2} />
      </div>
      <Button type="submit" disabled={!formData.amount || !formData.paymentDate || isLoading} className="w-full bg-[#1f2937] hover:bg-[#374151]">
        {isLoading ? 'Recording...' : 'Record Payment'}
      </Button>
    </form>
  );
}

function ReservationsSection({ slipId, reservations }: {
  slipId: string;
  reservations: SlipReservation[];
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const queryClient = useQueryClient();

  const today = new Date().toISOString().split('T')[0];
  const todayDate = new Date();

  // Filter to show only current and future reservations
  const activeReservations = reservations.filter(r => r.endDate >= today);
  const sortedReservations = [...activeReservations].sort((a, b) =>
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  const createReservationMutation = useMutation({
    mutationFn: (data: Omit<SlipReservation, 'id' | 'createdAt'>) => mockStore.createSlipReservation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slip-reservations', slipId] });
      toast({ title: 'Reservation Created', description: 'Reservation has been created.' });
      setShowForm(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Reservation Failed',
        description: error.message || 'Could not create reservation.',
        variant: 'destructive',
      });
    },
  });

  const deleteReservationMutation = useMutation({
    mutationFn: (reservationId: string) => mockStore.deleteSlipReservation(reservationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slip-reservations', slipId] });
      toast({ title: 'Reservation Deleted', description: 'Reservation has been removed.' });
    },
  });

  // Check if a date falls within any reservation
  const getReservationForDate = (date: Date): SlipReservation | undefined => {
    return reservations.find(r => {
      const start = parseISO(r.startDate);
      const end = parseISO(r.endDate);
      return isWithinInterval(date, { start, end });
    });
  };

  // Generate calendar days for the current month view
  const monthStart = startOfMonth(calendarMonth);
  const monthEnd = endOfMonth(calendarMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = monthStart.getDay();

  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reservedBy: '',
    email: '',
    phone: '',
    reason: '',
    boatInfo: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createReservationMutation.mutate({
      slipId,
      startDate: formData.startDate,
      endDate: formData.endDate,
      reservedBy: formData.reservedBy,
      email: formData.email,
      phone: formData.phone || undefined,
      reason: formData.reason || undefined,
      boatInfo: formData.boatInfo || undefined,
      status: 'confirmed'
    });
    setFormData({ startDate: '', endDate: '', reservedBy: '', email: '', phone: '', reason: '', boatInfo: '' });
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="shadow-sm overflow-hidden">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
            aria-expanded={isOpen}
          >
            <span className="text-lg font-semibold flex items-center gap-2">
              <CalendarDays className="h-5 w-5" /> Reservations
              {activeReservations.length > 0 && (
                <Badge variant="secondary" className="ml-2">{activeReservations.length}</Badge>
              )}
            </span>
            <ChevronDown className={cn(
              'h-5 w-5 text-muted-foreground transition-transform duration-200',
              isOpen && 'rotate-180'
            )} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 border-t">
            <div className="py-4 space-y-4">
              {/* Add Reservation Button */}
              {!showForm && (
                <Button variant="outline" className="w-full gap-2" onClick={() => setShowForm(true)}>
                  <CalendarPlus className="h-4 w-4" /> Create Reservation
                </Button>
              )}

              {/* Reservation Form */}
              {showForm && (
                <Card className="border-primary/20">
                  <CardContent className="pt-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Start Date *</Label>
                          <Input
                            type="date"
                            min={today}
                            value={formData.startDate}
                            onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>End Date *</Label>
                          <Input
                            type="date"
                            min={formData.startDate || today}
                            value={formData.endDate}
                            onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Reserved By *</Label>
                        <Input
                          placeholder="Name of person reserving"
                          value={formData.reservedBy}
                          onChange={(e) => setFormData({...formData, reservedBy: e.target.value})}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Email *</Label>
                          <Input
                            type="email"
                            placeholder="email@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Phone</Label>
                          <Input
                            placeholder="(555) 123-4567"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Boat Information</Label>
                        <Input
                          placeholder="Boat name, type, length"
                          value={formData.boatInfo}
                          onChange={(e) => setFormData({...formData, boatInfo: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Reason/Notes</Label>
                        <Input
                          placeholder="Purpose of reservation"
                          value={formData.reason}
                          onChange={(e) => setFormData({...formData, reason: e.target.value})}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" className="flex-1 bg-[#1f2937] hover:bg-[#374151]" disabled={createReservationMutation.isPending}>
                          {createReservationMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            'Create Reservation'
                          )}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Calendar View */}
              <Card className="border-muted">
                <CardContent className="p-4">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h4 className="font-semibold">
                      {format(calendarMonth, 'MMMM yyyy')}
                    </h4>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {/* Day headers */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                        {day}
                      </div>
                    ))}

                    {/* Empty cells for days before month starts */}
                    {Array.from({ length: startDayOfWeek }).map((_, i) => (
                      <div key={`empty-${i}`} className="aspect-square" />
                    ))}

                    {/* Calendar days */}
                    {calendarDays.map(day => {
                      const reservation = getReservationForDate(day);
                      const isReserved = !!reservation;
                      const isTodayDate = isToday(day);
                      const isPast = day < todayDate && !isSameDay(day, todayDate);

                      return (
                        <Popover key={day.toISOString()}>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              disabled={!isReserved}
                              className={cn(
                                'aspect-square flex items-center justify-center text-sm rounded-md transition-colors',
                                isPast && 'text-muted-foreground/50',
                                isTodayDate && 'ring-2 ring-primary ring-offset-1',
                                isReserved && 'bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer',
                                !isReserved && !isPast && 'hover:bg-muted',
                                !isReserved && 'cursor-default'
                              )}
                            >
                              {format(day, 'd')}
                            </button>
                          </PopoverTrigger>
                          {reservation && (
                            <PopoverContent className="w-64 p-3">
                              <div className="space-y-2">
                                <div className="font-semibold text-sm">
                                  {format(parseISO(reservation.startDate), 'MMM d')} - {format(parseISO(reservation.endDate), 'MMM d')}
                                </div>
                                <div className="text-sm">
                                  <span className="font-medium">Reserved by:</span> {reservation.reservedBy}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  <a href={`mailto:${reservation.email}`} className="hover:underline">
                                    {reservation.email}
                                  </a>
                                </div>
                                {reservation.boatInfo && (
                                  <div className="text-sm text-muted-foreground">
                                    <span className="font-medium">Boat:</span> {reservation.boatInfo}
                                  </div>
                                )}
                                {reservation.reason && (
                                  <div className="text-sm text-muted-foreground italic">
                                    {reservation.reason}
                                  </div>
                                )}
                              </div>
                            </PopoverContent>
                          )}
                        </Popover>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-primary" />
                      <span>Reserved</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-background border" />
                      <span>Available</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Reservations List */}
              {sortedReservations.length === 0 ? (
                <p className="text-muted-foreground text-center py-4 italic">
                  No upcoming reservations
                </p>
              ) : (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground">Upcoming Reservations</h4>
                  {sortedReservations.map((reservation) => {
                    const isActive = reservation.startDate <= today && reservation.endDate >= today;

                    return (
                      <Card key={reservation.id} className={cn(
                        'shadow-sm',
                        isActive && 'border-primary bg-primary/5'
                      )}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">
                                  {format(parseISO(reservation.startDate), 'MMM d')} - {format(parseISO(reservation.endDate), 'MMM d, yyyy')}
                                </span>
                                {isActive && (
                                  <Badge className="bg-primary text-primary-foreground text-xs">Active</Badge>
                                )}
                                <Badge variant="outline" className="text-xs">{reservation.status}</Badge>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <User className="h-3 w-3 text-muted-foreground" />
                                <span>{reservation.reservedBy}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                <a href={`mailto:${reservation.email}`} className="hover:underline">
                                  {reservation.email}
                                </a>
                              </div>
                              {reservation.boatInfo && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Anchor className="h-3 w-3" />
                                  <span>{reservation.boatInfo}</span>
                                </div>
                              )}
                              {reservation.reason && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {reservation.reason}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => deleteReservationMutation.mutate(reservation.id)}
                              title="Delete reservation"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
