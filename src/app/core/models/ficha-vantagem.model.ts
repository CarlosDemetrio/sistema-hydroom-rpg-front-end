import { VantagemConfig } from './vantagem-config.model';

/**
 * Character Sheet Advantage
 * Purchasable advantages/perks with XP
 */
export interface FichaVantagem {
  id?: number;
  fichaId?: number;
  vantagemConfigId: number;
  nivel: number;
  bonus?: number;
  dano?: string;

  // Nested object (populated by backend)
  vantagemConfig?: VantagemConfig;
}
