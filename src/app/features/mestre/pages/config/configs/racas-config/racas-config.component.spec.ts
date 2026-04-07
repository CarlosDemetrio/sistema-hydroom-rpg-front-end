/**
 * RacasConfigComponent — Spec
 *
 * NOTA JIT: Usa overrideTemplate para evitar NG0950 dos componentes filhos com
 * input.required() (BaseConfigTableComponent) em modo JIT no Vitest.
 *
 * Foco: indicador de penalidade, coluna de restrição de classes (restricaoLabel),
 * filtros, abertura de drawer, pontos por nível (T7), vantagens pré-definidas (T7).
 */
import { TestBed } from '@angular/core/testing';
import { render, screen } from '@testing-library/angular';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { ConfirmationService } from 'primeng/api';

import { RacasConfigComponent } from './racas-config.component';
import { RacaConfigService } from '@core/services/business/config';
import { ConfigApiService } from '@core/services/api/config-api.service';
import {
  Raca,
  RacaBonusAtributo,
  RacaClassePermitida,
  RacaPontosConfig,
  RacaVantagemPreDefinida,
  VantagemConfig,
} from '@core/models';
import { ToastService } from '@services/toast.service';
import { CurrentGameService } from '@core/services/current-game.service';

// ============================================================
// Dados de teste
// ============================================================

const bonusPositivo: RacaBonusAtributo = {
  id: 30,
  racaId: 1,
  atributoConfigId: 3,
  atributoNome: 'Vigor',
  bonus: 2,
};

const bonusNegativo: RacaBonusAtributo = {
  id: 31,
  racaId: 1,
  atributoConfigId: 4,
  atributoNome: 'Força',
  bonus: -1,
};

const classePermitida: RacaClassePermitida = {
  id: 40,
  racaId: 1,
  classeId: 7,
  classeNome: 'Mago',
};

const outraClassePermitida: RacaClassePermitida = {
  id: 41,
  racaId: 1,
  classeId: 8,
  classeNome: 'Arqueiro',
};

const racaSemRestricao: Raca = {
  id: 1,
  jogoId: 10,
  nome: 'Humano',
  descricao: 'Raça versátil',
  ordemExibicao: 1,
  bonusAtributos: [bonusPositivo],
  classesPermitidas: [],
  dataCriacao: '2024-01-01',
  dataUltimaAtualizacao: '2024-01-01',
};

const racaComRestricao: Raca = {
  id: 2,
  jogoId: 10,
  nome: 'Elfo',
  descricao: 'Raça élfica',
  ordemExibicao: 2,
  bonusAtributos: [bonusNegativo],
  classesPermitidas: [classePermitida, outraClassePermitida],
  dataCriacao: '2024-01-01',
  dataUltimaAtualizacao: '2024-01-01',
};

// ─── Dados T7 ──────────────────────────────────────────────────────────────────

const pontosNivel1: RacaPontosConfig = {
  id: 100,
  racaId: 1,
  nivel: 1,
  pontosAtributo: 2,
  pontosVantagem: 1,
  dataCriacao: '2024-01-01',
  dataUltimaAtualizacao: '2024-01-01',
};

const pontosNivel5: RacaPontosConfig = {
  id: 101,
  racaId: 1,
  nivel: 5,
  pontosAtributo: 3,
  pontosVantagem: 2,
  dataCriacao: '2024-01-01',
  dataUltimaAtualizacao: '2024-01-01',
};

const vantagemVisaoNoturna: VantagemConfig = {
  id: 50,
  jogoId: 10,
  nome: 'Visão Noturna',
  sigla: null,
  descricao: 'Enxerga no escuro',
  categoriaVantagemId: 1,
  categoriaNome: 'Racial',
  nivelMaximo: 1,
  formulaCusto: null,
  descricaoEfeito: null,
  ordemExibicao: 1,
  preRequisitos: [],
  efeitos: [],
  dataCriacao: '2024-01-01',
  dataUltimaAtualizacao: '2024-01-01',
};

const vantagemPreDefinida: RacaVantagemPreDefinida = {
  id: 200,
  racaId: 1,
  nivel: 1,
  vantagemConfigId: 50,
  vantagemConfigNome: 'Visão Noturna',
  dataCriacao: '2024-01-01',
  dataUltimaAtualizacao: '2024-01-01',
};

// ============================================================
// Helpers de mock
// ============================================================

function criarRacaServiceMock(racas: Raca[] = [], temJogo = true) {
  const jogoAtual = temJogo ? { id: 10, nome: 'Campanha Teste', ativo: true } : null;
  return {
    loadItems:      vi.fn().mockReturnValue(of(racas)),
    createItem:     vi.fn().mockReturnValue(of(racaSemRestricao)),
    updateItem:     vi.fn().mockReturnValue(of(racaSemRestricao)),
    deleteItem:     vi.fn().mockReturnValue(of(void 0)),
    currentGameId:  () => (temJogo ? 10 : null),
    hasCurrentGame: () => temJogo,
    currentGame:    () => jogoAtual,
  };
}

function criarCurrentGameServiceMock(temJogo = true) {
  const jogoAtual = temJogo ? { id: 10, nome: 'Campanha Teste', ativo: true } : null;
  return {
    currentGameId:  () => (temJogo ? 10 : null),
    hasCurrentGame: () => temJogo,
    currentGame:    () => jogoAtual,
    availableGames: signal([]).asReadonly(),
    selectGame:     vi.fn(),
    clearGame:      vi.fn(),
  };
}

function criarToastServiceMock() {
  return {
    success: vi.fn(),
    error:   vi.fn(),
    warning: vi.fn(),
    info:    vi.fn(),
    clear:   vi.fn(),
  };
}

function criarConfigApiMock(
  pontosConfigList: RacaPontosConfig[] = [],
  vantagensPreDefList: RacaVantagemPreDefinida[] = [],
) {
  return {
    listAtributos:                  vi.fn().mockReturnValue(of([])),
    listClasses:                    vi.fn().mockReturnValue(of([])),
    listVantagens:                  vi.fn().mockReturnValue(of([vantagemVisaoNoturna])),
    addRacaBonusAtributo:           vi.fn().mockReturnValue(of(bonusPositivo)),
    removeRacaBonusAtributo:        vi.fn().mockReturnValue(of(void 0)),
    addRacaClassePermitida:         vi.fn().mockReturnValue(of(classePermitida)),
    removeRacaClassePermitida:      vi.fn().mockReturnValue(of(void 0)),
    getRaca:                        vi.fn().mockReturnValue(of(racaSemRestricao)),
    reordenarRacas:                 vi.fn().mockReturnValue(of(void 0)),
    // T7 — Pontos por Nível
    listRacaPontosConfig:           vi.fn().mockReturnValue(of(pontosConfigList)),
    createRacaPontosConfig:         vi.fn().mockReturnValue(of(pontosNivel1)),
    updateRacaPontosConfig:         vi.fn().mockReturnValue(of(pontosNivel1)),
    deleteRacaPontosConfig:         vi.fn().mockReturnValue(of(void 0)),
    // T7 — Vantagens Pré-definidas
    listRacaVantagensPreDefinidas:  vi.fn().mockReturnValue(of(vantagensPreDefList)),
    createRacaVantagemPreDefinida:  vi.fn().mockReturnValue(of(vantagemPreDefinida)),
    deleteRacaVantagemPreDefinida:  vi.fn().mockReturnValue(of(void 0)),
  };
}

// Template stub: renderiza elementos necessários para os testes
const TEMPLATE_STUB = `
  <div id="racas-config-stub">
    @if (hasGame()) {
      <span id="jogo-ativo">{{ currentGameName() }}</span>
    }
    @if (!hasGame()) {
      <p id="sem-jogo">Nenhum jogo selecionado</p>
    }
    @for (raca of racasComInfo(); track raca.id) {
      <span class="restricao-label">{{ raca.restricaoLabel }}</span>
    }
    @if (selectedRaca()?.bonusAtributos?.length) {
      @for (bonus of selectedRaca()!.bonusAtributos; track bonus.id) {
        <span class="bonus-valor" [attr.data-bonus]="bonus.bonus">
          {{ bonus.bonus > 0 ? '+' : '' }}{{ bonus.bonus }}
        </span>
        @if (bonus.bonus < 0) {
          <span class="penalidade-label">(penalidade)</span>
        }
      }
    }
    @if (selectedRaca()?.classesPermitidas?.length === 0) {
      <span id="sem-restricao">Todas as classes são permitidas</span>
    }
    <!-- T7: pontos por nível -->
    @for (p of pontosConfig(); track p.id) {
      <span class="pontos-row" [attr.data-nivel]="p.nivel">
        Nível {{ p.nivel }}: Atributo={{ p.pontosAtributo }}, Vantagem={{ p.pontosVantagem }}
      </span>
    }
    @if (!pontosConfig().length) {
      <span id="sem-pontos">Nenhum nível configurado</span>
    }
    <!-- T7: vantagens pré-definidas -->
    @for (v of vantagensPreDefinidas(); track v.id) {
      <span class="vantagem-predefinida-row" [attr.data-id]="v.id">
        {{ v.vantagemConfigNome }}
      </span>
    }
    @if (!vantagensPreDefinidas().length) {
      <span id="sem-vantagens-predefinidas">Nenhuma vantagem pré-definida</span>
    }
  </div>
`;

async function renderRacas(
  racas: Raca[] = [racaSemRestricao, racaComRestricao],
  temJogo = true,
  pontosConfigList: RacaPontosConfig[] = [],
  vantagensPreDefList: RacaVantagemPreDefinida[] = [],
) {
  const racaServiceMock        = criarRacaServiceMock(racas, temJogo);
  const currentGameServiceMock = criarCurrentGameServiceMock(temJogo);
  const toastServiceMock       = criarToastServiceMock();
  const configApiMock          = criarConfigApiMock(pontosConfigList, vantagensPreDefList);

  const result = await render(RacasConfigComponent, {
    configureTestBed: (tb) => {
      tb.overrideTemplate(RacasConfigComponent, TEMPLATE_STUB);
    },
    providers: [
      { provide: RacaConfigService,    useValue: racaServiceMock },
      { provide: CurrentGameService,   useValue: currentGameServiceMock },
      { provide: ToastService,         useValue: toastServiceMock },
      { provide: ConfigApiService,     useValue: configApiMock },
      ConfirmationService,
    ],
  });

  const confirmationService = result.fixture.componentRef.injector.get(ConfirmationService);

  return { ...result, racaServiceMock, toastServiceMock, configApiMock, confirmationService };
}

// ============================================================
// Testes
// ============================================================

describe('RacasConfigComponent', () => {

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  // ----------------------------------------------------------
  // 1. Carregamento e inicialização
  // ----------------------------------------------------------

  describe('carregamento de dados', () => {
    it('deve chamar loadItems ao inicializar quando há jogo selecionado', async () => {
      const { racaServiceMock } = await renderRacas();

      expect(racaServiceMock.loadItems).toHaveBeenCalledTimes(1);
    });

    it('deve exibir aviso de sem jogo quando hasGame é false', async () => {
      await renderRacas([], false);

      expect(screen.getByText('Nenhum jogo selecionado')).toBeTruthy();
    });

    it('não deve chamar loadItems quando não há jogo selecionado', async () => {
      const { racaServiceMock } = await renderRacas([], false);

      expect(racaServiceMock.loadItems).not.toHaveBeenCalled();
    });
  });

  // ----------------------------------------------------------
  // 2. Computed racasComInfo — coluna de restrição
  // ----------------------------------------------------------

  describe('racasComInfo — computed de restrição de classes', () => {
    it('deve gerar restricaoLabel "Sem restrições" para raça sem classesPermitidas', async () => {
      const { fixture } = await renderRacas([racaSemRestricao]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      const info = comp.racasComInfo();
      expect(info[0].restricaoLabel).toBe('Sem restrições');
    });

    it('deve gerar restricaoLabel "2 classe(s)" para raça com 2 classesPermitidas', async () => {
      const { fixture } = await renderRacas([racaComRestricao]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      const info = comp.racasComInfo();
      expect(info[0].restricaoLabel).toBe('2 classe(s)');
    });

    it('deve gerar temRestricao = false para raça sem classes restritas', async () => {
      const { fixture } = await renderRacas([racaSemRestricao]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      expect(comp.racasComInfo()[0].temRestricao).toBe(false);
    });

    it('deve gerar temRestricao = true para raça com classes restritas', async () => {
      const { fixture } = await renderRacas([racaComRestricao]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      expect(comp.racasComInfo()[0].temRestricao).toBe(true);
    });

    it('deve exibir "Sem restrições" na tabela para raça sem classesPermitidas', async () => {
      await renderRacas([racaSemRestricao]);

      expect(screen.getByText('Sem restrições')).toBeTruthy();
    });

    it('deve exibir "2 classe(s)" na tabela para raça com 2 classesPermitidas', async () => {
      await renderRacas([racaComRestricao]);

      expect(screen.getByText('2 classe(s)')).toBeTruthy();
    });
  });

  // ----------------------------------------------------------
  // 3. Indicador textual de penalidade
  // ----------------------------------------------------------

  describe('indicador de penalidade em RacaBonusAtributo', () => {
    it('deve exibir "(penalidade)" para bonus com valor negativo', async () => {
      const { fixture } = await renderRacas([racaComRestricao]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.selectedRaca.set(racaComRestricao);
      fixture.detectChanges();

      expect(screen.getByText('(penalidade)')).toBeTruthy();
    });

    it('não deve exibir "(penalidade)" para bonus com valor positivo', async () => {
      const { fixture } = await renderRacas([racaSemRestricao]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.selectedRaca.set(racaSemRestricao);
      fixture.detectChanges();

      expect(screen.queryByText('(penalidade)')).toBeNull();
    });
  });

  // ----------------------------------------------------------
  // 4. Classes permitidas — estado vazio
  // ----------------------------------------------------------

  describe('estado vazio de classesPermitidas', () => {
    it('deve exibir "Todas as classes são permitidas" quando classesPermitidas é vazio', async () => {
      const { fixture } = await renderRacas([racaSemRestricao]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.selectedRaca.set(racaSemRestricao);
      fixture.detectChanges();

      expect(screen.getByText('Todas as classes são permitidas')).toBeTruthy();
    });

    it('não deve exibir "Todas as classes são permitidas" quando há restrições', async () => {
      const { fixture } = await renderRacas([racaComRestricao]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.selectedRaca.set(racaComRestricao);
      fixture.detectChanges();

      expect(screen.queryByText('Todas as classes são permitidas')).toBeNull();
    });
  });

  // ----------------------------------------------------------
  // 5. Abertura de drawer
  // ----------------------------------------------------------

  describe('abertura do drawer', () => {
    it('deve abrir o drawer ao chamar openDrawer()', async () => {
      const { fixture } = await renderRacas();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDrawer();
      fixture.detectChanges();

      expect(comp.drawerVisible()).toBe(true);
    });

    it('deve colocar editMode = false ao abrir para nova raça', async () => {
      const { fixture } = await renderRacas();

      fixture.componentInstance.openDrawer();
      fixture.detectChanges();

      expect(fixture.componentInstance.editMode()).toBe(false);
    });

    it('deve colocar editMode = true ao abrir para editar raça existente', async () => {
      const { fixture } = await renderRacas();

      fixture.componentInstance.openDrawer(racaSemRestricao);
      fixture.detectChanges();

      expect(fixture.componentInstance.editMode()).toBe(true);
    });
  });

  // ----------------------------------------------------------
  // 6. Filtro de busca
  // ----------------------------------------------------------

  describe('filtro de busca (filteredItems)', () => {
    it('deve retornar todos os items quando busca está vazia', async () => {
      const { fixture } = await renderRacas();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.searchQuery.set('');
      fixture.detectChanges();

      expect(comp.filteredItems().length).toBe(2);
    });

    it('deve filtrar raças pelo nome (case-insensitive)', async () => {
      const { fixture } = await renderRacas();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.searchQuery.set('humano');
      fixture.detectChanges();

      const filtered = comp.filteredItems();
      expect(filtered.length).toBe(1);
      expect(filtered[0].nome).toBe('Humano');
    });

    it('deve manter racasComInfo sincronizado com filteredItems', async () => {
      const { fixture } = await renderRacas();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.searchQuery.set('elfo');
      fixture.detectChanges();

      const racasInfo = comp.racasComInfo();
      expect(racasInfo.length).toBe(1);
      expect(racasInfo[0].nome).toBe('Elfo');
      expect(racasInfo[0].restricaoLabel).toBe('2 classe(s)');
    });
  });

  // ----------------------------------------------------------
  // 7. T7 — Cenário T7-01: Listar Pontos por Nível da Raça
  // ----------------------------------------------------------

  describe('T7 — Pontos por Nível', () => {
    it('deve exibir pontos config quando openDrawer é chamado com raça existente', async () => {
      const { fixture, configApiMock } = await renderRacas(
        [racaSemRestricao],
        true,
        [pontosNivel1],
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDrawer(racaSemRestricao);
      fixture.detectChanges();

      expect(configApiMock.listRacaPontosConfig).toHaveBeenCalledWith(racaSemRestricao.id);
    });

    it('deve carregar e exibir linhas de pontos config na aba', async () => {
      const { fixture } = await renderRacas(
        [racaSemRestricao],
        true,
        [pontosNivel1],
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDrawer(racaSemRestricao);
      fixture.detectChanges();

      // O sinal pontosConfig deve estar populado após o load
      const lista = comp.pontosConfig();
      expect(lista.length).toBe(1);
      expect(lista[0].nivel).toBe(1);
      expect(lista[0].pontosAtributo).toBe(2);
      expect(lista[0].pontosVantagem).toBe(1);
    });

    it('deve exibir "Nenhum nível configurado" quando pontos config está vazio', async () => {
      const { fixture } = await renderRacas([racaSemRestricao], true, []);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDrawer(racaSemRestricao);
      fixture.detectChanges();

      expect(screen.getByText('Nenhum nível configurado')).toBeTruthy();
    });

    it('deve chamar createRacaPontosConfig ao salvar formulário de novo nível', async () => {
      const { fixture, configApiMock } = await renderRacas([racaSemRestricao], true, []);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.selectedRaca.set(racaSemRestricao);
      comp.pontosFormNivel.set(3);
      comp.pontosFormAtributo.set(2);
      comp.pontosFormVantagem.set(1);
      comp.editingPontosConfigId.set(null);

      comp.salvarPontosConfig();
      fixture.detectChanges();

      expect(configApiMock.createRacaPontosConfig).toHaveBeenCalledWith(
        racaSemRestricao.id,
        { nivel: 3, pontosAtributo: 2, pontosVantagem: 1 },
      );
    });

    it('deve chamar updateRacaPontosConfig ao salvar edição de nível existente', async () => {
      const { fixture, configApiMock } = await renderRacas(
        [racaSemRestricao], true, [pontosNivel1],
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.selectedRaca.set(racaSemRestricao);
      comp.editarPontosConfig(pontosNivel1);
      comp.pontosFormAtributo.set(5);
      comp.salvarPontosConfig();
      fixture.detectChanges();

      expect(configApiMock.updateRacaPontosConfig).toHaveBeenCalledWith(
        racaSemRestricao.id,
        pontosNivel1.id,
        { nivel: pontosNivel1.nivel, pontosAtributo: 5, pontosVantagem: pontosNivel1.pontosVantagem },
      );
    });

    it('deve exibir erro quando createRacaPontosConfig retorna 409 (nível duplicado)', async () => {
      const { fixture, configApiMock, toastServiceMock } = await renderRacas(
        [racaSemRestricao], true, [],
      );
      configApiMock.createRacaPontosConfig.mockReturnValue(
        throwError(() => ({ status: 409 })),
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.selectedRaca.set(racaSemRestricao);
      comp.pontosFormNivel.set(1);
      comp.salvarPontosConfig();
      fixture.detectChanges();

      expect(toastServiceMock.error).toHaveBeenCalledWith(
        'Já existe uma configuração para este nível.',
        'Erro',
      );
    });

    it('deve chamar deleteRacaPontosConfig e recarregar após confirmação', async () => {
      const { fixture, configApiMock } = await renderRacas(
        [racaSemRestricao], true, [pontosNivel5],
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.selectedRaca.set(racaSemRestricao);
      // Simula deletar diretamente (sem confirmação)
      comp['deletePontosConfig'](pontosNivel5.id);
      fixture.detectChanges();

      expect(configApiMock.deleteRacaPontosConfig).toHaveBeenCalledWith(
        racaSemRestricao.id,
        pontosNivel5.id,
      );
      expect(configApiMock.listRacaPontosConfig).toHaveBeenCalled();
    });
  });

  // ----------------------------------------------------------
  // 8. T7 — Cenário T7-02: Adicionar Vantagem Pré-definida
  // ----------------------------------------------------------

  describe('T7 — Vantagens Pré-definidas', () => {
    it('deve carregar vantagens pré-definidas ao abrir drawer com raça existente', async () => {
      const { fixture, configApiMock } = await renderRacas(
        [racaSemRestricao], true, [], [vantagemPreDefinida],
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDrawer(racaSemRestricao);
      fixture.detectChanges();

      expect(configApiMock.listRacaVantagensPreDefinidas).toHaveBeenCalledWith(racaSemRestricao.id);
    });

    it('deve exibir vantagem pré-definida carregada', async () => {
      const { fixture } = await renderRacas(
        [racaSemRestricao], true, [], [vantagemPreDefinida],
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDrawer(racaSemRestricao);
      fixture.detectChanges();

      const lista = comp.vantagensPreDefinidas();
      expect(lista.length).toBe(1);
      expect(lista[0].vantagemConfigNome).toBe('Visão Noturna');
    });

    it('deve exibir "Nenhuma vantagem pré-definida" quando lista está vazia', async () => {
      const { fixture } = await renderRacas([racaSemRestricao], true, [], []);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDrawer(racaSemRestricao);
      fixture.detectChanges();

      expect(screen.getByText('Nenhuma vantagem pré-definida')).toBeTruthy();
    });

    it('deve chamar createRacaVantagemPreDefinida ao adicionar vantagem', async () => {
      const { fixture, configApiMock } = await renderRacas([racaSemRestricao], true, [], []);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.selectedRaca.set(racaSemRestricao);
      comp.vantagemFormNivel.set(1);
      comp.selectedVantagemId.set(vantagemVisaoNoturna.id);
      comp.addVantagemPreDefinida();
      fixture.detectChanges();

      expect(configApiMock.createRacaVantagemPreDefinida).toHaveBeenCalledWith(
        racaSemRestricao.id,
        { nivel: 1, vantagemConfigId: vantagemVisaoNoturna.id },
      );
    });

    it('deve resetar formulário após adicionar vantagem com sucesso', async () => {
      const { fixture } = await renderRacas([racaSemRestricao], true, [], []);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.selectedRaca.set(racaSemRestricao);
      comp.vantagemFormNivel.set(3);
      comp.selectedVantagemId.set(vantagemVisaoNoturna.id);
      comp.addVantagemPreDefinida();
      fixture.detectChanges();

      expect(comp.selectedVantagemId()).toBeNull();
      expect(comp.vantagemFormNivel()).toBe(1);
    });

    it('deve chamar deleteRacaVantagemPreDefinida ao deletar vantagem pré-definida', async () => {
      const { fixture, configApiMock } = await renderRacas(
        [racaSemRestricao], true, [], [vantagemPreDefinida],
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.selectedRaca.set(racaSemRestricao);
      comp['deleteVantagemPreDefinida'](vantagemPreDefinida.id);
      fixture.detectChanges();

      expect(configApiMock.deleteRacaVantagemPreDefinida).toHaveBeenCalledWith(
        racaSemRestricao.id,
        vantagemPreDefinida.id,
      );
    });

    it('deve exibir erro toast quando addVantagemPreDefinida falha', async () => {
      const { fixture, configApiMock, toastServiceMock } = await renderRacas(
        [racaSemRestricao], true, [], [],
      );
      configApiMock.createRacaVantagemPreDefinida.mockReturnValue(
        throwError(() => ({ status: 500 })),
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.selectedRaca.set(racaSemRestricao);
      comp.vantagemFormNivel.set(1);
      comp.selectedVantagemId.set(vantagemVisaoNoturna.id);
      comp.addVantagemPreDefinida();
      fixture.detectChanges();

      expect(toastServiceMock.error).toHaveBeenCalledWith(
        'Erro ao adicionar vantagem pré-definida.',
        'Erro',
      );
    });
  });
});
