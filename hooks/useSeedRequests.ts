import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { seedRequestApi, seedTypeApi, SeedRequest, CreateSeedRequestData, SeedType } from '@/lib/api';
import { toast } from 'sonner';

// Query Keys
export const seedRequestKeys = {
  all: ['seedRequests'] as const,
  list: () => [...seedRequestKeys.all, 'list'] as const,
  byStatus: (status: string) => [...seedRequestKeys.all, 'status', status] as const,
  detail: (id: number) => [...seedRequestKeys.all, 'detail', id] as const,
};

export const seedTypeKeys = {
  all: ['seedTypes'] as const,
  list: () => [...seedTypeKeys.all, 'list'] as const,
};

// Seed Types Hook
export const useSeedTypes = () => {
  return useQuery({
    queryKey: seedTypeKeys.list(),
    queryFn: seedTypeApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Seed Requests Hooks
export const useSeedRequests = (status?: string) => {
  return useQuery({
    queryKey: status ? seedRequestKeys.byStatus(status) : seedRequestKeys.list(),
    queryFn: () => seedRequestApi.getAll(status ? { status } : undefined),
    staleTime: 30000,
  });
};

export const useSeedRequest = (id: number) => {
  return useQuery({
    queryKey: seedRequestKeys.detail(id),
    queryFn: () => seedRequestApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateSeedRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSeedRequestData) => seedRequestApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seedRequestKeys.all });
      toast.success('Solicitação criada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao criar solicitação', {
        description: error.message,
      });
    },
  });
};

export const useUpdateSeedRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateSeedRequestData> }) =>
      seedRequestApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seedRequestKeys.all });
      toast.success('Solicitação atualizada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar solicitação', {
        description: error.message,
      });
    },
  });
};

export const useDeleteSeedRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => seedRequestApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seedRequestKeys.all });
      toast.success('Solicitação excluída com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao excluir solicitação', {
        description: error.message,
      });
    },
  });
};

export const useApproveSeedRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => seedRequestApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seedRequestKeys.all });
      toast.success('Solicitação aprovada!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao aprovar solicitação', {
        description: error.message,
      });
    },
  });
};

export const useRejectSeedRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      seedRequestApi.reject(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seedRequestKeys.all });
      toast.success('Solicitação rejeitada.');
    },
    onError: (error: Error) => {
      toast.error('Erro ao rejeitar solicitação', {
        description: error.message,
      });
    },
  });
};

export const useMarkDelivered = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => seedRequestApi.markDelivered(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seedRequestKeys.all });
      toast.success('Solicitação marcada como entregue!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao marcar como entregue', {
        description: error.message,
      });
    },
  });
};

// Helper to map API status to display status
export const mapStatusToDisplay = (status: SeedRequest['status']): string => {
  const statusMap: Record<SeedRequest['status'], string> = {
    pending: 'Pendente',
    under_review: 'Em Análise',
    approved: 'Aprovado',
    rejected: 'Rejeitado',
    delivered: 'Entregue',
  };
  return statusMap[status] || status;
};

// Helper to map display status to API status
export const mapDisplayToStatus = (display: string): SeedRequest['status'] | undefined => {
  const statusMap: Record<string, SeedRequest['status']> = {
    'Pendente': 'pending',
    'Em Análise': 'under_review',
    'Aprovado': 'approved',
    'Rejeitado': 'rejected',
    'Entregue': 'delivered',
  };
  return statusMap[display];
};
