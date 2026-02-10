"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { FinancialService } from "@/services/financial";
import type { Transaction, FinancialMetrics, TransactionType, TransactionStatus } from "@/types/financial";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown, Clock, DollarSign, AlertCircle, FileText } from "lucide-react";
import { toast } from "sonner";
import { FinancialTable } from "./_components/financial-table";
import { AddTransactionModal } from "./_components/add-transaction-modal";
import { FinancialFilters } from "./_components/financial-filters";
import { FinancialReportModal } from "./_components/financial-report-modal";

export default function FinanceiroPage() {
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  
  // Filter states
  const [selectedType, setSelectedType] = useState<TransactionType | "all">("all");
  const [selectedProfessional, setSelectedProfessional] = useState<number | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<TransactionStatus | "all">("all");

  const loadData = async () => {
    setIsLoading(true);
    
    // Load metrics
    const metricsResult = await FinancialService.getFinancialMetrics();
    if (metricsResult.success && metricsResult.data) {
      setMetrics(metricsResult.data);
    }

    // Load transactions with filters
    const filters: any = {};
    if (selectedType !== "all") filters.type = selectedType;
    if (selectedProfessional !== "all") filters.professionalId = selectedProfessional;
    if (selectedStatus !== "all") filters.status = selectedStatus;

    const transactionsResult = await FinancialService.getTransactions(filters);
    if (transactionsResult.success && transactionsResult.data) {
      setTransactions(transactionsResult.data);
    } else {
      toast.error("Erro ao carregar transações");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [selectedType, selectedProfessional, selectedStatus]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <ProtectedRoute requiresAdmin>
      <div className="min-h-screen bg-muted/40 transition-colors duration-300">
        <div className="container mx-auto p-6 lg:p-10 space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground transition-colors">
                Financeiro
              </h1>
              <p className="text-sm text-muted-foreground font-medium transition-colors">
                Gerencie receitas, despesas e fluxo de caixa
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setIsReportModalOpen(true)}
                variant="outline"
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                Gerar Relatório
              </Button>
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Nova Transação
              </Button>
            </div>
          </div>

          {/* Metrics Cards */}
          {!isLoading && metrics ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total a Receber */}
              <Card className="p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-900/30">
                    <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      A Receber
                    </p>
                    <p className="text-xl font-bold text-foreground mt-1 truncate">
                      {formatCurrency(metrics.dailyAppointmentsReceivable)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Agendamentos de hoje
                    </p>
                  </div>
                </div>
              </Card>

              {/* Total Recebido */}
              <Card className="p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
                    <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Recebido no Mês
                    </p>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-1 truncate">
                      {formatCurrency(metrics.monthlyRevenue)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Receitas confirmadas
                    </p>
                  </div>
                </div>
              </Card>

              {/* Em Atraso */}
              <Card className="p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/30">
                    <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Em Atraso
                    </p>
                    <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-1 truncate">
                      {formatCurrency(metrics.totalOverdue)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Pagamentos vencidos
                    </p>
                  </div>
                </div>
              </Card>

              {/* Lucro Líquido */}
              <Card className="p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${
                    metrics.netProfit >= 0 
                      ? "bg-blue-100 dark:bg-blue-900/30" 
                      : "bg-red-100 dark:bg-red-900/30"
                  }`}>
                    <DollarSign className={`h-6 w-6 ${
                      metrics.netProfit >= 0
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-red-600 dark:text-red-400"
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Lucro Líquido
                    </p>
                    <p className={`text-xl font-bold mt-1 truncate ${
                      metrics.netProfit >= 0 
                        ? "text-blue-600 dark:text-blue-400" 
                        : "text-red-600 dark:text-red-400"
                    }`}>
                      {formatCurrency(metrics.netProfit)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Receitas - Despesas
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-[140px] rounded-xl border border-border bg-card animate-pulse"
                >
                  <div className="p-6 space-y-4">
                    <div className="h-12 w-12 rounded-xl bg-muted/50" />
                    <div className="space-y-2">
                      <div className="h-3 w-20 rounded bg-muted/50" />
                      <div className="h-6 w-24 rounded bg-muted/50" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Filters */}
          <FinancialFilters
            selectedType={selectedType}
            selectedProfessional={selectedProfessional}
            selectedStatus={selectedStatus}
            onTypeChange={setSelectedType}
            onProfessionalChange={setSelectedProfessional}
            onStatusChange={setSelectedStatus}
            onClearFilters={() => {
              setSelectedType("all");
              setSelectedProfessional("all");
              setSelectedStatus("all");
            }}
          />

          {/* Transactions Table */}
          <Card className="border-border shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="text-foreground">Transações Recentes</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <FinancialTable 
                transactions={transactions} 
                isLoading={isLoading}
                onRefresh={loadData}
              />
            </CardContent>
          </Card>

          {/* Add Transaction Modal */}
          <AddTransactionModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onSuccess={() => {
              loadData();
              setIsAddModalOpen(false);
            }}
          />

          {/* Financial Report Modal */}
          <FinancialReportModal
            isOpen={isReportModalOpen}
            onClose={() => setIsReportModalOpen(false)}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
