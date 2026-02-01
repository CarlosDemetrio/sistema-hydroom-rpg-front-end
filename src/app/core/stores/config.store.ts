import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
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

/**
 * State interface for all configuration entities
 */
interface ConfigState {
  atributos: AtributoConfig[];
  aptidoes: AptidaoConfig[];
  tiposAptidao: TipoAptidao[];
  niveis: NivelConfig[];
  limitadores: LimitadorConfig[];
  classes: ClassePersonagem[];
  vantagens: VantagemConfig[];
  categoriasVantagem: CategoriaVantagem[];
  racas: Raca[];
  prospeccoes: ProspeccaoConfig[];
  presencas: PresencaConfig[];
  generos: GeneroConfig[];
  loading: boolean;
  error: string | null;
}

/**
 * Initial state
 */
const initialState: ConfigState = {
  atributos: [],
  aptidoes: [],
  tiposAptidao: [],
  niveis: [],
  limitadores: [],
  classes: [],
  vantagens: [],
  categoriasVantagem: [],
  racas: [],
  prospeccoes: [],
  presencas: [],
  generos: [],
  loading: false,
  error: null
};

/**
 * SignalStore for Configuration state management
 *
 * ⚠️ IMPORTANTE: Store é APENAS para ESTADO
 * - NÃO faz chamadas HTTP
 * - APENAS métodos síncronos para atualizar estado
 */
export const ConfigStore = signalStore(
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
    // ATRIBUTOS
    // ============================================

    setAtributos(atributos: AtributoConfig[]) {
      patchState(store, { atributos, loading: false, error: null });
    },

    addAtributo(atributo: AtributoConfig) {
      patchState(store, {
        atributos: [...store.atributos(), atributo],
        loading: false,
        error: null
      });
    },

    updateAtributoInState(id: number, updates: Partial<AtributoConfig>) {
      patchState(store, {
        atributos: store.atributos().map((a: AtributoConfig) =>
          a.id === id ? { ...a, ...updates } : a
        ),
        loading: false,
        error: null
      });
    },

    removeAtributo(id: number) {
      patchState(store, {
        atributos: store.atributos().filter((a: AtributoConfig) => a.id !== id),
        loading: false,
        error: null
      });
    },

    // ============================================
    // APTIDÕES
    // ============================================

    setAptidoes(aptidoes: AptidaoConfig[]) {
      patchState(store, { aptidoes, loading: false, error: null });
    },

    addAptidao(aptidao: AptidaoConfig) {
      patchState(store, {
        aptidoes: [...store.aptidoes(), aptidao],
        loading: false,
        error: null
      });
    },

    updateAptidaoInState(id: number, updates: Partial<AptidaoConfig>) {
      patchState(store, {
        aptidoes: store.aptidoes().map((a: AptidaoConfig) =>
          a.id === id ? { ...a, ...updates } : a
        ),
        loading: false,
        error: null
      });
    },

    removeAptidao(id: number) {
      patchState(store, {
        aptidoes: store.aptidoes().filter((a: AptidaoConfig) => a.id !== id),
        loading: false,
        error: null
      });
    },

    setTiposAptidao(tiposAptidao: TipoAptidao[]) {
      patchState(store, { tiposAptidao, loading: false, error: null });
    },

    // ============================================
    // NÍVEIS
    // ============================================

    setNiveis(niveis: NivelConfig[]) {
      patchState(store, { niveis, loading: false, error: null });
    },

    addNivel(nivel: NivelConfig) {
      patchState(store, {
        niveis: [...store.niveis(), nivel],
        loading: false,
        error: null
      });
    },

    updateNivelInState(id: number, updates: Partial<NivelConfig>) {
      patchState(store, {
        niveis: store.niveis().map((n: NivelConfig) =>
          n.id === id ? { ...n, ...updates } : n
        ),
        loading: false,
        error: null
      });
    },

    removeNivel(id: number) {
      patchState(store, {
        niveis: store.niveis().filter((n: NivelConfig) => n.id !== id),
        loading: false,
        error: null
      });
    },

    // ============================================
    // LIMITADORES
    // ============================================

    setLimitadores(limitadores: LimitadorConfig[]) {
      patchState(store, { limitadores, loading: false, error: null });
    },

    // ============================================
    // CLASSES
    // ============================================

    setClasses(classes: ClassePersonagem[]) {
      patchState(store, { classes, loading: false, error: null });
    },

    // ============================================
    // VANTAGENS
    // ============================================

    setVantagens(vantagens: VantagemConfig[]) {
      patchState(store, { vantagens, loading: false, error: null });
    },

    setCategoriasVantagem(categoriasVantagem: CategoriaVantagem[]) {
      patchState(store, { categoriasVantagem, loading: false, error: null });
    },

    // ============================================
    // RAÇAS
    // ============================================

    setRacas(racas: Raca[]) {
      patchState(store, { racas, loading: false, error: null });
    },

    // ============================================
    // OUTROS
    // ============================================

    setProspeccoes(prospeccoes: ProspeccaoConfig[]) {
      patchState(store, { prospeccoes, loading: false, error: null });
    },

    setPresencas(presencas: PresencaConfig[]) {
      patchState(store, { presencas, loading: false, error: null });
    },

    setGeneros(generos: GeneroConfig[]) {
      patchState(store, { generos, loading: false, error: null });
    },

    // ============================================
    // GETTERS
    // ============================================

    getAptidoesPorTipo(tipoId: number): AptidaoConfig[] {
      return store.aptidoes().filter((a: AptidaoConfig) => a.tipoAptidaoId === tipoId);
    }
  }))
);
