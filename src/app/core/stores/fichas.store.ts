import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { Ficha } from '../models';

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
 * ⚠️ IMPORTANTE: Store é APENAS para ESTADO
 * - NÃO faz chamadas HTTP
 * - APENAS métodos síncronos para atualizar estado
 * - Services/Facades chamam API e depois atualizam Store
 */
export const FichasStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withMethods((store: any) => ({
    // ============================================
    // LOADING STATE
    // ============================================

    setLoading(loading: boolean) {
      patchState(store, { loading });
    },

    setError(error: string | null) {
      patchState(store, { error, loading: false });
    },

    // ============================================
    // FICHAS STATE MUTATIONS
    // ============================================

    setFichas(fichas: Ficha[]) {
      patchState(store, { fichas, loading: false, error: null });
    },

    addFicha(ficha: Ficha) {
      patchState(store, {
        fichas: [...store.fichas(), ficha],
        loading: false,
        error: null
      });
    },

    updateFichaInState(id: number, updates: Partial<Ficha>) {
      patchState(store, {
        fichas: store.fichas().map((f: Ficha) =>
          f.id === id ? { ...f, ...updates } : f
        ),
        loading: false,
        error: null
      });
    },

    removeFicha(id: number) {
      patchState(store, {
        fichas: store.fichas().filter((f: Ficha) => f.id !== id),
        loading: false,
        error: null
      });
    },

    // ============================================
    // CURRENT FICHA (para edição)
    // ============================================

    setCurrentFicha(ficha: Ficha | null) {
      patchState(store, {
        currentFicha: ficha,
        loading: false,
        error: null
      });
    },

    clearCurrentFicha() {
      patchState(store, { currentFicha: null });
    },

    // ============================================
    // GETTERS
    // ============================================

    getFichasPorJogo(jogoId: number): Ficha[] {
      return store.fichas().filter((f: Ficha) => f.jogoId === jogoId);
    }
  }))
);
