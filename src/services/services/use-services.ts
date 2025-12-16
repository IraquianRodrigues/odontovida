import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { servicesService } from "./services.service";

/**
 * Hook para buscar todos os serviços
 */
export function useServices() {
  return useQuery({
    queryKey: ["services"],
    queryFn: () => servicesService.getServices(),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para buscar um serviço específico por ID
 */
export function useService(id: number | null) {
  return useQuery({
    queryKey: ["service", id],
    queryFn: () =>
      id ? servicesService.getServiceById(id) : Promise.resolve(null),
    enabled: id !== null,
  });
}

/**
 * Hook para buscar um serviço específico por código
 */
export function useServiceByCode(code: string | null) {
  return useQuery({
    queryKey: ["service", "code", code],
    queryFn: () =>
      code ? servicesService.getServiceByCode(code) : Promise.resolve(null),
    enabled: code !== null,
  });
}

/**
 * Hook para criar um novo serviço
 */
export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { code: string; duration_minutes: number }) =>
      servicesService.createService(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
}

/**
 * Hook para atualizar um serviço
 */
export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: number; code: string; duration_minutes: number }) =>
      servicesService.updateService(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
}

/**
 * Hook para deletar um serviço
 */
export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => servicesService.deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
}

