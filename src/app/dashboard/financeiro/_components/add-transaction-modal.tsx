"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { FinancialService } from "@/services/financial.service";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { CreateTransactionInput } from "@/types/financial";

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Client {
  id: string;
  name: string;
}

export function AddTransactionModal({ isOpen, onClose, onSuccess }: AddTransactionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [generatePaymentLink, setGeneratePaymentLink] = useState(false);
  const [formData, setFormData] = useState<CreateTransactionInput>({
    client_id: "",
    type: "receita",
    category: "",
    description: "",
    amount: 0,
    payment_method: "dinheiro",
    status: "pendente",
    due_date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (isOpen) {
      loadClients();
    }
  }, [isOpen]);

  const loadClients = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("clientes")
      .select("id, nome")
      .order("nome");
    
    if (data) {
      setClients(data.map(c => ({ id: c.id.toString(), name: c.nome })));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar cliente apenas para receitas
    if (formData.type === "receita" && !formData.client_id) {
      toast.error("Selecione um cliente");
      return;
    }
    
    if (!formData.category) {
      toast.error("Informe a categoria");
      return;
    }
    
    if (formData.amount <= 0) {
      toast.error("Informe um valor válido");
      return;
    }

    setIsSubmitting(true);

    // Para despesas, usar um ID genérico ou remover o client_id
    const transactionData = formData.type === "despesa" 
      ? { ...formData, client_id: undefined }
      : formData;

    const result = await FinancialService.createTransaction(transactionData as CreateTransactionInput);

    if (result.success) {
      toast.success("Transação criada com sucesso!");
      
      // MERCADO PAGO DESATIVADO TEMPORARIAMENTE
      // Se deve gerar link de pagamento e é uma receita pendente
      /* if (generatePaymentLink && formData.type === "receita" && formData.status === "pendente" && result.data?.id) {
        try {
          const paymentResponse = await fetch("/api/mercadopago/create-preference", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transaction_id: result.data.id }),
          });
          
          const paymentData = await paymentResponse.json();
          
          if (paymentData.success && paymentData.init_point) {
            toast.success("Link de pagamento gerado!");
            // Copiar link para clipboard
            navigator.clipboard.writeText(paymentData.init_point);
            toast.info("Link copiado para área de transferência!");
          }
        } catch (error) {
          console.error("Erro ao gerar link:", error);
          toast.error("Transação criada, mas erro ao gerar link de pagamento");
        }
      } */
      
      onSuccess();
      resetForm();
    } else {
      toast.error(result.error || "Erro ao criar transação");
    }

    setIsSubmitting(false);
  };

  const resetForm = () => {
    setFormData({
      client_id: "",
      type: "receita",
      category: "",
      description: "",
      amount: 0,
      payment_method: "dinheiro",
      status: "pendente",
      due_date: new Date().toISOString().split("T")[0],
    });
    setGeneratePaymentLink(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Transação</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Tipo */}
          <div className="space-y-2">
            <Label htmlFor="type">Tipo *</Label>
            <Select
              value={formData.type}
              onValueChange={(value: any) =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="receita">Receita</SelectItem>
                <SelectItem value="despesa">Despesa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cliente - Apenas para Receitas */}
          {formData.type === "receita" && (
            <div className="space-y-2">
              <Label htmlFor="client">Cliente *</Label>
              <Select
                value={formData.client_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, client_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Categoria */}
          <div className="space-y-2">
            <Label htmlFor="category">Categoria *</Label>
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
                id="category"
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
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
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
            <Label htmlFor="amount">Valor (R$) *</Label>
            <Input
              id="amount"
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
            <Label htmlFor="due_date">Data de Vencimento *</Label>
            <Input
              id="due_date"
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
            <Label htmlFor="status">Status *</Label>
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
              <Label htmlFor="payment_method">Método de Pagamento *</Label>
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

          {/* MERCADO PAGO DESATIVADO TEMPORARIAMENTE */}
          {/* Gerar Link de Pagamento - Apenas para Receitas Pendentes */}
          {/* {formData.type === "receita" && formData.status === "pendente" && (
            <div className="flex items-center space-x-2 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <input
                type="checkbox"
                id="generatePaymentLink"
                checked={generatePaymentLink}
                onChange={(e) => setGeneratePaymentLink(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="generatePaymentLink" className="text-sm cursor-pointer">
                Gerar link de pagamento do Mercado Pago automaticamente
              </Label>
            </div>
          )} */}

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
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Salvando..." : "Salvar Transação"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
