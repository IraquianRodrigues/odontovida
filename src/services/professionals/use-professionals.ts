import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { professionalsService } from "./professionals.service";

/**
 * Hook para buscar todos os profissionais
 */
export function useProfessionals() {
  return useQuery({
    queryKey: ["professionals"],
    queryFn: () => professionalsService.getProfessionals(),
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook para buscar um profissional específico por ID
 */
export function useProfessional(id: number | null) {
  return useQuery({
    queryKey: ["professional", id],
    queryFn: () =>
      id ? professionalsService.getProfessionalById(id) : Promise.resolve(null),
    enabled: id !== null,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook para buscar um profissional específico por código
 */
export function useProfessionalByCode(code: string | null) {
  return useQuery({
    queryKey: ["professional", "code", code],
    queryFn: () =>
      code
        ? professionalsService.getProfessionalByCode(code)
        : Promise.resolve(null),
    enabled: code !== null,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook para criar um novo profissional
 */
export function useCreateProfessional() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { name: string; specialty: string | null }) => 
      professionalsService.createProfessional(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professionals"] });
    },
  });
}

/**
 * Hook para atualizar um profissional
 */
export function useUpdateProfessional() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: number; name: string; specialty: string | null }) =>
      professionalsService.updateProfessional(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professionals"] });
    },
  });
}

/**
 * Hook para deletar um profissional
 */
export function useDeleteProfessional() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => professionalsService.deleteProfessional(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professionals"] });
    },
  });
}
