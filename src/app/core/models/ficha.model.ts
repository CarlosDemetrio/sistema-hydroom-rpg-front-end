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

// ==================== ATRIBUTOS DIRETOS ====================

/**
 * DTO para atualização em lote de atributos de uma ficha.
 * Alinhado com backend AtualizarAtributoRequest record.
 * Endpoint: PUT /api/v1/fichas/{id}/atributos
 */
export interface AtualizarAtributoDto {
  atributoConfigId: number;
  base: number;
  nivel?: number;
  outros?: number;
}

/**
 * Resposta de atributo após atualização em lote.
 * Alinhado com backend FichaAtributoResponse record.
 * Nota: o backend retorna `atributoAbreviacao`, não `atributoSigla`.
 */
export interface FichaAtributoResponse {
  id: number;
  atributoConfigId: number;
  atributoNome: string;
  /** Abreviação do atributo (ex: "FOR", "AGI"). Campo backend: atributoAbreviacao. */
  atributoAbreviacao: string;
  base: number;
  nivel: number;
  outros: number;
  /** Total calculado pelo backend: base + nivel + outros + bônus de raça */
  total: number;
  /** Valor de ímpeto calculado pelo backend via fórmula do atributo */
  impeto: number;
}

// ==================== VANTAGENS ====================

/**
 * Vantagem comprada de uma ficha.
 * Alinhado com backend FichaVantagemResponse record.
 */
export interface FichaVantagemResponse {
  id: number;
  vantagemConfigId: number;
  nomeVantagem: string;
  nivelAtual: number;
  nivelMaximo: number;
  custoPago: number;
}

/**
 * DTO para comprar uma vantagem.
 */
export interface ComprarVantagemDto {
  vantagemConfigId: number;
}

/**
 * Dados completos carregados para a FichaDetailPage.
 */
export interface FichaCompletaData {
  ficha: Ficha;
  resumo: FichaResumo;
}

// ==================== APTIDOES DIRETAS ====================

/**
 * DTO para atualização em lote de aptidões de uma ficha.
 * Alinhado com backend AtualizarAptidaoRequest record.
 * Endpoint: PUT /api/v1/fichas/{id}/aptidoes
 */
export interface AtualizarAptidaoDto {
  aptidaoConfigId: number;
  base: number;
  sorte?: number;
  classe?: number;
}

/**
 * Resposta de aptidão após atualização em lote.
 * Alinhado com backend FichaAptidaoResponse record.
 */
export interface FichaAptidaoResponse {
  id: number;
  aptidaoConfigId: number;
  aptidaoNome: string;
  base: number;
  sorte: number;
  classe: number;
  /** Total calculado pelo backend: base + sorte + classe */
  total: number;
}
