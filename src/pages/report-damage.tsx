import { useState, useRef } from 'react';
import { AlertTriangle, Ship, Package, Wrench, Settings, Camera, X, Loader2 } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBoats, useUpdateBoat } from '@/hooks/use-boats';
import { useEquipment } from '@/hooks/use-equipment';
import { useCreateMaintenance } from '@/hooks/use-maintenance';
import { useDemoAuth } from '@/hooks/use-demo-auth';
import { useFeatureModal } from '@/hooks/use-feature-modal';
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

const REPAIR_TYPES: string[] = [
  'Hull Repair',
  'Rigging Repair',
  'Sail Repair',
  'Motor Repair',
  'General Maintenance',
  'Safety Equipment',
  'Other',
];

export function ReportDamagePage() {
  const { boats } = useBoats();
  const { equipment } = useEquipment();
  const createMaintenance = useCreateMaintenance();
  const updateBoat = useUpdateBoat();
  const { user, permissions } = useDemoAuth();
  const { showFeatureModal } = useFeatureModal();

  const [activeTab, setActiveTab] = useState('report');

  // Report Damage form state
  const [itemType, setItemType] = useState<'boat' | 'equipment'>('boat');
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [damageType, setDamageType] = useState<MaintenanceCategory | ''>('');
  const [severity, setSeverity] = useState<MaintenanceSeverity | ''>('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [damageImageUrl, setDamageImageUrl] = useState<string | null>(null);
  const [isUploadingDamageImage, setIsUploadingDamageImage] = useState(false);
  const damageFileInputRef = useRef<HTMLInputElement>(null);

  // Log Repair form state
  const [repairItemType, setRepairItemType] = useState<'boat' | 'equipment'>('boat');
  const [repairSelectedItem, setRepairSelectedItem] = useState<string>('');
  const [repairType, setRepairType] = useState<string>('');
  const [repairDescription, setRepairDescription] = useState('');
  const [partsUsed, setPartsUsed] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [repairImageUrl, setRepairImageUrl] = useState<string | null>(null);
  const [isUploadingRepairImage, setIsUploadingRepairImage] = useState(false);
  const repairFileInputRef = useRef<HTMLInputElement>(null);

  const handleDamageImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Please select an image under 5MB',
        variant: 'destructive',
      });
      return;
    }

    setIsUploadingDamageImage(true);

    // Convert to base64 for demo (production uses R2 storage)
    const reader = new FileReader();
    reader.onloadend = () => {
      setDamageImageUrl(reader.result as string);
      setIsUploadingDamageImage(false);
      toast({
        title: 'Photo Added',
        description: 'Image uploaded successfully',
        variant: 'success',
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRepairImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Please select an image under 5MB',
        variant: 'destructive',
      });
      return;
    }

    setIsUploadingRepairImage(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      setRepairImageUrl(reader.result as string);
      setIsUploadingRepairImage(false);
      toast({
        title: 'Photo Added',
        description: 'Image uploaded successfully',
        variant: 'success',
      });
    };
    reader.readAsDataURL(file);
  };

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

  // Dynamic header based on active tab
  const headerConfig = activeTab === 'report'
    ? {
        icon: AlertTriangle,
        iconBg: 'bg-red-50',
        iconColor: 'text-red-500',
        title: 'Report Damage',
        subtitle: 'Report damage or issues for any boat or equipment.',
      }
    : {
        icon: Wrench,
        iconBg: 'bg-gray-100',
        iconColor: 'text-gray-600',
        title: 'Log Repair',
        subtitle: 'Record a completed repair or maintenance work.',
      };

  const HeaderIcon = headerConfig.icon;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-start gap-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-full ${headerConfig.iconBg}`}>
            <HeaderIcon className={`h-6 w-6 ${headerConfig.iconColor}`} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{headerConfig.title}</h1>
            <p className="text-muted-foreground mt-1">
              {headerConfig.subtitle}
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
                            ? 'border-primary bg-primary text-primary-foreground'
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
                            ? 'border-primary bg-primary text-primary-foreground'
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

                  {/* Photo Upload */}
                  <div className="space-y-2">
                    <Label>Add Photo (Optional)</Label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleDamageImageUpload}
                      ref={damageFileInputRef}
                      className="hidden"
                    />
                    {damageImageUrl ? (
                      <div className="relative inline-block">
                        <img
                          src={damageImageUrl}
                          alt="Damage preview"
                          className="max-h-48 rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setDamageImageUrl(null);
                            if (damageFileInputRef.current) {
                              damageFileInputRef.current.value = '';
                            }
                          }}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => damageFileInputRef.current?.click()}
                        disabled={isUploadingDamageImage}
                        className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {isUploadingDamageImage ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Camera className="h-5 w-5" />
                        )}
                        <span>{isUploadingDamageImage ? 'Uploading...' : 'Click to add a photo'}</span>
                      </button>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Accepts JPEG, PNG, GIF, WebP (max 5MB)
                    </p>
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    className="w-full"
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
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-gray-600" />
                  <CardTitle className="text-lg">Repair Log Form</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                  Record details of completed repairs or maintenance work.
                </p>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  {/* What was repaired? */}
                  <div className="space-y-3">
                    <Label>What was repaired?</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setRepairItemType('boat');
                          setRepairSelectedItem('');
                        }}
                        className={`flex flex-col items-center justify-center gap-2 p-6 rounded-lg border-2 transition-colors ${
                          repairItemType === 'boat'
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <Ship className="h-6 w-6" />
                        <span className="font-medium">A Boat</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRepairItemType('equipment');
                          setRepairSelectedItem('');
                        }}
                        className={`flex flex-col items-center justify-center gap-2 p-6 rounded-lg border-2 transition-colors ${
                          repairItemType === 'equipment'
                            ? 'border-primary bg-primary text-primary-foreground'
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
                    <Label htmlFor="repairItem">
                      Select {repairItemType === 'boat' ? 'Boat' : 'Equipment'} *
                    </Label>
                    <Select value={repairSelectedItem} onValueChange={setRepairSelectedItem}>
                      <SelectTrigger id="repairItem" className="bg-white">
                        <SelectValue placeholder={`Search for a ${repairItemType}...`} />
                      </SelectTrigger>
                      <SelectContent>
                        {repairItemType === 'boat'
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

                  {/* Repair Type and Date Completed */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="repairType">Repair Type *</Label>
                      <Select value={repairType} onValueChange={setRepairType}>
                        <SelectTrigger id="repairType" className="bg-white">
                          <SelectValue placeholder="Hull Repair" />
                        </SelectTrigger>
                        <SelectContent>
                          {REPAIR_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateCompleted">Date Completed</Label>
                      <Input
                        id="dateCompleted"
                        type="date"
                        defaultValue={new Date().toISOString().split('T')[0]}
                        className="bg-white"
                      />
                    </div>
                  </div>

                  {/* Describe the Repair */}
                  <div className="space-y-2">
                    <Label htmlFor="repairDescription">Describe the Repair *</Label>
                    <Textarea
                      id="repairDescription"
                      placeholder="What was done? Describe the repair work completed..."
                      value={repairDescription}
                      onChange={(e) => setRepairDescription(e.target.value)}
                      rows={4}
                      className="bg-white"
                    />
                  </div>

                  {/* Parts Used and Total Cost */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="partsUsed">Parts Used</Label>
                      <Input
                        id="partsUsed"
                        placeholder="List any parts or materials used"
                        value={partsUsed}
                        onChange={(e) => setPartsUsed(e.target.value)}
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="totalCost">Total Cost ($)</Label>
                      <Input
                        id="totalCost"
                        placeholder="Parts + labor"
                        value={totalCost}
                        onChange={(e) => setTotalCost(e.target.value)}
                        className="bg-white"
                      />
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="additionalNotes">Additional Notes</Label>
                    <Textarea
                      id="additionalNotes"
                      placeholder="Any follow-up recommendations or notes..."
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      rows={3}
                      className="bg-white"
                    />
                  </div>

                  {/* Photo Upload */}
                  <div className="space-y-2">
                    <Label>Add Photo (Optional)</Label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleRepairImageUpload}
                      ref={repairFileInputRef}
                      className="hidden"
                    />
                    {repairImageUrl ? (
                      <div className="relative inline-block">
                        <img
                          src={repairImageUrl}
                          alt="Repair preview"
                          className="max-h-48 rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setRepairImageUrl(null);
                            if (repairFileInputRef.current) {
                              repairFileInputRef.current.value = '';
                            }
                          }}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => repairFileInputRef.current?.click()}
                        disabled={isUploadingRepairImage}
                        className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {isUploadingRepairImage ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Camera className="h-5 w-5" />
                        )}
                        <span>{isUploadingRepairImage ? 'Uploading...' : 'Click to add a photo'}</span>
                      </button>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Accepts JPEG, PNG, GIF, WebP (max 5MB)
                    </p>
                  </div>

                  {/* Submit */}
                  <Button
                    type="button"
                    className="w-full"
                    onClick={() => showFeatureModal('saveLogEntry')}
                  >
                    Save Repair Log
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
