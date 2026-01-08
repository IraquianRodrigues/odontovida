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
// import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-2.5 sm:p-4 border rounded-lg">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium font-mono text-xs sm:text-base break-all">{ps.service?.code}</span>
          <Badge variant={ps.is_active ? "default" : "secondary"} className="text-xs">
            {ps.is_active ? "Ativo" : "Inativo"}
          </Badge>
        </div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          {isEditing ? (
            <Input
              type="number"
              min="1"
              value={editingDuration}
              onChange={(e) => setEditingDuration(e.target.value)}
              className="w-18 sm:w-20 h-7 text-xs sm:text-sm"
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
              className="text-xs sm:text-sm text-muted-foreground hover:text-foreground"
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
      <div className="flex gap-1.5 sm:gap-2 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleActive(ps.id)}
          disabled={isPending}
          className="text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3"
        >
          {ps.is_active ? (
            <>
              <X className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
              <span className="hidden sm:inline">Desativar</span>
            </>
          ) : (
            <>
              <Check className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
              <span className="hidden sm:inline">Ativar</span>
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(ps.id)}
          disabled={isPending}
          className="text-destructive hover:text-destructive text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3"
        >
          <span className="hidden sm:inline">Remover</span>
          <span className="sm:hidden">Rem</span>
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
    } catch (error: any) {
      console.error("Erro ao adicionar serviço:", error);
      const errorMessage = error?.message || "Erro desconhecido";
      toast.error(
        `Erro ao adicionar serviço: ${errorMessage}. Verifique se a tabela professional_services existe no banco.`
      );
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
      <DialogContent className="max-w-[90vw] sm:max-w-3xl max-h-[80vh] sm:max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-3 sm:px-6 pt-3 sm:pt-6 pb-2 sm:pb-4 flex-shrink-0">
          <DialogTitle className="text-base sm:text-xl md:text-2xl leading-tight">
            Gerenciar Serviços - {professional.name}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Configure quais serviços este profissional pode realizar e suas
            durações específicas
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 px-3 sm:px-6 min-h-0 overflow-y-auto">
          <div className="space-y-3 sm:space-y-6 pb-3 sm:pb-6 pr-2 sm:pr-4">
            {/* Adicionar novo serviço */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Adicionar Serviço
              </h3>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-end">
                <div className="flex-1 w-full">
                  <Label htmlFor="service-select" className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-medium">
                    Serviço
                  </Label>
                  <Select
                    value={selectedServiceId?.toString() || ""}
                    onValueChange={(value) =>
                      setSelectedServiceId(value ? Number(value) : null)
                    }
                    disabled={isPending || availableServices.length === 0}
                  >
                    <SelectTrigger id="service-select" className="w-full h-9 sm:h-10 text-xs sm:text-sm">
                      <SelectValue
                        placeholder={
                          availableServices.length === 0
                            ? "Todos os serviços já adicionados"
                            : "Selecione um serviço"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {availableServices.map((service) => (
                        <SelectItem key={service.id} value={service.id.toString()}>
                          {service.code} ({service.duration_minutes} min padrão)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full sm:w-28">
                  <Label htmlFor="duration-input" className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-medium">
                    Minutos
                  </Label>
                  <Input
                    id="duration-input"
                    type="number"
                    min="1"
                    placeholder="Minutos"
                    value={customDuration}
                    onChange={(e) => setCustomDuration(e.target.value)}
                    disabled={isPending || !selectedServiceId}
                    className="h-9 sm:h-10 text-xs sm:text-sm"
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
                  className="gap-2 h-9 sm:h-10 w-full sm:w-auto text-xs sm:text-sm"
                  size="sm"
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                  Adicionar
                </Button>
              </div>
            </div>

            <Separator />

            {/* Lista de serviços do profissional */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
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
        </div>

        <DialogFooter className="px-3 sm:px-6 pb-3 sm:pb-6 pt-2 sm:pt-4 border-t flex-shrink-0">
          <Button 
            onClick={onClose} 
            variant="outline"
            className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9"
            size="sm"
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

