// =====================================================
// ODONTOGRAM TYPES
// =====================================================
// Type definitions for the digital odontogram system

/**
 * FDI Tooth Numbering System
 * Permanent teeth: 11-48
 * Deciduous teeth: 51-85
 */
export type ToothNumber = number;

/**
 * Tooth type classification
 */
export type ToothType = 'permanent' | 'deciduous';

/**
 * Tooth status options
 */
export type ToothStatus =
  | 'healthy'
  | 'cavity'
  | 'filled'
  | 'missing'
  | 'root_canal'
  | 'crown'
  | 'implant'
  | 'bridge'
  | 'extraction_needed'
  | 'fractured'
  | 'worn';

/**
 * Tooth surface positions
 */
export type ToothSurface =
  | 'occlusal'   // Mastigação (topo)
  | 'mesial'     // Frente (próximo ao centro)
  | 'distal'     // Trás (afastado do centro)
  | 'buccal'     // Externa (lado da bochecha)
  | 'lingual'    // Interna (lado da língua)
  | 'palatal';   // Palatina (céu da boca - dentes superiores)

/**
 * Surface condition types
 */
export type SurfaceCondition =
  | 'cavity'
  | 'filling'
  | 'fracture'
  | 'wear'
  | 'stain'
  | 'erosion'
  | 'abrasion';

/**
 * Restoration materials
 */
export type RestorationMaterial =
  | 'amalgam'
  | 'composite'
  | 'ceramic'
  | 'gold'
  | 'porcelain'
  | 'resin'
  | 'glass_ionomer';

/**
 * Condition severity levels
 */
export type ConditionSeverity = 'mild' | 'moderate' | 'severe';

/**
 * Treatment types
 */
export type TreatmentType =
  | 'extraction'
  | 'filling'
  | 'root_canal'
  | 'crown'
  | 'cleaning'
  | 'scaling'
  | 'whitening'
  | 'implant'
  | 'bridge'
  | 'veneer'
  | 'sealant';

// =====================================================
// DATABASE MODELS
// =====================================================

/**
 * Main odontogram record
 */
export interface Odontogram {
  id: string;
  patient_id: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

/**
 * Individual tooth record
 */
export interface ToothRecord {
  id: string;
  odontogram_id: string;
  tooth_number: ToothNumber;
  tooth_type: ToothType;
  status: ToothStatus;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Tooth surface condition
 */
export interface ToothSurfaceCondition {
  id: string;
  tooth_record_id: string;
  surface: ToothSurface;
  condition: SurfaceCondition;
  material?: RestorationMaterial | null;
  severity?: ConditionSeverity | null;
  created_by: string;
  created_at: string;
}

/**
 * Treatment history record
 */
export interface ToothTreatmentHistory {
  id: string;
  tooth_record_id: string;
  treatment_type: TreatmentType;
  description?: string | null;
  performed_by: string;
  performed_at: string;
  cost?: number | null;
  notes?: string | null;
}

// =====================================================
// EXTENDED MODELS WITH RELATIONS
// =====================================================

/**
 * Tooth record with all related data
 */
export interface ToothRecordWithDetails extends ToothRecord {
  surface_conditions: ToothSurfaceCondition[];
  treatment_history: ToothTreatmentHistory[];
}

/**
 * Complete odontogram with all teeth and details
 */
export interface OdontogramWithTeeth extends Odontogram {
  teeth: ToothRecordWithDetails[];
  patient?: {
    id: number;
    nome: string;
  };
}

// =====================================================
// INPUT TYPES FOR MUTATIONS
// =====================================================

/**
 * Input for creating a new odontogram
 */
export interface CreateOdontogramInput {
  patient_id: number;
}

/**
 * Input for updating tooth status
 */
export interface UpdateToothStatusInput {
  tooth_record_id: string;
  status: ToothStatus;
  notes?: string;
}

/**
 * Input for adding surface condition
 */
export interface AddSurfaceConditionInput {
  tooth_record_id: string;
  surface: ToothSurface;
  condition: SurfaceCondition;
  material?: RestorationMaterial;
  severity?: ConditionSeverity;
}

/**
 * Input for adding treatment history
 */
export interface AddTreatmentHistoryInput {
  tooth_record_id: string;
  treatment_type: TreatmentType;
  description?: string;
  cost?: number;
  notes?: string;
}

// =====================================================
// UI HELPER TYPES
// =====================================================

/**
 * Tooth position in the mouth (for UI rendering)
 */
export interface ToothPosition {
  quadrant: 1 | 2 | 3 | 4; // 1=UR, 2=UL, 3=LL, 4=LR
  position: number; // 1-8 within quadrant
  isUpper: boolean;
  isRight: boolean;
}

/**
 * Color mapping for tooth status (for UI)
 */
export const TOOTH_STATUS_COLORS: Record<ToothStatus, string> = {
  healthy: '#10b981', // green
  cavity: '#f59e0b', // amber
  filled: '#3b82f6', // blue
  missing: '#6b7280', // gray
  root_canal: '#8b5cf6', // purple
  crown: '#06b6d4', // cyan
  implant: '#14b8a6', // teal
  bridge: '#0ea5e9', // sky
  extraction_needed: '#ef4444', // red
  fractured: '#f97316', // orange
  worn: '#a3a3a3', // neutral
};

/**
 * Display labels for tooth status
 */
export const TOOTH_STATUS_LABELS: Record<ToothStatus, string> = {
  healthy: 'Saudável',
  cavity: 'Cárie',
  filled: 'Restaurado',
  missing: 'Ausente',
  root_canal: 'Canal Tratado',
  crown: 'Coroa',
  implant: 'Implante',
  bridge: 'Ponte',
  extraction_needed: 'Extração Necessária',
  fractured: 'Fraturado',
  worn: 'Desgastado',
};

/**
 * Display labels for tooth surfaces
 */
export const TOOTH_SURFACE_LABELS: Record<ToothSurface, string> = {
  occlusal: 'Oclusal (Mastigação)',
  mesial: 'Mesial (Frente)',
  distal: 'Distal (Trás)',
  buccal: 'Vestibular (Externa)',
  lingual: 'Lingual (Interna)',
  palatal: 'Palatina (Céu da Boca)',
};

/**
 * FDI tooth number to name mapping (Portuguese)
 */
export const TOOTH_NAMES: Record<number, string> = {
  // Upper Right (Quadrant 1)
  11: 'Incisivo Central Superior Direito',
  12: 'Incisivo Lateral Superior Direito',
  13: 'Canino Superior Direito',
  14: 'Primeiro Pré-Molar Superior Direito',
  15: 'Segundo Pré-Molar Superior Direito',
  16: 'Primeiro Molar Superior Direito',
  17: 'Segundo Molar Superior Direito',
  18: 'Terceiro Molar Superior Direito (Siso)',
  
  // Upper Left (Quadrant 2)
  21: 'Incisivo Central Superior Esquerdo',
  22: 'Incisivo Lateral Superior Esquerdo',
  23: 'Canino Superior Esquerdo',
  24: 'Primeiro Pré-Molar Superior Esquerdo',
  25: 'Segundo Pré-Molar Superior Esquerdo',
  26: 'Primeiro Molar Superior Esquerdo',
  27: 'Segundo Molar Superior Esquerdo',
  28: 'Terceiro Molar Superior Esquerdo (Siso)',
  
  // Lower Left (Quadrant 3)
  31: 'Incisivo Central Inferior Esquerdo',
  32: 'Incisivo Lateral Inferior Esquerdo',
  33: 'Canino Inferior Esquerdo',
  34: 'Primeiro Pré-Molar Inferior Esquerdo',
  35: 'Segundo Pré-Molar Inferior Esquerdo',
  36: 'Primeiro Molar Inferior Esquerdo',
  37: 'Segundo Molar Inferior Esquerdo',
  38: 'Terceiro Molar Inferior Esquerdo (Siso)',
  
  // Lower Right (Quadrant 4)
  41: 'Incisivo Central Inferior Direito',
  42: 'Incisivo Lateral Inferior Direito',
  43: 'Canino Inferior Direito',
  44: 'Primeiro Pré-Molar Inferior Direito',
  45: 'Segundo Pré-Molar Inferior Direito',
  46: 'Primeiro Molar Inferior Direito',
  47: 'Segundo Molar Inferior Direito',
  48: 'Terceiro Molar Inferior Direito (Siso)',
};

/**
 * Helper function to get tooth position from FDI number
 */
export function getToothPosition(toothNumber: number): ToothPosition {
  const quadrant = Math.floor(toothNumber / 10) as 1 | 2 | 3 | 4;
  const position = toothNumber % 10;
  
  return {
    quadrant,
    position,
    isUpper: quadrant === 1 || quadrant === 2,
    isRight: quadrant === 1 || quadrant === 4,
  };
}

/**
 * Helper function to validate FDI tooth number
 */
export function isValidToothNumber(num: number): boolean {
  return (num >= 11 && num <= 18) ||
         (num >= 21 && num <= 28) ||
         (num >= 31 && num <= 38) ||
         (num >= 41 && num <= 48) ||
         (num >= 51 && num <= 55) ||
         (num >= 61 && num <= 65) ||
         (num >= 71 && num <= 75) ||
         (num >= 81 && num <= 85);
}
