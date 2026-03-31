/**
 * Configuração de Atributo.
 * Aligned with backend AtributoResponse record.
 */
export interface AtributoConfig {
  id: number;
  jogoId: number;
  nome: string;
  abreviacao: string;
  descricao: string | null;
  formulaImpeto: string | null;
  descricaoImpeto: string | null;
  valorMinimo: number | null;
  valorMaximo: number | null;
  ordemExibicao: number;
  dataCriacao: string;
  dataUltimaAtualizacao: string;
}

export interface CreateAtributoDto {
  jogoId: number;
  nome: string;
  abreviacao: string;
  descricao?: string;
  formulaImpeto?: string;
  descricaoImpeto?: string;
  valorMinimo?: number;
  valorMaximo?: number;
  ordemExibicao?: number;
}

export interface UpdateAtributoDto {
  nome?: string;
  abreviacao?: string;
  descricao?: string;
  formulaImpeto?: string;
  descricaoImpeto?: string;
  valorMinimo?: number;
  valorMaximo?: number;
  ordemExibicao?: number;
}
