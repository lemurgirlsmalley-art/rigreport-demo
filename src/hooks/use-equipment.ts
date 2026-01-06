import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockStore } from '@/lib/mockDataStore';
import type { Equipment } from '@/lib/types';

export function useEquipment() {
  const query = useQuery({
    queryKey: ['equipment'],
    queryFn: () => mockStore.getEquipment(),
  });

  return {
    equipment: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useEquipmentItem(id: string | undefined) {
  const query = useQuery({
    queryKey: ['equipment', id],
    queryFn: () => (id ? mockStore.getEquipmentItem(id) : Promise.resolve(undefined)),
    enabled: !!id,
  });

  return {
    equipment: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useCreateEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>) =>
      mockStore.createEquipment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });
}

export function useUpdateEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Equipment> }) =>
      mockStore.updateEquipment(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      queryClient.invalidateQueries({ queryKey: ['equipment', variables.id] });
    },
  });
}

export function useDeleteEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => mockStore.deleteEquipment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });
}
