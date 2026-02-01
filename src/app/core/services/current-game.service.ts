import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { JogoBusinessService } from './business/jogo-business.service';

/**
 * Current Game Service
 *
 * 🎯 CORE DO SISTEMA - Gerencia o "Jogo Atual"
 *
 * Conceito:
 * - Usuário seleciona um jogo ativo
 * - Tod o o sistema mostra apenas dados desse jogo
 * - Persiste no localStorage
 * - Mestre pode trocar entre jogos
 * - Jogador vê apenas jogos que participa
 *
 * Responsabilidades:
 * - Signal do jogo atual
 * - Computed de fichas/participantes do jogo atual
 * - Persistência no localStorage
 */
@Injectable({
  providedIn: 'root'
})
export class CurrentGameService {
  private jogoService = inject(JogoBusinessService);

  // Signal do jogo atual selecionado
  private _currentGameId = signal<number | null>(this.loadFromStorage());

  // Jogo atual completo (computed)
  currentGame = computed(() => {
    const id = this._currentGameId();
    if (!id) return null;
    return this.jogoService.jogos().find(j => j.id === id) || null;
  });

  // ID do jogo atual (read-only)
  currentGameId = computed(() => this._currentGameId());

  // Jogos disponíveis para seleção (apenas ATIVO)
  availableGames = computed(() =>
    this.jogoService.jogos().filter(j => j.status === 'ATIVO')
  );

  // Verifica se há jogo selecionado
  hasCurrentGame = computed(() => !!this._currentGameId());

  constructor() {
    // Auto-seleciona o primeiro jogo se não houver seleção
    effect(() => {
      if (!this.hasCurrentGame() && this.availableGames().length > 0) {
        this.selectGame(this.availableGames()[0].id!);
      }
    });

    // Persiste mudanças no localStorage
    effect(() => {
      const id = this._currentGameId();
      if (id) {
        this.saveToStorage(id);
      }
    });
  }

  // ============================================
  // ACTIONS
  // ============================================

  /**
   * Seleciona um jogo como atual
   */
  selectGame(gameId: number) {
    this._currentGameId.set(gameId);
  }

  /**
   * Limpa seleção de jogo
   */
  clearGame() {
    this._currentGameId.set(null);
    localStorage.removeItem('currentGameId');
  }

  // ============================================
  // PERSISTENCE (localStorage)
  // ============================================

  private saveToStorage(gameId: number) {
    localStorage.setItem('currentGameId', gameId.toString());
  }

  private loadFromStorage(): number | null {
    const stored = localStorage.getItem('currentGameId');
    return stored ? parseInt(stored, 10) : null;
  }
}
