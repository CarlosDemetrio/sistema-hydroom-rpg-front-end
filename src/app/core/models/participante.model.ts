import { User } from './user.model';
import { Ficha } from './ficha.model';

/**
 * Participant status enum
 */
export type ParticipanteStatus = 'PENDENTE' | 'APROVADO' | 'REJEITADO';

/**
 * Participant (Participante) model
 * Represents a player joining a game with a specific character sheet
 */
export interface Participante {
  id: number;
  jogoId: number;
  jogadorId: number;
  fichaId?: number;
  status: ParticipanteStatus;
  dataParticipacao: Date;

  // Nested objects (populated by backend)
  jogador?: User;
  ficha?: Ficha;
}
