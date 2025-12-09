import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deliveryApi, agentApi, DeliveryPoint, DeliveryRoute, Agent } from '@/lib/api';

// Query Keys
export const deliveryKeys = {
  all: ['delivery'] as const,
  points: () => [...deliveryKeys.all, 'points'] as const,
  pointsByType: (type: string) => [...deliveryKeys.points(), type] as const,
  routes: () => [...deliveryKeys.all, 'routes'] as const,
  routesByStatus: (status: string) => [...deliveryKeys.routes(), status] as const,
  route: (id: number) => [...deliveryKeys.routes(), id] as const,
};

export const agentKeys = {
  all: ['agents'] as const,
  list: () => [...agentKeys.all, 'list'] as const,
  active: () => [...agentKeys.all, 'active'] as const,
  agent: (id: number) => [...agentKeys.all, id] as const,
};

// Delivery Points Hooks
export const useDeliveryPoints = (pointType?: string) => {
  return useQuery({
    queryKey: pointType ? deliveryKeys.pointsByType(pointType) : deliveryKeys.points(),
    queryFn: () => deliveryApi.getPoints(pointType ? { point_type: pointType } : undefined),
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
};

// Delivery Routes Hooks
export const useDeliveryRoutes = (status?: string) => {
  return useQuery({
    queryKey: status ? deliveryKeys.routesByStatus(status) : deliveryKeys.routes(),
    queryFn: () => deliveryApi.getRoutes(status ? { status } : undefined),
    staleTime: 10000, // 10 seconds
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });
};

export const useDeliveryRoute = (id: number) => {
  return useQuery({
    queryKey: deliveryKeys.route(id),
    queryFn: () => deliveryApi.getRouteById(id),
    enabled: !!id,
  });
};

export const useStartRoute = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => deliveryApi.startRoute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliveryKeys.routes() });
    },
  });
};

export const useCompleteRoute = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => deliveryApi.completeRoute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliveryKeys.routes() });
    },
  });
};

// Agents Hooks
export const useAgents = (activeOnly = true) => {
  return useQuery({
    queryKey: activeOnly ? agentKeys.active() : agentKeys.list(),
    queryFn: () => agentApi.getAgents(activeOnly ? { is_active: true } : undefined),
    staleTime: 5000, // 5 seconds for real-time agent tracking
    refetchInterval: 10000, // Refetch every 10 seconds
  });
};

export const useAgent = (id: number) => {
  return useQuery({
    queryKey: agentKeys.agent(id),
    queryFn: () => agentApi.getAgentById(id),
    enabled: !!id,
  });
};

export const useUpdateAgentLocation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, latitude, longitude }: { id: number; latitude: number; longitude: number }) =>
      agentApi.updateLocation(id, latitude, longitude),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.all });
    },
  });
};

// Combined hook for map data
export const useMapData = () => {
  const pointsQuery = useDeliveryPoints();
  const routesQuery = useDeliveryRoutes('in_progress');
  const agentsQuery = useAgents(true);
  
  return {
    points: pointsQuery.data ?? [],
    routes: routesQuery.data ?? [],
    agents: agentsQuery.data ?? [],
    isLoading: pointsQuery.isLoading || routesQuery.isLoading || agentsQuery.isLoading,
    isError: pointsQuery.isError || routesQuery.isError || agentsQuery.isError,
    error: pointsQuery.error || routesQuery.error || agentsQuery.error,
    refetch: () => {
      pointsQuery.refetch();
      routesQuery.refetch();
      agentsQuery.refetch();
    },
  };
};
