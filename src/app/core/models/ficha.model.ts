/**
 * Status de uma ficha. Alinhado com backend FichaStatus enum.
 * - RASCUNHO: wizard nao concluido, campos obrigatorios podem estar incompletos
 * - ATIVA: ficha completa e em uso
 * - MORTA: personagem morto em jogo (nao pode ser deletada)
 * - ABANDONADA: personagem abandonado pelo jogador (nao pode ser deletada)
 */
export type FichaStatus = 'RASCUNHO' | 'ATIVA' | 'MORTA' | 'ABANDONADA';

// ==================== VISIBILIDADE NPC ====================

/**
 * Item de acesso de um jogador a um NPC.
 * Alinhado com backend JogadorAcessoItem.
 */
export interface JogadorAcessoItem {
  jogadorId: number;
  jogadorNome: string;
  nomePersonagem: string;
}

/**
 * Resposta do endpoint GET /api/v1/fichas/{fichaId}/visibilidade.
 * Alinhado com backend FichaVisibilidadeResponse.
 */
export interface FichaVisibilidadeResponse {
  fichaId: number;
  visivelGlobalmente: boolean;
  jogadoresComAcesso: JogadorAcessoItem[];
}

/**
 * DTO para atualizar acesso individual de um jogador a um NPC.
 * Alinhado com backend AtualizarVisibilidadeRequest.
 */
export interface AtualizarVisibilidadeDto {
  jogadorId: number;
  temAcesso: boolean;
}

/**
 * Evento emitido pelo NpcVisibilidadeComponent ao salvar.
 */
export interface NpcVisibilidadeUpdate {
  visivelGlobalmente: boolean;
  jogadoresComAcesso: number[];
}

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
  descricao: string | null;
  /** Status da ficha. RASCUNHO indica wizard nao concluido. */
  status: FichaStatus;
  dataCriacao: string;
  dataUltimaAtualizacao: string;
  /**
   * Indica se o NPC é visível para todos os jogadores do jogo.
   * Presente apenas em fichas com isNpc=true.
   */
  visivelGlobalmente?: boolean;
  /**
   * Para o Jogador autenticado: indica se ele tem acesso granular aos stats do NPC.
   * Presente apenas quando o Jogador lista fichas e o NPC não é visível globalmente.
   */
  jogadorTemAcessoStats?: boolean;
}

/**
 * Resumo calculado de uma ficha (GET /api/v1/fichas/{id}/resumo)
 *
 * Todos os campos são retornados pelo backend (Spec 009-T5 garantiu essenciaAtual/vidaAtual).
 * vidaAtual e essenciaAtual refletem o estado atual de combate; quando a ficha está com
 * vida/essência cheia, o backend retorna o mesmo valor que vidaTotal/essenciaTotal.
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
  /** Vida atual em combate. Igual a vidaTotal quando a ficha está com vida cheia. */
  vidaAtual: number;
  essenciaTotal: number;
  /** Essência atual (não gasta). Igual a essenciaTotal quando a ficha está com essência cheia. */
  essenciaAtual: number;
  ameacaTotal: number;
  /** Pontos de vantagem disponíveis para gastar. Calculado pelo backend (Spec 012/T5). */
  pontosVantagemDisponiveis: number;
  /** Pontos de atributo disponíveis para distribuir. Calculado pelo backend (Spec 012/T5). */
  pontosAtributoDisponiveis: number;
  /** Pontos de aptidão disponíveis para distribuir. Calculado pelo backend (Spec 012/T5). */
  pontosAptidaoDisponiveis: number;
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
  /** Tipo da vantagem: VANTAGEM (normal) ou INSOLITUS (concedida gratuitamente pelo Mestre). */
  tipoVantagem?: 'VANTAGEM' | 'INSOLITUS';
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
