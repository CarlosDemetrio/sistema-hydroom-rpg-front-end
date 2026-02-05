import { NamedConfig } from './config-base.model';
import { CategoriaVantagem } from './categoria-vantagem.model';

/**
 * Advantage Configuration
 * Defines advantages/perks available in the game system
 * Configured by Mestre
 */
export interface VantagemConfig extends NamedConfig {
  categoriaVantagemId: number;
  custo: number; // XP cost

  // Nested object (populated by backend)
  categoriaVantagem?: CategoriaVantagem;
}
