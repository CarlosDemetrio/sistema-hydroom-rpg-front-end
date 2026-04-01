import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { AtributoConfig } from '@core/models/atributo-config.model';
import { AptidaoConfig } from '@core/models/aptidao-config.model';
import { TipoAptidao } from '@core/models/tipo-aptidao.model';
import { VantagemConfig } from '@core/models/vantagem-config.model';
import {
  CategoriaVantagem,
  ClassePersonagem,
  Raca,
  NivelConfig,
  DadoProspeccaoConfig,
  PresencaConfig,
  GeneroConfig,
  IndoleConfig,
  MembroCorpoConfig,
  BonusConfig,
} from '@core/models/config.models';

/**
 * State interface for all configuration entities
 */
interface ConfigState {
  atributos: AtributoConfig[];
  aptidoes: AptidaoConfig[];
  tiposAptidao: TipoAptidao[];
  niveis: NivelConfig[];
  classes: ClassePersonagem[];
  vantagens: VantagemConfig[];
  categoriasVantagem: CategoriaVantagem[];
  racas: Raca[];
  dadosProspeccao: DadoProspeccaoConfig[];
  presencas: PresencaConfig[];
  generos: GeneroConfig[];
  indoles: IndoleConfig[];
  membrosCorpo: MembroCorpoConfig[];
  bonus: BonusConfig[];
  loading: boolean;
  error: string | null;
}

const initialState: ConfigState = {
  atributos: [],
  aptidoes: [],
  tiposAptidao: [],
  niveis: [],
  classes: [],
  vantagens: [],
  categoriasVantagem: [],
  racas: [],
  dadosProspeccao: [],
  presencas: [],
  generos: [],
  indoles: [],
  membrosCorpo: [],
  bonus: [],
  loading: false,
  error: null
};

/**
 * SignalStore for Configuration state management.
 * Store is state-only — no HTTP calls, no business logic.
 */
export const ConfigStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withMethods((store: any) => ({
    setLoading(loading: boolean) {
      patchState(store, { loading });
    },

    setError(error: string | null) {
      patchState(store, { error, loading: false });
    },

    // Atributos
    setAtributos(atributos: AtributoConfig[]) {
      patchState(store, { atributos, loading: false, error: null });
    },

    addAtributo(atributo: AtributoConfig) {
      patchState(store, { atributos: [...store.atributos(), atributo], loading: false, error: null });
    },

    updateAtributoInState(id: number, updates: Partial<AtributoConfig>) {
      patchState(store, {
        atributos: store.atributos().map((a: AtributoConfig) => a.id === id ? { ...a, ...updates } : a),
        loading: false, error: null
      });
    },

    removeAtributo(id: number) {
      patchState(store, { atributos: store.atributos().filter((a: AtributoConfig) => a.id !== id), loading: false, error: null });
    },

    // Aptidões
    setAptidoes(aptidoes: AptidaoConfig[]) {
      patchState(store, { aptidoes, loading: false, error: null });
    },

    addAptidao(aptidao: AptidaoConfig) {
      patchState(store, { aptidoes: [...store.aptidoes(), aptidao], loading: false, error: null });
    },

    updateAptidaoInState(id: number, updates: Partial<AptidaoConfig>) {
      patchState(store, {
        aptidoes: store.aptidoes().map((a: AptidaoConfig) => a.id === id ? { ...a, ...updates } : a),
        loading: false, error: null
      });
    },

    removeAptidao(id: number) {
      patchState(store, { aptidoes: store.aptidoes().filter((a: AptidaoConfig) => a.id !== id), loading: false, error: null });
    },

    setTiposAptidao(tiposAptidao: TipoAptidao[]) {
      patchState(store, { tiposAptidao, loading: false, error: null });
    },

    // Níveis
    setNiveis(niveis: NivelConfig[]) {
      patchState(store, { niveis, loading: false, error: null });
    },

    addNivel(nivel: NivelConfig) {
      patchState(store, { niveis: [...store.niveis(), nivel], loading: false, error: null });
    },

    updateNivelInState(id: number, updates: Partial<NivelConfig>) {
      patchState(store, {
        niveis: store.niveis().map((n: NivelConfig) => n.id === id ? { ...n, ...updates } : n),
        loading: false, error: null
      });
    },

    removeNivel(id: number) {
      patchState(store, { niveis: store.niveis().filter((n: NivelConfig) => n.id !== id), loading: false, error: null });
    },

    // Classes
    setClasses(classes: ClassePersonagem[]) {
      patchState(store, { classes, loading: false, error: null });
    },

    // Vantagens
    setVantagens(vantagens: VantagemConfig[]) {
      patchState(store, { vantagens, loading: false, error: null });
    },

    setCategoriasVantagem(categoriasVantagem: CategoriaVantagem[]) {
      patchState(store, { categoriasVantagem, loading: false, error: null });
    },

    // Raças
    setRacas(racas: Raca[]) {
      patchState(store, { racas, loading: false, error: null });
    },

    // Dados de Prospecção
    setDadosProspeccao(dadosProspeccao: DadoProspeccaoConfig[]) {
      patchState(store, { dadosProspeccao, loading: false, error: null });
    },

    // Presenças
    setPresencas(presencas: PresencaConfig[]) {
      patchState(store, { presencas, loading: false, error: null });
    },

    // Gêneros
    setGeneros(generos: GeneroConfig[]) {
      patchState(store, { generos, loading: false, error: null });
    },

    // Índoles
    setIndoles(indoles: IndoleConfig[]) {
      patchState(store, { indoles, loading: false, error: null });
    },

    // Membros do Corpo
    setMembrosCorpo(membrosCorpo: MembroCorpoConfig[]) {
      patchState(store, { membrosCorpo, loading: false, error: null });
    },

    // Bônus
    setBonus(bonus: BonusConfig[]) {
      patchState(store, { bonus, loading: false, error: null });
    },

    // Getters
    getAptidoesPorTipo(tipoId: number): AptidaoConfig[] {
      return store.aptidoes().filter((a: AptidaoConfig) => a.tipoAptidaoId === tipoId);
    }
  }))
);
