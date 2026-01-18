/**
 * SVG components for different tooth types
 * Each component renders an anatomically accurate tooth shape
 */

import type { ToothOrientation } from './tooth-utils';

interface ToothSVGProps {
  color: string;
  orientation: ToothOrientation;
  className?: string;
}

/**
 * Incisor tooth - flat, chisel-shaped for cutting
 */
export function IncisorSVG({ color, orientation, className }: ToothSVGProps) {
  const transform = orientation === 'left' ? 'scale(-1, 1)' : '';
  
  return (
    <svg
      viewBox="0 0 40 60"
      className={className}
      style={{ transform }}
    >
      {/* Crown */}
      <path
        d="M 10 15 Q 10 5, 20 5 Q 30 5, 30 15 L 28 35 Q 28 40, 20 40 Q 12 40, 12 35 Z"
        fill={color}
        stroke="rgba(0,0,0,0.2)"
        strokeWidth="1"
      />
      {/* Root */}
      <path
        d="M 16 38 Q 18 50, 20 60 Q 22 50, 24 38"
        fill={color}
        opacity="0.7"
        stroke="rgba(0,0,0,0.15)"
        strokeWidth="0.5"
      />
      {/* Highlight */}
      <ellipse
        cx="15"
        cy="18"
        rx="4"
        ry="6"
        fill="white"
        opacity="0.3"
      />
    </svg>
  );
}

/**
 * Canine tooth - pointed, conical for tearing
 */
export function CanineSVG({ color, orientation, className }: ToothSVGProps) {
  const transform = orientation === 'left' ? 'scale(-1, 1)' : '';
  
  return (
    <svg
      viewBox="0 0 40 60"
      className={className}
      style={{ transform }}
    >
      {/* Crown - pointed */}
      <path
        d="M 12 20 Q 12 8, 20 3 Q 28 8, 28 20 L 26 35 Q 26 40, 20 40 Q 14 40, 14 35 Z"
        fill={color}
        stroke="rgba(0,0,0,0.2)"
        strokeWidth="1"
      />
      {/* Root - longer */}
      <path
        d="M 17 38 Q 18 48, 20 60 Q 22 48, 23 38"
        fill={color}
        opacity="0.7"
        stroke="rgba(0,0,0,0.15)"
        strokeWidth="0.5"
      />
      {/* Highlight */}
      <ellipse
        cx="16"
        cy="15"
        rx="3"
        ry="5"
        fill="white"
        opacity="0.3"
      />
    </svg>
  );
}

/**
 * Premolar tooth - two cusps for grinding
 */
export function PremolarSVG({ color, orientation, className }: ToothSVGProps) {
  const transform = orientation === 'left' ? 'scale(-1, 1)' : '';
  
  return (
    <svg
      viewBox="0 0 45 60"
      className={className}
      style={{ transform }}
    >
      {/* Crown - two cusps */}
      <path
        d="M 10 18 Q 10 10, 15 8 Q 18 5, 22.5 8 Q 27 5, 30 8 Q 35 10, 35 18 L 33 35 Q 33 40, 22.5 40 Q 12 40, 12 35 Z"
        fill={color}
        stroke="rgba(0,0,0,0.2)"
        strokeWidth="1"
      />
      {/* Cusp division */}
      <path
        d="M 22.5 8 L 22.5 25"
        stroke="rgba(0,0,0,0.15)"
        strokeWidth="1"
        fill="none"
      />
      {/* Root - bifurcated */}
      <path
        d="M 16 38 Q 17 50, 18 60 M 27 38 Q 26 50, 25 60"
        stroke={color}
        strokeWidth="3"
        fill="none"
        opacity="0.7"
      />
      {/* Highlight */}
      <ellipse
        cx="17"
        cy="16"
        rx="4"
        ry="5"
        fill="white"
        opacity="0.3"
      />
    </svg>
  );
}

/**
 * Molar tooth - multiple cusps for grinding
 */
export function MolarSVG({ color, orientation, className }: ToothSVGProps) {
  const transform = orientation === 'left' ? 'scale(-1, 1)' : '';
  
  return (
    <svg
      viewBox="0 0 50 60"
      className={className}
      style={{ transform }}
    >
      {/* Crown - four cusps */}
      <path
        d="M 8 20 Q 8 12, 13 9 Q 16 6, 20 9 Q 25 6, 30 9 Q 34 6, 37 9 Q 42 12, 42 20 L 40 35 Q 40 40, 25 40 Q 10 40, 10 35 Z"
        fill={color}
        stroke="rgba(0,0,0,0.2)"
        strokeWidth="1"
      />
      {/* Cusp divisions */}
      <path
        d="M 20 9 L 20 25 M 30 9 L 30 25 M 12 20 L 38 20"
        stroke="rgba(0,0,0,0.15)"
        strokeWidth="1"
        fill="none"
      />
      {/* Roots - multiple */}
      <path
        d="M 15 38 Q 15 50, 14 60 M 25 38 Q 25 52, 25 60 M 35 38 Q 35 50, 36 60"
        stroke={color}
        strokeWidth="3"
        fill="none"
        opacity="0.7"
      />
      {/* Highlight */}
      <ellipse
        cx="18"
        cy="18"
        rx="5"
        ry="6"
        fill="white"
        opacity="0.3"
      />
    </svg>
  );
}

/**
 * Main component that selects the appropriate tooth SVG
 */
interface ToothIconProps {
  type: 'incisor' | 'canine' | 'premolar' | 'molar';
  color: string;
  orientation: ToothOrientation;
  className?: string;
}

export function ToothIcon({ type, color, orientation, className }: ToothIconProps) {
  const props = { color, orientation, className };
  
  switch (type) {
    case 'incisor':
      return <IncisorSVG {...props} />;
    case 'canine':
      return <CanineSVG {...props} />;
    case 'premolar':
      return <PremolarSVG {...props} />;
    case 'molar':
      return <MolarSVG {...props} />;
  }
}
