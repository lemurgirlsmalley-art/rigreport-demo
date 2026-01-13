import { Link } from 'wouter';
import { MapPin, Calendar, ArrowRight, Sailboat } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn, formatDate, getOrganizationLogo, getOrganizationName } from '@/lib/utils';
import type { Boat, BoatStatus } from '@/lib/types';

interface BoatCardProps {
  boat: Boat;
  className?: string;
  showReadyBadge?: boolean;
}

function getStatusConfig(status: BoatStatus, showReady: boolean): { bg: string; text: string; label: string; border: string } {
  if (showReady && status === 'OK') {
    return { bg: 'bg-secondary', text: 'text-white', label: 'Ready', border: 'border-secondary' };
  }
  switch (status) {
    case 'OK':
      return { bg: 'bg-secondary', text: 'text-white', label: 'OK', border: 'border-secondary' };
    case 'Needs inspection':
      return { bg: 'bg-accent', text: 'text-accent-foreground', label: 'Needs inspection', border: 'border-accent' };
    case 'Needs repair':
      return { bg: 'bg-orange-500', text: 'text-white', label: 'Needs repair', border: 'border-orange-600' };
    case 'Do not sail':
      return { bg: 'bg-destructive', text: 'text-destructive-foreground', label: 'Do not sail', border: 'border-destructive' };
    case 'Out of service':
      return { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Out of service', border: 'border-border' };
    default:
      return { bg: 'bg-gray-300', text: 'text-gray-800', label: status, border: 'border-gray-400' };
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
          'cursor-pointer transition-all hover:shadow-md shadow-sm bg-card overflow-hidden border-t-4 border-t-transparent hover:border-t-primary flex flex-col h-full group',
          className
        )}
      >
        {/* Boat Image */}
        {boat.imageUrl && (
          <div className="h-48 w-full overflow-hidden bg-muted">
            <img
              src={boat.imageUrl}
              alt={boat.displayName}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
          </div>
        )}
        <CardContent className="p-5">
          {/* Header with org logo, type badge and status */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <img
                src={getOrganizationLogo(boat.organization)}
                alt={getOrganizationName(boat.organization)}
                className="h-6 w-auto"
              />
              <Badge variant="outline" className="text-xs font-normal bg-white border-input text-foreground">
                {typeLabel}
              </Badge>
              <Sailboat className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className={cn(
              'px-2.5 py-0.5 rounded-full text-xs font-semibold border shadow-sm whitespace-nowrap',
              statusConfig.bg,
              statusConfig.text,
              statusConfig.border
            )}>
              {statusConfig.label}
            </span>
          </div>

          {/* Boat Name */}
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {boat.displayName}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <MapPin className="h-3.5 w-3.5 text-orange-400" />
            <span>{boat.location}</span>
          </div>

          {/* Last Check Date */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Calendar className="h-3.5 w-3.5" />
            <span>Last check: {boat.lastInspection ? formatDate(boat.lastInspection, 'MMM d, yyyy') : 'N/A'}</span>
          </div>

          {/* View Details Link */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">View Details</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
