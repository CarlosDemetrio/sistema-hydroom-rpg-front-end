import { NamedConfig } from './config-base.model';
import { TipoAptidao } from './tipo-aptidao.model';

/**
 * Skill/Aptitude Configuration
 * Defines a skill type in the game system (e.g., Espadas, Atletismo)
 * Configured by Mestre
 */
export interface AptidaoConfig extends NamedConfig {
  tipoAptidaoId: number;

  // Nested object (populated by backend)
  tipoAptidao?: TipoAptidao;
}
