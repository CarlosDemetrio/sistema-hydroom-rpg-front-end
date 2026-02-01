/**
 * DTO for creating a new game
 */
export interface CreateJogoDto {
  nome: string;
  descricao?: string;
}

/**
 * DTO for updating an existing game
 */
export interface UpdateJogoDto {
  nome?: string;
  descricao?: string;
  status?: 'ATIVO' | 'PAUSADO' | 'FINALIZADO';
}
