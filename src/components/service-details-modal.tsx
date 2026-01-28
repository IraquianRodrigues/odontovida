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
// import { ScrollArea } from "@/components/ui/scroll-area";
import { Briefcase, Trash2, Clock, Banknote } from "lucide-react";
import type { ServiceRow } from "@/types/database.types";
import { formatDateTimeBR } from "@/lib/date-utils";
import { toast } from "sonner";
import {
  useCreateService,
  useUpdateService,
  useDeleteService,
} from "@/services/services/use-services";

interface ServiceDetailsModalProps {
  service: ServiceRow | null;
  isCreating?: boolean;
  onClose: () => void;
}

export function ServiceDetailsModal({
  service,
  isCreating = false,
  onClose,
}: ServiceDetailsModalProps) {
  const [code, setCode] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [price, setPrice] = useState("");
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const createMutation = useCreateService();
  const updateMutation = useUpdateService();
  const deleteMutation = useDeleteService();

  useEffect(() => {
    if (service) {
      setCode(service.code);
      setDurationMinutes(service.duration_minutes.toString());
      setPrice(service.price ? service.price.toString() : "");
    } else if (isCreating) {
      setCode("");
      setDurationMinutes("");
      setPrice("");
    }
  }, [service, isCreating]);

  useEffect(() => {
    if (!service && !isCreating) {
      setIsConfirmingDelete(false);
    }
  }, [service, isCreating]);

  const isOpen = !!service || isCreating;

  const handleSave = async () => {
    if (!code.trim()) {
      toast.error("Por favor, preencha o código do serviço");
      return;
    }

    const duration = parseInt(durationMinutes);
    if (isNaN(duration) || duration <= 0) {
      toast.error("Por favor, informe uma duração válida em minutos");
      return;
    }

    const priceValue = price ? parseFloat(price) : null;

    try {
      if (isCreating) {
        await createMutation.mutateAsync({
          code: code.trim(),
          duration_minutes: duration,
          price: priceValue,
        });
        toast.success("Serviço criado com sucesso!");
      } else if (service) {
        await updateMutation.mutateAsync({
          id: service.id,
          code: code.trim(),
          duration_minutes: duration,
          price: priceValue,
        });
        toast.success("Serviço atualizado com sucesso!");
      }
      onClose();
    } catch (error) {
      toast.error(
        isCreating ? "Erro ao criar serviço" : "Erro ao atualizar serviço"
      );
    }
  };

  const handleDelete = async () => {
    if (!service) return;

    try {
      await deleteMutation.mutateAsync(service.id);
      toast.success("Serviço excluído com sucesso!");
      onClose();
    } catch (error) {
      toast.error("Erro ao excluir serviço");
    }
  };

  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 flex-shrink-0">
          <DialogTitle className="text-lg sm:text-xl md:text-2xl">
            {isCreating ? "Novo Serviço" : "Editar Serviço"}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {isCreating
              ? "Preencha as informações do serviço"
              : "Atualize as informações do serviço"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-6">
          <div className="space-y-4 sm:space-y-6 pb-4 sm:pb-6 pr-2 sm:pr-4">
            {service && !isCreating && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    ID: {service.id}
                  </span>
                </div>
                <Separator />
              </>
            )}

            <div className="space-y-4">
              <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Informações do Serviço
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Código do Serviço *</Label>
                  <Input
                    id="code"
                    placeholder="Ex: consulta-geral, exame-rotina"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    disabled={isPending}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use um código único para identificar o serviço
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Duração (em minutos) *
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    placeholder="Ex: 30, 45, 60"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    disabled={isPending}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Tempo estimado em minutos para realização do serviço
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="flex items-center gap-2">
                    <Banknote className="h-4 w-4" />
                    Valor (R$)
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Ex: 150.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    disabled={isPending}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Valor base do serviço (opcional)
                  </p>
                </div>
              </div>
            </div>

            {service && !isCreating && (
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
                      {formatDateTimeBR(service.created_at)}
                    </p>
                  </div>
                </div>
              </>
            )}


          </div>
        </div>

        <DialogFooter className="px-4 sm:px-6 pb-4 sm:pb-6 pt-3 sm:pt-4 border-t flex-shrink-0">
          <div className="flex flex-col gap-2 sm:gap-3 w-full">
            {service && !isCreating && (
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
                disabled={
                  isPending ||
                  !code.trim() ||
                  !durationMinutes ||
                  parseInt(durationMinutes) <= 0
                }
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
            Tem certeza que deseja excluir o serviço{" "}
            <strong>{service?.code}</strong>? Esta ação não pode ser desfeita.
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

