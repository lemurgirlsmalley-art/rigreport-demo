import { useState, useMemo } from 'react';
import { Plus, Ship, Search, Download } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { BoatCard } from '@/components/BoatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useBoats } from '@/hooks/use-boats';
import { useDemoAuth } from '@/hooks/use-demo-auth';
import { useFeatureModal } from '@/hooks/use-feature-modal';
import { mockStore } from '@/lib/mockDataStore';
import { toast } from '@/hooks/use-toast';
import type { BoatStatus, BoatType, Organization } from '@/lib/types';

const STATUSES: BoatStatus[] = [
  'OK',
  'Needs inspection',
  'Needs repair',
  'Do not sail',
  'Out of service',
];

const BOAT_TYPES: BoatType[] = [
  '420',
  'Club 420',
  'Open BIC',
  'Sunfish',
  'RS Tera',
  'Hobie Wave',
  'Coach Boat',
  'Safety Boat',
  'RIB',
  'Skiff',
  'Pontoon',
  'Kayak',
  'Canoe',
  'Other',
];

const ORGANIZATIONS: Organization[] = ['EO', 'YOH', 'DSC'];

export function FleetPage() {
  const { boats, isLoading } = useBoats();
  const { permissions } = useDemoAuth();
  const { showFeatureModal } = useFeatureModal();
  const isDemoExpired = mockStore.isDemoExpired();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BoatStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<BoatType | 'all'>('all');
  const [organizationFilter, setOrganizationFilter] = useState<Organization | 'all'>('all');

  // Add Boat Dialog State
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newBoat, setNewBoat] = useState({
    displayName: '',
    hullNumber: '',
    type: 'Club 420' as BoatType,
    organization: 'EO' as Organization,
    location: '',
    manufacturer: '',
    model: '',
    year: '',
    color: '',
    notes: '',
    isRegattaPreferred: false,
    latitude: '',
    longitude: '',
  });

  const hasActiveFilters =
    searchQuery !== '' ||
    statusFilter !== 'all' ||
    typeFilter !== 'all' ||
    organizationFilter !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setTypeFilter('all');
    setOrganizationFilter('all');
  };

  const filteredBoats = useMemo(() => {
    return boats.filter((boat) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          boat.displayName.toLowerCase().includes(query) ||
          boat.hullNumber.toLowerCase().includes(query) ||
          boat.type.toLowerCase().includes(query) ||
          boat.location.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      if (statusFilter !== 'all' && boat.status !== statusFilter) {
        return false;
      }

      if (typeFilter !== 'all' && boat.type !== typeFilter) {
        return false;
      }

      if (organizationFilter !== 'all' && boat.organization !== organizationFilter) {
        return false;
      }

      return true;
    });
  }, [boats, searchQuery, statusFilter, typeFilter, organizationFilter]);

  // Handle Add Boat - shows feature modal (demo restriction)
  const handleCreateBoat = () => {
    if (!newBoat.displayName || !newBoat.hullNumber) {
      toast({
        title: 'Missing Required Fields',
        description: 'Please fill in the display name and hull number.',
        variant: 'destructive',
      });
      return;
    }
    // Show feature modal instead of creating boat (demo restriction)
    setIsAddDialogOpen(false);
    showFeatureModal('addBoat');
  };

  // Export to Excel - restricted after demo expires
  const handleExportToExcel = () => {
    if (isDemoExpired) {
      showFeatureModal('exportFleet');
      return;
    }
    showFeatureModal('exportFleet');
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Fleet</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track all vessels.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleExportToExcel}
              disabled={boats.length === 0}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            {permissions.canAddBoats && (
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-[#1f2937] hover:bg-[#374151]">
                    <Plus className="h-4 w-4" />
                    Add Boat
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Boat</DialogTitle>
                    <DialogDescription>
                      Enter the details for the new vessel. Required fields are marked with *.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {/* Basic Information */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name / App ID *</Label>
                        <Input
                          id="displayName"
                          placeholder="e.g., Blue Thunder"
                          value={newBoat.displayName}
                          onChange={(e) => setNewBoat({ ...newBoat, displayName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hullNumber">Hull Number / Sail Number *</Label>
                        <Input
                          id="hullNumber"
                          placeholder="e.g., 42069"
                          value={newBoat.hullNumber}
                          onChange={(e) => setNewBoat({ ...newBoat, hullNumber: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Boat Type *</Label>
                        <Select
                          value={newBoat.type}
                          onValueChange={(v) => setNewBoat({ ...newBoat, type: v as BoatType })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {BOAT_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Organization *</Label>
                        <Select
                          value={newBoat.organization}
                          onValueChange={(v) => setNewBoat({ ...newBoat, organization: v as Organization })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ORGANIZATIONS.map((org) => (
                              <SelectItem key={org} value={org}>{org}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Storage Location</Label>
                      <Input
                        id="location"
                        placeholder="e.g., Dock A, Slip 12"
                        value={newBoat.location}
                        onChange={(e) => setNewBoat({ ...newBoat, location: e.target.value })}
                      />
                    </div>

                    {/* Specifications */}
                    <div className="border-t pt-4 mt-2">
                      <h4 className="font-medium mb-3">Specifications</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="manufacturer">Manufacturer</Label>
                          <Input
                            id="manufacturer"
                            placeholder="e.g., Laser Performance"
                            value={newBoat.manufacturer}
                            onChange={(e) => setNewBoat({ ...newBoat, manufacturer: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="model">Model</Label>
                          <Input
                            id="model"
                            placeholder="e.g., Club 420"
                            value={newBoat.model}
                            onChange={(e) => setNewBoat({ ...newBoat, model: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="year">Year Built</Label>
                          <Input
                            id="year"
                            type="number"
                            placeholder="e.g., 2020"
                            value={newBoat.year}
                            onChange={(e) => setNewBoat({ ...newBoat, year: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="color">Hull Color</Label>
                          <Input
                            id="color"
                            placeholder="e.g., White with blue stripe"
                            value={newBoat.color}
                            onChange={(e) => setNewBoat({ ...newBoat, color: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Location Coordinates */}
                    <div className="border-t pt-4 mt-2">
                      <h4 className="font-medium mb-3">Location Coordinates (Optional)</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="latitude">Latitude</Label>
                          <Input
                            id="latitude"
                            type="number"
                            step="0.000001"
                            placeholder="e.g., 33.4735"
                            value={newBoat.latitude}
                            onChange={(e) => setNewBoat({ ...newBoat, latitude: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="longitude">Longitude</Label>
                          <Input
                            id="longitude"
                            type="number"
                            step="0.000001"
                            placeholder="e.g., -82.0105"
                            value={newBoat.longitude}
                            onChange={(e) => setNewBoat({ ...newBoat, longitude: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Additional Options */}
                    <div className="border-t pt-4 mt-2">
                      <h4 className="font-medium mb-3">Additional Options</h4>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="regatta">Regatta Preferred</Label>
                          <p className="text-sm text-muted-foreground">
                            Mark this boat as preferred for regatta events
                          </p>
                        </div>
                        <Switch
                          id="regatta"
                          checked={newBoat.isRegattaPreferred}
                          onCheckedChange={(checked) => setNewBoat({ ...newBoat, isRegattaPreferred: checked })}
                        />
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                      <Label htmlFor="notes">Quick Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Any additional notes about this vessel..."
                        value={newBoat.notes}
                        onChange={(e) => setNewBoat({ ...newBoat, notes: e.target.value })}
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateBoat}
                      className="bg-[#1f2937] hover:bg-[#374151]"
                    >
                      Add Boat
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search boats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Select
              value={organizationFilter}
              onValueChange={(value) => setOrganizationFilter(value as Organization | 'all')}
            >
              <SelectTrigger className="w-[160px] bg-white">
                <SelectValue placeholder="All Organizations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Organizations</SelectItem>
                {ORGANIZATIONS.map((org) => (
                  <SelectItem key={org} value={org}>
                    {org}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as BoatStatus | 'all')}
            >
              <SelectTrigger className="w-[140px] bg-white">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={typeFilter}
              onValueChange={(value) => setTypeFilter(value as BoatType | 'all')}
            >
              <SelectTrigger className="w-[130px] bg-white">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {BOAT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Boat Grid */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : filteredBoats.length === 0 ? (
          <div className="text-center py-12">
            <Ship className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">No boats found</h3>
            <p className="text-muted-foreground mt-1">
              {hasActiveFilters
                ? 'Try adjusting your filters'
                : 'Add a boat to get started'}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBoats.map((boat) => (
              <BoatCard key={boat.id} boat={boat} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
