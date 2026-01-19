import { useState, useMemo } from 'react';
import { Plus, Package, Search, Loader2, Edit, Trash2 } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useEquipment } from '@/hooks/use-equipment';
import { useDemoAuth } from '@/hooks/use-demo-auth';
import { mockStore } from '@/lib/mockDataStore';
import { toast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getStatusColor } from '@/lib/utils';
import type { Equipment, EquipmentType, EquipmentStatus, Organization } from '@/lib/types';

const EQUIPMENT_TYPES: EquipmentType[] = [
  'Trailer',
  'Sail',
  'Rigging',
  'Dolly',
  'Motor',
  'Safety',
  'Other',
];

const EQUIPMENT_STATUSES: EquipmentStatus[] = ['OK', 'Needs repair', 'Out of service'];

const ORGANIZATIONS: Organization[] = ['EO', 'YOH', 'DSC'];

export function EquipmentPage() {
  const { equipment, isLoading } = useEquipment();
  const { permissions } = useDemoAuth();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<EquipmentType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<EquipmentStatus | 'all'>('all');

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  // Form state for new equipment
  const [newEquipment, setNewEquipment] = useState({
    name: '',
    type: 'Trailer' as EquipmentType,
    organization: 'EO' as Organization,
    storageLocation: '',
    serialNumber: '',
    value: '',
    notes: '',
  });

  // Form state for editing equipment
  const [editForm, setEditForm] = useState<Partial<Equipment>>({});

  const filteredEquipment = useMemo(() => {
    return equipment.filter((item) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = item.name.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      return true;
    });
  }, [equipment, searchQuery, typeFilter, statusFilter]);

  // Create equipment mutation
  const createEquipmentMutation = useMutation({
    mutationFn: (data: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>) => mockStore.createEquipment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      setIsAddDialogOpen(false);
      setNewEquipment({
        name: '',
        type: 'Trailer',
        organization: 'EO',
        storageLocation: '',
        serialNumber: '',
        value: '',
        notes: '',
      });
      toast({
        title: 'Equipment Added',
        description: 'The new equipment has been added successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add equipment',
        variant: 'destructive',
      });
    },
  });

  // Update equipment mutation
  const updateEquipmentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Equipment> }) => mockStore.updateEquipment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      setIsEditDialogOpen(false);
      setSelectedEquipment(null);
      toast({
        title: 'Equipment Updated',
        description: 'The equipment has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update equipment',
        variant: 'destructive',
      });
    },
  });

  // Delete equipment mutation
  const deleteEquipmentMutation = useMutation({
    mutationFn: (id: string) => mockStore.deleteEquipment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      setIsDeleteDialogOpen(false);
      setSelectedEquipment(null);
      toast({
        title: 'Equipment Deleted',
        description: 'The equipment has been removed.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete equipment',
        variant: 'destructive',
      });
    },
  });

  const handleCreateEquipment = () => {
    if (!newEquipment.name) {
      toast({
        title: 'Missing Required Fields',
        description: 'Please enter an item name.',
        variant: 'destructive',
      });
      return;
    }

    createEquipmentMutation.mutate({
      name: newEquipment.name,
      type: newEquipment.type,
      organization: newEquipment.organization,
      status: 'OK',
      storageLocation: newEquipment.storageLocation || 'Not specified',
      serialNumber: newEquipment.serialNumber || undefined,
      value: newEquipment.value ? parseFloat(newEquipment.value) : undefined,
      notes: newEquipment.notes || undefined,
    });
  };

  const handleEditEquipment = (item: Equipment) => {
    setSelectedEquipment(item);
    setEditForm({
      name: item.name,
      type: item.type,
      organization: item.organization,
      status: item.status,
      storageLocation: item.storageLocation,
      serialNumber: item.serialNumber,
      value: item.value,
      notes: item.notes,
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (selectedEquipment) {
      updateEquipmentMutation.mutate({
        id: selectedEquipment.id,
        data: editForm,
      });
    }
  };

  const handleDeleteEquipment = (item: Equipment) => {
    setSelectedEquipment(item);
    setIsDeleteDialogOpen(true);
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Equipment</h1>
            <p className="text-muted-foreground">Manage trailers, sails, rigging, and other assets.</p>
          </div>
          <div className="flex gap-2">
            {permissions.canAddBoats && (
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-[#1f2937] hover:bg-[#374151]">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Equipment
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Add New Equipment</DialogTitle>
                    <DialogDescription>
                      Enter the details for the new equipment item.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Item Name *</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Main Sail #5"
                        value={newEquipment.name}
                        onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Type *</Label>
                        <Select
                          value={newEquipment.type}
                          onValueChange={(v) => setNewEquipment({ ...newEquipment, type: v as EquipmentType })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {EQUIPMENT_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Organization *</Label>
                        <Select
                          value={newEquipment.organization}
                          onValueChange={(v) => setNewEquipment({ ...newEquipment, organization: v as Organization })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ORGANIZATIONS.map((org) => (
                              <SelectItem key={org} value={org}>{org}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="value">Value ($)</Label>
                        <Input
                          id="value"
                          type="number"
                          placeholder="e.g., 500"
                          value={newEquipment.value}
                          onChange={(e) => setNewEquipment({ ...newEquipment, value: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="serialNumber">Serial Number</Label>
                        <Input
                          id="serialNumber"
                          placeholder="e.g., SN-12345"
                          value={newEquipment.serialNumber}
                          onChange={(e) => setNewEquipment({ ...newEquipment, serialNumber: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="storageLocation">Storage Location</Label>
                      <Input
                        id="storageLocation"
                        placeholder="e.g., Shed B"
                        value={newEquipment.storageLocation}
                        onChange={(e) => setNewEquipment({ ...newEquipment, storageLocation: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Any additional notes..."
                        value={newEquipment.notes}
                        onChange={(e) => setNewEquipment({ ...newEquipment, notes: e.target.value })}
                        rows={2}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateEquipment}
                      disabled={createEquipmentMutation.isPending}
                      className="bg-[#1f2937] hover:bg-[#374151]"
                    >
                      {createEquipmentMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        'Add Equipment'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Filters Card */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search equipment..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as EquipmentStatus | 'all')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {EQUIPMENT_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={typeFilter}
                onValueChange={(value) => setTypeFilter(value as EquipmentType | 'all')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Equipment Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {EQUIPMENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Equipment Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEquipment.map((item) => (
              <Card key={item.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{item.type}</p>
                    </div>
                    <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Organization</span>
                      <span>{item.organization}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location</span>
                      <span>{item.storageLocation}</span>
                    </div>
                    {item.serialNumber && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Serial #</span>
                        <span>{item.serialNumber}</span>
                      </div>
                    )}
                    {item.value && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Value</span>
                        <span>${item.value.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                {permissions.canEdit && (
                  <CardFooter className="pt-2 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditEquipment(item)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    {permissions.canDelete && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteEquipment(item)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </CardFooter>
                )}
              </Card>
            ))}
            {filteredEquipment.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No equipment found matching your filters.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Equipment Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Equipment</DialogTitle>
            <DialogDescription>
              Update the details for this equipment item.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Item Name *</Label>
              <Input
                value={editForm.name || ''}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={editForm.type}
                  onValueChange={(v) => setEditForm({ ...editForm, type: v as EquipmentType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EQUIPMENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(v) => setEditForm({ ...editForm, status: v as EquipmentStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EQUIPMENT_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Organization</Label>
                <Select
                  value={editForm.organization}
                  onValueChange={(v) => setEditForm({ ...editForm, organization: v as Organization })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORGANIZATIONS.map((org) => (
                      <SelectItem key={org} value={org}>{org}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Value ($)</Label>
                <Input
                  type="number"
                  value={editForm.value || ''}
                  onChange={(e) => setEditForm({ ...editForm, value: e.target.value ? parseFloat(e.target.value) : undefined })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Storage Location</Label>
              <Input
                value={editForm.storageLocation || ''}
                onChange={(e) => setEditForm({ ...editForm, storageLocation: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Serial Number</Label>
              <Input
                value={editForm.serialNumber || ''}
                onChange={(e) => setEditForm({ ...editForm, serialNumber: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={editForm.notes || ''}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={updateEquipmentMutation.isPending}
              className="bg-[#1f2937] hover:bg-[#374151]"
            >
              {updateEquipmentMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Equipment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete <strong>{selectedEquipment?.name}</strong> from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedEquipment && deleteEquipmentMutation.mutate(selectedEquipment.id)}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteEquipmentMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
