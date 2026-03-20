"use client";

import { useState } from "react";
import type { ToothRecordWithDetails } from "@/types/odontogram";
import { TOOTH_STATUS_COLORS, TOOTH_STATUS_LABELS, TREATMENT_TYPE_LABELS } from "@/types/odontogram";
import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ToothIcon } from "./tooth-svg";
import { getToothType, getToothOrientation, getToothDescription } from "./tooth-utils";
import { ToothFaces } from "./tooth-faces";

interface OdontogramViewerProps {
  teeth: ToothRecordWithDetails[];
  onToothClick: (tooth: ToothRecordWithDetails) => void;
}

export function OdontogramViewer({ teeth, onToothClick }: OdontogramViewerProps) {
  const [hoveredTooth, setHoveredTooth] = useState<number | null>(null);

  const quadrants = {
    1: teeth.filter(t => Math.floor(t.tooth_number / 10) === 1).sort((a, b) => a.tooth_number - b.tooth_number),
    2: teeth.filter(t => Math.floor(t.tooth_number / 10) === 2).sort((a, b) => b.tooth_number - a.tooth_number),
    3: teeth.filter(t => Math.floor(t.tooth_number / 10) === 3).sort((a, b) => b.tooth_number - a.tooth_number),
    4: teeth.filter(t => Math.floor(t.tooth_number / 10) === 4).sort((a, b) => a.tooth_number - b.tooth_number),
  };
  const legendItems = Object.entries(TOOTH_STATUS_LABELS) as Array<[keyof typeof TOOTH_STATUS_LABELS, string]>;

  const renderTooth = (tooth: ToothRecordWithDetails) => {
    const isHovered = hoveredTooth === tooth.tooth_number;
    const color = TOOTH_STATUS_COLORS[tooth.status];
    const hasConditions = tooth.surface_conditions.length > 0;
    const toothType = getToothType(tooth.tooth_number);
    const orientation = getToothOrientation(tooth.tooth_number);
    const description = getToothDescription(tooth.tooth_number);
    const lastTreatment = tooth.treatment_history[0];

    return (
      <div
        key={tooth.id}
        className="relative group"
        onMouseEnter={() => setHoveredTooth(tooth.tooth_number)}
        onMouseLeave={() => setHoveredTooth(null)}
      >
        <button
          onClick={() => onToothClick(tooth)}
          className={cn(
            "relative w-14 h-18 rounded-xl transition-all duration-300 ease-out",
            "flex flex-col items-center justify-center",
            "hover:scale-[1.08] hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(0,0,0,0.2)] hover:z-10",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            isHovered && "scale-[1.08] -translate-y-0.5 shadow-[0_12px_28px_rgba(0,0,0,0.2)] z-10 bg-muted/30"
          )}
        >
          <div className="w-full h-full p-1.5">
            <ToothIcon
              type={toothType}
              color={color}
              orientation={orientation}
              className="w-full h-full"
            />
          </div>

          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm px-1.5 py-0.5 rounded-md text-[10px] font-bold border border-border shadow-sm">
            {tooth.tooth_number}
          </div>

          {hasConditions && (
            <ToothFaces conditions={tooth.surface_conditions} />
          )}
        </button>

        {isHovered && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-3 bg-popover text-popover-foreground text-xs rounded-lg shadow-xl whitespace-nowrap z-50 border border-border min-w-[220px]">
            <div className="font-bold text-sm mb-1">{description}</div>
            <div className="flex items-center gap-2 mt-2">
              <div 
                className="w-3 h-3 rounded-full border border-border" 
                style={{ backgroundColor: color }}
              />
              <span className="text-muted-foreground">
                {TOOTH_STATUS_LABELS[tooth.status]}
              </span>
            </div>
            {hasConditions && (
              <div className="mt-2 pt-2 border-t border-border">
                <div className="text-red-500 font-semibold mb-1">
                  {tooth.surface_conditions.length} condição(ões)
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Clique para ver detalhes
                </div>
              </div>
            )}
            {lastTreatment && (
              <div className="mt-2 pt-2 border-t border-border">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Último procedimento
                </div>
                <div className="text-[11px] font-semibold">
                  {TREATMENT_TYPE_LABELS[lastTreatment.treatment_type]}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {new Date(lastTreatment.performed_at).toLocaleDateString("pt-BR")}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-2 sm:p-4 space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-center text-muted-foreground tracking-wide">
          Arcada Superior
        </h3>
        <div className="overflow-x-auto pb-1">
          <div className="min-w-[680px] flex justify-center gap-6">
            <div className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-3">
              <div className="mb-2 text-center text-[11px] font-semibold text-muted-foreground">Q1</div>
              <div className="flex gap-2">
                {quadrants[1].map(renderTooth)}
              </div>
            </div>
            <div className="w-px bg-border" />
            <div className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-3">
              <div className="mb-2 text-center text-[11px] font-semibold text-muted-foreground">Q2</div>
              <div className="flex gap-2">
                {quadrants[2].map(renderTooth)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t-2 border-dashed border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-4 text-sm text-muted-foreground font-medium">
            Linha Média
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-center text-muted-foreground tracking-wide">
          Arcada Inferior
        </h3>
        <div className="overflow-x-auto pb-1">
          <div className="min-w-[680px] flex justify-center gap-6">
            <div className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-3">
              <div className="mb-2 text-center text-[11px] font-semibold text-muted-foreground">Q4</div>
              <div className="flex gap-2">
                {quadrants[4].map(renderTooth)}
              </div>
            </div>
            <div className="w-px bg-border" />
            <div className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-3">
              <div className="mb-2 text-center text-[11px] font-semibold text-muted-foreground">Q3</div>
              <div className="flex gap-2">
                {quadrants[3].map(renderTooth)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 rounded-2xl border border-border/60 bg-muted/20 px-5">
        <Accordion type="single" collapsible>
          <AccordionItem value="legend" className="border-none">
            <AccordionTrigger className="text-sm font-semibold py-3">
              Legenda de Status
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {legendItems.map(([status, label]) => (
                  <div key={status} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded border border-border"
                      style={{ backgroundColor: TOOTH_STATUS_COLORS[status] }}
                    />
                    <span className="text-xs">{label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <span>Indica presença de condições nas faces do dente</span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
