import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockStore } from '@/lib/mockDataStore';
import type { Reservation } from '@/lib/types';

export function useReservations(boatId?: string) {
  const query = useQuery({
    queryKey: ['reservations', boatId],
    queryFn: () => mockStore.getReservations(boatId),
  });

  return {
    reservations: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
  };
}

export function useCreateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Reservation, 'id' | 'createdAt'>) =>
      mockStore.createReservation(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['reservations', variables.boatId] });
    },
  });
}

export function useDeleteReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => mockStore.deleteReservation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
  });
}
