import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientesService } from "./clientes.service";

/**
 * Hook para buscar todos os clientes
 */
export function useClientes() {
  return useQuery({
    queryKey: ["clientes"],
    queryFn: () => clientesService.getAllClientes(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
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
    staleTime: 1000 * 60 * 5,
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
