"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-muted/40 flex items-center justify-center p-6">
      <Card className="p-12 max-w-lg rounded-sm border-border/50 shadow-[0_2px_4px_rgba(0,0,0,0.06),0_8px_16px_rgba(0,0,0,0.06),0_16px_32px_rgba(0,0,0,0.08)]">
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-red-50 dark:bg-red-900/30 rounded-sm flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              Algo deu errado
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Ocorreu um erro inesperado ao carregar esta página. 
              Tente novamente ou entre em contato com o suporte se o problema persistir.
            </p>
          </div>
          <Button
            onClick={reset}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </Button>
        </div>
      </Card>
    </div>
  );
}
