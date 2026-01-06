import { Package, Wrench, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Equipment, EquipmentStatus } from '@/lib/types';

interface EquipmentRowProps {
  equipment: Equipment;
  onClick?: () => void;
  className?: string;
}

function getEquipmentStatusColor(status: EquipmentStatus): string {
  switch (status) {
    case 'OK':
      return 'bg-secondary text-secondary-foreground';
    case 'Needs repair':
      return 'bg-accent text-accent-foreground';
    case 'Out of service':
      return 'bg-gray-500 text-white';
    default:
      return 'bg-gray-300 text-gray-800';
  }
}

function getEquipmentStatusIcon(status: EquipmentStatus) {
  switch (status) {
    case 'OK':
      return Package;
    case 'Needs repair':
      return Wrench;
    case 'Out of service':
      return AlertCircle;
    default:
      return Package;
  }
}

export function EquipmentRow({ equipment, onClick, className }: EquipmentRowProps) {
  const StatusIcon = getEquipmentStatusIcon(equipment.status);

  return (
    <div
      className={cn(
        'flex items-center justify-between p-4 border rounded-lg',
        onClick && 'cursor-pointer hover:bg-muted/50 transition-colors',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Package className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <h4 className="font-medium">{equipment.name}</h4>
          <p className="text-sm text-muted-foreground">
            {equipment.type}
            {equipment.serialNumber && ` • ${equipment.serialNumber}`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant="outline">{equipment.organization}</Badge>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
            getEquipmentStatusColor(equipment.status)
          )}
        >
          <StatusIcon className="h-3 w-3" />
          {equipment.status}
        </span>
      </div>
    </div>
  );
}
