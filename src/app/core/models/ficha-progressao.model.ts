import { LimitadorConfig } from './limitador-config.model';

/**
 * Character Sheet Progression section
 * Level, experience, and progression-related data
 */
export interface FichaProgressao {
  id?: number;
  fichaId?: number;
  nivel: number;
  experiencia: number;
  limitadorId?: number;
  renascimento?: number;
  insolitus?: number;
  nvs?: number;

  // Nested object (populated by backend)
  limitador?: LimitadorConfig;
}
