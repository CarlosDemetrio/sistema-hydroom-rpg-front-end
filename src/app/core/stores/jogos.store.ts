import { computed } from '@angular/core';
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { JogoResumo } from '../models/jogo.model';
import { Participante } from '../models/participante.model';

// Alias for backwards compatibility within the store
type Jogo = JogoResumo;

/**
 * State interface for Jogos
 */
interface JogosState {
  jogos: Jogo[];
  participantes: Map<number, Participante[]>;
  loading: boolean;
  error: string | null;
}

/**
 * Initial state
 */
const initialState: JogosState = {
  jogos: [],
  participantes: new Map(),
  loading: false,
  error: null
};

/**
 * SignalStore for Games (Jogos) state management
 *
 * ⚠️ IMPORTANTE: Store é APENAS para ESTADO
 * - NÃO faz chamadas HTTP
 * - NÃO tem lógica de negócio
 * - APENAS métodos síncronos para atualizar estado
 *
 * Services/Facades chamam API e depois atualizam Store
 */
export const JogosStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withComputed((state: { jogos: () => Jogo[] }) => ({
    /**
     * Filter jogos by ATIVO status
     */
    jogosAtivos: computed(() =>
      state.jogos().filter((j: Jogo) => j.ativo === true)
    )
  })),

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
    // JOGOS STATE MUTATIONS
    // ============================================

    setJogos(jogos: Jogo[]) {
      patchState(store, { jogos, loading: false, error: null });
    },

    addJogo(jogo: Jogo) {
      patchState(store, {
        jogos: [...store.jogos(), jogo],
        loading: false,
        error: null
      });
    },

    updateJogoInState(id: number, updates: Partial<Jogo>) {
      patchState(store, {
        jogos: store.jogos().map((j: Jogo) =>
          j.id === id ? { ...j, ...updates } : j
        ),
        loading: false,
        error: null
      });
    },

    removeJogo(id: number) {
      patchState(store, {
        jogos: store.jogos().filter((j: Jogo) => j.id !== id),
        loading: false,
        error: null
      });
    },

    // ============================================
    // PARTICIPANTES STATE MUTATIONS
    // ============================================

    setParticipantes(jogoId: number, participantes: Participante[]) {
      const newMap = new Map(store.participantes());
      newMap.set(jogoId, participantes);
      patchState(store, {
        participantes: newMap,
        loading: false,
        error: null
      });
    },

    addParticipante(jogoId: number, participante: Participante) {
      const currentParticipantes = store.participantes().get(jogoId) || [];
      const newMap = new Map(store.participantes());
      newMap.set(jogoId, [...currentParticipantes, participante]);
      patchState(store, {
        participantes: newMap,
        loading: false,
        error: null
      });
    },

    updateParticipanteInState(jogoId: number, participanteId: number, updates: Partial<Participante>) {
      const currentParticipantes = store.participantes().get(jogoId) || [];
      const newMap = new Map(store.participantes());
      newMap.set(
        jogoId,
        currentParticipantes.map((p: Participante) =>
          p.id === participanteId ? { ...p, ...updates } : p
        )
      );
      patchState(store, {
        participantes: newMap,
        loading: false,
        error: null
      });
    },

    removeParticipante(jogoId: number, participanteId: number) {
      const currentParticipantes = store.participantes().get(jogoId) || [];
      const newMap = new Map(store.participantes());
      newMap.set(
        jogoId,
        currentParticipantes.filter((p: Participante) => p.id !== participanteId)
      );
      patchState(store, {
        participantes: newMap,
        loading: false,
        error: null
      });
    },

    // ============================================
    // GETTERS
    // ============================================

    getParticipantes(jogoId: number): Participante[] {
      return store.participantes().get(jogoId) || [];
    }
  }))
);
