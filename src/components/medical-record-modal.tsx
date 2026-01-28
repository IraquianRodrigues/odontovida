"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MedicalRecordsService, type MedicalRecord } from "@/services/medical-records.service";
import { useUserRole } from "@/hooks/use-user-role";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { VitalSignsForm } from "@/components/vital-signs-form";
import { User, FileText, Activity, History, Save, X, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MedicalRecordModalProps {
  patientId: number;
  isOpen: boolean;
  onClose: () => void;
  recordId?: string; // Para editar um prontuário existente
}

export function MedicalRecordModal({
  patientId,
  isOpen,
  onClose,
  recordId,
}: MedicalRecordModalProps) {
  const { profile } = useUserRole();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("soap");
  const [viewingRecord, setViewingRecord] = useState<MedicalRecord | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    soap_subjective: "",
    soap_objective: "",
    soap_assessment: "",
    soap_plan: "",
    clinical_notes: "",
    observations: "",
    vital_signs: {},
  });

  // Buscar dados do paciente
  const { data: clientData } = useQuery({
    queryKey: ["client", patientId],
    queryFn: async () => {
      const supabase = (await import("@/lib/supabase/client")).createClient();
      const { data } = await supabase
        .from("clientes")
        .select("*")
        .eq("id", patientId)
        .single();
      return data;
    },
    enabled: isOpen,
  });

  // Buscar prontuário existente se recordId fornecido
  const { data: recordData } = useQuery({
    queryKey: ["medical-record", recordId],
    queryFn: async () => {
      if (!recordId) return null;
      return MedicalRecordsService.getMedicalRecordById(recordId);
    },
    enabled: !!recordId,
  });

  // Buscar histórico de prontuários do paciente
  const { data: historyData } = useQuery({
    queryKey: ["medical-records-history", patientId],
    queryFn: () => MedicalRecordsService.getMedicalRecords(patientId),
    enabled: isOpen,
  });

  // Mutation para salvar prontuário
  const saveMutation = useMutation({
    mutationFn: async () => {
      // Buscar ID do profissional
      const supabase = (await import("@/lib/supabase/client")).createClient();
      const { data: professional } = await supabase
        .from("professionals")
        .select("id")
        .eq("email", profile?.email)
        .single();

      if (!professional) throw new Error("Profissional não encontrado");

      if (recordId) {
        // Atualizar prontuário existente
        return MedicalRecordsService.updateMedicalRecord(recordId, formData);
      } else {
        // Criar novo prontuário
        return MedicalRecordsService.createMedicalRecord({
          client_id: patientId,
          professional_id: professional.id,
          ...formData,
        });
      }
    },
    onSuccess: () => {
      toast({
        title: "Prontuário salvo",
        description: "O prontuário foi salvo com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["medical-records-history", patientId] });
      queryClient.invalidateQueries({ queryKey: ["professional-patients"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar o prontuário.",
        variant: "destructive",
      });
    },
  });

  const handleSave = useCallback(() => {
    saveMutation.mutate();
  }, [saveMutation]);

  const handleVitalSignsChange = useCallback((vital_signs: any) => {
    setFormData((prev) => ({ ...prev, vital_signs }));
  }, []);

  const history = historyData?.data || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Prontuário Médico - {clientData?.nome || "Carregando..."}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="patient" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Paciente
            </TabsTrigger>
            <TabsTrigger value="soap" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              SOAP
            </TabsTrigger>
            <TabsTrigger value="vitals" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Sinais Vitais
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto mt-4">
            {/* Aba Paciente */}
            <TabsContent value="patient" className="space-y-4 m-0">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Nome</Label>
                  <p className="font-medium">{clientData?.nome}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Telefone</Label>
                  <p className="font-medium">{clientData?.telefone}</p>
                </div>
                {clientData?.email && (
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-medium">{clientData.email}</p>
                  </div>
                )}
              </div>

              {clientData?.notes && (
                <div>
                  <Label className="text-muted-foreground">Observações Gerais</Label>
                  <p className="mt-1 text-sm bg-muted p-3 rounded-md">
                    {clientData.notes}
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Aba SOAP */}
            <TabsContent value="soap" className="space-y-4 m-0">
              <div className="space-y-4">
                {/* Subjetivo */}
                <div>
                  <Label htmlFor="subjective" className="text-base font-semibold">
                    S - Subjetivo
                  </Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Queixa principal, sintomas, história da doença atual, antecedentes
                  </p>
                  <Textarea
                    id="subjective"
                    placeholder="Ex: Paciente relata dor de cabeça há 3 dias, localizada na região frontal..."
                    value={formData.soap_subjective}
                    onChange={(e) =>
                      setFormData({ ...formData, soap_subjective: e.target.value })
                    }
                    rows={4}
                  />
                </div>

                {/* Objetivo */}
                <div>
                  <Label htmlFor="objective" className="text-base font-semibold">
                    O - Objetivo
                  </Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Exame físico, resultados de exames, achados clínicos
                  </p>
                  <Textarea
                    id="objective"
                    placeholder="Ex: Paciente consciente, orientado. PA: 120/80 mmHg. Ausculta pulmonar sem alterações..."
                    value={formData.soap_objective}
                    onChange={(e) =>
                      setFormData({ ...formData, soap_objective: e.target.value })
                    }
                    rows={4}
                  />
                </div>

                {/* Avaliação */}
                <div>
                  <Label htmlFor="assessment" className="text-base font-semibold">
                    A - Avaliação
                  </Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Hipótese diagnóstica, diagnóstico diferencial, raciocínio clínico
                  </p>
                  <Textarea
                    id="assessment"
                    placeholder="Ex: Hipótese diagnóstica: Cefaleia tensional. Diagnóstico diferencial: Enxaqueca..."
                    value={formData.soap_assessment}
                    onChange={(e) =>
                      setFormData({ ...formData, soap_assessment: e.target.value })
                    }
                    rows={4}
                  />
                </div>

                {/* Plano */}
                <div>
                  <Label htmlFor="plan" className="text-base font-semibold">
                    P - Plano
                  </Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Condutas, medicações, exames solicitados, orientações, retorno
                  </p>
                  <Textarea
                    id="plan"
                    placeholder="Ex: Prescrever analgésico. Solicitar hemograma completo. Orientar repouso. Retorno em 7 dias..."
                    value={formData.soap_plan}
                    onChange={(e) =>
                      setFormData({ ...formData, soap_plan: e.target.value })
                    }
                    rows={4}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Aba Sinais Vitais */}
            <TabsContent value="vitals" className="m-0">
              <VitalSignsForm
                value={formData.vital_signs}
                onChange={handleVitalSignsChange}
              />
            </TabsContent>

            {/* Aba Histórico */}
            <TabsContent value="history" className="space-y-4 m-0">
              {history.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhum prontuário anterior encontrado</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((record) => (
                    <div
                      key={record.id}
                      className="border border-border rounded-lg overflow-hidden"
                    >
                      {/* Header com resumo */}
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold">
                            {format(new Date(record.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-muted-foreground">
                              Dr(a). {record.professional?.name || "Não informado"}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setViewingRecord(viewingRecord?.id === record.id ? null : record)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              {viewingRecord?.id === record.id ? "Ocultar" : "Ver Detalhes"}
                            </Button>
                          </div>
                        </div>
                        
                        {/* Resumo rápido */}
                        {!viewingRecord || viewingRecord.id !== record.id ? (
                          <>
                            {record.soap_subjective && (
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground">
                                  Subjetivo:
                                </p>
                                <p className="text-sm line-clamp-2">{record.soap_subjective}</p>
                              </div>
                            )}
                            {record.soap_assessment && (
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground">
                                  Avaliação:
                                </p>
                                <p className="text-sm line-clamp-2">{record.soap_assessment}</p>
                              </div>
                            )}
                          </>
                        ) : null}
                      </div>

                      {/* Detalhes expandidos */}
                      {viewingRecord?.id === record.id && (
                        <div className="border-t border-border bg-muted/30 p-4 space-y-4">
                          {/* SOAP Completo */}
                          <div className="space-y-3">
                            <h4 className="font-semibold text-sm">Método SOAP</h4>
                            
                            {record.soap_subjective && (
                              <div className="bg-background rounded-md p-3">
                                <p className="text-xs font-semibold text-muted-foreground mb-1">
                                  S - Subjetivo
                                </p>
                                <p className="text-sm whitespace-pre-wrap">{record.soap_subjective}</p>
                              </div>
                            )}
                            
                            {record.soap_objective && (
                              <div className="bg-background rounded-md p-3">
                                <p className="text-xs font-semibold text-muted-foreground mb-1">
                                  O - Objetivo
                                </p>
                                <p className="text-sm whitespace-pre-wrap">{record.soap_objective}</p>
                              </div>
                            )}
                            
                            {record.soap_assessment && (
                              <div className="bg-background rounded-md p-3">
                                <p className="text-xs font-semibold text-muted-foreground mb-1">
                                  A - Avaliação
                                </p>
                                <p className="text-sm whitespace-pre-wrap">{record.soap_assessment}</p>
                              </div>
                            )}
                            
                            {record.soap_plan && (
                              <div className="bg-background rounded-md p-3">
                                <p className="text-xs font-semibold text-muted-foreground mb-1">
                                  P - Plano
                                </p>
                                <p className="text-sm whitespace-pre-wrap">{record.soap_plan}</p>
                              </div>
                            )}
                          </div>

                          {/* Sinais Vitais */}
                          {record.vital_signs && Object.keys(record.vital_signs).length > 0 && (
                            <div className="space-y-2">
                              <h4 className="font-semibold text-sm">Sinais Vitais</h4>
                              <div className="bg-background rounded-md p-3 grid grid-cols-2 md:grid-cols-3 gap-3">
                                {record.vital_signs.blood_pressure_systolic && record.vital_signs.blood_pressure_diastolic && (
                                  <div>
                                    <p className="text-xs text-muted-foreground">Pressão Arterial</p>
                                    <p className="text-sm font-medium">
                                      {record.vital_signs.blood_pressure_systolic}/{record.vital_signs.blood_pressure_diastolic} mmHg
                                    </p>
                                  </div>
                                )}
                                {record.vital_signs.heart_rate && (
                                  <div>
                                    <p className="text-xs text-muted-foreground">Freq. Cardíaca</p>
                                    <p className="text-sm font-medium">{record.vital_signs.heart_rate} bpm</p>
                                  </div>
                                )}
                                {record.vital_signs.temperature && (
                                  <div>
                                    <p className="text-xs text-muted-foreground">Temperatura</p>
                                    <p className="text-sm font-medium">{record.vital_signs.temperature}°C</p>
                                  </div>
                                )}
                                {record.vital_signs.oxygen_saturation && (
                                  <div>
                                    <p className="text-xs text-muted-foreground">Saturação O₂</p>
                                    <p className="text-sm font-medium">{record.vital_signs.oxygen_saturation}%</p>
                                  </div>
                                )}
                                {record.vital_signs.weight && (
                                  <div>
                                    <p className="text-xs text-muted-foreground">Peso</p>
                                    <p className="text-sm font-medium">{record.vital_signs.weight} kg</p>
                                  </div>
                                )}
                                {record.vital_signs.height && (
                                  <div>
                                    <p className="text-xs text-muted-foreground">Altura</p>
                                    <p className="text-sm font-medium">{record.vital_signs.height} cm</p>
                                  </div>
                                )}
                                {record.vital_signs.bmi && (
                                  <div>
                                    <p className="text-xs text-muted-foreground">IMC</p>
                                    <p className="text-sm font-medium">{record.vital_signs.bmi}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Observações */}
                          {record.observations && (
                            <div className="space-y-2">
                              <h4 className="font-semibold text-sm">Observações</h4>
                              <div className="bg-background rounded-md p-3">
                                <p className="text-sm whitespace-pre-wrap">{record.observations}</p>
                              </div>
                            </div>
                          )}

                          {/* Notas Clínicas */}
                          {record.clinical_notes && (
                            <div className="space-y-2">
                              <h4 className="font-semibold text-sm">Notas Clínicas</h4>
                              <div className="bg-background rounded-md p-3">
                                <p className="text-sm whitespace-pre-wrap">{record.clinical_notes}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saveMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {saveMutation.isPending ? "Salvando..." : "Salvar Prontuário"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
