import { AtributoConfig } from './atributo-config.model';

/**
 * Character Sheet Attribute
 * Represents a character's attribute value (e.g., Strength, Agility)
 *
 * IMPORTANT: 'total' is CALCULATED BY BACKEND
 * Frontend can calculate temporarily for preview: total = base + nivel + outros
 * Always use backend value after save
 */
export interface FichaAtributo {
  id?: number;
  fichaId?: number;
  atributoConfigId: number;
  base: number;
  nivel: number;
  outros: number;
  total: number; // ← CALCULATED BY BACKEND

  // Nested object (populated by backend)
  atributoConfig?: AtributoConfig;
}
