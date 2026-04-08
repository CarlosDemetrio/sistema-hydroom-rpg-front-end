/**
 * Pasta organizadora de anotações de uma ficha.
 * Alinhado com backend AnotacaoPastaResponse record.
 *
 * Hierarquia máxima: 3 níveis.
 * pastaPaiId null = pasta raiz.
 */
export interface AnotacaoPasta {
  id: number;
  fichaId: number;
  nome: string;
  pastaPaiId: number | null;
  ordemExibicao: number;
  subPastas: AnotacaoPasta[];
  dataCriacao: string;
  dataUltimaAtualizacao: string;
}

/**
 * DTO para criação de pasta.
 * Alinhado com backend CriarAnotacaoPastaRequest record.
 */
export interface CriarPastaDto {
  nome: string;
  pastaPaiId?: number;
  ordemExibicao?: number;
}

/**
 * DTO para atualização de pasta.
 * Alinhado com backend AtualizarAnotacaoPastaRequest record.
 */
export interface AtualizarPastaDto {
  nome?: string;
  ordemExibicao?: number;
}
