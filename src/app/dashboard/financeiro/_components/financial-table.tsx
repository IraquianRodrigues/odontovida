"use client";

import { useState } from "react";
import type { Transaction } from "@/types/financial";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Check, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FinancialService } from "@/services/financial";
import { toast } from "sonner";
import { formatDateBR } from "@/lib/date-utils";
import { ConfirmDialog } from "@/components/confirm-dialog";
// import { MercadoPagoPaymentButton } from "@/components/mercadopago-payment-button"; // DESATIVADO TEMPORARIAMENTE

interface FinancialTableProps {
  transactions: Transaction[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function FinancialTable({ transactions, isLoading, onRefresh }: FinancialTableProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      pago: { variant: "default", label: "Pago" },
      pendente: { variant: "secondary", label: "Pendente" },
      atrasado: { variant: "destructive", label: "Atrasado" },
      cancelado: { variant: "outline", label: "Cancelado" },
    };

    const config = variants[status] || variants.pendente;
    return (
      <Badge variant={config.variant} className="font-medium">
        {config.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    if (type === "receita") {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800">
          Receita
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800">
        Despesa
      </Badge>
    );
  };

  const handleMarkAsPaid = async (id: string) => {
    setProcessingId(id);
    const result = await FinancialService.markAsPaid(id, "dinheiro");
    
    if (result.success) {
      toast.success("Transação marcada como paga!");
      onRefresh();
    } else {
      toast.error("Erro ao atualizar transação");
    }
    
    setProcessingId(null);
  };

  const openDeleteDialog = (id: string) => {
    setTransactionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!transactionToDelete) return;
    
    setProcessingId(transactionToDelete);
    setDeleteDialogOpen(false);
    
    const result = await FinancialService.deleteTransaction(transactionToDelete);
    
    if (result.success) {
      toast.success("Transação excluída!");
      onRefresh();
    } else {
      toast.error("Erro ao excluir transação");
    }
    
    setProcessingId(null);
    setTransactionToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Carregando transações...</div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground text-lg">Nenhuma transação encontrada</p>
        <p className="text-muted-foreground text-sm mt-2">
          Clique em "Nova Transação" para começar
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Data</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Profissional</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Pagamento</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="font-medium">
                {formatDateBR(transaction.due_date)}
              </TableCell>
              <TableCell>
                {transaction.client?.nome || "N/A"}
              </TableCell>
              <TableCell>
                {transaction.professional?.name || "N/A"}
              </TableCell>
              <TableCell className="max-w-xs truncate">
                {transaction.category}
              </TableCell>
              <TableCell>{getTypeBadge(transaction.type)}</TableCell>
              <TableCell className="text-muted-foreground">
                {transaction.category}
              </TableCell>
              <TableCell className={`text-right font-semibold ${
                transaction.type === "receita" 
                  ? "text-green-600 dark:text-green-400" 
                  : "text-red-600 dark:text-red-400"
              }`}>
                {transaction.type === "receita" ? "+" : "-"}
                {formatCurrency(transaction.amount)}
              </TableCell>
              <TableCell>{getStatusBadge(transaction.status)}</TableCell>
              <TableCell>
                {transaction.payment_method && transaction.status === "pago" ? (
                  <div className="flex items-center gap-1.5">
                    {transaction.payment_method === "pix" && "📱"}
                    {transaction.payment_method === "dinheiro" && "💵"}
                    {transaction.payment_method === "cartao_credito" && "💳"}
                    {transaction.payment_method === "cartao_debito" && "💳"}
                    {transaction.payment_method === "boleto" && "📄"}
                    {transaction.payment_method === "transferencia" && "🏦"}
                    <span className="text-sm text-muted-foreground capitalize">
                      {transaction.payment_method.replace("_", " ")}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={processingId === transaction.id}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {transaction.status === "pendente" && (
                      <DropdownMenuItem
                        onClick={() => handleMarkAsPaid(transaction.id)}
                        className="gap-2"
                      >
                        <Check className="h-4 w-4" />
                        Marcar como Pago
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => openDeleteDialog(transaction.id)}
                      className="gap-2 text-red-600"
                    >
                      <X className="h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Excluir Transação"
        description="Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>
  );
}
