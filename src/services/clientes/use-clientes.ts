import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientesService } from "./clientes.service";

/**
 * Hook para buscar todos os clientes
 */
export function useClientes() {
  return useQuery({
    queryKey: ["clientes"],
    queryFn: () => clientesService.getAllClientes(),
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook para buscar cliente por telefone
 */
export function useClienteByTelefone(telefone: string | null) {
  return useQuery({
    queryKey: ["cliente", telefone],
    queryFn: () =>
      telefone
        ? clientesService.getClienteByTelefone(telefone)
        : Promise.resolve(null),
    enabled: !!telefone,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook para atualizar trava do cliente
 */
export function useUpdateClienteTrava() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ telefone, trava }: { telefone: string; trava: boolean }) =>
      clientesService.updateClienteTrava(telefone, trava),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["cliente", variables.telefone],
      });
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
    },
  });
}

/**
 * Hook para atualizar anotações do cliente
 */
export function useUpdateClienteNotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ telefone, notes }: { telefone: string; notes: string }) =>
      clientesService.updateClienteNotes(telefone, notes),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["cliente", variables.telefone],
      });
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
    },
  });
}
