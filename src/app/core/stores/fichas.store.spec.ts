import { TestBed } from '@angular/core/testing';
import { FichasStore } from './fichas.store';
import { Ficha } from '@core/models';

// ============================================================
// Stubs
// ============================================================

const fichaStub: Ficha = {
  id: 1,
  jogoId: 10,
  nome: 'Zephyra',
  jogadorId: 42,
  racaId: 2,
  racaNome: 'Élfico',
  classeId: 3,
  classeNome: 'Guerreiro',
  generoId: null,
  generoNome: null,
  indoleId: null,
  indoleNome: null,
  presencaId: null,
  presencaNome: null,
  nivel: 5,
  xp: 1200,
  renascimentos: 0,
  isNpc: false,
  dataCriacao: '2024-01-01T00:00:00',
  dataUltimaAtualizacao: '2024-06-01T00:00:00',
};

const ficha2Stub: Ficha = {
  ...fichaStub,
  id: 2,
  nome: 'Thorin',
  jogadorId: 99,
};

const fichaOutroJogoStub: Ficha = {
  ...fichaStub,
  id: 3,
  jogoId: 20,
  nome: 'Gandalf',
};

// ============================================================
// Testes
// ============================================================

describe('FichasStore', () => {
  let store: InstanceType<typeof FichasStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(FichasStore);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  // ============================================================
  // Estado inicial
  // ============================================================

  describe('estado inicial', () => {
    it('deve iniciar com lista de fichas vazia', () => {
      expect(store.fichas()).toHaveLength(0);
    });

    it('deve iniciar com currentFicha null', () => {
      expect(store.currentFicha()).toBeNull();
    });

    it('deve iniciar com loading false', () => {
      expect(store.loading()).toBe(false);
    });

    it('deve iniciar com error null', () => {
      expect(store.error()).toBeNull();
    });
  });

  // ============================================================
  // setLoading e setError
  // ============================================================

  describe('setLoading e setError', () => {
    it('deve atualizar o estado de loading para true', () => {
      store.setLoading(true);

      expect(store.loading()).toBe(true);
    });

    it('deve atualizar o estado de loading para false', () => {
      store.setLoading(true);
      store.setLoading(false);

      expect(store.loading()).toBe(false);
    });

    it('deve definir mensagem de erro ao chamar setError', () => {
      store.setError('Falha na requisição');

      expect(store.error()).toBe('Falha na requisição');
    });

    it('deve zerar loading ao chamar setError', () => {
      store.setLoading(true);
      store.setError('Erro');

      expect(store.loading()).toBe(false);
    });

    it('deve limpar o erro ao passar null', () => {
      store.setError('Erro anterior');
      store.setError(null);

      expect(store.error()).toBeNull();
    });
  });

  // ============================================================
  // setFichas
  // ============================================================

  describe('setFichas', () => {
    it('deve substituir a lista de fichas', () => {
      store.setFichas([fichaStub, ficha2Stub]);

      expect(store.fichas()).toHaveLength(2);
    });

    it('deve manter os dados corretos após setar', () => {
      store.setFichas([fichaStub]);

      expect(store.fichas()[0].nome).toBe('Zephyra');
    });

    it('deve zerar loading e error ao setar fichas', () => {
      store.setLoading(true);
      store.setError('erro anterior');

      store.setFichas([fichaStub]);

      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
    });

    it('deve sobrescrever lista anterior ao chamar setFichas novamente', () => {
      store.setFichas([fichaStub]);
      store.setFichas([ficha2Stub]);

      expect(store.fichas()).toHaveLength(1);
      expect(store.fichas()[0].id).toBe(2);
    });
  });

  // ============================================================
  // addFicha
  // ============================================================

  describe('addFicha', () => {
    it('deve adicionar ficha à lista vazia', () => {
      store.addFicha(fichaStub);

      expect(store.fichas()).toHaveLength(1);
    });

    it('deve adicionar ficha ao final da lista existente', () => {
      store.setFichas([fichaStub]);

      store.addFicha(ficha2Stub);

      expect(store.fichas()).toHaveLength(2);
      expect(store.fichas()[1].id).toBe(2);
    });
  });

  // ============================================================
  // updateFichaInState
  // ============================================================

  describe('updateFichaInState', () => {
    it('deve atualizar apenas a ficha com o ID especificado', () => {
      store.setFichas([fichaStub, ficha2Stub]);

      store.updateFichaInState(1, { nome: 'Zephyra Revisada' });

      expect(store.fichas()[0].nome).toBe('Zephyra Revisada');
    });

    it('não deve alterar outras fichas ao atualizar uma', () => {
      store.setFichas([fichaStub, ficha2Stub]);

      store.updateFichaInState(1, { nome: 'Zephyra Revisada' });

      expect(store.fichas()[1].nome).toBe('Thorin');
    });

    it('deve mesclar dados parciais sem apagar campos existentes', () => {
      store.setFichas([fichaStub]);

      store.updateFichaInState(1, { nivel: 10 });

      expect(store.fichas()[0].nome).toBe('Zephyra');
      expect(store.fichas()[0].nivel).toBe(10);
    });
  });

  // ============================================================
  // removeFicha
  // ============================================================

  describe('removeFicha', () => {
    it('deve remover ficha pelo ID', () => {
      store.setFichas([fichaStub, ficha2Stub]);

      store.removeFicha(1);

      expect(store.fichas()).toHaveLength(1);
      expect(store.fichas()[0].id).toBe(2);
    });

    it('não deve alterar a lista ao remover ID inexistente', () => {
      store.setFichas([fichaStub]);

      store.removeFicha(999);

      expect(store.fichas()).toHaveLength(1);
    });

    it('deve resultar em lista vazia ao remover a única ficha', () => {
      store.setFichas([fichaStub]);

      store.removeFicha(1);

      expect(store.fichas()).toHaveLength(0);
    });
  });

  // ============================================================
  // setCurrentFicha e clearCurrentFicha
  // ============================================================

  describe('setCurrentFicha e clearCurrentFicha', () => {
    it('deve definir a ficha atual', () => {
      store.setCurrentFicha(fichaStub);

      expect(store.currentFicha()).toEqual(fichaStub);
    });

    it('deve atualizar a ficha atual ao chamar novamente', () => {
      store.setCurrentFicha(fichaStub);
      store.setCurrentFicha(ficha2Stub);

      expect(store.currentFicha()?.id).toBe(2);
    });

    it('deve limpar a ficha atual ao chamar clearCurrentFicha', () => {
      store.setCurrentFicha(fichaStub);

      store.clearCurrentFicha();

      expect(store.currentFicha()).toBeNull();
    });

    it('deve aceitar null como valor de ficha atual', () => {
      store.setCurrentFicha(fichaStub);
      store.setCurrentFicha(null);

      expect(store.currentFicha()).toBeNull();
    });
  });

  // ============================================================
  // getFichasPorJogo
  // ============================================================

  describe('getFichasPorJogo', () => {
    it('deve retornar apenas fichas do jogo especificado', () => {
      store.setFichas([fichaStub, ficha2Stub, fichaOutroJogoStub]);

      const fichasJogo10 = store.getFichasPorJogo(10);

      expect(fichasJogo10).toHaveLength(2);
      expect(fichasJogo10.every(f => f.jogoId === 10)).toBe(true);
    });

    it('deve retornar lista vazia para jogo sem fichas', () => {
      store.setFichas([fichaStub]);

      expect(store.getFichasPorJogo(999)).toHaveLength(0);
    });

    it('deve retornar lista vazia quando a store está vazia', () => {
      expect(store.getFichasPorJogo(10)).toHaveLength(0);
    });
  });
});
