/**
 * ProspeccaoPendentesComponent — Spec
 *
 * Foco dos testes:
 * - Renderizacao inicial: lista de pendentes, estado vazio, loading
 * - Confirmar uso: chama endpoint correto e remove item da lista
 * - Reverter uso: chama endpoint correto e remove item da lista
 * - Estados de loading: isLoading, confirmandoId, revertendoId
 * - Sem jogo selecionado: exibe aviso em vez de tabela
 * - Tratamento de erros: falha na carga e nas acoes
 */
import { TestBed } from '@angular/core/testing';
import { render } from '@testing-library/angular';
import { of, throwError, Subject } from 'rxjs';
import { vi, describe, it, expect, afterEach } from 'vitest';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';

import { ProspeccaoPendentesComponent } from './prospeccao-pendentes.component';
import { ProspeccaoApiService } from '@core/services/api/prospeccao.api.service';
import { CurrentGameService } from '@core/services/current-game.service';
import { ToastService } from '@services/toast.service';
import { ProspeccaoUsoResponse } from '@core/models/ficha.model';

// ============================================================
// Dados de teste
// ============================================================

const usosPendentes: ProspeccaoUsoResponse[] = [
  {
    usoId: 1,
    dadoNome: 'D6',
    dadoProspeccaoConfigId: 10,
    fichaId: 3,
    personagemNome: 'Aldric',
    status: 'PENDENTE',
    criadoEm: '2026-04-01T10:00:00',
  },
  {
    usoId: 2,
    dadoNome: 'D8',
    dadoProspeccaoConfigId: 11,
    fichaId: 5,
    personagemNome: 'Brenna',
    status: 'PENDENTE',
    criadoEm: '2026-04-02T14:30:00',
  },
];

const usoConfirmadoD6: ProspeccaoUsoResponse = {
  ...usosPendentes[0],
  status: 'CONFIRMADO',
};

const usoRevertidoD6: ProspeccaoUsoResponse = {
  ...usosPendentes[0],
  status: 'REVERTIDO',
};

// ============================================================
// Mock factories
// ============================================================

function criarProspeccaoApiMock(overrides: Record<string, unknown> = {}) {
  return {
    listarPendentesJogo: vi.fn().mockReturnValue(of(usosPendentes)),
    confirmar: vi.fn().mockReturnValue(of(usoConfirmadoD6)),
    reverter: vi.fn().mockReturnValue(of(usoRevertidoD6)),
    ...overrides,
  };
}

function criarCurrentGameServiceMock(hasGame = true) {
  const jogoMock = hasGame ? { id: 7, nome: 'Crônicas de Aldric', ativo: true } : null;
  return {
    hasCurrentGame: signal(hasGame),
    currentGameId: signal(hasGame ? 7 : null),
    currentGame: signal(jogoMock),
  };
}

function criarToastServiceMock() {
  return {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  };
}

// ============================================================
// Helper de render
// ============================================================

type RenderOptions = {
  hasGame?: boolean;
  prospeccaoApiOverride?: Record<string, unknown>;
};

async function renderComponent(opts: RenderOptions = {}) {
  const { hasGame = true, prospeccaoApiOverride = {} } = opts;

  const prospeccaoApi = criarProspeccaoApiMock(prospeccaoApiOverride);
  const currentGameService = criarCurrentGameServiceMock(hasGame);
  const toastService = criarToastServiceMock();

  const result = await render(ProspeccaoPendentesComponent, {
    schemas: [NO_ERRORS_SCHEMA],
    providers: [
      { provide: ProspeccaoApiService, useValue: prospeccaoApi },
      { provide: CurrentGameService, useValue: currentGameService },
      { provide: ToastService, useValue: toastService },
    ],
  });

  await result.fixture.whenStable();

  return { ...result, prospeccaoApi, currentGameService, toastService };
}

// ============================================================
// Testes
// ============================================================

describe('ProspeccaoPendentesComponent', () => {

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  // ----------------------------------------------------------
  // Renderizacao inicial
  // ----------------------------------------------------------

  describe('renderizacao inicial', () => {
    it('exibe a lista de pendentes carregada ao inicializar', async () => {
      const { fixture } = await renderComponent();
      const content = fixture.nativeElement.textContent as string;
      expect(content).toContain('Aldric');
      expect(content).toContain('Brenna');
    });

    it('chama listarPendentesJogo com o jogoId correto ao inicializar', async () => {
      const { prospeccaoApi } = await renderComponent();
      expect(prospeccaoApi.listarPendentesJogo).toHaveBeenCalledWith(7);
    });

    it('exibe o nome do jogo no subtitulo quando ha jogo selecionado', async () => {
      const { fixture } = await renderComponent({ hasGame: true });
      const content = fixture.nativeElement.textContent as string;
      expect(content).toContain('Crônicas de Aldric');
    });

    it('exibe estado vazio quando a lista de pendentes esta vazia', async () => {
      const { fixture } = await renderComponent({
        prospeccaoApiOverride: {
          listarPendentesJogo: vi.fn().mockReturnValue(of([])),
        },
      });
      // Com NO_ERRORS_SCHEMA, EmptyStateComponent nao renderiza conteudo interno.
      // Verificamos que a tabela nao esta presente e o empty-state esta no DOM.
      const table = fixture.nativeElement.querySelector('p-table');
      const emptyState = fixture.nativeElement.querySelector('app-empty-state');
      expect(table).toBeNull();
      expect(emptyState).not.toBeNull();
    });

    it('nao chama a API quando nao ha jogo selecionado', async () => {
      const { prospeccaoApi } = await renderComponent({ hasGame: false });
      expect(prospeccaoApi.listarPendentesJogo).not.toHaveBeenCalled();
    });

    it('exibe aviso de "nenhum jogo selecionado" quando hasGame e false', async () => {
      const { fixture } = await renderComponent({ hasGame: false });
      const content = fixture.nativeElement.textContent as string;
      expect(content).toContain('Nenhum jogo selecionado');
    });

    it('exibe estado de loading durante a requisicao', async () => {
      const pendente$ = new Subject<ProspeccaoUsoResponse[]>();
      const { fixture } = await render(ProspeccaoPendentesComponent, {
        schemas: [NO_ERRORS_SCHEMA],
        providers: [
          {
            provide: ProspeccaoApiService,
            useValue: {
              listarPendentesJogo: vi.fn().mockReturnValue(pendente$.asObservable()),
              confirmar: vi.fn(),
              reverter: vi.fn(),
            },
          },
          { provide: CurrentGameService, useValue: criarCurrentGameServiceMock(true) },
          { provide: ToastService, useValue: criarToastServiceMock() },
        ],
      });

      fixture.detectChanges();

      const comp = fixture.componentInstance as unknown as { isLoading: () => boolean };
      expect(comp.isLoading()).toBe(true);
    });
  });

  // ----------------------------------------------------------
  // Confirmar uso
  // ----------------------------------------------------------

  describe('confirmar uso', () => {
    it('chama prospeccaoApi.confirmar com fichaId e usoId corretos', async () => {
      const { fixture, prospeccaoApi } = await renderComponent();
      const comp = fixture.componentInstance as unknown as {
        confirmar: (uso: ProspeccaoUsoResponse) => void;
      };

      comp.confirmar(usosPendentes[0]);
      await fixture.whenStable();

      expect(prospeccaoApi.confirmar).toHaveBeenCalledWith(3, 1);
    });

    it('remove o uso da lista apos confirmar com sucesso', async () => {
      const { fixture } = await renderComponent();
      const comp = fixture.componentInstance as unknown as {
        confirmar: (uso: ProspeccaoUsoResponse) => void;
        pendentes: () => ProspeccaoUsoResponse[];
      };

      const qtdAntes = comp.pendentes().length;
      comp.confirmar(usosPendentes[0]);
      await fixture.whenStable();

      expect(comp.pendentes().length).toBe(qtdAntes - 1);
      expect(comp.pendentes().find(u => u.usoId === 1)).toBeUndefined();
    });

    it('exibe toast de sucesso apos confirmar', async () => {
      const { fixture, toastService } = await renderComponent();
      const comp = fixture.componentInstance as unknown as {
        confirmar: (uso: ProspeccaoUsoResponse) => void;
      };

      comp.confirmar(usosPendentes[0]);
      await fixture.whenStable();

      expect(toastService.success).toHaveBeenCalledWith(
        expect.stringContaining('D6'),
        expect.stringContaining('confirmado'),
      );
    });

    it('reseta confirmandoId para null apos confirmar com sucesso', async () => {
      const { fixture } = await renderComponent();
      const comp = fixture.componentInstance as unknown as {
        confirmar: (uso: ProspeccaoUsoResponse) => void;
        confirmandoId: () => number | null;
      };

      comp.confirmar(usosPendentes[0]);
      await fixture.whenStable();

      expect(comp.confirmandoId()).toBeNull();
    });

    it('reseta confirmandoId para null quando confirmar falha', async () => {
      const { fixture } = await renderComponent({
        prospeccaoApiOverride: {
          confirmar: vi.fn().mockReturnValue(throwError(() => new Error('HTTP 500'))),
        },
      });

      const comp = fixture.componentInstance as unknown as {
        confirmar: (uso: ProspeccaoUsoResponse) => void;
        confirmandoId: () => number | null;
      };

      comp.confirmar(usosPendentes[0]);
      await fixture.whenStable();

      expect(comp.confirmandoId()).toBeNull();
    });

    it('nao chama toastService.error quando confirmar falha (interceptor cuida disso)', async () => {
      const { fixture, toastService } = await renderComponent({
        prospeccaoApiOverride: {
          confirmar: vi.fn().mockReturnValue(throwError(() => new Error('HTTP 500'))),
        },
      });

      const comp = fixture.componentInstance as unknown as {
        confirmar: (uso: ProspeccaoUsoResponse) => void;
      };

      comp.confirmar(usosPendentes[0]);
      await fixture.whenStable();

      // O interceptor e responsavel pelo toast de erro, componente nao deve duplicar
      expect(toastService.error).not.toHaveBeenCalled();
    });

    it('nao chama confirmar se ja ha uma confirmacao em andamento', async () => {
      const slow$ = new Subject<ProspeccaoUsoResponse>();
      const { fixture, prospeccaoApi } = await renderComponent({
        prospeccaoApiOverride: {
          confirmar: vi.fn().mockReturnValue(slow$.asObservable()),
        },
      });

      const comp = fixture.componentInstance as unknown as {
        confirmar: (uso: ProspeccaoUsoResponse) => void;
      };

      // Primeira chamada inicia (nao resolve pois slow$ nao emite)
      comp.confirmar(usosPendentes[0]);

      // Segunda chamada deve ser ignorada (confirmandoId ja esta setado)
      comp.confirmar(usosPendentes[1]);
      await fixture.whenStable();

      // confirmar chamado apenas uma vez
      expect(prospeccaoApi.confirmar).toHaveBeenCalledTimes(1);
    });
  });

  // ----------------------------------------------------------
  // Reverter uso
  // ----------------------------------------------------------

  describe('reverter uso', () => {
    it('chama prospeccaoApi.reverter com fichaId e usoId corretos', async () => {
      const { fixture, prospeccaoApi } = await renderComponent();
      const comp = fixture.componentInstance as unknown as {
        reverter: (uso: ProspeccaoUsoResponse) => void;
      };

      comp.reverter(usosPendentes[0]);
      await fixture.whenStable();

      expect(prospeccaoApi.reverter).toHaveBeenCalledWith(3, 1);
    });

    it('remove o uso da lista apos reverter com sucesso', async () => {
      const { fixture } = await renderComponent();
      const comp = fixture.componentInstance as unknown as {
        reverter: (uso: ProspeccaoUsoResponse) => void;
        pendentes: () => ProspeccaoUsoResponse[];
      };

      const qtdAntes = comp.pendentes().length;
      comp.reverter(usosPendentes[0]);
      await fixture.whenStable();

      expect(comp.pendentes().length).toBe(qtdAntes - 1);
      expect(comp.pendentes().find(u => u.usoId === 1)).toBeUndefined();
    });

    it('exibe toast de sucesso apos reverter', async () => {
      const { fixture, toastService } = await renderComponent();
      const comp = fixture.componentInstance as unknown as {
        reverter: (uso: ProspeccaoUsoResponse) => void;
      };

      comp.reverter(usosPendentes[0]);
      await fixture.whenStable();

      expect(toastService.success).toHaveBeenCalledWith(
        expect.stringContaining('D6'),
        expect.stringContaining('revertido'),
      );
    });

    it('reseta revertendoId para null apos reverter com sucesso', async () => {
      const { fixture } = await renderComponent();
      const comp = fixture.componentInstance as unknown as {
        reverter: (uso: ProspeccaoUsoResponse) => void;
        revertendoId: () => number | null;
      };

      comp.reverter(usosPendentes[0]);
      await fixture.whenStable();

      expect(comp.revertendoId()).toBeNull();
    });

    it('reseta revertendoId para null quando reverter falha', async () => {
      const { fixture } = await renderComponent({
        prospeccaoApiOverride: {
          reverter: vi.fn().mockReturnValue(throwError(() => new Error('HTTP 500'))),
        },
      });

      const comp = fixture.componentInstance as unknown as {
        reverter: (uso: ProspeccaoUsoResponse) => void;
        revertendoId: () => number | null;
      };

      comp.reverter(usosPendentes[0]);
      await fixture.whenStable();

      expect(comp.revertendoId()).toBeNull();
    });

    it('nao chama toastService.error quando reverter falha (interceptor cuida disso)', async () => {
      const { fixture, toastService } = await renderComponent({
        prospeccaoApiOverride: {
          reverter: vi.fn().mockReturnValue(throwError(() => new Error('HTTP 500'))),
        },
      });

      const comp = fixture.componentInstance as unknown as {
        reverter: (uso: ProspeccaoUsoResponse) => void;
      };

      comp.reverter(usosPendentes[0]);
      await fixture.whenStable();

      // O interceptor e responsavel pelo toast de erro, componente nao deve duplicar
      expect(toastService.error).not.toHaveBeenCalled();
    });

    it('nao chama reverter se ja ha uma reversao em andamento', async () => {
      const slow$ = new Subject<ProspeccaoUsoResponse>();
      const { fixture, prospeccaoApi } = await renderComponent({
        prospeccaoApiOverride: {
          reverter: vi.fn().mockReturnValue(slow$.asObservable()),
        },
      });

      const comp = fixture.componentInstance as unknown as {
        reverter: (uso: ProspeccaoUsoResponse) => void;
      };

      comp.reverter(usosPendentes[0]);
      comp.reverter(usosPendentes[1]);
      await fixture.whenStable();

      expect(prospeccaoApi.reverter).toHaveBeenCalledTimes(1);
    });
  });

  // ----------------------------------------------------------
  // Recarregar lista
  // ----------------------------------------------------------

  describe('recarregar lista', () => {
    it('carregarPendentes recarrega a lista quando chamado', async () => {
      const { fixture, prospeccaoApi } = await renderComponent();
      const comp = fixture.componentInstance as unknown as {
        carregarPendentes: () => void;
      };

      comp.carregarPendentes();
      await fixture.whenStable();

      expect(prospeccaoApi.listarPendentesJogo).toHaveBeenCalledTimes(2);
    });
  });

  // ----------------------------------------------------------
  // totalPendentes computed
  // ----------------------------------------------------------

  describe('totalPendentes', () => {
    it('retorna o numero correto de pendentes na lista', async () => {
      const { fixture } = await renderComponent();
      const comp = fixture.componentInstance as unknown as {
        totalPendentes: () => number;
      };
      expect(comp.totalPendentes()).toBe(2);
    });

    it('retorna zero quando lista esta vazia', async () => {
      const { fixture } = await renderComponent({
        prospeccaoApiOverride: {
          listarPendentesJogo: vi.fn().mockReturnValue(of([])),
        },
      });
      const comp = fixture.componentInstance as unknown as {
        totalPendentes: () => number;
      };
      expect(comp.totalPendentes()).toBe(0);
    });
  });

  // ----------------------------------------------------------
  // Helpers de template
  // ----------------------------------------------------------

  describe('formatarData', () => {
    it('retorna string vazia para entrada vazia', async () => {
      const { fixture } = await renderComponent();
      const comp = fixture.componentInstance as unknown as {
        formatarData: (s: string) => string;
      };
      expect(comp.formatarData('')).toBe('');
    });

    it('retorna data formatada para ISO valido', async () => {
      const { fixture } = await renderComponent();
      const comp = fixture.componentInstance as unknown as {
        formatarData: (s: string) => string;
      };
      const resultado = comp.formatarData('2026-04-01T10:00:00');
      expect(resultado).toContain('2026');
    });
  });

  // ----------------------------------------------------------
  // Tratamento de erros na carga
  // ----------------------------------------------------------

  describe('tratamento de erros na carga', () => {
    it('reseta isLoading para false quando a API falha', async () => {
      const { fixture } = await renderComponent({
        prospeccaoApiOverride: {
          listarPendentesJogo: vi.fn().mockReturnValue(throwError(() => new Error('HTTP 500'))),
        },
      });

      await fixture.whenStable();
      const comp = fixture.componentInstance as unknown as { isLoading: () => boolean };
      expect(comp.isLoading()).toBe(false);
    });

    it('nao chama toastService.error quando a carga falha (interceptor cuida disso)', async () => {
      const { toastService } = await renderComponent({
        prospeccaoApiOverride: {
          listarPendentesJogo: vi.fn().mockReturnValue(throwError(() => new Error('HTTP 500'))),
        },
      });
      // O interceptor e responsavel pelo toast de erro, componente nao deve duplicar
      expect(toastService.error).not.toHaveBeenCalled();
    });
  });
});
