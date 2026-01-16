"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import type { Transaction } from "@/types/financial";

interface MercadoPagoPaymentButtonProps {
  transaction: Transaction;
  onSuccess?: () => void;
}

export function MercadoPagoPaymentButton({
  transaction,
  onSuccess,
}: MercadoPagoPaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCreatePayment = async () => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/mercadopago/create-preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transaction_id: transaction.id,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        toast.error(data.error || "Erro ao criar link de pagamento");
        return;
      }

      // Abrir link de pagamento em nova aba
      if (data.init_point) {
        window.open(data.init_point, "_blank");
        toast.success("Link de pagamento aberto em nova aba!");
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error: any) {
      console.error("Erro ao criar pagamento:", error);
      toast.error("Erro ao criar link de pagamento");
    } finally {
      setIsLoading(false);
    }
  };

  // Se já tem link de pagamento, mostrar botão para abrir
  if (transaction.mercadopago_payment_link) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => window.open(transaction.mercadopago_payment_link!, "_blank")}
        className="gap-2"
      >
        <ExternalLink className="h-4 w-4" />
        Abrir Pagamento
      </Button>
    );
  }

  // Botão para criar novo pagamento
  return (
    <Button
      size="sm"
      onClick={handleCreatePayment}
      disabled={isLoading || transaction.status !== "pendente"}
      className="gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Gerando...
        </>
      ) : (
        <>
          <CreditCard className="h-4 w-4" />
          Pagar com Mercado Pago
        </>
      )}
    </Button>
  );
}
