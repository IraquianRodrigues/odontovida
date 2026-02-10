import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DiagnosesService,
  type CreateDiagnosisInput,
  type UpdateDiagnosisInput,
} from "./diagnoses.service";

// Query hook to get diagnoses by medical record ID
export function useDiagnosesByRecordId(recordId: string | null) {
  return useQuery({
    queryKey: ["diagnoses", "record", recordId],
    queryFn: async () => {
      if (!recordId) return [];
      const result = await DiagnosesService.getDiagnosesByRecordId(recordId);
      if (!result.success) throw new Error(result.error);
      return result.data || [];
    },
    enabled: !!recordId,
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

// Mutation hook to create diagnosis
export function useCreateDiagnosis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateDiagnosisInput) => {
      const result = await DiagnosesService.createDiagnosis(input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ["diagnoses", "record", data.medical_record_id] });
      }
    },
  });
}

// Mutation hook to update diagnosis
export function useUpdateDiagnosis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateDiagnosisInput }) => {
      const result = await DiagnosesService.updateDiagnosis(id, input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ["diagnoses", "record", data.medical_record_id] });
      }
    },
  });
}

// Mutation hook to delete diagnosis
export function useDeleteDiagnosis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, recordId }: { id: string; recordId: string }) => {
      const result = await DiagnosesService.deleteDiagnosis(id);
      if (!result.success) throw new Error(result.error);
      return { id, recordId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["diagnoses", "record", data.recordId] });
    },
  });
}
