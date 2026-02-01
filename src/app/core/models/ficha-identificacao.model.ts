import { PresencaConfig } from './presenca-config.model';

/**
 * Character Sheet Identification section
 * Basic character information and background
 */
export interface FichaIdentificacao {
  id?: number;
  fichaId?: number;
  origem?: string;
  indole?: string;
  linhagem?: string;
  presencaId?: number;
  tipoHeroico?: string;

  // Nested object (populated by backend)
  presenca?: PresencaConfig;
}
