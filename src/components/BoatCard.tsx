import { Link } from 'wouter';
import { MapPin, Calendar, ArrowRight, Sailboat } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn, formatDate } from '@/lib/utils';
import type { Boat, BoatStatus } from '@/lib/types';

interface BoatCardProps {
  boat: Boat;
  className?: string;
  showReadyBadge?: boolean;
}

function getStatusConfig(status: BoatStatus, showReady: boolean): { bg: string; text: string; label: string } {
  if (showReady && status === 'OK') {
    return { bg: 'bg-orange-400', text: 'text-white', label: 'Ready' };
  }
  switch (status) {
    case 'OK':
      return { bg: 'bg-green-500', text: 'text-white', label: 'OK' };
    case 'Needs inspection':
      return { bg: 'bg-yellow-400', text: 'text-white', label: 'Needs inspection' };
    case 'Needs repair':
      return { bg: 'bg-orange-500', text: 'text-white', label: 'Needs repair' };
    case 'Do not sail':
      return { bg: 'bg-red-500', text: 'text-white', label: 'Do not sail' };
    case 'Out of service':
      return { bg: 'bg-gray-400', text: 'text-white', label: 'Out of service' };
    default:
      return { bg: 'bg-gray-300', text: 'text-gray-800', label: status };
  }
}

function getBoatTypeLabel(type: string): string {
  // Map boat types to display labels like in RigReport
  const typeMap: Record<string, string> = {
    '420': '420',
    'Club 420': '420',
    'RIB': 'RIB',
    'Zodiac': 'RIB',
    'Coach Boat': 'RIB',
    'Safety Boat': 'RIB',
  };
  return typeMap[type] || 'Other';
}

export function BoatCard({ boat, className, showReadyBadge = false }: BoatCardProps) {
  const statusConfig = getStatusConfig(boat.status, showReadyBadge);
  const typeLabel = getBoatTypeLabel(boat.type);

  return (
    <Link href={`/fleet/${boat.id}`}>
      <Card
        className={cn(
          'cursor-pointer transition-all hover:shadow-md border-0 shadow-sm bg-white',
          className
        )}
      >
        <CardContent className="p-5">
          {/* Header with type badge and status */}
          <div className="flex items-start justify-between mb-3">
            <Badge variant="outline" className="text-xs font-normal bg-white border-gray-200 text-gray-600">
              {typeLabel}
            </Badge>
            <div className="flex items-center gap-1.5">
              <Sailboat className="h-5 w-5 text-gray-400" />
              <span className={cn(
                'px-2.5 py-1 rounded-md text-xs font-medium',
                statusConfig.bg,
                statusConfig.text
              )}>
                {statusConfig.label}
              </span>
            </div>
          </div>

          {/* Boat Name */}
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {boat.displayName}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <MapPin className="h-3.5 w-3.5" />
            <span>{boat.location}</span>
          </div>

          {/* Last Check Date */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Calendar className="h-3.5 w-3.5" />
            <span>Last check: {boat.lastInspection ? formatDate(boat.lastInspection, 'MMM d, yyyy') : 'N/A'}</span>
          </div>

          {/* View Details Link */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <span className="text-sm text-muted-foreground">View Details</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
