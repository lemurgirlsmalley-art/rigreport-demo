import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';
import type { BoatStatus, Boat, Organization } from './types';
import orgLogo from '@/assets/org-logo.png';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, formatStr: string = 'MMM d, yyyy'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
}

export function getStatusColor(status: BoatStatus): string {
  switch (status) {
    case 'OK':
      return 'bg-secondary text-white border border-secondary';
    case 'Needs inspection':
      return 'bg-accent text-accent-foreground border border-accent';
    case 'Needs repair':
      return 'bg-orange-500 text-white border border-orange-600';
    case 'Do not sail':
      return 'bg-destructive text-destructive-foreground border border-destructive';
    case 'Out of service':
      return 'bg-muted text-muted-foreground border border-border';
    default:
      return 'bg-gray-300 text-gray-800';
  }
}

export function getStatusDotColor(status: BoatStatus): string {
  switch (status) {
    case 'OK':
      return 'bg-secondary';
    case 'Needs inspection':
      return 'bg-accent';
    case 'Needs repair':
      return 'bg-orange-500';
    case 'Do not sail':
      return 'bg-destructive';
    case 'Out of service':
      return 'bg-muted-foreground';
    default:
      return 'bg-gray-300';
  }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function groupBoatsByLocation(boats: Boat[]): Map<string, Boat[]> {
  const groups = new Map<string, Boat[]>();

  for (const boat of boats) {
    if (boat.latitude && boat.longitude) {
      const key = `${boat.latitude.toFixed(4)},${boat.longitude.toFixed(4)}`;
      const existing = groups.get(key) || [];
      existing.push(boat);
      groups.set(key, existing);
    }
  }

  return groups;
}

export function getOrganizationName(org: string): string {
  switch (org) {
    case 'EO':
      return 'Example Organization';
    case 'YOH':
      return 'Your Organization Here';
    case 'DSC':
      return 'Demo Sailing Club';
    default:
      return org;
  }
}

export function getOrganizationLogo(_org: Organization): string {
  // All organizations use the same placeholder logo for the demo
  return orgLogo;
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural || `${singular}s`);
}
