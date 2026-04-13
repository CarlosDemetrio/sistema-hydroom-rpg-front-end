import { CategoriaItem } from './tipo-item-config.model';

/**
 * Tipos de efeito de item — alinhado com backend TipoItemEfeito enum.
 */
export type TipoItemEfeito =
  | 'BONUS_ATRIBUTO'
  | 'BONUS_APTIDAO'
  | 'BONUS_DERIVADO'
  | 'BONUS_VIDA'
  | 'BONUS_ESSENCIA'
  | 'FORMULA_CUSTOMIZADA'
  | 'EFEITO_DADO';

export type TipoRequisito =
  | 'NIVEL'
  | 'ATRIBUTO'
  | 'BONUS'
  | 'APTIDAO'
  | 'VANTAGEM'
  | 'CLASSE'
  | 'RACA';

export const TIPO_EFEITO_LABELS: Record<TipoItemEfeito, string> = {
  BONUS_ATRIBUTO: 'Bônus em Atributo',
  BONUS_APTIDAO: 'Bônus em Aptidão',
  BONUS_DERIVADO: 'Bônus em Bônus Derivado',
  BONUS_VIDA: 'Bônus de Vida',
  BONUS_ESSENCIA: 'Bônus de Essência',
  FORMULA_CUSTOMIZADA: 'Fórmula Customizada',
  EFEITO_DADO: 'Efeito de Dado',
};

export const TIPO_REQUISITO_LABELS: Record<TipoRequisito, string> = {
  NIVEL: 'Nível Mínimo',
  ATRIBUTO: 'Atributo Mínimo',
  BONUS: 'Bônus Mínimo',
  APTIDAO: 'Aptidão Mínima',
  VANTAGEM: 'Possui Vantagem',
  CLASSE: 'Classe Específica',
  RACA: 'Raça Específica',
};

/**
 * Efeito de item.
 * Alinhado com backend ItemEfeitoResponse record.
 */
export interface ItemEfeitoResponse {
  id: number;
  tipoEfeito: TipoItemEfeito;
  atributoAlvoId?: number | null;
  aptidaoAlvoId?: number | null;
  bonusAlvoId?: number | null;
  valorFixo?: number | null;
  formula?: string | null;
  descricaoEfeito?: string | null;
}

/**
 * DTO para criação/atualização de efeito de item.
 * Alinhado com backend ItemEfeitoRequest record.
 */
export interface ItemEfeitoRequest {
  tipoEfeito: TipoItemEfeito;
  atributoAlvoId?: number | null;
  aptidaoAlvoId?: number | null;
  bonusAlvoId?: number | null;
  valorFixo?: number | null;
  formula?: string | null;
  descricaoEfeito?: string | null;
}

/**
 * Requisito de item.
 * Alinhado com backend ItemRequisitoResponse record.
 */
export interface ItemRequisitoResponse {
  id: number;
  tipo: TipoRequisito;
  alvo?: string | null;
  valorMinimo?: number | null;
}

/**
 * DTO para criação de requisito de item.
 */
export interface ItemRequisitoRequest {
  tipo: TipoRequisito;
  alvo?: string | null;
  valorMinimo?: number | null;
}

/**
 * ItemConfig resumido — usado em listagens paginadas.
 * Alinhado com backend ItemConfigResumoResponse record.
 */
export interface ItemConfigResumo {
  id: number;
  jogoId: number;
  nome: string;
  raridadeId: number;
  raridadeNome: string;
  raridadeCor: string;
  tipoId: number;
  tipoNome: string;
  categoria: CategoriaItem;
  peso: number;
  valor?: number | null;
  nivelMinimo: number;
  propriedades?: string | null;
  ordemExibicao: number;
}

/**
 * ItemConfig completo — usado na tela de detalhe/edição.
 * Alinhado com backend ItemConfigResponse record.
 */
export interface ItemConfigResponse {
  id: number;
  jogoId: number;
  nome: string;
  raridadeId: number;
  raridadeNome: string;
  raridadeCor: string;
  tipoId: number;
  tipoNome: string;
  categoria: CategoriaItem;
  peso: number;
  valor?: number | null;
  duracaoPadrao?: number | null;
  nivelMinimo: number;
  propriedades?: string | null;
  descricao?: string | null;
  ordemExibicao: number;
  efeitos: ItemEfeitoResponse[];
  requisitos: ItemRequisitoResponse[];
  dataCriacao: string;
  dataUltimaAtualizacao: string;
}

/**
 * DTO para criação de ItemConfig.
 * Alinhado com backend ItemConfigRequest record.
 */
export interface CreateItemConfigDto {
  jogoId: number;
  nome: string;
  raridadeId: number;
  tipoId: number;
  peso: number;
  valor?: number | null;
  duracaoPadrao?: number | null;
  nivelMinimo: number;
  propriedades?: string | null;
  descricao?: string | null;
  ordemExibicao: number;
}

/**
 * DTO para atualização de ItemConfig.
 * Alinhado com backend ItemConfigUpdateRequest record.
 */
export interface UpdateItemConfigDto {
  nome?: string;
  raridadeId?: number | null;
  tipoId?: number | null;
  peso?: number;
  valor?: number | null;
  duracaoPadrao?: number | null;
  nivelMinimo?: number;
  propriedades?: string | null;
  descricao?: string | null;
  ordemExibicao?: number;
}

/**
 * Resposta paginada do backend (Spring Page<T>)
 */
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
