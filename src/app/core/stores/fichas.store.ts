import { computed, inject } from '@angular/core';
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { Ficha } from '../models';
import { FichasApiService } from '../services/api/fichas-api.service';

/**
 * State interface for Fichas
 */
interface FichasState {
  fichas: Ficha[];
  currentFicha: Ficha | null;
  loading: boolean;
  error: string | null;
}

/**
 * Initial state
 */
const initialState: FichasState = {
  fichas: [],
  currentFicha: null,
  loading: false,
  error: null
};

/**
 * SignalStore for Character Sheets (Fichas) state management
 *
 * IMPORTANT: Backend recalculates all derived stats on save
 * Always use values from backend response (currentFicha) as source of truth
 *
 * Provides:
 * - State: fichas, currentFicha, loading, error
 * - Computed: minhasFichas, fichasPorJogo
 * - Methods: loadFichas, getFicha, createFicha, updateFicha, deleteFicha
 * - Methods: setCurrentFicha, clearCurrentFicha
 */
export const FichasStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withComputed((state: { fichas: () => Ficha[] }) => ({
    /**
     * Filter fichas by current user (Jogador)
     * Note: Requires currentUser from AuthService
     */
    minhasFichas: computed(() => {
      // TODO: Inject AuthService and filter by jogadorId === currentUser.id
      // For now, return all
      return state.fichas();
    })
  })),

  withMethods((store: any, fichasApi = inject(FichasApiService)) => ({
    /**
     * Get fichas for a specific game
     */
    fichasPorJogo(jogoId: number) {
      return computed(() => store.fichas().filter((f: Ficha) => f.jogoId === jogoId));
    },
    /**
     * Load all character sheets
     */
    async loadFichas(filters?: { jogoId?: number; jogadorId?: number }) {
      patchState(store, { loading: true, error: null });

      try {
        const fichas = await fichasApi.listFichas(filters);
        patchState(store, { fichas, loading: false });
      } catch (error) {
        patchState(store, {
          error: 'Erro ao carregar fichas',
          loading: false
        });
        console.error('Error loading fichas:', error);
        throw error;
      }
    },

    /**
     * Get character sheet by ID
     * Sets as currentFicha and returns
     */
    async getFicha(id: number) {
      patchState(store, { loading: true, error: null });

      try {
        const ficha = await fichasApi.getFicha(id);
        patchState(store, {
          currentFicha: ficha,
          loading: false
        });
        return ficha;
      } catch (error) {
        patchState(store, {
          error: 'Erro ao carregar ficha',
          loading: false
        });
        console.error('Error loading ficha:', error);
        throw error;
      }
    },

    /**
     * Create new character sheet
     * Backend recalculates all derived stats
     */
    async createFicha(ficha: Partial<Ficha>) {
      patchState(store, { loading: true, error: null });

      try {
        const novaFicha = await fichasApi.createFicha(ficha);
        // Backend response includes RECALCULATED values - use as source of truth
        patchState(store, {
          fichas: [...store.fichas(), novaFicha],
          currentFicha: novaFicha,
          loading: false
        });
        return novaFicha;
      } catch (error) {
        patchState(store, {
          error: 'Erro ao criar ficha',
          loading: false
        });
        console.error('Error creating ficha:', error);
        throw error;
      }
    },

    /**
     * Update existing character sheet
     * Backend recalculates all derived stats
     * Frontend MUST replace temporary values with backend response
     */
    async updateFicha(id: number, updates: Partial<Ficha>) {
      patchState(store, { loading: true, error: null });

      try {
        const fichaAtualizada = await fichasApi.updateFicha(id, updates);
        // Backend response includes RECALCULATED values - REPLACE temporaries
        patchState(store, {
          fichas: store.fichas().map((f: Ficha) => f.id === id ? fichaAtualizada : f),
          currentFicha: store.currentFicha()?.id === id ? fichaAtualizada : store.currentFicha(),
          loading: false
        });
        return fichaAtualizada;
      } catch (error) {
        patchState(store, {
          error: 'Erro ao atualizar ficha',
          loading: false
        });
        console.error('Error updating ficha:', error);
        throw error;
      }
    },

    /**
     * Delete character sheet
     */
    async deleteFicha(id: number) {
      patchState(store, { loading: true, error: null });

      try {
        await fichasApi.deleteFicha(id);
        patchState(store, {
          fichas: store.fichas().filter((f: Ficha) => f.id !== id),
          currentFicha: store.currentFicha()?.id === id ? null : store.currentFicha(),
          loading: false
        });
      } catch (error) {
        patchState(store, {
          error: 'Erro ao excluir ficha',
          loading: false
        });
        console.error('Error deleting ficha:', error);
        throw error;
      }
    },

    /**
     * Set current ficha (for viewing/editing)
     */
    setCurrentFicha(ficha: Ficha | null) {
      patchState(store, { currentFicha: ficha });
    },

    /**
     * Clear current ficha
     */
    clearCurrentFicha() {
      patchState(store, { currentFicha: null });
    }
  }))
);
