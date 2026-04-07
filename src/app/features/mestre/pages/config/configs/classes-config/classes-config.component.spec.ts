/**
 * ClassesConfigComponent — Spec
 *
 * NOTA JIT: Usa overrideTemplate para evitar NG0950 dos componentes filhos com
 * input.required() (BaseConfigTableComponent) em modo JIT no Vitest.
 *
 * Foco: lógica do Smart Component — signals de valorPorNivel/bonus, cálculo de
 * preview, disabled states, filtros, abertura de drawer.
 */
import { TestBed } from '@angular/core/testing';
import { render, screen } from '@testing-library/angular';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { ConfirmationService } from 'primeng/api';

import { ClassesConfigComponent } from './classes-config.component';
import { ClasseConfigService } from '@core/services/business/config';
import { ConfigApiService } from '@core/services/api/config-api.service';
import { ClassePersonagem, ClasseBonusConfig, ClasseAptidaoBonus, BonusConfig } from '@core/models';
import { ClassePontosConfig, ClasseVantagemPreDefinida } from '@core/models';
import { ToastService } from '@services/toast.service';
import { CurrentGameService } from '@core/services/current-game.service';

// ============================================================
// Dados de teste
// ============================================================

const bonusConfigMock: BonusConfig = {
  id: 2,
  jogoId: 10,
  nome: 'B.B.A',
  sigla: 'BBA',
  descricao: null,
  formulaBase: 'FOR * nivel',
  ordemExibicao: 1,
  dataCriacao: '2024-01-01',
  dataUltimaAtualizacao: '2024-01-01',
};

const classeBonusMock: ClasseBonusConfig = {
  id: 10,
  classeId: 1,
  bonusConfigId: 2,
  bonusNome: 'B.B.A',
  valorPorNivel: 1.5,
};

const classeAptidaoMock: ClasseAptidaoBonus = {
  id: 20,
  classeId: 1,
  aptidaoConfigId: 5,
  aptidaoNome: 'Furtividade',
  bonus: 2,
};

const pontosMock: ClassePontosConfig = {
  id: 30,
  classePersonagemId: 1,
  nivel: 1,
  pontosAtributo: 3,
  pontosVantagem: 2,
  dataCriacao: '2024-01-01',
  dataUltimaAtualizacao: '2024-01-01',
};

const vantagemPreDefinidaMock: ClasseVantagemPreDefinida = {
  id: 40,
  classePersonagemId: 1,
  nivel: 1,
  vantagemConfigId: 5,
  vantagemConfigNome: 'Visão Noturna',
  dataCriacao: '2024-01-01',
  dataUltimaAtualizacao: '2024-01-01',
};

const classeMock: ClassePersonagem = {
  id: 1,
  jogoId: 10,
  nome: 'Guerreiro',
  descricao: 'Classe de combate',
  ordemExibicao: 1,
  bonusConfig: [classeBonusMock],
  aptidaoBonus: [classeAptidaoMock],
  pontosConfig: [pontosMock],
  vantagensPreDefinidas: [vantagemPreDefinidaMock],
  dataCriacao: '2024-01-01',
  dataUltimaAtualizacao: '2024-01-01',
};

const classeVazia: ClassePersonagem = {
  ...classeMock,
  id: 2,
  nome: 'Mago',
  bonusConfig: [],
  aptidaoBonus: [],
  pontosConfig: [],
  vantagensPreDefinidas: [],
};

// ============================================================
// Helpers de mock
// ============================================================

function criarClasseServiceMock(classes: ClassePersonagem[] = [], temJogo = true) {
  const jogoAtual = temJogo ? { id: 10, nome: 'Campanha Teste', ativo: true } : null;
  return {
    loadItems:      vi.fn().mockReturnValue(of(classes)),
    createItem:     vi.fn().mockReturnValue(of(classeMock)),
    updateItem:     vi.fn().mockReturnValue(of(classeMock)),
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

function criarConfigApiMock() {
  return {
    listBonus:              vi.fn().mockReturnValue(of([bonusConfigMock])),
    listAptidoes:           vi.fn().mockReturnValue(of([])),
    listVantagens:          vi.fn().mockReturnValue(of([])),
    addClasseBonus:         vi.fn().mockReturnValue(of(classeBonusMock)),
    removeClasseBonus:      vi.fn().mockReturnValue(of(void 0)),
    addClasseAptidaoBonus:  vi.fn().mockReturnValue(of(classeAptidaoMock)),
    removeClasseAptidaoBonus: vi.fn().mockReturnValue(of(void 0)),
    getClasse:              vi.fn().mockReturnValue(of(classeMock)),
    reordenarClasses:       vi.fn().mockReturnValue(of(void 0)),
    listClassePontosConfig:          vi.fn().mockReturnValue(of([pontosMock])),
    addClassePontosConfig:           vi.fn().mockReturnValue(of(pontosMock)),
    removeClassePontosConfig:        vi.fn().mockReturnValue(of(void 0)),
    listClasseVantagensPreDefinidas: vi.fn().mockReturnValue(of([vantagemPreDefinidaMock])),
    addClasseVantagemPreDefinida:    vi.fn().mockReturnValue(of(vantagemPreDefinidaMock)),
    removeClasseVantagemPreDefinida: vi.fn().mockReturnValue(of(void 0)),
  };
}

// Template stub mínimo — evita NG0950 de BaseConfigTableComponent (input.required)
const TEMPLATE_STUB = `
  <div id="classes-config-stub">
    @if (hasGame()) {
      <span id="jogo-ativo">{{ currentGameName() }}</span>
    }
    @if (!hasGame()) {
      <p id="sem-jogo">Nenhum jogo selecionado</p>
    }
    @if (selectedClasse()?.bonusConfig?.length) {
      @for (bonus of selectedClasse()!.bonusConfig; track bonus.id) {
        <span class="bonus-nome">{{ bonus.bonusNome }}</span>
        <span class="bonus-valor">{{ bonus.valorPorNivel }} por nível</span>
      }
    }
    @if (selectedClasse()?.aptidaoBonus?.length) {
      @for (apt of selectedClasse()!.aptidaoBonus; track apt.id) {
        <span class="apt-nome">{{ apt.aptidaoNome }}</span>
        <span class="apt-bonus">+{{ apt.bonus }}</span>
      }
    }
    @if (selectedBonusId() && valorPorNivelInput() > 0) {
      <span id="preview-nivel5">Exemplo no nível 5: +{{ (valorPorNivelInput() * 5).toFixed(2) }}</span>
    }
    @if (pontosConfig().length) {
      @for (p of pontosConfig(); track p.id) {
        <span class="pontos-nivel">Nv.{{ p.nivel }}: {{ p.pontosAtributo }}atrib / {{ p.pontosVantagem }}vant</span>
      }
    }
    @if (vantagensPreDefinidas().length) {
      @for (vp of vantagensPreDefinidas(); track vp.id) {
        <span class="vantagem-predefinida">{{ vp.vantagemConfigNome }} (Nv.{{ vp.nivel }})</span>
      }
    }
  </div>
`;

async function renderClasses(
  classes: ClassePersonagem[] = [classeMock, classeVazia],
  temJogo = true,
) {
  const classeServiceMock      = criarClasseServiceMock(classes, temJogo);
  const currentGameServiceMock = criarCurrentGameServiceMock(temJogo);
  const toastServiceMock       = criarToastServiceMock();
  const configApiMock          = criarConfigApiMock();

  const result = await render(ClassesConfigComponent, {
    configureTestBed: (tb) => {
      tb.overrideTemplate(ClassesConfigComponent, TEMPLATE_STUB);
    },
    providers: [
      { provide: ClasseConfigService,  useValue: classeServiceMock },
      { provide: CurrentGameService,   useValue: currentGameServiceMock },
      { provide: ToastService,         useValue: toastServiceMock },
      { provide: ConfigApiService,     useValue: configApiMock },
      ConfirmationService,
    ],
  });

  const confirmationService = result.fixture.componentRef.injector.get(ConfirmationService);

  return { ...result, classeServiceMock, toastServiceMock, configApiMock, confirmationService };
}

// ============================================================
// Testes
// ============================================================

describe('ClassesConfigComponent', () => {

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  // ----------------------------------------------------------
  // 1. Carregamento de dados
  // ----------------------------------------------------------

  describe('carregamento de dados', () => {
    it('deve chamar loadItems ao inicializar quando há jogo selecionado', async () => {
      const { classeServiceMock } = await renderClasses();

      expect(classeServiceMock.loadItems).toHaveBeenCalledTimes(1);
    });

    it('deve exibir os items carregados', async () => {
      const { fixture } = await renderClasses();

      expect(fixture.componentInstance.items().length).toBe(2);
      expect(fixture.componentInstance.items()[0].nome).toBe('Guerreiro');
    });

    it('não deve chamar loadItems quando não há jogo selecionado', async () => {
      const { classeServiceMock } = await renderClasses([], false);

      expect(classeServiceMock.loadItems).not.toHaveBeenCalled();
    });

    it('deve exibir aviso de sem jogo quando hasGame é false', async () => {
      await renderClasses([], false);

      expect(screen.getByText('Nenhum jogo selecionado')).toBeTruthy();
    });

    it('deve carregar bonus e aptidões disponíveis ao inicializar', async () => {
      const { configApiMock } = await renderClasses();

      expect(configApiMock.listBonus).toHaveBeenCalledWith(10);
      expect(configApiMock.listAptidoes).toHaveBeenCalledWith(10);
    });
  });

  // ----------------------------------------------------------
  // 2. Signals de valorPorNivel e bonusAptidao
  // ----------------------------------------------------------

  describe('signals valorPorNivelInput e bonusAptidaoInput', () => {
    it('valorPorNivelInput deve inicializar com 1.0', async () => {
      const { fixture } = await renderClasses();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      expect(comp.valorPorNivelInput()).toBe(1.0);
    });

    it('bonusAptidaoInput deve inicializar com 0', async () => {
      const { fixture } = await renderClasses();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      expect(comp.bonusAptidaoInput()).toBe(0);
    });

    it('deve atualizar valorPorNivelInput via signal', async () => {
      const { fixture } = await renderClasses();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.valorPorNivelInput.set(2.5);
      fixture.detectChanges();

      expect(comp.valorPorNivelInput()).toBe(2.5);
    });

    it('deve atualizar bonusAptidaoInput via signal', async () => {
      const { fixture } = await renderClasses();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.bonusAptidaoInput.set(3);
      fixture.detectChanges();

      expect(comp.bonusAptidaoInput()).toBe(3);
    });
  });

  // ----------------------------------------------------------
  // 3. addClasseBonus — validações e chamada ao service
  // ----------------------------------------------------------

  describe('addClasseBonus', () => {
    it('não deve chamar configApi.addClasseBonus quando valorPorNivel é 0', async () => {
      const { fixture, configApiMock } = await renderClasses();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.selectedClasse.set(classeVazia);
      comp.selectedBonusId.set(2);
      comp.valorPorNivelInput.set(0);

      comp.addClasseBonus();

      expect(configApiMock.addClasseBonus).not.toHaveBeenCalled();
    });

    it('não deve chamar configApi.addClasseBonus quando valorPorNivel é negativo', async () => {
      const { fixture, configApiMock } = await renderClasses();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.selectedClasse.set(classeVazia);
      comp.selectedBonusId.set(2);
      comp.valorPorNivelInput.set(-1);

      comp.addClasseBonus();

      expect(configApiMock.addClasseBonus).not.toHaveBeenCalled();
    });

    it('deve chamar configApi.addClasseBonus com bonusConfigId e valorPorNivel quando válido', async () => {
      const { fixture, configApiMock } = await renderClasses();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.selectedClasse.set(classeVazia);
      comp.selectedBonusId.set(2);
      comp.valorPorNivelInput.set(0.5);

      comp.addClasseBonus();

      expect(configApiMock.addClasseBonus).toHaveBeenCalledWith(
        classeVazia.id,
        { bonusConfigId: 2, valorPorNivel: 0.5 },
      );
    });

    it('deve resetar valorPorNivelInput para 1.0 após adicionar bônus com sucesso', async () => {
      const { fixture } = await renderClasses();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.selectedClasse.set(classeVazia);
      comp.selectedBonusId.set(2);
      comp.valorPorNivelInput.set(2.0);

      comp.addClasseBonus();

      expect(comp.valorPorNivelInput()).toBe(1.0);
    });

    it('não deve chamar addClasseBonus quando selectedClasse é null', async () => {
      const { fixture, configApiMock } = await renderClasses();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.selectedClasse.set(null);
      comp.selectedBonusId.set(2);
      comp.valorPorNivelInput.set(1.0);

      comp.addClasseBonus();

      expect(configApiMock.addClasseBonus).not.toHaveBeenCalled();
    });
  });

  // ----------------------------------------------------------
  // 4. addClasseAptidaoBonus — validações e chamada ao service
  // ----------------------------------------------------------

  describe('addClasseAptidaoBonus', () => {
    it('não deve chamar configApi.addClasseAptidaoBonus quando bonus é negativo', async () => {
      const { fixture, configApiMock } = await renderClasses();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.selectedClasse.set(classeVazia);
      comp.selectedAptidaoId.set(5);
      comp.bonusAptidaoInput.set(-1);

      comp.addClasseAptidaoBonus();

      expect(configApiMock.addClasseAptidaoBonus).not.toHaveBeenCalled();
    });

    it('deve chamar configApi.addClasseAptidaoBonus com aptidaoConfigId e bonus zero', async () => {
      const { fixture, configApiMock } = await renderClasses();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.selectedClasse.set(classeVazia);
      comp.selectedAptidaoId.set(5);
      comp.bonusAptidaoInput.set(0);

      comp.addClasseAptidaoBonus();

      expect(configApiMock.addClasseAptidaoBonus).toHaveBeenCalledWith(
        classeVazia.id,
        { aptidaoConfigId: 5, bonus: 0 },
      );
    });

    it('deve chamar configApi.addClasseAptidaoBonus com bonus positivo', async () => {
      const { fixture, configApiMock } = await renderClasses();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.selectedClasse.set(classeVazia);
      comp.selectedAptidaoId.set(5);
      comp.bonusAptidaoInput.set(3);

      comp.addClasseAptidaoBonus();

      expect(configApiMock.addClasseAptidaoBonus).toHaveBeenCalledWith(
        classeVazia.id,
        { aptidaoConfigId: 5, bonus: 3 },
      );
    });

    it('deve resetar bonusAptidaoInput para 0 após adicionar aptidão com sucesso', async () => {
      const { fixture } = await renderClasses();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.selectedClasse.set(classeVazia);
      comp.selectedAptidaoId.set(5);
      comp.bonusAptidaoInput.set(3);

      comp.addClasseAptidaoBonus();

      expect(comp.bonusAptidaoInput()).toBe(0);
    });
  });

  // ----------------------------------------------------------
  // 5. Preview "Exemplo no nível 5"
  // ----------------------------------------------------------

  describe('preview valorPorNivel', () => {
    it('deve exibir o preview quando há bonusId selecionado e valorPorNivel > 0', async () => {
      const { fixture } = await renderClasses();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.selectedBonusId.set(2);
      comp.valorPorNivelInput.set(2.0);
      fixture.detectChanges();

      expect(screen.getByText('Exemplo no nível 5: +10.00')).toBeTruthy();
    });

    it('não deve exibir o preview quando valorPorNivel é 0', async () => {
      const { fixture } = await renderClasses();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.selectedBonusId.set(2);
      comp.valorPorNivelInput.set(0);
      fixture.detectChanges();

      expect(screen.queryByText(/Exemplo no nível 5/)).toBeNull();
    });
  });

  // ----------------------------------------------------------
  // 6. Exibição de valorPorNivel e bonus na lista
  // ----------------------------------------------------------

  describe('exibição dos sub-recursos na lista', () => {
    it('deve exibir valorPorNivel dos bonusConfig da classe selecionada', async () => {
      const { fixture } = await renderClasses();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.selectedClasse.set(classeMock);
      fixture.detectChanges();

      expect(screen.getByText('1.5 por nível')).toBeTruthy();
    });

    it('deve exibir bonus das aptidaoBonus da classe selecionada', async () => {
      const { fixture } = await renderClasses();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.selectedClasse.set(classeMock);
      fixture.detectChanges();

      expect(screen.getByText('+2')).toBeTruthy();
    });
  });

  // ----------------------------------------------------------
  // 7. Abertura de drawer
  // ----------------------------------------------------------

  describe('abertura do drawer', () => {
    it('deve abrir o drawer ao chamar openDrawer()', async () => {
      const { fixture } = await renderClasses();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDrawer();
      fixture.detectChanges();

      expect(comp.drawerVisible()).toBe(true);
    });

    it('deve colocar editMode = false ao abrir para nova classe', async () => {
      const { fixture } = await renderClasses();

      fixture.componentInstance.openDrawer();
      fixture.detectChanges();

      expect(fixture.componentInstance.editMode()).toBe(false);
    });

    it('deve colocar editMode = true ao abrir para editar classe existente', async () => {
      const { fixture } = await renderClasses();

      fixture.componentInstance.openDrawer(classeMock);
      fixture.detectChanges();

      expect(fixture.componentInstance.editMode()).toBe(true);
    });
  });

  // ----------------------------------------------------------
  // 8. Filtro de busca
  // ----------------------------------------------------------

  describe('filtro de busca (filteredItems)', () => {
    it('deve retornar todos os items quando busca está vazia', async () => {
      const { fixture } = await renderClasses();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.searchQuery.set('');
      fixture.detectChanges();

      expect(comp.filteredItems().length).toBe(2);
    });

    it('deve filtrar classes pelo nome (case-insensitive)', async () => {
      const { fixture } = await renderClasses();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.searchQuery.set('guerr');
      fixture.detectChanges();

      const filtered = comp.filteredItems();
      expect(filtered.length).toBe(1);
      expect(filtered[0].nome).toBe('Guerreiro');
    });
  });

  // ----------------------------------------------------------
  // 9. Pontos por nível e Vantagens Pré-definidas
  // ----------------------------------------------------------

  describe('pontos por nível e vantagens pré-definidas', () => {
    it('deve inicializar pontosConfig como array vazio', async () => {
      const { fixture } = await renderClasses();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;
      expect(comp.pontosConfig()).toEqual([]);
    });

    it('deve inicializar vantagensPreDefinidas como array vazio', async () => {
      const { fixture } = await renderClasses();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;
      expect(comp.vantagensPreDefinidas()).toEqual([]);
    });

    it('deve chamar listVantagens ao inicializar quando há jogo selecionado', async () => {
      const { configApiMock } = await renderClasses();
      expect(configApiMock.listVantagens).toHaveBeenCalledWith(10);
    });

    it('deve chamar listClassePontosConfig ao abrir drawer de classe existente', async () => {
      const { fixture, configApiMock } = await renderClasses();
      fixture.componentInstance.openDrawer(classeMock);
      expect(configApiMock.listClassePontosConfig).toHaveBeenCalledWith(classeMock.id);
    });

    it('deve chamar listClasseVantagensPreDefinidas ao abrir drawer de classe existente', async () => {
      const { fixture, configApiMock } = await renderClasses();
      fixture.componentInstance.openDrawer(classeMock);
      expect(configApiMock.listClasseVantagensPreDefinidas).toHaveBeenCalledWith(classeMock.id);
    });

    it('deve definir pontosConfig ao carregar sub-recursos', async () => {
      const { fixture } = await renderClasses();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;
      comp.loadPontosConfig(classeMock.id);
      expect(comp.pontosConfig()).toEqual([pontosMock]);
    });

    it('deve chamar addClassePontosConfig com valores corretos', async () => {
      const { fixture, configApiMock } = await renderClasses();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;
      comp.selectedClasse.set(classeVazia);
      comp.novoNivelPontos.set(3);
      comp.novoPontosAtributo.set(2);
      comp.novoPontosVantagem.set(1);
      comp.addClassePontos();
      expect(configApiMock.addClassePontosConfig).toHaveBeenCalledWith(
        classeVazia.id,
        { nivel: 3, pontosAtributo: 2, pontosVantagem: 1 },
      );
    });

    it('não deve chamar addClassePontosConfig quando nivel < 1', async () => {
      const { fixture, configApiMock } = await renderClasses();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;
      comp.selectedClasse.set(classeVazia);
      comp.novoNivelPontos.set(0);
      comp.addClassePontos();
      expect(configApiMock.addClassePontosConfig).not.toHaveBeenCalled();
    });

    it('deve resetar campos após adicionar pontos com sucesso', async () => {
      const { fixture } = await renderClasses();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;
      comp.selectedClasse.set(classeVazia);
      comp.novoNivelPontos.set(5);
      comp.novoPontosAtributo.set(3);
      comp.novoPontosVantagem.set(2);
      comp.addClassePontos();
      expect(comp.novoNivelPontos()).toBe(1);
      expect(comp.novoPontosAtributo()).toBe(0);
      expect(comp.novoPontosVantagem()).toBe(0);
    });

    it('deve chamar addClasseVantagemPreDefinida com valores corretos', async () => {
      const { fixture, configApiMock } = await renderClasses();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;
      comp.selectedClasse.set(classeVazia);
      comp.novoNivelVantagem.set(2);
      comp.selectedVantagemId.set(5);
      comp.addClasseVantagemPreDefinida();
      expect(configApiMock.addClasseVantagemPreDefinida).toHaveBeenCalledWith(
        classeVazia.id,
        { nivel: 2, vantagemConfigId: 5 },
      );
    });

    it('não deve chamar addClasseVantagemPreDefinida quando selectedVantagemId é null', async () => {
      const { fixture, configApiMock } = await renderClasses();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;
      comp.selectedClasse.set(classeVazia);
      comp.selectedVantagemId.set(null);
      comp.addClasseVantagemPreDefinida();
      expect(configApiMock.addClasseVantagemPreDefinida).not.toHaveBeenCalled();
    });

    it('deve resetar campos após adicionar vantagem pré-definida com sucesso', async () => {
      const { fixture } = await renderClasses();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;
      comp.selectedClasse.set(classeVazia);
      comp.novoNivelVantagem.set(3);
      comp.selectedVantagemId.set(5);
      comp.addClasseVantagemPreDefinida();
      expect(comp.selectedVantagemId()).toBeNull();
      expect(comp.novoNivelVantagem()).toBe(1);
    });

    it('deve exibir pontos na lista quando pontosConfig tem dados', async () => {
      const { fixture } = await renderClasses();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;
      comp.pontosConfig.set([pontosMock]);
      fixture.detectChanges();
      expect(screen.getByText(/3atrib/)).toBeTruthy();
    });

    it('deve exibir vantagens pré-definidas quando vantagensPreDefinidas tem dados', async () => {
      const { fixture } = await renderClasses();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;
      comp.vantagensPreDefinidas.set([vantagemPreDefinidaMock]);
      fixture.detectChanges();
      expect(screen.getByText(/Visão Noturna/)).toBeTruthy();
    });
  });
});
