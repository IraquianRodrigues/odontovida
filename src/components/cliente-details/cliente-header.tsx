"use client";

import { DialogTitle } from "@/components/ui/dialog";
import { Phone, Lock, Calendar, Cake, MapPin } from "lucide-react";
import type { ClienteRow } from "@/types/database.types";
import { calculateAge, formatBirthDate } from "@/lib/utils/date-utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ClienteHeaderProps {
  cliente: ClienteRow;
  isLocked: boolean;
}

export function ClienteHeader({ cliente, isLocked }: ClienteHeaderProps) {
  return (
    <div className="px-6 sm:px-8 pt-6 pb-5 flex-shrink-0 border-b border-border">
      <DialogTitle className="text-xl font-semibold tracking-tight text-foreground truncate">
        {cliente.nome}
      </DialogTitle>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 font-mono text-xs">
          <Phone className="w-3 h-3" />
          {cliente.telefone}
        </span>

        <span className="text-border">|</span>

        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${isLocked ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${isLocked ? "bg-destructive" : "bg-emerald-500"}`} />
          {isLocked ? "Bloqueado" : "Ativo"}
        </span>

        <span className="text-border">|</span>

        <span className="inline-flex items-center gap-1.5 text-xs">
          <Calendar className="w-3 h-3" />
          Desde {format(new Date(cliente.created_at), "MMM yyyy", { locale: ptBR })}
        </span>

        {cliente.data_nascimento && (
          <>
            <span className="text-border">|</span>
            <span className="inline-flex items-center gap-1.5 text-xs">
              <Cake className="w-3 h-3" />
              {calculateAge(cliente.data_nascimento)} anos
            </span>
          </>
        )}
      </div>

      {(cliente.endereco || cliente.bairro || cliente.cidade) && (
        <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">
            {[cliente.endereco, cliente.bairro, cliente.cidade].filter(Boolean).join(" · ")}
          </span>
        </div>
      )}
    </div>
  );
}

