import { computed, inject } from '@angular/core';
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import {
  AtributoConfig,
  AptidaoConfig,
  TipoAptidao,
  NivelConfig,
  LimitadorConfig,
  ClassePersonagem,
  VantagemConfig,
  CategoriaVantagem,
  Raca,
  ProspeccaoConfig,
  PresencaConfig,
  GeneroConfig
} from '../models';
import { ConfigApiService } from '../services/api/config-api.service';

/**
 * State interface for all configuration entities
 */
interface ConfigState {
  // Atributos
  atributos: AtributoConfig[];
  atributosLoading: boolean;

  // Aptidões
  aptidoes: AptidaoConfig[];
  tiposAptidao: TipoAptidao[];
  aptidoesLoading: boolean;

  // Níveis
  niveis: NivelConfig[];
  niveisLoading: boolean;

  // Limitadores
  limitadores: LimitadorConfig[];
  limitadoresLoading: boolean;

  // Classes
  classes: ClassePersonagem[];
  classesLoading: boolean;

  // Vantagens
  vantagens: VantagemConfig[];
  categoriasVantagem: CategoriaVantagem[];
  vantagensLoading: boolean;

  // Raças
  racas: Raca[];
  racasLoading: boolean;

  // Prospecção
  prospeccao: ProspeccaoConfig[];
  prospeccaoLoading: boolean;

  // Presenças
  presencas: PresencaConfig[];
  presencasLoading: boolean;

  // Gêneros
  generos: GeneroConfig[];
  generosLoading: boolean;

  // Global error
  error: string | null;
}

/**
 * Initial state
 */
const initialState: ConfigState = {
  atributos: [],
  atributosLoading: false,
  aptidoes: [],
  tiposAptidao: [],
  aptidoesLoading: false,
  niveis: [],
  niveisLoading: false,
  limitadores: [],
  limitadoresLoading: false,
  classes: [],
  classesLoading: false,
  vantagens: [],
  categoriasVantagem: [],
  vantagensLoading: false,
  racas: [],
  racasLoading: false,
  prospeccao: [],
  prospeccaoLoading: false,
  presencas: [],
  presencasLoading: false,
  generos: [],
  generosLoading: false,
  error: null
};

/**
 * SignalStore for Configuration state management
 * Manages all game configuration entities (Mestre only)
 *
 * Provides:
 * - State for 10+ config entity types
 * - Computed: atributosAtivos, aptidoesFisicas, aptidoesMentais
 * - Methods: CRUD for each config type
 */
export const ConfigStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withComputed((state: any) => ({
    /**
     * Filter active attributes only
     */
    atributosAtivos: computed(() =>
      state.atributos().filter((a: AtributoConfig) => a.ativo)
    ),

    /**
     * Filter physical skills
     */
    aptidoesFisicas: computed(() =>
      state.aptidoes().filter((a: AptidaoConfig) => a.tipoAptidao?.nome === 'FISICO')
    ),

    /**
     * Filter mental skills
     */
    aptidoesMentais: computed(() =>
      state.aptidoes().filter((a: AptidaoConfig) => a.tipoAptidao?.nome === 'MENTAL')
    )
  })),

  withMethods((store: any, configApi = inject(ConfigApiService)) => ({
    // ===== Atributos =====

    async loadAtributos() {
      patchState(store, { atributosLoading: true, error: null });
      try {
        const atributos = await configApi.listAtributos();
        patchState(store, { atributos, atributosLoading: false });
      } catch (error) {
        patchState(store, { error: 'Erro ao carregar atributos', atributosLoading: false });
        throw error;
      }
    },

    async createAtributo(config: Partial<AtributoConfig>) {
      patchState(store, { atributosLoading: true, error: null });
      try {
        const novoAtributo = await configApi.createAtributo(config);
        patchState(store, {
          atributos: [...store.atributos(), novoAtributo],
          atributosLoading: false
        });
        return novoAtributo;
      } catch (error) {
        patchState(store, { error: 'Erro ao criar atributo', atributosLoading: false });
        throw error;
      }
    },

    async updateAtributo(id: number, config: Partial<AtributoConfig>) {
      patchState(store, { atributosLoading: true, error: null });
      try {
        const atributoAtualizado = await configApi.updateAtributo(id, config);
        patchState(store, {
          atributos: store.atributos().map((a: AtributoConfig) =>
            a.id === id ? atributoAtualizado : a
          ),
          atributosLoading: false
        });
        return atributoAtualizado;
      } catch (error) {
        patchState(store, { error: 'Erro ao atualizar atributo', atributosLoading: false });
        throw error;
      }
    },

    async deleteAtributo(id: number) {
      patchState(store, { atributosLoading: true, error: null });
      try {
        await configApi.deleteAtributo(id);
        patchState(store, {
          atributos: store.atributos().filter((a: AtributoConfig) => a.id !== id),
          atributosLoading: false
        });
      } catch (error) {
        patchState(store, { error: 'Erro ao excluir atributo', atributosLoading: false });
        throw error;
      }
    },

    // ===== Aptidões =====

    async loadAptidoes() {
      patchState(store, { aptidoesLoading: true, error: null });
      try {
        const [aptidoes, tiposAptidao] = await Promise.all([
          configApi.listAptidoes(),
          configApi.listTiposAptidao()
        ]);
        patchState(store, { aptidoes, tiposAptidao, aptidoesLoading: false });
      } catch (error) {
        patchState(store, { error: 'Erro ao carregar aptidões', aptidoesLoading: false });
        throw error;
      }
    },

    async createAptidao(config: Partial<AptidaoConfig>) {
      patchState(store, { aptidoesLoading: true, error: null });
      try {
        const novaAptidao = await configApi.createAptidao(config);
        patchState(store, {
          aptidoes: [...store.aptidoes(), novaAptidao],
          aptidoesLoading: false
        });
        return novaAptidao;
      } catch (error) {
        patchState(store, { error: 'Erro ao criar aptidão', aptidoesLoading: false });
        throw error;
      }
    },

    async updateAptidao(id: number, config: Partial<AptidaoConfig>) {
      patchState(store, { aptidoesLoading: true, error: null });
      try {
        const aptidaoAtualizada = await configApi.updateAptidao(id, config);
        patchState(store, {
          aptidoes: store.aptidoes().map((a: AptidaoConfig) =>
            a.id === id ? aptidaoAtualizada : a
          ),
          aptidoesLoading: false
        });
        return aptidaoAtualizada;
      } catch (error) {
        patchState(store, { error: 'Erro ao atualizar aptidão', aptidoesLoading: false });
        throw error;
      }
    },

    async deleteAptidao(id: number) {
      patchState(store, { aptidoesLoading: true, error: null });
      try {
        await configApi.deleteAptidao(id);
        patchState(store, {
          aptidoes: store.aptidoes().filter((a: AptidaoConfig) => a.id !== id),
          aptidoesLoading: false
        });
      } catch (error) {
        patchState(store, { error: 'Erro ao excluir aptidão', aptidoesLoading: false });
        throw error;
      }
    },

    // ===== Níveis =====

    async loadNiveis() {
      patchState(store, { niveisLoading: true, error: null });
      try {
        const niveis = await configApi.listNiveis();
        patchState(store, { niveis, niveisLoading: false });
      } catch (error) {
        patchState(store, { error: 'Erro ao carregar níveis', niveisLoading: false });
        throw error;
      }
    },

    async createNivel(config: Partial<NivelConfig>) {
      patchState(store, { niveisLoading: true, error: null });
      try {
        const novoNivel = await configApi.createNivel(config);
        patchState(store, {
          niveis: [...store.niveis(), novoNivel],
          niveisLoading: false
        });
        return novoNivel;
      } catch (error) {
        patchState(store, { error: 'Erro ao criar nível', niveisLoading: false });
        throw error;
      }
    },

    async updateNivel(id: number, config: Partial<NivelConfig>) {
      patchState(store, { niveisLoading: true, error: null });
      try {
        const nivelAtualizado = await configApi.updateNivel(id, config);
        patchState(store, {
          niveis: store.niveis().map((n: NivelConfig) =>
            n.id === id ? nivelAtualizado : n
          ),
          niveisLoading: false
        });
        return nivelAtualizado;
      } catch (error) {
        patchState(store, { error: 'Erro ao atualizar nível', niveisLoading: false });
        throw error;
      }
    },

    async deleteNivel(id: number) {
      patchState(store, { niveisLoading: true, error: null });
      try {
        await configApi.deleteNivel(id);
        patchState(store, {
          niveis: store.niveis().filter((n: NivelConfig) => n.id !== id),
          niveisLoading: false
        });
      } catch (error) {
        patchState(store, { error: 'Erro ao excluir nível', niveisLoading: false });
        throw error;
      }
    },

    // ===== Load All Configs =====

    /**
     * Load all configuration data at once
     * Useful for initialization
     */
    async loadAllConfigs() {
      patchState(store, { error: null });
      try {
        await Promise.all([
          this.loadAtributos(),
          this.loadAptidoes(),
          this.loadNiveis()
          // Add more as needed
        ]);
      } catch (error) {
        patchState(store, { error: 'Erro ao carregar configurações' });
        throw error;
      }
    }

    // Note: Similar methods for Limitadores, Classes, Vantagens, Raças, etc.
    // can be added following the same pattern
  }))
);
