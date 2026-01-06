import { useState, useMemo } from 'react';
import { Search, Ship, Trophy } from 'lucide-react';
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
import type { BoatType, Organization } from '@/lib/types';

const RACING_BOAT_TYPES: BoatType[] = [
  '420',
  'Club 420',
  'Sunfish',
  'Open BIC',
  'RS Tera',
  'Hobie Wave',
];

const ORGANIZATIONS: Organization[] = ['ACS', 'ASC', 'SOA'];

export function RegattaPage() {
  const { boats, isLoading } = useBoats();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<BoatType | 'all'>('all');
  const [orgFilter, setOrgFilter] = useState<Organization | 'all'>('all');

  const hasActiveFilters =
    searchQuery !== '' || typeFilter !== 'all' || orgFilter !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setOrgFilter('all');
  };

  // Filter to only OK status boats (ready for regatta)
  const regattaReadyBoats = useMemo(() => {
    return boats.filter((boat) => {
      // Must be OK status
      if (boat.status !== 'OK') return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          boat.displayName.toLowerCase().includes(query) ||
          boat.hullNumber.toLowerCase().includes(query) ||
          boat.type.toLowerCase().includes(query) ||
          boat.location.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Filter by type if selected
      if (typeFilter !== 'all' && boat.type !== typeFilter) return false;

      // Filter by organization if selected
      if (orgFilter !== 'all' && boat.organization !== orgFilter) return false;

      return true;
    });
  }, [boats, searchQuery, typeFilter, orgFilter]);

  // Get available types (those with OK boats)
  const availableTypes = useMemo(() => {
    const okBoats = boats.filter((b) => b.status === 'OK');
    return RACING_BOAT_TYPES.filter((type) => okBoats.some((b) => b.type === type));
  }, [boats]);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
            <Trophy className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Regatta View</h1>
            <p className="text-muted-foreground mt-1">
              The race-ready fleet. These vessels are currently in <span className="font-semibold text-foreground">OK</span> condition and ready for competition usage.
            </p>
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
              value={orgFilter}
              onValueChange={(value) => setOrgFilter(value as Organization | 'all')}
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
              value={typeFilter}
              onValueChange={(value) => setTypeFilter(value as BoatType | 'all')}
            >
              <SelectTrigger className="w-[130px] bg-white">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {availableTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Boat Grid */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : regattaReadyBoats.length === 0 ? (
          <div className="text-center py-12">
            <Ship className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">No boats available</h3>
            <p className="text-muted-foreground mt-1">
              {hasActiveFilters
                ? 'Try adjusting your filters'
                : 'No boats are currently ready for use'}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {regattaReadyBoats.map((boat) => (
              <BoatCard key={boat.id} boat={boat} showReadyBadge={true} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
