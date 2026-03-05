"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TreatmentPlansService } from "@/services/treatment-plans";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  FileText,
  Trash2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  Circle,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/get-error-message";
import type {
  TreatmentPlanWithItems,
  TreatmentPlanStatus,
  TreatmentItemStatus,
} from "@/types/treatment-plan";
import { PLAN_STATUS_LABELS, ITEM_STATUS_LABELS } from "@/types/treatment-plan";
import { TreatmentPlanForm } from "./treatment-plan-form";

interface TreatmentPlanTabProps {
  patientId: number;
  patientName: string;
  professionalId: number | null;
}

const STATUS_COLORS: Record<TreatmentPlanStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  approved: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  in_progress: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const ITEM_STATUS_ICONS: Record<TreatmentItemStatus, typeof Circle> = {
  pending: Circle,
  in_progress: Clock,
  completed: CheckCircle2,
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function TreatmentPlanTab({
  patientId,
  patientName,
  professionalId,
}: TreatmentPlanTabProps) {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [expandedPlanId, setExpandedPlanId] = useState<number | null>(null);

  const { data: plansResult, isLoading } = useQuery({
    queryKey: ["treatment-plans", patientId],
    queryFn: () => TreatmentPlansService.getPlansForClient(patientId),
  });

  const updatePlanStatus = useMutation({
    mutationFn: ({ planId, status }: { planId: number; status: TreatmentPlanStatus }) =>
      TreatmentPlansService.updatePlanStatus(planId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatment-plans", patientId] });
      toast.success("Status atualizado!");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const updateItemStatus = useMutation({
    mutationFn: ({ itemId, status }: { itemId: number; status: TreatmentItemStatus }) =>
      TreatmentPlansService.updateItemStatus(itemId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatment-plans", patientId] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deletePlan = useMutation({
    mutationFn: (planId: number) => TreatmentPlansService.deletePlan(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatment-plans", patientId] });
      toast.success("Plano excluído!");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const handleGeneratePDF = async (plan: TreatmentPlanWithItems) => {
    const { TreatmentPlanPDFService } = await import("./treatment-plan-pdf.service");
    TreatmentPlanPDFService.generateAndDownload(plan, patientName);
    toast.success("PDF gerado com sucesso!");
  };

  const cycleItemStatus = (itemId: number, current: TreatmentItemStatus) => {
    const next: Record<TreatmentItemStatus, TreatmentItemStatus> = {
      pending: "in_progress",
      in_progress: "completed",
      completed: "pending",
    };
    updateItemStatus.mutate({ itemId, status: next[current] });
  };

  const plans = plansResult?.data || [];

  if (isFormOpen) {
    return (
      <TreatmentPlanForm
        patientId={patientId}
        professionalId={professionalId}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => {
          setIsFormOpen(false);
          queryClient.invalidateQueries({ queryKey: ["treatment-plans", patientId] });
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Plano de Tratamento</h2>
        <Button onClick={() => setIsFormOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Plano
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[0, 1].map((i) => (
            <div key={i} className="h-24 rounded-xl border bg-muted/30 animate-pulse" />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-semibold">Nenhum plano de tratamento</p>
          <p className="text-sm text-muted-foreground mt-1">
            Crie o primeiro plano de tratamento para este paciente
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => {
            const isExpanded = expandedPlanId === plan.id;
            const { subtotal, total } = TreatmentPlansService.calculateTotal(
              plan.items,
              plan.discount
            );
            const completedItems = plan.items.filter((i) => i.status === "completed").length;
            const progress = plan.items.length > 0
              ? Math.round((completedItems / plan.items.length) * 100)
              : 0;

            return (
              <div
                key={plan.id}
                className="rounded-xl border bg-muted/30 overflow-hidden transition-all"
              >
                {/* Header */}
                <button
                  onClick={() => setExpandedPlanId(isExpanded ? null : plan.id)}
                  className="w-full p-6 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-bold truncate">{plan.title}</h3>
                        <Badge className={STATUS_COLORS[plan.status]}>
                          {PLAN_STATUS_LABELS[plan.status]}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{plan.items.length} procedimento{plan.items.length !== 1 ? "s" : ""}</span>
                        <span>•</span>
                        <span className="font-semibold text-foreground">{formatCurrency(total)}</span>
                        {plan.discount > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-green-600 dark:text-green-400">
                              Desconto: {formatCurrency(plan.discount)}
                            </span>
                          </>
                        )}
                        <span>•</span>
                        <span>{progress}% concluído</span>
                      </div>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t">
                    {/* Progress Bar */}
                    <div className="px-6 pt-4">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Items */}
                    <div className="p-6 space-y-3">
                      {plan.items.map((item, index) => {
                        const StatusIcon = ITEM_STATUS_ICONS[item.status];
                        const statusColor =
                          item.status === "completed"
                            ? "text-green-600"
                            : item.status === "in_progress"
                              ? "text-blue-600"
                              : "text-muted-foreground";

                        return (
                          <div
                            key={item.id}
                            className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                          >
                            <button
                              onClick={() => cycleItemStatus(item.id, item.status)}
                              className={`${statusColor} hover:scale-110 transition-transform`}
                              title={`Status: ${ITEM_STATUS_LABELS[item.status]}. Clique para alterar.`}
                            >
                              <StatusIcon className="h-5 w-5" />
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-muted-foreground">
                                  {index + 1}.
                                </span>
                                <span
                                  className={`font-semibold ${
                                    item.status === "completed" ? "line-through text-muted-foreground" : ""
                                  }`}
                                >
                                  {item.procedure_name}
                                </span>
                                {item.tooth_number && (
                                  <Badge variant="outline" className="text-xs">
                                    Dente {item.tooth_number}
                                  </Badge>
                                )}
                              </div>
                              {item.description && (
                                <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                              )}
                            </div>
                            <span className="font-bold tabular-nums whitespace-nowrap">
                              {formatCurrency(item.price)}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Summary & Actions */}
                    <div className="px-6 pb-6 space-y-4">
                      {/* Totals */}
                      <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span className="tabular-nums">{formatCurrency(subtotal)}</span>
                        </div>
                        {plan.discount > 0 && (
                          <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                            <span>Desconto</span>
                            <span className="tabular-nums">-{formatCurrency(plan.discount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-lg font-bold border-t pt-2">
                          <span>Total</span>
                          <span className="tabular-nums">{formatCurrency(total)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleGeneratePDF(plan)}
                          className="gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Gerar Orçamento PDF
                        </Button>
                        {plan.status === "pending" && (
                          <Button
                            size="sm"
                            onClick={() =>
                              updatePlanStatus.mutate({ planId: plan.id, status: "approved" })
                            }
                            className="gap-2"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Aprovar Plano
                          </Button>
                        )}
                        {plan.status === "approved" && (
                          <Button
                            size="sm"
                            onClick={() =>
                              updatePlanStatus.mutate({ planId: plan.id, status: "in_progress" })
                            }
                            className="gap-2"
                          >
                            <Clock className="h-4 w-4" />
                            Iniciar Tratamento
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            if (confirm("Tem certeza que deseja excluir este plano?")) {
                              deletePlan.mutate(plan.id);
                            }
                          }}
                          className="gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Excluir
                        </Button>
                      </div>

                      {plan.notes && (
                        <p className="text-sm text-muted-foreground italic">
                          Observações: {plan.notes}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
