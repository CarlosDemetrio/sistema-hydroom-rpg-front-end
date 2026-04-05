/**
 * DTO para criar uma ficha de jogador.
 * Alinhado com backend CreateFichaRequest.
 */
export interface CreateFichaDto {
  jogoId: number;
  nome: string;
  jogadorId?: number | null;
  racaId?: number | null;
  classeId?: number | null;
  generoId?: number | null;
  indoleId?: number | null;
  presencaId?: number | null;
  isNpc?: boolean;
}

/**
 * DTO para criar um NPC.
 * Alinhado com backend NpcCreateRequest.
 */
export interface NpcCreateDto {
  jogoId: number;
  nome: string;
  racaId?: number | null;
  classeId?: number | null;
  generoId?: number | null;
  indoleId?: number | null;
  presencaId?: number | null;
}

/**
 * DTO para atualizar uma ficha.
 * Alinhado com backend UpdateFichaRequest.
 */
export interface UpdateFichaDto {
  nome?: string;
  racaId?: number | null;
  classeId?: number | null;
  generoId?: number | null;
  indoleId?: number | null;
  presencaId?: number | null;
  xp?: number;
  renascimentos?: number;
  descricao?: string | null;
}

/**
 * DTO para duplicar uma ficha.
 * Alinhado com backend DuplicarFichaRequest.
 */
export interface DuplicarFichaDto {
  novoNome: string;
  manterJogador: boolean;
}
