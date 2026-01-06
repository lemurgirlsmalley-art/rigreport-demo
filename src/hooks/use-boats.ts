import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockStore } from '@/lib/mockDataStore';
import type { Boat } from '@/lib/types';

export function useBoats() {
  const query = useQuery({
    queryKey: ['boats'],
    queryFn: () => mockStore.getBoats(),
  });

  return {
    boats: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useBoat(id: string | undefined) {
  const query = useQuery({
    queryKey: ['boats', id],
    queryFn: () => (id ? mockStore.getBoat(id) : Promise.resolve(undefined)),
    enabled: !!id,
  });

  return {
    boat: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useCreateBoat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Boat, 'id' | 'createdAt' | 'updatedAt'>) =>
      mockStore.createBoat(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boats'] });
    },
  });
}

export function useUpdateBoat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Boat> }) =>
      mockStore.updateBoat(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['boats'] });
      queryClient.invalidateQueries({ queryKey: ['boats', variables.id] });
    },
  });
}

export function useDeleteBoat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => mockStore.deleteBoat(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boats'] });
    },
  });
}
