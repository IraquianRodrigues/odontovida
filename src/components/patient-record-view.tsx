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
  const { data: clientData, isLoading: isLoadingClient, isError: isErrorClient, error: clientError } = useQuery({
    queryKey: ["client", patientId],
    queryFn: async () => {
      console.log("Fetching client with ID:", patientId);
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .eq("id", patientId)
        .single();
      
      console.log("Query result:", { data, error });
      
      if (error) {
        console.error("Error fetching client:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        
        // Check for specific error codes
        if (error.code === "PGRST116") {
          throw new Error(`Paciente com ID ${patientId} não encontrado`);
        }
        
        if (error.code === "42501") {
          throw new Error("Sem permissão para acessar dados do paciente. Verifique as políticas RLS no Supabase.");
        }
        
        throw new Error(error.message || "Erro desconhecido ao buscar paciente");
      }
      
      if (!data) {
        throw new Error(`Nenhum dado retornado para o paciente ID ${patientId}`);
      }
      
      return data;
    },
    enabled: !!patientId,
    retry: 1,
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

  // Show loading skeleton while data is being fetched
  if (isLoadingClient) {
    return (
      <div className="fixed inset-0 bg-background z-50">
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
                <div className="space-y-2">
                  <div className="h-5 w-48 bg-muted/50 rounded animate-pulse" />
                  <div className="h-4 w-32 bg-muted/50 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </header>
        <div className="flex h-[calc(100vh-73px)]">
          <aside className="w-80 border-r border-border/50 bg-card p-6">
            <div className="space-y-6 animate-pulse">
              <div className="text-center pb-6 border-b border-border/50">
                <div className="h-8 w-48 bg-muted/50 rounded mx-auto mb-2" />
                <div className="h-4 w-32 bg-muted/50 rounded mx-auto" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-20 bg-muted/50 rounded-sm" />
                <div className="h-20 bg-muted/50 rounded-sm" />
              </div>
            </div>
          </aside>
          <main className="flex-1 bg-muted/40 p-6">
            <div className="space-y-4 animate-pulse">
              <div className="h-12 bg-muted/50 rounded-sm" />
              <div className="h-32 bg-muted/50 rounded-sm" />
              <div className="h-32 bg-muted/50 rounded-sm" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Show error state if data fetch failed
  if (isErrorClient) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-sm inline-block mb-4">
            <FileText className="h-12 w-12 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Erro ao Carregar Prontuário
          </h2>
          <p className="text-muted-foreground max-w-md">
            Não foi possível carregar os dados do paciente. Por favor, tente novamente.
          </p>
          {clientError && (
            <p className="text-sm text-red-600 dark:text-red-400 font-mono">
              {clientError.message}
            </p>
          )}
          <div className="flex gap-3 justify-center mt-6">
            <Button onClick={onBack} variant="outline" className="rounded-sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <Button onClick={() => window.location.reload()} className="rounded-sm">
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // If no data after loading, show empty state
  if (!clientData) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <div className="p-4 bg-muted/30 rounded-sm inline-block mb-4">
            <User className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Paciente Não Encontrado
          </h2>
          <p className="text-muted-foreground max-w-md">
            Não foi possível encontrar os dados deste paciente.
          </p>
          <Button onClick={onBack} variant="outline" className="rounded-sm mt-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col animate-in fade-in slide-in-from-right-5 duration-300">
      {/* Premium Header */}
      <header className="flex-shrink-0 border-b border-border/50 bg-card shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={onBack}
                variant="ghost"
                size="sm"
                className="rounded-sm hover:bg-muted/50 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div className="h-6 w-px bg-border/50" />
              <div>
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                  Prontuário Médico
                </h1>
                <p className="text-sm text-muted-foreground font-medium">
                  {clientData.nome}
                </p>
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="rounded-sm shadow-sm hover:shadow-md transition-all"
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

      {/* Split Layout - Fixed height with proper scroll */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar - Patient Info */}
        <aside className="w-80 flex-shrink-0 border-r border-border/50 bg-card overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Patient Name Header */}
            <div className="text-center pb-6 border-b border-border/50">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="h-1 w-12 bg-primary rounded-full" />
                <User className="h-5 w-5 text-primary" />
                <div className="h-1 w-12 bg-primary rounded-full" />
              </div>
              <h2 className="text-2xl font-bold text-foreground tracking-tight">
                {clientData.nome}
              </h2>
              <p className="text-sm text-muted-foreground mt-2 font-medium">
                {clientData.telefone}
              </p>
              {clientData.email && (
                <p className="text-xs text-muted-foreground mt-1">
                  {clientData.email}
                </p>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-muted/30 rounded-sm border border-border/50 hover:bg-muted/40 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-primary/10 rounded-sm">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Consultas
                  </p>
                </div>
                <p className="text-2xl font-bold tabular-nums text-foreground">
                  {summary?.total_appointments || 0}
                </p>
              </div>
              <div className="p-4 bg-muted/30 rounded-sm border border-border/50 hover:bg-muted/40 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-primary/10 rounded-sm">
                    <FileText className="h-3.5 w-3.5 text-primary" />
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
        <main className="flex-1 flex flex-col bg-muted/40 min-h-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
            <div className="flex-shrink-0 border-b border-border/50 bg-card px-6">
              <TabsList className="h-14 bg-transparent rounded-none border-0">
                <TabsTrigger
                  value="soap"
                  className="flex items-center gap-2 rounded-sm data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
                >
                  <FileText className="h-4 w-4" />
                  SOAP
                </TabsTrigger>
                <TabsTrigger
                  value="vitals"
                  className="flex items-center gap-2 rounded-sm data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
                >
                  <Activity className="h-4 w-4" />
                  Sinais Vitais
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="flex items-center gap-2 rounded-sm data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
                >
                  <History className="h-4 w-4" />
                  Histórico
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto p-6 min-h-0">
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
                      className="rounded-sm border-border/50 bg-card focus:border-primary/50 focus:ring-primary/20 
                                 focus:shadow-sm min-h-[140px] resize-y transition-all duration-300"
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
                      className="rounded-sm border-border/50 bg-card focus:border-primary/50 focus:ring-primary/20 
                                 focus:shadow-sm min-h-[140px] resize-y transition-all duration-300"
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
                      className="rounded-sm border-border/50 bg-card focus:border-primary/50 focus:ring-primary/20 
                                 focus:shadow-sm min-h-[140px] resize-y transition-all duration-300"
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
                      className="rounded-sm border-border/50 bg-card focus:border-primary/50 focus:ring-primary/20 
                                 focus:shadow-sm min-h-[140px] resize-y transition-all duration-300"
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
