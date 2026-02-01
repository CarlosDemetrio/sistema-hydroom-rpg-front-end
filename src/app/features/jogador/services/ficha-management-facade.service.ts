import { Injectable, inject, computed } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { FichasStore } from '../../../core/stores/fichas.store';
import { FichasApiService } from '../../../core/services/api/fichas-api.service';
import { Ficha } from '../../../core/models';
import { AuthService } from '../../../services/auth.service';

/**
 * Ficha Management Facade Service
 *
 * 🎯 CORE DA APLICAÇÃO - PRIORIDADE MÁXIMA
 *
 * Fichas (personagens) são o foco principal do sistema
 * Jogos e Configurações são secundários
 *
 * Component → Facade (Observable) → API Service → Backend
 *                ↓ tap(Store.setState())
 *            | async pipe ou subscribe
 */
@Injectable({
  providedIn: 'root'
})
export class FichaManagementFacadeService {
  private fichasStore = inject(FichasStore);
  private fichasApi = inject(FichasApiService);
  private authService = inject(AuthService);

  // Exposed state (read-only)
  fichas = this.fichasStore.fichas;
  currentFicha = this.fichasStore.currentFicha;
  loading = this.fichasStore.loading;
  error = this.fichasStore.error;

  // ============================================
  // COMPUTED STATS (CORE UX)
  // ============================================

  /**
   * Fichas do usuário atual (Jogador)
   * ⚠️ Para Mestre, retorna todas
   */
  minhasFichas = computed(() => {
    const user = this.authService.currentUser();
    const isMestre = this.authService.isMestre();

    if (isMestre) {
      return this.fichasStore.fichas(); // Mestre vê todas
    }

    // Jogador vê apenas suas fichas
    const userId = user?.id ? Number(user.id) : undefined;
    return this.fichasStore.fichas().filter(f => f.jogadorId === userId);
  });

  /**
   * Total de fichas do usuário
   */
  totalFichas = computed(() => this.minhasFichas().length);

  /**
   * Fichas recentes (últimas 5)
   */
  fichasRecentes = computed(() => {
    return this.minhasFichas()
      .slice()
      .sort((a, b) => new Date(b.dataAtualizacao || 0).getTime() - new Date(a.dataAtualizacao || 0).getTime())
      .slice(0, 5);
  });

  /**
   * Fichas por jogo
   */
  fichasPorJogo(jogoId: number) {
    return computed(() =>
      this.fichasStore.fichas().filter(f => f.jogoId === jogoId)
    );
  }

  // ============================================
  // LOAD METHODS (API → Store)
  // ============================================

  /**
   * Carrega todas as fichas
   * Backend filtra por role (Mestre vê todas, Jogador vê só suas)
   */
  loadFichas(filters?: { jogoId?: number }): Observable<Ficha[]> {
    return this.fichasApi.listFichas(filters).pipe(
      tap(fichas => this.fichasStore.setFichas(fichas))
    );
  }

  /**
   * Carrega ficha específica (API → Store)
   * Store é apenas CACHE, API é fonte da verdade
   */
  getFicha(id: number): Observable<Ficha> {
    return this.fichasApi.getFicha(id).pipe(
      tap(ficha => {
        this.fichasStore.updateFichaInState(id, ficha);
        this.fichasStore.setCurrentFicha(ficha);
      })
    );
  }

  // ============================================
  // CRUD METHODS (API → Store)
  // ============================================

  /**
   * Cria nova ficha
   * Backend calcula TODOS os valores derivados (BBA, BBM, vidaTotal, etc.)
   */
  createFicha(data: Partial<Ficha>): Observable<Ficha> {
    return this.fichasApi.createFicha(data).pipe(
      tap(novaFicha => {
        this.fichasStore.addFicha(novaFicha);
        this.fichasStore.setCurrentFicha(novaFicha);
      })
    );
  }

  /**
   * Atualiza ficha existente
   * Backend RECALCULA TODOS os valores derivados
   * Frontend SEMPRE usa valores do backend (fonte oficial)
   */
  updateFicha(id: number, data: Partial<Ficha>): Observable<Ficha> {
    return this.fichasApi.updateFicha(id, data).pipe(
      tap(fichaAtualizada => {
        this.fichasStore.updateFichaInState(id, fichaAtualizada);
        this.fichasStore.setCurrentFicha(fichaAtualizada);
      })
    );
  }

  /**
   * Deleta ficha
   */
  deleteFicha(id: number): Observable<void> {
    return this.fichasApi.deleteFicha(id).pipe(
      tap(() => {
        this.fichasStore.removeFicha(id);
        if (this.fichasStore.currentFicha()?.id === id) {
          this.fichasStore.clearCurrentFicha();
        }
      })
    );
  }

  // ============================================
  // UI HELPERS
  // ============================================

  /**
   * Define ficha atual para edição
   */
  setCurrentFicha(ficha: Ficha | null) {
    this.fichasStore.setCurrentFicha(ficha);
  }

  /**
   * Limpa ficha atual
   */
  clearCurrentFicha() {
    this.fichasStore.clearCurrentFicha();
  }
}
