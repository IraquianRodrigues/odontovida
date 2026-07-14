"use client";

import { logger } from "@/lib/logger";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { FinancialService } from "@/services/financial";
import { toast } from "sonner";
import type { PaymentMethod } from "@/types/financial";
import type { AppointmentWithRelations } from "@/types/database.types";
import { formatDateBR } from "@/lib/date-utils";

interface CompleteAppointmentPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: AppointmentWithRelations | null;
  onSuccess: () => void | Promise<void>;
}

export function CompleteAppointmentPaymentModal({
  isOpen,
  onClose,
  appointment,
  onSuccess,
}: CompleteAppointmentPaymentModalProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("dinheiro");
  const [amount, setAmount] = useState<number>(0);

  // Preencher valor automaticamente se disponível
  useEffect(() => {
    if (isOpen) {
      setAmount(appointment?.service?.price || 0);
    }
  }, [appointment?.id, appointment?.service?.price, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!appointment) return;

    if (amount <= 0) {
      toast.error("Informe um valor válido");
      return;
    }

    setIsSubmitting(true);


    try {
      const result = await FinancialService.completeAppointmentWithPayment(
        appointment.id,
        paymentMethod,
        amount
      );

      if (result.success) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["appointments"] }),
          queryClient.invalidateQueries({ queryKey: ["appointment"] }),
          queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] }),
          queryClient.invalidateQueries({ queryKey: ["financial-metrics"] }),
          queryClient.invalidateQueries({ queryKey: ["financial-transactions"] }),
        ]);
        toast.success("Pagamento registrado e agendamento concluído!");
        await onSuccess();
        onClose();
      } else {
        toast.error(result.error || "Erro ao registrar pagamento");
      }
    } catch (error) {
      logger.error('Erro ao processar pagamento:', error);
      toast.error("Erro inesperado ao registrar pagamento");
    }

    setIsSubmitting(false);
  };

  const handleClose = () => {
    setAmount(0);
    setPaymentMethod("dinheiro");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Pagamento</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Informações do Agendamento */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cliente:</span>
              <span className="font-medium">{appointment?.customer_name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Procedimento:</span>
              <span className="font-medium">
                {appointment?.service?.description ||
                  appointment?.service?.code ||
                  "Consulta"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Data:</span>
              <span className="font-medium">
                {appointment?.start_time ? formatDateBR(appointment.start_time) : ""}
              </span>
            </div>
          </div>

          {/* Valor */}
          <div className="space-y-2">
            <Label htmlFor="amount">Valor Recebido (R$) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              placeholder="0,00"
              required
              autoFocus
            />
          </div>

          {/* Método de Pagamento */}
          <div className="space-y-2">
            <Label htmlFor="payment_method">Forma de Pagamento *</Label>
            <Select
              value={paymentMethod}
              onValueChange={(value: PaymentMethod) => setPaymentMethod(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dinheiro">💵 Dinheiro</SelectItem>
                <SelectItem value="pix">📱 PIX</SelectItem>
                <SelectItem value="cartao_credito">💳 Cartão de Crédito</SelectItem>
                <SelectItem value="cartao_debito">💳 Cartão de Débito</SelectItem>
                <SelectItem value="boleto">📄 Boleto</SelectItem>
                <SelectItem value="transferencia">🏦 Transferência</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Registrando..." : "Confirmar Pagamento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
