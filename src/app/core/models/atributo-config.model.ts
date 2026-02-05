import { NamedConfig } from './config-base.model';

/**
 * Attribute Configuration
 * Defines an attribute type in the game system (e.g., Força, Agilidade)
 * Configured by Mestre
 */
export interface AtributoConfig extends NamedConfig {
  abreviacao: string;           // 2-5 chars (e.g., "FOR", "AGI")
  formulaImpeto?: string;       // Formula for calculated attributes (e.g., "(FOR + AGI) / 3")
  valorMinimo?: number;         // Minimum value
  valorMaximo?: number;         // Maximum value
}
