import { AlertTriangle, CheckCircle, Clock, Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn, formatDate } from '@/lib/utils';
import type { MaintenanceEntry, MaintenanceSeverity, MaintenanceStatus } from '@/lib/types';

interface MaintenanceItemProps {
  entry: MaintenanceEntry;
  showBoatInfo?: boolean;
  onClick?: () => void;
  className?: string;
}

function getSeverityColor(severity: MaintenanceSeverity): string {
  switch (severity) {
    case 'High':
      return 'bg-destructive text-destructive-foreground';
    case 'Medium':
      return 'bg-orange-500 text-white';
    case 'Low':
      return 'bg-accent text-accent-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

function getStatusIcon(status: MaintenanceStatus) {
  switch (status) {
    case 'Open':
      return AlertTriangle;
    case 'In progress':
      return Clock;
    case 'Resolved':
      return CheckCircle;
    default:
      return Wrench;
  }
}

function getStatusColor(status: MaintenanceStatus): string {
  switch (status) {
    case 'Open':
      return 'text-destructive';
    case 'In progress':
      return 'text-accent';
    case 'Resolved':
      return 'text-secondary';
    default:
      return 'text-muted-foreground';
  }
}

export function MaintenanceItem({
  entry,
  showBoatInfo: _showBoatInfo = false,
  onClick,
  className,
}: MaintenanceItemProps) {
  void _showBoatInfo; // Reserved for future use
  const StatusIcon = getStatusIcon(entry.status);

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 border rounded-lg',
        onClick && 'cursor-pointer hover:bg-muted/50 transition-colors',
        className
      )}
      onClick={onClick}
    >
      <div className={cn('mt-0.5', getStatusColor(entry.status))}>
        <StatusIcon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-medium">{entry.category}</h4>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {entry.description}
            </p>
          </div>
          <Badge className={cn('shrink-0', getSeverityColor(entry.severity))}>
            {entry.severity}
          </Badge>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>Reported by {entry.reportedBy}</span>
          <span>{formatDate(entry.reportedAt)}</span>
          {entry.resolvedAt && (
            <span className="text-secondary">
              Resolved {formatDate(entry.resolvedAt)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
