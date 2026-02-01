import { Injectable } from '@angular/core';
import { Participante, Ficha, User } from '../../models';

/**
 * Business Service for Participant Management Rules
 *
 * Purpose:
 * - Validate participant requests
 * - Apply approval/rejection rules
 * - Check permissions and eligibility
 *
 * Rules:
 * - Jogador can only request with own fichas
 * - Ficha must not already be in another game (optional rule)
 * - Mestre can approve/reject any participant in their games
 * - Jogador can remove own participation
 *
 * @providedIn 'root'
 */
@Injectable({
  providedIn: 'root'
})
export class ParticipanteBusinessService {

  /**
   * Validate if a jogador can request to join a game with a specific ficha
   */
  canRequestParticipation(
    jogador: User,
    ficha: Ficha,
    existingParticipantes: Participante[]
  ): { valid: boolean; error?: string } {
    // Check if ficha belongs to jogador
    if (ficha.jogadorId !== jogador.id) {
      return {
        valid: false,
        error: 'Você só pode solicitar participação com suas próprias fichas'
      };
    }

    // Check if already participating
    const alreadyParticipating = existingParticipantes.some(
      p => p.jogadorId === jogador.id && p.fichaId === ficha.id
    );

    if (alreadyParticipating) {
      return {
        valid: false,
        error: 'Você já está participando deste jogo com esta ficha'
      };
    }

    // Check if ficha is already in another active game (optional rule)
    // This could be validated by checking ficha.jogoId if we enforce single-game rule
    // For now, allowing multiple games per ficha

    return { valid: true };
  }

  /**
   * Validate if a mestre can approve/reject a participant
   */
  canManageParticipant(
    mestre: User,
    mestreId: number,
    participante: Participante
  ): { valid: boolean; error?: string } {
    // Check if user is the game's mestre
    if (mestre.id !== mestreId) {
      return {
        valid: false,
        error: 'Apenas o mestre do jogo pode gerenciar participantes'
      };
    }

    // Check if participant is in PENDENTE status
    if (participante.status !== 'PENDENTE') {
      return {
        valid: false,
        error: 'Apenas participantes pendentes podem ser aprovados/rejeitados'
      };
    }

    return { valid: true };
  }

  /**
   * Validate if a user can remove a participant
   * (Mestre can remove anyone, Jogador can only remove self)
   */
  canRemoveParticipant(
    user: User,
    mestreId: number,
    participante: Participante
  ): { valid: boolean; error?: string } {
    const isMestre = user.id === mestreId;
    const isOwnParticipation = user.id === participante.jogadorId;

    if (!isMestre && !isOwnParticipation) {
      return {
        valid: false,
        error: 'Você só pode remover sua própria participação'
      };
    }

    return { valid: true };
  }

  /**
   * Get status display text
   */
  getStatusDisplay(status: 'PENDENTE' | 'APROVADO' | 'REJEITADO'): string {
    const statusMap = {
      PENDENTE: 'Aguardando Aprovação',
      APROVADO: 'Aprovado',
      REJEITADO: 'Rejeitado'
    };
    return statusMap[status] || status;
  }

  /**
   * Get status color class (for PrimeNG)
   */
  getStatusSeverity(status: 'PENDENTE' | 'APROVADO' | 'REJEITADO'): 'warn' | 'success' | 'danger' {
    const severityMap = {
      PENDENTE: 'warn' as const,
      APROVADO: 'success' as const,
      REJEITADO: 'danger' as const
    };
    return severityMap[status] || 'warn';
  }

  /**
   * Filter participantes by status
   */
  filterByStatus(
    participantes: Participante[],
    status: 'PENDENTE' | 'APROVADO' | 'REJEITADO'
  ): Participante[] {
    return participantes.filter(p => p.status === status);
  }

  /**
   * Get pending participantes count
   */
  getPendingCount(participantes: Participante[]): number {
    return this.filterByStatus(participantes, 'PENDENTE').length;
  }

  /**
   * Check if jogador has specific role
   */
  hasRole(user: User | null, role: 'MESTRE' | 'JOGADOR'): boolean {
    return user?.roles.includes(role) ?? false;
  }
}
