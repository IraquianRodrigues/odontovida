"use client";

import { logger } from "@/lib/logger";
import { useState } from "react";
import { usePrescriptionsByRecordId, useCreatePrescription, useDeletePrescription } from "@/services/prescriptions/use-prescriptions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Pill, FileText, Printer, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PrescriptionPDFService } from "@/services/prescription-pdf";
import { createClient } from "@/lib/supabase/client";
import { getErrorMessage } from "@/lib/get-error-message";

interface PrescriptionFormProps {
  recordId: string | null;
}

export function PrescriptionForm({ recordId }: PrescriptionFormProps) {
  const { toast } = useToast();
  const { data: prescriptions = [] } = usePrescriptionsByRecordId(recordId);
  const createMutation = useCreatePrescription();
  const deleteMutation = useDeletePrescription();

  const [showForm, setShowForm] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [formData, setFormData] = useState({
    medication: "",
    dosage: "",
    route: "",
    frequency: "",
    duration: "",
    quantity: "",
    notes: "",
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
        title: "Prescrição adicionada",
        description: "A prescrição foi salva com sucesso.",
      });

      setFormData({
        medication: "",
        dosage: "",
        route: "",
        frequency: "",
        duration: "",
        quantity: "",
        notes: "",
      });
      setShowForm(false);
    } catch (error: unknown) {
      toast({
        title: "Erro ao salvar prescrição",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!recordId) return;

    try {
      await deleteMutation.mutateAsync({ id, recordId });
      toast({
        title: "Prescrição removida",
        description: "A prescrição foi removida com sucesso.",
      });
    } catch (error: unknown) {
      toast({
        title: "Erro ao remover prescrição",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const handleGeneratePDF = async (action: "download" | "print") => {
    if (!recordId || prescriptions.length === 0) {
      toast({
        title: "Nenhuma prescrição",
        description: "Adicione pelo menos uma prescrição antes de gerar o PDF.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingPDF(true);


    try {
      // Get current user
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Usuário não autenticado");


      // Get medical record first

      const { data: medicalRecord, error: recordError } = await supabase
        .from("medical_records")
        .select("*")
        .eq("id", recordId)
        .single();

      if (recordError || !medicalRecord) {
        logger.error("❌ Erro ao buscar medical record:", recordError);
        throw new Error("Prontuário médico não encontrado");
      }



      // Get client data
      const { data: client, error: clientError } = await supabase
        .from("clientes")
        .select("nome, data_nascimento")
        .eq("id", medicalRecord.client_id)
        .single();

      if (clientError || !client) {
        logger.error("❌ Erro ao buscar cliente:", clientError);
        throw new Error("Dados do paciente não encontrados");
      }



      // Get professional data
      let professional = null;
      
      if (medicalRecord.professional_id) {
        const { data: prof, error: professionalError } = await supabase
          .from("professionals")
          .select("name, registration_number, specialty")
          .eq("id", medicalRecord.professional_id)
          .single();

        if (!professionalError && prof) {
          professional = prof;
        } else {
          logger.warn("⚠️ Profissional não encontrado por ID, tentando pelo email...");
        }
      }

      // Fallback: get professional by email
      if (!professional) {

        
        const { data: prof, error: professionalError } = await supabase
          .from("professionals")
          .select("name, registration_number, specialty")
          .eq("email", user.email)
          .single();

        if (!professionalError && prof) {
          professional = prof;
        } else {
          logger.warn("⚠️ Profissional não encontrado por email, usando dados do usuário...");
          
          // Last resort: get from user profile
          const { data: userProfile } = await supabase
            .from("usuarios")
            .select("nome")
            .eq("email", user.email)
            .single();

          professional = {
            name: userProfile?.nome || user.email?.split("@")[0] || "Profissional",
            registration_number: "CRM/CRO: Não informado",
            specialty: null,
          };

        }
      }

      // Calculate patient age
      const birthdate = client.data_nascimento;
      const age = birthdate
        ? new Date().getFullYear() - new Date(birthdate).getFullYear()
        : undefined;



      // Generate PDF
      const pdfBlob = await PrescriptionPDFService.generatePrescriptionPDF(
        prescriptions.map((p) => ({
          id: p.id,
          medication: p.medication,
          dosage: p.dosage,
          route: p.route,
          frequency: p.frequency,
          duration: p.duration,
          quantity: p.quantity || undefined,
          instructions: p.notes || undefined,
        })),
        {
          name: professional.name,
          registration_number: professional.registration_number,
          specialty: professional.specialty || undefined,
        },
        {
          name: client.nome,
          birthdate: birthdate || undefined,
          age,
        }
      );



      // Download or print
      if (action === "download") {

        PrescriptionPDFService.downloadPDF(pdfBlob, client.nome);
        toast({
          title: "PDF gerado",
          description: "A receita foi baixada com sucesso.",
        });
      } else {

        PrescriptionPDFService.printPDF(pdfBlob);
        toast({
          title: "Imprimindo",
          description: "A receita está sendo impressa.",
        });
      }
    } catch (error: unknown) {
      logger.error("❌ Erro ao gerar PDF:", error);
      toast({
        title: "Erro ao gerar PDF",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Existing Prescriptions */}
      {prescriptions.length > 0 && (
        <div className="space-y-2">
          {prescriptions.map((prescription, index) => (
            <Card key={prescription.id} className="p-4 border-2 border-border/50">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-sm bg-primary/10">
                  <Pill className="h-5 w-5 text-primary" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-xs font-semibold text-muted-foreground">
                        Medicamento {index + 1}
                      </span>
                      <p className="font-semibold text-lg">{prescription.medication}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(prescription.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Dose:</span>{" "}
                      <span className="font-medium">{prescription.dosage}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Via:</span>{" "}
                      <span className="font-medium">{prescription.route}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Frequência:</span>{" "}
                      <span className="font-medium">{prescription.frequency}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duração:</span>{" "}
                      <span className="font-medium">{prescription.duration}</span>
                    </div>
                    {prescription.quantity && (
                      <div>
                        <span className="text-muted-foreground">Quantidade:</span>{" "}
                        <span className="font-medium">{prescription.quantity}</span>
                      </div>
                    )}
                  </div>

                  {prescription.notes && (
                    <p className="text-sm text-muted-foreground mt-2 italic">
                      {prescription.notes}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* PDF Generation Buttons */}
      {prescriptions.length > 0 && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleGeneratePDF("download")}
            disabled={isGeneratingPDF}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            {isGeneratingPDF ? "Gerando..." : "Baixar Receita (PDF)"}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleGeneratePDF("print")}
            disabled={isGeneratingPDF}
            className="flex-1"
          >
            <Printer className="h-4 w-4 mr-2" />
            {isGeneratingPDF ? "Gerando..." : "Imprimir Receita"}
          </Button>
        </div>
      )}

      {/* Add Prescription Button */}
      {!showForm && (
        <Button
          variant="outline"
          onClick={() => setShowForm(true)}
          className="w-full"
          disabled={!recordId}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Medicamento
        </Button>
      )}

      {/* Add Prescription Form */}
      {showForm && (
        <Card className="p-4 border-2 border-primary/20">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">Nova Prescrição</h4>
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
              <Label htmlFor="medication" className="mb-2 block">Medicamento *</Label>
              <Input
                id="medication"
                value={formData.medication}
                onChange={(e) =>
                  setFormData({ ...formData, medication: e.target.value })
                }
                placeholder="Ex: Paracetamol"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dosage" className="mb-2 block">Dose *</Label>
                <Input
                  id="dosage"
                  value={formData.dosage}
                  onChange={(e) =>
                    setFormData({ ...formData, dosage: e.target.value })
                  }
                  placeholder="Ex: 500mg"
                  required
                />
              </div>

              <div>
                <Label htmlFor="route" className="mb-2 block">Via de Administração *</Label>
                <Input
                  id="route"
                  value={formData.route}
                  onChange={(e) =>
                    setFormData({ ...formData, route: e.target.value })
                  }
                  placeholder="Ex: Oral, IV, Tópica"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="frequency" className="mb-2 block">Frequência *</Label>
                <Input
                  id="frequency"
                  value={formData.frequency}
                  onChange={(e) =>
                    setFormData({ ...formData, frequency: e.target.value })
                  }
                  placeholder="Ex: 8/8h, 2x ao dia"
                  required
                />
              </div>

              <div>
                <Label htmlFor="duration" className="mb-2 block">Duração *</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  placeholder="Ex: 7 dias, 14 dias"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="quantity" className="mb-2 block">Quantidade</Label>
              <Input
                id="quantity"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                placeholder="Ex: 1 caixa, 30 comprimidos"
              />
            </div>

            <div>
              <Label htmlFor="notes" className="mb-2 block">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Instruções especiais, cuidados, etc..."
                rows={2}
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
                {createMutation.isPending ? "Salvando..." : "Salvar Prescrição"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Empty State */}
      {prescriptions.length === 0 && !showForm && (
        <div className="text-center py-8 text-muted-foreground">
          <Pill className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Nenhuma prescrição registrada</p>
        </div>
      )}
    </div>
  );
}
