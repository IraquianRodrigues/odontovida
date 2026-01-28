"use client";

import { useState } from "react";
import {
  useBlockedSlots,
  useCreateBlockedSlot,
  useDeleteBlockedSlot,
} from "@/services/business-hours";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Trash2, Ban } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function BlockedSlotsManager() {
  const { data: blockedSlots, isLoading } = useBlockedSlots();
  const createBlockedSlot = useCreateBlockedSlot();
  const deleteBlockedSlot = useDeleteBlockedSlot();
  const { toast } = useToast();

  const [newSlot, setNewSlot] = useState({
    date: "",
    start_time: "09:00",
    end_time: "10:00",
    reason: "",
  });

  const handleCreate = async () => {
    if (!newSlot.date) {
      toast({
        title: "Data obrigatória",
        description: "Selecione a data do bloqueio",
        variant: "destructive",
      });
      return;
    }

    try {
      // Combinar data e horário em ISO string
      const startDateTime = `${newSlot.date}T${newSlot.start_time}:00`;
      const endDateTime = `${newSlot.date}T${newSlot.end_time}:00`;

      await createBlockedSlot.mutateAsync({
        start_time: startDateTime,
        end_time: endDateTime,
        reason: newSlot.reason || undefined,
      });

      toast({
        title: "Bloqueio criado",
        description: "Horário bloqueado com sucesso",
      });

      // Reset form
      setNewSlot({
        date: "",
        start_time: "09:00",
        end_time: "10:00",
        reason: "",
      });
    } catch (error) {
      toast({
        title: "Erro ao criar bloqueio",
        description: "Não foi possível criar o bloqueio. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteBlockedSlot.mutateAsync(id);
      toast({
        title: "Bloqueio removido",
        description: "Bloqueio removido com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover o bloqueio. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Lista de bloqueios */}
      {blockedSlots && blockedSlots.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Bloqueios Cadastrados</h3>
          <div className="space-y-2">
            {blockedSlots.map((slot) => {
              const startDate = new Date(slot.start_time);
              const endDate = new Date(slot.end_time);

              return (
                <div
                  key={slot.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Ban className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">
                        {format(startDate, "dd 'de' MMMM 'de' yyyy", {
                          locale: ptBR,
                        })}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(startDate, "HH:mm")} - {format(endDate, "HH:mm")}
                        {slot.reason && ` • ${slot.reason}`}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(slot.id)}
                    disabled={deleteBlockedSlot.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Formulário para novo bloqueio */}
      <div className="border-t pt-6">
        <h3 className="text-sm font-medium mb-4">Adicionar Novo Bloqueio</h3>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Data</Label>
            <Input
              type="date"
              value={newSlot.date}
              onChange={(e) =>
                setNewSlot((prev) => ({ ...prev, date: e.target.value }))
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Início</Label>
              <Input
                type="time"
                value={newSlot.start_time}
                onChange={(e) =>
                  setNewSlot((prev) => ({ ...prev, start_time: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Fim</Label>
              <Input
                type="time"
                value={newSlot.end_time}
                onChange={(e) =>
                  setNewSlot((prev) => ({ ...prev, end_time: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Motivo (opcional)</Label>
            <Input
              placeholder="Ex: Manutenção, Reunião, Evento"
              value={newSlot.reason}
              onChange={(e) =>
                setNewSlot((prev) => ({ ...prev, reason: e.target.value }))
              }
            />
          </div>

          <Button
            onClick={handleCreate}
            disabled={createBlockedSlot.isPending}
            className="w-full"
          >
            {createBlockedSlot.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Bloqueio
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
