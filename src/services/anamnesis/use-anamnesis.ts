import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AnamnesisService,
  type CreateAnamnesisInput,
  type UpdateAnamnesisInput,
} from "../anamnesis.service";

// Query hook to get anamnesis by medical record ID
export function useAnamnesisByRecordId(recordId: string | null) {
  return useQuery({
    queryKey: ["anamnesis", "record", recordId],
    queryFn: async () => {
      if (!recordId) return null;
      const result = await AnamnesisService.getAnamnesisbyRecordId(recordId);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: !!recordId,
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

// Mutation hook to create anamnesis
export function useCreateAnamnesis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateAnamnesisInput) => {
      const result = await AnamnesisService.createAnamnesis(input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ["anamnesis", "record", data.medical_record_id] });
      }
    },
  });
}

// Mutation hook to update anamnesis
export function useUpdateAnamnesis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateAnamnesisInput }) => {
      const result = await AnamnesisService.updateAnamnesis(id, input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ["anamnesis", "record", data.medical_record_id] });
      }
    },
  });
}

// Mutation hook to delete anamnesis
export function useDeleteAnamnesis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, recordId }: { id: string; recordId: string }) => {
      const result = await AnamnesisService.deleteAnamnesis(id);
      if (!result.success) throw new Error(result.error);
      return { id, recordId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["anamnesis", "record", data.recordId] });
    },
  });
}
