import { useState, useMemo } from 'react';
import { Plus, Package, Search, Download } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { EquipmentRow } from '@/components/EquipmentRow';
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
import { useEquipment } from '@/hooks/use-equipment';
import { useDemoAuth } from '@/hooks/use-demo-auth';
import type { EquipmentType, EquipmentStatus, Organization } from '@/lib/types';

const EQUIPMENT_TYPES: EquipmentType[] = [
  'Trailer',
  'Sail',
  'Rigging',
  'Dolly',
  'Motor',
  'Safety',
  'Other',
];

const EQUIPMENT_STATUSES: EquipmentStatus[] = ['OK', 'Needs repair', 'Out of service'];

const ORGANIZATIONS: Organization[] = ['ACS', 'ASC', 'SOA'];

export function EquipmentPage() {
  const { equipment, isLoading } = useEquipment();
  const { permissions } = useDemoAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<EquipmentType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<EquipmentStatus | 'all'>('all');
  const [orgFilter, setOrgFilter] = useState<Organization | 'all'>('all');

  const hasActiveFilters =
    searchQuery !== '' ||
    typeFilter !== 'all' ||
    statusFilter !== 'all' ||
    orgFilter !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setStatusFilter('all');
    setOrgFilter('all');
  };

  const filteredEquipment = useMemo(() => {
    return equipment.filter((item) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          item.name.toLowerCase().includes(query) ||
          item.type.toLowerCase().includes(query) ||
          (item.serialNumber?.toLowerCase().includes(query) ?? false);
        if (!matchesSearch) return false;
      }

      // Type filter
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;

      // Status filter
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;

      // Organization filter
      if (orgFilter !== 'all' && item.organization !== orgFilter) return false;

      return true;
    });
  }, [equipment, searchQuery, typeFilter, statusFilter, orgFilter]);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Equipment</h1>
            <p className="text-muted-foreground mt-1">
              {equipment.length} items in inventory
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            {permissions.canAddBoats && (
              <Button className="gap-2 bg-[#1e2a3b] hover:bg-[#2d3c4f]">
                <Plus className="h-4 w-4" />
                Add Equipment
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search equipment..."
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
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as EquipmentStatus | 'all')}
            >
              <SelectTrigger className="w-[140px] bg-white">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {EQUIPMENT_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={typeFilter}
              onValueChange={(value) => setTypeFilter(value as EquipmentType | 'all')}
            >
              <SelectTrigger className="w-[130px] bg-white">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {EQUIPMENT_TYPES.map((type) => (
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

        {/* Equipment List */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : filteredEquipment.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">No equipment found</h3>
            <p className="text-muted-foreground mt-1">
              {hasActiveFilters
                ? 'Try adjusting your filters'
                : 'Add equipment to get started'}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            {hasActiveFilters && (
              <p className="text-sm text-muted-foreground">
                Showing {filteredEquipment.length} of {equipment.length} items
              </p>
            )}
            <div className="space-y-3">
              {filteredEquipment.map((item) => (
                <EquipmentRow key={item.id} equipment={item} />
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
