/**
 * ProspeccaoComponent — Spec
 *
 * NOTA JIT (Armadilha 1): input.required() em ngOnInit() dispara NG0950 em JIT
 * porque Zone.js executa ngOnInit antes dos inputs serem atribuidos.
 * Solucao: detectChangesOnRender: false + setSignalInput() antes de detectChanges().
 *
 * Foco dos testes:
 * - Renderizacao inicial: tabela de usos, estado vazio, loading
 * - Fluxo Mestre: botao "Conceder Dado" visivel, dialogo, confirmar/reverter usos
 * - Fluxo Jogador: selector de dado visivel, botao usar desabilitado sem selecao
 * - Helpers de template: labelStatus, severityStatus
 * - Chamadas HTTP: listarUsos, conceder, confirmar, reverter, usar
 */
import { TestBed } from '@angular/core/testing';
import { render, screen } from '@testing-library/angular';
import { ɵSIGNAL as SIGNAL_SYM } from '@angular/core';
import { of, throwError, Subject } from 'rxjs';
import { vi, describe, it, expect, afterEach } from 'vitest';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MessageService } from 'primeng/api';

import { ProspeccaoComponent } from './prospeccao.component';
import { ProspeccaoApiService } from '@core/services/api/prospeccao.api.service';
import { ConfigApiService } from '@core/services/api/config-api.service';
import { AuthService } from '@services/auth.service';
import { ProspeccaoUsoResponse } from '@core/models/ficha.model';
import { DadoProspeccaoConfig } from '@core/models/config.models';

// ============================================================
// Helper JIT (Armadilha 1 — input.required())
// ============================================================

function setSignalInput<T>(component: unknown, inputName: string, value: T): void {
  const signalFn = (component as Record<string, unknown>)[inputName];
  if (signalFn && (signalFn as Record<symbol, unknown>)[SIGNAL_SYM as symbol]) {
    const node = (signalFn as Record<symbol, unknown>)[SIGNAL_SYM as symbol] as {
      applyValueToInputSignal: (node: unknown, v: T) => void;
    };
    node.applyValueToInputSignal(node, value);
  }
}

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
];

const usosConfirmados: ProspeccaoUsoResponse[] = [
  {
    usoId: 2,
    dadoNome: 'D8',
    dadoProspeccaoConfigId: 11,
    fichaId: 3,
    personagemNome: 'Aldric',
    status: 'CONFIRMADO',
    criadoEm: '2026-04-02T12:00:00',
  },
];

const usosVariados: ProspeccaoUsoResponse[] = [...usosPendentes, ...usosConfirmados];

const dadoD6: DadoProspeccaoConfig = {
  id: 10,
  jogoId: 5,
  nome: 'D6',
  descricao: 'Dado de seis faces',
  numeroFaces: 6,
  ordemExibicao: 1,
  dataCriacao: '2026-01-01T00:00:00',
  dataUltimaAtualizacao: '2026-01-01T00:00:00',
};

const dadosConfig: DadoProspeccaoConfig[] = [dadoD6];

const fichaResumoMock = {
  id: 3,
  nome: 'Aldric',
  nivel: 5,
  xp: 1000,
  racaNome: 'Humano',
  classeNome: 'Guerreiro',
  atributosTotais: {},
  bonusTotais: {},
  vidaAtual: 100,
  vidaTotal: 100,
  essenciaAtual: 50,
  essenciaTotal: 50,
  ameacaTotal: 10,
  pontosAtributoDisponiveis: 2,
  pontosAptidaoDisponiveis: 1,
  pontosVantagemDisponiveis: 3,
};

// ============================================================
// Mock factories
// ============================================================

function criarProspeccaoApiMock(overrides: Record<string, unknown> = {}) {
  return {
    listarUsos: vi.fn().mockReturnValue(of(usosVariados)),
    conceder: vi.fn().mockReturnValue(of(fichaResumoMock)),
    usar: vi.fn().mockReturnValue(of(usosPendentes[0])),
    confirmar: vi.fn().mockReturnValue(of({ ...usosPendentes[0], status: 'CONFIRMADO' })),
    reverter: vi.fn().mockReturnValue(of({ ...usosPendentes[0], status: 'REVERTIDO' })),
    listarPendentesJogo: vi.fn().mockReturnValue(of(usosPendentes)),
    ...overrides,
  };
}

function criarConfigApiMock() {
  return {
    listDadosProspeccao: vi.fn().mockReturnValue(of(dadosConfig)),
  };
}

function criarAuthServiceMock(isMestre = false) {
  return {
    isMestre: vi.fn().mockReturnValue(isMestre),
    currentUser: vi.fn().mockReturnValue({ id: '99', role: isMestre ? 'MESTRE' : 'JOGADOR' }),
  };
}

// ============================================================
// Helper de render (JIT-safe)
// ============================================================

type RenderOptions = {
  fichaId?: number;
  jogoId?: number;
  isMestre?: boolean;
  prospeccaoApiOverride?: Record<string, unknown>;
};

async function renderComponent(opts: RenderOptions = {}) {
  const {
    fichaId = 3,
    jogoId = 5,
    isMestre = false,
    prospeccaoApiOverride = {},
  } = opts;

  const prospeccaoApi = criarProspeccaoApiMock(prospeccaoApiOverride);
  const configApi = criarConfigApiMock();
  const authService = criarAuthServiceMock(isMestre);

  const result = await render(ProspeccaoComponent, {
    schemas: [NO_ERRORS_SCHEMA],
    detectChangesOnRender: false,
    providers: [
      MessageService,
      { provide: ProspeccaoApiService, useValue: prospeccaoApi },
      { provide: ConfigApiService, useValue: configApi },
      { provide: AuthService, useValue: authService },
    ],
  });

  const component = result.fixture.componentInstance;

  // Atribuir inputs ANTES de detectChanges (fix JIT NG0950)
  setSignalInput(component, 'fichaId', fichaId);
  setSignalInput(component, 'jogoId', jogoId);

  result.fixture.detectChanges();
  await result.fixture.whenStable();

  return { ...result, component, prospeccaoApi, configApi, authService };
}

// ============================================================
// Testes
// ============================================================

describe('ProspeccaoComponent', () => {

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  // ----------------------------------------------------------
  // Renderizacao inicial
  // ----------------------------------------------------------

  describe('renderizacao inicial', () => {
    it('chama listarUsos ao inicializar', async () => {
      const { prospeccaoApi } = await renderComponent({ fichaId: 3 });
      expect(prospeccaoApi.listarUsos).toHaveBeenCalledWith(3);
    });

    it('chama listDadosProspeccao com jogoId correto apos carregar usos', async () => {
      const { configApi } = await renderComponent({ jogoId: 5 });
      expect(configApi.listDadosProspeccao).toHaveBeenCalledWith(5);
    });

    it('exibe nomes dos dados nos usos carregados', async () => {
      const { fixture } = await renderComponent();
      const content = fixture.nativeElement.textContent as string;
      expect(content).toContain('D6');
      expect(content).toContain('D8');
    });

    it('exibe skeleton durante o carregamento', async () => {
      // Subject que nunca emite — simula requisicao pendente
      const pendente$ = new Subject<ProspeccaoUsoResponse[]>();
      const slowApi = criarProspeccaoApiMock({
        listarUsos: vi.fn().mockReturnValue(pendente$.asObservable()),
      });

      const result = await render(ProspeccaoComponent, {
        schemas: [NO_ERRORS_SCHEMA],
        detectChangesOnRender: false,
        providers: [
          MessageService,
          { provide: ProspeccaoApiService, useValue: slowApi },
          { provide: ConfigApiService, useValue: criarConfigApiMock() },
          { provide: AuthService, useValue: criarAuthServiceMock() },
        ],
      });

      setSignalInput(result.fixture.componentInstance, 'fichaId', 3);
      setSignalInput(result.fixture.componentInstance, 'jogoId', 5);
      result.fixture.detectChanges();

      // Enquanto pendente$, carregando=true e skeleton deve aparecer
      const comp = result.fixture.componentInstance as unknown as { carregando: () => boolean };
      expect(comp.carregando()).toBe(true);

      const skeleton = result.fixture.nativeElement.querySelector('p-skeleton');
      expect(skeleton).not.toBeNull();
    });

    it('exibe mensagem de estado vazio quando nao ha usos', async () => {
      await renderComponent({
        prospeccaoApiOverride: {
          listarUsos: vi.fn().mockReturnValue(of([])),
        },
      });
      // Mensagem de estado vazio deve estar presente
      const textos = screen.getAllByRole('status');
      expect(textos.length).toBeGreaterThan(0);
    });
  });

  // ----------------------------------------------------------
  // Fluxo Mestre
  // ----------------------------------------------------------

  describe('fluxo Mestre', () => {
    it('exibe botao "Conceder Dado" quando e Mestre', async () => {
      await renderComponent({ isMestre: true });
      expect(screen.getByRole('button', { name: /Conceder Dado/i })).toBeTruthy();
    });

    it('nao exibe botao "Conceder Dado" quando e Jogador', async () => {
      await renderComponent({ isMestre: false });
      const btn = screen.queryByRole('button', { name: /Conceder Dado/i });
      expect(btn).toBeNull();
    });

    it('abre dialog de conceder ao clicar no botao', async () => {
      const { component, fixture } = await renderComponent({ isMestre: true });

      const comp = component as unknown as {
        abrirDialogConceder: () => void;
        showDialogConceder: () => boolean;
      };

      comp.abrirDialogConceder();
      fixture.detectChanges();

      expect(comp.showDialogConceder()).toBe(true);
    });

    it('chama conceder com dados corretos ao executar', async () => {
      const { component, fixture, prospeccaoApi } = await renderComponent({ isMestre: true });

      const comp = component as unknown as {
        dadoConcederSelecionadoId: { set: (v: number) => void };
        quantidadeConceder: { set: (v: number) => void };
        executarConceder: () => void;
      };

      comp.dadoConcederSelecionadoId.set(10);
      comp.quantidadeConceder.set(3);
      comp.executarConceder();

      await fixture.whenStable();

      expect(prospeccaoApi.conceder).toHaveBeenCalledWith(3, {
        dadoProspeccaoConfigId: 10,
        quantidade: 3,
      });
    });

    it('chama confirmar com fichaId e usoId corretos', async () => {
      const { component, fixture, prospeccaoApi } = await renderComponent({ isMestre: true });

      const comp = component as unknown as {
        confirmarUsoMestre: (uso: ProspeccaoUsoResponse) => void;
      };

      comp.confirmarUsoMestre(usosPendentes[0]);
      await fixture.whenStable();

      expect(prospeccaoApi.confirmar).toHaveBeenCalledWith(3, 1);
    });

    it('chama reverter com fichaId e usoId corretos', async () => {
      const { component, fixture, prospeccaoApi } = await renderComponent({ isMestre: true });

      const comp = component as unknown as {
        reverterUsoMestre: (uso: ProspeccaoUsoResponse) => void;
      };

      comp.reverterUsoMestre(usosPendentes[0]);
      await fixture.whenStable();

      expect(prospeccaoApi.reverter).toHaveBeenCalledWith(3, 1);
    });

    it('atualiza status do uso ao confirmar com sucesso', async () => {
      const { component, fixture } = await renderComponent({ isMestre: true });

      const comp = component as unknown as {
        confirmarUsoMestre: (uso: ProspeccaoUsoResponse) => void;
        usos: () => ProspeccaoUsoResponse[];
      };

      comp.confirmarUsoMestre(usosPendentes[0]);
      await fixture.whenStable();

      const usoAtualizado = comp.usos().find(u => u.usoId === 1);
      expect(usoAtualizado?.status).toBe('CONFIRMADO');
    });

    it('atualiza status do uso ao reverter com sucesso', async () => {
      const { component, fixture } = await renderComponent({ isMestre: true });

      const comp = component as unknown as {
        reverterUsoMestre: (uso: ProspeccaoUsoResponse) => void;
        usos: () => ProspeccaoUsoResponse[];
      };

      comp.reverterUsoMestre(usosPendentes[0]);
      await fixture.whenStable();

      const usoAtualizado = comp.usos().find(u => u.usoId === 1);
      expect(usoAtualizado?.status).toBe('REVERTIDO');
    });

    it('reseta confirmandoId quando confirmar falha', async () => {
      const { component, fixture } = await renderComponent({
        isMestre: true,
        prospeccaoApiOverride: {
          confirmar: vi.fn().mockReturnValue(throwError(() => new Error('HTTP 500'))),
        },
      });

      const comp = component as unknown as {
        confirmarUsoMestre: (uso: ProspeccaoUsoResponse) => void;
        confirmandoId: () => number | null;
      };

      comp.confirmarUsoMestre(usosPendentes[0]);
      await fixture.whenStable();

      expect(comp.confirmandoId()).toBeNull();
    });

    it('calcula totalPendentes corretamente', async () => {
      const { component } = await renderComponent({ isMestre: true });

      const comp = component as unknown as {
        totalPendentes: () => number;
      };

      // usosVariados tem 1 pendente e 1 confirmado
      expect(comp.totalPendentes()).toBe(1);
    });
  });

  // ----------------------------------------------------------
  // Fluxo Jogador
  // ----------------------------------------------------------

  describe('fluxo Jogador', () => {
    it('nao exibe botao "Conceder Dado" para Jogador', async () => {
      await renderComponent({ isMestre: false });
      const btn = screen.queryByRole('button', { name: /Conceder Dado/i });
      expect(btn).toBeNull();
    });

    it('exibe selector de dado quando ha dados disponiveis (Jogador)', async () => {
      const { fixture } = await renderComponent({ isMestre: false });
      const select = fixture.nativeElement.querySelector('p-select');
      expect(select).not.toBeNull();
    });

    it('confirmarUso abre dialog de confirmacao quando dado esta selecionado', async () => {
      const { component, fixture } = await renderComponent({ isMestre: false });

      const comp = component as unknown as {
        dadoSelecionadoId: { set: (v: number) => void };
        confirmarUso: () => void;
        showDialogConfirmacaoUso: () => boolean;
      };

      comp.dadoSelecionadoId.set(10);
      comp.confirmarUso();
      fixture.detectChanges();

      expect(comp.showDialogConfirmacaoUso()).toBe(true);
    });

    it('confirmarUso nao abre dialog quando nenhum dado esta selecionado', async () => {
      const { component, fixture } = await renderComponent({ isMestre: false });

      const comp = component as unknown as {
        confirmarUso: () => void;
        showDialogConfirmacaoUso: () => boolean;
      };

      comp.confirmarUso();
      fixture.detectChanges();

      expect(comp.showDialogConfirmacaoUso()).toBe(false);
    });

    it('chama usar API com dadoProspeccaoConfigId correto', async () => {
      const { component, fixture, prospeccaoApi } = await renderComponent({ isMestre: false });

      const comp = component as unknown as {
        dadoSelecionadoId: { set: (v: number) => void };
        executarUso: () => void;
      };

      comp.dadoSelecionadoId.set(10);
      comp.executarUso();
      await fixture.whenStable();

      expect(prospeccaoApi.usar).toHaveBeenCalledWith(3, { dadoProspeccaoConfigId: 10 });
    });

    it('adiciona novo uso ao inicio da lista apos usar com sucesso', async () => {
      const { component, fixture } = await renderComponent({ isMestre: false });

      const comp = component as unknown as {
        dadoSelecionadoId: { set: (v: number) => void };
        executarUso: () => void;
        usos: () => ProspeccaoUsoResponse[];
      };

      const qtdAntes = comp.usos().length;
      comp.dadoSelecionadoId.set(10);
      comp.executarUso();
      await fixture.whenStable();

      // novo uso foi adicionado no inicio
      expect(comp.usos().length).toBe(qtdAntes + 1);
    });

    it('reseta usando=false e fecha dialog apos usar com sucesso', async () => {
      const { component, fixture } = await renderComponent({ isMestre: false });

      const comp = component as unknown as {
        dadoSelecionadoId: { set: (v: number) => void };
        executarUso: () => void;
        usando: () => boolean;
        showDialogConfirmacaoUso: () => boolean;
      };

      comp.dadoSelecionadoId.set(10);
      comp.executarUso();
      await fixture.whenStable();

      expect(comp.usando()).toBe(false);
      expect(comp.showDialogConfirmacaoUso()).toBe(false);
    });

    it('reseta usando=false quando usar falha', async () => {
      const { component, fixture } = await renderComponent({
        isMestre: false,
        prospeccaoApiOverride: {
          usar: vi.fn().mockReturnValue(throwError(() => new Error('HTTP 422'))),
        },
      });

      const comp = component as unknown as {
        dadoSelecionadoId: { set: (v: number) => void };
        executarUso: () => void;
        usando: () => boolean;
      };

      comp.dadoSelecionadoId.set(10);
      comp.executarUso();
      await fixture.whenStable();

      expect(comp.usando()).toBe(false);
    });

    it('dadoParaUso retorna o dado correto quando selecionado', async () => {
      const { component, fixture } = await renderComponent({ isMestre: false });

      const comp = component as unknown as {
        dadoSelecionadoId: { set: (v: number) => void };
        dadoParaUso: () => DadoProspeccaoConfig | null;
      };

      comp.dadoSelecionadoId.set(10);
      fixture.detectChanges();

      expect(comp.dadoParaUso()?.nome).toBe('D6');
    });

    it('dadoParaUso retorna null quando nenhum dado selecionado', async () => {
      const { component } = await renderComponent({ isMestre: false });

      const comp = component as unknown as {
        dadoParaUso: () => DadoProspeccaoConfig | null;
      };

      expect(comp.dadoParaUso()).toBeNull();
    });
  });

  // ----------------------------------------------------------
  // Helpers de template
  // ----------------------------------------------------------

  describe('helpers de template', () => {
    it('labelStatus retorna "Pendente" para PENDENTE', async () => {
      const { component } = await renderComponent();
      const comp = component as unknown as {
        labelStatus: (s: string) => string;
      };
      expect(comp.labelStatus('PENDENTE')).toBe('Pendente');
    });

    it('labelStatus retorna "Confirmado" para CONFIRMADO', async () => {
      const { component } = await renderComponent();
      const comp = component as unknown as {
        labelStatus: (s: string) => string;
      };
      expect(comp.labelStatus('CONFIRMADO')).toBe('Confirmado');
    });

    it('labelStatus retorna "Revertido" para REVERTIDO', async () => {
      const { component } = await renderComponent();
      const comp = component as unknown as {
        labelStatus: (s: string) => string;
      };
      expect(comp.labelStatus('REVERTIDO')).toBe('Revertido');
    });

    it('severityStatus retorna "warn" para PENDENTE', async () => {
      const { component } = await renderComponent();
      const comp = component as unknown as {
        severityStatus: (s: string) => string;
      };
      expect(comp.severityStatus('PENDENTE')).toBe('warn');
    });

    it('severityStatus retorna "success" para CONFIRMADO', async () => {
      const { component } = await renderComponent();
      const comp = component as unknown as {
        severityStatus: (s: string) => string;
      };
      expect(comp.severityStatus('CONFIRMADO')).toBe('success');
    });

    it('severityStatus retorna "secondary" para REVERTIDO', async () => {
      const { component } = await renderComponent();
      const comp = component as unknown as {
        severityStatus: (s: string) => string;
      };
      expect(comp.severityStatus('REVERTIDO')).toBe('secondary');
    });

    it('formatarData retorna string vazia para entrada vazia', async () => {
      const { component } = await renderComponent();
      const comp = component as unknown as {
        formatarData: (s: string) => string;
      };
      expect(comp.formatarData('')).toBe('');
    });

    it('formatarData retorna string formatada para data valida', async () => {
      const { component } = await renderComponent();
      const comp = component as unknown as {
        formatarData: (s: string) => string;
      };
      const resultado = comp.formatarData('2026-04-01T10:00:00');
      expect(resultado).toContain('2026');
      expect(resultado).toContain('04');
    });
  });

  // ----------------------------------------------------------
  // Erros de API
  // ----------------------------------------------------------

  describe('tratamento de erros', () => {
    it('exibe conteudo mesmo quando listarUsos falha (erro nao bloqueia renderizacao)', async () => {
      const { fixture } = await renderComponent({
        prospeccaoApiOverride: {
          listarUsos: vi.fn().mockReturnValue(throwError(() => new Error('HTTP 500'))),
        },
      });

      await fixture.whenStable();
      fixture.detectChanges();

      // O componente nao deve estar no estado de loading
      const comp = fixture.componentInstance as unknown as { carregando: () => boolean };
      expect(comp.carregando()).toBe(false);
    });

    it('nao chama listDadosProspeccao quando listarUsos falha', async () => {
      const { configApi } = await renderComponent({
        prospeccaoApiOverride: {
          listarUsos: vi.fn().mockReturnValue(throwError(() => new Error('HTTP 500'))),
        },
      });

      // configs nao sao carregadas quando usos falham
      expect(configApi.listDadosProspeccao).not.toHaveBeenCalled();
    });
  });
});
