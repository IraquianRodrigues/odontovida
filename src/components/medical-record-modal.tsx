"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MedicalRecordsService, type MedicalRecord } from "@/services/medical-records";
import { useUserRole } from "@/hooks/use-user-role";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { VitalSignsForm } from "@/components/vital-signs-form";
import { CriticalAlertsPanel } from "@/components/critical-alerts-panel";
import { AnamnesisForm } from "@/components/anamnesis-form";
import { DiagnosisForm } from "@/components/diagnosis-form";
import { PrescriptionForm } from "@/components/prescription-form";
import { SoapForm } from "@/components/patient-record/soap-form";
import { RecordHistoryExpandable } from "@/components/patient-record/record-history-expandable";
import { User, FileText, Activity, History, Save, X, AlertTriangle, ClipboardList, Stethoscope, Pill } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MedicalRecordModalProps {
  patientId: number;
  isOpen: boolean;
  onClose: () => void;
  recordId?: string;
}

const TABS = [
  { value: "alerts", icon: AlertTriangle, label: "Alertas" },
  { value: "patient", icon: User, label: "Paciente" },
  { value: "anamnesis", icon: ClipboardList, label: "Anamnese" },
  { value: "soap", icon: FileText, label: "SOAP" },
  { value: "vitals", icon: Activity, label: "Sinais" },
  { value: "diagnosis", icon: Stethoscope, label: "Diagnóstico" },
  { value: "prescription", icon: Pill, label: "Prescrição" },
  { value: "history", icon: History, label: "Histórico" },
];

export function MedicalRecordModal({ patientId, isOpen, onClose, recordId }: MedicalRecordModalProps) {
  const { profile } = useUserRole();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("alerts");
  const [currentRecordId, setCurrentRecordId] = useState<string | null>(recordId || null);

  const [formData, setFormData] = useState({
    soap_subjective: "",
    soap_objective: "",
    soap_assessment: "",
    soap_plan: "",
    clinical_notes: "",
    observations: "",
    vital_signs: {},
  });

  const { data: clientData } = useQuery({
    queryKey: ["client", patientId],
    queryFn: async () => {
      const supabase = (await import("@/lib/supabase/client")).createClient();
      const { data } = await supabase.from("clientes").select("*").eq("id", patientId).single();
      return data;
    },
    enabled: isOpen,
  });

  const { data: historyData } = useQuery({
    queryKey: ["medical-records-history", patientId],
    queryFn: () => MedicalRecordsService.getMedicalRecords(patientId),
    enabled: isOpen,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const supabase = (await import("@/lib/supabase/client")).createClient();
      const { data: professional } = await supabase.from("professionals").select("id").eq("email", profile?.email).single();
      if (!professional) throw new Error("Profissional não encontrado");
      if (recordId) {
        return MedicalRecordsService.updateMedicalRecord(recordId, formData);
      }
      return MedicalRecordsService.createMedicalRecord({ client_id: patientId, professional_id: professional.id, ...formData });
    },
    onSuccess: () => {
      toast({ title: "Prontuário salvo", description: "O prontuário foi salvo com sucesso." });
      queryClient.invalidateQueries({ queryKey: ["medical-records-history", patientId] });
      queryClient.invalidateQueries({ queryKey: ["professional-patients"] });
      onClose();
    },
    onError: (error: any) => {
      toast({ title: "Erro ao salvar", description: error.message || "Não foi possível salvar o prontuário.", variant: "destructive" });
    },
  });

  const handleSoapFieldChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleVitalSignsChange = useCallback((vital_signs: any) => {
    setFormData(prev => ({ ...prev, vital_signs }));
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
          <TabsList className="grid w-full grid-cols-8">
            {TABS.map(({ value, icon: Icon, label }) => (
              <TabsTrigger key={value} value={value} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-1 overflow-auto mt-4">
            <TabsContent value="alerts" className="m-0">
              <CriticalAlertsPanel clientId={patientId} />
            </TabsContent>

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
                  <p className="mt-1 text-sm bg-muted p-3 rounded-md">{clientData.notes}</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="anamnesis" className="m-0">
              <AnamnesisForm recordId={currentRecordId} />
            </TabsContent>

            <TabsContent value="soap" className="space-y-4 m-0">
              <SoapForm formData={formData} onFieldChange={handleSoapFieldChange} />
            </TabsContent>

            <TabsContent value="vitals" className="m-0">
              <VitalSignsForm value={formData.vital_signs} onChange={handleVitalSignsChange} />
            </TabsContent>

            <TabsContent value="diagnosis" className="m-0">
              <DiagnosisForm recordId={currentRecordId} />
            </TabsContent>

            <TabsContent value="prescription" className="m-0">
              <PrescriptionForm recordId={currentRecordId} />
            </TabsContent>

            <TabsContent value="history" className="space-y-4 m-0">
              <RecordHistoryExpandable history={history} />
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex items-center justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {saveMutation.isPending ? "Salvando..." : "Salvar Prontuário"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
