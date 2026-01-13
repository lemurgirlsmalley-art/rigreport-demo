import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { BoatStatus, BoatType, Organization } from '@/lib/types';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: BoatStatus | 'all';
  onStatusChange: (value: BoatStatus | 'all') => void;
  typeFilter: BoatType | 'all';
  onTypeChange: (value: BoatType | 'all') => void;
  organizationFilter: Organization | 'all';
  onOrganizationChange: (value: Organization | 'all') => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

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
  'Hunter 15',
  'Kayak',
  'Canoe',
  'Pontoon',
  'Skiff',
  'Zodiac',
  'Tracker',
  'Other',
];

const ORGANIZATIONS: Organization[] = ['EO', 'YOH', 'DSC'];

export function FilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  typeFilter,
  onTypeChange,
  organizationFilter,
  onOrganizationChange,
  onClearFilters,
  hasActiveFilters,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search boats..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Select
          value={statusFilter}
          onValueChange={(value) => onStatusChange(value as BoatStatus | 'all')}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
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
          onValueChange={(value) => onTypeChange(value as BoatType | 'all')}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Boat Type" />
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

        <Select
          value={organizationFilter}
          onValueChange={(value) => onOrganizationChange(value as Organization | 'all')}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Org" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orgs</SelectItem>
            {ORGANIZATIONS.map((org) => (
              <SelectItem key={org} value={org}>
                {org}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
