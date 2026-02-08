import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CriticalAlertsService,
  type CreateCriticalAlertInput,
  type UpdateCriticalAlertInput,
} from "../critical-alerts.service";

// Query hook to get all alerts for a client
export function useCriticalAlerts(clientId: number | null) {
  return useQuery({
    queryKey: ["critical-alerts", clientId],
    queryFn: async () => {
      if (!clientId) return [];
      const result = await CriticalAlertsService.getAlertsByClient(clientId);
      if (!result.success) throw new Error(result.error);
      return result.data || [];
    },
    enabled: !!clientId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

// Query hook to get only active alerts for a client
export function useActiveCriticalAlerts(clientId: number | null) {
  return useQuery({
    queryKey: ["critical-alerts", "active", clientId],
    queryFn: async () => {
      if (!clientId) return [];
      const result = await CriticalAlertsService.getActiveAlertsByClient(clientId);
      if (!result.success) throw new Error(result.error);
      return result.data || [];
    },
    enabled: !!clientId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

// Mutation hook to create an alert
export function useCreateCriticalAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCriticalAlertInput) => {
      const result = await CriticalAlertsService.createAlert(input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["critical-alerts", variables.client_id] });
      queryClient.invalidateQueries({ queryKey: ["critical-alerts", "active", variables.client_id] });
    },
  });
}

// Mutation hook to update an alert
export function useUpdateCriticalAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateCriticalAlertInput }) => {
      const result = await CriticalAlertsService.updateAlert(id, input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ["critical-alerts", data.client_id] });
        queryClient.invalidateQueries({ queryKey: ["critical-alerts", "active", data.client_id] });
      }
    },
  });
}

// Mutation hook to deactivate an alert
export function useDeactivateCriticalAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await CriticalAlertsService.deactivateAlert(id);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ["critical-alerts", data.client_id] });
        queryClient.invalidateQueries({ queryKey: ["critical-alerts", "active", data.client_id] });
      }
    },
  });
}

// Mutation hook to reactivate an alert
export function useReactivateCriticalAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await CriticalAlertsService.reactivateAlert(id);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ["critical-alerts", data.client_id] });
        queryClient.invalidateQueries({ queryKey: ["critical-alerts", "active", data.client_id] });
      }
    },
  });
}

// Mutation hook to delete an alert
export function useDeleteCriticalAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, clientId }: { id: string; clientId: number }) => {
      const result = await CriticalAlertsService.deleteAlert(id);
      if (!result.success) throw new Error(result.error);
      return { id, clientId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["critical-alerts", data.clientId] });
      queryClient.invalidateQueries({ queryKey: ["critical-alerts", "active", data.clientId] });
    },
  });
}
