"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, User } from "lucide-react";

interface RecordErrorStateProps {
  error: Error | null;
  onBack: () => void;
}

export function RecordErrorState({ error, onBack }: RecordErrorStateProps) {
  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
      <div className="text-center space-y-4 p-8">
        <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-sm inline-block mb-4">
          <FileText className="h-12 w-12 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Erro ao Carregar Prontuário</h2>
        <p className="text-muted-foreground max-w-md">
          Não foi possível carregar os dados do paciente. Por favor, tente novamente.
        </p>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 font-mono">{error.message}</p>
        )}
        <div className="flex gap-3 justify-center mt-6">
          <Button onClick={onBack} variant="outline" className="rounded-sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Button onClick={() => window.location.reload()} className="rounded-sm">
            Tentar Novamente
          </Button>
        </div>
      </div>
    </div>
  );
}

interface RecordEmptyStateProps {
  onBack: () => void;
}

export function RecordEmptyState({ onBack }: RecordEmptyStateProps) {
  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
      <div className="text-center space-y-4 p-8">
        <div className="p-4 bg-muted/30 rounded-sm inline-block mb-4">
          <User className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Paciente Não Encontrado</h2>
        <p className="text-muted-foreground max-w-md">
          Não foi possível encontrar os dados deste paciente.
        </p>
        <Button onClick={onBack} variant="outline" className="rounded-sm mt-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>
    </div>
  );
}
