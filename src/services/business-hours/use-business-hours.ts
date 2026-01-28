import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as businessHoursService from "./business-hours.service";
import type {
  BusinessHoursRow,
  BusinessBreakRow,
  BusinessHolidayRow,
  BusinessBlockedSlotRow,
} from "@/types/database.types";

// ============================================
// QUERY KEYS
// ============================================

export const businessHoursKeys = {
  all: ["business-hours"] as const,
  hours: () => [...businessHoursKeys.all, "hours"] as const,
  breaks: () => [...businessHoursKeys.all, "breaks"] as const,
  holidays: () => [...businessHoursKeys.all, "holidays"] as const,
  blockedSlots: () => [...businessHoursKeys.all, "blocked-slots"] as const,
};

// ============================================
// BUSINESS HOURS HOOKS
// ============================================

export function useBusinessHours() {
  return useQuery({
    queryKey: businessHoursKeys.hours(),
    queryFn: businessHoursService.getBusinessHours,
  });
}

export function useUpdateBusinessHours() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      dayOfWeek,
      hours,
    }: {
      dayOfWeek: number;
      hours: {
        is_open: boolean;
        open_time: string;
        close_time: string;
      };
    }) => businessHoursService.updateBusinessHours(dayOfWeek, hours),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: businessHoursKeys.hours() });
    },
  });
}

// ============================================
// BREAKS HOOKS
// ============================================

export function useBreaks() {
  return useQuery({
    queryKey: businessHoursKeys.breaks(),
    queryFn: businessHoursService.getBreaks,
  });
}

export function useCreateBreak() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      breakData: Parameters<typeof businessHoursService.createBreak>[0]
    ) => businessHoursService.createBreak(breakData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: businessHoursKeys.breaks() });
    },
  });
}

export function useUpdateBreak() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      breakData,
    }: {
      id: number;
      breakData: Parameters<typeof businessHoursService.updateBreak>[1];
    }) => businessHoursService.updateBreak(id, breakData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: businessHoursKeys.breaks() });
    },
  });
}

export function useDeleteBreak() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => businessHoursService.deleteBreak(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: businessHoursKeys.breaks() });
    },
  });
}

// ============================================
// HOLIDAYS HOOKS
// ============================================

export function useHolidays() {
  return useQuery({
    queryKey: businessHoursKeys.holidays(),
    queryFn: businessHoursService.getHolidays,
  });
}

export function useCreateHoliday() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      holidayData: Parameters<typeof businessHoursService.createHoliday>[0]
    ) => businessHoursService.createHoliday(holidayData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: businessHoursKeys.holidays() });
    },
  });
}

export function useDeleteHoliday() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => businessHoursService.deleteHoliday(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: businessHoursKeys.holidays() });
    },
  });
}

// ============================================
// BLOCKED SLOTS HOOKS
// ============================================

export function useBlockedSlots() {
  return useQuery({
    queryKey: businessHoursKeys.blockedSlots(),
    queryFn: businessHoursService.getBlockedSlots,
  });
}

export function useCreateBlockedSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      slotData: Parameters<typeof businessHoursService.createBlockedSlot>[0]
    ) => businessHoursService.createBlockedSlot(slotData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: businessHoursKeys.blockedSlots(),
      });
    },
  });
}

export function useDeleteBlockedSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => businessHoursService.deleteBlockedSlot(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: businessHoursKeys.blockedSlots(),
      });
    },
  });
}
