/**
 * LevelUpDialogComponent — Spec
 *
 * Smart component: injeta FichasApiService, ToastService e ConfirmationService.
 *
 * NOTA JIT (Armadilha 2 — overrideTemplate):
 * LevelUpDialogComponent importa LevelUpAtributosStepComponent.
 * Em JIT, componentes importados são compilados e os bindings validados mesmo com
 * NO_ERRORS_SCHEMA. Solução: usar overrideTemplate para substituir o template
 * por um stub mínimo que não instancia sub-componentes.
 *
 * Cenários cobertos:
 * 1. Renderiza sem erros (smoke test)
 * 2. Inicia no step 0
 * 3. pontosAtributoPendentes calculado corretamente (vazio / parcial / total)
 * 4. tentarFechar — emite fechado diretamente quando pendentes = 0
 * 5. tentarFechar — abre confirmação quando pendentes > 0
 * 6. salvarAtributos — avança para step 1 sem HTTP quando distribuição vazia
 * 7. salvarAtributos — chama atualizarAtributos e emite distribuicaoSalva
 * 8. salvarAtributos — monta DTO com nivel incrementado corretamente
 * 9. salvarAtributos — mantém nivel original para atributos sem pontos distribuídos
 * 10. salvarAtributos — toast de erro e step 0 quando HTTP falha
 */

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { render } from '@testing-library/angular';
import { ɵSIGNAL as SIGNAL_SYM } from '@angular/core';
import { of, throwError } from 'rxjs';
import { vi, describe, it, expect, afterEach } from 'vitest';
import { MessageService, ConfirmationService } from 'primeng/api';

import { LevelUpDialogComponent } from './level-up-dialog.component';
import { FichasApiService } from '@core/services/api/fichas-api.service';
import { ToastService } from '@services/toast.service';
import { FichaAtributoResponse, FichaAptidaoResponse } from '@core/models/ficha.model';

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
// Template stub (Armadilha 2 — overrideTemplate)
// Substitui o template real por um stub mínimo sem sub-componentes.
// Isso isola o componente de seus filhos e evita NG0303 em JIT.
// ============================================================

const STUB_TEMPLATE = `<div data-testid="level-up-dialog-stub">
  <span data-testid="nivel">{{ nivelNovo() }}</span>
  <span data-testid="nome">{{ fichaNome() }}</span>
</div>`;

// ============================================================
// Dados de teste
// ============================================================

const atributosMock: FichaAtributoResponse[] = [
  {
    id: 1,
    atributoConfigId: 10,
    atributoNome: 'Força',
    atributoAbreviacao: 'FOR',
    base: 5,
    nivel: 2,
    outros: 0,
    total: 7,
    impeto: 3,
  },
  {
    id: 2,
    atributoConfigId: 11,
    atributoNome: 'Agilidade',
    atributoAbreviacao: 'AGI',
    base: 4,
    nivel: 1,
    outros: 0,
    total: 5,
    impeto: 2,
  },
];

const aptidoesMock: FichaAptidaoResponse[] = [
  {
    id: 1,
    aptidaoConfigId: 20,
    aptidaoNome: 'Atletismo',
    base: 3,
    sorte: 0,
    classe: 0,
    total: 3,
  },
];

const atributosAtualizadosMock: FichaAtributoResponse[] = atributosMock.map((a) => ({
  ...a,
  nivel: a.nivel + 1,
}));

// ============================================================
// Mock factories
// ============================================================

function criarFichasApiMock(overrides: Record<string, unknown> = {}) {
  return {
    atualizarAtributos: vi.fn().mockReturnValue(of(atributosAtualizadosMock)),
    ...overrides,
  };
}

function criarToastMock() {
  return {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  };
}

function criarConfirmationServiceMock() {
  return {
    confirm: vi.fn(),
    close: vi.fn(),
    requireConfirmation$: { asObservable: vi.fn().mockReturnValue(of()) },
  };
}

// ============================================================
// Helper de render (JIT-safe + overrideTemplate)
// ============================================================

type RenderOptions = {
  fichaId?: number;
  nivelNovo?: number;
  fichaNome?: string;
  limitadorAtributo?: number;
  pontosAtributoDisponiveis?: number;
  pontosAptidaoDisponiveis?: number;
  pontosVantagemDisponiveis?: number;
  atributos?: FichaAtributoResponse[];
  aptidoes?: FichaAptidaoResponse[];
  fichasApiOverride?: Record<string, unknown>;
};

async function renderComponent(opts: RenderOptions = {}) {
  const {
    fichaId = 1,
    nivelNovo = 4,
    fichaNome = 'Aldric',
    limitadorAtributo = 20,
    pontosAtributoDisponiveis = 3,
    pontosAptidaoDisponiveis = 2,
    pontosVantagemDisponiveis = 1,
    atributos = atributosMock,
    aptidoes = aptidoesMock,
    fichasApiOverride = {},
  } = opts;

  const fichasApi = criarFichasApiMock(fichasApiOverride);
  const toastService = criarToastMock();
  const confirmationService = criarConfirmationServiceMock();

  const result = await render(LevelUpDialogComponent, {
    schemas: [NO_ERRORS_SCHEMA],
    detectChangesOnRender: false,
    providers: [
      MessageService,
      { provide: FichasApiService, useValue: fichasApi },
      { provide: ToastService, useValue: toastService },
      { provide: ConfirmationService, useValue: confirmationService },
    ],
    // Armadilha 2: overrideTemplate para evitar NG0303 com sub-componentes importados.
    // Armadilha extra: o componente tem providers: [ConfirmationService] local → overrideProvider
    // substitui essa instância pelo mock no nível do componente.
    configureTestBed: (tb) => {
      tb.overrideTemplate(LevelUpDialogComponent, STUB_TEMPLATE);
      tb.overrideProvider(ConfirmationService, { useValue: confirmationService });
    },
  });

  const component = result.fixture.componentInstance;

  setSignalInput(component, 'fichaId', fichaId);
  setSignalInput(component, 'nivelNovo', nivelNovo);
  setSignalInput(component, 'fichaNome', fichaNome);
  setSignalInput(component, 'limitadorAtributo', limitadorAtributo);
  setSignalInput(component, 'pontosAtributoDisponiveis', pontosAtributoDisponiveis);
  setSignalInput(component, 'pontosAptidaoDisponiveis', pontosAptidaoDisponiveis);
  setSignalInput(component, 'pontosVantagemDisponiveis', pontosVantagemDisponiveis);
  setSignalInput(component, 'atributos', atributos);
  setSignalInput(component, 'aptidoes', aptidoes);

  result.fixture.detectChanges();
  await result.fixture.whenStable();

  return { ...result, component, fichasApi, toastService, confirmationService };
}

// Cast para acessar membros protegidos nos testes
type InternalComponent = {
  stepAtivo: () => number;
  salvando: () => boolean;
  distribuicaoAtributos: { set: (v: Record<string, number>) => void };
  pontosAtributoPendentes: () => number;
  salvarAtributos: () => void;
  tentarFechar: () => void;
  fechar: () => void;
};

// ============================================================
// Testes
// ============================================================

describe('LevelUpDialogComponent', () => {

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  // ----------------------------------------------------------
  // 1–2. Renderização inicial
  // ----------------------------------------------------------

  describe('renderização inicial', () => {
    it('deve renderizar sem erros com o nível e nome corretos no stub', async () => {
      const { getByTestId } = await renderComponent({ fichaNome: 'Aldric', nivelNovo: 4 });

      expect(getByTestId('nivel').textContent?.trim()).toBe('4');
      expect(getByTestId('nome').textContent?.trim()).toBe('Aldric');
    });

    it('deve iniciar no step 0', async () => {
      const { component } = await renderComponent();
      const comp = component as unknown as InternalComponent;
      expect(comp.stepAtivo()).toBe(0);
    });
  });

  // ----------------------------------------------------------
  // 3. pontosAtributoPendentes
  // ----------------------------------------------------------

  describe('pontosAtributoPendentes computed', () => {
    it('deve retornar total de pontos disponíveis quando distribuição está vazia', async () => {
      const { component } = await renderComponent({ pontosAtributoDisponiveis: 3 });
      const comp = component as unknown as InternalComponent;
      expect(comp.pontosAtributoPendentes()).toBe(3);
    });

    it('deve retornar 0 quando todos os pontos foram distribuídos', async () => {
      const { component } = await renderComponent({ pontosAtributoDisponiveis: 2 });
      const comp = component as unknown as InternalComponent;

      comp.distribuicaoAtributos.set({ FOR: 1, AGI: 1 });

      expect(comp.pontosAtributoPendentes()).toBe(0);
    });

    it('deve retornar 0 quando pontosAtributoDisponiveis = 0', async () => {
      const { component } = await renderComponent({ pontosAtributoDisponiveis: 0 });
      const comp = component as unknown as InternalComponent;
      expect(comp.pontosAtributoPendentes()).toBe(0);
    });

    it('deve retornar 1 quando apenas 1 de 2 pontos foi distribuído', async () => {
      const { component } = await renderComponent({ pontosAtributoDisponiveis: 2 });
      const comp = component as unknown as InternalComponent;

      comp.distribuicaoAtributos.set({ FOR: 1 });

      expect(comp.pontosAtributoPendentes()).toBe(1);
    });
  });

  // ----------------------------------------------------------
  // 4. Fechar sem pontos pendentes
  // ----------------------------------------------------------

  describe('tentarFechar — sem pontos pendentes', () => {
    it('deve emitir fechado diretamente quando pontosAtributoDisponiveis = 0', async () => {
      const { component, confirmationService } = await renderComponent({
        pontosAtributoDisponiveis: 0,
      });
      const comp = component as unknown as InternalComponent;
      const fechadoSpy = vi.fn();
      component.fechado.subscribe(fechadoSpy);

      comp.tentarFechar();

      expect(fechadoSpy).toHaveBeenCalledTimes(1);
      expect(confirmationService.confirm).not.toHaveBeenCalled();
    });

    it('deve emitir fechado diretamente quando todos os pontos foram distribuídos (pendentes = 0)', async () => {
      const { component, confirmationService } = await renderComponent({
        pontosAtributoDisponiveis: 1,
      });
      const comp = component as unknown as InternalComponent;
      const fechadoSpy = vi.fn();
      component.fechado.subscribe(fechadoSpy);

      comp.distribuicaoAtributos.set({ FOR: 1 });

      comp.tentarFechar();

      expect(fechadoSpy).toHaveBeenCalledTimes(1);
      expect(confirmationService.confirm).not.toHaveBeenCalled();
    });
  });

  // ----------------------------------------------------------
  // 5. Fechar com pontos pendentes → abre confirmação
  // ----------------------------------------------------------

  describe('tentarFechar — com pontos pendentes', () => {
    it('deve abrir confirmação quando há pontos disponíveis não distribuídos', async () => {
      const { component, confirmationService } = await renderComponent({
        pontosAtributoDisponiveis: 3,
      });
      const comp = component as unknown as InternalComponent;

      comp.tentarFechar();

      expect(confirmationService.confirm).toHaveBeenCalledTimes(1);
      const callArg = (confirmationService.confirm as ReturnType<typeof vi.fn>).mock.calls[0][0] as {
        header: string;
        message: string;
        acceptLabel: string;
      };
      expect(callArg.header).toBe('Pontos não distribuídos');
      expect(callArg.acceptLabel).toBe('Sim, fechar');
    });

    it('deve abrir confirmação quando há pontos parcialmente distribuídos', async () => {
      const { component, confirmationService } = await renderComponent({
        pontosAtributoDisponiveis: 3,
      });
      const comp = component as unknown as InternalComponent;

      comp.distribuicaoAtributos.set({ FOR: 1 });

      comp.tentarFechar();

      expect(confirmationService.confirm).toHaveBeenCalledTimes(1);
    });
  });

  // ----------------------------------------------------------
  // 6. salvarAtributos — sem distribuição
  // ----------------------------------------------------------

  describe('salvarAtributos — sem distribuição', () => {
    it('deve avançar para step 1 sem chamar HTTP quando distribuição está vazia', async () => {
      const { component, fichasApi } = await renderComponent();
      const comp = component as unknown as InternalComponent;

      comp.salvarAtributos();

      expect(fichasApi.atualizarAtributos).not.toHaveBeenCalled();
      expect(comp.stepAtivo()).toBe(1);
    });
  });

  // ----------------------------------------------------------
  // 7. salvarAtributos — com distribuição (sucesso)
  // ----------------------------------------------------------

  describe('salvarAtributos — com distribuição', () => {
    it('deve chamar atualizarAtributos, emitir distribuicaoSalva e avançar para step 1', async () => {
      const { component, fichasApi } = await renderComponent({
        fichaId: 42,
        pontosAtributoDisponiveis: 2,
      });
      const comp = component as unknown as InternalComponent;
      const distribuicaoSalvaSpy = vi.fn();
      component.distribuicaoSalva.subscribe(distribuicaoSalvaSpy);

      comp.distribuicaoAtributos.set({ FOR: 1 });

      comp.salvarAtributos();

      expect(fichasApi.atualizarAtributos).toHaveBeenCalledWith(42, expect.any(Array));
      expect(distribuicaoSalvaSpy).toHaveBeenCalledTimes(1);
      expect(comp.stepAtivo()).toBe(1);
      expect(comp.salvando()).toBe(false);
    });

    // ----------------------------------------------------------
    // 8. DTO com nivel incrementado
    // ----------------------------------------------------------

    it('deve montar o DTO com nivel incrementado corretamente para cada atributo distribuído', async () => {
      const atributoUnico: FichaAtributoResponse[] = [
        {
          id: 1,
          atributoConfigId: 10,
          atributoNome: 'Força',
          atributoAbreviacao: 'FOR',
          base: 5,
          nivel: 2,
          outros: 1,
          total: 8,
          impeto: 3,
        },
      ];

      const { component, fichasApi } = await renderComponent({
        fichaId: 1,
        atributos: atributoUnico,
      });
      const comp = component as unknown as InternalComponent;

      comp.distribuicaoAtributos.set({ FOR: 2 });

      comp.salvarAtributos();

      const dto = (fichasApi.atualizarAtributos as ReturnType<typeof vi.fn>).mock.calls[0][1];
      expect(dto).toEqual([
        { atributoConfigId: 10, base: 5, nivel: 4, outros: 1 },
      ]);
    });

    // ----------------------------------------------------------
    // 9. nivel original preservado para atributos sem distribuição
    // ----------------------------------------------------------

    it('deve manter nivel original para atributos sem pontos distribuídos', async () => {
      const { component, fichasApi } = await renderComponent({
        fichaId: 1,
        atributos: atributosMock,
      });
      const comp = component as unknown as InternalComponent;

      // Distribui ponto apenas em FOR
      comp.distribuicaoAtributos.set({ FOR: 1 });

      comp.salvarAtributos();

      const dto = (fichasApi.atualizarAtributos as ReturnType<typeof vi.fn>).mock.calls[0][1] as {
        atributoConfigId: number;
        nivel: number;
      }[];
      const agiDto = dto.find((d) => d.atributoConfigId === 11);
      // AGI: nivel original = 1, sem adição → nivel = 1
      expect(agiDto?.nivel).toBe(1);
    });
  });

  // ----------------------------------------------------------
  // 10. salvarAtributos — erro HTTP
  // ----------------------------------------------------------

  describe('salvarAtributos — erro HTTP', () => {
    it('deve exibir toast de erro, manter step 0 e salvando=false quando HTTP falha', async () => {
      const { component, fichasApi, toastService } = await renderComponent({
        fichasApiOverride: {
          atualizarAtributos: vi.fn().mockReturnValue(
            throwError(() => new Error('500 Internal Server Error'))
          ),
        },
      });
      const comp = component as unknown as InternalComponent;

      comp.distribuicaoAtributos.set({ FOR: 1 });

      comp.salvarAtributos();

      expect(fichasApi.atualizarAtributos).toHaveBeenCalledTimes(1);
      expect(toastService.error).toHaveBeenCalledWith(
        'Erro ao salvar atributos. Tente novamente.'
      );
      expect(comp.stepAtivo()).toBe(0);
      expect(comp.salvando()).toBe(false);
    });
  });
});
