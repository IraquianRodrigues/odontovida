import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CrmLeadStage } from "@/types/database.types";
import { crmService } from "./crm.service";

export function useCrmLeads() {
  return useQuery({
    queryKey: ["crm-leads"],
    queryFn: () => crmService.getLeads(),
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  });
}

export function useMoveCrmLeadStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { leadId: string; toStage: CrmLeadStage; note?: string }) =>
      crmService.moveLeadStage(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-leads"] });
    },
  });
}
