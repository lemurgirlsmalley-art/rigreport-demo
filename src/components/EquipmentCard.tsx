import { MapPin } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Equipment, EquipmentStatus } from '@/lib/types';

interface EquipmentCardProps {
  equipment: Equipment;
  onClick?: () => void;
}

function StatusPill({ status }: { status: EquipmentStatus }) {
  const styles: Record<EquipmentStatus, string> = {
    'OK': 'bg-secondary text-white border-secondary',
    'Needs repair': 'bg-orange-500 text-white border-orange-600',
    'Out of service': 'bg-muted text-muted-foreground border-border',
  };

  return (
    <span
      className={cn(
        'px-2.5 py-0.5 rounded-full text-xs font-semibold border shadow-sm whitespace-nowrap',
        styles[status] || styles['Out of service']
      )}
    >
      {status}
    </span>
  );
}

export function EquipmentCard({ equipment, onClick }: EquipmentCardProps) {
  return (
    <Card
      className="overflow-hidden shadow-sm hover:shadow-md transition-all group border-l-4 border-l-secondary flex flex-col h-full cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <Badge variant="outline" className="mb-2 text-xs font-normal">
              {equipment.type}
            </Badge>
            <CardTitle className="text-xl font-heading">{equipment.name}</CardTitle>
          </div>
          <StatusPill status={equipment.status} />
        </div>
      </CardHeader>
      <CardContent className="pb-4 flex-1">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{equipment.storageLocation}</span>
          </div>
          {equipment.notes && (
            <div className="mt-2 text-muted-foreground text-xs bg-muted p-2 rounded">
              {equipment.notes}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-muted/30 p-3 mt-auto">
        <Button variant="ghost" className="w-full justify-between group-hover:bg-white" size="sm">
          View Details
          <span className="text-lg leading-none">→</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
