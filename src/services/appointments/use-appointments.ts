import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  appointmentsService,
  type GetAppointmentsParams,
} from "./appointments.service";

export function useAppointments(params?: GetAppointmentsParams) {
  return useQuery({
    queryKey: ["appointments", params],
    queryFn: () => appointmentsService.getAppointments(params),
    staleTime: 1000 * 60 * 10, // 10 minutos - dados considerados frescos
    gcTime: 1000 * 60 * 15,    // 15 minutos - tempo no cache
    refetchOnWindowFocus: false, // Desabilitado para melhor performance
    // Removido refetchInterval - sem polling automático
  });
}

export function useAppointmentsByPhone(phone: string | null) {
  return useQuery({
    queryKey: ["appointments-history", phone],
    queryFn: () => phone ? appointmentsService.getAppointmentsByPhone(phone) : Promise.resolve([]),
    enabled: !!phone,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
}

export function useAppointment(id: number | null) {
  return useQuery({
    queryKey: ["appointment", id],
    queryFn: () =>
      id ? appointmentsService.getAppointmentById(id) : Promise.resolve(null),
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
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

export function useMarkAppointmentAsCompleted() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => appointmentsService.markAsCompleted(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointment"] });
    },
  });
}

export function useMarkAppointmentAsNotCompleted() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => appointmentsService.markAsNotCompleted(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointment"] });
    },
  });
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      appointmentsService.updateStatus(id, status),
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
/**
 * Hook para buscar estatísticas do dashboard
 */
export function useDashboardStats(startDate: Date, endDate: Date) {
  return useQuery({
    queryKey: ["dashboard-stats", startDate, endDate],
    queryFn: async () => {
      // Reutiliza o serviço existente para buscar appointments no intervalo
      const appointments = await appointmentsService.getAppointments({
        startDate,
        endDate
      });

      return appointments;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos de cache
  });
}
