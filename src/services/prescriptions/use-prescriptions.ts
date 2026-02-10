import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PrescriptionsService,
  type CreatePrescriptionInput,
  type UpdatePrescriptionInput,
} from "./prescriptions.service";

// Query hook to get prescriptions by medical record ID
export function usePrescriptionsByRecordId(recordId: string | null) {
  return useQuery({
    queryKey: ["prescriptions", "record", recordId],
    queryFn: async () => {
      if (!recordId) return [];
      const result = await PrescriptionsService.getPrescriptionsByRecordId(recordId);
      if (!result.success) throw new Error(result.error);
      return result.data || [];
    },
    enabled: !!recordId,
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

// Mutation hook to create prescription
export function useCreatePrescription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePrescriptionInput) => {
      const result = await PrescriptionsService.createPrescription(input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ["prescriptions", "record", data.medical_record_id] });
      }
    },
  });
}

// Mutation hook to update prescription
export function useUpdatePrescription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdatePrescriptionInput }) => {
      const result = await PrescriptionsService.updatePrescription(id, input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ["prescriptions", "record", data.medical_record_id] });
      }
    },
  });
}

// Mutation hook to delete prescription
export function useDeletePrescription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, recordId }: { id: string; recordId: string }) => {
      const result = await PrescriptionsService.deletePrescription(id);
      if (!result.success) throw new Error(result.error);
      return { id, recordId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions", "record", data.recordId] });
    },
  });
}
