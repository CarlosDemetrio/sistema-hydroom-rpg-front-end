/**
 * FichaDetailComponent — Spec (foco: mostrarPainelNpc, visibilidade, resetar estado,
 * conceder XP e conceder Insolitus)
 *
 * NOTA JIT (Armadilha 2): FichaDetailComponent importa multiplos filhos com input.required().
 * A abordagem correta é usar TestBed.overrideComponent() para substituir o template
 * ANTES de chamar TestBed.compileComponents(), evitando NG0950 nos filhos.
 *
 * Cenarios cobertos:
 * 1. mostrarPainelNpc retorna true quando ficha.isNpc=true e usuario e Mestre
 * 2. mostrarPainelNpc retorna false quando ficha.isNpc=false
 * 3. mostrarPainelNpc retorna false quando usuario e Jogador
 * 4. mostrarPainelNpc retorna false quando ficha e null
 * 5. listarVisibilidade chamado ao carregar NPC com MESTRE
 * 6. listarVisibilidade NAO chamado para ficha normal
 * 7. onVisibilidadeAtualizada atualiza ficha()
 * 8. podeResetar retorna true quando Mestre e ficha carregada
 * 9. podeResetar retorna false quando Jogador
 * 10. executarResetarEstado chama fichasApiService.resetarEstado com fichaId correto
 * 11. executarResetarEstado atualiza signal resumo com resposta do backend
 * --- Conceder XP ---
 * 12. dialogXpVisivel inicia false
 * 13. concederXp chama fichasApiService.concederXp com fichaId e quantidade corretos
 * 14. concederXp exibe toast de sucesso apos chamada bem-sucedida
 * 15. concederXp nao chama api quando quantidade < 1
 * --- Conceder Insolitus ---
 * 16. onConcederInsolitus chama fichaBusinessService.concederInsolitus com ids corretos
 * 17. onConcederInsolitus adiciona nova vantagem ao signal vantagens apos sucesso
 * 18. onConcederInsolitus chama vantagensTabRef.resetarConcedendo(true) apos sucesso
 * 19. carregarVantagensInsolitusConfig filtra apenas vantagens do tipo INSOLITUS
 */
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { ActivatedRoute } from '@angular/router';
import { ChangeDetectionStrategy, NO_ERRORS_SCHEMA } from '@angular/core';

import { FichaDetailComponent } from './ficha-detail.component';
import { FichaBusinessService } from '@core/services/business/ficha-business.service';
import { FichaVisibilidadeApiService } from '@core/services/api/ficha-visibilidade.api.service';
import { FichasApiService } from '@core/services/api/fichas-api.service';
import { ConfigApiService } from '@core/services/api/config-api.service';
import { AuthService } from '@services/auth.service';
import { ToastService } from '@services/toast.service';
import { Ficha, FichaResumo, FichaVantagemResponse, FichaVisibilidadeResponse } from '@core/models/ficha.model';
import { VantagemConfig } from '@core/models/vantagem-config.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router } from '@angular/router';

// ============================================================
// Dados de teste
// ============================================================

function criarFicha(overrides: Partial<Ficha> = {}): Ficha {
  return {
    id: 1,
    jogoId: 10,
    nome: 'Aldric',
    jogadorId: 42,
    racaId: null,
    racaNome: null,
    classeId: null,
    classeNome: null,
    generoId: null,
    generoNome: null,
    indoleId: null,
    indoleNome: null,
    presencaId: null,
    presencaNome: null,
    nivel: 1,
    xp: 0,
    renascimentos: 0,
    isNpc: false,
    descricao: null,
    status: 'ATIVA',
    visivelGlobalmente: false,
    dataCriacao: '2024-01-01T00:00:00',
    dataUltimaAtualizacao: '2024-01-01T00:00:00',
    ...overrides,
  };
}

function criarResumo(): FichaResumo {
  return {
    id: 1,
    nome: 'Aldric',
    nivel: 1,
    xp: 0,
    racaNome: null,
    classeNome: null,
    atributosTotais: {},
    bonusTotais: {},
    vidaTotal: 50,
    vidaAtual: 50,
    essenciaTotal: 20,
    essenciaAtual: 20,
    ameacaTotal: 0,
    pontosVantagemDisponiveis: 0,
    pontosAtributoDisponiveis: 0,
    pontosAptidaoDisponiveis: 0,
  };
}

const visibilidadeStub: FichaVisibilidadeResponse = {
  fichaId: 1,
  visivelGlobalmente: false,
  jogadoresComAcesso: [],
};

// ============================================================
// Mock factories
// ============================================================

function criarFichaServiceMock(ficha: Ficha) {
  return {
    loadFichaCompleta: vi.fn().mockReturnValue(of({ ficha, resumo: criarResumo() })),
    loadAtributos: vi.fn().mockReturnValue(of([])),
    loadAptidoes: vi.fn().mockReturnValue(of([])),
    loadVantagens: vi.fn().mockReturnValue(of([])),
    canEdit: vi.fn().mockReturnValue(false),
    deleteFicha: vi.fn().mockReturnValue(of(undefined)),
    duplicarFicha: vi.fn().mockReturnValue(of({ fichaId: 99, nome: 'Copia', isNpc: false })),
    aumentarNivelVantagem: vi.fn().mockReturnValue(of({})),
    concederInsolitus: vi.fn().mockReturnValue(of({})),
    revogarVantagem: vi.fn().mockReturnValue(of(undefined)),
  };
}

function criarAuthServiceMock(isMestre: boolean) {
  return {
    currentUser: () => ({ id: '1', role: isMestre ? 'MESTRE' : 'JOGADOR' }),
    isMestre: () => isMestre,
  };
}

function criarVisibilidadeApiMock() {
  return {
    listarVisibilidade: vi.fn().mockReturnValue(of(visibilidadeStub)),
    atualizarVisibilidade: vi.fn().mockReturnValue(of(visibilidadeStub)),
    revogarAcesso: vi.fn().mockReturnValue(of(undefined)),
    atualizarGlobal: vi.fn().mockReturnValue(of({})),
  };
}

function criarFichasApiMock(fichaOverride?: Partial<Ficha>, resumoOverride?: Partial<FichaResumo>) {
  const resumo = { ...criarResumo(), ...resumoOverride };
  const fichaRetorno = criarFicha(fichaOverride ?? {});
  return {
    resetarEstado: vi.fn().mockReturnValue(of(resumo)),
    concederXp: vi.fn().mockReturnValue(of(fichaRetorno)),
    getFichaResumo: vi.fn().mockReturnValue(of(resumo)),
  };
}

// ============================================================
// Helper de render via TestBed.overrideComponent (fix NG0950 para Smart Components)
// ============================================================

async function criarComponente(opts: {
  ficha?: Partial<Ficha>;
  isMestre?: boolean;
  fichaId?: string;
  resumoReset?: Partial<FichaResumo>;
  fichaXpAtualizada?: Partial<Ficha>;
  vantagensConfig?: VantagemConfig[];
} = {}) {
  const {
    ficha: fichaOverrides = {},
    isMestre = false,
    fichaId = '1',
    resumoReset = {},
    fichaXpAtualizada = {},
    vantagensConfig = [],
  } = opts;

  const ficha = criarFicha(fichaOverrides);
  const fichaService = criarFichaServiceMock(ficha);
  const authService = criarAuthServiceMock(isMestre);
  const visibilidadeApi = criarVisibilidadeApiMock();
  const fichasApi = criarFichasApiMock(fichaXpAtualizada, resumoReset);
  const toastService = { success: vi.fn(), error: vi.fn() };
  const configApi = { listVantagens: vi.fn().mockReturnValue(of(vantagensConfig)) };
  const routerSpy = { navigate: vi.fn() };

  // Template mínimo: sem filhos com input.required() para evitar NG0950
  TestBed.overrideComponent(FichaDetailComponent, {
    set: {
      template: '<div>stub</div>',
      changeDetection: ChangeDetectionStrategy.Default,
      schemas: [NO_ERRORS_SCHEMA],
    },
  });

  await TestBed.configureTestingModule({
    imports: [FichaDetailComponent],
    providers: [
      ConfirmationService,
      MessageService,
      { provide: FichaBusinessService,       useValue: fichaService },
      { provide: FichaVisibilidadeApiService, useValue: visibilidadeApi },
      { provide: FichasApiService,           useValue: fichasApi },
      { provide: ConfigApiService,           useValue: configApi },
      { provide: AuthService,                useValue: authService },
      { provide: ToastService,               useValue: toastService },
      { provide: ActivatedRoute,             useValue: { snapshot: { params: { id: fichaId } } } },
      { provide: Router,                     useValue: routerSpy },
    ],
    schemas: [NO_ERRORS_SCHEMA],
  }).compileComponents();

  const fixture = TestBed.createComponent(FichaDetailComponent);
  const component = fixture.componentInstance as FichaDetailComponent;
  fixture.detectChanges();
  await fixture.whenStable();

  return { fixture, component, fichaService, visibilidadeApi, fichasApi, toastService, configApi, routerSpy };
}

// ============================================================
// Testes
// ============================================================

describe('FichaDetailComponent', () => {

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  // ----------------------------------------------------------
  // mostrarPainelNpc computed
  // ----------------------------------------------------------

  describe('mostrarPainelNpc computed', () => {
    it('retorna true quando ficha.isNpc=true e usuario e Mestre', async () => {
      const { component } = await criarComponente({
        ficha: { isNpc: true, jogadorId: null },
        isMestre: true,
      });

      const comp = component as unknown as {
        mostrarPainelNpc: () => boolean;
        ficha: { set: (v: Ficha | null) => void };
      };

      comp.ficha.set(criarFicha({ isNpc: true, jogadorId: null }));
      expect(comp.mostrarPainelNpc()).toBe(true);
    });

    it('retorna false quando ficha.isNpc=false', async () => {
      const { component } = await criarComponente({
        ficha: { isNpc: false },
        isMestre: true,
      });

      const comp = component as unknown as {
        mostrarPainelNpc: () => boolean;
        ficha: { set: (v: Ficha | null) => void };
      };

      comp.ficha.set(criarFicha({ isNpc: false }));
      expect(comp.mostrarPainelNpc()).toBe(false);
    });

    it('retorna false quando usuario e Jogador mesmo com isNpc=true', async () => {
      const { component } = await criarComponente({
        ficha: { isNpc: true, jogadorId: null },
        isMestre: false,
      });

      const comp = component as unknown as {
        mostrarPainelNpc: () => boolean;
        ficha: { set: (v: Ficha | null) => void };
      };

      comp.ficha.set(criarFicha({ isNpc: true, jogadorId: null }));
      expect(comp.mostrarPainelNpc()).toBe(false);
    });

    it('retorna false quando ficha e null', async () => {
      const { component } = await criarComponente({ isMestre: true });

      const comp = component as unknown as {
        mostrarPainelNpc: () => boolean;
        ficha: { set: (v: Ficha | null) => void };
      };

      comp.ficha.set(null);
      expect(comp.mostrarPainelNpc()).toBe(false);
    });
  });

  // ----------------------------------------------------------
  // carregamento de visibilidade
  // ----------------------------------------------------------

  describe('carregamento de visibilidade', () => {
    it('chama listarVisibilidade quando NPC e carregado por Mestre', async () => {
      const { visibilidadeApi } = await criarComponente({
        ficha: { isNpc: true, jogadorId: null },
        isMestre: true,
        fichaId: '1',
      });

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(visibilidadeApi.listarVisibilidade).toHaveBeenCalledWith(1);
    });

    it('NAO chama listarVisibilidade para ficha normal', async () => {
      const { visibilidadeApi } = await criarComponente({
        ficha: { isNpc: false },
        isMestre: true,
      });

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(visibilidadeApi.listarVisibilidade).not.toHaveBeenCalled();
    });

    it('NAO chama listarVisibilidade quando usuario e Jogador', async () => {
      const { visibilidadeApi } = await criarComponente({
        ficha: { isNpc: true, jogadorId: null },
        isMestre: false,
      });

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(visibilidadeApi.listarVisibilidade).not.toHaveBeenCalled();
    });
  });

  // ----------------------------------------------------------
  // carregarFichaCompleta
  // ----------------------------------------------------------

  describe('carregarFichaCompleta', () => {
    it('chama loadFichaCompleta com fichaId da rota (id=5)', async () => {
      const { fichaService } = await criarComponente({ fichaId: '5' });

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(fichaService.loadFichaCompleta).toHaveBeenCalledWith(5);
    });

    it('chama loadFichaCompleta com fichaId 1 quando rota tem id=1', async () => {
      const { fichaService } = await criarComponente({ fichaId: '1' });

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(fichaService.loadFichaCompleta).toHaveBeenCalledWith(1);
    });
  });

  // ----------------------------------------------------------
  // onVisibilidadeAtualizada
  // ----------------------------------------------------------

  describe('onVisibilidadeAtualizada', () => {
    it('atualiza visivelGlobalmente na ficha e recarrega visibilidade', async () => {
      const { component, visibilidadeApi } = await criarComponente({
        ficha: { isNpc: true, visivelGlobalmente: false },
        isMestre: true,
      });

      // Atualizar o mock para retornar visivelGlobalmente=true apos o evento
      visibilidadeApi.listarVisibilidade.mockReturnValue(of({
        fichaId: 1,
        visivelGlobalmente: true,
        jogadoresComAcesso: [],
      }));

      const comp = component as unknown as {
        ficha: { set: (v: Ficha | null) => void; (): Ficha | null };
        onVisibilidadeAtualizada: (update: { visivelGlobalmente: boolean; jogadoresComAcesso: number[] }) => void;
      };

      comp.ficha.set(criarFicha({ isNpc: true, visivelGlobalmente: false }));
      comp.onVisibilidadeAtualizada({ visivelGlobalmente: true, jogadoresComAcesso: [] });

      // Verifica que listarVisibilidade foi chamado (recarregamento pos-salvo)
      expect(visibilidadeApi.listarVisibilidade).toHaveBeenCalled();
    });
  });

  // ----------------------------------------------------------
  // podeResetar computed
  // ----------------------------------------------------------

  describe('podeResetar computed', () => {
    it('retorna true quando Mestre e ficha carregada', async () => {
      const { component } = await criarComponente({ isMestre: true });

      const comp = component as unknown as {
        podeResetar: () => boolean;
        ficha: { set: (v: Ficha | null) => void };
      };

      comp.ficha.set(criarFicha());
      expect(comp.podeResetar()).toBe(true);
    });

    it('retorna false quando Jogador mesmo com ficha carregada', async () => {
      const { component } = await criarComponente({ isMestre: false });

      const comp = component as unknown as {
        podeResetar: () => boolean;
        ficha: { set: (v: Ficha | null) => void };
      };

      comp.ficha.set(criarFicha());
      expect(comp.podeResetar()).toBe(false);
    });

    it('retorna false quando Mestre mas ficha e null', async () => {
      const { component } = await criarComponente({ isMestre: true });

      const comp = component as unknown as {
        podeResetar: () => boolean;
        ficha: { set: (v: Ficha | null) => void };
      };

      comp.ficha.set(null);
      expect(comp.podeResetar()).toBe(false);
    });
  });

  // ----------------------------------------------------------
  // executarResetarEstado (via abrirConfirmacaoReset → accept)
  // ----------------------------------------------------------

  describe('resetarEstado', () => {
    it('chama fichasApiService.resetarEstado com fichaId correto', async () => {
      const { component, fichasApi } = await criarComponente({
        isMestre: true,
        fichaId: '7',
      });

      // Acesso direto ao metodo privado via cast
      (component as unknown as { executarResetarEstado: () => void }).executarResetarEstado?.();

      expect(fichasApi.resetarEstado).toHaveBeenCalledWith(7);
    });

    it('atualiza signal resumo com o retorno do backend apos reset', async () => {
      const resumoReset = { vidaAtual: 80, vidaTotal: 80, essenciaAtual: 50, essenciaTotal: 50 };
      const { component } = await criarComponente({
        isMestre: true,
        fichaId: '1',
        resumoReset,
      });

      const comp = component as unknown as {
        resumo: () => FichaResumo | null;
        executarResetarEstado: () => void;
      };

      (component as unknown as { executarResetarEstado: () => void }).executarResetarEstado?.();

      await new Promise(resolve => setTimeout(resolve, 0));

      const resumo = comp.resumo();
      expect(resumo?.vidaAtual).toBe(resumoReset.vidaAtual);
      expect(resumo?.essenciaAtual).toBe(resumoReset.essenciaAtual);
    });

    it('exibe toast de sucesso apos reset bem-sucedido', async () => {
      const { component, toastService } = await criarComponente({ isMestre: true });

      (component as unknown as { executarResetarEstado: () => void }).executarResetarEstado?.();

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(toastService.success).toHaveBeenCalledWith('Estado de combate resetado com sucesso.');
    });

    it('exibe toast de erro quando reset falha', async () => {
      const { component, fichasApi, toastService } = await criarComponente({ isMestre: true });

      fichasApi.resetarEstado.mockReturnValue(
        new (await import('rxjs')).Observable(obs => obs.error(new Error('500')))
      );

      (component as unknown as { executarResetarEstado: () => void }).executarResetarEstado?.();

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(toastService.error).toHaveBeenCalledWith('Erro ao resetar estado de combate.');
    });
  });

  // ----------------------------------------------------------
  // Conceder XP
  // ----------------------------------------------------------

  describe('conceder XP', () => {
    it('dialogXpVisivel inicia como false', async () => {
      const { component } = await criarComponente({ isMestre: true });

      const comp = component as unknown as { dialogXpVisivel: () => boolean };
      expect(comp.dialogXpVisivel()).toBe(false);
    });

    it('concederXp chama fichasApiService.concederXp com fichaId e quantidade corretos', async () => {
      const { component, fichasApi } = await criarComponente({
        isMestre: true,
        fichaId: '3',
      });

      const comp = component as unknown as {
        quantidadeXp: { set: (v: number) => void };
        ficha: { set: (v: Ficha | null) => void };
        concederXp: () => void;
      };

      comp.ficha.set(criarFicha({ id: 3 }));
      comp.quantidadeXp.set(250);
      comp.concederXp();

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(fichasApi.concederXp).toHaveBeenCalledWith(3, 250);
    });

    it('concederXp exibe toast de sucesso apos chamada bem-sucedida', async () => {
      const { component, toastService } = await criarComponente({
        isMestre: true,
        fichaId: '1',
      });

      const comp = component as unknown as {
        quantidadeXp: { set: (v: number) => void };
        ficha: { set: (v: Ficha | null) => void };
        concederXp: () => void;
      };

      comp.ficha.set(criarFicha({ id: 1 }));
      comp.quantidadeXp.set(100);
      comp.concederXp();

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(toastService.success).toHaveBeenCalledWith('XP concedido com sucesso!');
    });

    it('concederXp nao chama api quando quantidade e 0', async () => {
      const { component, fichasApi } = await criarComponente({
        isMestre: true,
        fichaId: '1',
      });

      const comp = component as unknown as {
        quantidadeXp: { set: (v: number) => void };
        ficha: { set: (v: Ficha | null) => void };
        concederXp: () => void;
      };

      comp.ficha.set(criarFicha({ id: 1 }));
      comp.quantidadeXp.set(0);
      comp.concederXp();

      expect(fichasApi.concederXp).not.toHaveBeenCalled();
    });
  });

  // ----------------------------------------------------------
  // Conceder Insolitus
  // ----------------------------------------------------------

  describe('conceder Insolitus', () => {
    const vantagemInsolutusMock: FichaVantagemResponse = {
      id: 99,
      vantagemConfigId: 20,
      nomeVantagem: 'Visao Arcana',
      nivelAtual: 1,
      nivelMaximo: 1,
      custoPago: 0,
      tipoVantagem: 'INSOLITUS',
    };

    it('onConcederInsolitus chama fichaBusinessService.concederInsolitus com fichaId e vantagemConfigId corretos', async () => {
      const { component, fichaService } = await criarComponente({ isMestre: true, fichaId: '5' });

      fichaService.concederInsolitus.mockReturnValue(of(vantagemInsolutusMock));

      const comp = component as unknown as {
        ficha: { set: (v: Ficha | null) => void };
        onConcederInsolitus: (id: number) => void;
      };

      comp.ficha.set(criarFicha({ id: 5 }));
      comp.onConcederInsolitus(20);

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(fichaService.concederInsolitus).toHaveBeenCalledWith(5, 20);
    });

    it('onConcederInsolitus adiciona nova vantagem ao signal vantagens apos sucesso', async () => {
      const { component, fichaService } = await criarComponente({ isMestre: true, fichaId: '1' });

      fichaService.concederInsolitus.mockReturnValue(of(vantagemInsolutusMock));

      const comp = component as unknown as {
        ficha: { set: (v: Ficha | null) => void };
        vantagens: () => FichaVantagemResponse[];
        onConcederInsolitus: (id: number) => void;
      };

      comp.ficha.set(criarFicha());
      comp.onConcederInsolitus(20);

      await new Promise(resolve => setTimeout(resolve, 0));

      const lista = comp.vantagens();
      expect(lista.some(v => v.id === 99)).toBe(true);
    });

    it('onConcederInsolitus exibe toast de sucesso apos concessao', async () => {
      const { component, fichaService, toastService } = await criarComponente({
        isMestre: true,
        fichaId: '1',
      });

      fichaService.concederInsolitus.mockReturnValue(of(vantagemInsolutusMock));

      const comp = component as unknown as {
        ficha: { set: (v: Ficha | null) => void };
        onConcederInsolitus: (id: number) => void;
      };

      comp.ficha.set(criarFicha());
      comp.onConcederInsolitus(20);

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(toastService.success).toHaveBeenCalledWith('Insolitus concedido com sucesso!');
    });

    it('carregarVantagensInsolitusConfig filtra apenas configs do tipo INSOLITUS', async () => {
      const vantagemConfig: VantagemConfig = {
        id: 20,
        jogoId: 10,
        nome: 'Visao Arcana',
        sigla: 'VA',
        descricao: 'Ver o invisivel.',
        categoriaVantagemId: 3,
        categoriaNome: 'Magico',
        nivelMaximo: 1,
        formulaCusto: null,
        descricaoEfeito: 'Permite ver invisiveis.',
        ordemExibicao: 1,
        tipoVantagem: 'INSOLITUS',
        preRequisitos: [],
        efeitos: [],
        dataCriacao: '2024-01-01T00:00:00',
        dataUltimaAtualizacao: '2024-01-01T00:00:00',
      };
      const vantagemNormalConfig: VantagemConfig = {
        ...vantagemConfig,
        id: 21,
        nome: 'Furia',
        sigla: 'FU',
        tipoVantagem: 'VANTAGEM',
      };

      const { component, configApi } = await criarComponente({
        isMestre: true,
        vantagensConfig: [vantagemConfig, vantagemNormalConfig],
      });

      // Forcar carregamento: simular abertura da aba de vantagens com isMestre=true
      configApi.listVantagens.mockReturnValue(of([vantagemConfig, vantagemNormalConfig]));

      const comp = component as unknown as {
        ficha: { set: (v: Ficha | null) => void };
        carregarVantagensInsolitusConfig: (jogoId: number) => void;
        vantagensInsolitusConfig: () => VantagemConfig[];
      };

      comp.ficha.set(criarFicha({ jogoId: 10 }));
      comp.carregarVantagensInsolitusConfig?.(10);

      await new Promise(resolve => setTimeout(resolve, 0));

      const insolitusConfig = comp.vantagensInsolitusConfig();
      expect(insolitusConfig.every(v => v.tipoVantagem === 'INSOLITUS')).toBe(true);
      expect(insolitusConfig.some(v => v.nome === 'Visao Arcana')).toBe(true);
      expect(insolitusConfig.some(v => v.nome === 'Furia')).toBe(false);
    });
  });

  // ----------------------------------------------------------
  // BUG-015: irParaEdicao — rota correta
  // ----------------------------------------------------------

  describe('irParaEdicao (BUG-015)', () => {
    it('Mestre navega para /mestre/fichas/:id/edit ao clicar em Editar', async () => {
      const { component, routerSpy } = await criarComponente({
        isMestre: true,
        fichaId: '7',
      });

      const comp = component as unknown as {
        irParaEdicao: () => void;
        fichaId: () => number | null;
      };

      (component as unknown as { irParaEdicao: () => void }).irParaEdicao();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/mestre', 'fichas', 7, 'edit']);
    });

    it('Jogador navega para /jogador/fichas/:id/edit ao clicar em Editar', async () => {
      const { component, routerSpy } = await criarComponente({
        isMestre: false,
        fichaId: '3',
      });

      (component as unknown as { irParaEdicao: () => void }).irParaEdicao();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/jogador', 'fichas', 3, 'edit']);
    });
  });
});
