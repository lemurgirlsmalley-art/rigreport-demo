import { Shield, User, Users, Sailboat } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDemoAuth } from '@/hooks/use-demo-auth';
import type { Role } from '@/lib/types';

const roleConfig: Record<Role, { label: string; icon: typeof Shield; description: string }> = {
  admin: {
    label: 'Admin',
    icon: Shield,
    description: 'Full access',
  },
  coach: {
    label: 'Coach',
    icon: Users,
    description: 'Manage boats & equipment',
  },
  volunteer: {
    label: 'Volunteer',
    icon: User,
    description: 'View & report only',
  },
  junior_sailor: {
    label: 'Junior Sailor',
    icon: Sailboat,
    description: 'Limited view access',
  },
};

export function RoleSwitcher() {
  const { role, setRole } = useDemoAuth();

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground">
        Demo Role
      </label>
      <Select value={role} onValueChange={(value) => setRole(value as Role)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select role" />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(roleConfig) as Role[]).map((roleKey) => {
            const config = roleConfig[roleKey];
            const Icon = config.icon;
            return (
              <SelectItem key={roleKey} value={roleKey}>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{config.label}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        {roleConfig[role].description}
      </p>
    </div>
  );
}
