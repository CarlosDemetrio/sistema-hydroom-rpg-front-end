import { TestBed } from '@angular/core/testing';
import { ConfigStore } from './config.store';
import { AtributoConfig } from '@core/models/atributo-config.model';
import { AptidaoConfig } from '@core/models/aptidao-config.model';
import { NivelConfig, ClassePersonagem, BonusConfig, GeneroConfig, IndoleConfig } from '@core/models/config.models';

// ============================================================
// Stubs
// ============================================================

const atributoStub: AtributoConfig = {
  id: 1,
  jogoId: 10,
  nome: 'Força',
  abreviacao: 'FOR',
  descricao: null,
  formulaImpeto: 'FOR * 5',
  descricaoImpeto: null,
  valorMinimo: 1,
  valorMaximo: 20,
  ordemExibicao: 1,
  dataCriacao: '2024-01-01',
  dataUltimaAtualizacao: '2024-01-01',
};

const atributo2Stub: AtributoConfig = {
  ...atributoStub,
  id: 2,
  nome: 'Agilidade',
  abreviacao: 'AGI',
  ordemExibicao: 2,
};

const aptidaoFisicoStub: AptidaoConfig = {
  id: 1,
  jogoId: 10,
  nome: 'Acrobacia',
  descricao: null,
  tipoAptidaoId: 5,
  tipoAptidaoNome: 'Físico',
  ordemExibicao: 1,
  dataCriacao: '2024-01-01',
  dataUltimaAtualizacao: '2024-01-01',
};

const aptidaoMentalStub: AptidaoConfig = {
  ...aptidaoFisicoStub,
  id: 2,
  nome: 'Percepção',
  tipoAptidaoId: 9,
  tipoAptidaoNome: 'Mental',
};

const nivelStub: NivelConfig = {
  id: 1,
  jogoId: 10,
  nivel: 1,
  xpNecessaria: 0,
  pontosAtributo: 5,
  pontosAptidao: 3,
  limitadorAtributo: 10,
  permitirRenascimento: false,
  dataCriacao: '2024-01-01',
  dataUltimaAtualizacao: '2024-01-01',
};

const nivel2Stub: NivelConfig = {
  ...nivelStub,
  id: 2,
  nivel: 2,
  xpNecessaria: 100,
};

const classeStub: ClassePersonagem = {
  id: 1,
  jogoId: 10,
  nome: 'Guerreiro',
  descricao: null,
  ordemExibicao: 1,
  bonusConfig: [],
  aptidaoBonus: [],
  dataCriacao: '2024-01-01',
  dataUltimaAtualizacao: '2024-01-01',
};

const bonusStub: BonusConfig = {
  id: 1,
  jogoId: 10,
  nome: 'BBA',
  sigla: 'BBA',
  descricao: 'Bônus Base de Ataque',
  formulaBase: '(FOR + AGI) / 3',
  ordemExibicao: 1,
  dataCriacao: '2024-01-01',
  dataUltimaAtualizacao: '2024-01-01',
};

const generoStub: GeneroConfig = {
  id: 1,
  jogoId: 10,
  nome: 'Masculino',
  descricao: null,
  ordemExibicao: 1,
  dataCriacao: '2024-01-01',
  dataUltimaAtualizacao: '2024-01-01',
};

const indoleStub: IndoleConfig = {
  id: 1,
  jogoId: 10,
  nome: 'Leal',
  descricao: null,
  ordemExibicao: 1,
  dataCriacao: '2024-01-01',
  dataUltimaAtualizacao: '2024-01-01',
};

// ============================================================
// Testes
// ============================================================

describe('ConfigStore', () => {
  let store: InstanceType<typeof ConfigStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(ConfigStore);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  // ============================================================
  // Estado inicial
  // ============================================================

  describe('estado inicial', () => {
    it('deve iniciar com todas as listas de config vazias', () => {
      expect(store.atributos()).toHaveLength(0);
      expect(store.aptidoes()).toHaveLength(0);
      expect(store.tiposAptidao()).toHaveLength(0);
      expect(store.niveis()).toHaveLength(0);
      expect(store.classes()).toHaveLength(0);
      expect(store.vantagens()).toHaveLength(0);
      expect(store.categoriasVantagem()).toHaveLength(0);
      expect(store.racas()).toHaveLength(0);
      expect(store.generos()).toHaveLength(0);
      expect(store.indoles()).toHaveLength(0);
      expect(store.membrosCorpo()).toHaveLength(0);
      expect(store.bonus()).toHaveLength(0);
    });

    it('deve iniciar com loading false e error null', () => {
      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
    });
  });

  // ============================================================
  // setLoading e setError
  // ============================================================

  describe('setLoading e setError', () => {
    it('deve atualizar o estado de loading', () => {
      store.setLoading(true);

      expect(store.loading()).toBe(true);
    });

    it('deve definir erro e zerar loading', () => {
      store.setLoading(true);
      store.setError('Erro ao carregar configurações');

      expect(store.error()).toBe('Erro ao carregar configurações');
      expect(store.loading()).toBe(false);
    });

    it('deve limpar o erro ao passar null', () => {
      store.setError('Algum erro');
      store.setError(null);

      expect(store.error()).toBeNull();
    });
  });

  // ============================================================
  // Atributos — CRUD
  // ============================================================

  describe('atributos', () => {
    it('deve setar lista de atributos', () => {
      store.setAtributos([atributoStub, atributo2Stub]);

      expect(store.atributos()).toHaveLength(2);
    });

    it('deve zerar loading e error ao setar atributos', () => {
      store.setLoading(true);
      store.setError('erro');

      store.setAtributos([atributoStub]);

      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
    });

    it('deve adicionar atributo à lista existente', () => {
      store.setAtributos([atributoStub]);

      store.addAtributo(atributo2Stub);

      expect(store.atributos()).toHaveLength(2);
    });

    it('deve atualizar apenas o atributo com ID correspondente', () => {
      store.setAtributos([atributoStub, atributo2Stub]);

      store.updateAtributoInState(1, { nome: 'Força Bruta' });

      expect(store.atributos()[0].nome).toBe('Força Bruta');
      expect(store.atributos()[1].nome).toBe('Agilidade');
    });

    it('deve remover atributo pelo ID', () => {
      store.setAtributos([atributoStub, atributo2Stub]);

      store.removeAtributo(1);

      expect(store.atributos()).toHaveLength(1);
      expect(store.atributos()[0].id).toBe(2);
    });
  });

  // ============================================================
  // Aptidões — CRUD
  // ============================================================

  describe('aptidoes', () => {
    it('deve setar lista de aptidões', () => {
      store.setAptidoes([aptidaoFisicoStub, aptidaoMentalStub]);

      expect(store.aptidoes()).toHaveLength(2);
    });

    it('deve adicionar aptidão à lista', () => {
      store.setAptidoes([aptidaoFisicoStub]);

      store.addAptidao(aptidaoMentalStub);

      expect(store.aptidoes()).toHaveLength(2);
    });

    it('deve atualizar aptidão pelo ID', () => {
      store.setAptidoes([aptidaoFisicoStub]);

      store.updateAptidaoInState(1, { nome: 'Salto' });

      expect(store.aptidoes()[0].nome).toBe('Salto');
    });

    it('deve remover aptidão pelo ID', () => {
      store.setAptidoes([aptidaoFisicoStub, aptidaoMentalStub]);

      store.removeAptidao(1);

      expect(store.aptidoes()).toHaveLength(1);
      expect(store.aptidoes()[0].id).toBe(2);
    });
  });

  // ============================================================
  // Níveis — CRUD
  // ============================================================

  describe('niveis', () => {
    it('deve setar lista de níveis', () => {
      store.setNiveis([nivelStub, nivel2Stub]);

      expect(store.niveis()).toHaveLength(2);
    });

    it('deve adicionar nível à lista', () => {
      store.setNiveis([nivelStub]);

      store.addNivel(nivel2Stub);

      expect(store.niveis()).toHaveLength(2);
    });

    it('deve atualizar nível pelo ID', () => {
      store.setNiveis([nivelStub]);

      store.updateNivelInState(1, { xpNecessaria: 500 });

      expect(store.niveis()[0].xpNecessaria).toBe(500);
    });

    it('deve remover nível pelo ID', () => {
      store.setNiveis([nivelStub, nivel2Stub]);

      store.removeNivel(1);

      expect(store.niveis()).toHaveLength(1);
      expect(store.niveis()[0].id).toBe(2);
    });
  });

  // ============================================================
  // Classes
  // ============================================================

  describe('classes', () => {
    it('deve setar lista de classes', () => {
      store.setClasses([classeStub]);

      expect(store.classes()).toHaveLength(1);
      expect(store.classes()[0].nome).toBe('Guerreiro');
    });
  });

  // ============================================================
  // Bônus
  // ============================================================

  describe('bonus', () => {
    it('deve setar lista de bônus', () => {
      store.setBonus([bonusStub]);

      expect(store.bonus()).toHaveLength(1);
      expect(store.bonus()[0].sigla).toBe('BBA');
    });
  });

  // ============================================================
  // Gêneros e Índoles
  // ============================================================

  describe('generos e indoles', () => {
    it('deve setar lista de gêneros', () => {
      store.setGeneros([generoStub]);

      expect(store.generos()).toHaveLength(1);
    });

    it('deve setar lista de índoles', () => {
      store.setIndoles([indoleStub]);

      expect(store.indoles()).toHaveLength(1);
    });
  });

  // ============================================================
  // getAptidoesPorTipo
  // ============================================================

  describe('getAptidoesPorTipo', () => {
    it('deve retornar apenas aptidões do tipo especificado', () => {
      store.setAptidoes([aptidaoFisicoStub, aptidaoMentalStub]);

      const resultado = store.getAptidoesPorTipo(5);

      expect(resultado).toHaveLength(1);
      expect(resultado[0].nome).toBe('Acrobacia');
    });

    it('não deve retornar aptidões de outros tipos', () => {
      store.setAptidoes([aptidaoFisicoStub, aptidaoMentalStub]);

      const resultado = store.getAptidoesPorTipo(5);

      expect(resultado.some(a => a.tipoAptidaoId === 9)).toBe(false);
    });

    it('deve retornar lista vazia para tipo inexistente', () => {
      store.setAptidoes([aptidaoFisicoStub]);

      expect(store.getAptidoesPorTipo(999)).toHaveLength(0);
    });

    it('deve retornar lista vazia quando não há aptidões', () => {
      expect(store.getAptidoesPorTipo(5)).toHaveLength(0);
    });
  });
});
