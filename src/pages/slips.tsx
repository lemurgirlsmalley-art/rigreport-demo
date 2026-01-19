import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { AppShell } from '@/components/AppShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { mockStore } from '@/lib/mockDataStore';
import type { Slip, SlipStatus, SlipType } from '@/lib/types';
import { Search, Anchor, MapPin, Zap, Droplets, Loader2, Plus, DollarSign, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { cn } from '@/lib/utils';
import { useDemoAuth } from '@/hooks/use-demo-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

export function SlipsPage() {
  const [, setLocation] = useLocation();
  const { user, role } = useDemoAuth();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dockFilter, setDockFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Form state for new slip
  const [newSlip, setNewSlip] = useState({
    slipNumber: '',
    displayName: '',
    dock: '',
    location: '',
    slipType: 'standard' as SlipType,
    length: '',
    width: '',
    depth: '',
    hasElectric: false,
    hasWater: false,
    monthlyRate: '',
    annualRate: '',
    notes: '',
  });

  // Redirect non-admins
  if (user && role !== 'admin') {
    setLocation('/dashboard');
    return null;
  }

  const { data: slips = [], isLoading, error } = useQuery({
    queryKey: ['slips'],
    queryFn: () => mockStore.getSlips(),
  });

  const { data: allMembers = [] } = useQuery({
    queryKey: ['slip-members'],
    queryFn: () => mockStore.getSlipMembers(),
  });

  const { data: allMemberAssignments = [] } = useQuery({
    queryKey: ['slip-member-assignments'],
    queryFn: () => mockStore.getSlipMemberAssignments(),
  });

  const { data: allBoats = [] } = useQuery({
    queryKey: ['slip-boats'],
    queryFn: () => mockStore.getSlipBoats(),
  });

  const { data: allPayments = [] } = useQuery({
    queryKey: ['slip-payments'],
    queryFn: () => mockStore.getSlipPayments(),
  });

  const [isExporting, setIsExporting] = useState(false);

  const createSlipMutation = useMutation({
    mutationFn: (data: Omit<Slip, 'id' | 'createdAt' | 'updatedAt'>) => mockStore.createSlip(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slips'] });
      setIsAddDialogOpen(false);
      setNewSlip({
        slipNumber: '',
        displayName: '',
        dock: '',
        location: '',
        slipType: 'standard',
        length: '',
        width: '',
        depth: '',
        hasElectric: false,
        hasWater: false,
        monthlyRate: '',
        annualRate: '',
        notes: '',
      });
      toast({
        title: 'Slip created',
        description: 'The new slip has been added successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create slip',
        variant: 'destructive',
      });
    },
  });

  const handleCreateSlip = () => {
    createSlipMutation.mutate({
      ...newSlip,
      status: 'available',
      monthlyRate: newSlip.monthlyRate ? parseInt(newSlip.monthlyRate) : undefined,
      annualRate: newSlip.annualRate ? parseInt(newSlip.annualRate) : undefined,
    });
  };

  const handleExportToExcel = async () => {
    setIsExporting(true);
    try {
      const workbook = XLSX.utils.book_new();

      // Helper function to auto-size columns based on content
      const autoSizeColumns = (sheet: XLSX.WorkSheet, data: Record<string, unknown>[]) => {
        if (data.length === 0) return;
        const headers = Object.keys(data[0]);
        const colWidths = headers.map(header => {
          let maxLen = header.length;
          data.forEach(row => {
            const val = row[header];
            const len = val ? String(val).length : 0;
            if (len > maxLen) maxLen = len;
          });
          return { wch: Math.min(maxLen + 2, 50) };
        });
        sheet['!cols'] = colWidths;
      };

      // Sheet 1: Slips
      const slipsData = filteredSlips.map(slip => ({
        'Slip Number': slip.slipNumber,
        'Display Name': slip.displayName,
        'Dock': slip.dock,
        'Location': slip.location || '',
        'Type': slip.slipType,
        'Status': slip.status,
        'Length': slip.length || '',
        'Width': slip.width || '',
        'Depth': slip.depth || '',
        'Has Electric': slip.hasElectric ? 'Yes' : 'No',
        'Has Water': slip.hasWater ? 'Yes' : 'No',
        'Monthly Rate': slip.monthlyRate ? `$${slip.monthlyRate.toLocaleString()}` : '',
        'Annual Rate': slip.annualRate ? `$${slip.annualRate.toLocaleString()}` : '',
        'Insurance Provider': slip.insuranceProvider || '',
        'Policy Number': slip.insurancePolicyNumber || '',
        'Insurance Expiration': slip.insuranceExpiration || '',
        'Liability Coverage': slip.liabilityCoverage ? `$${slip.liabilityCoverage.toLocaleString()}` : '',
        'Notes': slip.notes || '',
      }));
      const slipsSheet = XLSX.utils.json_to_sheet(slipsData);
      autoSizeColumns(slipsSheet, slipsData);
      XLSX.utils.book_append_sheet(workbook, slipsSheet, 'Slips');

      // Sheet 2: Members
      const membersData = allMembers.map(member => ({
        'First Name': member.firstName,
        'Last Name': member.lastName,
        'Email': member.email,
        'Phone': member.phone || '',
        'Address': member.address || '',
        'City': member.city || '',
        'State': member.state || '',
        'Zip Code': member.zipCode || '',
        'Emergency Contact': member.emergencyContactName || '',
        'Emergency Phone': member.emergencyContactPhone || '',
        'Active': member.isActive ? 'Yes' : 'No',
        'Notes': member.notes || '',
      }));
      const membersSheet = XLSX.utils.json_to_sheet(membersData);
      autoSizeColumns(membersSheet, membersData);
      XLSX.utils.book_append_sheet(workbook, membersSheet, 'Members');

      // Sheet 3: Member Assignments
      const assignmentsData = allMemberAssignments.map(assignment => {
        const slip = slips.find(s => s.id === assignment.slipId);
        const member = allMembers.find(m => m.id === assignment.memberId);
        return {
          'Slip': slip?.displayName || assignment.slipId,
          'Member': member ? `${member.firstName} ${member.lastName}` : assignment.memberId,
          'Role': assignment.role,
          'Start Date': assignment.startDate || '',
          'End Date': assignment.endDate || '',
        };
      });
      const assignmentsSheet = XLSX.utils.json_to_sheet(assignmentsData);
      autoSizeColumns(assignmentsSheet, assignmentsData);
      XLSX.utils.book_append_sheet(workbook, assignmentsSheet, 'Member Assignments');

      // Sheet 4: Boats
      const boatsData = allBoats.map(boat => {
        const slip = slips.find(s => s.id === boat.slipId);
        return {
          'Slip': slip?.displayName || boat.slipId,
          'Boat Name': boat.boatName,
          'Type': boat.boatType || '',
          'Manufacturer': boat.manufacturer || '',
          'Model': boat.model || '',
          'Year': boat.year || '',
          'Length': boat.length || '',
          'Beam': boat.beam || '',
          'Draft': boat.draft || '',
          'Hull Color': boat.hullColor || '',
          'Registration #': boat.registrationNumber || '',
          'HIN': boat.hin || '',
          'Owner': boat.ownerName || '',
          'Active': boat.isActive ? 'Yes' : 'No',
          'Notes': boat.notes || '',
        };
      });
      const boatsSheet = XLSX.utils.json_to_sheet(boatsData);
      autoSizeColumns(boatsSheet, boatsData);
      XLSX.utils.book_append_sheet(workbook, boatsSheet, 'Boats');

      // Sheet 5: Payments
      const paymentsData = allPayments.map(payment => {
        const slip = slips.find(s => s.id === payment.slipId);
        const member = allMembers.find(m => m.id === payment.memberId);
        return {
          'Slip': slip?.displayName || payment.slipId,
          'Member': member ? `${member.firstName} ${member.lastName}` : '',
          'Amount': `$${payment.amount.toLocaleString()}`,
          'Payment Date': payment.paymentDate,
          'Method': payment.paymentMethod,
          'Period Start': payment.periodStart || '',
          'Period End': payment.periodEnd || '',
          'Status': payment.status,
          'Reference #': payment.referenceNumber || '',
          'Notes': payment.notes || '',
        };
      });
      const paymentsSheet = XLSX.utils.json_to_sheet(paymentsData);
      autoSizeColumns(paymentsSheet, paymentsData);
      XLSX.utils.book_append_sheet(workbook, paymentsSheet, 'Payments');

      // Generate filename with date
      const date = new Date().toISOString().split('T')[0];
      const filename = `slips-export-${date}.xlsx`;

      // Download
      XLSX.writeFile(workbook, filename);

      toast({
        title: 'Export Complete',
        description: `Slip data exported to ${filename}`,
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Could not export slip data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Get unique docks for filter
  const uniqueDocks = Array.from(new Set(slips.map((s) => s.dock))).filter(Boolean).sort();

  const filteredSlips = slips.filter((slip) => {
    const matchesSearch =
      slip.slipNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slip.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (slip.location && slip.location.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || slip.status === statusFilter;
    const matchesDock = dockFilter === 'all' || slip.dock === dockFilter;
    const matchesType = typeFilter === 'all' || slip.slipType === typeFilter;
    return matchesSearch && matchesStatus && matchesDock && matchesType;
  });

  if (!user) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Please log in to access slip management.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Slips</h1>
            <p className="text-muted-foreground">Manage marina slip assignments and rentals.</p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportToExcel}
              disabled={isExporting || slips.length === 0}
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-[#1f2937] hover:bg-[#374151]">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Slip
                </Button>
              </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Slip</DialogTitle>
                <DialogDescription>
                  Enter the details for the new marina slip.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="slipNumber">Slip Number *</Label>
                    <Input
                      id="slipNumber"
                      placeholder="e.g., A-12"
                      value={newSlip.slipNumber}
                      onChange={(e) => setNewSlip({ ...newSlip, slipNumber: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name *</Label>
                    <Input
                      id="displayName"
                      placeholder="e.g., Slip A-12"
                      value={newSlip.displayName}
                      onChange={(e) => setNewSlip({ ...newSlip, displayName: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dock">Dock *</Label>
                    <Input
                      id="dock"
                      placeholder="e.g., Dock A"
                      value={newSlip.dock}
                      onChange={(e) => setNewSlip({ ...newSlip, dock: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slipType">Slip Type</Label>
                    <Select
                      value={newSlip.slipType}
                      onValueChange={(v) => setNewSlip({ ...newSlip, slipType: v as SlipType })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="covered">Covered</SelectItem>
                        <SelectItem value="end">End Slip</SelectItem>
                        <SelectItem value="transient">Transient</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location Description</Label>
                  <Input
                    id="location"
                    placeholder="e.g., East side, near fuel dock"
                    value={newSlip.location}
                    onChange={(e) => setNewSlip({ ...newSlip, location: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="length">Length</Label>
                    <Input
                      id="length"
                      placeholder="e.g., 40 ft"
                      value={newSlip.length}
                      onChange={(e) => setNewSlip({ ...newSlip, length: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="width">Width</Label>
                    <Input
                      id="width"
                      placeholder="e.g., 15 ft"
                      value={newSlip.width}
                      onChange={(e) => setNewSlip({ ...newSlip, width: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="depth">Depth</Label>
                    <Input
                      id="depth"
                      placeholder="e.g., 8 ft"
                      value={newSlip.depth}
                      onChange={(e) => setNewSlip({ ...newSlip, depth: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="monthlyRate">Monthly Rate ($)</Label>
                    <Input
                      id="monthlyRate"
                      type="number"
                      placeholder="e.g., 450"
                      value={newSlip.monthlyRate}
                      onChange={(e) => setNewSlip({ ...newSlip, monthlyRate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="annualRate">Annual Rate ($)</Label>
                    <Input
                      id="annualRate"
                      type="number"
                      placeholder="e.g., 5000"
                      value={newSlip.annualRate}
                      onChange={(e) => setNewSlip({ ...newSlip, annualRate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="hasElectric"
                      checked={newSlip.hasElectric}
                      onCheckedChange={(checked) => setNewSlip({ ...newSlip, hasElectric: checked })}
                    />
                    <Label htmlFor="hasElectric" className="flex items-center gap-1">
                      <Zap className="h-4 w-4" /> Electric
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="hasWater"
                      checked={newSlip.hasWater}
                      onCheckedChange={(checked) => setNewSlip({ ...newSlip, hasWater: checked })}
                    />
                    <Label htmlFor="hasWater" className="flex items-center gap-1">
                      <Droplets className="h-4 w-4" /> Water
                    </Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional notes about this slip..."
                    value={newSlip.notes}
                    onChange={(e) => setNewSlip({ ...newSlip, notes: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateSlip}
                  disabled={!newSlip.slipNumber || !newSlip.displayName || !newSlip.dock || createSlipMutation.isPending}
                  className="bg-[#1f2937] hover:bg-[#374151]"
                >
                  {createSlipMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Create Slip
                </Button>
              </DialogFooter>
            </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search slips..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={dockFilter} onValueChange={setDockFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Dock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Docks</SelectItem>
                  {uniqueDocks.map((dock) => (
                    <SelectItem key={dock} value={dock}>{dock}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="covered">Covered</SelectItem>
                  <SelectItem value="end">End Slip</SelectItem>
                  <SelectItem value="transient">Transient</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Slip Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="col-span-full text-center py-12 text-destructive">
            Failed to load slips. Please try again.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSlips.map((slip) => (
              <SlipCard key={slip.id} slip={slip} />
            ))}
            {filteredSlips.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No slips found matching your filters.
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function SlipCard({ slip }: { slip: Slip }) {
  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-md transition-all group border-t-4 border-t-transparent hover:border-t-primary flex flex-col h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="outline" className="text-xs font-normal capitalize">{slip.slipType}</Badge>
              {slip.hasElectric && (
                <Badge variant="secondary" className="text-xs">
                  <Zap className="h-3 w-3 mr-1" />
                  Electric
                </Badge>
              )}
              {slip.hasWater && (
                <Badge variant="secondary" className="text-xs">
                  <Droplets className="h-3 w-3 mr-1" />
                  Water
                </Badge>
              )}
            </div>
            <CardTitle className="text-xl">{slip.displayName}</CardTitle>
            <p className="text-sm text-muted-foreground">#{slip.slipNumber}</p>
          </div>
          <StatusPill status={slip.status} />
        </div>
      </CardHeader>
      <CardContent className="pb-4 flex-1">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Anchor className="h-4 w-4" />
            <span>{slip.dock}</span>
          </div>
          {slip.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{slip.location}</span>
            </div>
          )}
          {(slip.length || slip.width) && (
            <div className="text-muted-foreground">
              Size: {slip.length}{slip.length && slip.width ? ' × ' : ''}{slip.width}
              {slip.depth && ` (${slip.depth} depth)`}
            </div>
          )}
          {slip.monthlyRate && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>${slip.monthlyRate.toLocaleString()}/month</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-muted/30 p-3 mt-auto">
        <Link href={`/slips/${slip.id}`} className="w-full">
          <Button variant="ghost" className="w-full justify-between group-hover:bg-white" size="sm">
            View Details
            <span className="text-lg leading-none">→</span>
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

function StatusPill({ status }: { status: SlipStatus }) {
  const styles: Record<SlipStatus, string> = {
    'available': 'bg-green-500 text-white border-green-600',
    'occupied': 'bg-blue-500 text-white border-blue-600',
    'reserved': 'bg-purple-500 text-white border-purple-600',
    'maintenance': 'bg-orange-500 text-white border-orange-600',
    'unavailable': 'bg-gray-400 text-white border-gray-500',
  };

  const labels: Record<SlipStatus, string> = {
    'available': 'Available',
    'occupied': 'Occupied',
    'reserved': 'Reserved',
    'maintenance': 'Maintenance',
    'unavailable': 'Unavailable',
  };

  return (
    <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-semibold border shadow-sm whitespace-nowrap', styles[status] || styles['unavailable'])}>
      {labels[status] || status}
    </span>
  );
}
