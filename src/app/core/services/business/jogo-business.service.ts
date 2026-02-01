import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { JogosStore } from '../../stores/jogos.store';
import { JogosApiService } from '../api/jogos-api.service';
import { Jogo, JogoStatus } from '../../models';

/**
 * Jogo Business Service
 *
 * Responsabilidades:
 * - Lógica de negócio de Jogos
 * - Chama API Service
 * - Atualiza Store
 *
 * NÃO tem:
 * - Coordenação com outros services (isso é do Facade)
 * - Lógica de UI (isso é do Component)
 */
@Injectable({
  providedIn: 'root'
})
export class JogoBusinessService {
  private jogosStore = inject(JogosStore);
  private jogosApi = inject(JogosApiService);

  // Exposed state
  jogos = this.jogosStore.jogos;
  loading = this.jogosStore.loading;
  error = this.jogosStore.error;

  // ============================================
  // LOAD
  // ============================================

  loadJogos(filters?: { status?: JogoStatus; search?: string }): Observable<Jogo[]> {
    return this.jogosApi.listJogos(filters).pipe(
      tap(jogos => this.jogosStore.setJogos(jogos))
    );
  }

  getJogo(id: number): Observable<Jogo> {
    return this.jogosApi.getJogo(id).pipe(
      tap(jogo => this.jogosStore.updateJogoInState(id, jogo))
    );
  }

  // ============================================
  // CRUD
  // ============================================

  createJogo(data: { nome: string; descricao?: string; status?: JogoStatus }): Observable<Jogo> {
    return this.jogosApi.createJogo(data).pipe(
      tap(novoJogo => this.jogosStore.addJogo(novoJogo))
    );
  }

  updateJogo(id: number, data: Partial<Jogo>): Observable<Jogo> {
    return this.jogosApi.updateJogo(id, data).pipe(
      tap(jogoAtualizado => this.jogosStore.updateJogoInState(id, jogoAtualizado))
    );
  }

  deleteJogo(id: number): Observable<void> {
    return this.jogosApi.deleteJogo(id).pipe(
      tap(() => this.jogosStore.removeJogo(id))
    );
  }


}
