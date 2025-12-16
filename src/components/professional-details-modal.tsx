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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, Trash2, Code2 } from "lucide-react";
import type { ProfessionalRow } from "@/types/database.types";
import { formatDateTimeBR } from "@/lib/date-utils";
import { toast } from "sonner";
import {
  useCreateProfessional,
  useUpdateProfessional,
  useDeleteProfessional,
} from "@/services/professionals/use-professionals";
import { ProfessionalServicesManagement } from "./professional-services-management";

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0">
        <DialogHeader className="px-4 pt-6 pb-4">
          <DialogTitle className="text-xl sm:text-2xl">
            {isCreating ? "Novo Profissional" : "Editar Profissional"}
          </DialogTitle>
          <DialogDescription>
            {isCreating
              ? "Preencha o nome do profissional. O código será gerado automaticamente."
              : "Atualize as informações do profissional"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(85vh-240px)] px-6">
          <div className="space-y-6 pb-6 pr-4">
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

                <Separator />
                <ProfessionalServicesManagement professional={professional} />
              </>
            )}

            {isConfirmingDelete && professional && (
              <>
                <Separator />
                <div className="space-y-4 p-4 border border-destructive rounded-lg bg-destructive/5">
                  <p className="font-semibold text-destructive">
                    Confirmar exclusão
                  </p>
                  <p className="text-sm">
                    Tem certeza que deseja excluir o profissional{" "}
                    <strong>{professional.name}</strong>? Esta ação não pode ser
                    desfeita.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={isPending}
                      className="flex-1"
                    >
                      {deleteMutation.isPending
                        ? "Excluindo..."
                        : "Confirmar Exclusão"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsConfirmingDelete(false)}
                      disabled={isPending}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 pb-6 pt-4 border-t">
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            {professional && !isCreating && !isConfirmingDelete && (
              <Button
                variant="destructive"
                onClick={() => setIsConfirmingDelete(true)}
                disabled={isPending}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </Button>
            )}
            <div className="flex gap-2 flex-1 sm:ml-auto">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isPending}
                className="flex-1 sm:flex-none"
              >
                Cancelar
              </Button>
              {!isConfirmingDelete && (
                <Button
                  onClick={handleSave}
                  disabled={isPending || !name.trim()}
                  className="flex-1 sm:flex-none"
                >
                  {isPending ? "Salvando..." : isCreating ? "Criar" : "Salvar"}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
