import { TipoAptidao } from './tipo-aptidao.model';

/**
 * Skill/Aptitude Configuration
 * Defines a skill type in the game system (e.g., Espadas, Atletismo)
 * Configured by Mestre
 */
export interface AptidaoConfig {
  id: number;
  nome: string;
  tipoAptidaoId: number;
  ordem: number; // Display order
  ativo: boolean;

  // Nested object (populated by backend)
  tipoAptidao?: TipoAptidao;
}
