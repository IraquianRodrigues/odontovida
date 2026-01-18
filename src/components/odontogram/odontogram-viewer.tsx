"use client";

import { useState } from "react";
import type { ToothRecordWithDetails } from "@/types/odontogram";
import { TOOTH_STATUS_COLORS, TOOTH_NAMES, TOOTH_STATUS_LABELS, getToothPosition } from "@/types/odontogram";
import { cn } from "@/lib/utils";
import { ToothIcon } from "./tooth-svg";
import { getToothType, getToothOrientation, getToothDescription } from "./tooth-utils";
import { ToothFaces } from "./tooth-faces";

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
    const toothType = getToothType(tooth.tooth_number);
    const orientation = getToothOrientation(tooth.tooth_number);
    const description = getToothDescription(tooth.tooth_number);

    return (
      <div
        key={tooth.id}
        className="relative group"
        onMouseEnter={() => setHoveredTooth(tooth.tooth_number)}
        onMouseLeave={() => setHoveredTooth(null)}
      >
        {/* Tooth visual with SVG */}
        <button
          onClick={() => onToothClick(tooth)}
          className={cn(
            "relative w-14 h-18 rounded-lg transition-all duration-300",
            "flex flex-col items-center justify-center",
            "hover:scale-105 hover:shadow-xl hover:z-10",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            isHovered && "scale-105 shadow-xl z-10"
          )}
        >
          {/* SVG Tooth Icon */}
          <div className="w-full h-full p-1">
            <ToothIcon
              type={toothType}
              color={color}
              orientation={orientation}
              className="w-full h-full"
            />
          </div>

          {/* Tooth number label */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-bold border border-border shadow-sm">
            {tooth.tooth_number}
          </div>

          {/* Face condition indicators */}
          {hasConditions && (
            <ToothFaces conditions={tooth.surface_conditions} />
          )}
        </button>

        {/* Enhanced Tooltip */}
        {isHovered && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-3 bg-popover text-popover-foreground text-xs rounded-lg shadow-xl whitespace-nowrap z-50 border border-border min-w-[200px]">
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
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 space-y-6">
      {/* Upper Jaw */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-center text-muted-foreground">
          Arcada Superior
        </h3>
        
        <div className="flex justify-center gap-6">
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
        
        <div className="flex justify-center gap-6">
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
