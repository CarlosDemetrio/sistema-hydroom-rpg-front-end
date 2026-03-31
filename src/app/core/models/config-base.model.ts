/**
 * Base interface for all configuration entities.
 * All specific config models (AtributoConfig, AptidaoConfig, etc.) are defined
 * in their own model files and use explicit fields aligned with the backend responses.
 *
 * This file is kept for backward compatibility only.
 */

// Re-exports so existing imports from 'config-base.model' continue to work
export type { AtributoConfig } from './atributo-config.model';
export type { AptidaoConfig } from './aptidao-config.model';
export type { TipoAptidao } from './tipo-aptidao.model';
export type { VantagemConfig } from './vantagem-config.model';
export type {
  CategoriaVantagem,
  ClassePersonagem,
  Raca,
  NivelConfig,
  DadoProspeccaoConfig,
  PresencaConfig,
  GeneroConfig,
  IndoleConfig,
  MembroCorpoConfig,
  BonusConfig,
  ReordenarItem,
  ReordenarRequest,
} from './config.models';
