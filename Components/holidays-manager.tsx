"use client";

import { useState } from "react";
import { useHolidays, useCreateHoliday, useDeleteHoliday } from "@/services/business-hours";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Plus, Trash2, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function HolidaysManager() {
  const { data: holidays, isLoading } = useHolidays();
  const createHoliday = useCreateHoliday();
  const deleteHoliday = useDeleteHoliday();
  const { toast } = useToast();

  const [newHoliday, setNewHoliday] = useState({
    date: "",
    name: "",
    is_recurring: false,
  });

  const handleCreate = async () => {
    if (!newHoliday.date || !newHoliday.name) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha a data e o nome do feriado",
        variant: "destructive",
      });
      return;
    }

    try {
      await createHoliday.mutateAsync(newHoliday);

      toast({
        title: "Feriado cadastrado",
        description: "Feriado adicionado com sucesso",
      });

      // Reset form
      setNewHoliday({
        date: "",
        name: "",
        is_recurring: false,
      });
    } catch (error) {
      toast({
        title: "Erro ao cadastrar",
        description: "Não foi possível cadastrar o feriado. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteHoliday.mutateAsync(id);
      toast({
        title: "Feriado removido",
        description: "Feriado removido com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover o feriado. Tente novamente.",
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
      {/* Lista de feriados */}
      {holidays && holidays.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Feriados Cadastrados</h3>
          <div className="space-y-2">
            {holidays.map((holiday) => (
              <div
                key={holiday.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{holiday.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(holiday.date + "T00:00:00"), "dd 'de' MMMM 'de' yyyy", {
                        locale: ptBR,
                      })}
                      {holiday.is_recurring && " • Recorrente"}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(holiday.id)}
                  disabled={deleteHoliday.isPending}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formulário para novo feriado */}
      <div className="border-t pt-6">
        <h3 className="text-sm font-medium mb-4">Adicionar Novo Feriado</h3>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Nome do Feriado</Label>
            <Input
              placeholder="Ex: Natal, Ano Novo, Férias"
              value={newHoliday.name}
              onChange={(e) =>
                setNewHoliday((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>

          <div className="grid gap-2">
            <Label>Data</Label>
            <Input
              type="date"
              value={newHoliday.date}
              onChange={(e) =>
                setNewHoliday((prev) => ({ ...prev, date: e.target.value }))
              }
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="recurring"
              checked={newHoliday.is_recurring}
              onCheckedChange={(checked) =>
                setNewHoliday((prev) => ({
                  ...prev,
                  is_recurring: checked === true,
                }))
              }
            />
            <Label
              htmlFor="recurring"
              className="text-sm font-normal cursor-pointer"
            >
              Feriado recorrente (repete todo ano)
            </Label>
          </div>

          <Button
            onClick={handleCreate}
            disabled={createHoliday.isPending}
            className="w-full"
          >
            {createHoliday.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Feriado
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
