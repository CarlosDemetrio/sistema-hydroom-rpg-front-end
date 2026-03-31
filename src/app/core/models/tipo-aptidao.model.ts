/**
 * Tipo de Aptidão.
 * Aligned with backend TipoAptidaoResponse record.
 */
export interface TipoAptidao {
  id: number;
  jogoId: number;
  nome: string;
  descricao: string | null;
  ordemExibicao: number;
  dataCriacao: string;
  dataUltimaAtualizacao: string;
}
