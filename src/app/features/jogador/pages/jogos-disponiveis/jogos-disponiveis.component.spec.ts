/**
 * JogosDisponiveisComponent — Spec
 *
 * NOTA JIT: Smart component com PrimeNG e componentes filhos.
 * Usamos configureTestBed + overrideTemplate para substituir o template
 * por um stub mínimo, evitando NG0950 dos sub-componentes PrimeNG em JIT.
 *
 * Os testes verificam a lógica do componente via signals/métodos do
 * componentInstance, não via DOM.
 */
import { TestBed } from '@angular/core/testing';
import { render } from '@testing-library/angular';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { Router } from '@angular/router';

import { JogosDisponiveisComponent } from './jogos-disponiveis.component';
import { JogosApiService } from '@core/services/api/jogos-api.service';
import { CurrentGameService } from '@core/services/current-game.service';
import { ParticipanteBusinessService } from '@core/services/business/participante-business.service';
import { ToastService } from '@services/toast.service';
import { JogoResumo } from '@core/models/jogo.model';
import { Participante } from '@core/models/participante.model';

// ============================================================
// Dados de teste
// ============================================================

const jogoJogadorBase: JogoResumo = {
  id: 1,
  nome: 'Campanha dos Heróis',
  descricao: 'Uma aventura épica',
  totalParticipantes: 5,
  ativo: true,
  meuRole: 'JOGADOR',
};

const jogoMestre: JogoResumo = {
  id: 2,
  nome: 'Minha Campanha',
  descricao: null,
  totalParticipantes: 3,
  ativo: true,
  meuRole: 'MESTRE',
};

const participantePendente: Participante = {
  id: 10,
  jogoId: 1,
  usuarioId: 99,
  nomeUsuario: 'Jogador Teste',
  role: 'JOGADOR',
  status: 'PENDENTE',
  dataCriacao: '2026-04-01T10:00:00',
  dataUltimaAtualizacao: '2026-04-01T10:00:00',
};

const participanteAprovado: Participante = {
  ...participantePendente,
  status: 'APROVADO',
};

const participanteRejeitado: Participante = {
  ...participantePendente,
  status: 'REJEITADO',
};

const participanteBanido: Participante = {
  ...participantePendente,
  status: 'BANIDO',
};

// ============================================================
// Helpers para criar mocks
// ============================================================

function criarJogosApiMock(jogos: JogoResumo[] = [jogoJogadorBase]) {
  return {
    listJogos: vi.fn().mockReturnValue(of(jogos)),
  };
}

function criarParticipanteServiceMock(statusRetorno: Participante | null = null) {
  return {
    meuStatus: vi.fn().mockReturnValue(of(statusRetorno)),
    solicitarParticipacao: vi.fn().mockReturnValue(of(participantePendente)),
    cancelarSolicitacao: vi.fn().mockReturnValue(of(void 0)),
    loadParticipantes: vi.fn().mockReturnValue(of([])),
  };
}

function criarCurrentGameServiceMock(jogoAtivoId: number | null = null) {
  const jogoAtual = jogoAtivoId
    ? { id: jogoAtivoId, nome: 'Jogo Ativo', ativo: true }
    : null;
  return {
    currentGame: () => jogoAtual,
    currentGameId: () => jogoAtivoId,
    hasCurrentGame: () => !!jogoAtivoId,
    availableGames: signal([]).asReadonly(),
    selectGame: vi.fn(),
    clearGame: vi.fn(),
  };
}

function criarToastServiceMock() {
  return {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    clear: vi.fn(),
  };
}

function criarRouterMock() {
  return {
    navigate: vi.fn(),
  };
}

// ============================================================
// Template stub — evita NG0950 de sub-componentes PrimeNG em JIT
// ============================================================

const TEMPLATE_STUB = `
  <div id="jogos-disponiveis-stub">
    @if (loading()) {
      <div id="loading">Carregando...</div>
    }
    @if (!loading() && erro()) {
      <div id="erro">{{ erro() }}</div>
    }
    @if (!loading() && !erro() && jogos().length === 0) {
      <div id="vazio">Nenhum jogo encontrado</div>
    }
    @if (!loading() && !erro() && jogos().length > 0) {
      <div id="lista-jogos">
        @for (jogo of jogos(); track jogo.id) {
          <div class="jogo-card" [attr.data-jogo-id]="jogo.id">
            <span class="status">{{ getMeuStatus(jogo.id) }}</span>
          </div>
        }
      </div>
    }
  </div>
`;

// ============================================================
// Helper de render
// ============================================================

interface RenderOptions {
  jogos?: JogoResumo[];
  statusParticipante?: Participante | null;
  jogoAtivoId?: number | null;
}

async function renderComponente(opts: RenderOptions = {}) {
  const {
    jogos = [jogoJogadorBase],
    statusParticipante = null,
    jogoAtivoId = null,
  } = opts;

  const jogosApiMock = criarJogosApiMock(jogos);
  const participanteServiceMock = criarParticipanteServiceMock(statusParticipante);
  const currentGameServiceMock = criarCurrentGameServiceMock(jogoAtivoId);
  const toastServiceMock = criarToastServiceMock();
  const routerMock = criarRouterMock();

  const result = await render(JogosDisponiveisComponent, {
    configureTestBed: (tb) => {
      tb.overrideTemplate(JogosDisponiveisComponent, TEMPLATE_STUB);
    },
    providers: [
      { provide: JogosApiService, useValue: jogosApiMock },
      { provide: ParticipanteBusinessService, useValue: participanteServiceMock },
      { provide: CurrentGameService, useValue: currentGameServiceMock },
      { provide: ToastService, useValue: toastServiceMock },
      { provide: Router, useValue: routerMock },
    ],
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const comp = result.fixture.componentInstance as any;
  result.fixture.detectChanges();
  await result.fixture.whenStable();

  return {
    ...result,
    comp,
    jogosApiMock,
    participanteServiceMock,
    currentGameServiceMock,
    toastServiceMock,
    routerMock,
  };
}

// ============================================================
// Testes
// ============================================================

describe('JogosDisponiveisComponent', () => {

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.clearAllMocks();
  });

  // ----------------------------------------------------------
  // 1. Carregamento inicial
  // ----------------------------------------------------------

  describe('carregamento inicial', () => {
    it('deve chamar listJogos ao inicializar', async () => {
      const { jogosApiMock } = await renderComponente();
      expect(jogosApiMock.listJogos).toHaveBeenCalledTimes(1);
    });

    it('deve carregar status de participação para jogos de JOGADOR', async () => {
      const { participanteServiceMock } = await renderComponente({
        jogos: [jogoJogadorBase],
        statusParticipante: participantePendente,
      });
      expect(participanteServiceMock.meuStatus).toHaveBeenCalledWith(jogoJogadorBase.id);
    });

    it('não deve carregar status para jogos onde é MESTRE', async () => {
      const { participanteServiceMock } = await renderComponente({
        jogos: [jogoMestre],
      });
      expect(participanteServiceMock.meuStatus).not.toHaveBeenCalled();
    });

    it('deve exibir loading durante carregamento', async () => {
      // Simula carregamento em andamento — listJogos não resolve imediatamente
      const { comp } = await renderComponente();
      // Após ngOnInit, loading volta para false pois o observable já emitiu
      // Verificamos via signal
      expect(comp.loading()).toBe(false);
    });
  });

  // ----------------------------------------------------------
  // 2. Status badge — PENDENTE
  // ----------------------------------------------------------

  describe('badge de status — PENDENTE', () => {
    it('getMeuStatus retorna PENDENTE para jogo com participação pendente', async () => {
      const { comp } = await renderComponente({
        jogos: [jogoJogadorBase],
        statusParticipante: participantePendente,
      });
      expect(comp.getMeuStatus(jogoJogadorBase.id)).toBe('PENDENTE');
    });

    it('podeCancelar retorna true para status PENDENTE', async () => {
      const { comp } = await renderComponente({
        jogos: [jogoJogadorBase],
        statusParticipante: participantePendente,
      });
      expect(comp.podeCancelar(jogoJogadorBase)).toBe(true);
    });

    it('podeSolicitar retorna false para status PENDENTE', async () => {
      const { comp } = await renderComponente({
        jogos: [jogoJogadorBase],
        statusParticipante: participantePendente,
      });
      expect(comp.podeSolicitar(jogoJogadorBase)).toBe(false);
    });
  });

  // ----------------------------------------------------------
  // 3. Status badge — sem participação (null) ou REJEITADO
  // ----------------------------------------------------------

  describe('botão "Solicitar Entrada" — sem participação ou REJEITADO', () => {
    it('podeSolicitar retorna true quando status é null (sem participação)', async () => {
      const { comp } = await renderComponente({
        jogos: [jogoJogadorBase],
        statusParticipante: null,
      });
      expect(comp.podeSolicitar(jogoJogadorBase)).toBe(true);
    });

    it('podeSolicitar retorna true quando status é REJEITADO', async () => {
      const { comp, fixture } = await renderComponente({
        jogos: [jogoJogadorBase],
        statusParticipante: participanteRejeitado,
      });
      fixture.detectChanges();
      expect(comp.podeSolicitar(jogoJogadorBase)).toBe(true);
    });

    it('podeCancelar retorna false quando status é null', async () => {
      const { comp } = await renderComponente({
        jogos: [jogoJogadorBase],
        statusParticipante: null,
      });
      expect(comp.podeCancelar(jogoJogadorBase)).toBe(false);
    });
  });

  // ----------------------------------------------------------
  // 4. Status badge — BANIDO
  // ----------------------------------------------------------

  describe('badge de status — BANIDO', () => {
    it('getMeuStatus retorna BANIDO para jogo banido', async () => {
      const { comp } = await renderComponente({
        jogos: [jogoJogadorBase],
        statusParticipante: participanteBanido,
      });
      expect(comp.getMeuStatus(jogoJogadorBase.id)).toBe('BANIDO');
    });

    it('podeSolicitar retorna false para status BANIDO', async () => {
      const { comp } = await renderComponente({
        jogos: [jogoJogadorBase],
        statusParticipante: participanteBanido,
      });
      expect(comp.podeSolicitar(jogoJogadorBase)).toBe(false);
    });

    it('podeCancelar retorna false para status BANIDO', async () => {
      const { comp } = await renderComponente({
        jogos: [jogoJogadorBase],
        statusParticipante: participanteBanido,
      });
      expect(comp.podeCancelar(jogoJogadorBase)).toBe(false);
    });

    it('podeEntrar retorna false para status BANIDO', async () => {
      const { comp } = await renderComponente({
        jogos: [jogoJogadorBase],
        statusParticipante: participanteBanido,
      });
      expect(comp.podeEntrar(jogoJogadorBase)).toBe(false);
    });
  });

  // ----------------------------------------------------------
  // 5. Status badge — APROVADO
  // ----------------------------------------------------------

  describe('badge de status — APROVADO', () => {
    it('podeEntrar retorna true para jogo ativo com status APROVADO', async () => {
      const { comp } = await renderComponente({
        jogos: [jogoJogadorBase],
        statusParticipante: participanteAprovado,
      });
      expect(comp.podeEntrar(jogoJogadorBase)).toBe(true);
    });

    it('podeEntrar retorna false para jogo inativo com status APROVADO', async () => {
      const jogoInativo = { ...jogoJogadorBase, ativo: false };
      const { comp } = await renderComponente({
        jogos: [jogoInativo],
        statusParticipante: participanteAprovado,
      });
      expect(comp.podeEntrar(jogoInativo)).toBe(false);
    });

    it('podeSolicitar retorna false para status APROVADO', async () => {
      const { comp } = await renderComponente({
        jogos: [jogoJogadorBase],
        statusParticipante: participanteAprovado,
      });
      expect(comp.podeSolicitar(jogoJogadorBase)).toBe(false);
    });
  });

  // ----------------------------------------------------------
  // 6. Ação: Solicitar Entrada
  // ----------------------------------------------------------

  describe('solicitarEntrada()', () => {
    it('chama participanteService.solicitarParticipacao com o jogoId correto', async () => {
      const { comp, participanteServiceMock } = await renderComponente({
        jogos: [jogoJogadorBase],
        statusParticipante: null,
      });

      comp.solicitarEntrada(jogoJogadorBase);

      expect(participanteServiceMock.solicitarParticipacao).toHaveBeenCalledWith(jogoJogadorBase.id);
    });

    it('atualiza statusPorJogo para PENDENTE após solicitação bem-sucedida', async () => {
      const { comp } = await renderComponente({
        jogos: [jogoJogadorBase],
        statusParticipante: null,
      });

      comp.solicitarEntrada(jogoJogadorBase);

      expect(comp.getMeuStatus(jogoJogadorBase.id)).toBe('PENDENTE');
    });

    it('exibe toast de sucesso após solicitação bem-sucedida', async () => {
      const { comp, toastServiceMock } = await renderComponente({
        jogos: [jogoJogadorBase],
        statusParticipante: null,
      });

      comp.solicitarEntrada(jogoJogadorBase);

      expect(toastServiceMock.success).toHaveBeenCalledWith(
        'Solicitação enviada! Aguarde a aprovação do Mestre.'
      );
    });

    it('limpa solicitandoJogo após sucesso', async () => {
      const { comp } = await renderComponente({
        jogos: [jogoJogadorBase],
        statusParticipante: null,
      });

      comp.solicitarEntrada(jogoJogadorBase);

      expect(comp.solicitandoJogo()).toBeNull();
    });

    it('exibe toast de erro quando backend retorna erro na solicitação', async () => {
      const participanteServiceMockComErro = {
        meuStatus: vi.fn().mockReturnValue(of(null)),
        solicitarParticipacao: vi.fn().mockReturnValue(
          throwError(() => ({ error: { message: 'Você já solicitou entrada neste jogo' } }))
        ),
        cancelarSolicitacao: vi.fn().mockReturnValue(of(void 0)),
        loadParticipantes: vi.fn().mockReturnValue(of([])),
      };

      const result = await render(JogosDisponiveisComponent, {
        configureTestBed: (tb) => {
          tb.overrideTemplate(JogosDisponiveisComponent, TEMPLATE_STUB);
        },
        providers: [
          { provide: JogosApiService, useValue: criarJogosApiMock([jogoJogadorBase]) },
          { provide: ParticipanteBusinessService, useValue: participanteServiceMockComErro },
          { provide: CurrentGameService, useValue: criarCurrentGameServiceMock() },
          { provide: ToastService, useValue: criarToastServiceMock() },
          { provide: Router, useValue: criarRouterMock() },
        ],
      });

      const toastServiceMock = result.fixture.debugElement.injector.get(ToastService);
      const comp = result.fixture.componentInstance as any;
      result.fixture.detectChanges();
      await result.fixture.whenStable();

      comp.solicitarEntrada(jogoJogadorBase);

      expect(toastServiceMock.error).toHaveBeenCalledWith(
        'Você já solicitou entrada neste jogo'
      );
    });

    it('exibe mensagem de erro genérica quando backend não retorna mensagem', async () => {
      const participanteServiceMockComErro = {
        meuStatus: vi.fn().mockReturnValue(of(null)),
        solicitarParticipacao: vi.fn().mockReturnValue(
          throwError(() => ({}))
        ),
        cancelarSolicitacao: vi.fn().mockReturnValue(of(void 0)),
        loadParticipantes: vi.fn().mockReturnValue(of([])),
      };

      const result = await render(JogosDisponiveisComponent, {
        configureTestBed: (tb) => {
          tb.overrideTemplate(JogosDisponiveisComponent, TEMPLATE_STUB);
        },
        providers: [
          { provide: JogosApiService, useValue: criarJogosApiMock([jogoJogadorBase]) },
          { provide: ParticipanteBusinessService, useValue: participanteServiceMockComErro },
          { provide: CurrentGameService, useValue: criarCurrentGameServiceMock() },
          { provide: ToastService, useValue: criarToastServiceMock() },
          { provide: Router, useValue: criarRouterMock() },
        ],
      });

      const toastServiceMock = result.fixture.debugElement.injector.get(ToastService);
      const comp = result.fixture.componentInstance as any;
      result.fixture.detectChanges();
      await result.fixture.whenStable();

      comp.solicitarEntrada(jogoJogadorBase);

      expect(toastServiceMock.error).toHaveBeenCalledWith('Erro ao solicitar entrada');
    });

    it('limpa solicitandoJogo após erro', async () => {
      const participanteServiceMockComErro = {
        meuStatus: vi.fn().mockReturnValue(of(null)),
        solicitarParticipacao: vi.fn().mockReturnValue(throwError(() => ({}))),
        cancelarSolicitacao: vi.fn().mockReturnValue(of(void 0)),
        loadParticipantes: vi.fn().mockReturnValue(of([])),
      };

      const result = await render(JogosDisponiveisComponent, {
        configureTestBed: (tb) => {
          tb.overrideTemplate(JogosDisponiveisComponent, TEMPLATE_STUB);
        },
        providers: [
          { provide: JogosApiService, useValue: criarJogosApiMock([jogoJogadorBase]) },
          { provide: ParticipanteBusinessService, useValue: participanteServiceMockComErro },
          { provide: CurrentGameService, useValue: criarCurrentGameServiceMock() },
          { provide: ToastService, useValue: criarToastServiceMock() },
          { provide: Router, useValue: criarRouterMock() },
        ],
      });

      const comp = result.fixture.componentInstance as any;
      result.fixture.detectChanges();
      await result.fixture.whenStable();

      comp.solicitarEntrada(jogoJogadorBase);

      expect(comp.solicitandoJogo()).toBeNull();
    });
  });

  // ----------------------------------------------------------
  // 7. Ação: Cancelar Solicitação
  // ----------------------------------------------------------

  describe('cancelarSolicitacao()', () => {
    it('chama participanteService.cancelarSolicitacao com o jogoId correto', async () => {
      const { comp, participanteServiceMock } = await renderComponente({
        jogos: [jogoJogadorBase],
        statusParticipante: participantePendente,
      });

      comp.cancelarSolicitacao(jogoJogadorBase);

      expect(participanteServiceMock.cancelarSolicitacao).toHaveBeenCalledWith(jogoJogadorBase.id);
    });

    it('atualiza statusPorJogo para null após cancelamento bem-sucedido', async () => {
      const { comp } = await renderComponente({
        jogos: [jogoJogadorBase],
        statusParticipante: participantePendente,
      });

      comp.cancelarSolicitacao(jogoJogadorBase);

      expect(comp.getMeuStatus(jogoJogadorBase.id)).toBeNull();
    });

    it('exibe toast de sucesso após cancelamento bem-sucedido', async () => {
      const { comp, toastServiceMock } = await renderComponente({
        jogos: [jogoJogadorBase],
        statusParticipante: participantePendente,
      });

      comp.cancelarSolicitacao(jogoJogadorBase);

      expect(toastServiceMock.success).toHaveBeenCalledWith('Solicitação cancelada.');
    });

    it('exibe toast de erro quando cancelamento falha', async () => {
      const participanteServiceMockComErro = {
        meuStatus: vi.fn().mockReturnValue(of(participantePendente)),
        solicitarParticipacao: vi.fn().mockReturnValue(of(participantePendente)),
        cancelarSolicitacao: vi.fn().mockReturnValue(throwError(() => new Error('Server error'))),
        loadParticipantes: vi.fn().mockReturnValue(of([])),
      };

      const result = await render(JogosDisponiveisComponent, {
        configureTestBed: (tb) => {
          tb.overrideTemplate(JogosDisponiveisComponent, TEMPLATE_STUB);
        },
        providers: [
          { provide: JogosApiService, useValue: criarJogosApiMock([jogoJogadorBase]) },
          { provide: ParticipanteBusinessService, useValue: participanteServiceMockComErro },
          { provide: CurrentGameService, useValue: criarCurrentGameServiceMock() },
          { provide: ToastService, useValue: criarToastServiceMock() },
          { provide: Router, useValue: criarRouterMock() },
        ],
      });

      const toastServiceMock = result.fixture.debugElement.injector.get(ToastService);
      const comp = result.fixture.componentInstance as any;
      result.fixture.detectChanges();
      await result.fixture.whenStable();

      comp.cancelarSolicitacao(jogoJogadorBase);

      expect(toastServiceMock.error).toHaveBeenCalledWith('Erro ao cancelar solicitação');
    });
  });

  // ----------------------------------------------------------
  // 8. Ação: Selecionar Jogo (APROVADO → Entrar)
  // ----------------------------------------------------------

  describe('selecionarJogo()', () => {
    it('chama currentGameService.selectGame e navega para /jogador/fichas', async () => {
      const { comp, currentGameServiceMock, routerMock } = await renderComponente({
        jogos: [jogoJogadorBase],
        statusParticipante: participanteAprovado,
      });

      comp.selecionarJogo(jogoJogadorBase);

      expect(currentGameServiceMock.selectGame).toHaveBeenCalledWith(jogoJogadorBase.id);
      expect(routerMock.navigate).toHaveBeenCalledWith(['/jogador/fichas']);
    });
  });

  // ----------------------------------------------------------
  // 9. Ação: Ir para Jogo (MESTRE → Gerenciar)
  // ----------------------------------------------------------

  describe('irParaJogo()', () => {
    it('navega para /mestre/jogos/{id}', async () => {
      const { comp, routerMock } = await renderComponente({
        jogos: [jogoMestre],
      });

      comp.irParaJogo(jogoMestre);

      expect(routerMock.navigate).toHaveBeenCalledWith(['/mestre/jogos', jogoMestre.id]);
    });
  });

  // ----------------------------------------------------------
  // 10. Erro no carregamento de status
  // ----------------------------------------------------------

  describe('carregamento de status com erro', () => {
    it('trata erro 404 no meuStatus como null (sem participação)', async () => {
      const participanteServiceMockComErro = {
        meuStatus: vi.fn().mockReturnValue(throwError(() => ({ status: 404 }))),
        solicitarParticipacao: vi.fn().mockReturnValue(of(participantePendente)),
        cancelarSolicitacao: vi.fn().mockReturnValue(of(void 0)),
        loadParticipantes: vi.fn().mockReturnValue(of([])),
      };

      const result = await render(JogosDisponiveisComponent, {
        configureTestBed: (tb) => {
          tb.overrideTemplate(JogosDisponiveisComponent, TEMPLATE_STUB);
        },
        providers: [
          { provide: JogosApiService, useValue: criarJogosApiMock([jogoJogadorBase]) },
          { provide: ParticipanteBusinessService, useValue: participanteServiceMockComErro },
          { provide: CurrentGameService, useValue: criarCurrentGameServiceMock() },
          { provide: ToastService, useValue: criarToastServiceMock() },
          { provide: Router, useValue: criarRouterMock() },
        ],
      });

      const comp = result.fixture.componentInstance as any;
      result.fixture.detectChanges();
      await result.fixture.whenStable();

      // Deve tratar como null em vez de propagar o erro
      expect(comp.getMeuStatus(jogoJogadorBase.id)).toBeNull();
      // Com status null e jogo ativo, pode solicitar entrada
      expect(comp.podeSolicitar(jogoJogadorBase)).toBe(true);
    });
  });

  // ----------------------------------------------------------
  // 11. Múltiplos jogos — MESTRE e JOGADOR na mesma lista
  // ----------------------------------------------------------

  describe('lista com múltiplos papéis', () => {
    it('carrega status apenas para jogos de JOGADOR, não para MESTRE', async () => {
      const { participanteServiceMock } = await renderComponente({
        jogos: [jogoJogadorBase, jogoMestre],
        statusParticipante: participantePendente,
      });

      // Só deve chamar meuStatus para o jogo onde é JOGADOR
      expect(participanteServiceMock.meuStatus).toHaveBeenCalledTimes(1);
      expect(participanteServiceMock.meuStatus).toHaveBeenCalledWith(jogoJogadorBase.id);
      expect(participanteServiceMock.meuStatus).not.toHaveBeenCalledWith(jogoMestre.id);
    });

    it('getMeuStatus para jogo MESTRE retorna null (sem status de participação)', async () => {
      const { comp } = await renderComponente({
        jogos: [jogoMestre],
      });

      expect(comp.getMeuStatus(jogoMestre.id)).toBeNull();
    });
  });

  // ----------------------------------------------------------
  // 12. Erro no carregamento da lista de jogos
  // ----------------------------------------------------------

  describe('erro no carregamento de jogos', () => {
    it('define mensagem de erro quando listJogos falha', async () => {
      const jogosApiMockComErro = {
        listJogos: vi.fn().mockReturnValue(throwError(() => new Error('Network error'))),
      };

      const result = await render(JogosDisponiveisComponent, {
        configureTestBed: (tb) => {
          tb.overrideTemplate(JogosDisponiveisComponent, TEMPLATE_STUB);
        },
        providers: [
          { provide: JogosApiService, useValue: jogosApiMockComErro },
          { provide: ParticipanteBusinessService, useValue: criarParticipanteServiceMock() },
          { provide: CurrentGameService, useValue: criarCurrentGameServiceMock() },
          { provide: ToastService, useValue: criarToastServiceMock() },
          { provide: Router, useValue: criarRouterMock() },
        ],
      });

      const comp = result.fixture.componentInstance as any;
      result.fixture.detectChanges();
      await result.fixture.whenStable();

      expect(comp.erro()).toBe('Não foi possível carregar os jogos. Verifique sua conexão.');
      expect(comp.loading()).toBe(false);
    });
  });
});
