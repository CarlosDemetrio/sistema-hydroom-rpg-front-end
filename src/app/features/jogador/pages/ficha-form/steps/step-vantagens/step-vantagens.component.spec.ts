/**
 * StepVantagensComponent — Spec
 *
 * Smart component com chamadas proprias a APIs.
 * Padrao JIT: render com NO_ERRORS_SCHEMA + overrideTemplate para evitar NG0950.
 * Aqui, como e Smart (nao tem input.required() vindos de pai), usamos render normal
 * com NO_ERRORS_SCHEMA e setSignalInput para os inputs obrigatorios.
 *
 * Cenarios cobertos:
 * 1. Renderiza vantagens agrupadas por categoria
 * 2. Filtro por categoria filtra vantagens exibidas
 * 3. Busca por nome filtra em tempo real
 * 4. Clicar "Comprar" chama comprarVantagem do fichasApi
 * 5. Apos compra, botao muda para "Comprada" e fica disabled
 * 6. Emite pontosAtualizados apos compra com saldo do resumo
 * 7. Botao "Sem pontos" quando pontos insuficientes
 * 8. Toast de erro quando backend retorna erro na compra
 * 9. Anti-duplo-clique: durante request, comprando !== null
 * 10. Rascunho: vantagens ja compradas mostradas como "Comprada"
 * 11. Estado de carregamento inicial exibe skeletons
 * 12. Busca em tempo real: digitar no campo filtra a lista
 */

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { ɵSIGNAL as SIGNAL_SYM } from '@angular/core';
import { of, throwError, Subject } from 'rxjs';
import { vi } from 'vitest';
import { MessageService } from 'primeng/api';

import { StepVantagensComponent } from './step-vantagens.component';
import { ConfigApiService } from '@core/services/api/config-api.service';
import { FichasApiService } from '@core/services/api/fichas-api.service';
import { VantagemConfig } from '@core/models/vantagem-config.model';
import { FichaVantagemResponse, FichaResumo } from '@core/models/ficha.model';

// ============================================================
// Helper JIT: atribuir valor a input() / input.required() signal
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

const vantagemCombateMock: VantagemConfig = {
  id: 1,
  jogoId: 10,
  nome: 'Furia Berserker',
  sigla: 'FB',
  descricao: 'O personagem entra em furia.',
  categoriaVantagemId: 1,
  categoriaNome: 'Combate',
  nivelMaximo: 3,
  formulaCusto: '2',
  descricaoEfeito: 'Aumenta o dano em combate por 3 rodadas.',
  ordemExibicao: 1,
  preRequisitos: [],
  efeitos: [],
  dataCriacao: '2024-01-01T00:00:00',
  dataUltimaAtualizacao: '2024-01-01T00:00:00',
};

const vantagemMagiaMock: VantagemConfig = {
  id: 2,
  jogoId: 10,
  nome: 'Conjuracao Rapida',
  sigla: 'CR',
  descricao: 'Lanca magias mais rapidamente.',
  categoriaVantagemId: 2,
  categoriaNome: 'Magia',
  nivelMaximo: 1,
  formulaCusto: '3',
  descricaoEfeito: 'Reduz o tempo de conjuracao em 1 acao.',
  ordemExibicao: 1,
  preRequisitos: [],
  efeitos: [],
  dataCriacao: '2024-01-01T00:00:00',
  dataUltimaAtualizacao: '2024-01-01T00:00:00',
};

const vantagemComPreRequisitoMock: VantagemConfig = {
  ...vantagemCombateMock,
  id: 3,
  nome: 'Maestria Berserker',
  formulaCusto: '4',
  preRequisitos: [
    { id: 1, vantagemId: 3, preRequisitoId: 1, preRequisitoNome: 'Furia Berserker' },
  ],
};

const vantagemCaraMock: VantagemConfig = {
  ...vantagemCombateMock,
  id: 4,
  nome: 'Vantagem Cara',
  formulaCusto: '10',
};

const fichaVantagemCompradaMock: FichaVantagemResponse = {
  id: 1,
  vantagemConfigId: 1,
  nomeVantagem: 'Furia Berserker',
  nivelAtual: 1,
  nivelMaximo: 3,
  custoPago: 2,
};

const fichaResumoMock: Partial<FichaResumo> = {
  id: 42,
  nome: 'Aragorn',
  nivel: 1,
  xp: 0,
  pontosVantagemDisponiveis: 5,
  vidaTotal: 20,
  essenciaTotal: 10,
  ameacaTotal: 5,
  atributosTotais: {},
  bonusTotais: {},
};

// ============================================================
// Factories de mocks
// ============================================================

function criarConfigApiMock(overrides: Partial<{ listVantagens: ReturnType<typeof vi.fn> }> = {}) {
  return {
    listVantagens: vi.fn().mockReturnValue(of([vantagemCombateMock, vantagemMagiaMock])),
    ...overrides,
  };
}

function criarFichasApiMock(overrides: Partial<{
  listVantagens: ReturnType<typeof vi.fn>;
  comprarVantagem: ReturnType<typeof vi.fn>;
  getFichaResumo: ReturnType<typeof vi.fn>;
}> = {}) {
  return {
    listVantagens: vi.fn().mockReturnValue(of([])),
    comprarVantagem: vi.fn().mockReturnValue(of(fichaVantagemCompradaMock)),
    getFichaResumo: vi.fn().mockReturnValue(of(fichaResumoMock)),
    ...overrides,
  };
}

// ============================================================
// Helper de render
// ============================================================

interface RenderOptions {
  fichaId?: number;
  jogoId?: number;
  pontosDisponiveis?: number;
  configApiOverride?: Partial<ReturnType<typeof criarConfigApiMock>>;
  fichasApiOverride?: Partial<ReturnType<typeof criarFichasApiMock>>;
}

async function renderStep(opts: RenderOptions = {}) {
  const {
    fichaId = 42,
    jogoId = 10,
    pontosDisponiveis = 5,
    configApiOverride = {},
    fichasApiOverride = {},
  } = opts;

  const configApi = criarConfigApiMock(configApiOverride);
  const fichasApi = criarFichasApiMock(fichasApiOverride);

  const result = await render(StepVantagensComponent, {
    schemas: [NO_ERRORS_SCHEMA],
    detectChangesOnRender: false,
    providers: [
      { provide: ConfigApiService, useValue: configApi },
      { provide: FichasApiService, useValue: fichasApi },
      MessageService,
    ],
  });

  const comp = result.fixture.componentInstance;

  setSignalInput(comp, 'fichaId', fichaId);
  setSignalInput(comp, 'jogoId', jogoId);
  setSignalInput(comp, 'pontosDisponiveis', pontosDisponiveis);

  result.fixture.detectChanges();
  await result.fixture.whenStable();
  result.fixture.detectChanges();

  return { ...result, comp, configApi, fichasApi };
}

// ============================================================
// Testes
// ============================================================

describe('StepVantagensComponent', () => {

  // ----------------------------------------------------------
  // 1. Carregamento inicial
  // ----------------------------------------------------------

  describe('carregamento inicial', () => {
    it('chama listVantagens do configApi com jogoId correto ao inicializar', async () => {
      const { configApi } = await renderStep({ jogoId: 10 });
      expect(configApi.listVantagens).toHaveBeenCalledWith(10);
    });

    it('chama listVantagens do fichasApi com fichaId correto ao inicializar', async () => {
      const { fichasApi } = await renderStep({ fichaId: 42 });
      expect(fichasApi.listVantagens).toHaveBeenCalledWith(42);
    });

    it('exibe pontos disponiveis no cabecalho de controles', async () => {
      const { fixture } = await renderStep({ pontosDisponiveis: 7 });
      expect(fixture.nativeElement.textContent).toContain('7');
    });

    it('exibe estado de carregamento (skeletons) antes dos dados chegarem', async () => {
      const subject = new Subject<VantagemConfig[]>();
      const { comp, fixture } = await renderStep({
        configApiOverride: {
          listVantagens: vi.fn().mockReturnValue(subject.asObservable()),
        },
      });

      // Forcamos carregando=true para simular estado anterior ao retorno da API
      comp.carregando.set(true);
      fixture.detectChanges();

      const skeletons = fixture.nativeElement.querySelectorAll('p-skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('exibe mensagem quando nao ha vantagens configuradas', async () => {
      const { fixture } = await renderStep({
        configApiOverride: {
          listVantagens: vi.fn().mockReturnValue(of([])),
        },
      });

      expect(fixture.nativeElement.textContent).toContain('Nenhuma vantagem configurada');
    });
  });

  // ----------------------------------------------------------
  // 2. Renderizacao de vantagens agrupadas por categoria
  // ----------------------------------------------------------

  describe('renderizacao de vantagens', () => {
    it('renderiza vantagens agrupadas por categoria', async () => {
      const { fixture } = await renderStep();

      const texto = fixture.nativeElement.textContent as string;
      expect(texto).toContain('Combate');
      expect(texto).toContain('Magia');
      expect(texto).toContain('Furia Berserker');
      expect(texto).toContain('Conjuracao Rapida');
    });

    it('exibe pre-requisitos como tags quando existem', async () => {
      const { fixture } = await renderStep({
        configApiOverride: {
          listVantagens: vi.fn().mockReturnValue(of([vantagemComPreRequisitoMock])),
        },
      });

      const texto = fixture.nativeElement.textContent as string;
      expect(texto).toContain('Furia Berserker');
    });

    it('exibe custo de vantagem numerica sem formula', async () => {
      const { fixture } = await renderStep({
        configApiOverride: {
          listVantagens: vi.fn().mockReturnValue(of([vantagemCombateMock])),
        },
      });

      const texto = fixture.nativeElement.textContent as string;
      expect(texto).toContain('2');
    });
  });

  // ----------------------------------------------------------
  // 3. Filtro por categoria
  // ----------------------------------------------------------

  describe('filtro por categoria', () => {
    it('inicialmente exibe todas as categorias', async () => {
      const { comp } = await renderStep();

      expect(comp.categorias()).toContain('Todas');
      expect(comp.categorias()).toContain('Combate');
      expect(comp.categorias()).toContain('Magia');
    });

    it('filtra vantagens ao selecionar categoria especifica', async () => {
      const { comp, fixture } = await renderStep();

      comp.onFiltroCategoria('Combate');
      fixture.detectChanges();

      expect(comp.vantagensExibidas().length).toBe(1);
      expect(comp.vantagensExibidas()[0].categoriaNome).toBe('Combate');
    });

    it('restaura todas as vantagens ao selecionar Todas', async () => {
      const { comp, fixture } = await renderStep();

      comp.onFiltroCategoria('Combate');
      fixture.detectChanges();

      comp.onFiltroCategoria('Todas');
      fixture.detectChanges();

      expect(comp.vantagensExibidas().length).toBe(2);
    });

    it('filtroCategoria signal fica null ao selecionar Todas', async () => {
      const { comp } = await renderStep();

      comp.onFiltroCategoria('Magia');
      expect(comp.filtroCategoria()).toBe('Magia');

      comp.onFiltroCategoria('Todas');
      expect(comp.filtroCategoria()).toBeNull();
    });
  });

  // ----------------------------------------------------------
  // 4. Busca por nome
  // ----------------------------------------------------------

  describe('busca por nome', () => {
    it('filtra vantagens em tempo real pelo nome', async () => {
      const { comp, fixture } = await renderStep();

      comp.termoBusca.set('furia');
      fixture.detectChanges();

      expect(comp.vantagensExibidas().length).toBe(1);
      expect(comp.vantagensExibidas()[0].nome).toBe('Furia Berserker');
    });

    it('busca e case-insensitive', async () => {
      const { comp, fixture } = await renderStep();

      comp.termoBusca.set('CONJURACAO');
      fixture.detectChanges();

      expect(comp.vantagensExibidas().length).toBe(1);
      expect(comp.vantagensExibidas()[0].nome).toContain('Conjuracao');
    });

    it('exibe mensagem quando busca nao encontra vantagens', async () => {
      const { comp, fixture } = await renderStep();

      comp.termoBusca.set('xyzxyzxyz');
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Nenhuma vantagem encontrada');
    });
  });

  // ----------------------------------------------------------
  // 5. Logica de estadoBotao
  // ----------------------------------------------------------

  describe('estadoBotao', () => {
    it('retorna "comprada" quando vantagem ja esta na lista de compradas', async () => {
      const { comp } = await renderStep({
        fichasApiOverride: {
          listVantagens: vi.fn().mockReturnValue(of([fichaVantagemCompradaMock])),
        },
      });

      expect(comp.estadoBotao(1, '2')).toBe('comprada');
    });

    it('retorna "comprando" quando comprando === vantagemConfigId', async () => {
      const { comp } = await renderStep();

      comp.comprando.set(2);
      expect(comp.estadoBotao(2, '3')).toBe('comprando');
    });

    it('retorna "sem-pontos" quando custo excede pontos disponiveis', async () => {
      const { comp } = await renderStep({ pontosDisponiveis: 1 });

      // custo = 2, disponiveis = 1
      expect(comp.estadoBotao(1, '2')).toBe('sem-pontos');
    });

    it('retorna "comprar" quando tem pontos suficientes e nao comprou ainda', async () => {
      const { comp } = await renderStep({ pontosDisponiveis: 10 });

      expect(comp.estadoBotao(1, '2')).toBe('comprar');
    });

    it('assume custo 1 quando formulaCusto e null', async () => {
      const { comp } = await renderStep({ pontosDisponiveis: 0 });

      expect(comp.estadoBotao(99, null)).toBe('sem-pontos');
    });

    it('assume custo 1 quando formulaCusto e formula nao numerica', async () => {
      const { comp } = await renderStep({ pontosDisponiveis: 0 });

      // "nivel * 2" nao e numero puro, assume 1
      expect(comp.estadoBotao(99, 'nivel * 2')).toBe('sem-pontos');
    });
  });

  // ----------------------------------------------------------
  // 6. Compra de vantagem
  // ----------------------------------------------------------

  describe('compra de vantagem', () => {
    it('chama comprarVantagem com fichaId e vantagemConfigId corretos', async () => {
      const { comp, fichasApi } = await renderStep({ fichaId: 42 });

      comp.comprar(1);

      expect(fichasApi.comprarVantagem).toHaveBeenCalledWith(42, { vantagemConfigId: 1 });
    });

    it('adiciona vantagem comprada ao signal vantagensCompradas apos sucesso', async () => {
      const { comp } = await renderStep();

      expect(comp.vantagensCompradas().length).toBe(0);
      comp.comprar(1);
      expect(comp.vantagensCompradas().length).toBe(1);
      expect(comp.vantagensCompradas()[0].vantagemConfigId).toBe(1);
    });

    it('botao passa para estado "comprada" apos compra com sucesso', async () => {
      const { comp } = await renderStep({ pontosDisponiveis: 10 });

      expect(comp.estadoBotao(1, '2')).toBe('comprar');

      comp.comprar(1);

      expect(comp.estadoBotao(1, '2')).toBe('comprada');
    });

    it('emite pontosAtualizados com valor do resumo apos compra', async () => {
      const emitSpy = vi.fn();
      const { comp } = await renderStep();

      comp.pontosAtualizados.subscribe(emitSpy);
      comp.comprar(1);

      expect(emitSpy).toHaveBeenCalledWith(5);
    });

    it('chama getFichaResumo apos compra bem-sucedida para atualizar saldo', async () => {
      const { comp, fichasApi } = await renderStep({ fichaId: 42 });

      comp.comprar(1);

      expect(fichasApi.getFichaResumo).toHaveBeenCalledWith(42);
    });

    it('reset comprando para null apos compra bem-sucedida', async () => {
      const { comp } = await renderStep();

      comp.comprar(1);

      expect(comp.comprando()).toBeNull();
    });

    it('anti-duplo-clique: nao inicia nova compra enquanto comprando !== null', async () => {
      const subject = new Subject<FichaVantagemResponse>();
      const { comp, fichasApi } = await renderStep({
        fichasApiOverride: {
          comprarVantagem: vi.fn().mockReturnValue(subject.asObservable()),
          listVantagens: vi.fn().mockReturnValue(of([])),
          getFichaResumo: vi.fn().mockReturnValue(of(fichaResumoMock)),
        },
      });

      comp.comprar(1);
      comp.comprar(2); // deve ser ignorado

      expect(fichasApi.comprarVantagem).toHaveBeenCalledTimes(1);
    });

    it('comprando === vantagemConfigId durante o request', async () => {
      const subject = new Subject<FichaVantagemResponse>();
      const { comp } = await renderStep({
        fichasApiOverride: {
          comprarVantagem: vi.fn().mockReturnValue(subject.asObservable()),
          listVantagens: vi.fn().mockReturnValue(of([])),
          getFichaResumo: vi.fn().mockReturnValue(of(fichaResumoMock)),
        },
      });

      comp.comprar(3);

      expect(comp.comprando()).toBe(3);
    });
  });

  // ----------------------------------------------------------
  // 7. Tratamento de erros
  // ----------------------------------------------------------

  describe('tratamento de erros', () => {
    it('exibe toast de erro quando comprarVantagem falha', async () => {
      const { comp } = await renderStep({
        fichasApiOverride: {
          comprarVantagem: vi.fn().mockReturnValue(
            throwError(() => ({ error: { message: 'Pontos insuficientes' } }))
          ),
        },
      });

      const messageService = comp['messageService'];
      const addSpy = vi.spyOn(messageService, 'add');

      comp.comprar(1);

      expect(addSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'error',
          summary: 'Erro ao comprar vantagem',
          detail: 'Pontos insuficientes',
        })
      );
    });

    it('exibe mensagem generica quando erro nao tem detail', async () => {
      const { comp } = await renderStep({
        fichasApiOverride: {
          comprarVantagem: vi.fn().mockReturnValue(throwError(() => ({}))),
        },
      });

      const messageService = comp['messageService'];
      const addSpy = vi.spyOn(messageService, 'add');

      comp.comprar(1);

      expect(addSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'error',
          detail: 'Tente novamente.',
        })
      );
    });

    it('reset comprando para null quando compra falha', async () => {
      const { comp } = await renderStep({
        fichasApiOverride: {
          comprarVantagem: vi.fn().mockReturnValue(throwError(() => ({}))),
        },
      });

      comp.comprar(1);

      expect(comp.comprando()).toBeNull();
    });

    it('exibe toast de erro quando carregamento inicial falha', async () => {
      const { fixture } = await renderStep({
        configApiOverride: {
          listVantagens: vi.fn().mockReturnValue(throwError(() => new Error('Network error'))),
        },
      });

      const comp = fixture.componentInstance;
      const messageService = comp['messageService'];
      const addSpy = vi.spyOn(messageService, 'add');

      // Re-chamar ngOnInit para disparar o erro
      comp.ngOnInit();
      fixture.detectChanges();

      expect(addSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'error',
          summary: 'Erro ao carregar',
        })
      );
    });
  });

  // ----------------------------------------------------------
  // 8. Rascunho: vantagens ja compradas
  // ----------------------------------------------------------

  describe('rascunho — vantagens ja compradas', () => {
    it('carrega vantagens ja compradas da ficha e as exibe como Comprada', async () => {
      const { comp } = await renderStep({
        fichasApiOverride: {
          listVantagens: vi.fn().mockReturnValue(of([fichaVantagemCompradaMock])),
        },
      });

      expect(comp.idsComprados().has(1)).toBe(true);
      expect(comp.estadoBotao(1, '2')).toBe('comprada');
    });

    it('idsComprados contem todos os ids das vantagens carregadas', async () => {
      const outraVantagem: FichaVantagemResponse = {
        ...fichaVantagemCompradaMock,
        id: 2,
        vantagemConfigId: 2,
        nomeVantagem: 'Conjuracao Rapida',
      };
      const { comp } = await renderStep({
        fichasApiOverride: {
          listVantagens: vi.fn().mockReturnValue(of([fichaVantagemCompradaMock, outraVantagem])),
        },
      });

      expect(comp.idsComprados().has(1)).toBe(true);
      expect(comp.idsComprados().has(2)).toBe(true);
      expect(comp.idsComprados().has(3)).toBe(false);
    });
  });

  // ----------------------------------------------------------
  // 9. calcularCustoExibicao
  // ----------------------------------------------------------

  describe('calcularCustoExibicao', () => {
    it('retorna "1" quando formulaCusto e null', async () => {
      const { comp } = await renderStep();
      expect(comp.calcularCustoExibicao(null)).toBe('1');
    });

    it('retorna valor numerico como string quando formulaCusto e numero', async () => {
      const { comp } = await renderStep();
      expect(comp.calcularCustoExibicao('3')).toBe('3');
    });

    it('retorna a formula original quando e uma expressao nao numerica', async () => {
      const { comp } = await renderStep();
      expect(comp.calcularCustoExibicao('nivel * 2')).toBe('nivel * 2');
    });
  });

  // ----------------------------------------------------------
  // 10. Agrupamento por categoria
  // ----------------------------------------------------------

  describe('agrupamento por categoria', () => {
    it('agrupa vantagens por categoria no computed', async () => {
      const { comp } = await renderStep();

      const grupos = comp.vantagensAgrupadasPorCategoria();
      expect(grupos.length).toBe(2);

      const catCombate = grupos.find((g) => g.cat === 'Combate');
      const catMagia = grupos.find((g) => g.cat === 'Magia');

      expect(catCombate?.vantagens.length).toBe(1);
      expect(catMagia?.vantagens.length).toBe(1);
    });

    it('combina filtro de categoria e busca corretamente', async () => {
      const { comp, fixture } = await renderStep();

      comp.onFiltroCategoria('Combate');
      comp.termoBusca.set('conjuracao'); // nao existe em Combate
      fixture.detectChanges();

      expect(comp.vantagensExibidas().length).toBe(0);
    });
  });

});
