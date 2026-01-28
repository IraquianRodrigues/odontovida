"use client";

import { useState } from "react";
import { useBreaks, useCreateBreak, useDeleteBreak } from "@/services/business-hours";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DAYS_OF_WEEK = [
  { value: "0", label: "Domingo" },
  { value: "1", label: "Segunda-feira" },
  { value: "2", label: "Terça-feira" },
  { value: "3", label: "Quarta-feira" },
  { value: "4", label: "Quinta-feira" },
  { value: "5", label: "Sexta-feira" },
  { value: "6", label: "Sábado" },
];

export function BreaksManager() {
  const { data: breaks, isLoading } = useBreaks();
  const createBreak = useCreateBreak();
  const deleteBreak = useDeleteBreak();
  const { toast } = useToast();

  const [newBreak, setNewBreak] = useState({
    day_of_week: "1",
    break_start: "12:00",
    break_end: "13:00",
    description: "Almoço",
  });

  const handleCreate = async () => {
    try {
      await createBreak.mutateAsync({
        day_of_week: parseInt(newBreak.day_of_week),
        break_start: newBreak.break_start,
        break_end: newBreak.break_end,
        description: newBreak.description,
      });

      toast({
        title: "Intervalo criado",
        description: "Intervalo adicionado com sucesso",
      });

      // Reset form
      setNewBreak({
        day_of_week: "1",
        break_start: "12:00",
        break_end: "13:00",
        description: "Almoço",
      });
    } catch (error) {
      toast({
        title: "Erro ao criar intervalo",
        description: "Não foi possível criar o intervalo. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteBreak.mutateAsync(id);
      toast({
        title: "Intervalo removido",
        description: "Intervalo removido com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover o intervalo. Tente novamente.",
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
      {/* Lista de intervalos existentes */}
      {breaks && breaks.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Intervalos Cadastrados</h3>
          <div className="space-y-2">
            {breaks.map((breakItem) => (
              <div
                key={breakItem.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium">
                    {DAYS_OF_WEEK[breakItem.day_of_week].label}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {breakItem.break_start} - {breakItem.break_end}
                    {breakItem.description && ` • ${breakItem.description}`}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(breakItem.id)}
                  disabled={deleteBreak.isPending}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formulário para novo intervalo */}
      <div className="border-t pt-6">
        <h3 className="text-sm font-medium mb-4">Adicionar Novo Intervalo</h3>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Dia da Semana</Label>
            <Select
              value={newBreak.day_of_week}
              onValueChange={(value) =>
                setNewBreak((prev) => ({ ...prev, day_of_week: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAYS_OF_WEEK.map((day) => (
                  <SelectItem key={day.value} value={day.value}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Início</Label>
              <Input
                type="time"
                value={newBreak.break_start}
                onChange={(e) =>
                  setNewBreak((prev) => ({ ...prev, break_start: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Fim</Label>
              <Input
                type="time"
                value={newBreak.break_end}
                onChange={(e) =>
                  setNewBreak((prev) => ({ ...prev, break_end: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Descrição (opcional)</Label>
            <Input
              placeholder="Ex: Almoço, Pausa"
              value={newBreak.description}
              onChange={(e) =>
                setNewBreak((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </div>

          <Button
            onClick={handleCreate}
            disabled={createBreak.isPending}
            className="w-full"
          >
            {createBreak.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Intervalo
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
