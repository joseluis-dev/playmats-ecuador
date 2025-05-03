// utils/color-utils.ts
import chroma from 'chroma-js';

/**
 * Devuelve una variante de color más brillante y saturada para modo oscuro
 * @param hexColor Color en formato hexadecimal (ej. "#00ff26")
 * @returns Hexadecimal ajustado para tema oscuro (ej. "#40ff5e")
 */
export function getDarkModeVariant(hexColor: string): string {
  const base = chroma(hexColor);
  const [h, s, l] = base.hsl();

  const newL = Math.min(0.85, l + 0.15); // +15% brillo
  const newS = Math.min(1, s + 0.1);     // +10% saturación
  
  return chroma.hsl(h, newS, newL).hex();
}
