import { computed, inject } from '@angular/core';
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { Jogo, Participante } from '../models';
import { JogosApiService } from '../services/api/jogos-api.service';

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
 * Provides:
 * - State: jogos, participantes, loading, error
 * - Computed: jogosAtivos, meusJogos
 * - Methods: loadJogos, createJogo, updateJogo, deleteJogo
 * - Methods: loadParticipantes, solicitarParticipacao, aprovarParticipante, rejeitarParticipante
 */
export const JogosStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withComputed((state: { jogos: () => Jogo[] }) => ({
    /**
     * Filter jogos by ATIVO status
     */
    jogosAtivos: computed(() =>
      state.jogos().filter((j: Jogo) => j.status === 'ATIVO')
    ),

    /**
     * Filter jogos where current user is mestre
     * Note: Requires currentUser from AuthService
     */
    meusJogos: computed(() => {
      // TODO: Inject AuthService and filter by mestreId === currentUser.id
      // For now, return all
      return state.jogos();
    })
  })),

  withMethods((store: any, jogosApi = inject(JogosApiService)) => ({
    /**
     * Load all games
     */
    async loadJogos(filters?: { status?: 'ATIVO' | 'PAUSADO' | 'FINALIZADO'; search?: string }) {
      patchState(store, { loading: true, error: null });

      try {
        const jogos = await jogosApi.listJogos(filters);
        patchState(store, { jogos, loading: false });
      } catch (error) {
        patchState(store, {
          error: 'Erro ao carregar jogos',
          loading: false
        });
        console.error('Error loading jogos:', error);
        throw error;
      }
    },

    /**
     * Create new game
     */
    async createJogo(nome: string, descricao?: string) {
      patchState(store, { loading: true, error: null });

      try {
        const novoJogo = await jogosApi.createJogo({ nome, descricao });
        patchState(store, {
          jogos: [...store.jogos(), novoJogo],
          loading: false
        });
        return novoJogo;
      } catch (error) {
        patchState(store, {
          error: 'Erro ao criar jogo',
          loading: false
        });
        console.error('Error creating jogo:', error);
        throw error;
      }
    },

    /**
     * Update existing game
     */
    async updateJogo(id: number, updates: { nome?: string; descricao?: string; status?: 'ATIVO' | 'PAUSADO' | 'FINALIZADO' }) {
      patchState(store, { loading: true, error: null });

      try {
        const jogoAtualizado = await jogosApi.updateJogo(id, updates);
        patchState(store, {
          jogos: store.jogos().map((j: Jogo) => j.id === id ? jogoAtualizado : j),
          loading: false
        });
        return jogoAtualizado;
      } catch (error) {
        patchState(store, {
          error: 'Erro ao atualizar jogo',
          loading: false
        });
        console.error('Error updating jogo:', error);
        throw error;
      }
    },

    /**
     * Delete game
     */
    async deleteJogo(id: number) {
      patchState(store, { loading: true, error: null });

      try {
        await jogosApi.deleteJogo(id);
        patchState(store, {
          jogos: store.jogos().filter((j: Jogo) => j.id !== id),
          loading: false
        });
      } catch (error) {
        patchState(store, {
          error: 'Erro ao excluir jogo',
          loading: false
        });
        console.error('Error deleting jogo:', error);
        throw error;
      }
    },

    /**
     * Load participants for a specific game
     */
    async loadParticipantes(jogoId: number) {
      patchState(store, { loading: true, error: null });

      try {
        const participantes = await jogosApi.listParticipantes(jogoId);
        const newMap = new Map(store.participantes());
        newMap.set(jogoId, participantes);
        patchState(store, {
          participantes: newMap,
          loading: false
        });
      } catch (error) {
        patchState(store, {
          error: 'Erro ao carregar participantes',
          loading: false
        });
        console.error('Error loading participantes:', error);
        throw error;
      }
    },

    /**
     * Request to join game (Jogador)
     */
    async solicitarParticipacao(jogoId: number, fichaId: number) {
      patchState(store, { loading: true, error: null });

      try {
        const novoParticipante = await jogosApi.solicitarParticipacao(jogoId, fichaId);
        const currentParticipantes = store.participantes().get(jogoId) || [];
        const newMap = new Map(store.participantes());
        newMap.set(jogoId, [...currentParticipantes, novoParticipante]);
        patchState(store, {
          participantes: newMap,
          loading: false
        });
        return novoParticipante;
      } catch (error) {
        patchState(store, {
          error: 'Erro ao solicitar participação',
          loading: false
        });
        console.error('Error requesting participation:', error);
        throw error;
      }
    },

    /**
     * Approve or reject participant (Mestre)
     */
    async updateStatusParticipante(jogoId: number, participanteId: number, status: 'APROVADO' | 'REJEITADO') {
      patchState(store, { loading: true, error: null });

      try {
        const participanteAtualizado = await jogosApi.updateParticipante(jogoId, participanteId, status);
        const currentParticipantes = store.participantes().get(jogoId) || [];
        const newMap = new Map(store.participantes());
        newMap.set(
          jogoId,
          currentParticipantes.map((p: Participante) => p.id === participanteId ? participanteAtualizado : p)
        );
        patchState(store, {
          participantes: newMap,
          loading: false
        });
        return participanteAtualizado;
      } catch (error) {
        patchState(store, {
          error: `Erro ao ${status === 'APROVADO' ? 'aprovar' : 'rejeitar'} participante`,
          loading: false
        });
        console.error('Error updating participant status:', error);
        throw error;
      }
    },

    /**
     * Remove participant
     */
    async removerParticipante(jogoId: number, participanteId: number) {
      patchState(store, { loading: true, error: null });

      try {
        await jogosApi.removerParticipante(jogoId, participanteId);
        const currentParticipantes = store.participantes().get(jogoId) || [];
        const newMap = new Map(store.participantes());
        newMap.set(
          jogoId,
          currentParticipantes.filter((p: Participante) => p.id !== participanteId)
        );
        patchState(store, {
          participantes: newMap,
          loading: false
        });
      } catch (error) {
        patchState(store, {
          error: 'Erro ao remover participante',
          loading: false
        });
        console.error('Error removing participant:', error);
        throw error;
      }
    },

    /**
     * Get participants for a specific game
     */
    getParticipantes(jogoId: number): Participante[] {
      return store.participantes().get(jogoId) || [];
    }
  }))
);
