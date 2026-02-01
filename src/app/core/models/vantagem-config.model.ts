import { CategoriaVantagem } from './categoria-vantagem.model';

/**
 * Advantage Configuration
 * Defines advantages/perks available in the game system
 * Configured by Mestre
 */
export interface VantagemConfig {
  id: number;
  nome: string;
  categoriaVantagemId: number;
  custo: number; // XP cost
  descricao: string;
  ativo: boolean;

  // Nested object (populated by backend)
  categoriaVantagem?: CategoriaVantagem;
}
