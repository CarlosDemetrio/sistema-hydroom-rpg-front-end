import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { JogosStore } from '../../stores/jogos.store';
import { JogosApiService } from '../api/jogos-api.service';
import { Participante } from '../../models';

/**
 * Participante Business Service
 *
 * Responsabilidades:
 * - Lógica de negócio de Participantes
 * - Gerenciamento de aprovações/rejeições
 * - Atualiza Store
 */
@Injectable({
  providedIn: 'root'
})
export class ParticipanteBusinessService {
  private jogosStore = inject(JogosStore);
  private jogosApi = inject(JogosApiService);

  // ============================================
  // LOAD
  // ============================================

  loadParticipantes(jogoId: number): Observable<Participante[]> {
    return this.jogosApi.listParticipantes(jogoId).pipe(
      tap(participantes => this.jogosStore.setParticipantes(jogoId, participantes))
    );
  }

  // ============================================
  // CRUD
  // ============================================

  solicitarParticipacao(jogoId: number, fichaId: number): Observable<Participante> {
    return this.jogosApi.solicitarParticipacao(jogoId, fichaId).pipe(
      tap(participante => this.jogosStore.addParticipante(jogoId, participante))
    );
  }

  aprovarParticipante(jogoId: number, participanteId: number): Observable<Participante> {
    return this.jogosApi.updateParticipante(jogoId, participanteId, 'APROVADO').pipe(
      tap(updated => this.jogosStore.updateParticipanteInState(jogoId, participanteId, updated))
    );
  }

  rejeitarParticipante(jogoId: number, participanteId: number): Observable<Participante> {
    return this.jogosApi.updateParticipante(jogoId, participanteId, 'REJEITADO').pipe(
      tap(updated => this.jogosStore.updateParticipanteInState(jogoId, participanteId, updated))
    );
  }

  removerParticipante(jogoId: number, participanteId: number): Observable<void> {
    return this.jogosApi.removerParticipante(jogoId, participanteId).pipe(
      tap(() => this.jogosStore.removeParticipante(jogoId, participanteId))
    );
  }

  // ============================================
  // BUSINESS LOGIC
  // ============================================

  /**
   * Retorna participantes por status
   */
  getParticipantesByStatus(jogoId: number, status: 'APROVADO' | 'PENDENTE' | 'REJEITADO') {
    return this.jogosStore.getParticipantes(jogoId).filter(p => p.status === status);
  }

  /**
   * Conta participantes aprovados
   */
  countAprovados(jogoId: number): number {
    return this.getParticipantesByStatus(jogoId, 'APROVADO').length;
  }

  /**
   * Conta solicitações pendentes
   */
  countPendentes(jogoId: number): number {
    return this.getParticipantesByStatus(jogoId, 'PENDENTE').length;
  }
}
