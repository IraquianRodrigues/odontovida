"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { MessageCircle, Pencil, Lock, LockOpen, Trash2 } from "lucide-react";
import type { ClienteRow } from "@/types/database.types";
import { useState } from "react";
import { EditClienteModal } from "@/components/edit-cliente-modal";

interface ClienteActionsProps {
  cliente: ClienteRow;
  isLocked: boolean;
  appointmentsCount: number;
  isDeleting: boolean;
  onWhatsApp: () => void;
  onToggleLock: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export function ClienteActions({
  cliente,
  isLocked,
  appointmentsCount,
  isDeleting,
  onWhatsApp,
  onToggleLock,
  onDelete,
  onClose,
}: ClienteActionsProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <>
      <div className="px-6 sm:px-8 py-4 border-t border-border flex items-center gap-2 flex-shrink-0 bg-muted/30">
        {/* Primary action */}
        <Button
          onClick={onWhatsApp}
          size="sm"
          className="bg-[#25D366] hover:bg-[#1DA851] text-white border-0 h-9 px-4 text-xs font-semibold rounded-lg transition-colors"
        >
          <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
          WhatsApp
        </Button>

        {/* Secondary actions */}
        <Button
          onClick={() => setIsEditModalOpen(true)}
          variant="outline"
          size="sm"
          className="h-9 px-3 text-xs font-medium rounded-lg border-border"
        >
          <Pencil className="h-3.5 w-3.5 mr-1.5" />
          Editar
        </Button>

        <Button
          onClick={onToggleLock}
          variant="outline"
          size="sm"
          className={`h-9 px-3 text-xs font-medium rounded-lg border-border ${
            isLocked
              ? "text-muted-foreground"
              : "text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800"
          }`}
        >
          {isLocked ? (
            <><LockOpen className="h-3.5 w-3.5 mr-1.5" />Desbloquear</>
          ) : (
            <><Lock className="h-3.5 w-3.5 mr-1.5" />Bloquear</>
          )}
        </Button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Destructive */}
        <Button
          onClick={() => setIsDeleteDialogOpen(true)}
          variant="ghost"
          size="sm"
          className="h-9 px-3 text-xs font-medium text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg"
        >
          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
          Excluir
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-9 px-3 text-xs font-medium text-muted-foreground rounded-lg"
        >
          Fechar
        </Button>
      </div>

      <EditClienteModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        cliente={cliente}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              O cliente <strong>{cliente.nome}</strong> será permanentemente removido.
              {appointmentsCount > 0 && (
                <span className="block mt-2 text-amber-600 dark:text-amber-400 font-medium text-xs">
                  ⚠ {appointmentsCount} agendamento(s) registrado(s) serão afetados.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-destructive hover:bg-destructive/90 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? "Excluindo…" : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
