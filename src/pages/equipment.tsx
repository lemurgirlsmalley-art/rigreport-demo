import { useState, useMemo } from 'react';
import { Plus, Package, Search, Loader2 } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { EquipmentCard } from '@/components/EquipmentCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEquipment } from '@/hooks/use-equipment';
import { useDemoAuth } from '@/hooks/use-demo-auth';
import { useFeatureModal } from '@/hooks/use-feature-modal';
import type { EquipmentType, EquipmentStatus } from '@/lib/types';

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

export function EquipmentPage() {
  const { equipment, isLoading } = useEquipment();
  const { permissions } = useDemoAuth();
  const { showFeatureModal } = useFeatureModal();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<EquipmentType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<EquipmentStatus | 'all'>('all');

  const filteredEquipment = useMemo(() => {
    return equipment.filter((item) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = item.name.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Type filter
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;

      // Status filter
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;

      return true;
    });
  }, [equipment, searchQuery, typeFilter, statusFilter]);

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-primary tracking-tight">Equipment</h1>
            <p className="text-muted-foreground">Manage trailers, sails, rigging, and other assets.</p>
          </div>
          <div className="flex gap-2">
            {permissions.canAddBoats && (
              <Button size="sm" onClick={() => showFeatureModal('addEquipment')}>
                <Plus className="h-4 w-4 mr-1" />
                Add Equipment
              </Button>
            )}
          </div>
        </div>

        {/* Filters Card */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search equipment..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as EquipmentStatus | 'all')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
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
                <SelectTrigger>
                  <SelectValue placeholder="Equipment Type" />
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
            </div>
          </CardContent>
        </Card>

        {/* Equipment Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEquipment.map((item) => (
              <EquipmentCard
                key={item.id}
                equipment={item}
                onClick={() => showFeatureModal('editEquipment')}
              />
            ))}
            {filteredEquipment.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No equipment found matching your filters.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
