"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import type { Transaction } from "@/types/financial";

interface MercadoPagoCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction;
  onPaymentComplete?: () => void;
}

export function MercadoPagoCheckoutModal({
  isOpen,
  onClose,
  transaction,
  onPaymentComplete,
}: MercadoPagoCheckoutModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadCheckoutUrl();
    }
  }, [isOpen, transaction.id]);

  const loadCheckoutUrl = async () => {
    try {
      setIsLoading(true);

      // Se já tem link, usar ele
      if (transaction.mercadopago_payment_link) {
        setCheckoutUrl(transaction.mercadopago_payment_link);
        setIsLoading(false);
        return;
      }

      // Criar nova preferência
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

      if (data.success && data.init_point) {
        setCheckoutUrl(data.init_point);
      }
    } catch (error) {
      console.error("Erro ao carregar checkout:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenInNewTab = () => {
    if (checkoutUrl) {
      window.open(checkoutUrl, "_blank");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Pagamento - Mercado Pago</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
              <p className="text-muted-foreground">Carregando checkout...</p>
            </div>
          ) : checkoutUrl ? (
            <>
              <div className="rounded-lg border bg-card p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <p className="font-medium">Link de pagamento gerado!</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Clique no botão abaixo para abrir o checkout do Mercado Pago em uma nova aba.
                </p>
              </div>

              {/* Iframe do checkout (opcional) */}
              <div className="w-full h-[500px] rounded-lg overflow-hidden border">
                <iframe
                  src={checkoutUrl}
                  className="w-full h-full"
                  title="Mercado Pago Checkout"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Fechar
                </Button>
                <Button
                  onClick={handleOpenInNewTab}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                >
                  Abrir em Nova Aba
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <XCircle className="h-12 w-12 text-red-500" />
              <p className="text-muted-foreground">Erro ao carregar checkout</p>
              <Button onClick={loadCheckoutUrl}>Tentar Novamente</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
