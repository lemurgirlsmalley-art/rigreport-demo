import { useState } from 'react';
import { Bell, AlertTriangle, Wrench, Ship, Calendar } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useDemoAuth } from '@/hooks/use-demo-auth';
import { toast } from '@/hooks/use-toast';

interface NotificationPreference {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  enabled: boolean;
}

export function NotificationSettingsPage() {
  const { role } = useDemoAuth();
  const isAdminOrCoach = role === 'admin' || role === 'coach';

  const [preferences, setPreferences] = useState<NotificationPreference[]>([
    {
      id: 'damageReports',
      label: 'Damage Reports',
      description: 'Get notified when new damage reports are submitted (High/Medium severity only)',
      icon: AlertTriangle,
      enabled: false,
    },
    {
      id: 'maintenanceUpdates',
      label: 'Maintenance Updates',
      description: 'Get notified when maintenance issues are resolved',
      icon: Wrench,
      enabled: false,
    },
    {
      id: 'boatStatusChanges',
      label: 'Boat Status Changes',
      description: 'Get notified when a boat\'s status changes (e.g., OK to Needs Repair)',
      icon: Ship,
      enabled: false,
    },
    {
      id: 'newReservations',
      label: 'New Reservations',
      description: 'Get notified when someone reserves a boat',
      icon: Calendar,
      enabled: false,
    },
  ]);

  const handleToggle = (id: string) => {
    setPreferences((prev) =>
      prev.map((pref) =>
        pref.id === id ? { ...pref, enabled: !pref.enabled } : pref
      )
    );

    const pref = preferences.find((p) => p.id === id);
    const newState = !pref?.enabled;

    toast({
      title: 'Preference Updated',
      description: `${pref?.label} notifications ${newState ? 'enabled' : 'disabled'}`,
      variant: 'success',
    });
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-2xl">
        {/* Page Header */}
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
            <Bell className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Notification Settings</h1>
            <p className="text-muted-foreground mt-1">
              Choose which email notifications you'd like to receive.
            </p>
          </div>
        </div>

        {/* Notification Preferences */}
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Email Notifications</CardTitle>
            <CardDescription>
              All notifications are off by default. Toggle on the ones you want to receive.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {preferences.map((pref) => {
              const Icon = pref.icon;
              return (
                <div
                  key={pref.id}
                  className="flex items-start justify-between gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                      <Icon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <Label htmlFor={pref.id} className="text-base font-medium cursor-pointer">
                        {pref.label}
                      </Label>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {pref.description}
                      </p>
                    </div>
                  </div>
                  <Switch
                    id={pref.id}
                    checked={pref.enabled}
                    onCheckedChange={() => handleToggle(pref.id)}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Admin-Only Section */}
        {isAdminOrCoach && (
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Mandatory Notifications</CardTitle>
              <CardDescription>
                As an {role}, you automatically receive these notifications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-900">New User Registration Requests</p>
                  <p className="text-sm text-amber-700">
                    You will always be notified when new users request to join your organization.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Demo Note */}
        <p className="text-sm text-muted-foreground text-center">
          This is a demo—no actual emails will be sent.
        </p>
      </div>
    </AppShell>
  );
}
