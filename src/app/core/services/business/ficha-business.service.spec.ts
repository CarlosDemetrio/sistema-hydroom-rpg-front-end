import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { FichaBusinessService } from './ficha-business.service';
import { FichasApiService } from '@core/services/api/fichas-api.service';
import { FichasStore } from '@core/stores/fichas.store';
import { AuthService, UserInfo } from '@services/auth.service';
import { Ficha, FichaResumo, FichaCompletaData, FichaVantagemResponse } from '@core/models/ficha.model';

// ============================================================
// Stubs
// ============================================================

const fichaJogadorStub: Ficha = {
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
  descricao: null,
  status: 'RASCUNHO' as const,
  dataCriacao: '2024-01-01T00:00:00',
  dataUltimaAtualizacao: '2024-06-01T00:00:00',
};

const fichaOutroJogadorStub: Ficha = {
  ...fichaJogadorStub,
  id: 2,
  jogadorId: 99,
  nome: 'Outro Personagem',
};

const fichaResumoStub: FichaResumo = {
  id: 1,
  nome: 'Zephyra',
  nivel: 5,
  xp: 1200,
  racaNome: 'Élfico',
  classeNome: 'Guerreiro',
  atributosTotais: { FOR: 10 },
  bonusTotais: {},
  vidaTotal: 80,
  vidaAtual: 80,
  essenciaTotal: 50,
  essenciaAtual: 50,
  ameacaTotal: 20,
  pontosVantagemDisponiveis: 0,
  pontosAtributoDisponiveis: 0,
  pontosAptidaoDisponiveis: 0,
};

const userMestreStub: UserInfo = {
  id: '1',
  name: 'Mestre Teste',
  email: 'mestre@teste.com',
  role: 'MESTRE',
};

const userJogadorStub: UserInfo = {
  id: '42',
  name: 'Jogador Teste',
  email: 'jogador@teste.com',
  role: 'JOGADOR',
};

// ============================================================
// Helpers para criar mocks
// ============================================================

function criarFichasStoreMock(fichasIniciais: Ficha[] = [], currentFichaInicial: Ficha | null = null) {
  const fichasSignal = signal<Ficha[]>(fichasIniciais);
  const currentFichaSignal = signal<Ficha | null>(currentFichaInicial);
  const loadingSignal = signal<boolean>(false);
  const errorSignal = signal<string | null>(null);

  return {
    fichas: fichasSignal.asReadonly(),
    currentFicha: currentFichaSignal.asReadonly(),
    loading: loadingSignal.asReadonly(),
    error: errorSignal.asReadonly(),
    setFichas: vi.fn((fichas: Ficha[]) => fichasSignal.set(fichas)),
    addFicha: vi.fn((ficha: Ficha) => fichasSignal.set([...fichasSignal(), ficha])),
    updateFichaInState: vi.fn((id: number, updates: Partial<Ficha>) => {
      fichasSignal.set(fichasSignal().map(f => (f.id === id ? { ...f, ...updates } : f)));
    }),
    removeFicha: vi.fn((id: number) => {
      fichasSignal.set(fichasSignal().filter(f => f.id !== id));
    }),
    setCurrentFicha: vi.fn((ficha: Ficha | null) => currentFichaSignal.set(ficha)),
    clearCurrentFicha: vi.fn(() => currentFichaSignal.set(null)),
    getFichasPorJogo: vi.fn(),
    setLoading: vi.fn(),
    setError: vi.fn(),
  };
}

function criarAuthServiceMock(user: UserInfo | null = null) {
  const userSignal = signal<UserInfo | null>(user);
  return {
    currentUser: userSignal.asReadonly(),
    isMestre: signal(user?.role === 'MESTRE').asReadonly(),
    isJogador: signal(user?.role === 'JOGADOR').asReadonly(),
    isAuthenticated: signal(user !== null).asReadonly(),
    setCurrentUser: vi.fn(),
    getCurrentUser: vi.fn(() => userSignal()),
    getUserInfo: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  };
}

// ============================================================
// Testes
// ============================================================

describe('FichaBusinessService', () => {
  let service: FichaBusinessService;
  let fichasApiMock: { [key: string]: ReturnType<typeof vi.fn> };
  let fichasStoreMock: ReturnType<typeof criarFichasStoreMock>;
  let authServiceMock: ReturnType<typeof criarAuthServiceMock>;

  function configurarTestBed(
    user: UserInfo | null = null,
    fichasIniciais: Ficha[] = [],
    currentFichaInicial: Ficha | null = null
  ) {
    fichasStoreMock = criarFichasStoreMock(fichasIniciais, currentFichaInicial);
    authServiceMock = criarAuthServiceMock(user);
    fichasApiMock = {
      listFichas: vi.fn(),
      listMinhasFichas: vi.fn(),
      listNpcs: vi.fn(),
      getFicha: vi.fn(),
      getFichaResumo: vi.fn(),
      createFicha: vi.fn(),
      updateFicha: vi.fn(),
      deleteFicha: vi.fn(),
      listVantagens: vi.fn(),
      comprarVantagem: vi.fn(),
      aumentarNivelVantagem: vi.fn(),
      getAnotacoes: vi.fn(),
      criarAnotacao: vi.fn(),
      atualizarAnotacao: vi.fn(),
      deletarAnotacao: vi.fn(),
      duplicarFicha: vi.fn(),
      criarNpc: vi.fn(),
      atualizarAtributos: vi.fn(),
      atualizarAptidoes: vi.fn(),
      previewFicha: vi.fn(),
      atualizarVida: vi.fn(),
      atualizarProspeccao: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        FichaBusinessService,
        { provide: FichasApiService, useValue: fichasApiMock },
        { provide: FichasStore, useValue: fichasStoreMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    });

    service = TestBed.inject(FichaBusinessService);
  }

  // ============================================================
  // loadFichaCompleta — forkJoin
  // ============================================================

  describe('loadFichaCompleta', () => {
    it('deve carregar ficha e resumo em paralelo via forkJoin', () => {
      configurarTestBed();
      fichasApiMock['getFicha'].mockReturnValue(of(fichaJogadorStub));
      fichasApiMock['getFichaResumo'].mockReturnValue(of(fichaResumoStub));

      let resultado: FichaCompletaData | undefined;
      service.loadFichaCompleta(1).subscribe(data => (resultado = data));

      expect(fichasApiMock['getFicha']).toHaveBeenCalledWith(1);
      expect(fichasApiMock['getFichaResumo']).toHaveBeenCalledWith(1);
      expect(resultado).toBeDefined();
      expect(resultado!.ficha.id).toBe(1);
      expect(resultado!.resumo.vidaTotal).toBe(80);
    });

    it('deve atualizar a store com a ficha após carregar', () => {
      configurarTestBed();
      fichasApiMock['getFicha'].mockReturnValue(of(fichaJogadorStub));
      fichasApiMock['getFichaResumo'].mockReturnValue(of(fichaResumoStub));

      service.loadFichaCompleta(1).subscribe();

      expect(fichasStoreMock.updateFichaInState).toHaveBeenCalledWith(1, fichaJogadorStub);
      expect(fichasStoreMock.setCurrentFicha).toHaveBeenCalledWith(fichaJogadorStub);
    });

    it('deve emitir ficha e resumo juntos no mesmo objeto', () => {
      configurarTestBed();
      fichasApiMock['getFicha'].mockReturnValue(of(fichaJogadorStub));
      fichasApiMock['getFichaResumo'].mockReturnValue(of(fichaResumoStub));

      let emissoes = 0;
      service.loadFichaCompleta(1).subscribe(() => emissoes++);

      // forkJoin emite uma única vez com os dois resultados juntos
      expect(emissoes).toBe(1);
    });
  });

  // ============================================================
  // canEdit — lógica de autorização
  // ============================================================

  describe('canEdit', () => {
    it('deve retornar true para MESTRE independente do dono da ficha', () => {
      configurarTestBed(userMestreStub);

      const resultado = service.canEdit(fichaOutroJogadorStub);

      expect(resultado).toBe(true);
    });

    it('deve retornar true quando JOGADOR é dono da ficha', () => {
      configurarTestBed(userJogadorStub);

      const resultado = service.canEdit(fichaJogadorStub); // jogadorId: 42 == user.id: '42'

      expect(resultado).toBe(true);
    });

    it('deve retornar false quando JOGADOR não é dono da ficha', () => {
      configurarTestBed(userJogadorStub);

      const resultado = service.canEdit(fichaOutroJogadorStub); // jogadorId: 99 != user.id: '42'

      expect(resultado).toBe(false);
    });

    it('deve retornar false quando não há usuário autenticado', () => {
      configurarTestBed(null);

      const resultado = service.canEdit(fichaJogadorStub);

      expect(resultado).toBe(false);
    });
  });

  // ============================================================
  // loadFichas
  // ============================================================

  describe('loadFichas', () => {
    it('deve chamar a API com o jogoId correto', () => {
      configurarTestBed();
      fichasApiMock['listFichas'].mockReturnValue(of([fichaJogadorStub]));

      service.loadFichas(10).subscribe();

      expect(fichasApiMock['listFichas']).toHaveBeenCalledWith(10, undefined);
    });

    it('deve atualizar a store com as fichas recebidas', () => {
      configurarTestBed();
      fichasApiMock['listFichas'].mockReturnValue(of([fichaJogadorStub]));

      service.loadFichas(10).subscribe();

      expect(fichasStoreMock.setFichas).toHaveBeenCalledWith([fichaJogadorStub]);
    });

    it('deve passar filtros para a API quando fornecidos', () => {
      configurarTestBed();
      fichasApiMock['listFichas'].mockReturnValue(of([]));

      service.loadFichas(10, { nome: 'Zephyra' }).subscribe();

      expect(fichasApiMock['listFichas']).toHaveBeenCalledWith(10, { nome: 'Zephyra' });
    });
  });

  // ============================================================
  // createFicha
  // ============================================================

  describe('createFicha', () => {
    it('deve adicionar a nova ficha na store após criar', () => {
      configurarTestBed();
      fichasApiMock['createFicha'].mockReturnValue(of(fichaJogadorStub));

      service.createFicha(10, { jogoId: 10, nome: 'Nova Ficha' }).subscribe();

      expect(fichasStoreMock.addFicha).toHaveBeenCalledWith(fichaJogadorStub);
      expect(fichasStoreMock.setCurrentFicha).toHaveBeenCalledWith(fichaJogadorStub);
    });
  });

  // ============================================================
  // updateFicha
  // ============================================================

  describe('updateFicha', () => {
    it('deve atualizar a ficha na store após editar', () => {
      configurarTestBed();
      const fichaAtualizada = { ...fichaJogadorStub, nome: 'Nome Alterado' };
      fichasApiMock['updateFicha'].mockReturnValue(of(fichaAtualizada));

      service.updateFicha(1, { nome: 'Nome Alterado' }).subscribe();

      expect(fichasStoreMock.updateFichaInState).toHaveBeenCalledWith(1, fichaAtualizada);
      expect(fichasStoreMock.setCurrentFicha).toHaveBeenCalledWith(fichaAtualizada);
    });
  });

  // ============================================================
  // deleteFicha
  // ============================================================

  describe('deleteFicha', () => {
    it('deve remover a ficha da store após deletar', () => {
      configurarTestBed(userMestreStub, [fichaJogadorStub], fichaJogadorStub);
      fichasApiMock['deleteFicha'].mockReturnValue(of(undefined));

      service.deleteFicha(1).subscribe();

      expect(fichasStoreMock.removeFicha).toHaveBeenCalledWith(1);
    });

    it('deve limpar a currentFicha quando a ficha deletada é a atual', () => {
      configurarTestBed(userMestreStub, [fichaJogadorStub], fichaJogadorStub);
      fichasApiMock['deleteFicha'].mockReturnValue(of(undefined));

      service.deleteFicha(1).subscribe();

      expect(fichasStoreMock.clearCurrentFicha).toHaveBeenCalled();
    });
  });

  // ============================================================
  // loadVantagens
  // ============================================================

  describe('loadVantagens', () => {
    it('deve delegar para a API e retornar as vantagens', () => {
      configurarTestBed();
      const vantagemStub: FichaVantagemResponse = {
        id: 50,
        vantagemConfigId: 5,
        nomeVantagem: 'Força Bruta',
        nivelAtual: 1,
        nivelMaximo: 3,
        custoPago: 10,
      };
      fichasApiMock['listVantagens'].mockReturnValue(of([vantagemStub]));

      let resultado: FichaVantagemResponse[] = [];
      service.loadVantagens(1).subscribe(v => (resultado = v));

      expect(fichasApiMock['listVantagens']).toHaveBeenCalledWith(1);
      expect(resultado[0].nomeVantagem).toBe('Força Bruta');
    });
  });

  // ============================================================
  // minhasFichas (computed)
  // ============================================================

  describe('minhasFichas (computed)', () => {
    it('deve retornar todas as fichas quando o usuário é MESTRE', () => {
      configurarTestBed(userMestreStub, [fichaJogadorStub, fichaOutroJogadorStub]);

      const resultado = service.minhasFichas();

      expect(resultado).toHaveLength(2);
    });

    it('deve filtrar apenas as fichas do jogador quando é JOGADOR', () => {
      configurarTestBed(userJogadorStub, [fichaJogadorStub, fichaOutroJogadorStub]);

      const resultado = service.minhasFichas();

      expect(resultado).toHaveLength(1);
      expect(resultado[0].jogadorId).toBe(42);
    });

    it('deve retornar lista vazia quando JOGADOR não tem fichas no jogo', () => {
      configurarTestBed(userJogadorStub, [fichaOutroJogadorStub]);

      const resultado = service.minhasFichas();

      expect(resultado).toHaveLength(0);
    });
  });

  // ============================================================
  // hasJogo
  // ============================================================

  describe('hasJogo', () => {
    it('deve retornar true quando a ficha tem jogoId', () => {
      configurarTestBed();

      expect(service.hasJogo(fichaJogadorStub)).toBe(true);
    });

    it('deve retornar false quando a ficha não tem jogoId', () => {
      configurarTestBed();
      const fichaSemJogo = { ...fichaJogadorStub, jogoId: 0 };

      expect(service.hasJogo(fichaSemJogo)).toBe(false);
    });
  });
});
