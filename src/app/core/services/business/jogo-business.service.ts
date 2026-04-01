import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { JogosStore } from '@core/stores/jogos.store';
import { JogosApiService } from '@core/services/api/jogos-api.service';
import { JogoResumo, Jogo, MeuJogo } from '@core/models/jogo.model';
import { CreateJogoDto, UpdateJogoDto } from '@core/models/dtos/jogo.dto';

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

  loadJogos(): Observable<JogoResumo[]> {
    return this.jogosApi.listJogos().pipe(
      tap(jogos => this.jogosStore.setJogos(jogos))
    );
  }

  loadMeusJogos(): Observable<MeuJogo[]> {
    return this.jogosApi.listMeusJogos();
  }

  getJogo(id: number): Observable<Jogo> {
    return this.jogosApi.getJogo(id);
  }

  // ============================================
  // CRUD
  // ============================================

  createJogo(dto: CreateJogoDto): Observable<Jogo> {
    return this.jogosApi.createJogo(dto);
  }

  updateJogo(id: number, dto: UpdateJogoDto): Observable<Jogo> {
    return this.jogosApi.updateJogo(id, dto);
  }

  deleteJogo(id: number): Observable<void> {
    return this.jogosApi.deleteJogo(id).pipe(
      tap(() => this.jogosStore.removeJogo(id))
    );
  }
}
