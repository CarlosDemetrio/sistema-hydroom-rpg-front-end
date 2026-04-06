/**
 * FichaHeaderComponent — Spec
 *
 * Componente dumb: recebe dados via input() e emite eventos via output().
 *
 * NOTA JIT (Armadilha 1): O componente tem input.required() (ficha, resumo).
 * Em JIT, Zone.js dispara CD antes do valor ser atribuido, causando NG0950.
 * Solucao: detectChangesOnRender: false + setSignalInput() antes de detectChanges().
 *
 * Cenarios cobertos:
 * 1.  essenciaAtual=10, essenciaTotal=20 -> exibe "10 / 20" no template
 * 2.  essenciaTotal=0 -> essenciaPercent retorna 0 (sem divisao por zero)
 * 3.  essenciaAtual=20, essenciaTotal=20 -> essenciaPercent retorna 100 (ficha cheia)
 * 4.  essenciaAtual=10, essenciaTotal=20 -> essenciaPercent retorna 50
 * 5.  vidaAtual=40, vidaTotal=80 -> exibe "40 / 80" no template
 * 6.  vidaTotal=0 -> vidaPercent retorna 0 (sem divisao por zero)
 * 7.  Nome da ficha exibido no header
 * 8.  Botao "Editar" visivel somente quando podeEditar=true
 * 9.  Botao "Deletar" visivel somente quando podeDeletar=true
 * 10. Ao clicar "Editar", emite editarClick
 */

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { render, screen, fireEvent } from '@testing-library/angular';
import { ɵSIGNAL as SIGNAL_SYM } from '@angular/core';
import { vi } from 'vitest';

import { FichaHeaderComponent } from './ficha-header.component';
import { Ficha, FichaResumo } from '@core/models/ficha.model';

// ============================================================
// Helper JIT (Armadilha 1): atribuir valor a input.required() signal
// antes do primeiro detectChanges().
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

const fichaMock: Ficha = {
  id: 1,
  jogoId: 10,
  nome: 'Aldric',
  jogadorId: 42,
  racaId: 2,
  racaNome: 'Humano',
  classeId: 3,
  classeNome: 'Guerreiro',
  generoId: null,
  generoNome: null,
  indoleId: null,
  indoleNome: null,
  presencaId: null,
  presencaNome: null,
  nivel: 3,
  xp: 300,
  renascimentos: 0,
  isNpc: false,
  descricao: null,
  status: 'ATIVA',
  dataCriacao: '2024-01-01T00:00:00',
  dataUltimaAtualizacao: '2024-01-01T00:00:00',
};

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
    vidaTotal: 80,
    vidaAtual: 80,
    essenciaTotal: 20,
    essenciaAtual: 20,
    ameacaTotal: 5,
    pontosVantagemDisponiveis: 0,
    pontosAtributoDisponiveis: 0,
    pontosAptidaoDisponiveis: 0,
    ...overrides,
  };
}

// ============================================================
// Helper de render
// ============================================================

type RenderOptions = {
  ficha?: Ficha;
  resumo?: FichaResumo;
  podeEditar?: boolean;
  podeDeletar?: boolean;
  podeDuplicar?: boolean;
  mostrarBotaoVisibilidade?: boolean;
};

async function renderComponent(opts: RenderOptions = {}) {
  const result = await render(FichaHeaderComponent, {
    schemas: [NO_ERRORS_SCHEMA],
    detectChangesOnRender: false,
  });

  const component = result.fixture.componentInstance;

  setSignalInput(component, 'ficha', opts.ficha ?? fichaMock);
  setSignalInput(component, 'resumo', opts.resumo ?? criarResumo());
  setSignalInput(component, 'podeEditar', opts.podeEditar ?? false);
  setSignalInput(component, 'podeDeletar', opts.podeDeletar ?? false);
  setSignalInput(component, 'podeDuplicar', opts.podeDuplicar ?? false);
  setSignalInput(component, 'mostrarBotaoVisibilidade', opts.mostrarBotaoVisibilidade ?? false);

  result.fixture.detectChanges();

  return result;
}

// ============================================================
// Testes
// ============================================================

describe('FichaHeaderComponent', () => {

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  // ----------------------------------------------------------
  // 1. Exibicao de essencia no template
  // ----------------------------------------------------------

  describe('barra de essencia', () => {
    it('deve exibir "10 / 20" quando essenciaAtual=10 e essenciaTotal=20', async () => {
      await renderComponent({
        resumo: criarResumo({ essenciaAtual: 10, essenciaTotal: 20 }),
      });

      expect(screen.getByText('10 / 20')).toBeTruthy();
    });

    it('deve exibir "20 / 20" quando essencia esta cheia', async () => {
      await renderComponent({
        resumo: criarResumo({ essenciaAtual: 20, essenciaTotal: 20 }),
      });

      expect(screen.getByText('20 / 20')).toBeTruthy();
    });

    it('deve exibir "0 / 0" quando essenciaTotal=0 (ficha sem essencia configurada)', async () => {
      await renderComponent({
        resumo: criarResumo({ essenciaAtual: 0, essenciaTotal: 0 }),
      });

      expect(screen.getByText('0 / 0')).toBeTruthy();
    });
  });

  // ----------------------------------------------------------
  // 2. essenciaPercent — calculo sem divisao por zero
  // ----------------------------------------------------------

  describe('essenciaPercent computed', () => {
    it('deve retornar 0 quando essenciaTotal=0 (sem divisao por zero)', async () => {
      const result = await render(FichaHeaderComponent, {
        schemas: [NO_ERRORS_SCHEMA],
        detectChangesOnRender: false,
      });

      const component = result.fixture.componentInstance;
      setSignalInput(component, 'ficha', fichaMock);
      setSignalInput(component, 'resumo', criarResumo({ essenciaAtual: 0, essenciaTotal: 0 }));
      setSignalInput(component, 'podeEditar', false);
      setSignalInput(component, 'podeDeletar', false);
      setSignalInput(component, 'podeDuplicar', false);
      setSignalInput(component, 'mostrarBotaoVisibilidade', false);
      result.fixture.detectChanges();

      // Acessar o computed interno via cast para testar logica de negocio
      const comp = component as unknown as { essenciaPercent: () => number };
      expect(comp.essenciaPercent()).toBe(0);
    });

    it('deve retornar 50 quando essenciaAtual=10 e essenciaTotal=20', async () => {
      const result = await render(FichaHeaderComponent, {
        schemas: [NO_ERRORS_SCHEMA],
        detectChangesOnRender: false,
      });

      const component = result.fixture.componentInstance;
      setSignalInput(component, 'ficha', fichaMock);
      setSignalInput(component, 'resumo', criarResumo({ essenciaAtual: 10, essenciaTotal: 20 }));
      setSignalInput(component, 'podeEditar', false);
      setSignalInput(component, 'podeDeletar', false);
      setSignalInput(component, 'podeDuplicar', false);
      setSignalInput(component, 'mostrarBotaoVisibilidade', false);
      result.fixture.detectChanges();

      const comp = component as unknown as { essenciaPercent: () => number };
      expect(comp.essenciaPercent()).toBe(50);
    });

    it('deve retornar 100 quando essenciaAtual=essenciaTotal (ficha cheia)', async () => {
      const result = await render(FichaHeaderComponent, {
        schemas: [NO_ERRORS_SCHEMA],
        detectChangesOnRender: false,
      });

      const component = result.fixture.componentInstance;
      setSignalInput(component, 'ficha', fichaMock);
      setSignalInput(component, 'resumo', criarResumo({ essenciaAtual: 20, essenciaTotal: 20 }));
      setSignalInput(component, 'podeEditar', false);
      setSignalInput(component, 'podeDeletar', false);
      setSignalInput(component, 'podeDuplicar', false);
      setSignalInput(component, 'mostrarBotaoVisibilidade', false);
      result.fixture.detectChanges();

      const comp = component as unknown as { essenciaPercent: () => number };
      expect(comp.essenciaPercent()).toBe(100);
    });
  });

  // ----------------------------------------------------------
  // 3. vidaPercent — calculo sem divisao por zero
  // ----------------------------------------------------------

  describe('vidaPercent computed', () => {
    it('deve retornar 0 quando vidaTotal=0 (sem divisao por zero)', async () => {
      const result = await render(FichaHeaderComponent, {
        schemas: [NO_ERRORS_SCHEMA],
        detectChangesOnRender: false,
      });

      const component = result.fixture.componentInstance;
      setSignalInput(component, 'ficha', fichaMock);
      setSignalInput(component, 'resumo', criarResumo({ vidaAtual: 0, vidaTotal: 0 }));
      setSignalInput(component, 'podeEditar', false);
      setSignalInput(component, 'podeDeletar', false);
      setSignalInput(component, 'podeDuplicar', false);
      setSignalInput(component, 'mostrarBotaoVisibilidade', false);
      result.fixture.detectChanges();

      const comp = component as unknown as { vidaPercent: () => number };
      expect(comp.vidaPercent()).toBe(0);
    });

    it('deve retornar 50 quando vidaAtual=40 e vidaTotal=80', async () => {
      const result = await render(FichaHeaderComponent, {
        schemas: [NO_ERRORS_SCHEMA],
        detectChangesOnRender: false,
      });

      const component = result.fixture.componentInstance;
      setSignalInput(component, 'ficha', fichaMock);
      setSignalInput(component, 'resumo', criarResumo({ vidaAtual: 40, vidaTotal: 80 }));
      setSignalInput(component, 'podeEditar', false);
      setSignalInput(component, 'podeDeletar', false);
      setSignalInput(component, 'podeDuplicar', false);
      setSignalInput(component, 'mostrarBotaoVisibilidade', false);
      result.fixture.detectChanges();

      const comp = component as unknown as { vidaPercent: () => number };
      expect(comp.vidaPercent()).toBe(50);
    });
  });

  // ----------------------------------------------------------
  // 4. Exibicao de vida no template
  // ----------------------------------------------------------

  describe('barra de vida', () => {
    it('deve exibir "40 / 80" quando vidaAtual=40 e vidaTotal=80', async () => {
      await renderComponent({
        resumo: criarResumo({ vidaAtual: 40, vidaTotal: 80 }),
      });

      expect(screen.getByText('40 / 80')).toBeTruthy();
    });
  });

  // ----------------------------------------------------------
  // 5. Nome da ficha
  // ----------------------------------------------------------

  describe('identidade', () => {
    it('deve exibir o nome da ficha no header', async () => {
      await renderComponent({
        ficha: { ...fichaMock, nome: 'Zephyra' },
      });

      expect(screen.getByText('Zephyra')).toBeTruthy();
    });
  });

  // ----------------------------------------------------------
  // 6. Botoes de acao
  // ----------------------------------------------------------

  describe('botoes de acao', () => {
    it('deve exibir botao Editar quando podeEditar=true', async () => {
      await renderComponent({ podeEditar: true });

      expect(screen.getByRole('button', { name: /Editar/i })).toBeTruthy();
    });

    it('nao deve exibir botao Editar quando podeEditar=false', async () => {
      await renderComponent({ podeEditar: false });

      expect(screen.queryByRole('button', { name: /Editar/i })).toBeNull();
    });

    it('deve exibir botao Deletar quando podeDeletar=true', async () => {
      await renderComponent({ podeDeletar: true });

      expect(screen.getByRole('button', { name: /Deletar/i })).toBeTruthy();
    });

    it('deve emitir editarClick ao clicar no botao Editar', async () => {
      const result = await render(FichaHeaderComponent, {
        schemas: [NO_ERRORS_SCHEMA],
        detectChangesOnRender: false,
      });

      const component = result.fixture.componentInstance;
      setSignalInput(component, 'ficha', fichaMock);
      setSignalInput(component, 'resumo', criarResumo());
      setSignalInput(component, 'podeEditar', true);
      setSignalInput(component, 'podeDeletar', false);
      setSignalInput(component, 'podeDuplicar', false);
      setSignalInput(component, 'mostrarBotaoVisibilidade', false);
      result.fixture.detectChanges();

      const emitSpy = vi.spyOn(component.editarClick, 'emit');
      const botao = screen.getByRole('button', { name: /Editar/i });
      fireEvent.click(botao);

      expect(emitSpy).toHaveBeenCalledOnce();
    });
  });
});
