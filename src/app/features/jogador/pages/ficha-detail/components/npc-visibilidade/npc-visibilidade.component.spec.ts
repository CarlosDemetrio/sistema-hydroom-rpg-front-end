/**
 * NpcVisibilidadeComponent — Spec
 *
 * NOTA JIT (Armadilha 1): input.required() em ngOnInit() dispara NG0950 em JIT
 * porque Zone.js executa ngOnInit antes dos inputs serem atribuidos.
 * Solucao: detectChangesOnRender: false + setSignalInput() antes de detectChanges().
 *
 * Foco dos testes:
 * - Renderizacao do toggle e multiselect
 * - Botao salvar desabilitado sem alteracoes
 * - Botao salvar habilitado apos alterar toggle
 * - houveAlteracao computed retorna true/false corretamente
 * - Calls HTTP ao salvar via FichaVisibilidadeApiService mockado
 */
import { TestBed } from '@angular/core/testing';
import { render, screen } from '@testing-library/angular';
import { ɵSIGNAL as SIGNAL_SYM } from '@angular/core';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MessageService } from 'primeng/api';

import { NpcVisibilidadeComponent } from './npc-visibilidade.component';
import { FichaVisibilidadeApiService } from '@core/services/api/ficha-visibilidade.api.service';
import { JogosApiService } from '@core/services/api/jogos-api.service';
import { JogadorAcessoItem, FichaVisibilidadeResponse } from '@core/models/ficha.model';
import { Participante } from '@core/models/participante.model';

// ============================================================
// Helper JIT (Armadilha 1)
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

const jogadorAcesso1: JogadorAcessoItem = {
  jogadorId: 10,
  jogadorNome: 'Alice',
  nomePersonagem: 'Elara',
};

const jogadorAcesso2: JogadorAcessoItem = {
  jogadorId: 20,
  jogadorNome: 'Bob',
  nomePersonagem: 'Thorin',
};

const participante1: Participante = {
  id: 1,
  jogoId: 5,
  usuarioId: 10,
  nomeUsuario: 'Alice',
  role: 'JOGADOR',
  status: 'APROVADO',
  dataCriacao: '2024-01-01T00:00:00',
  dataUltimaAtualizacao: '2024-01-01T00:00:00',
};

const participante2: Participante = {
  ...participante1,
  id: 2,
  usuarioId: 20,
  nomeUsuario: 'Bob',
};

const visibilidadeResposta: FichaVisibilidadeResponse = {
  fichaId: 3,
  visivelGlobalmente: false,
  jogadoresComAcesso: [jogadorAcesso1],
};

// ============================================================
// Mock factories
// ============================================================

function criarVisibilidadeApiMock(overrides: Record<string, unknown> = {}) {
  return {
    listarVisibilidade: vi.fn().mockReturnValue(of(visibilidadeResposta)),
    atualizarVisibilidade: vi.fn().mockReturnValue(of(visibilidadeResposta)),
    revogarAcesso: vi.fn().mockReturnValue(of(undefined)),
    atualizarGlobal: vi.fn().mockReturnValue(of({ id: 3, isNpc: true, visivelGlobalmente: true })),
    ...overrides,
  };
}

function criarJogosApiMock(participantes: Participante[] = [participante1, participante2]) {
  return {
    listParticipantes: vi.fn().mockReturnValue(of(participantes)),
  };
}

// ============================================================
// Helper de render (JIT-safe)
// ============================================================

type RenderOptions = {
  fichaId?: number;
  jogoId?: number;
  visivelGlobalmente?: boolean;
  jogadoresComAcesso?: JogadorAcessoItem[];
  visibilidadeApiOverride?: Record<string, unknown>;
  participantes?: Participante[];
};

async function renderComponent(opts: RenderOptions = {}) {
  const {
    fichaId = 3,
    jogoId = 5,
    visivelGlobalmente = false,
    jogadoresComAcesso = [],
    visibilidadeApiOverride = {},
    participantes = [participante1, participante2],
  } = opts;

  const visibilidadeApi = criarVisibilidadeApiMock(visibilidadeApiOverride);
  const jogosApi = criarJogosApiMock(participantes);

  const result = await render(NpcVisibilidadeComponent, {
    schemas: [NO_ERRORS_SCHEMA],
    detectChangesOnRender: false,
    providers: [
      MessageService,
      { provide: FichaVisibilidadeApiService, useValue: visibilidadeApi },
      { provide: JogosApiService,             useValue: jogosApi },
    ],
  });

  const component = result.fixture.componentInstance;

  // Atribuir inputs ANTES de detectChanges (fix JIT NG0950)
  setSignalInput(component, 'fichaId',             fichaId);
  setSignalInput(component, 'jogoId',              jogoId);
  setSignalInput(component, 'visivelGlobalmente',  visivelGlobalmente);
  setSignalInput(component, 'jogadoresComAcesso',  jogadoresComAcesso);

  result.fixture.detectChanges();
  await result.fixture.whenStable();

  return { ...result, component, visibilidadeApi, jogosApi };
}

// ============================================================
// Testes
// ============================================================

describe('NpcVisibilidadeComponent', () => {

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  // ----------------------------------------------------------
  // Renderizacao inicial
  // ----------------------------------------------------------

  describe('renderizacao inicial', () => {
    it('exibe o titulo "Visibilidade para Jogadores"', async () => {
      await renderComponent();
      expect(screen.getByText('Visibilidade para Jogadores')).toBeTruthy();
    });

    it('exibe o toggle de visibilidade global', async () => {
      const { fixture } = await renderComponent();
      const toggle = fixture.nativeElement.querySelector('p-toggleswitch');
      expect(toggle).not.toBeNull();
    });

    it('exibe o botao "Salvar visibilidade"', async () => {
      await renderComponent();
      expect(screen.getByRole('button', { name: /Salvar visibilidade/i })).toBeTruthy();
    });

    it('carrega participantes aprovados do jogo ao inicializar', async () => {
      const { jogosApi } = await renderComponent({ jogoId: 5 });
      expect(jogosApi.listParticipantes).toHaveBeenCalledWith(5, 'APROVADO');
    });
  });

  // ----------------------------------------------------------
  // Toggle visibilidade global
  // ----------------------------------------------------------

  describe('toggle visibilidade global — multiselect', () => {
    it('exibe multiselect quando visivelGlobalmente e false', async () => {
      const { fixture } = await renderComponent({ visivelGlobalmente: false });
      const multiselect = fixture.nativeElement.querySelector('p-multiselect');
      expect(multiselect).not.toBeNull();
    });

    it('nao exibe multiselect quando visivelGlobalmente e true', async () => {
      const { fixture } = await renderComponent({ visivelGlobalmente: true });
      const multiselect = fixture.nativeElement.querySelector('p-multiselect');
      expect(multiselect).toBeNull();
    });

    it('exibe mensagem informativa quando visivel globalmente', async () => {
      await renderComponent({ visivelGlobalmente: true });
      expect(screen.getByText(/Todos os jogadores aprovados podem ver os stats/i)).toBeTruthy();
    });
  });

  // ----------------------------------------------------------
  // houveAlteracao computed
  // ----------------------------------------------------------

  describe('houveAlteracao computed', () => {
    it('retorna false quando nenhuma alteracao foi feita', async () => {
      const { component } = await renderComponent({
        visivelGlobalmente: false,
        jogadoresComAcesso: [],
      });

      const comp = component as unknown as { houveAlteracao: () => boolean };
      expect(comp.houveAlteracao()).toBe(false);
    });

    it('retorna true ao alterar visivelGlobalmenteLocal', async () => {
      const { component } = await renderComponent({
        visivelGlobalmente: false,
        jogadoresComAcesso: [],
      });

      const comp = component as unknown as {
        houveAlteracao: () => boolean;
        visivelGlobalmenteLocal: { set: (v: boolean) => void };
      };

      comp.visivelGlobalmenteLocal.set(true);
      expect(comp.houveAlteracao()).toBe(true);
    });

    it('retorna true ao adicionar jogadores selecionados', async () => {
      const { component } = await renderComponent({
        visivelGlobalmente: false,
        jogadoresComAcesso: [],
      });

      const comp = component as unknown as {
        houveAlteracao: () => boolean;
        jogadoresSelecionados: { set: (v: number[]) => void };
      };

      comp.jogadoresSelecionados.set([10]);
      expect(comp.houveAlteracao()).toBe(true);
    });

    it('retorna false se visivelGlobalmenteLocal voltar ao original', async () => {
      const { component } = await renderComponent({
        visivelGlobalmente: true,
        jogadoresComAcesso: [],
      });

      const comp = component as unknown as {
        houveAlteracao: () => boolean;
        visivelGlobalmenteLocal: { set: (v: boolean) => void };
      };

      // Muda e volta ao original
      comp.visivelGlobalmenteLocal.set(false);
      comp.visivelGlobalmenteLocal.set(true);
      expect(comp.houveAlteracao()).toBe(false);
    });
  });

  // ----------------------------------------------------------
  // Lista de jogadores com acesso
  // ----------------------------------------------------------

  describe('lista de jogadores com acesso', () => {
    it('exibe nome do jogador quando jogadoresComAcesso nao e vazio', async () => {
      const { fixture } = await renderComponent({
        visivelGlobalmente: false,
        jogadoresComAcesso: [jogadorAcesso1],
      });
      // "Alice" pode aparecer em multiplos lugares (badge e multiselect), verificamos presenca
      const textos = fixture.nativeElement.textContent as string;
      expect(textos).toContain('Alice');
    });

    it('exibe nome do personagem quando disponivel', async () => {
      await renderComponent({
        visivelGlobalmente: false,
        jogadoresComAcesso: [jogadorAcesso1],
      });
      expect(screen.getByText(/Elara/i)).toBeTruthy();
    });

    it('exibe dois jogadores quando dois tem acesso', async () => {
      await renderComponent({
        visivelGlobalmente: false,
        jogadoresComAcesso: [jogadorAcesso1, jogadorAcesso2],
      });
      expect(screen.getByText('Alice')).toBeTruthy();
      expect(screen.getByText('Bob')).toBeTruthy();
    });
  });

  // ----------------------------------------------------------
  // Salvar visibilidade
  // ----------------------------------------------------------

  describe('salvar visibilidade', () => {
    it('chama atualizarGlobal quando toggle global muda e usuario salva', async () => {
      const { component, visibilidadeApi } = await renderComponent({ visivelGlobalmente: false });

      const comp = component as unknown as {
        visivelGlobalmenteLocal: { set: (v: boolean) => void };
        salvar: () => void;
      };

      comp.visivelGlobalmenteLocal.set(true);
      comp.salvar();

      expect(visibilidadeApi.atualizarGlobal).toHaveBeenCalledWith(3, true);
    });

    it('emite visibilidadeAtualizada apos salvar com sucesso', async () => {
      const { component, fixture } = await renderComponent({ visivelGlobalmente: false });

      const emitidos: unknown[] = [];
      component.visibilidadeAtualizada.subscribe((v: unknown) => emitidos.push(v));

      const comp = component as unknown as {
        visivelGlobalmenteLocal: { set: (v: boolean) => void };
        salvar: () => void;
      };

      comp.visivelGlobalmenteLocal.set(true);
      comp.salvar();

      await fixture.whenStable();
      expect(emitidos.length).toBeGreaterThan(0);
    });

    it('nao chama API quando nao houve alteracoes', async () => {
      const { component, visibilidadeApi } = await renderComponent({ visivelGlobalmente: false });

      const comp = component as unknown as { salvar: () => void };
      comp.salvar();

      expect(visibilidadeApi.atualizarGlobal).not.toHaveBeenCalled();
      expect(visibilidadeApi.atualizarVisibilidade).not.toHaveBeenCalled();
    });

    it('reseta salvando=false quando atualizarGlobal falha', async () => {
      const { component, fixture } = await renderComponent({
        visivelGlobalmente: false,
        visibilidadeApiOverride: {
          atualizarGlobal: vi.fn().mockReturnValue(throwError(() => new Error('HTTP 500'))),
        },
      });

      const comp = component as unknown as {
        visivelGlobalmenteLocal: { set: (v: boolean) => void };
        salvando: () => boolean;
        salvar: () => void;
      };

      comp.visivelGlobalmenteLocal.set(true);
      comp.salvar();

      await fixture.whenStable();
      fixture.detectChanges();

      expect(comp.salvando()).toBe(false);
    });
  });

  // ----------------------------------------------------------
  // Falha ao carregar participantes
  // ----------------------------------------------------------

  describe('falha ao carregar participantes', () => {
    it('renderiza sem erros quando listParticipantes retorna lista vazia', async () => {
      const { fixture } = await renderComponent({ participantes: [] });
      // Multiselect ainda deve estar presente (sem participantes mas funcional)
      expect(fixture.nativeElement.querySelector('p-multiselect')).not.toBeNull();
    });
  });
});
