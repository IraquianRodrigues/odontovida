import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MedicalRecordsService } from "../medical-records.service";
import type { CreateMedicalRecordInput, UpdateMedicalRecordInput } from "../medical-records.service";

// Query hook to get medical records for a client
export function useMedicalRecords(clientId: number | null) {
  return useQuery({
    queryKey: ["medical-records", clientId],
    queryFn: async () => {
      if (!clientId) return [];
      const result = await MedicalRecordsService.getMedicalRecords(clientId);
      if (!result.success) throw new Error(result.error);
      return result.data || [];
    },
    enabled: !!clientId,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
}

// Query hook to get latest medical record
export function useLatestMedicalRecord(clientId: number | null) {
  return useQuery({
    queryKey: ["medical-records", "latest", clientId],
    queryFn: async () => {
      if (!clientId) return null;
      const result = await MedicalRecordsService.getLatestMedicalRecord(clientId);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: !!clientId,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
}

// Mutation hook to create a medical record
export function useCreateMedicalRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateMedicalRecordInput) => {
      const result = await MedicalRecordsService.createMedicalRecord(input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["medical-records", variables.client_id] });
      queryClient.invalidateQueries({ queryKey: ["medical-records", "latest", variables.client_id] });
    },
  });
}

// Mutation hook to update a medical record
export function useUpdateMedicalRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateMedicalRecordInput }) => {
      const result = await MedicalRecordsService.updateMedicalRecord(id, input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-records"] });
    },
  });
}

// Mutation hook to delete a medical record
export function useDeleteMedicalRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await MedicalRecordsService.deleteMedicalRecord(id);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-records"] });
    },
  });
}
