import { Injectable, inject, computed } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { FichasStore } from '../../stores/fichas.store';
import { FichasApiService } from '../api/fichas-api.service';
import { Ficha } from '../../models';
import { AuthService } from '../../../services/auth.service';

/**
 * Ficha Business Service
 *
 * 🎯 CORE DA APLICAÇÃO - PRIORIDADE MÁXIMA
 *
 * Responsabilidades:
 * - Lógica de negócio de Fichas (personagens)
 * - Validações
 * - Cálculos client-side TEMPORÁRIOS (preview)
 * - Atualiza Store
 *
 * ⚠️ IMPORTANTE:
 * - Backend SEMPRE recalcula valores derivados ao salvar
 * - Frontend usa cálculos APENAS para preview/UX responsiva
 * - Backend é fonte oficial dos valores
 */
@Injectable({
  providedIn: 'root'
})
export class FichaBusinessService {
  private fichasStore = inject(FichasStore);
  private fichasApi = inject(FichasApiService);
  private authService = inject(AuthService);

  // Exposed state
  fichas = this.fichasStore.fichas;
  currentFicha = this.fichasStore.currentFicha;
  loading = this.fichasStore.loading;
  error = this.fichasStore.error;

  // ============================================
  // COMPUTED (BUSINESS LOGIC)
  // ============================================

  /**
   * Fichas do usuário atual
   */
  minhasFichas = computed(() => {
    const user = this.authService.currentUser();
    const isMestre = this.authService.isMestre();

    if (isMestre) {
      return this.fichasStore.fichas(); // Mestre vê todas
    }

    // Converte user.id (string) para number para comparação
    const userId = user?.id ? Number(user.id) : undefined;
    return this.fichasStore.fichas().filter(f => f.jogadorId === userId);
  });

  totalFichas = computed(() => this.minhasFichas().length);

  fichasRecentes = computed(() => {
    return this.minhasFichas()
      .slice()
      .sort((a, b) => new Date(b.dataAtualizacao || 0).getTime() - new Date(a.dataAtualizacao || 0).getTime())
      .slice(0, 5);
  });

  // ============================================
  // LOAD
  // ============================================

  loadFichas(filters?: { jogoId?: number }): Observable<Ficha[]> {
    return this.fichasApi.listFichas(filters).pipe(
      tap(fichas => this.fichasStore.setFichas(fichas))
    );
  }

  getFicha(id: number): Observable<Ficha> {
    return this.fichasApi.getFicha(id).pipe(
      tap(ficha => {
        this.fichasStore.updateFichaInState(id, ficha);
        this.fichasStore.setCurrentFicha(ficha);
      })
    );
  }

  // ============================================
  // CRUD
  // ============================================

  /**
   * Cria nova ficha
   * Backend calcula TODOS os valores derivados
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
   * Atualiza ficha
   * Backend RECALCULA todos os valores derivados
   */
  updateFicha(id: number, data: Partial<Ficha>): Observable<Ficha> {
    return this.fichasApi.updateFicha(id, data).pipe(
      tap(fichaAtualizada => {
        this.fichasStore.updateFichaInState(id, fichaAtualizada);
        this.fichasStore.setCurrentFicha(fichaAtualizada);
      })
    );
  }

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

  setCurrentFicha(ficha: Ficha | null) {
    this.fichasStore.setCurrentFicha(ficha);
  }

  clearCurrentFicha() {
    this.fichasStore.clearCurrentFicha();
  }

  // ============================================
  // BUSINESS LOGIC / VALIDATIONS
  // ============================================

  /**
   * Valida se ficha pode ser editada pelo usuário atual
   */
  canEdit(ficha: Ficha): boolean {
    const user = this.authService.currentUser();
    const isMestre = this.authService.isMestre();

    // Mestre pode editar qualquer ficha
    if (isMestre) return true;

    // Jogador só pode editar suas próprias fichas
    const userId = user?.id ? Number(user.id) : undefined;
    return ficha.jogadorId === userId;
  }

  /**
   * Verifica se ficha está vinculada a um jogo
   */
  hasJogo(ficha: Ficha): boolean {
    return !!ficha.jogoId;
  }

  /**
   * Verifica se ficha está completa (tem campos obrigatórios)
   */
  isComplete(ficha: Ficha): boolean {
    return !!(
      ficha.nome &&
      ficha.progressao?.nivel &&
      ficha.atributos?.length > 0
    );
  }
}
