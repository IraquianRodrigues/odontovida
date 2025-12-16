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
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Calendar,
  User,
  Stethoscope,
  FileText,
  MessageCircle,
  Lock,
  XCircle,
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

  return (
    <Dialog open={!!appointment} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl sm:text-2xl">
            Detalhes do Agendamento
          </DialogTitle>
          <DialogDescription>
            Informações completas sobre o agendamento selecionado
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-180px)] px-6">
          <div className="space-y-6 pb-6 pr-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                {isLocked && (
                  <Badge variant="outline" className="gap-1">
                    <Lock className="h-3 w-3" />
                    Bloqueado
                  </Badge>
                )}
              </div>
              <span className="text-sm text-muted-foreground">
                ID: {appointment.id}
              </span>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Informações do Paciente
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-0 sm:pl-7">
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium break-words">
                    {appointment.customer_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium">{appointment.customer_phone}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Informações do Agendamento
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-0 sm:pl-7">
                <div>
                  <p className="text-sm text-muted-foreground">Data</p>
                  <p className="font-medium">
                    {formatDateBR(appointment.start_time)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Horário</p>
                  <p className="font-medium">
                    {formatTimeBR(appointment.start_time)} -{" "}
                    {formatTimeBR(appointment.end_time)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Serviço</p>
                  <p className="font-medium break-words">
                    {service?.code || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duração</p>
                  <p className="font-medium">
                    {service?.duration_minutes || 0} minutos
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-primary" />
                Profissional
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-0 sm:pl-7">
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium break-words">
                    {professional?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Código</p>
                  <p className="font-medium break-words">
                    {professional?.code || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Informações Adicionais
              </h3>
              <div className="pl-0 sm:pl-7">
                <p className="text-sm text-muted-foreground">Criado em</p>
                <p className="font-medium">
                  {formatDateTimeBR(appointment.created_at)}
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleWhatsApp}
                variant="default"
                className="flex-1 gap-2 cursor-pointer"
              >
                <MessageCircle className="h-4 w-4" />
                Enviar WhatsApp
              </Button>
              <Button
                onClick={handleLockAppointment}
                variant={isLocked ? "outline" : "secondary"}
                className="flex-1 gap-2 cursor-pointer"
                disabled={updateClienteTravaMutation.isPending}
              >
                <Lock className="h-4 w-4" />
                {updateClienteTravaMutation.isPending
                  ? "Processando..."
                  : isLocked
                  ? "Desbloquear"
                  : "Bloquear"}
              </Button>
              {!isPastAppointment && (
                <Button
                  onClick={handleDeleteAppointment}
                  variant="destructive"
                  className="flex-1 gap-2 cursor-pointer"
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
                  {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
                </Button>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
