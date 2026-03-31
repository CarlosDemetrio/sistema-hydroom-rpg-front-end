/**
 * Game status role — which role the current user has in the game.
 */
export type RoleJogo = 'MESTRE' | 'JOGADOR';

/**
 * JogoStatus kept for backward compatibility.
 * The backend no longer has a status enum; use `ativo: boolean` instead.
 */
export type JogoStatus = 'ATIVO' | 'PAUSADO' | 'FINALIZADO';

/**
 * Resumo de jogo para listagens (GET /api/v1/jogos)
 * Aligned with backend JogoResumoResponse.
 */
export interface JogoResumo {
  id: number;
  nome: string;
  descricao: string | null;
  totalParticipantes: number;
  ativo: boolean;
  meuRole: RoleJogo;
}

/**
 * Detalhes completos de um jogo (GET /api/v1/jogos/{id})
 * Aligned with backend JogoResponse.
 */
export interface Jogo {
  id: number;
  nome: string;
  descricao: string | null;
  dataInicio: string | null;
  dataFim: string | null;
  ativo: boolean;
  totalParticipantes: number;
  meuRole: RoleJogo;
}

/**
 * Meus jogos — com informação de role e quantidade de personagens
 * Aligned with backend MeuJogoResponse.
 */
export interface MeuJogo {
  id: number;
  nome: string;
  isMestre: boolean;
  meusPersonagens: number;
}

/**
 * Resposta de duplicação de jogo (POST /api/v1/jogos/{id}/duplicar)
 */
export interface DuplicarJogoResponse {
  id: number;
  nome: string;
}

/**
 * Dashboard do Mestre (GET /api/v1/jogos/{id}/dashboard)
 * Aligned with backend DashboardMestreResponse.
 */
export interface DashboardMestre {
  totalFichas: number;
  totalParticipantes: number;
  fichasPorNivel: Record<number, number>;
  ultimasAlteracoes: DashboardFichaAlteracao[];
}

export interface DashboardFichaAlteracao {
  fichaId: number;
  nome: string;
  dataUltimaAlteracao: string;
}
