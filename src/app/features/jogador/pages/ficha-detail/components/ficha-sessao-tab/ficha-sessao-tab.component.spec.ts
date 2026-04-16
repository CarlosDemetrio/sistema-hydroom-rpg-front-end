/**
 * FichaSessaoTabComponent — Spec
 *
 * NOTA JIT (Armadilha 1): input.required() em ngOnInit() dispara NG0950 em JIT
 * porque Zone.js executa ngOnInit antes dos inputs serem atribuidos.
 * Solucao: detectChangesOnRender: false + setSignalInput() antes de detectChanges().
 *
 * NOTA (Armadilha timer/polling): timer(30000, 30000) exige fake timers para nao
 * deixar o teste pendurado. Usamos vi.useFakeTimers() + vi.runAllTimers() quando
 * necessario testar o polling, e vi.useRealTimers() no afterEach.
 *
 * Cenarios cobertos:
 * 1.  Exibe vida atual e total do resumo no template
 * 2.  Exibe essencia atual e total do resumo no template
 * 3.  Botao Salvar chama atualizarVida com os valores corretos
 * 4.  Toast de sucesso apos salvar
 * 5.  Botao Salvar fica desabilitado quando dirty=false
 * 6.  Botao Salvar fica habilitado apos alterar um valor (dirty=true)
 * 7.  Botao "Resetar (Mestre)" visivel apenas quando isMestre=true
 * 8.  Resetar chama resetarEstado e atualiza vida/essencia
 * 9.  Polling nao sobrescreve valores quando dirty=true
 * 10. vidaPercent calculado corretamente
 */

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { render, screen } from '@testing-library/angular';
import { ɵSIGNAL as SIGNAL_SYM } from '@angular/core';
import { of, throwError } from 'rxjs';
import { vi, describe, it, expect, afterEach, beforeEach } from 'vitest';
import { MessageService } from 'primeng/api';

import { FichaSessaoTabComponent } from './ficha-sessao-tab.component';
import { FichasApiService } from '@core/services/api/fichas-api.service';
import { ConfigStore } from '@core/stores/config.store';
import { ToastService } from '@services/toast.service';
import { FichaResumo } from '@core/models/ficha.model';

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

function criarResumo(overrides: Partial<FichaResumo> = {}): FichaResumo {
  return {
    id: 1,
    nome: 'Aldric',
    nivel: 3,
    xp: 300,
    racaNome: 'Humano',
    classeNome: 'Guerreiro',
    atributosTotais: {},
    bonusTotais: {},
    vidaTotal: 100,
    vidaAtual: 80,
    essenciaTotal: 50,
    essenciaAtual: 30,
    ameacaTotal: 5,
    pontosVantagemDisponiveis: 0,
    pontosAtributoDisponiveis: 0,
    pontosAptidaoDisponiveis: 0,
    ...overrides,
  };
}

const resumoPadrao = criarResumo();

const membrosCorpoMock = [
  { id: 1, jogoId: 10, nome: 'Cabeca', porcentagemVida: 0.1, ordemExibicao: 1, dataCriacao: '', dataUltimaAtualizacao: '' },
  { id: 2, jogoId: 10, nome: 'Torso', porcentagemVida: 0.4, ordemExibicao: 2, dataCriacao: '', dataUltimaAtualizacao: '' },
];

// ============================================================
// Mock factories
// ============================================================

function criarFichasApiMock(overrides: Record<string, unknown> = {}) {
  return {
    getFichaResumo: vi.fn().mockReturnValue(of(resumoPadrao)),
    atualizarVida: vi.fn().mockReturnValue(of(resumoPadrao)),
    resetarEstado: vi.fn().mockReturnValue(of(criarResumo({ vidaAtual: 100, essenciaAtual: 50 }))),
    ...overrides,
  };
}

function criarConfigStoreMock(membros = membrosCorpoMock) {
  return {
    membrosCorpo: vi.fn().mockReturnValue(membros),
  };
}

function criarToastServiceMock() {
  return {
    success: vi.fn(),
    error: vi.fn(),
  };
}

// ============================================================
// Helper de render (JIT-safe)
// ============================================================

type RenderOptions = {
  fichaId?: number;
  resumo?: FichaResumo;
  isMestre?: boolean;
  fichasApiOverride?: Record<string, unknown>;
  membros?: typeof membrosCorpoMock;
};

async function renderComponent(opts: RenderOptions = {}) {
  const {
    fichaId = 1,
    resumo = resumoPadrao,
    isMestre = false,
    fichasApiOverride = {},
    membros = membrosCorpoMock,
  } = opts;

  const fichasApi = criarFichasApiMock(fichasApiOverride);
  const configStore = criarConfigStoreMock(membros);
  const toastService = criarToastServiceMock();

  const result = await render(FichaSessaoTabComponent, {
    schemas: [NO_ERRORS_SCHEMA],
    detectChangesOnRender: false,
    providers: [
      MessageService,
      { provide: FichasApiService, useValue: fichasApi },
      { provide: ConfigStore, useValue: configStore },
      { provide: ToastService, useValue: toastService },
    ],
  });

  const component = result.fixture.componentInstance;

  // Atribuir inputs ANTES de detectChanges (fix JIT NG0950)
  setSignalInput(component, 'fichaId', fichaId);
  setSignalInput(component, 'resumo', resumo);
  setSignalInput(component, 'isMestre', isMestre);

  result.fixture.detectChanges();
  await result.fixture.whenStable();

  return { ...result, component, fichasApi, configStore, toastService };
}

// ============================================================
// Testes
// ============================================================

describe('FichaSessaoTabComponent', () => {

  afterEach(() => {
    vi.useRealTimers();
    TestBed.resetTestingModule();
  });

  // ----------------------------------------------------------
  // 1. Exibicao de vida
  // ----------------------------------------------------------

  describe('exibicao de vida', () => {
    it('deve exibir vida atual e total no template', async () => {
      await renderComponent({
        resumo: criarResumo({ vidaAtual: 80, vidaTotal: 100 }),
      });

      // O texto "80 / 100" aparece no resumo de texto da barra
      expect(screen.getAllByText(/80\s*\/\s*100/).length).toBeGreaterThan(0);
    });

    it('deve inicializar vidaAtualEditando com o valor do resumo', async () => {
      const { component } = await renderComponent({
        resumo: criarResumo({ vidaAtual: 75, vidaTotal: 100 }),
      });

      const comp = component as unknown as { vidaAtualEditando: () => number };
      expect(comp.vidaAtualEditando()).toBe(75);
    });

    it('deve calcular vidaPercent corretamente', async () => {
      const { component } = await renderComponent({
        resumo: criarResumo({ vidaAtual: 50, vidaTotal: 100 }),
      });

      const comp = component as unknown as { vidaPercent: () => number };
      expect(comp.vidaPercent()).toBe(50);
    });

    it('deve retornar vidaPercent=0 quando vidaTotal=0 (sem divisao por zero)', async () => {
      const { component } = await renderComponent({
        resumo: criarResumo({ vidaAtual: 0, vidaTotal: 0 }),
      });

      const comp = component as unknown as { vidaPercent: () => number };
      expect(comp.vidaPercent()).toBe(0);
    });
  });

  // ----------------------------------------------------------
  // 2. Exibicao de essencia
  // ----------------------------------------------------------

  describe('exibicao de essencia', () => {
    it('deve exibir essencia atual e total no template', async () => {
      await renderComponent({
        resumo: criarResumo({ essenciaAtual: 30, essenciaTotal: 50 }),
      });

      expect(screen.getAllByText(/30\s*\/\s*50/).length).toBeGreaterThan(0);
    });

    it('deve inicializar essenciaAtualEditando com o valor do resumo', async () => {
      const { component } = await renderComponent({
        resumo: criarResumo({ essenciaAtual: 20, essenciaTotal: 50 }),
      });

      const comp = component as unknown as { essenciaAtualEditando: () => number };
      expect(comp.essenciaAtualEditando()).toBe(20);
    });

    it('deve retornar essenciaPercent=0 quando essenciaTotal=0', async () => {
      const { component } = await renderComponent({
        resumo: criarResumo({ essenciaAtual: 0, essenciaTotal: 0 }),
      });

      const comp = component as unknown as { essenciaPercent: () => number };
      expect(comp.essenciaPercent()).toBe(0);
    });
  });

  // ----------------------------------------------------------
  // 3. Botao Salvar — chamada da API
  // ----------------------------------------------------------

  describe('salvar estado', () => {
    it('deve chamar atualizarVida com vidaAtual, essenciaAtual e membros ao salvar', async () => {
      const { component, fichasApi } = await renderComponent({
        fichaId: 42,
        resumo: criarResumo({ vidaAtual: 80, essenciaAtual: 30 }),
      });

      // Marca dirty para habilitar o botao
      const comp = component as unknown as { dirty: () => boolean; dirty: { set: (v: boolean) => void } };
      (component as unknown as { dirty: { set: (v: boolean) => void } }).dirty.set(true);

      (component as unknown as { salvar: () => void }).salvar();
      await (component as { fixture?: { whenStable: () => Promise<void> } }).fixture?.whenStable?.();

      expect(fichasApi.atualizarVida).toHaveBeenCalledWith(42, expect.objectContaining({
        vidaAtual: 80,
        essenciaAtual: 30,
        membros: expect.any(Array),
      }));
    });

    it('deve incluir os membros no payload do salvar', async () => {
      const { component, fichasApi } = await renderComponent({
        fichaId: 1,
        membros: membrosCorpoMock,
      });

      (component as unknown as { dirty: { set: (v: boolean) => void } }).dirty.set(true);
      (component as unknown as { salvar: () => void }).salvar();

      expect(fichasApi.atualizarVida).toHaveBeenCalledWith(1, expect.objectContaining({
        membros: expect.arrayContaining([
          expect.objectContaining({ membroCorpoConfigId: 1 }),
          expect.objectContaining({ membroCorpoConfigId: 2 }),
        ]),
      }));
    });

    it('deve exibir toast de sucesso apos salvar com sucesso', async () => {
      const { component, toastService } = await renderComponent({ fichaId: 1 });

      (component as unknown as { dirty: { set: (v: boolean) => void } }).dirty.set(true);
      (component as unknown as { salvar: () => void }).salvar();

      expect(toastService.success).toHaveBeenCalledWith('Estado de combate salvo com sucesso!');
    });

    it('deve limpar dirty apos salvar com sucesso', async () => {
      const { component } = await renderComponent({ fichaId: 1 });

      (component as unknown as { dirty: { set: (v: boolean) => void } }).dirty.set(true);
      (component as unknown as { salvar: () => void }).salvar();

      const comp = component as unknown as { dirty: () => boolean };
      expect(comp.dirty()).toBe(false);
    });

    it('deve manter salvando=false apos erro', async () => {
      const { component } = await renderComponent({
        fichaId: 1,
        fichasApiOverride: {
          atualizarVida: vi.fn().mockReturnValue(throwError(() => new Error('fail'))),
        },
      });

      (component as unknown as { dirty: { set: (v: boolean) => void } }).dirty.set(true);
      (component as unknown as { salvar: () => void }).salvar();

      const comp = component as unknown as { salvando: () => boolean };
      expect(comp.salvando()).toBe(false);
    });
  });

  // ----------------------------------------------------------
  // 4. Botao Salvar — estado de habilitacao
  // ----------------------------------------------------------

  describe('estado do botao salvar', () => {
    it('deve inicializar com dirty=false (botao desabilitado)', async () => {
      const { component } = await renderComponent();

      const comp = component as unknown as { dirty: () => boolean };
      expect(comp.dirty()).toBe(false);
    });

    it('deve marcar dirty=true ao chamar marcarDirty()', async () => {
      const { component } = await renderComponent();

      (component as unknown as { marcarDirty: () => void }).marcarDirty();

      const comp = component as unknown as { dirty: () => boolean };
      expect(comp.dirty()).toBe(true);
    });
  });

  // ----------------------------------------------------------
  // 5. Botao Resetar — visibilidade e comportamento
  // ----------------------------------------------------------

  describe('botao resetar', () => {
    it('deve exibir botao "Resetar (Mestre)" quando isMestre=true', async () => {
      await renderComponent({ isMestre: true });

      expect(screen.getByText('Resetar (Mestre)')).toBeTruthy();
    });

    it('NAO deve exibir botao "Resetar (Mestre)" quando isMestre=false', async () => {
      await renderComponent({ isMestre: false });

      expect(screen.queryByText('Resetar (Mestre)')).toBeNull();
    });

    it('deve chamar resetarEstado ao resetar', async () => {
      const { component, fichasApi } = await renderComponent({ fichaId: 7, isMestre: true });

      (component as unknown as { resetar: () => void }).resetar();

      expect(fichasApi.resetarEstado).toHaveBeenCalledWith(7);
    });

    it('deve atualizar vida e essencia ao maximo apos resetar', async () => {
      const { component } = await renderComponent({
        fichaId: 1,
        isMestre: true,
        fichasApiOverride: {
          resetarEstado: vi.fn().mockReturnValue(
            of(criarResumo({ vidaAtual: 100, vidaTotal: 100, essenciaAtual: 50, essenciaTotal: 50 }))
          ),
        },
      });

      (component as unknown as { resetar: () => void }).resetar();

      const comp = component as unknown as {
        vidaAtualEditando: () => number;
        essenciaAtualEditando: () => number;
      };
      expect(comp.vidaAtualEditando()).toBe(100);
      expect(comp.essenciaAtualEditando()).toBe(50);
    });

    it('deve zerar dano dos membros apos resetar', async () => {
      const { component } = await renderComponent({ fichaId: 1, isMestre: true });

      // Primeiro marca algum dano
      (component as unknown as { onDanoMembroChange: (id: number, v: number) => void })
        .onDanoMembroChange(1, 20);

      // Reseta
      (component as unknown as { resetar: () => void }).resetar();

      const comp = component as unknown as { membros: () => Array<{ danoRecebido: number }> };
      const membros = comp.membros();
      expect(membros.every(m => m.danoRecebido === 0)).toBe(true);
    });
  });

  // ----------------------------------------------------------
  // 6. Polling — nao sobrescreve edicao ativa
  // Nota: usa vi.useFakeTimers() localmente para controlar o timer(30000).
  // ----------------------------------------------------------

  describe('polling de 30s', () => {
    it('NAO deve sobrescrever vida/essencia quando dirty=true (usuario editando)', async () => {
      vi.useFakeTimers();

      const resumoInicial = criarResumo({ vidaAtual: 80, essenciaAtual: 30 });
      const resumoPolling = criarResumo({ vidaAtual: 60, essenciaAtual: 20 });

      const fichasApi = criarFichasApiMock({
        getFichaResumo: vi.fn().mockReturnValue(of(resumoPolling)),
      });

      const result = await render(FichaSessaoTabComponent, {
        schemas: [NO_ERRORS_SCHEMA],
        detectChangesOnRender: false,
        providers: [
          MessageService,
          { provide: FichasApiService, useValue: fichasApi },
          { provide: ConfigStore, useValue: criarConfigStoreMock() },
          { provide: ToastService, useValue: criarToastServiceMock() },
        ],
      });

      const component = result.fixture.componentInstance;
      setSignalInput(component, 'fichaId', 1);
      setSignalInput(component, 'resumo', resumoInicial);
      setSignalInput(component, 'isMestre', false);

      result.fixture.detectChanges();

      // Marca dirty (usuario esta editando)
      (component as unknown as { dirty: { set: (v: boolean) => void } }).dirty.set(true);

      // Avanca 30s para disparar o polling
      vi.advanceTimersByTime(30_000);
      result.fixture.detectChanges();

      const comp = component as unknown as {
        vidaAtualEditando: () => number;
        essenciaAtualEditando: () => number;
      };

      // Valores NAO devem ter sido sobrescritos pelo polling
      expect(comp.vidaAtualEditando()).toBe(80);
      expect(comp.essenciaAtualEditando()).toBe(30);

      vi.useRealTimers();
    });

    it('deve atualizar vida/essencia quando NAO ha edicao pendente (dirty=false)', async () => {
      vi.useFakeTimers();

      const resumoInicial = criarResumo({ vidaAtual: 80, essenciaAtual: 30 });
      const resumoPolling = criarResumo({ vidaAtual: 60, essenciaAtual: 20 });

      const fichasApi = criarFichasApiMock({
        getFichaResumo: vi.fn().mockReturnValue(of(resumoPolling)),
      });

      const result = await render(FichaSessaoTabComponent, {
        schemas: [NO_ERRORS_SCHEMA],
        detectChangesOnRender: false,
        providers: [
          MessageService,
          { provide: FichasApiService, useValue: fichasApi },
          { provide: ConfigStore, useValue: criarConfigStoreMock() },
          { provide: ToastService, useValue: criarToastServiceMock() },
        ],
      });

      const component = result.fixture.componentInstance;
      setSignalInput(component, 'fichaId', 1);
      setSignalInput(component, 'resumo', resumoInicial);
      setSignalInput(component, 'isMestre', false);

      result.fixture.detectChanges();

      // dirty=false (padrao) — polling pode sobrescrever

      vi.advanceTimersByTime(30_000);
      result.fixture.detectChanges();

      const comp = component as unknown as {
        vidaAtualEditando: () => number;
        essenciaAtualEditando: () => number;
      };

      expect(comp.vidaAtualEditando()).toBe(60);
      expect(comp.essenciaAtualEditando()).toBe(20);

      vi.useRealTimers();
    });
  });

  // ----------------------------------------------------------
  // 7. Membros do corpo
  // ----------------------------------------------------------

  describe('membros do corpo', () => {
    it('deve inicializar membros com danoRecebido=0', async () => {
      const { component } = await renderComponent({ membros: membrosCorpoMock });

      const comp = component as unknown as { membros: () => Array<{ danoRecebido: number }> };
      expect(comp.membros().every(m => m.danoRecebido === 0)).toBe(true);
    });

    it('deve atualizar danoRecebido ao chamar onDanoMembroChange', async () => {
      const { component } = await renderComponent({ membros: membrosCorpoMock });

      (component as unknown as { onDanoMembroChange: (id: number, v: number) => void })
        .onDanoMembroChange(1, 15);

      const comp = component as unknown as { membros: () => Array<{ membroCorpoConfigId: number; danoRecebido: number }> };
      const membro = comp.membros().find(m => m.membroCorpoConfigId === 1);
      expect(membro?.danoRecebido).toBe(15);
    });

    it('deve exibir nomes dos membros quando existem configuracoes', async () => {
      await renderComponent({ membros: membrosCorpoMock });

      expect(screen.getByText('Cabeca')).toBeTruthy();
      expect(screen.getByText('Torso')).toBeTruthy();
    });

    it('NAO deve exibir secao de membros quando lista esta vazia', async () => {
      await renderComponent({ membros: [] });

      expect(screen.queryByText('Membros do Corpo')).toBeNull();
    });
  });
});
