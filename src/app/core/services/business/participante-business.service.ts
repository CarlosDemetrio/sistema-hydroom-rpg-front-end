import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { JogosStore } from '@core/stores/jogos.store';
import { JogosApiService } from '@core/services/api/jogos-api.service';
import { Participante, StatusParticipante } from '@core/models/participante.model';

/**
 * Participante Business Service
 *
 * Responsabilidades:
 * - Lógica de negócio de Participantes
 * - Gerenciamento de aprovações/rejeições/banimentos
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

  loadParticipantes(jogoId: number, status?: StatusParticipante): Observable<Participante[]> {
    return this.jogosApi.listParticipantes(jogoId, status).pipe(
      tap(participantes => this.jogosStore.setParticipantes(jogoId, participantes))
    );
  }

  // ============================================
  // CRUD
  // ============================================

  solicitarParticipacao(jogoId: number): Observable<Participante> {
    return this.jogosApi.solicitarParticipacao(jogoId).pipe(
      tap(participante => this.jogosStore.addParticipante(jogoId, participante))
    );
  }

  aprovarParticipante(jogoId: number, participanteId: number): Observable<Participante> {
    return this.jogosApi.aprovarParticipante(jogoId, participanteId).pipe(
      tap(updated => this.jogosStore.updateParticipanteInState(jogoId, participanteId, updated))
    );
  }

  rejeitarParticipante(jogoId: number, participanteId: number): Observable<Participante> {
    return this.jogosApi.rejeitarParticipante(jogoId, participanteId).pipe(
      tap(updated => this.jogosStore.updateParticipanteInState(jogoId, participanteId, updated))
    );
  }

  banirParticipante(jogoId: number, participanteId: number): Observable<Participante> {
    return this.jogosApi.banirParticipante(jogoId, participanteId).pipe(
      tap(updated => this.jogosStore.updateParticipanteInState(jogoId, participanteId, updated))
    );
  }

  desbanirParticipante(jogoId: number, participanteId: number): Observable<Participante> {
    return this.jogosApi.desbanirParticipante(jogoId, participanteId).pipe(
      tap(updated => this.jogosStore.updateParticipanteInState(jogoId, participanteId, updated))
    );
  }

  removerParticipante(jogoId: number, participanteId: number): Observable<void> {
    return this.jogosApi.removerParticipante(jogoId, participanteId).pipe(
      tap(() => this.jogosStore.removeParticipante(jogoId, participanteId))
    );
  }

  meuStatus(jogoId: number): Observable<Participante | null> {
    return this.jogosApi.meuStatusParticipacao(jogoId);
  }

  cancelarSolicitacao(jogoId: number): Observable<void> {
    return this.jogosApi.cancelarSolicitacao(jogoId).pipe(
      tap(() => this.loadParticipantes(jogoId).subscribe())
    );
  }

  // ============================================
  // BUSINESS LOGIC
  // ============================================

  getParticipantesByStatus(jogoId: number, status: StatusParticipante): Participante[] {
    return this.jogosStore.getParticipantes(jogoId).filter(p => p.status === status);
  }

  countAprovados(jogoId: number): number {
    return this.getParticipantesByStatus(jogoId, 'APROVADO').length;
  }

  countPendentes(jogoId: number): number {
    return this.getParticipantesByStatus(jogoId, 'PENDENTE').length;
  }
}
