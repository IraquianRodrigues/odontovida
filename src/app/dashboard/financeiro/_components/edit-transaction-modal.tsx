"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FinancialService } from "@/services/financial";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { Transaction, UpdateTransactionInput, TransactionType, TransactionStatus, PaymentMethod } from "@/types/financial";

interface EditTransactionModalProps {
  isOpen: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditTransactionModal({ isOpen, transaction, onClose, onSuccess }: EditTransactionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<{
    type: TransactionType;
    category: string;
    description: string;
    amount: number;
    payment_method: PaymentMethod;
    status: TransactionStatus;
    due_date: string;
  }>({
    type: "receita",
    category: "",
    description: "",
    amount: 0,
    payment_method: "dinheiro",
    status: "pendente",
    due_date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (transaction && isOpen) {
      setFormData({
        type: transaction.type,
        category: transaction.category || "",
        description: transaction.description || "",
        amount: transaction.amount,
        payment_method: (transaction.payment_method as PaymentMethod) || "dinheiro",
        status: transaction.status,
        due_date: transaction.due_date?.split("T")[0] || new Date().toISOString().split("T")[0],
      });
    }
  }, [transaction, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!transaction) return;

    if (!formData.category) {
      toast.error("Informe a categoria");
      return;
    }

    if (formData.amount <= 0) {
      toast.error("Informe um valor válido");
      return;
    }

    setIsSubmitting(true);

    const updateData: UpdateTransactionInput = {
      category: formData.category,
      description: formData.description || undefined,
      amount: formData.amount,
      status: formData.status,
      due_date: formData.due_date,
    };

    if (formData.status === "pago") {
      updateData.payment_method = formData.payment_method;
      if (!transaction.paid_date) {
        updateData.paid_date = new Date().toISOString().split("T")[0];
      }
    }

    const result = await FinancialService.updateTransaction(transaction.id, updateData);

    if (result.success) {
      toast.success("Transação atualizada com sucesso!");
      onSuccess();
      onClose();
    } else {
      toast.error(result.error || "Erro ao atualizar transação");
    }

    setIsSubmitting(false);
  };

  if (!transaction) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Transação</DialogTitle>
          <DialogDescription>
            Altere os campos desejados e clique em salvar
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Tipo (somente leitura) */}
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Input
              value={formData.type === "receita" ? "Receita" : "Despesa"}
              disabled
              className="bg-muted"
            />
          </div>

          {/* Cliente (somente leitura) */}
          {transaction.client && (
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Input
                value={transaction.client.nome}
                disabled
                className="bg-muted"
              />
            </div>
          )}

          {/* Categoria */}
          <div className="space-y-2">
            <Label htmlFor="edit-category">Categoria *</Label>
            {formData.type === "despesa" ? (
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aluguel">🏢 Aluguel</SelectItem>
                  <SelectItem value="Água">💧 Água</SelectItem>
                  <SelectItem value="Luz">💡 Luz</SelectItem>
                  <SelectItem value="Internet">📡 Internet</SelectItem>
                  <SelectItem value="Telefone">📞 Telefone</SelectItem>
                  <SelectItem value="Salários">💰 Salários</SelectItem>
                  <SelectItem value="Materiais Odontológicos">🦷 Materiais Odontológicos</SelectItem>
                  <SelectItem value="Produtos de Limpeza">🧹 Produtos de Limpeza</SelectItem>
                  <SelectItem value="Manutenção">🔧 Manutenção</SelectItem>
                  <SelectItem value="Impostos">📋 Impostos</SelectItem>
                  <SelectItem value="Equipamentos">⚙️ Equipamentos</SelectItem>
                  <SelectItem value="Marketing">📢 Marketing</SelectItem>
                  <SelectItem value="Outros">📦 Outros</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="edit-category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="Ex: Consulta, Limpeza, Clareamento..."
                required
              />
            )}
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="edit-description">Descrição</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Detalhes adicionais..."
              rows={3}
            />
          </div>

          {/* Valor */}
          <div className="space-y-2">
            <Label htmlFor="edit-amount">Valor (R$) *</Label>
            <Input
              id="edit-amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount || ""}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value === "" ? 0 : parseFloat(e.target.value) })
              }
              placeholder="0,00"
              required
            />
          </div>

          {/* Data de Vencimento */}
          <div className="space-y-2">
            <Label htmlFor="edit-due-date">Data de Vencimento *</Label>
            <Input
              id="edit-due-date"
              type="date"
              value={formData.due_date}
              onChange={(e) =>
                setFormData({ ...formData, due_date: e.target.value })
              }
              required
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="edit-status">Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value: any) =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Método de Pagamento (se pago) */}
          {formData.status === "pago" && (
            <div className="space-y-2">
              <Label htmlFor="edit-payment-method">Método de Pagamento *</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, payment_method: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                  <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                  <SelectItem value="boleto">Boleto</SelectItem>
                  <SelectItem value="transferencia">Transferência</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
