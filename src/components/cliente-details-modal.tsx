"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ClienteRow } from "@/types/database.types";
import { toast } from "sonner";
import {
  useClienteByTelefone,
  useUpdateClienteTrava,
  useDeleteCliente,
  useUpdateClienteNotes,
} from "@/services/clientes/use-clientes";
import { useAppointmentsByPhone } from "@/services/appointments/use-appointments";
import { useEffect, useMemo, useState } from "react";
import { useLatestMedicalRecord, useCreateMedicalRecord, useUpdateMedicalRecord, useMedicalRecords } from "@/services/medical-records/use-medical-records";
import { createClient } from "@/lib/supabase/client";
import { User, Activity } from "lucide-react";

import { ClienteHeader } from "./cliente-details/cliente-header";
import { ClienteStatsCards, type ClienteStats } from "./cliente-details/cliente-stats-cards";
import { ClienteOverviewTab } from "./cliente-details/cliente-overview-tab";
import { ClienteTimelineTab } from "./cliente-details/cliente-timeline-tab";
import { ClienteActions } from "./cliente-details/cliente-actions";

interface ClienteDetailsModalProps {
  cliente: ClienteRow | null;
  onClose: () => void;
}

const TABS = [
  { id: "overview", label: "Geral", icon: User },
  { id: "timeline", label: "Timeline", icon: Activity },
] as const;

export function ClienteDetailsModal({ cliente, onClose }: ClienteDetailsModalProps) {
  const updateClienteTravaMutation = useUpdateClienteTrava();
  const updateClienteNotesMutation = useUpdateClienteNotes();
  const deleteClienteMutation = useDeleteCliente();

  const { data: clienteAtualizado } = useClienteByTelefone(cliente?.telefone || null);
  const { data: appointmentsHistory = [], isLoading: isLoadingHistory } = useAppointmentsByPhone(cliente?.telefone || null);

  const stats: ClienteStats = useMemo(() => {
    const completed = appointmentsHistory.filter(a => a.completed_at);
    const totalInvestido = completed.reduce((acc, apt) => acc + (apt.service?.price || 0), 0);
    const avgTicket = completed.length > 0 ? totalInvestido / completed.length : 0;
    const lastVisit = completed.length > 0 ? new Date(completed[0].created_at) : null;
    const nextAppointment = appointmentsHistory.find(a => !a.completed_at && new Date(a.start_time) > new Date());

    return { totalInvestido, totalVisitas: appointmentsHistory.length, visitasConcluidas: completed.length, avgTicket, lastVisit, nextAppointment };
  }, [appointmentsHistory]);

  const [activeTab, setActiveTab] = useState<string>("overview");
  const [notes, setNotes] = useState(cliente?.notes || "");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [observations, setObservations] = useState("");
  const [professionalId, setProfessionalId] = useState<number | null>(null);

  const { data: latestRecord } = useLatestMedicalRecord(cliente?.id || null);
  const { data: medicalRecords = [] } = useMedicalRecords(cliente?.id || null);
  const createRecordMutation = useCreateMedicalRecord();
  const updateRecordMutation = useUpdateMedicalRecord();

  useEffect(() => {
    if (clienteAtualizado?.notes !== undefined) {
      setNotes(clienteAtualizado.notes || "");
    } else if (cliente?.notes) {
      setNotes(cliente.notes);
    }
  }, [clienteAtualizado, cliente]);

  useEffect(() => {
    if (latestRecord) {
      setClinicalNotes(latestRecord.clinical_notes || "");
      setObservations(latestRecord.observations || "");
    }
  }, [latestRecord]);

  useEffect(() => {
    const fetchProfessionalId = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: professional } = await supabase
          .from('professionals')
          .select('id')
          .eq('user_id', user.id)
          .single();
        if (professional) {
          setProfessionalId(professional.id);
        }
      }
    };
    fetchProfessionalId();
  }, []);

  if (!cliente) return null;

  const clienteAtual = clienteAtualizado || cliente;
  const isLocked = clienteAtual.trava;

  const handleNotesBlur = async () => {
    if (notes !== (clienteAtual.notes || "")) {
      try {
        await updateClienteNotesMutation.mutateAsync({
          telefone: clienteAtual.telefone,
          notes: notes,
        });
        toast.success("Anotações salvas com sucesso");
      } catch {
        toast.error("Erro ao salvar anotações");
      }
    }
  };

  const handleWhatsApp = () => {
    const phoneNumber = clienteAtual.telefone.replace(/\D/g, "");
    const message = encodeURIComponent(
      `Olá ${clienteAtual.nome}, tudo bem? Aqui é da clínica. Estamos entrando em contato.`
    );
    window.open(`https://web.whatsapp.com/send?phone=55${phoneNumber}&text=${message}`, "_blank");
  };

  const handleToggleLock = async () => {
    try {
      const newTravaValue = !isLocked;
      await updateClienteTravaMutation.mutateAsync({
        telefone: clienteAtual.telefone,
        trava: newTravaValue,
      });
      toast.success(newTravaValue ? "Cliente bloqueado" : "Cliente desbloqueado");
    } catch {
      toast.error("Erro ao atualizar bloqueio do cliente");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteClienteMutation.mutateAsync(clienteAtual.id);
      toast.success("Cliente excluído com sucesso");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir cliente");
    }
  };

  return (
    <Dialog open={!!cliente} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] p-0 flex flex-col bg-background overflow-hidden border rounded-lg gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{clienteAtual.nome}</DialogTitle>
        </DialogHeader>

        <ClienteHeader cliente={clienteAtual} isLocked={isLocked} />
        <ClienteStatsCards stats={stats} />

        {/* Tabs — underline style */}
        <div className="flex-1 overflow-hidden flex flex-col mt-4">
          <div className="px-6 sm:px-8 flex border-b border-border">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`relative flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold transition-colors ${
                  activeTab === id
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
                {activeTab === id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-full" />
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-6 sm:px-8">
              {activeTab === "overview" && (
                <ClienteOverviewTab
                  cliente={clienteAtual}
                  isLocked={isLocked}
                  stats={stats}
                  notes={notes}
                  onNotesChange={setNotes}
                  onNotesBlur={handleNotesBlur}
                  isSaving={updateClienteNotesMutation.isPending}
                />
              )}
              {activeTab === "timeline" && (
                <ClienteTimelineTab
                  appointments={appointmentsHistory}
                  isLoading={isLoadingHistory}
                />
              )}
            </div>
          </div>
        </div>

        <ClienteActions
          cliente={clienteAtual}
          isLocked={isLocked}
          appointmentsCount={appointmentsHistory.length}
          isDeleting={deleteClienteMutation.isPending}
          onWhatsApp={handleWhatsApp}
          onToggleLock={handleToggleLock}
          onDelete={handleDelete}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
