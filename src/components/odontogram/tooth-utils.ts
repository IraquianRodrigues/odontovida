/**
 * Utility functions for tooth classification and rendering
 */

export type ToothType = 'incisor' | 'canine' | 'premolar' | 'molar';
export type ToothOrientation = 'left' | 'right';

/**
 * Determine the type of tooth based on FDI notation
 * FDI System: Each tooth is numbered 11-18, 21-28, 31-38, 41-48
 * Last digit indicates position: 1-2 = incisors, 3 = canine, 4-5 = premolars, 6-8 = molars
 */
export function getToothType(toothNumber: number): ToothType {
  const position = toothNumber % 10;
  
  if (position >= 1 && position <= 2) return 'incisor';
  if (position === 3) return 'canine';
  if (position >= 4 && position <= 5) return 'premolar';
  return 'molar'; // 6, 7, 8
}

/**
 * Determine if tooth should face left or right
 * Quadrants 1 and 4 (right side) face right
 * Quadrants 2 and 3 (left side) face left
 */
export function getToothOrientation(toothNumber: number): ToothOrientation {
  const quadrant = Math.floor(toothNumber / 10);
  return (quadrant === 1 || quadrant === 4) ? 'right' : 'left';
}

/**
 * Get a human-readable description of the tooth
 */
export function getToothDescription(toothNumber: number): string {
  const type = getToothType(toothNumber);
  const position = toothNumber % 10;
  const quadrant = Math.floor(toothNumber / 10);
  
  const quadrantNames = {
    1: 'Superior Direito',
    2: 'Superior Esquerdo',
    3: 'Inferior Esquerdo',
    4: 'Inferior Direito',
  };
  
  const typeNames = {
    incisor: position === 1 ? 'Incisivo Central' : 'Incisivo Lateral',
    canine: 'Canino',
    premolar: position === 4 ? 'Primeiro Pré-Molar' : 'Segundo Pré-Molar',
    molar: position === 6 ? 'Primeiro Molar' : position === 7 ? 'Segundo Molar' : 'Terceiro Molar',
  };
  
  return `${typeNames[type]} - ${quadrantNames[quadrant as keyof typeof quadrantNames]}`;
}
