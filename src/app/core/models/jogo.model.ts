import { User } from './user.model';
import { Participante } from './participante.model';

/**
 * Game status enum
 */
export type JogoStatus = 'ATIVO' | 'PAUSADO' | 'FINALIZADO';

/**
 * Game (Jogo) model representing an RPG campaign
 * Created and managed by Mestre (Game Master)
 */
export interface Jogo {
  id: number;
  nome: string;
  descricao?: string;
  mestreId: number;
  status: JogoStatus;
  dataCriacao: Date;

  // Nested objects (populated by backend)
  mestre?: User;
  participantes?: Participante[];
}
