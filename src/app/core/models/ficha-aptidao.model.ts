import { AptidaoConfig } from './aptidao-config.model';

/**
 * Character Sheet Skill/Aptitude
 * Represents a character's skill level (e.g., Swords, Athletics)
 */
export interface FichaAptidao {
  id?: number;
  fichaId?: number;
  aptidaoConfigId: number;
  nivel: number;
  bonus: number;

  // Nested object (populated by backend)
  aptidaoConfig?: AptidaoConfig;
}
