"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { TreatmentPlansService } from "@/services/treatment-plans";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/get-error-message";
import type { CreateTreatmentPlanItemInput } from "@/types/treatment-plan";

interface TreatmentPlanFormProps {
  patientId: number;
  professionalId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormItem extends CreateTreatmentPlanItemInput {
  _key: string;
}

function generateKey() {
  return Math.random().toString(36).substring(2, 9);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

const COMMON_PROCEDURES = [
  { name: "Limpeza (Profilaxia)", price: 150 },
  { name: "Restauração em Resina", price: 250 },
  { name: "Tratamento de Canal", price: 800 },
  { name: "Extração Simples", price: 200 },
  { name: "Extração de Siso", price: 500 },
  { name: "Coroa Dentária", price: 1200 },
  { name: "Implante Dentário", price: 3500 },
  { name: "Clareamento Dental", price: 600 },
  { name: "Prótese Parcial", price: 1500 },
  { name: "Aplicação de Flúor", price: 80 },
];

export function TreatmentPlanForm({
  patientId,
  professionalId,
  onClose,
  onSuccess,
}: TreatmentPlanFormProps) {
  const [title, setTitle] = useState("Plano de Tratamento");
  const [notes, setNotes] = useState("");
  const [discount, setDiscount] = useState(0);
  const [items, setItems] = useState<FormItem[]>([
    {
      _key: generateKey(),
      procedure_name: "",
      tooth_number: null,
      price: 0,
      sort_order: 0,
    },
  ]);

  const createPlan = useMutation({
    mutationFn: () =>
      TreatmentPlansService.createPlan({
        client_id: patientId,
        professional_id: professionalId || 0,
        title,
        discount,
        notes: notes || undefined,
        items: items
          .filter((item) => item.procedure_name.trim())
          .map((item, index) => ({
            procedure_name: item.procedure_name,
            tooth_number: item.tooth_number || null,
            description: item.description,
            price: item.price,
            sort_order: index,
          })),
      }),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Plano de tratamento criado!");
        onSuccess();
      } else {
        toast.error(result.error || "Erro ao criar plano");
      }
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const addItem = () => {
    setItems([
      ...items,
      {
        _key: generateKey(),
        procedure_name: "",
        tooth_number: null,
        price: 0,
        sort_order: items.length,
      },
    ]);
  };

  const addCommonProcedure = (procedure: { name: string; price: number }) => {
    setItems([
      ...items,
      {
        _key: generateKey(),
        procedure_name: procedure.name,
        tooth_number: null,
        price: procedure.price,
        sort_order: items.length,
      },
    ]);
  };

  const removeItem = (key: string) => {
    if (items.length <= 1) return;
    setItems(items.filter((i) => i._key !== key));
  };

  const updateItem = (key: string, field: keyof FormItem, value: unknown) => {
    setItems(
      items.map((item) =>
        item._key === key ? { ...item, [field]: value } : item
      )
    );
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price || 0), 0);
  const total = Math.max(0, subtotal - discount);
  const validItems = items.filter((i) => i.procedure_name.trim()).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h2 className="text-2xl font-bold">Novo Plano de Tratamento</h2>
      </div>

      {/* Plan Info */}
      <div className="space-y-4 p-6 rounded-xl border bg-muted/30">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label className="text-sm font-semibold">Título do Plano</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Tratamento Completo"
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Quick Add */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-muted-foreground">
          Adicionar Procedimento Rápido
        </Label>
        <div className="flex flex-wrap gap-2">
          {COMMON_PROCEDURES.map((proc) => (
            <button
              key={proc.name}
              onClick={() => addCommonProcedure(proc)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border bg-card hover:bg-accent transition-colors"
            >
              {proc.name} — {formatCurrency(proc.price)}
            </button>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">Procedimentos</Label>
          <Button size="sm" variant="outline" onClick={addItem} className="gap-2">
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
        </div>

        {items.map((item, index) => (
          <div
            key={item._key}
            className="p-4 rounded-lg border bg-card space-y-3"
          >
            <div className="flex items-center gap-3">
              <GripVertical className="h-4 w-4 text-muted-foreground/50 cursor-grab" />
              <span className="text-sm font-bold text-muted-foreground w-6">
                {index + 1}.
              </span>
              <div className="flex-1 grid grid-cols-12 gap-3">
                <div className="col-span-5">
                  <Input
                    value={item.procedure_name}
                    onChange={(e) =>
                      updateItem(item._key, "procedure_name", e.target.value)
                    }
                    placeholder="Nome do procedimento"
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    value={item.tooth_number || ""}
                    onChange={(e) =>
                      updateItem(
                        item._key,
                        "tooth_number",
                        e.target.value ? parseInt(e.target.value) : null
                      )
                    }
                    placeholder="Dente"
                    min={11}
                    max={48}
                  />
                </div>
                <div className="col-span-3">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      R$
                    </span>
                    <Input
                      type="number"
                      value={item.price || ""}
                      onChange={(e) =>
                        updateItem(
                          item._key,
                          "price",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="0,00"
                      className="pl-10"
                      min={0}
                      step={0.01}
                    />
                  </div>
                </div>
                <div className="col-span-2 flex items-center justify-center">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeItem(item._key)}
                    disabled={items.length <= 1}
                    className="text-muted-foreground hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="pl-10">
              <Input
                value={item.description || ""}
                onChange={(e) =>
                  updateItem(item._key, "description", e.target.value)
                }
                placeholder="Descrição (opcional)"
                className="text-sm"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Discount & Notes */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-semibold">Desconto (R$)</Label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              R$
            </span>
            <Input
              type="number"
              value={discount || ""}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              placeholder="0,00"
              className="pl-10"
              min={0}
              step={0.01}
            />
          </div>
        </div>
        <div>
          <Label className="text-sm font-semibold">Observações</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Condições de pagamento, observações gerais..."
            className="mt-1 resize-none"
            rows={2}
          />
        </div>
      </div>

      {/* Summary */}
      <div className="p-6 rounded-xl border-2 border-foreground/10 bg-muted/50 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Subtotal ({validItems} procedimento{validItems !== 1 ? "s" : ""})
          </span>
          <span className="tabular-nums font-medium">{formatCurrency(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
            <span>Desconto</span>
            <span className="tabular-nums">-{formatCurrency(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-xl font-bold border-t pt-3">
          <span>Total</span>
          <span className="tabular-nums">{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          onClick={() => createPlan.mutate()}
          disabled={createPlan.isPending || validItems === 0}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {createPlan.isPending ? "Salvando..." : "Criar Plano"}
        </Button>
      </div>
    </div>
  );
}
