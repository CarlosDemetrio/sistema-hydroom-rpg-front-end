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
    return this.availableGames().find(j => j.id === id) || null;
  });

  // ID do jogo atual (read-only)
  currentGameId = computed(() => this._currentGameId());

  // Jogos disponíveis para seleção (apenas ATIVO)
  availableGames = computed(() =>
    this.jogoService.jogos().filter(j => j.ativo)
  );

  // Verifica se há jogo selecionado
  hasCurrentGame = computed(() => this.currentGame() !== null);

  constructor() {
    // Mantém a seleção alinhada com a lista atual de jogos disponíveis.
    // Se houver apenas um jogo ativo, seleciona automaticamente.
    // Se houver vários e a seleção for inválida, limpa para o usuário escolher explicitamente.
    effect(() => {
      if (this.availableGames().length > 0) {
        this.syncSelection(false);
      }
    });

    // Persiste mudanças no localStorage
    effect(() => {
      const id = this._currentGameId();
      if (id !== null) {
        this.saveToStorage(id);
      } else {
        localStorage.removeItem('currentGameId');
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

  /**
   * Revalida a seleção atual contra os jogos disponíveis já carregados.
   * Útil após um refresh explícito da lista de jogos (guards/header).
   */
  reconcileSelection() {
    this.syncSelection(true);
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

  private syncSelection(clearWhenNoGames: boolean) {
    const games = this.availableGames();
    const selectedId = this._currentGameId();

    if (games.length === 0) {
      if (clearWhenNoGames && selectedId !== null) {
        this.clearGame();
      }
      return;
    }

    if (selectedId !== null && games.some(game => game.id === selectedId)) {
      return;
    }

    if (games.length === 1) {
      this.selectGame(games[0].id!);
      return;
    }

    if (selectedId !== null) {
      this.clearGame();
    }
  }
}
