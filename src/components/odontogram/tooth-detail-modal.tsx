"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus } from "lucide-react";
import type {
  ToothRecordWithDetails,
  ToothStatus,
  ToothSurface,
  SurfaceCondition,
  TreatmentType,
} from "@/types/odontogram";
import {
  TOOTH_NAMES,
  TOOTH_STATUS_LABELS,
  TOOTH_SURFACE_LABELS,
  SURFACE_CONDITION_LABELS,
  RESTORATION_MATERIAL_LABELS,
  TREATMENT_TYPE_LABELS,
} from "@/types/odontogram";
import { OdontogramService } from "@/services/odontogram";
import { toast } from "sonner";

interface ToothDetailModalProps {
  tooth: ToothRecordWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function ToothDetailModal({
  tooth,
  isOpen,
  onClose,
  onUpdate,
}: ToothDetailModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ToothStatus>("healthy");
  const [notes, setNotes] = useState("");
  
  // Surface condition form
  const [selectedSurface, setSelectedSurface] = useState<ToothSurface>("occlusal");
  const [selectedCondition, setSelectedCondition] = useState<SurfaceCondition>("cavity");
  
  // Treatment form
  const [treatmentType, setTreatmentType] = useState<TreatmentType>("filling");
  const [treatmentDescription, setTreatmentDescription] = useState("");
  const [treatmentCost, setTreatmentCost] = useState("");

  if (!tooth) return null;

  const handleUpdateStatus = async () => {
    setIsSubmitting(true);
    const result = await OdontogramService.updateToothStatus({
      tooth_record_id: tooth.id,
      status: selectedStatus,
      notes,
    });

    if (result.success) {
      toast.success("Status do dente atualizado!");
      onUpdate();
    } else {
      toast.error(result.error || "Erro ao atualizar status");
    }
    setIsSubmitting(false);
  };

  const handleAddCondition = async () => {
    setIsSubmitting(true);
    const result = await OdontogramService.addSurfaceCondition({
      tooth_record_id: tooth.id,
      surface: selectedSurface,
      condition: selectedCondition,
    });

    if (result.success) {
      toast.success("Condição adicionada!");
      onUpdate();
    } else {
      toast.error(result.error || "Erro ao adicionar condição");
    }
    setIsSubmitting(false);
  };

  const handleRemoveCondition = async (conditionId: string) => {
    const result = await OdontogramService.removeSurfaceCondition(conditionId);
    if (result.success) {
      toast.success("Condição removida!");
      onUpdate();
    } else {
      toast.error(result.error || "Erro ao remover condição");
    }
  };

  const handleAddTreatment = async () => {
    setIsSubmitting(true);
    const result = await OdontogramService.addTreatmentHistory({
      tooth_record_id: tooth.id,
      treatment_type: treatmentType,
      description: treatmentDescription,
      cost: treatmentCost ? parseFloat(treatmentCost) : undefined,
    });

    if (result.success) {
      toast.success("Tratamento registrado!");
      setTreatmentDescription("");
      setTreatmentCost("");
      onUpdate();
    } else {
      toast.error(result.error || "Erro ao registrar tratamento");
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Dente {tooth.tooth_number} - {TOOTH_NAMES[tooth.tooth_number]}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Current Status */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <h3 className="font-semibold mb-2">Status Atual</h3>
            <Badge className="text-sm">
              {TOOTH_STATUS_LABELS[tooth.status]}
            </Badge>
            {tooth.notes && (
              <p className="text-sm text-muted-foreground mt-2">{tooth.notes}</p>
            )}
          </div>

          {/* Update Status */}
          <div className="space-y-3">
            <h3 className="font-semibold">Atualizar Status</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-2 block">Novo Status</Label>
                <Select
                  value={selectedStatus}
                  onValueChange={(value) => setSelectedStatus(value as ToothStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TOOTH_STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-2 block">Observações</Label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notas adicionais..."
                />
              </div>
            </div>
            <Button
              onClick={handleUpdateStatus}
              disabled={isSubmitting}
              className="w-full"
            >
              Atualizar Status
            </Button>
          </div>

          {/* Surface Conditions */}
          <div className="space-y-3">
            <h3 className="font-semibold">Condições por Face</h3>
            
            {/* Existing conditions */}
            {tooth.surface_conditions.length > 0 ? (
              <div className="space-y-2">
                {tooth.surface_conditions.map((condition) => (
                  <div
                    key={condition.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div>
                      <span className="font-medium">
                        {TOOTH_SURFACE_LABELS[condition.surface]}
                      </span>
                      <span className="text-muted-foreground ml-2">
                        - {SURFACE_CONDITION_LABELS[condition.condition]}
                      </span>
                      {condition.material && (
                        <Badge variant="outline" className="ml-2">
                          {RESTORATION_MATERIAL_LABELS[condition.material]}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveCondition(condition.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhuma condição registrada
              </p>
            )}

            {/* Add new condition */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-2 block">Face</Label>
                <Select
                  value={selectedSurface}
                  onValueChange={(value) => setSelectedSurface(value as ToothSurface)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TOOTH_SURFACE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-2 block">Condição</Label>
                <Select
                  value={selectedCondition}
                  onValueChange={(value) => setSelectedCondition(value as SurfaceCondition)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SURFACE_CONDITION_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              onClick={handleAddCondition}
              disabled={isSubmitting}
              variant="outline"
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Condição
            </Button>
          </div>

          {/* Treatment History */}
          <div className="space-y-3">
            <h3 className="font-semibold">Histórico de Tratamentos</h3>
            
            {tooth.treatment_history.length > 0 ? (
              <div className="space-y-2">
                {tooth.treatment_history.map((treatment) => (
                  <div
                    key={treatment.id}
                    className="p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{TREATMENT_TYPE_LABELS[treatment.treatment_type]}</div>
                        {treatment.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {treatment.description}
                          </p>
                        )}
                        <div className="text-xs text-muted-foreground mt-2">
                          {new Date(treatment.performed_at).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      {treatment.cost && (
                        <Badge variant="secondary">
                          R$ {treatment.cost.toFixed(2)}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhum tratamento registrado
              </p>
            )}

            {/* Add new treatment */}
            <div className="space-y-3 pt-3 border-t">
              <Label>Registrar Novo Tratamento</Label>
              <div className="grid grid-cols-2 gap-3">
                <Select
                  value={treatmentType}
                  onValueChange={(value) => setTreatmentType(value as TreatmentType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TREATMENT_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Custo (opcional)"
                  value={treatmentCost}
                  onChange={(e) => setTreatmentCost(e.target.value)}
                />
              </div>
              <Textarea
                placeholder="Descrição do tratamento..."
                value={treatmentDescription}
                onChange={(e) => setTreatmentDescription(e.target.value)}
                rows={2}
              />
              <Button
                onClick={handleAddTreatment}
                disabled={isSubmitting}
                variant="outline"
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Registrar Tratamento
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
