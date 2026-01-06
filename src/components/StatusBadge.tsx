import { CheckCircle, AlertTriangle, XCircle, Wrench, Archive } from 'lucide-react';
import { cn, getStatusColor } from '@/lib/utils';
import type { BoatStatus } from '@/lib/types';

interface StatusBadgeProps {
  status: BoatStatus;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function getStatusIcon(status: BoatStatus) {
  switch (status) {
    case 'OK':
      return CheckCircle;
    case 'Needs inspection':
      return AlertTriangle;
    case 'Needs repair':
      return Wrench;
    case 'Do not sail':
      return XCircle;
    case 'Out of service':
      return Archive;
    default:
      return CheckCircle;
  }
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

const iconSizes = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

export function StatusBadge({
  status,
  showIcon = true,
  size = 'md',
  className,
}: StatusBadgeProps) {
  const Icon = getStatusIcon(status);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        getStatusColor(status),
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {status}
    </span>
  );
}
