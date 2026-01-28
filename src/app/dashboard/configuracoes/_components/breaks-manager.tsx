"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  useBreaks,
  useCreateBreak,
  useDeleteBreak,
} from "@/services/business-hours";

const DAYS_OF_WEEK = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
  { value: 6, label: "Sábado" },
];

export function BreaksManager() {
  const { data: breaks, isLoading } = useBreaks();
  const createMutation = useCreateBreak();
  const deleteMutation = useDeleteBreak();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dayOfWeek, setDayOfWeek] = useState<string>("1");
  const [breakStart, setBreakStart] = useState("12:00");
  const [breakEnd, setBreakEnd] = useState("13:00");
  const [description, setDescription] = useState("");

  const handleCreate = async () => {
    if (!breakStart || !breakEnd) {
      toast.error("Preencha os horários de início e fim");
      return;
    }

    if (breakStart >= breakEnd) {
      toast.error("Horário de fim deve ser maior que o de início");
      return;
    }

    try {
      await createMutation.mutateAsync({
        day_of_week: parseInt(dayOfWeek),
        break_start: breakStart,
        break_end: breakEnd,
        description: description.trim() || undefined,
      });
      toast.success("Intervalo adicionado com sucesso!");
      setIsDialogOpen(false);
      setDayOfWeek("1");
      setBreakStart("12:00");
      setBreakEnd("13:00");
      setDescription("");
    } catch (error) {
      toast.error("Erro ao adicionar intervalo");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Intervalo removido com sucesso!");
    } catch (error) {
      toast.error("Erro ao remover intervalo");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {breaks?.length || 0} intervalo(s) cadastrado(s)
        </p>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Intervalo
        </Button>
      </div>

      {breaks && breaks.length > 0 ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dia da Semana</TableHead>
                <TableHead>Horário</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {breaks.map((breakItem) => (
                <TableRow key={breakItem.id}>
                  <TableCell className="font-medium">
                    {DAYS_OF_WEEK.find((d) => d.value === breakItem.day_of_week)?.label}
                  </TableCell>
                  <TableCell>
                    {breakItem.break_start} - {breakItem.break_end}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {breakItem.description || "-"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(breakItem.id)}
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
          Nenhum intervalo cadastrado
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Intervalo</DialogTitle>
            <DialogDescription>
              Configure um intervalo (pausa, almoço, etc.) durante o expediente
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="day">Dia da Semana</Label>
              <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                <SelectTrigger id="day">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((day) => (
                    <SelectItem key={day.value} value={day.value.toString()}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start">Início</Label>
                <Input
                  id="start"
                  type="time"
                  value={breakStart}
                  onChange={(e) => setBreakStart(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end">Fim</Label>
                <Input
                  id="end"
                  type="time"
                  value={breakEnd}
                  onChange={(e) => setBreakEnd(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Input
                id="description"
                placeholder="Ex: Almoço, Pausa para café"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
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
