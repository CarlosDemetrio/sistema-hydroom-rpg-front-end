/**
 * Body part/limb enum
 */
export type Membro = 'CABECA' | 'TORSO' | 'BRACO_ESQ' | 'BRACO_DIR' | 'PERNA_ESQ' | 'PERNA_DIR';

/**
 * Character Sheet Limb Integrity
 * Tracks damage to specific body parts
 */
export interface FichaVidaMembro {
  id?: number;
  fichaVidaId?: number;
  membro: Membro;
  integridade: number; // 0-100 (percentage)
}
