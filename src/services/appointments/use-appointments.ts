import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  appointmentsService,
  type GetAppointmentsParams,
} from "./appointments.service";

export function useAppointments(params?: GetAppointmentsParams) {
  return useQuery({
    queryKey: ["appointments", params],
    queryFn: () => appointmentsService.getAppointments(params),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 60, // Polling a cada 60 segundos
  });
}

export function useAppointment(id: number | null) {
  return useQuery({
    queryKey: ["appointment", id],
    queryFn: () =>
      id ? appointmentsService.getAppointmentById(id) : Promise.resolve(null),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<{
        service_code: number;
        professional_code: number;
        customer_name: string;
        customer_phone: string;
        start_time: string;
        end_time: string;
      }>;
    }) => appointmentsService.updateAppointment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointment"] });
    },
  });
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => appointmentsService.deleteAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointment"] });
    },
  });
}

/**
 * Hook para buscar serviços disponíveis para um profissional
 */
export function useAvailableServicesForProfessional(
  professionalId: number | null
) {
  return useQuery({
    queryKey: ["available-services", "professional", professionalId],
    queryFn: () =>
      professionalId
        ? appointmentsService.getAvailableServicesForProfessional(
            professionalId
          )
        : Promise.resolve([]),
    enabled: professionalId !== null,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook para buscar profissionais disponíveis para um serviço
 */
export function useAvailableProfessionalsForService(serviceId: number | null) {
  return useQuery({
    queryKey: ["available-professionals", "service", serviceId],
    queryFn: () =>
      serviceId
        ? appointmentsService.getAvailableProfessionalsForService(serviceId)
        : Promise.resolve([]),
    enabled: serviceId !== null,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook para buscar duração customizada para profissional-serviço
 */
export function useDurationForProfessionalService(
  professionalId: number | null,
  serviceId: number | null
) {
  return useQuery({
    queryKey: ["duration", "professional", professionalId, "service", serviceId],
    queryFn: () =>
      professionalId && serviceId
        ? appointmentsService.getDurationForProfessionalService(
            professionalId,
            serviceId
          )
        : Promise.resolve(null),
    enabled: professionalId !== null && serviceId !== null,
    staleTime: 1000 * 60 * 5,
  });
}
