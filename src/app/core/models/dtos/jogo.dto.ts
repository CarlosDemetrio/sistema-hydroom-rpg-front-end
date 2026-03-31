/**
 * DTO para criar um novo jogo.
 * Alinhado com backend CriarJogoRequest.
 */
export interface CreateJogoDto {
  nome: string;
  descricao?: string;
}

/**
 * DTO para editar um jogo.
 * Alinhado com backend EditarJogoRequest.
 */
export interface UpdateJogoDto {
  nome?: string;
  descricao?: string;
}

/**
 * DTO para duplicar um jogo.
 * Alinhado com backend DuplicarJogoRequest.
 */
export interface DuplicarJogoDto {
  novoNome: string;
}
