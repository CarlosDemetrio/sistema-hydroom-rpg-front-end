import { RoleJogo } from './jogo.model';

export type StatusParticipante = 'PENDENTE' | 'APROVADO' | 'REJEITADO' | 'BANIDO';

/** Backward-compatibility alias */
export type ParticipanteStatus = StatusParticipante;

/**
 * Participante de um jogo.
 * Aligned with backend ParticipanteResponse record.
 */
export interface Participante {
  id: number;
  jogoId: number;
  usuarioId: number;
  nomeUsuario: string;
  role: RoleJogo;
  status: StatusParticipante;
  dataCriacao: string;
  dataUltimaAtualizacao: string;
}
