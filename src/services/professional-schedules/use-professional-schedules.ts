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
};

// ============================================
// HOOKS
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
