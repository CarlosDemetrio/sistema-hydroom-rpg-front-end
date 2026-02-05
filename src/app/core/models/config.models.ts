import { BaseConfig, JogoScopedConfig, NamedConfig } from './config-base.model';

// Basic config models

export interface CategoriaVantagem extends BaseConfig {
  nome: string;
}

export interface NivelConfig extends JogoScopedConfig {
  nivel: number;
  xpMinimo: number;
  xpMaximo: number;
  bonusAtributo: number;
}

export interface LimitadorConfig extends NamedConfig {
  penalidade: number;
}

export interface ClassePersonagem extends NamedConfig {
  bonusAtributos: Record<string, number>; // e.g., { "FOR": 2, "VIG": 1 }
}

export interface Raca extends NamedConfig {
  bonusAtributos: Record<string, number>;
}

export interface PresencaConfig extends NamedConfig {
  efeito: string;
}

export interface GeneroConfig extends NamedConfig {
}

export interface IndoleConfig extends NamedConfig {
}

export interface MembroCorpoConfig extends NamedConfig {
  vidaMaxima: number;
}

export interface BonusConfig extends NamedConfig {
  valor: number;
  tipo: string; // 'ATRIBUTO' | 'APTIDAO' | 'VIDA' | etc
}

export interface ProspeccaoConfig extends JogoScopedConfig {
  tipoDado: string; // e.g., "D6", "D10"
  regras: string;
}
