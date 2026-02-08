"use client";

import { useState } from "react";
import { useDiagnosesByRecordId, useCreateDiagnosis, useDeleteDiagnosis } from "@/services/diagnoses/use-diagnoses";
import type { DiagnosisType } from "@/services/diagnoses.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface DiagnosisFormProps {
  recordId: string | null;
}

export function DiagnosisForm({ recordId }: DiagnosisFormProps) {
  const { toast } = useToast();
  const { data: diagnoses = [] } = useDiagnosesByRecordId(recordId);
  const createMutation = useCreateDiagnosis();
  const deleteMutation = useDeleteDiagnosis();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    diagnosis_type: "primary" as DiagnosisType,
    description: "",
    cid10_code: "",
    cid10_description: "",
    clinical_justification: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recordId) {
      toast({
        title: "Erro",
        description: "ID do prontuário não encontrado.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createMutation.mutateAsync({
        medical_record_id: recordId,
        ...formData,
      });

      toast({
        title: "Diagnóstico adicionado",
        description: "O diagnóstico foi salvo com sucesso.",
      });

      setFormData({
        diagnosis_type: "primary",
        description: "",
        cid10_code: "",
        cid10_description: "",
        clinical_justification: "",
      });
      setShowForm(false);
    } catch (error: any) {
      toast({
        title: "Erro ao salvar diagnóstico",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!recordId) return;

    try {
      await deleteMutation.mutateAsync({ id, recordId });
      toast({
        title: "Diagnóstico removido",
        description: "O diagnóstico foi removido com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao remover diagnóstico",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getDiagnosisTypeLabel = (type: DiagnosisType) => {
    const labels = {
      primary: "Primário",
      secondary: "Secundário",
      differential: "Diferencial",
    };
    return labels[type];
  };

  const getDiagnosisTypeColor = (type: DiagnosisType) => {
    const colors = {
      primary: "bg-primary/10 text-primary border-primary/20",
      secondary: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800",
      differential: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-300 dark:border-yellow-800",
    };
    return colors[type];
  };

  return (
    <div className="space-y-4">
      {/* Existing Diagnoses */}
      {diagnoses.length > 0 && (
        <div className="space-y-2">
          {diagnoses.map((diagnosis) => (
            <Card
              key={diagnosis.id}
              className={cn("p-4 border-2", getDiagnosisTypeColor(diagnosis.diagnosis_type))}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-sm bg-background/50">
                  <FileText className="h-5 w-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold uppercase">
                      {getDiagnosisTypeLabel(diagnosis.diagnosis_type)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(diagnosis.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <p className="font-semibold mb-1">{diagnosis.description}</p>

                  {diagnosis.cid10_code && (
                    <div className="flex items-center gap-2 text-sm mb-1">
                      <span className="font-mono bg-background px-2 py-0.5 rounded">
                        {diagnosis.cid10_code}
                      </span>
                      {diagnosis.cid10_description && (
                        <span className="text-muted-foreground">
                          {diagnosis.cid10_description}
                        </span>
                      )}
                    </div>
                  )}

                  {diagnosis.clinical_justification && (
                    <p className="text-sm text-muted-foreground mt-2">
                      <span className="font-semibold">Justificativa:</span> {diagnosis.clinical_justification}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Diagnosis Button */}
      {!showForm && (
        <Button
          variant="outline"
          onClick={() => setShowForm(true)}
          className="w-full"
          disabled={!recordId}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Diagnóstico
        </Button>
      )}

      {/* Add Diagnosis Form */}
      {showForm && (
        <Card className="p-4 border-2 border-primary/20">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">Novo Diagnóstico</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowForm(false)}
              >
                ×
              </Button>
            </div>

            <div>
              <Label htmlFor="diagnosis_type" className="mb-2 block">Tipo de Diagnóstico</Label>
              <Select
                value={formData.diagnosis_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, diagnosis_type: value as DiagnosisType })
                }
              >
                <SelectTrigger id="diagnosis_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Primário</SelectItem>
                  <SelectItem value="secondary">Secundário</SelectItem>
                  <SelectItem value="differential">Diferencial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description" className="mb-2 block">Descrição do Diagnóstico *</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Ex: Hipertensão Arterial Sistêmica"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cid10_code" className="mb-2 block">Código CID-10</Label>
                <Input
                  id="cid10_code"
                  value={formData.cid10_code}
                  onChange={(e) =>
                    setFormData({ ...formData, cid10_code: e.target.value.toUpperCase() })
                  }
                  placeholder="Ex: I10"
                  className="font-mono"
                />
              </div>

              <div>
                <Label htmlFor="cid10_description" className="mb-2 block">Descrição CID-10</Label>
                <Input
                  id="cid10_description"
                  value={formData.cid10_description}
                  onChange={(e) =>
                    setFormData({ ...formData, cid10_description: e.target.value })
                  }
                  placeholder="Descrição oficial do CID-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="clinical_justification" className="mb-2 block">Justificativa Clínica</Label>
              <Textarea
                id="clinical_justification"
                value={formData.clinical_justification}
                onChange={(e) =>
                  setFormData({ ...formData, clinical_justification: e.target.value })
                }
                placeholder="Raciocínio clínico, achados que levaram ao diagnóstico..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1"
              >
                {createMutation.isPending ? "Salvando..." : "Salvar Diagnóstico"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Empty State */}
      {diagnoses.length === 0 && !showForm && (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Nenhum diagnóstico registrado</p>
        </div>
      )}
    </div>
  );
}
