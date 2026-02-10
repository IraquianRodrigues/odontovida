"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MedicalRecordsService } from "@/services/medical-records";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, FileText, Activity, History,
  Save, Loader2, AlertTriangle, ClipboardList, Stethoscope, Pill
} from "lucide-react";
import { VitalSignsForm } from "@/components/vital-signs-form";
import { CriticalAlertsPanel } from "@/components/critical-alerts-panel";
import { AnamnesisForm } from "@/components/anamnesis-form";
import { DiagnosisForm } from "@/components/diagnosis-form";
import { PrescriptionForm } from "@/components/prescription-form";
import { toast } from "sonner";

import { RecordLoadingSkeleton } from "./patient-record/record-loading-skeleton";
import { RecordErrorState, RecordEmptyState } from "./patient-record/record-error-states";
import { PatientSidebar } from "./patient-record/patient-sidebar";
import { SoapForm } from "./patient-record/soap-form";
import { RecordHistoryList } from "./patient-record/record-history-list";

interface PatientRecordViewProps {
  patientId: number;
  onBack: () => void;
}

export function PatientRecordView({ patientId, onBack }: PatientRecordViewProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("alerts");
  const [currentRecordId, setCurrentRecordId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    soap_subjective: "",
    soap_objective: "",
    soap_assessment: "",
    soap_plan: "",
    vital_signs: {} as any,
  });

  const { data: clientData, isLoading: isLoadingClient, isError: isErrorClient, error: clientError } = useQuery({
    queryKey: ["client", patientId],
    queryFn: async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data, error } = await supabase.from("clientes").select("*").eq("id", patientId).single();
      if (error) {
        if (error.code === "PGRST116") throw new Error(`Paciente com ID ${patientId} não encontrado`);
        if (error.code === "42501") throw new Error("Sem permissão para acessar dados do paciente. Verifique as políticas RLS no Supabase.");
        throw new Error(error.message || "Erro desconhecido ao buscar paciente");
      }
      if (!data) throw new Error(`Nenhum dado retornado para o paciente ID ${patientId}`);
      return data;
    },
    enabled: !!patientId,
    retry: 1,
  });

  const { data: summaryData } = useQuery({
    queryKey: ["patient-summary", patientId],
    queryFn: () => MedicalRecordsService.getPatientSummary(patientId),
  });

  const { data: historyData } = useQuery({
    queryKey: ["medical-records", patientId],
    queryFn: () => MedicalRecordsService.getMedicalRecords(patientId),
  });

  const history = historyData?.data || [];
  const summary = summaryData?.data;

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { createClient: createSupabaseClient } = await import("@/lib/supabase/client");
      const supabase = createSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      const { data: professional } = await supabase.from("professionals").select("id").eq("email", user.email).single();
      if (!professional) throw new Error("Professional not found");
      return MedicalRecordsService.createMedicalRecord({ client_id: patientId, professional_id: professional.id, ...formData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-records", patientId] });
      queryClient.invalidateQueries({ queryKey: ["patient-summary", patientId] });
      toast.success("Prontuário salvo com sucesso!");
      setFormData({ soap_subjective: "", soap_objective: "", soap_assessment: "", soap_plan: "", vital_signs: {} });
    },
    onError: () => { toast.error("Erro ao salvar prontuário"); },
  });

  useEffect(() => {
    const createInitialRecord = async () => {
      if (currentRecordId || !patientId) return;
      try {
        const { createClient: createSupabaseClient } = await import("@/lib/supabase/client");
        const supabase = createSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: professional } = await supabase.from("professionals").select("id").eq("email", user.email).single();
        if (!professional) return;
        const result = await MedicalRecordsService.createMedicalRecord({
          client_id: patientId, professional_id: professional.id,
          soap_subjective: "", soap_objective: "", soap_assessment: "", soap_plan: "", vital_signs: {},
        });
        if (result.success && result.data) setCurrentRecordId(result.data.id);
      } catch (error) {
        console.error("Error creating initial record:", error);
      }
    };
    createInitialRecord();
  }, [patientId, currentRecordId]);

  const handleSoapFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoadingClient) return <RecordLoadingSkeleton onBack={onBack} />;
  if (isErrorClient) return <RecordErrorState error={clientError as Error} onBack={onBack} />;
  if (!clientData) return <RecordEmptyState onBack={onBack} />;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col animate-in fade-in slide-in-from-right-5 duration-300">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-border/50 bg-card shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={onBack} variant="ghost" size="sm" className="rounded-sm hover:bg-muted/50 transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div className="h-6 w-px bg-border/50" />
              <div>
                <h1 className="text-xl font-bold tracking-tight text-foreground">Prontuário Médico</h1>
                <p className="text-sm text-muted-foreground font-medium">{clientData.nome}</p>
              </div>
            </div>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="rounded-sm shadow-sm hover:shadow-md transition-all">
              {saveMutation.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Salvando...</>
              ) : (
                <><Save className="h-4 w-4 mr-2" />Salvar Prontuário</>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Split Layout */}
      <div className="flex flex-1 min-h-0">
        <PatientSidebar clientData={clientData} summary={summary} />

        <main className="flex-1 flex flex-col bg-muted/40 min-h-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
            <div className="flex-shrink-0 border-b border-border/50 bg-card px-6">
              <TabsList className="h-14 bg-transparent rounded-none border-0 flex-wrap">
                {[
                  { value: "alerts", icon: AlertTriangle, label: "Alertas" },
                  { value: "anamnesis", icon: ClipboardList, label: "Anamnese" },
                  { value: "soap", icon: FileText, label: "SOAP" },
                  { value: "vitals", icon: Activity, label: "Sinais" },
                  { value: "diagnosis", icon: Stethoscope, label: "Diagnóstico" },
                  { value: "prescription", icon: Pill, label: "Prescrição" },
                  { value: "history", icon: History, label: "Histórico" },
                ].map(({ value, icon: Icon, label }) => (
                  <TabsTrigger key={value} value={value} className="flex items-center gap-2 rounded-sm data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
                    <Icon className="h-4 w-4" />
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto p-6 min-h-0">
              <TabsContent value="alerts" className="m-0">
                <CriticalAlertsPanel clientId={patientId} />
              </TabsContent>
              <TabsContent value="anamnesis" className="m-0">
                <AnamnesisForm recordId={currentRecordId} />
              </TabsContent>
              <TabsContent value="soap" className="space-y-6 m-0">
                <SoapForm formData={formData} onFieldChange={handleSoapFieldChange} />
              </TabsContent>
              <TabsContent value="vitals" className="m-0">
                <VitalSignsForm value={formData.vital_signs} onChange={(vitals: any) => setFormData(prev => ({ ...prev, vital_signs: vitals }))} />
              </TabsContent>
              <TabsContent value="diagnosis" className="m-0">
                <DiagnosisForm recordId={currentRecordId} />
              </TabsContent>
              <TabsContent value="prescription" className="m-0">
                <PrescriptionForm recordId={currentRecordId} />
              </TabsContent>
              <TabsContent value="history" className="space-y-4 m-0">
                <RecordHistoryList history={history} />
              </TabsContent>
            </div>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
