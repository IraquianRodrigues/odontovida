/**
 * Component to visualize dental surface conditions
 * Shows indicators for the 5 dental faces: Vestibular, Lingual, Mesial, Distal, Oclusal
 */

import type { ToothSurfaceCondition } from '@/types/odontogram';
import { SURFACE_CONDITION_LABELS } from '@/types/odontogram';
import { cn } from '@/lib/utils';

interface ToothFacesProps {
  conditions: ToothSurfaceCondition[];
  className?: string;
}

/**
 * Maps surface codes to positions on the tooth
 * All positioned in upper half to avoid overlap with bottom number label
 */
const SURFACE_POSITIONS = {
  buccal: { top: '15%', left: '50%', transform: 'translateX(-50%)' }, // Vestibular (front) - top area
  lingual: { top: '60%', left: '50%', transform: 'translateX(-50%)' }, // Lingual (back) - upper-middle
  palatal: { top: '60%', left: '50%', transform: 'translateX(-50%)' }, // Palatal (back, upper) - upper-middle
  mesial: { top: '35%', left: '15%', transform: 'translateY(-50%)' }, // Mesial (toward center) - upper-middle left
  distal: { top: '35%', right: '15%', transform: 'translateY(-50%)' }, // Distal (away from center) - upper-middle right
  occlusal: { top: '25%', left: '50%', transform: 'translate(-50%, -50%)' }, // Oclusal (top/biting) - upper area
} as const;

const SURFACE_NAMES = {
  buccal: 'Vestibular',
  lingual: 'Lingual',
  palatal: 'Palatina',
  mesial: 'Mesial',
  distal: 'Distal',
  occlusal: 'Oclusal',
} as const;

export function ToothFaces({ conditions, className }: ToothFacesProps) {
  if (conditions.length === 0) return null;

  // Group conditions by surface
  const surfaceMap = new Map<string, ToothSurfaceCondition[]>();
  conditions.forEach(condition => {
    const existing = surfaceMap.get(condition.surface) || [];
    surfaceMap.set(condition.surface, [...existing, condition]);
  });

  return (
    <div className={cn('absolute inset-0 pointer-events-none', className)}>
      {Array.from(surfaceMap.entries()).map(([surface, surfaceConditions]) => {
        const position = SURFACE_POSITIONS[surface as keyof typeof SURFACE_POSITIONS];
        if (!position) return null;

        return (
          <div
            key={surface}
            className="absolute group/face"
            style={position}
          >
            {/* Surface indicator dot */}
            <div className="relative">
              <div className="w-2 h-2 bg-red-500 rounded-full border border-white shadow-sm animate-pulse" />
              
              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-[10px] rounded shadow-lg whitespace-nowrap opacity-0 group-hover/face:opacity-100 transition-opacity pointer-events-none z-50 border border-border">
                <div className="font-semibold">{SURFACE_NAMES[surface as keyof typeof SURFACE_NAMES]}</div>
                {surfaceConditions.map((cond, idx) => (
                  <div key={idx} className="text-muted-foreground">
                    {SURFACE_CONDITION_LABELS[cond.condition]}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
