/**
 * Pré-requisito de uma vantagem.
 * Aligned with backend VantagemPreRequisitoResponse record.
 */
export interface VantagemPreRequisito {
  id: number;
  vantagemId: number;
  preRequisitoId: number;
  preRequisitoNome: string;
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
  preRequisitos: VantagemPreRequisito[];
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
