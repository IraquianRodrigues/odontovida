"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  User,
  Stethoscope,
  FileText,
  MessageCircle,
  Lock,
  XCircle,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Unlock,
} from "lucide-react";
import type { AppointmentWithRelations } from "@/types/database.types";
import {
  formatDateBR,
  formatTimeBR,
  formatDateTimeBR,
  isPastDate,
} from "@/lib/date-utils";
import { toast } from "sonner";
import { useDeleteAppointment } from "@/services/appointments/use-appointments";
import {
  useClienteByTelefone,
  useUpdateClienteTrava,
} from "@/services/clientes/use-clientes";
import { CompleteAppointmentPaymentModal } from "@/components/complete-appointment-payment-modal";
import { useState } from "react";

interface AppointmentDetailsModalProps {
  appointment: AppointmentWithRelations | null;
  onClose: () => void;
  onUpdate: () => void;
}

export function AppointmentDetailsModal({
  appointment,
  onClose,
  onUpdate,
}: AppointmentDetailsModalProps) {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const deleteMutation = useDeleteAppointment();
  const updateClienteTravaMutation = useUpdateClienteTrava();

  // Busca o cliente pelo telefone para verificar se está travado
  const { data: cliente } = useClienteByTelefone(
    appointment?.customer_phone || null
  );

  if (!appointment) return null;

  const service = appointment.service;
  const professional = appointment.professional;
  const isLocked = cliente?.trava || false;

  // Verifica se a data do agendamento é anterior à data atual (no timezone da clínica)
  const isPastAppointment = isPastDate(appointment.start_time);

  const handleWhatsApp = () => {
    const phoneNumber = appointment.customer_phone.replace(/\D/g, "");
    const message = encodeURIComponent(
      `Olá ${
        appointment.customer_name
      }, tudo bem? Aqui é da clínica. Estamos entrando em contato sobre seu agendamento do dia ${formatDateBR(
        appointment.start_time
      )} às ${formatTimeBR(appointment.start_time)}.`
    );
    window.open(
      `https://web.whatsapp.com/send?phone=55${phoneNumber}&text=${message}`,
      "_blank"
    );
  };

  const handleLockAppointment = async () => {
    try {
      const newTravaValue = !isLocked;

      const result = await updateClienteTravaMutation.mutateAsync({
        telefone: appointment.customer_phone,
        trava: newTravaValue,
      });

      if (!result) {
        toast.error("Cliente não encontrado");
        return;
      }

      toast.success(
        newTravaValue
          ? "Cliente bloqueado com sucesso"
          : "Cliente desbloqueado com sucesso"
      );
    } catch (error) {
      toast.error("Erro ao atualizar bloqueio do cliente");
    }
  };

  const handleDeleteAppointment = async () => {
    if (isPastAppointment) {
      toast.error(
        "Não é possível excluir agendamentos com data anterior à atual."
      );
      return;
    }

    try {
      await deleteMutation.mutateAsync(appointment.id);
      toast.success(
        `O agendamento de ${appointment.customer_name} foi excluído com sucesso.`
      );
      onUpdate();
    } catch (error) {
      toast.error("Erro ao excluir agendamento. Tente novamente.");
    }
  };

  // Determinar status do agendamento
  const getAppointmentStatus = () => {
    if (isPastAppointment) {
      return {
        label: "Concluído",
        variant: "default" as const,
        icon: CheckCircle2,
        className: "bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-700 dark:text-green-400 border-green-500/20",
      };
    }
    if (isLocked) {
      return {
        label: "Bloqueado",
        variant: "destructive" as const,
        icon: Lock,
        className: "bg-gradient-to-r from-red-500/10 to-rose-500/10 text-red-700 dark:text-red-400 border-red-500/20",
      };
    }
    return {
      label: "Agendado",
      variant: "secondary" as const,
      icon: Clock,
      className: "bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    };
  };

  const status = getAppointmentStatus();
  const StatusIcon = status.icon;

  return (
    <Dialog open={!!appointment} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 flex flex-col overflow-hidden">
        {/* Header com gradiente */}
        <div className="relative px-6 pt-6 pb-4 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border-b">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Detalhes do Agendamento
                </DialogTitle>
                <DialogDescription className="text-sm mt-1">
                  Informações completas sobre o agendamento
                </DialogDescription>
              </div>
              <Badge className={`${status.className} gap-1.5 px-3 py-1 animate-in fade-in slide-in-from-top-2 duration-300`}>
                <StatusIcon className="h-3.5 w-3.5" />
                {status.label}
              </Badge>
            </div>
          </DialogHeader>
        </div>

        {/* Content com scroll */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            {/* Card de Informações do Paciente */}
            <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-card via-card to-card/50 p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <User className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="font-semibold text-lg">Informações do Paciente</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Nome</p>
                    <p className="font-semibold text-base">{appointment.customer_name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Telefone</p>
                    <p className="font-semibold text-base">{appointment.customer_phone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card de Informações do Agendamento */}
            <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-card via-card to-card/50 p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Calendar className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="font-semibold text-lg">Agendamento</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Data</p>
                    <p className="font-semibold text-base">{formatDateBR(appointment.start_time)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Horário</p>
                    <p className="font-semibold text-base">
                      {formatTimeBR(appointment.start_time)} - {formatTimeBR(appointment.end_time)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Serviço</p>
                    <p className="font-semibold text-base">{service?.code || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Duração</p>
                    <p className="font-semibold text-base">{service?.duration_minutes || 0} minutos</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card de Profissional */}
            <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-card via-card to-card/50 p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Stethoscope className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="font-semibold text-lg">Profissional</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Nome</p>
                    <p className="font-semibold text-base">{professional?.name || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Código</p>
                    <p className="font-semibold text-base">{professional?.code || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card de Informações Adicionais */}
            <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-card via-card to-card/50 p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="font-semibold text-lg">Informações Adicionais</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Criado em</p>
                    <p className="font-semibold text-base">{formatDateTimeBR(appointment.created_at)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">ID</p>
                    <p className="font-mono text-sm text-muted-foreground">{appointment.id}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer com ações */}
        <div className="border-t bg-gradient-to-br from-muted/30 to-transparent px-6 py-4">
          <div className="space-y-2">
            {/* Ações Primárias */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button
                onClick={() => setIsPaymentModalOpen(true)}
                className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/20 transition-all hover:shadow-xl hover:shadow-green-500/30 hover:scale-[1.02]"
                size="default"
              >
                <DollarSign className="h-4 w-4" />
                Registrar Pagamento
              </Button>

              <Button
                onClick={handleWhatsApp}
                variant="default"
                className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg shadow-blue-500/20 transition-all hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02]"
                size="default"
              >
                <MessageCircle className="h-4 w-4" />
                Enviar WhatsApp
              </Button>
            </div>

            {/* Ações Secundárias */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button
                onClick={handleLockAppointment}
                variant={isLocked ? "outline" : "secondary"}
                className={`gap-2 transition-all hover:scale-[1.02] ${
                  isLocked 
                    ? "border-red-500/50 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20" 
                    : "hover:bg-secondary/80"
                }`}
                size="default"
                disabled={updateClienteTravaMutation.isPending}
              >
                {isLocked ? (
                  <Unlock className="h-4 w-4" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
                {updateClienteTravaMutation.isPending
                  ? "Processando..."
                  : isLocked
                  ? "Desbloquear Cliente"
                  : "Bloquear Cliente"}
              </Button>

              {!isPastAppointment && (
                <Button
                  onClick={handleDeleteAppointment}
                  variant="destructive"
                  className="gap-2 transition-all hover:scale-[1.02]"
                  size="default"
                  disabled={
                    isLocked || isPastAppointment || deleteMutation.isPending
                  }
                  title={
                    isPastAppointment
                      ? "Não é possível excluir agendamentos passados"
                      : isLocked
                      ? "Não é possível excluir agendamentos bloqueados"
                      : ""
                  }
                >
                  <XCircle className="h-4 w-4" />
                  {deleteMutation.isPending ? "Excluindo..." : "Excluir Agendamento"}
                </Button>
              )}
            </div>

            {/* Aviso se bloqueado */}
            {isLocked && (
              <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-700 dark:text-red-400 animate-in fade-in slide-in-from-bottom-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>Este cliente está bloqueado. Desbloqueie para permitir exclusão.</span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>

      {/* Payment Modal */}
      <CompleteAppointmentPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        appointment={appointment}
        onSuccess={() => {
          onUpdate();
          setIsPaymentModalOpen(false);
        }}
      />
    </Dialog>
  );
}
