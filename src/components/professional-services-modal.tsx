"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Briefcase, Clock, Plus, Check, X, Loader2 } from "lucide-react";
import type { ProfessionalRow, ServiceRow, ProfessionalServiceWithRelations } from "@/types/database.types";
import { toast } from "sonner";
import { useServices } from "@/services/services/use-services";
import {
  useServicesByProfessional,
  useCreateProfessionalService,
  useUpdateProfessionalService,
  useToggleProfessionalService,
  useDeleteProfessionalService,
} from "@/services/professional-services/use-professional-services";

interface ProfessionalServicesModalProps {
  professional: ProfessionalRow | null;
  onClose: () => void;
}

// Componente separado para cada item de serviço
interface ServiceItemProps {
  ps: ProfessionalServiceWithRelations;
  onUpdateDuration: (id: number, duration: number) => void;
  onToggleActive: (id: number) => void;
  onRemove: (id: number) => void;
  isPending: boolean;
}

function ServiceItem({
  ps,
  onUpdateDuration,
  onToggleActive,
  onRemove,
  isPending,
}: ServiceItemProps) {
  const [editingDuration, setEditingDuration] = useState(
    ps.custom_duration_minutes.toString()
  );
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="flex items-center gap-3 p-4 border rounded-lg">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium font-mono">{ps.service?.code}</span>
          <Badge variant={ps.is_active ? "default" : "secondary"}>
            {ps.is_active ? "Ativo" : "Inativo"}
          </Badge>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Clock className="h-3 w-3 text-muted-foreground" />
          {isEditing ? (
            <Input
              type="number"
              min="1"
              value={editingDuration}
              onChange={(e) => setEditingDuration(e.target.value)}
              className="w-20 h-7 text-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onUpdateDuration(ps.id, parseInt(editingDuration));
                  setIsEditing(false);
                }
                if (e.key === "Escape") {
                  setEditingDuration(ps.custom_duration_minutes.toString());
                  setIsEditing(false);
                }
              }}
            />
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {ps.custom_duration_minutes} minutos
            </button>
          )}
          {ps.service &&
            ps.custom_duration_minutes !== ps.service.duration_minutes && (
              <span className="text-xs text-muted-foreground">
                (padrão: {ps.service.duration_minutes} min)
              </span>
            )}
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleActive(ps.id)}
          disabled={isPending}
        >
          {ps.is_active ? (
            <>
              <X className="h-4 w-4 mr-1" />
              Desativar
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-1" />
              Ativar
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(ps.id)}
          disabled={isPending}
          className="text-destructive hover:text-destructive"
        >
          Remover
        </Button>
      </div>
    </div>
  );
}

export function ProfessionalServicesModal({
  professional,
  onClose,
}: ProfessionalServicesModalProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(
    null
  );
  const [customDuration, setCustomDuration] = useState("");

  const { data: allServices = [], isLoading: isLoadingServices } =
    useServices();
  const {
    data: professionalServices = [],
    isLoading: isLoadingProfessionalServices,
  } = useServicesByProfessional(professional?.id || null);

  const createMutation = useCreateProfessionalService();
  const updateMutation = useUpdateProfessionalService();
  const toggleMutation = useToggleProfessionalService();
  const deleteMutation = useDeleteProfessionalService();

  const isOpen = !!professional;
  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    toggleMutation.isPending ||
    deleteMutation.isPending;

  // Mapeia serviços que o profissional já tem
  const professionalServiceMap = new Map(
    professionalServices.map((ps) => [ps.service_id, ps])
  );

  const handleAddService = async () => {
    if (!professional || !selectedServiceId) return;

    const duration = parseInt(customDuration);
    if (isNaN(duration) || duration <= 0) {
      toast.error("Por favor, informe uma duração válida em minutos");
      return;
    }

    try {
      await createMutation.mutateAsync({
        professional_id: professional.id,
        service_id: selectedServiceId,
        custom_duration_minutes: duration,
        is_active: true,
      });
      toast.success("Serviço adicionado ao profissional!");
      setSelectedServiceId(null);
      setCustomDuration("");
    } catch (error) {
      toast.error("Erro ao adicionar serviço");
    }
  };

  const handleUpdateDuration = async (
    professionalServiceId: number,
    newDuration: number
  ) => {
    if (newDuration <= 0) {
      toast.error("Duração deve ser maior que zero");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: professionalServiceId,
        custom_duration_minutes: newDuration,
      });
      toast.success("Duração atualizada!");
    } catch (error) {
      toast.error("Erro ao atualizar duração");
    }
  };

  const handleToggleActive = async (professionalServiceId: number) => {
    const ps = professionalServices.find((p) => p.id === professionalServiceId);
    if (!ps) return;

    try {
      await toggleMutation.mutateAsync({
        id: professionalServiceId,
        isActive: !ps.is_active,
      });
      toast.success("Status atualizado!");
    } catch (error) {
      toast.error("Erro ao atualizar status");
    }
  };

  const handleRemoveService = async (professionalServiceId: number) => {
    try {
      await deleteMutation.mutateAsync(professionalServiceId);
      toast.success("Serviço removido do profissional!");
    } catch (error) {
      toast.error("Erro ao remover serviço");
    }
  };

  // Serviços disponíveis para adicionar (que o profissional ainda não tem)
  const availableServices = allServices.filter(
    (service) => !professionalServiceMap.has(service.id)
  );

  // Atualiza duração padrão quando seleciona um serviço
  useEffect(() => {
    if (selectedServiceId) {
      const service = allServices.find((s) => s.id === selectedServiceId);
      if (service) {
        setCustomDuration(service.duration_minutes.toString());
      }
    }
  }, [selectedServiceId, allServices]);

  if (!professional) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl sm:text-2xl">
            Gerenciar Serviços - {professional.name}
          </DialogTitle>
          <DialogDescription>
            Configure quais serviços este profissional pode realizar e suas
            durações específicas
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(80vh-180px)] px-6">
          <div className="space-y-6 pb-6 pr-4">
            {/* Adicionar novo serviço */}
            <div className="space-y-4">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Adicionar Serviço
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Label htmlFor="service-select" className="sr-only">
                    Selecionar Serviço
                  </Label>
                  <select
                    id="service-select"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    value={selectedServiceId || ""}
                    onChange={(e) =>
                      setSelectedServiceId(
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                    disabled={isPending || availableServices.length === 0}
                  >
                    <option value="">
                      {availableServices.length === 0
                        ? "Todos os serviços já adicionados"
                        : "Selecione um serviço"}
                    </option>
                    {availableServices.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.code} ({service.duration_minutes} min padrão)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-full sm:w-32">
                  <Label htmlFor="duration-input" className="sr-only">
                    Duração
                  </Label>
                  <Input
                    id="duration-input"
                    type="number"
                    min="1"
                    placeholder="Minutos"
                    value={customDuration}
                    onChange={(e) => setCustomDuration(e.target.value)}
                    disabled={isPending || !selectedServiceId}
                  />
                </div>
                <Button
                  onClick={handleAddService}
                  disabled={
                    isPending ||
                    !selectedServiceId ||
                    !customDuration ||
                    parseInt(customDuration) <= 0
                  }
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar
                </Button>
              </div>
            </div>

            <Separator />

            {/* Lista de serviços do profissional */}
            <div className="space-y-4">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Serviços Configurados
              </h3>

              {isLoadingServices || isLoadingProfessionalServices ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : professionalServices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhum serviço configurado ainda.</p>
                  <p className="text-sm mt-1">
                    Adicione serviços para este profissional acima.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {professionalServices.map((ps) => (
                    <ServiceItem
                      key={ps.id}
                      ps={ps}
                      onUpdateDuration={handleUpdateDuration}
                      onToggleActive={handleToggleActive}
                      onRemove={handleRemoveService}
                      isPending={isPending}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 pb-6 pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

