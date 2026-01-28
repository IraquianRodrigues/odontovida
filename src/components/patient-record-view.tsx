"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MedicalRecordsService } from "@/services/medical-records.service";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, 
  FileText, 
  Activity, 
  History, 
  Calendar,
  User,
  Save,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { VitalSignsForm } from "@/components/vital-signs-form";
import { toast } from "sonner";

interface PatientRecordViewProps {
  patientId: number;
  onBack: () => void;
}

export function PatientRecordView({ patientId, onBack }: PatientRecordViewProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("soap");
  const [formData, setFormData] = useState({
    soap_subjective: "",
    soap_objective: "",
    soap_assessment: "",
    soap_plan: "",
    vital_signs: {} as any,
  });

  // Fetch patient data
  const { data: clientData } = useQuery({
    queryKey: ["client", patientId],
    queryFn: async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data } = await supabase
        .from("clients")
        .select("*")
        .eq("id", patientId)
        .single();
      return data;
    },
  });

  // Fetch patient summary
  const { data: summaryData } = useQuery({
    queryKey: ["patient-summary", patientId],
    queryFn: () => MedicalRecordsService.getPatientSummary(patientId),
  });

  // Fetch history
  const { data: historyData } = useQuery({
    queryKey: ["medical-records", patientId],
    queryFn: () => MedicalRecordsService.getMedicalRecords(patientId),
  });

  const history = historyData?.data || [];
  const summary = summaryData?.data;

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      // Get professional_id from current user
      const { createClient: createSupabaseClient } = await import("@/lib/supabase/client");
      const supabase = createSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("User not authenticated");
      
      const { data: professional } = await supabase
        .from("professionals")
        .select("id")
        .eq("email", user.email)
        .single();
      
      if (!professional) throw new Error("Professional not found");

      return MedicalRecordsService.createMedicalRecord({
        client_id: patientId,
        professional_id: professional.id,
        ...formData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-records", patientId] });
      queryClient.invalidateQueries({ queryKey: ["patient-summary", patientId] });
      toast.success("Prontuário salvo com sucesso!");
      setFormData({
        soap_subjective: "",
        soap_objective: "",
        soap_assessment: "",
        soap_plan: "",
        vital_signs: {},
      });
    },
    onError: () => {
      toast.error("Erro ao salvar prontuário");
    },
  });

  const handleVitalSignsChange = (vitals: any) => {
    setFormData({ ...formData, vital_signs: vitals });
  };

  const handleSave = () => {
    saveMutation.mutate();
  };

  return (
    <div className="fixed inset-0 bg-background z-50 animate-in fade-in slide-in-from-right-5 duration-300">
      {/* Premium Header */}
      <header className="border-b border-border/50 bg-card shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={onBack}
                variant="ghost"
                size="sm"
                className="rounded-sm hover:bg-muted/50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div className="h-6 w-px bg-border/50" />
              <div>
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                  Prontuário Médico
                </h1>
                <p className="text-sm text-muted-foreground">
                  {clientData?.nome || "Carregando..."}
                </p>
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="rounded-sm"
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Prontuário
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Split Layout */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar - Patient Info */}
        <aside className="w-80 border-r border-border/50 bg-card overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Patient Name Header */}
            <div className="text-center pb-6 border-b border-border/50">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="h-1 w-12 bg-primary rounded-full" />
                <User className="h-5 w-5 text-primary" />
                <div className="h-1 w-12 bg-primary rounded-full" />
              </div>
              <h2 className="text-2xl font-bold text-foreground tracking-tight">
                {clientData?.nome}
              </h2>
              <p className="text-sm text-muted-foreground mt-2 font-medium">
                {clientData?.telefone}
              </p>
              {clientData?.email && (
                <p className="text-xs text-muted-foreground mt-1">
                  {clientData.email}
                </p>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted/30 rounded-sm border border-border/50">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 bg-primary/10 rounded-sm">
                    <Calendar className="h-3 w-3 text-primary" />
                  </div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Consultas
                  </p>
                </div>
                <p className="text-2xl font-bold tabular-nums text-foreground">
                  {summary?.total_appointments || 0}
                </p>
              </div>
              <div className="p-3 bg-muted/30 rounded-sm border border-border/50">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 bg-primary/10 rounded-sm">
                    <FileText className="h-3 w-3 text-primary" />
                  </div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Prontuários
                  </p>
                </div>
                <p className="text-2xl font-bold tabular-nums text-foreground">
                  {summary?.total_records || 0}
                </p>
              </div>
            </div>

            {/* Last Appointment */}
            {summary?.last_appointment && (
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Último Atendimento
                </Label>
                <Badge
                  variant="outline"
                  className="w-full justify-center mt-2 py-2 rounded-sm border-border/50 bg-muted/20"
                >
                  <Calendar className="h-3 w-3 mr-2" />
                  <span className="tabular-nums">
                    {format(new Date(summary.last_appointment), "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </span>
                </Badge>
              </div>
            )}

            {/* Notes */}
            {clientData?.notes && (
              <div className="p-4 bg-muted/30 rounded-sm border border-border/50">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Observações Gerais
                </Label>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {clientData.notes}
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content - Tabs */}
        <main className="flex-1 overflow-hidden flex flex-col bg-muted/40">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="border-b border-border/50 bg-card px-6">
              <TabsList className="h-14 bg-transparent rounded-none border-0">
                <TabsTrigger
                  value="soap"
                  className="flex items-center gap-2 rounded-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <FileText className="h-4 w-4" />
                  SOAP
                </TabsTrigger>
                <TabsTrigger
                  value="vitals"
                  className="flex items-center gap-2 rounded-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <Activity className="h-4 w-4" />
                  Sinais Vitais
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="flex items-center gap-2 rounded-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <History className="h-4 w-4" />
                  Histórico
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* SOAP Tab */}
              <TabsContent value="soap" className="space-y-6 m-0">
                <div className="space-y-6">
                  {/* Subjetivo */}
                  <div>
                    <Label
                      htmlFor="subjective"
                      className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2"
                    >
                      <div className="h-1 w-8 bg-primary rounded-full" />
                      S - Subjetivo
                    </Label>
                    <p className="text-xs text-muted-foreground mb-3 pl-10">
                      Queixa principal, sintomas, história da doença atual, antecedentes
                    </p>
                    <Textarea
                      id="subjective"
                      placeholder="Ex: Paciente relata dor de cabeça há 3 dias, localizada na região frontal..."
                      value={formData.soap_subjective}
                      onChange={(e) =>
                        setFormData({ ...formData, soap_subjective: e.target.value })
                      }
                      className="rounded-sm border-border/50 focus:border-primary/50 focus:ring-primary/20 
                                 min-h-[120px] resize-none transition-all duration-300"
                    />
                  </div>

                  {/* Objetivo */}
                  <div>
                    <Label
                      htmlFor="objective"
                      className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2"
                    >
                      <div className="h-1 w-8 bg-primary rounded-full" />
                      O - Objetivo
                    </Label>
                    <p className="text-xs text-muted-foreground mb-3 pl-10">
                      Exame físico, resultados de exames, achados clínicos
                    </p>
                    <Textarea
                      id="objective"
                      placeholder="Ex: Paciente consciente, orientado. PA: 120/80 mmHg. Ausculta pulmonar sem alterações..."
                      value={formData.soap_objective}
                      onChange={(e) =>
                        setFormData({ ...formData, soap_objective: e.target.value })
                      }
                      className="rounded-sm border-border/50 focus:border-primary/50 focus:ring-primary/20 
                                 min-h-[120px] resize-none transition-all duration-300"
                    />
                  </div>

                  {/* Avaliação */}
                  <div>
                    <Label
                      htmlFor="assessment"
                      className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2"
                    >
                      <div className="h-1 w-8 bg-primary rounded-full" />
                      A - Avaliação
                    </Label>
                    <p className="text-xs text-muted-foreground mb-3 pl-10">
                      Hipótese diagnóstica, diagnóstico diferencial, raciocínio clínico
                    </p>
                    <Textarea
                      id="assessment"
                      placeholder="Ex: Hipótese diagnóstica: Cefaleia tensional. Diagnóstico diferencial: Enxaqueca..."
                      value={formData.soap_assessment}
                      onChange={(e) =>
                        setFormData({ ...formData, soap_assessment: e.target.value })
                      }
                      className="rounded-sm border-border/50 focus:border-primary/50 focus:ring-primary/20 
                                 min-h-[120px] resize-none transition-all duration-300"
                    />
                  </div>

                  {/* Plano */}
                  <div>
                    <Label
                      htmlFor="plan"
                      className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2"
                    >
                      <div className="h-1 w-8 bg-primary rounded-full" />
                      P - Plano
                    </Label>
                    <p className="text-xs text-muted-foreground mb-3 pl-10">
                      Condutas, medicações, exames solicitados, orientações, retorno
                    </p>
                    <Textarea
                      id="plan"
                      placeholder="Ex: Prescrever analgésico. Solicitar hemograma completo. Orientar repouso. Retorno em 7 dias..."
                      value={formData.soap_plan}
                      onChange={(e) =>
                        setFormData({ ...formData, soap_plan: e.target.value })
                      }
                      className="rounded-sm border-border/50 focus:border-primary/50 focus:ring-primary/20 
                                 min-h-[120px] resize-none transition-all duration-300"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Vitals Tab */}
              <TabsContent value="vitals" className="m-0">
                <VitalSignsForm
                  value={formData.vital_signs}
                  onChange={handleVitalSignsChange}
                />
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history" className="space-y-4 m-0">
                {history.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="p-4 bg-muted/30 rounded-sm inline-block mb-4">
                      <History className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <p className="text-foreground font-semibold">
                      Nenhum prontuário anterior encontrado
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Este é o primeiro atendimento do paciente
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {history.map((record) => (
                      <div
                        key={record.id}
                        className="border border-border/50 rounded-sm overflow-hidden
                                   shadow-[0_1px_2px_rgba(0,0,0,0.04),0_2px_4px_rgba(0,0,0,0.04)]
                                   bg-card"
                      >
                        <div className="p-4 border-b border-border/50 bg-gradient-to-br from-background to-muted/20">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/5 rounded-sm">
                              <Calendar className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">
                                {format(new Date(record.date), "dd/MM/yyyy 'às' HH:mm", {
                                  locale: ptBR,
                                })}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Dr(a). {record.professional?.name || "Não informado"}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 space-y-3">
                          {record.soap_subjective && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Subjetivo:
                              </p>
                              <p className="text-sm text-foreground mt-1">
                                {record.soap_subjective}
                              </p>
                            </div>
                          )}
                          {record.soap_assessment && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Avaliação:
                              </p>
                              <p className="text-sm text-foreground mt-1">
                                {record.soap_assessment}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
