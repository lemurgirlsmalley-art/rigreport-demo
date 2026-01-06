import { useState } from 'react';
import { AlertTriangle, Ship, Package, Wrench } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { MaintenanceItem } from '@/components/MaintenanceItem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBoats, useUpdateBoat } from '@/hooks/use-boats';
import { useEquipment } from '@/hooks/use-equipment';
import { useMaintenance, useCreateMaintenance } from '@/hooks/use-maintenance';
import { useDemoAuth } from '@/hooks/use-demo-auth';
import { toast } from '@/hooks/use-toast';
import type {
  MaintenanceCategory,
  MaintenanceSeverity,
  BoatStatus,
} from '@/lib/types';

const DAMAGE_TYPES: MaintenanceCategory[] = [
  'Hull damage',
  'Rigging issue',
  'Repair',
  'Inspection',
  'Rigging check',
  'Inventory',
  'Other',
];

const SEVERITIES: { value: MaintenanceSeverity; label: string }[] = [
  { value: 'Low', label: 'Low (Info only)' },
  { value: 'Medium', label: 'Medium (Needs fixing)' },
  { value: 'High', label: 'High (Do not sail)' },
];

// Map severity to boat status for auto-updating
const SEVERITY_TO_STATUS: Record<MaintenanceSeverity, BoatStatus | null> = {
  Low: null, // Don't change status
  Medium: 'Needs repair',
  High: 'Do not sail',
};

export function ReportDamagePage() {
  const { boats } = useBoats();
  const { equipment } = useEquipment();
  const { maintenance, isLoading: maintenanceLoading } = useMaintenance();
  const createMaintenance = useCreateMaintenance();
  const updateBoat = useUpdateBoat();
  const { user, permissions } = useDemoAuth();

  const [activeTab, setActiveTab] = useState('report');
  const [itemType, setItemType] = useState<'boat' | 'equipment'>('boat');
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [damageType, setDamageType] = useState<MaintenanceCategory | ''>('');
  const [severity, setSeverity] = useState<MaintenanceSeverity | ''>('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const recentReports = maintenance
    .filter((m) => m.status !== 'Resolved')
    .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime())
    .slice(0, 10);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedItem || !damageType || !severity || !description.trim()) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create maintenance entry
      await createMaintenance.mutateAsync({
        boatId: itemType === 'boat' ? selectedItem : '',
        equipmentId: itemType === 'equipment' ? selectedItem : undefined,
        category: damageType as MaintenanceCategory,
        severity: severity as MaintenanceSeverity,
        status: 'Open',
        description: description.trim(),
        reportedBy: user?.name || 'Anonymous',
      });

      // Auto-update boat status for Medium/High severity
      if (itemType === 'boat') {
        const newStatus = SEVERITY_TO_STATUS[severity as MaintenanceSeverity];
        if (newStatus) {
          await updateBoat.mutateAsync({
            id: selectedItem,
            data: { status: newStatus },
          });
        }
      }

      toast({
        title: 'Report submitted',
        description: 'Your damage report has been logged',
        variant: 'success',
      });

      // Reset form
      setSelectedItem('');
      setDamageType('');
      setSeverity('');
      setLocation('');
      setDescription('');
      setActiveTab('log');
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to submit report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = selectedItem && damageType && severity && description.trim();

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Report Damage</h1>
            <p className="text-muted-foreground mt-1">
              Report damage or issues for any boat or equipment.
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-gray-100">
            <TabsTrigger value="report" className="gap-2 data-[state=active]:bg-white">
              <AlertTriangle className="h-4 w-4" />
              Report Damage
            </TabsTrigger>
            <TabsTrigger value="log" className="gap-2 data-[state=active]:bg-white">
              <Wrench className="h-4 w-4" />
              Log Repair
            </TabsTrigger>
          </TabsList>

          <TabsContent value="report" className="mt-6">
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <CardTitle className="text-lg">Damage Report Form</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                  Provide details about the damage or issue discovered.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* What needs to be reported? */}
                  <div className="space-y-3">
                    <Label>What needs to be reported?</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setItemType('boat');
                          setSelectedItem('');
                        }}
                        className={`flex flex-col items-center justify-center gap-2 p-6 rounded-lg border-2 transition-colors ${
                          itemType === 'boat'
                            ? 'border-[#1f2937] bg-[#1f2937] text-white'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <Ship className="h-6 w-6" />
                        <span className="font-medium">A Boat</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setItemType('equipment');
                          setSelectedItem('');
                        }}
                        className={`flex flex-col items-center justify-center gap-2 p-6 rounded-lg border-2 transition-colors ${
                          itemType === 'equipment'
                            ? 'border-[#1f2937] bg-[#1f2937] text-white'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <Package className="h-6 w-6" />
                        <span className="font-medium">Equipment</span>
                      </button>
                    </div>
                  </div>

                  {/* Select Item */}
                  <div className="space-y-2">
                    <Label htmlFor="item">
                      Select {itemType === 'boat' ? 'Boat' : 'Equipment'} *
                    </Label>
                    <Select value={selectedItem} onValueChange={setSelectedItem}>
                      <SelectTrigger id="item" className="bg-white">
                        <SelectValue placeholder={`Search for a ${itemType}...`} />
                      </SelectTrigger>
                      <SelectContent>
                        {itemType === 'boat'
                          ? boats.map((boat) => (
                              <SelectItem key={boat.id} value={boat.id}>
                                {boat.displayName} ({boat.hullNumber})
                              </SelectItem>
                            ))
                          : equipment.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name} ({item.type})
                              </SelectItem>
                            ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Damage Type and Severity */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="damageType">Damage Type *</Label>
                      <Select
                        value={damageType}
                        onValueChange={(v) => setDamageType(v as MaintenanceCategory)}
                      >
                        <SelectTrigger id="damageType" className="bg-white">
                          <SelectValue placeholder="Hull Damage" />
                        </SelectTrigger>
                        <SelectContent>
                          {DAMAGE_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="severity">Severity *</Label>
                      <Select
                        value={severity}
                        onValueChange={(v) => setSeverity(v as MaintenanceSeverity)}
                      >
                        <SelectTrigger id="severity" className="bg-white">
                          <SelectValue placeholder="Medium (Needs fixing)" />
                        </SelectTrigger>
                        <SelectContent>
                          {SEVERITIES.map((sev) => (
                            <SelectItem key={sev.value} value={sev.value}>
                              {sev.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Date and Location */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateDiscovered">Date Discovered</Label>
                      <Input
                        id="dateDiscovered"
                        type="date"
                        defaultValue={new Date().toISOString().split('T')[0]}
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location on Vessel</Label>
                      <Input
                        id="location"
                        placeholder="e.g., Port bow, starboard stern"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="bg-white"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Describe the Damage *</Label>
                    <Textarea
                      id="description"
                      placeholder="What happened? Where is the damage? How bad is it? Include any relevant details..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="bg-white"
                    />
                  </div>

                  {/* Estimated Cost */}
                  <div className="space-y-2">
                    <Label htmlFor="cost">Estimated Repair Cost ($)</Label>
                    <Input
                      id="cost"
                      placeholder="Leave blank if unknown"
                      className="bg-white"
                    />
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    className="w-full bg-[#1f2937] hover:bg-[#374151]"
                    disabled={!isFormValid || isSubmitting || !permissions.canReportDamage}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Damage Report'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="log" className="mt-6">
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Open Reports</CardTitle>
              </CardHeader>
              <CardContent>
                {maintenanceLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : recentReports.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Wrench className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No open reports</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentReports.map((entry) => (
                      <MaintenanceItem key={entry.id} entry={entry} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
