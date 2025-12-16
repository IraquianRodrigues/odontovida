import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { professionalServicesService } from "./professional-services.service";

/**
 * Hook para buscar serviços de um profissional
 */
export function useServicesByProfessional(professionalId: number | null) {
  return useQuery({
    queryKey: ["professional-services", "professional", professionalId],
    queryFn: () =>
      professionalId
        ? professionalServicesService.getServicesByProfessional(professionalId)
        : Promise.resolve([]),
    enabled: professionalId !== null,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para buscar profissionais que podem realizar um serviço
 */
export function useProfessionalsByService(
  serviceId: number | null,
  onlyActive: boolean = true
) {
  return useQuery({
    queryKey: ["professional-services", "service", serviceId, onlyActive],
    queryFn: () =>
      serviceId
        ? professionalServicesService.getProfessionalsByService(
            serviceId,
            onlyActive
          )
        : Promise.resolve([]),
    enabled: serviceId !== null,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para buscar uma associação específica
 */
export function useProfessionalService(
  professionalId: number | null,
  serviceId: number | null
) {
  return useQuery({
    queryKey: ["professional-services", professionalId, serviceId],
    queryFn: () =>
      professionalId && serviceId
        ? professionalServicesService.getProfessionalService(
            professionalId,
            serviceId
          )
        : Promise.resolve(null),
    enabled: professionalId !== null && serviceId !== null,
  });
}

/**
 * Hook para buscar duração customizada
 */
export function useDuration(
  professionalId: number | null,
  serviceId: number | null
) {
  return useQuery({
    queryKey: ["professional-services", "duration", professionalId, serviceId],
    queryFn: () =>
      professionalId && serviceId
        ? professionalServicesService.getDuration(professionalId, serviceId)
        : Promise.resolve(null),
    enabled: professionalId !== null && serviceId !== null,
  });
}

/**
 * Hook para criar uma nova associação
 */
export function useCreateProfessionalService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      professional_id: number;
      service_id: number;
      custom_duration_minutes: number;
      is_active?: boolean;
    }) => professionalServicesService.createProfessionalService(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["professional-services"],
      });
    },
  });
}

/**
 * Hook para atualizar uma associação
 */
export function useUpdateProfessionalService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      id: number;
      custom_duration_minutes?: number;
      is_active?: boolean;
    }) =>
      professionalServicesService.updateProfessionalService(
        params.id,
        params
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["professional-services"],
      });
    },
  });
}

/**
 * Hook para alternar status ativo/inativo
 */
export function useToggleProfessionalService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: number; isActive: boolean }) =>
      professionalServicesService.toggleProfessionalService(
        params.id,
        params.isActive
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["professional-services"],
      });
    },
  });
}

/**
 * Hook para deletar uma associação
 */
export function useDeleteProfessionalService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      professionalServicesService.deleteProfessionalService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["professional-services"],
      });
    },
  });
}
