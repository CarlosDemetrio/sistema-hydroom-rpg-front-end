/**
 * Character Sheet (Ficha) model
 * Aligned with backend FichaResponse record.
 */
export interface Ficha {
  id: number;
  jogoId: number;
  nome: string;
  jogadorId: number | null;
  racaId: number | null;
  racaNome: string | null;
  classeId: number | null;
  classeNome: string | null;
  generoId: number | null;
  generoNome: string | null;
  indoleId: number | null;
  indoleNome: string | null;
  presencaId: number | null;
  presencaNome: string | null;
  nivel: number;
  xp: number;
  renascimentos: number;
  isNpc: boolean;
  dataCriacao: string;
  dataUltimaAtualizacao: string;
}

/**
 * Resumo calculado de uma ficha (GET /api/v1/fichas/{id}/resumo)
 */
export interface FichaResumo {
  id: number;
  nome: string;
  nivel: number;
  xp: number;
  racaNome: string | null;
  classeNome: string | null;
  atributosTotais: Record<string, number>;
  bonusTotais: Record<string, number>;
  vidaTotal: number;
  essenciaTotal: number;
  ameacaTotal: number;
}

/**
 * Resultado de duplicação de ficha (POST /api/v1/fichas/{id}/duplicar)
 */
export interface DuplicarFichaResponse {
  fichaId: number;
  nome: string;
  isNpc: boolean;
}
