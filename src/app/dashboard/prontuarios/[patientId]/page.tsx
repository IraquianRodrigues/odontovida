"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MedicalRecordsService } from "@/services/medical-records.service";
import { useUserRole } from "@/hooks/use-user-role";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { VitalSignsForm } from "@/components/vital-signs-form";
import { 
  ArrowLeft, 
  Save, 
  User, 
  FileText, 
  Activity, 
  History,
  Calendar,
  Phone,
  Mail,
  Cake
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function MedicalRecordPage() {
  const params = useParams();
  const router = useRouter();
  const { profile } = useUserRole();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const patientId = Number(params.patientId);
  
  const [activeSection, setActiveSection] = useState("patient");
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
  });

  // Buscar histórico de prontuários
  const { data: historyData } = useQuery({
    queryKey: ["medical-records-history", patientId],
    queryFn: () => MedicalRecordsService.getMedicalRecords(patientId),
  });

  // Mutation para salvar prontuário
  const saveMutation = useMutation({
    mutationFn: async () => {
      const supabase = (await import("@/lib/supabase/client")).createClient();
      const { data: professional } = await supabase
        .from("professionals")
        .select("id")
        .eq("email", profile?.email)
        .single();

      if (!professional) throw new Error("Profissional não encontrado");

      return MedicalRecordsService.createMedicalRecord({
        client_id: patientId,
        professional_id: professional.id,
        ...formData,
      });
    },
    onSuccess: () => {
      toast({
        title: "Prontuário salvo",
        description: "O prontuário foi salvo com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["medical-records-history", patientId] });
      // Limpar formulário
      setFormData({
        soap_subjective: "",
        soap_objective: "",
        soap_assessment: "",
        soap_plan: "",
        clinical_notes: "",
        observations: "",
        vital_signs: {},
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar o prontuário.",
        variant: "destructive",
      });
    },
  });

  const history = historyData?.data || [];

  const sections = [
    { id: "patient", label: "Paciente", icon: User },
    { id: "soap", label: "SOAP", icon: FileText },
    { id: "vitals", label: "Sinais Vitais", icon: Activity },
    { id: "history", label: "Histórico", icon: History },
  ];

  return (
    <div className="min-h-screen bg-muted/40 flex flex-col">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard/prontuarios")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div className="h-6 w-px bg-border" />
              <div>
                <h1 className="text-xl font-bold">{clientData?.nome || "Carregando..."}</h1>
                <p className="text-sm text-muted-foreground">Prontuário Médico</p>
              </div>
            </div>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {saveMutation.isPending ? "Salvando..." : "Salvar Prontuário"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6 h-full">
          {/* Left Sidebar Navigation */}
          <div className="col-span-3">
            <div className="sticky top-24 space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all",
                      activeSection === section.id
                        ? "bg-foreground text-background font-semibold"
                        : "hover:bg-accent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{section.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Content Area */}
          <div className="col-span-9">
            <div className="bg-card rounded-xl border border-border p-8 min-h-[600px]">
              {/* Paciente */}
              {activeSection === "patient" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Informações do Paciente</h2>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-5 rounded-lg border bg-muted/30">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <Label className="text-xs font-semibold text-muted-foreground uppercase">Nome Completo</Label>
                      </div>
                      <p className="font-semibold text-lg">{clientData?.nome || "-"}</p>
                    </div>
                    <div className="p-5 rounded-lg border bg-muted/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <Label className="text-xs font-semibold text-muted-foreground uppercase">Telefone</Label>
                      </div>
                      <p className="font-semibold text-lg">{clientData?.telefone || "-"}</p>
                    </div>
                    {clientData?.email && (
                      <div className="p-5 rounded-lg border bg-muted/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <Label className="text-xs font-semibold text-muted-foreground uppercase">Email</Label>
                        </div>
                        <p className="font-semibold text-lg">{clientData.email}</p>
                      </div>
                    )}
                    {clientData?.data_nascimento && (
                      <div className="p-5 rounded-lg border bg-muted/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Cake className="h-4 w-4 text-muted-foreground" />
                          <Label className="text-xs font-semibold text-muted-foreground uppercase">Data de Nascimento</Label>
                        </div>
                        <p className="font-semibold text-lg">
                          {format(new Date(clientData.data_nascimento), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                      </div>
                    )}
                  </div>
                  {clientData?.notes && (
                    <div className="p-5 rounded-lg border bg-muted/30">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase mb-3 block">Observações Gerais</Label>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{clientData.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* SOAP */}
              {activeSection === "soap" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Método SOAP</h2>
                  <div className="space-y-5">
                    {/* Subjetivo */}
                    <div className="p-6 rounded-xl border bg-muted/30">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-foreground/10">
                          <span className="text-lg font-bold">S</span>
                        </div>
                        <div>
                          <Label className="text-lg font-bold">Subjetivo</Label>
                          <p className="text-xs text-muted-foreground">Queixa principal, sintomas, história</p>
                        </div>
                      </div>
                      <Textarea
                        placeholder="Descreva a queixa principal do paciente..."
                        value={formData.soap_subjective}
                        onChange={(e) => setFormData({ ...formData, soap_subjective: e.target.value })}
                        rows={5}
                        className="resize-none"
                      />
                    </div>

                    {/* Objetivo */}
                    <div className="p-6 rounded-xl border bg-muted/30">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-foreground/10">
                          <span className="text-lg font-bold">O</span>
                        </div>
                        <div>
                          <Label className="text-lg font-bold">Objetivo</Label>
                          <p className="text-xs text-muted-foreground">Exame físico, resultados, achados</p>
                        </div>
                      </div>
                      <Textarea
                        placeholder="Descreva os achados do exame físico..."
                        value={formData.soap_objective}
                        onChange={(e) => setFormData({ ...formData, soap_objective: e.target.value })}
                        rows={5}
                        className="resize-none"
                      />
                    </div>

                    {/* Avaliação */}
                    <div className="p-6 rounded-xl border bg-muted/30">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-foreground/10">
                          <span className="text-lg font-bold">A</span>
                        </div>
                        <div>
                          <Label className="text-lg font-bold">Avaliação</Label>
                          <p className="text-xs text-muted-foreground">Hipótese diagnóstica, raciocínio clínico</p>
                        </div>
                      </div>
                      <Textarea
                        placeholder="Descreva a hipótese diagnóstica..."
                        value={formData.soap_assessment}
                        onChange={(e) => setFormData({ ...formData, soap_assessment: e.target.value })}
                        rows={5}
                        className="resize-none"
                      />
                    </div>

                    {/* Plano */}
                    <div className="p-6 rounded-xl border bg-muted/30">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-foreground/10">
                          <span className="text-lg font-bold">P</span>
                        </div>
                        <div>
                          <Label className="text-lg font-bold">Plano</Label>
                          <p className="text-xs text-muted-foreground">Condutas, medicações, orientações</p>
                        </div>
                      </div>
                      <Textarea
                        placeholder="Descreva o plano de tratamento..."
                        value={formData.soap_plan}
                        onChange={(e) => setFormData({ ...formData, soap_plan: e.target.value })}
                        rows={5}
                        className="resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Sinais Vitais */}
              {activeSection === "vitals" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Sinais Vitais</h2>
                  <VitalSignsForm
                    value={formData.vital_signs}
                    onChange={(vital_signs) => setFormData({ ...formData, vital_signs })}
                  />
                </div>
              )}

              {/* Histórico */}
              {activeSection === "history" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Histórico de Atendimentos</h2>
                  {history.length === 0 ? (
                    <div className="text-center py-12">
                      <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-semibold">Nenhum prontuário anterior</p>
                      <p className="text-sm text-muted-foreground mt-1">Este é o primeiro atendimento do paciente</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {history.map((record) => (
                        <div key={record.id} className="p-6 rounded-xl border bg-muted/30">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="font-bold text-lg">
                                {format(new Date(record.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Dr(a). {record.professional?.name || "Não informado"}
                              </p>
                            </div>
                          </div>
                          {record.soap_subjective && (
                            <div className="mb-3">
                              <p className="text-xs font-semibold text-muted-foreground mb-1">Subjetivo:</p>
                              <p className="text-sm">{record.soap_subjective}</p>
                            </div>
                          )}
                          {record.soap_assessment && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground mb-1">Avaliação:</p>
                              <p className="text-sm">{record.soap_assessment}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
