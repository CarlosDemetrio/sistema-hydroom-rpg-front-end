// Basic config models
export interface CategoriaVantagem {
  id: number;
  nome: string;
}

export interface NivelConfig {
  id: number;
  nivel: number;
  xpMinimo: number;
  xpMaximo: number;
  bonusAtributo: number;
}

export interface LimitadorConfig {
  id: number;
  nome: string;
  descricao: string;
  penalidade: number;
}

export interface ClassePersonagem {
  id: number;
  nome: string;
  descricao: string;
  bonusAtributos: Record<string, number>; // e.g., { "FOR": 2, "VIG": 1 }
}

export interface Raca {
  id: number;
  nome: string;
  descricao: string;
  bonusAtributos: Record<string, number>;
}

export interface PresencaConfig {
  id: number;
  nome: string;
  descricao: string;
  efeito: string;
}

export interface GeneroConfig {
  id: number;
  nome: string;
  descricao?: string;
}

export interface ProspeccaoConfig {
  id: number;
  tipoDado: string; // e.g., "D6", "D10"
  regras: string;
}
