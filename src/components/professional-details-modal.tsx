"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import { User, Trash2, Code2 } from "lucide-react";
import type { ProfessionalRow } from "@/types/database.types";
import { formatDateTimeBR } from "@/lib/date-utils";
import { toast } from "sonner";
import {
  useCreateProfessional,
  useUpdateProfessional,
  useDeleteProfessional,
} from "@/services/professionals/use-professionals";

interface ProfessionalDetailsModalProps {
  professional: ProfessionalRow | null;
  isCreating?: boolean;
  onClose: () => void;
}

export function ProfessionalDetailsModal({
  professional,
  isCreating = false,
  onClose,
}: ProfessionalDetailsModalProps) {
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const createMutation = useCreateProfessional();
  const updateMutation = useUpdateProfessional();
  const deleteMutation = useDeleteProfessional();

  const generatedCode = name.toLowerCase().trim().replace(/\s+/g, "-");

  useEffect(() => {
    if (professional) {
      setName(professional.name);
      setSpecialty(professional.specialty || "");
    } else if (isCreating) {
      setName("");
      setSpecialty("");
    }
  }, [professional, isCreating]);

  useEffect(() => {
    if (!professional && !isCreating) {
      setIsConfirmingDelete(false);
    }
  }, [professional, isCreating]);

  const isOpen = !!professional || isCreating;

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Por favor, preencha o nome do profissional");
      return;
    }

    try {
      if (isCreating) {
        await createMutation.mutateAsync({ name, specialty: specialty.trim() || null });
        toast.success("Profissional criado com sucesso!");
      } else if (professional) {
        await updateMutation.mutateAsync({
          id: professional.id,
          name,
          specialty: specialty.trim() || null,
        });
        toast.success("Profissional atualizado com sucesso!");
      }
      onClose();
    } catch (error) {
      toast.error(
        isCreating
          ? "Erro ao criar profissional"
          : "Erro ao atualizar profissional"
      );
    }
  };

  const handleDelete = async () => {
    if (!professional) return;

    try {
      await deleteMutation.mutateAsync(professional.id);
      toast.success("Profissional excluído com sucesso!");
      onClose();
    } catch (error) {
      toast.error("Erro ao excluir profissional");
    }
  };

  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 flex-shrink-0">
          <DialogTitle className="text-lg sm:text-xl md:text-2xl">
            {isCreating ? "Novo Profissional" : "Editar Profissional"}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {isCreating
              ? "Preencha o nome do profissional. O código será gerado automaticamente."
              : "Atualize as informações do profissional"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-6">
          <div className="space-y-4 sm:space-y-6 pb-4 sm:pb-6 pr-2 sm:pr-4">
            {professional && !isCreating && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    ID: {professional.id}
                  </span>
                </div>
                <Separator />
              </>
            )}

            <div className="space-y-4">
              <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Informações do Profissional
              </h3>
              <div className="space-y-4 ">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Dr Matheus"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isPending}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialty">Especialidade</Label>
                  <Input
                    id="specialty"
                    placeholder="Ex: Cardiologia, Dermatologia, Fisioterapia"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    disabled={isPending}
                    className="w-full"
                  />
                </div>

                {name !== "" && (
                  <div className="space-y-2">
                    <Label htmlFor="code" className="flex items-center gap-2">
                      <Code2 className="h-4 w-4" />
                      Código (gerado automaticamente)
                    </Label>
                    <Input
                      id="code"
                      value={generatedCode || "digite-o-nome-acima"}
                      disabled
                      className="font-mono text-sm bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      O código é gerado automaticamente: sem espaços, tudo em
                      minúsculas, separado por hífens
                    </p>
                  </div>
                )}
              </div>
            </div>

            {professional && !isCreating && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="font-semibold text-base sm:text-lg">
                    Informações Adicionais
                  </h3>
                  <div className="pl-0 sm:pl-7">
                    <p className="text-sm text-muted-foreground">
                      Cadastrado em
                    </p>
                    <p className="font-medium">
                      {formatDateTimeBR(professional.created_at)}
                    </p>
                  </div>
                </div>
              </>
            )}


          </div>
        </div>

        <DialogFooter className="px-4 sm:px-6 pb-4 sm:pb-6 pt-3 sm:pt-4 border-t flex-shrink-0">
          <div className="flex flex-col gap-2 sm:gap-3 w-full">
            {professional && !isCreating && (
              <Button
                variant="destructive"
                onClick={() => setIsConfirmingDelete(true)}
                disabled={isPending}
                className="gap-2 w-full sm:w-auto"
                size="sm"
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </Button>
            )}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 w-full sm:ml-auto">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isPending}
                className="w-full sm:w-auto order-2 sm:order-1"
                size="sm"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={isPending || !name.trim()}
                className="w-full sm:w-auto order-1 sm:order-2"
                size="sm"
              >
                {isPending ? "Salvando..." : isCreating ? "Criar" : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Delete Confirmation Alert Dialog */}
    <AlertDialog open={isConfirmingDelete} onOpenChange={setIsConfirmingDelete}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o profissional{" "}
            <strong>{professional?.name}</strong>? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending ? "Excluindo..." : "Confirmar Exclusão"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
  );
}
