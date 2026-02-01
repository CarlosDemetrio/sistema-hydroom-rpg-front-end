import { Ficha } from '../ficha.model';

/**
 * DTO for creating a new character sheet
 * Can omit most fields initially, only nome required
 */
export interface CreateFichaDto {
  nome: string;
  jogoId?: number;
  // All other fields from Ficha are optional in creation
  // Backend will set defaults
}

/**
 * DTO for updating an existing character sheet
 * All fields are optional (partial update)
 */
export type UpdateFichaDto = Partial<Ficha>;
