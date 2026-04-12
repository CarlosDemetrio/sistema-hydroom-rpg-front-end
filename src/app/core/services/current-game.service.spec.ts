import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { vi } from 'vitest';
import { CurrentGameService } from './current-game.service';
import { JogoBusinessService } from './business/jogo-business.service';
import { JogoResumo } from '@core/models/jogo.model';

// ============================================================
// Stubs
// ============================================================

const jogoAtivoStub: JogoResumo = {
  id: 1,
  nome: 'Campanha dos Heróis',
  descricao: 'Uma grande aventura',
  totalParticipantes: 5,
  ativo: true,
  meuRole: 'MESTRE',
};

const jogoInativoStub: JogoResumo = {
  id: 2,
  nome: 'Campanha Pausada',
  descricao: null,
  totalParticipantes: 3,
  ativo: false,
  meuRole: 'JOGADOR',
};

const jogoAtivo2Stub: JogoResumo = {
  id: 3,
  nome: 'Segunda Campanha',
  descricao: null,
  totalParticipantes: 4,
  ativo: true,
  meuRole: 'JOGADOR',
};

// ============================================================
// Helpers
// ============================================================

function criarJogoBusinessServiceMock(jogos: JogoResumo[] = []) {
  const jogosSignal = signal<JogoResumo[]>(jogos);
  return {
    jogos: jogosSignal.asReadonly(),
    setJogos: (novosJogos: JogoResumo[]) => jogosSignal.set(novosJogos),
    loading: signal(false).asReadonly(),
    error: signal<string | null>(null).asReadonly(),
    loadJogos: vi.fn(),
    loadMeusJogos: vi.fn(),
    getJogo: vi.fn(),
    createJogo: vi.fn(),
    updateJogo: vi.fn(),
    deleteJogo: vi.fn(),
  };
}

// ============================================================
// Testes
// ============================================================

describe('CurrentGameService', () => {
  let service: CurrentGameService;
  let jogoServiceMock: ReturnType<typeof criarJogoBusinessServiceMock>;

  beforeEach(() => {
    localStorage.clear();
  });

  function configurarTestBed(jogos: JogoResumo[] = []) {
    jogoServiceMock = criarJogoBusinessServiceMock(jogos);

    TestBed.configureTestingModule({
      providers: [
        CurrentGameService,
        { provide: JogoBusinessService, useValue: jogoServiceMock },
      ],
    });

    service = TestBed.inject(CurrentGameService);
    TestBed.flushEffects();
  }

  afterEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  // ============================================================
  // selectGame / currentGameId
  // ============================================================

  describe('selectGame e currentGameId', () => {
    it('deve definir o ID do jogo atual ao selecionar', () => {
      configurarTestBed([jogoAtivoStub]);

      service.selectGame(1);

      expect(service.currentGameId()).toBe(1);
    });

    it('deve atualizar o ID ao trocar de jogo', () => {
      configurarTestBed([jogoAtivoStub, jogoAtivo2Stub]);
      service.selectGame(1);

      service.selectGame(3);

      expect(service.currentGameId()).toBe(3);
    });

  });

  // ============================================================
  // hasCurrentGame
  // ============================================================

  describe('hasCurrentGame', () => {
    it('deve retornar false quando não há jogo selecionado nem localStorage', () => {
      configurarTestBed([]);

      expect(service.hasCurrentGame()).toBe(false);
    });

    it('deve retornar true após selecionar um jogo', () => {
      configurarTestBed([jogoAtivoStub]);

      service.selectGame(1);

      expect(service.hasCurrentGame()).toBe(true);
    });

    it('deve retornar false quando o ID salvo nao corresponde a nenhum jogo disponivel', () => {
      localStorage.setItem('currentGameId', '999');
      configurarTestBed([]);

      jogoServiceMock.setJogos([jogoAtivoStub, jogoAtivo2Stub]);
      TestBed.flushEffects();

      expect(service.hasCurrentGame()).toBe(false);
    });
  });

  // ============================================================
  // clearGame
  // ============================================================

  describe('clearGame', () => {
    it('deve limpar o jogo atual e remover do localStorage', () => {
      configurarTestBed([jogoAtivoStub]);
      service.selectGame(1);
      expect(service.hasCurrentGame()).toBe(true);

      service.clearGame();

      expect(service.currentGameId()).toBeNull();
      expect(service.hasCurrentGame()).toBe(false);
      expect(localStorage.getItem('currentGameId')).toBeNull();
    });
  });

  // ============================================================
  // currentGame (computed)
  // ============================================================

  describe('currentGame', () => {
    it('deve retornar null quando não há jogo selecionado e não há jogos disponíveis', () => {
      configurarTestBed([]);

      expect(service.currentGame()).toBeNull();
    });

    it('deve retornar o jogo correto pelo ID selecionado', () => {
      configurarTestBed([jogoAtivoStub, jogoAtivo2Stub]);

      service.selectGame(1);

      expect(service.currentGame()).toEqual(jogoAtivoStub);
    });

    it('deve retornar null quando o ID não corresponde a nenhum jogo', () => {
      configurarTestBed([jogoAtivoStub]);

      service.selectGame(999);

      expect(service.currentGame()).toBeNull();
    });

    it('deve retornar o jogo do segundo ID ao trocar de seleção', () => {
      configurarTestBed([jogoAtivoStub, jogoAtivo2Stub]);
      service.selectGame(1);

      service.selectGame(3);

      expect(service.currentGame()).toEqual(jogoAtivo2Stub);
    });
  });

  // ============================================================
  // availableGames (apenas jogos ativos)
  // ============================================================

  describe('availableGames', () => {
    it('deve retornar apenas jogos com ativo=true', () => {
      configurarTestBed([jogoAtivoStub, jogoInativoStub, jogoAtivo2Stub]);

      const disponiveis = service.availableGames();

      expect(disponiveis).toHaveLength(2);
      expect(disponiveis.every(j => j.ativo)).toBe(true);
    });

    it('deve retornar lista vazia quando não há jogos ativos', () => {
      configurarTestBed([jogoInativoStub]);

      expect(service.availableGames()).toHaveLength(0);
    });

    it('deve retornar lista vazia quando não há nenhum jogo', () => {
      configurarTestBed([]);

      expect(service.availableGames()).toHaveLength(0);
    });
  });

  // ============================================================
  // Persistência no localStorage
  // ============================================================

  describe('persistência no localStorage', () => {
    it('deve recuperar o ID do jogo salvo no localStorage ao inicializar', () => {
      localStorage.setItem('currentGameId', '1');
      configurarTestBed([jogoAtivoStub]);

      expect(service.currentGameId()).toBe(1);
    });

    it('deve retornar null quando localStorage está vazio e nenhum jogo está disponível', () => {
      configurarTestBed([]);

      expect(service.currentGameId()).toBeNull();
    });

    it('nao deve auto-selecionar o primeiro jogo quando houver multiplos jogos ativos', () => {
      configurarTestBed([jogoAtivoStub, jogoAtivo2Stub]);

      expect(service.currentGameId()).toBeNull();
      expect(service.hasCurrentGame()).toBe(false);
      expect(localStorage.getItem('currentGameId')).toBeNull();
    });

    it('deve auto-selecionar o unico jogo ativo disponivel', () => {
      configurarTestBed([jogoInativoStub, jogoAtivo2Stub]);

      expect(service.currentGameId()).toBe(3);
      expect(service.currentGame()).toEqual(jogoAtivo2Stub);
      expect(service.hasCurrentGame()).toBe(true);
      expect(localStorage.getItem('currentGameId')).toBe('3');
    });

    it('deve limpar selecao invalida salva quando os jogos sao carregados', () => {
      localStorage.setItem('currentGameId', '999');
      configurarTestBed([]);

      jogoServiceMock.setJogos([jogoAtivoStub, jogoAtivo2Stub]);
      TestBed.flushEffects();

      expect(service.currentGameId()).toBeNull();
      expect(service.currentGame()).toBeNull();
      expect(service.hasCurrentGame()).toBe(false);
      expect(localStorage.getItem('currentGameId')).toBeNull();
    });
  });
});
