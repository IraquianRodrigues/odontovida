"use client";

import { useState } from "react";
import type { ToothRecordWithDetails } from "@/types/odontogram";
import { TOOTH_STATUS_COLORS, TOOTH_NAMES, getToothPosition } from "@/types/odontogram";
import { cn } from "@/lib/utils";

interface OdontogramViewerProps {
  teeth: ToothRecordWithDetails[];
  onToothClick: (tooth: ToothRecordWithDetails) => void;
}

export function OdontogramViewer({ teeth, onToothClick }: OdontogramViewerProps) {
  const [hoveredTooth, setHoveredTooth] = useState<number | null>(null);

  // Organize teeth by quadrant
  const quadrants = {
    1: teeth.filter(t => Math.floor(t.tooth_number / 10) === 1).sort((a, b) => a.tooth_number - b.tooth_number),
    2: teeth.filter(t => Math.floor(t.tooth_number / 10) === 2).sort((a, b) => b.tooth_number - a.tooth_number),
    3: teeth.filter(t => Math.floor(t.tooth_number / 10) === 3).sort((a, b) => b.tooth_number - a.tooth_number),
    4: teeth.filter(t => Math.floor(t.tooth_number / 10) === 4).sort((a, b) => a.tooth_number - b.tooth_number),
  };

  const renderTooth = (tooth: ToothRecordWithDetails) => {
    const isHovered = hoveredTooth === tooth.tooth_number;
    const color = TOOTH_STATUS_COLORS[tooth.status];
    const hasConditions = tooth.surface_conditions.length > 0;

    return (
      <div
        key={tooth.id}
        className="relative group"
        onMouseEnter={() => setHoveredTooth(tooth.tooth_number)}
        onMouseLeave={() => setHoveredTooth(null)}
      >
        {/* Tooth visual */}
        <button
          onClick={() => onToothClick(tooth)}
          className={cn(
            "relative w-12 h-16 rounded-lg transition-all duration-200",
            "border-2 flex flex-col items-center justify-center",
            "hover:scale-110 hover:shadow-lg hover:z-10",
            isHovered && "scale-110 shadow-lg z-10"
          )}
          style={{
            backgroundColor: color,
            borderColor: hasConditions ? "#ef4444" : color,
            borderWidth: hasConditions ? "3px" : "2px",
          }}
        >
          {/* Tooth number */}
          <span className="text-xs font-bold text-white drop-shadow-md">
            {tooth.tooth_number}
          </span>
          
          {/* Condition indicator */}
          {hasConditions && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
          )}
        </button>

        {/* Tooltip */}
        {isHovered && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-xs rounded-lg shadow-lg whitespace-nowrap z-50 border border-border">
            <div className="font-semibold">{TOOTH_NAMES[tooth.tooth_number]}</div>
            <div className="text-muted-foreground mt-1">
              Status: {tooth.status}
            </div>
            {hasConditions && (
              <div className="text-red-500 mt-1">
                {tooth.surface_conditions.length} condição(ões)
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-8">
      {/* Upper Jaw */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-center text-muted-foreground">
          Arcada Superior
        </h3>
        
        <div className="flex justify-center gap-8">
          {/* Upper Right (Quadrant 1) */}
          <div className="flex gap-2">
            {quadrants[1].map(renderTooth)}
          </div>

          {/* Center line */}
          <div className="w-px bg-border" />

          {/* Upper Left (Quadrant 2) */}
          <div className="flex gap-2">
            {quadrants[2].map(renderTooth)}
          </div>
        </div>
      </div>

      {/* Divider */}
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

      {/* Lower Jaw */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-center text-muted-foreground">
          Arcada Inferior
        </h3>
        
        <div className="flex justify-center gap-8">
          {/* Lower Right (Quadrant 4) */}
          <div className="flex gap-2">
            {quadrants[4].map(renderTooth)}
          </div>

          {/* Center line */}
          <div className="w-px bg-border" />

          {/* Lower Left (Quadrant 3) */}
          <div className="flex gap-2">
            {quadrants[3].map(renderTooth)}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 p-4 bg-muted/30 rounded-lg">
        <h4 className="font-semibold mb-3 text-sm">Legenda de Status</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border border-border" style={{ backgroundColor: '#10b981' }} />
            <span className="text-xs">Saudável</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border border-border" style={{ backgroundColor: '#f59e0b' }} />
            <span className="text-xs">Cárie</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border border-border" style={{ backgroundColor: '#3b82f6' }} />
            <span className="text-xs">Restaurado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border border-border" style={{ backgroundColor: '#6b7280' }} />
            <span className="text-xs">Ausente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border border-border" style={{ backgroundColor: '#8b5cf6' }} />
            <span className="text-xs">Canal Tratado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border border-border" style={{ backgroundColor: '#06b6d4' }} />
            <span className="text-xs">Coroa</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border border-border" style={{ backgroundColor: '#14b8a6' }} />
            <span className="text-xs">Implante</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border border-border" style={{ backgroundColor: '#0ea5e9' }} />
            <span className="text-xs">Ponte</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border border-border" style={{ backgroundColor: '#ef4444' }} />
            <span className="text-xs">Extração Necessária</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border border-border" style={{ backgroundColor: '#f97316' }} />
            <span className="text-xs">Fraturado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border border-border" style={{ backgroundColor: '#a3a3a3' }} />
            <span className="text-xs">Desgastado</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span>Indica presença de condições nas faces do dente</span>
          </div>
        </div>
      </div>
    </div>
  );
}
