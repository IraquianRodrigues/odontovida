"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Loader2, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  useHolidays,
  useCreateHoliday,
  useDeleteHoliday,
} from "@/services/business-hours";

export function HolidaysManager() {
  const { data: holidays, isLoading } = useHolidays();
  const createMutation = useCreateHoliday();
  const deleteMutation = useDeleteHoliday();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);

  const handleCreate = async () => {
    if (!date || !name.trim()) {
      toast.error("Preencha a data e o nome do feriado");
      return;
    }

    try {
      await createMutation.mutateAsync({
        date,
        name: name.trim(),
        is_recurring: isRecurring,
      });
      toast.success("Feriado adicionado com sucesso!");
      setIsDialogOpen(false);
      setDate("");
      setName("");
      setIsRecurring(false);
    } catch (error) {
      toast.error("Erro ao adicionar feriado");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Feriado removido com sucesso!");
    } catch (error) {
      toast.error("Erro ao remover feriado");
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString + "T00:00:00"), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Sort holidays by date
  const sortedHolidays = holidays?.sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {holidays?.length || 0} feriado(s) cadastrado(s)
        </p>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Feriado
        </Button>
      </div>

      {sortedHolidays && sortedHolidays.length > 0 ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedHolidays.map((holiday) => (
                <TableRow key={holiday.id}>
                  <TableCell className="font-medium">
                    {formatDate(holiday.date)}
                  </TableCell>
                  <TableCell>{holiday.name}</TableCell>
                  <TableCell>
                    <span className="text-xs px-2 py-1 rounded-full bg-muted">
                      {holiday.is_recurring ? "Recorrente" : "Único"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(holiday.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum feriado cadastrado
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Feriado</DialogTitle>
            <DialogDescription>
              Cadastre um feriado ou dia em que a clínica não funcionará
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nome do Feriado</Label>
              <Input
                id="name"
                placeholder="Ex: Natal, Ano Novo, Feriado Municipal"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="recurring"
                checked={isRecurring}
                onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
              />
              <Label
                htmlFor="recurring"
                className="text-sm font-normal cursor-pointer"
              >
                Recorrente anualmente (mesmo dia todos os anos)
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adicionando...
                </>
              ) : (
                "Adicionar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
