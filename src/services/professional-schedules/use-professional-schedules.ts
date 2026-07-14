import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as professionalSchedulesService from "./professional-schedules.service";

// ============================================
// QUERY KEYS
// ============================================

export const professionalSchedulesKeys = {
  all: ["professional-schedules"] as const,
  byProfessional: (professionalId: number) =>
    [...professionalSchedulesKeys.all, professionalId] as const,
  allSchedules: () => [...professionalSchedulesKeys.all, "all"] as const,
  blockedDates: (professionalCode: number) =>
    [...professionalSchedulesKeys.all, "blocked-dates", professionalCode] as const,
};

// ============================================
// SCHEDULE HOOKS
// ============================================

export function useProfessionalSchedule(professionalId: number) {
  return useQuery({
    queryKey: professionalSchedulesKeys.byProfessional(professionalId),
    queryFn: () =>
      professionalSchedulesService.getProfessionalSchedule(professionalId),
    enabled: !!professionalId,
  });
}
export function useUpdateProfessionalSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      professionalId,
      dayOfWeek,
      schedule,
    }: {
      professionalId: number;
      dayOfWeek: number;
      schedule: {
        is_available: boolean;
        start_time: string;
        end_time: string;
      };
    }) =>
      professionalSchedulesService.updateProfessionalSchedule(
        professionalId,
        dayOfWeek,
        schedule
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: professionalSchedulesKeys.byProfessional(
          variables.professionalId
        ),
      });
      queryClient.invalidateQueries({
        queryKey: professionalSchedulesKeys.allSchedules(),
      });
    },
  });
}
export function useAllProfessionalSchedules() {
  return useQuery({
    queryKey: professionalSchedulesKeys.allSchedules(),
    queryFn: professionalSchedulesService.getAllProfessionalSchedules,
  });
}

// ============================================
// BLOCKED DATES HOOKS
// ============================================

export function useProfessionalBlockedDates(professionalCode: number) {
  return useQuery({
    queryKey: professionalSchedulesKeys.blockedDates(professionalCode),
    queryFn: () =>
      professionalSchedulesService.getProfessionalBlockedDates(professionalCode),
    enabled: !!professionalCode,
  });
}

export function useCreateProfessionalBlockedDate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      professionalCode,
      blockData,
    }: {
      professionalCode: number;
      blockData: { date: string; end_date?: string | null; reason?: string | null };
    }) =>
      professionalSchedulesService.createProfessionalBlockedDate(
        professionalCode,
        blockData
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: professionalSchedulesKeys.blockedDates(
          variables.professionalCode
        ),
      });
    },
  });
}
export function useDeleteProfessionalBlockedDate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; professionalCode: number }) =>
      professionalSchedulesService.deleteProfessionalBlockedDate(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: professionalSchedulesKeys.blockedDates(
          variables.professionalCode
        ),
      });
    },
  });
}
