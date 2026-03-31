/**
 * Legacy base interfaces kept for backward compatibility.
 * New code should use the specific model interfaces directly.
 */

export interface BaseConfig {
  id?: number;
  ordemExibicao?: number;
  dataCriacao?: string;
  dataUltimaAtualizacao?: string;
}

export interface JogoScopedConfig extends BaseConfig {
  jogoId?: number;
}

export interface NamedConfig extends JogoScopedConfig {
  nome: string;
  descricao?: string;
}

// Re-exports so existing imports from 'config-base.model' continue to work
export type { AtributoConfig, CreateAtributoDto, UpdateAtributoDto } from './atributo-config.model';
export type { AptidaoConfig, CreateAptidaoDto, UpdateAptidaoDto } from './aptidao-config.model';
export type { TipoAptidao } from './tipo-aptidao.model';
export type { VantagemConfig, CreateVantagemDto, UpdateVantagemDto } from './vantagem-config.model';
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
  LimitadorConfig,
  ProspeccaoConfig,
} from './config.models';
