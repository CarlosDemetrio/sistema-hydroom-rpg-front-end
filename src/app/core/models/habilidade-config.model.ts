/**
 * Habilidade de Configuração do Jogo.
 * Alinhado com backend HabilidadeConfigResponse record.
 *
 * Diferença crítica: MESTRE e JOGADOR têm as mesmas permissões (GET, POST, PUT, DELETE).
 * Endpoint: /api/jogos/{jogoId}/config/habilidades
 */
export interface HabilidadeConfig {
  id: number;
  jogoId: number;
  nome: string;
  descricao: string | null;
  danoEfeito: string | null;
  ordemExibicao: number;
  dataCriacao: string;
  dataUltimaAtualizacao: string;
}

export interface CreateHabilidadeConfigDto {
  nome: string;
  descricao?: string | null;
  danoEfeito?: string | null;
  ordemExibicao: number;
}

export interface UpdateHabilidadeConfigDto {
  nome?: string;
  descricao?: string | null;
  danoEfeito?: string | null;
  ordemExibicao?: number;
}
