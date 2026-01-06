import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockStore } from '@/lib/mockDataStore';
import type { MaintenanceEntry } from '@/lib/types';

export function useMaintenance(boatId?: string) {
  const query = useQuery({
    queryKey: boatId ? ['maintenance', boatId] : ['maintenance'],
    queryFn: () => mockStore.getMaintenance(boatId),
  });

  return {
    maintenance: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useMaintenanceEntry(id: string | undefined) {
  const query = useQuery({
    queryKey: ['maintenance', 'entry', id],
    queryFn: () => (id ? mockStore.getMaintenanceEntry(id) : Promise.resolve(undefined)),
    enabled: !!id,
  });

  return {
    entry: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useCreateMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<MaintenanceEntry, 'id' | 'reportedAt'>) =>
      mockStore.createMaintenance(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      if (variables.boatId) {
        queryClient.invalidateQueries({ queryKey: ['maintenance', variables.boatId] });
      }
    },
  });
}

export function useUpdateMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MaintenanceEntry> }) =>
      mockStore.updateMaintenance(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
    },
  });
}
