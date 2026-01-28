"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  useBlockedSlots,
  useCreateBlockedSlot,
  useDeleteBlockedSlot,
} from "@/services/business-hours";

export function BlockedSlotsManager() {
  const { data: blockedSlots, isLoading } = useBlockedSlots();
  const createMutation = useCreateBlockedSlot();
  const deleteMutation = useDeleteBlockedSlot();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reason, setReason] = useState("");

  const handleCreate = async () => {
    if (!startDate || !startTime || !endDate || !endTime) {
      toast.error("Preencha todos os campos de data e hora");
      return;
    }

    const startDateTime = `${startDate}T${startTime}:00`;
    const endDateTime = `${endDate}T${endTime}:00`;

    if (new Date(startDateTime) >= new Date(endDateTime)) {
      toast.error("Data/hora de fim deve ser maior que a de início");
      return;
    }

    try {
      await createMutation.mutateAsync({
        start_time: startDateTime,
        end_time: endDateTime,
        reason: reason.trim() || undefined,
      });
      toast.success("Horário bloqueado com sucesso!");
      setIsDialogOpen(false);
      setStartDate("");
      setStartTime("");
      setEndDate("");
      setEndTime("");
      setReason("");
    } catch (error) {
      toast.error("Erro ao bloquear horário");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Bloqueio removido com sucesso!");
    } catch (error) {
      toast.error("Erro ao remover bloqueio");
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    try {
      return format(new Date(dateTimeString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return dateTimeString;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Sort by start time
  const sortedSlots = blockedSlots?.sort((a, b) => 
    new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {blockedSlots?.length || 0} bloqueio(s) ativo(s)
        </p>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Bloquear Horário
        </Button>
      </div>

      {sortedSlots && sortedSlots.length > 0 ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Início</TableHead>
                <TableHead>Fim</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSlots.map((slot) => (
                <TableRow key={slot.id}>
                  <TableCell className="font-medium">
                    {formatDateTime(slot.start_time)}
                  </TableCell>
                  <TableCell>
                    {formatDateTime(slot.end_time)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {slot.reason || "-"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(slot.id)}
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
          Nenhum horário bloqueado
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bloquear Horário</DialogTitle>
            <DialogDescription>
              Bloqueie um período específico temporariamente
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Data e Hora de Início</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Data e Hora de Fim</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Motivo (opcional)</Label>
              <Textarea
                id="reason"
                placeholder="Ex: Manutenção, Evento especial, Ausência"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
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
                  Bloqueando...
                </>
              ) : (
                "Bloquear"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
