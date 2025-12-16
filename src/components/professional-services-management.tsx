"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Plus, Save, Trash2, Clock } from "lucide-react";
import type { ProfessionalRow, ServiceRow } from "@/types/database.types";
import { toast } from "sonner";
import { useServices } from "@/services/services/use-services";
import {
  useServicesByProfessional,
  useCreateProfessionalService,
  useUpdateProfessionalService,
  useDeleteProfessionalService,
} from "@/services/professional-services/use-professional-services";

interface ProfessionalServicesManagementProps {
  professional: ProfessionalRow;
}

interface ServiceState {
  serviceId: number;
  associationId: number | null;
  isActive: boolean;
  customDuration: number;
  defaultDuration: number;
  isEditing: boolean;
}

export function ProfessionalServicesManagement({
  professional,
}: ProfessionalServicesManagementProps) {
  const [serviceStates, setServiceStates] = useState<
    Map<number, ServiceState>
  >(new Map());

  const { data: allServices = [], isLoading: isLoadingServices } =
    useServices();
  const {
    data: professionalServices = [],
    isLoading: isLoadingProfessionalServices,
  } = useServicesByProfessional(professional.id);

  const createMutation = useCreateProfessionalService();
  const updateMutation = useUpdateProfessionalService();
  const deleteMutation = useDeleteProfessionalService();

  // Inicializa os estados dos serviços
  useEffect(() => {
    const newStates = new Map<number, ServiceState>();

    allServices.forEach((service) => {
      const association = professionalServices.find(
        (ps) => ps.service_id === service.id
      );

      newStates.set(service.id, {
        serviceId: service.id,
        associationId: association?.id || null,
        isActive: association?.is_active || false,
        customDuration: association?.custom_duration_minutes || service.duration_minutes,
        defaultDuration: service.duration_minutes,
        isEditing: false,
      });
    });

    setServiceStates(newStates);
  }, [allServices, professionalServices]);

  const handleToggleService = async (serviceId: number) => {
    const state = serviceStates.get(serviceId);
    if (!state) return;

    try {
      if (state.associationId) {
        // Atualizar associação existente
        await updateMutation.mutateAsync({
          id: state.associationId,
          is_active: !state.isActive,
        });

        toast.success(
          state.isActive
            ? "Serviço desativado com sucesso"
            : "Serviço ativado com sucesso"
        );
      } else {
        // Criar nova associação
        await createMutation.mutateAsync({
          professional_id: professional.id,
          service_id: serviceId,
          custom_duration_minutes: state.customDuration,
          is_active: true,
        });

        toast.success("Serviço adicionado com sucesso");
      }
    } catch (error) {
      toast.error("Erro ao atualizar serviço");
    }
  };

  const handleUpdateDuration = async (serviceId: number, duration: number) => {
    const state = serviceStates.get(serviceId);
    if (!state || !state.associationId) return;

    if (duration <= 0) {
      toast.error("Duração deve ser maior que zero");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: state.associationId,
        custom_duration_minutes: duration,
      });

      toast.success("Duração atualizada com sucesso");

      // Desabilita edição
      setServiceStates((prev) => {
        const newStates = new Map(prev);
        const current = newStates.get(serviceId);
        if (current) {
          newStates.set(serviceId, { ...current, isEditing: false });
        }
        return newStates;
      });
    } catch (error) {
      toast.error("Erro ao atualizar duração");
    }
  };

  const handleDeleteService = async (serviceId: number) => {
    const state = serviceStates.get(serviceId);
    if (!state || !state.associationId) return;

    try {
      await deleteMutation.mutateAsync(state.associationId);
      toast.success("Associação removida com sucesso");
    } catch (error) {
      toast.error("Erro ao remover associação");
    }
  };

  const handleDurationChange = (serviceId: number, value: string) => {
    const duration = parseInt(value);
    if (isNaN(duration)) return;

    setServiceStates((prev) => {
      const newStates = new Map(prev);
      const current = newStates.get(serviceId);
      if (current) {
        newStates.set(serviceId, { ...current, customDuration: duration });
      }
      return newStates;
    });
  };

  const toggleEditing = (serviceId: number) => {
    setServiceStates((prev) => {
      const newStates = new Map(prev);
      const current = newStates.get(serviceId);
      if (current) {
        newStates.set(serviceId, {
          ...current,
          isEditing: !current.isEditing,
        });
      }
      return newStates;
    });
  };

  const isLoading = isLoadingServices || isLoadingProfessionalServices;
  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Carregando serviços...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Serviços do Profissional</h3>
            <p className="text-sm text-muted-foreground">
              Gerencie quais serviços {professional.name} pode realizar e defina
              a duração específica para cada um
            </p>
          </div>

          <Separator />

          {allServices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum serviço cadastrado no sistema
            </div>
          ) : (
            <div className="space-y-3">
              {allServices.map((service) => {
                const state = serviceStates.get(service.id);
                if (!state) return null;

                return (
                  <div
                    key={service.id}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="font-medium font-mono">
                          {service.code}
                        </span>
                        {state.isActive ? (
                          <Badge variant="default">Ativo</Badge>
                        ) : (
                          <Badge variant="secondary">Inativo</Badge>
                        )}
                      </div>

                      {state.isActive && (
                        <div className="flex items-center gap-3">
                          {state.isEditing ? (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <Input
                                type="number"
                                min="1"
                                value={state.customDuration}
                                onChange={(e) =>
                                  handleDurationChange(
                                    service.id,
                                    e.target.value
                                  )
                                }
                                className="w-24 h-8"
                                disabled={isPending}
                              />
                              <span className="text-sm text-muted-foreground">
                                minutos
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  handleUpdateDuration(
                                    service.id,
                                    state.customDuration
                                  )
                                }
                                disabled={isPending}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {state.customDuration} minutos
                              </span>
                              {state.customDuration !==
                                state.defaultDuration && (
                                <span className="text-xs text-muted-foreground">
                                  (padrão: {state.defaultDuration}min)
                                </span>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleEditing(service.id)}
                                disabled={isPending}
                              >
                                Editar
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={state.isActive ? "outline" : "default"}
                        onClick={() => handleToggleService(service.id)}
                        disabled={isPending}
                        className="gap-2"
                      >
                        {state.isActive ? (
                          "Desativar"
                        ) : (
                          <>
                            <Plus className="h-4 w-4" />
                            Adicionar
                          </>
                        )}
                      </Button>

                      {state.associationId && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteService(service.id)}
                          disabled={isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

