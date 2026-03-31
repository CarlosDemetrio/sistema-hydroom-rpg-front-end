/**
 * Configuração de Aptidão.
 * Aligned with backend AptidaoResponse record.
 */
export interface AptidaoConfig {
  id: number;
  jogoId: number;
  tipoAptidaoId: number;
  tipoAptidaoNome: string;
  nome: string;
  descricao: string | null;
  ordemExibicao: number;
  dataCriacao: string;
  dataUltimaAtualizacao: string;
}

export interface CreateAptidaoDto {
  jogoId: number;
  nome: string;
  tipoAptidaoId: number;
  descricao?: string;
  ordemExibicao?: number;
}

export interface UpdateAptidaoDto {
  nome?: string;
  tipoAptidaoId?: number;
  descricao?: string;
  ordemExibicao?: number;
}
