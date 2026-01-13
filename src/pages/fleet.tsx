import { useState, useMemo } from 'react';
import { Plus, Ship, Search, Download } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { BoatCard } from '@/components/BoatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBoats } from '@/hooks/use-boats';
import { useDemoAuth } from '@/hooks/use-demo-auth';
import { useFeatureModal } from '@/hooks/use-feature-modal';
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
  'Other',
];

const ORGANIZATIONS: Organization[] = ['EO', 'YOH', 'DSC'];

export function FleetPage() {
  const { boats, isLoading } = useBoats();
  const { permissions } = useDemoAuth();
  const { showFeatureModal } = useFeatureModal();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BoatStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<BoatType | 'all'>('all');
  const [organizationFilter, setOrganizationFilter] = useState<Organization | 'all'>('all');

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
            <Button variant="outline" className="gap-2" onClick={() => showFeatureModal('exportData')}>
              <Download className="h-4 w-4" />
              Export
            </Button>
            {permissions.canAddBoats && (
              <Button className="gap-2" onClick={() => showFeatureModal('addBoat')}>
                <Plus className="h-4 w-4" />
                Add Boat
              </Button>
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
