import { VantagemEfeito } from './vantagem-efeito.model';

export type TipoPreRequisito = 'VANTAGEM' | 'RACA' | 'CLASSE' | 'ATRIBUTO' | 'NIVEL' | 'APTIDAO';

/**
 * Pré-requisito polimórfico de uma vantagem.
 * Aligned with backend VantagemPreRequisitoResponse record (campos adicionados na Spec 023).
 */
export interface VantagemPreRequisito {
  id: number;
  vantagemId: number;
  tipo: TipoPreRequisito;
  // tipo VANTAGEM
  preRequisitoId?: number;
  preRequisitoNome?: string;
  nivelMinimo?: number;
  // tipo RACA
  racaId?: number;
  racaNome?: string;
  // tipo CLASSE
  classeId?: number;
  classeNome?: string;
  // tipo ATRIBUTO
  atributoId?: number;
  atributoNome?: string;
  atributoAbreviacao?: string;
  // tipo APTIDAO
  aptidaoId?: number;
  aptidaoNome?: string;
  // tipo ATRIBUTO, APTIDAO, NIVEL
  valorMinimo?: number;
}

/**
 * DTO para adicionar pré-requisito polimórfico.
 */
export interface AddPreRequisitoDto {
  tipo: TipoPreRequisito;
  preRequisitoId?: number;
  nivelMinimo?: number;
  racaId?: number;
  classeId?: number;
  atributoId?: number;
  aptidaoId?: number;
  valorMinimo?: number;
}

/**
 * Configuração de Vantagem.
 * Aligned with backend VantagemResponse record.
 */
export interface VantagemConfig {
  id: number;
  jogoId: number;
  nome: string;
  sigla: string | null;
  descricao: string | null;
  categoriaVantagemId: number;
  categoriaNome: string;
  nivelMaximo: number;
  formulaCusto: string | null;
  descricaoEfeito: string | null;
  ordemExibicao: number;
  /** Tipo da vantagem: VANTAGEM (custa pontos) ou INSOLITUS (concedida gratuitamente pelo Mestre). */
  tipoVantagem?: 'VANTAGEM' | 'INSOLITUS';
  preRequisitos: VantagemPreRequisito[];
  efeitos: VantagemEfeito[];
  dataCriacao: string;
  dataUltimaAtualizacao: string;
}

export interface CreateVantagemDto {
  jogoId: number;
  nome: string;
  sigla?: string;
  descricao?: string;
  categoriaVantagemId: number;
  nivelMaximo: number;
  formulaCusto?: string;
  descricaoEfeito?: string;
  ordemExibicao?: number;
}

export interface UpdateVantagemDto {
  nome?: string;
  sigla?: string;
  descricao?: string;
  categoriaVantagemId?: number;
  nivelMaximo?: number;
  formulaCusto?: string;
  descricaoEfeito?: string;
  ordemExibicao?: number;
}
