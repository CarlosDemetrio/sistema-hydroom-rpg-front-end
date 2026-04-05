/**
 * FichaWizardComponent — Spec
 *
 * NOTA JIT: Usamos overrideTemplate para substituir o template por um stub
 * minimo, evitando NG0950 dos sub-componentes com input.required() em modo JIT.
 * Os testes focam na logica do Smart Component: signals, validacao de passos,
 * auto-save, retomada de rascunho e filtragem de classes por raca.
 */
import { TestBed } from '@angular/core/testing';
import { render } from '@testing-library/angular';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { provideRouter, Routes } from '@angular/router';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { Component } from '@angular/core';

// Componente stub para rotas de teste
@Component({ standalone: true, template: '' })
class StubComponent {}

const ROTAS_TESTE: Routes = [
  { path: 'jogador/fichas', component: StubComponent },
  { path: 'mestre/jogos',   component: StubComponent },
  { path: 'mestre/npcs',    component: StubComponent },
];
import { MessageService } from 'primeng/api';

import { FichaWizardComponent } from './ficha-wizard.component';
import { FichasApiService } from '@core/services/api/fichas-api.service';
import { ConfigApiService } from '@core/services/api/config-api.service';
import { CurrentGameService } from '@core/services/current-game.service';
import { AuthService } from '@services/auth.service';
import { Ficha } from '@core/models/ficha.model';
import { ClassePersonagem, GeneroConfig, IndoleConfig, PresencaConfig, Raca } from '@core/models/config.models';

// ============================================================
// Dados de teste
// ============================================================

const jogoAtualMock = { id: 10, nome: 'Campanha Epica', ativo: true };

const racaMock: Raca = {
  id: 1,
  jogoId: 10,
  nome: 'Humano',
  descricao: null,
  ordemExibicao: 1,
  bonusAtributos: [],
  classesPermitidas: [],
  dataCriacao: '2024-01-01T00:00:00',
  dataUltimaAtualizacao: '2024-01-01T00:00:00',
};

const racaComRestricao: Raca = {
  ...racaMock,
  id: 2,
  nome: 'Anao',
  classesPermitidas: [
    { id: 1, racaId: 2, classeId: 1, classeNome: 'Guerreiro' },
  ],
};

const classeMock: ClassePersonagem = {
  id: 1,
  jogoId: 10,
  nome: 'Guerreiro',
  descricao: null,
  ordemExibicao: 1,
  bonusConfig: [],
  aptidaoBonus: [],
  dataCriacao: '2024-01-01T00:00:00',
  dataUltimaAtualizacao: '2024-01-01T00:00:00',
};

const classeRestririta: ClassePersonagem = {
  ...classeMock,
  id: 2,
  nome: 'Mago',
};

const generoMock: GeneroConfig = {
  id: 1,
  jogoId: 10,
  nome: 'Masculino',
  descricao: null,
  ordemExibicao: 1,
  dataCriacao: '2024-01-01T00:00:00',
  dataUltimaAtualizacao: '2024-01-01T00:00:00',
};

const indoleMock: IndoleConfig = {
  id: 1,
  jogoId: 10,
  nome: 'Corajoso',
  descricao: null,
  ordemExibicao: 1,
  dataCriacao: '2024-01-01T00:00:00',
  dataUltimaAtualizacao: '2024-01-01T00:00:00',
};

const presencaMock: PresencaConfig = {
  id: 1,
  jogoId: 10,
  nome: 'Imponente',
  descricao: null,
  ordemExibicao: 1,
  dataCriacao: '2024-01-01T00:00:00',
  dataUltimaAtualizacao: '2024-01-01T00:00:00',
};

const fichaRascunhoMock: Ficha = {
  id: 42,
  jogoId: 10,
  nome: 'Aragorn',
  jogadorId: 1,
  racaId: 1,
  racaNome: 'Humano',
  classeId: 1,
  classeNome: 'Guerreiro',
  generoId: 1,
  generoNome: 'Masculino',
  indoleId: 1,
  indoleNome: 'Corajoso',
  presencaId: 1,
  presencaNome: 'Imponente',
  nivel: 1,
  xp: 0,
  renascimentos: 0,
  isNpc: false,
  dataCriacao: '2024-01-01T00:00:00',
  dataUltimaAtualizacao: '2024-01-01T00:00:00',
};

const fichaRascunhoParcialMock: Ficha = {
  ...fichaRascunhoMock,
  id: 43,
  classeId: null,
  classeNome: null,
  indoleId: null,
  presencaId: null,
};

const fichaNovaRetornadaMock: Ficha = {
  ...fichaRascunhoMock,
  id: 99,
  nome: 'Novo Personagem',
};

// ============================================================
// Factories de mocks
// ============================================================

function criarFichasApiMock(fichaRetornada: Ficha = fichaNovaRetornadaMock) {
  return {
    getFicha:     vi.fn().mockReturnValue(of(fichaRascunhoMock)),
    createFicha:  vi.fn().mockReturnValue(of(fichaRetornada)),
    updateFicha:  vi.fn().mockReturnValue(of(fichaRetornada)),
  };
}

function criarConfigApiMock() {
  return {
    listGeneros:  vi.fn().mockReturnValue(of([generoMock])),
    listRacas:    vi.fn().mockReturnValue(of([racaMock, racaComRestricao])),
    listClasses:  vi.fn().mockReturnValue(of([classeMock, classeRestririta])),
    listIndoles:  vi.fn().mockReturnValue(of([indoleMock])),
    listPresencas: vi.fn().mockReturnValue(of([presencaMock])),
  };
}

function criarCurrentGameServiceMock(temJogo = true) {
  return {
    hasCurrentGame:  () => temJogo,
    currentGameId:   () => (temJogo ? 10 : null),
    currentGame:     () => (temJogo ? jogoAtualMock : null),
    availableGames:  signal([]).asReadonly(),
    selectGame:      vi.fn(),
    clearGame:       vi.fn(),
  };
}

function criarAuthServiceMock(isMestre = false) {
  return {
    isMestre: () => isMestre,
    currentUser: () => ({ id: '1', name: 'Teste', email: 'teste@teste.com', role: isMestre ? 'MESTRE' : 'JOGADOR' }),
  };
}

// ============================================================
// Template stub para evitar NG0950 em JIT
// ============================================================

const TEMPLATE_STUB = `
  <div id="ficha-wizard-stub">
    @if (carregandoConfigs() || carregandoRascunho()) {
      <div id="carregando">Carregando...</div>
    } @else {
      <div id="conteudo">
        <span id="passo-atual">{{ passoAtual() }}</span>
        <button
          id="btn-proximo"
          [disabled]="!passoAtualValido() || estadoSalvamento() === 'salvando'"
          (click)="avancarPasso()"
        >Proximo</button>
        <button id="btn-voltar" (click)="voltarPasso()">Voltar</button>
        <button id="btn-cancelar" (click)="cancelar()">Cancelar</button>
        <span id="estado-salvamento">{{ estadoSalvamento() }}</span>
      </div>
    }
  </div>
`;

// ============================================================
// Helper de render
// ============================================================

interface RenderOptions {
  temJogo?: boolean;
  isMestre?: boolean;
  queryParams?: Record<string, string>;
  fichaRetornada?: Ficha;
  fichasApiOverride?: Partial<ReturnType<typeof criarFichasApiMock>>;
  configApiOverride?: Partial<ReturnType<typeof criarConfigApiMock>>;
  routeData?: Record<string, unknown>;
}

async function renderWizard(opts: RenderOptions = {}) {
  const {
    temJogo = true,
    isMestre = false,
    queryParams = {},
    fichaRetornada = fichaNovaRetornadaMock,
    fichasApiOverride = {},
    configApiOverride = {},
    routeData = {},
  } = opts;

  const fichasApi = { ...criarFichasApiMock(fichaRetornada), ...fichasApiOverride };
  const configApi = { ...criarConfigApiMock(), ...configApiOverride };
  const currentGameService = criarCurrentGameServiceMock(temJogo);
  const authService = criarAuthServiceMock(isMestre);

  const activatedRouteMock = {
    snapshot: {
      queryParamMap: convertToParamMap(queryParams),
      data: routeData,
    },
  };

  const result = await render(FichaWizardComponent, {
    configureTestBed: (tb) => {
      tb.overrideTemplate(FichaWizardComponent, TEMPLATE_STUB);
    },
    providers: [
      provideRouter(ROTAS_TESTE),
      { provide: FichasApiService,    useValue: fichasApi },
      { provide: ConfigApiService,    useValue: configApi },
      { provide: CurrentGameService,  useValue: currentGameService },
      { provide: AuthService,         useValue: authService },
      { provide: ActivatedRoute,      useValue: activatedRouteMock },
      MessageService,
    ],
  });

  return { ...result, fichasApi, configApi, currentGameService, authService };
}

// ============================================================
// Testes
// ============================================================

describe('FichaWizardComponent', () => {

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  // ----------------------------------------------------------
  // 1. Renderizacao inicial
  // ----------------------------------------------------------

  describe('renderizacao inicial', () => {
    it('inicia no passo 1', async () => {
      const { fixture } = await renderWizard();
      expect(fixture.componentInstance.passoAtual()).toBe(1);
    });

    it('carrega generos, racas, classes, indoles e presencas ao inicializar', async () => {
      const { configApi } = await renderWizard();
      expect(configApi.listGeneros).toHaveBeenCalledWith(10);
      expect(configApi.listRacas).toHaveBeenCalledWith(10);
      expect(configApi.listClasses).toHaveBeenCalledWith(10);
      expect(configApi.listIndoles).toHaveBeenCalledWith(10);
      expect(configApi.listPresencas).toHaveBeenCalledWith(10);
    });

    it('popula signals de configs apos carregamento', async () => {
      const { fixture } = await renderWizard();
      const comp = fixture.componentInstance;
      expect(comp.generos().length).toBe(1);
      expect(comp.racas().length).toBe(2);
      expect(comp.classes().length).toBe(2);
      expect(comp.indoles().length).toBe(1);
      expect(comp.presencas().length).toBe(1);
    });

    it('nao chama APIs de config quando nao ha jogo selecionado', async () => {
      const { configApi } = await renderWizard({ temJogo: false });
      expect(configApi.listGeneros).not.toHaveBeenCalled();
      expect(configApi.listRacas).not.toHaveBeenCalled();
    });

    it('estadoSalvamento inicial e idle', async () => {
      const { fixture } = await renderWizard();
      expect(fixture.componentInstance.estadoSalvamento()).toBe('idle');
    });

    it('fichaId inicial e null', async () => {
      const { fixture } = await renderWizard();
      expect(fixture.componentInstance.fichaId()).toBeNull();
    });
  });

  // ----------------------------------------------------------
  // 2. Validacao do passo 1
  // ----------------------------------------------------------

  describe('validacao do passo 1', () => {
    it('passoAtualValido e false quando form esta vazio', async () => {
      const { fixture } = await renderWizard();
      expect(fixture.componentInstance.passoAtualValido()).toBe(false);
    });

    it('passoAtualValido e false quando nome tem menos de 2 chars', async () => {
      const { fixture } = await renderWizard();
      fixture.componentInstance.formPasso1.set({
        nome: 'A',
        generoId: 1,
        racaId: 1,
        classeId: 1,
        indoleId: 1,
        presencaId: 1,
        isNpc: false,
        descricao: null,
      });
      fixture.detectChanges();
      expect(fixture.componentInstance.passoAtualValido()).toBe(false);
    });

    it('passoAtualValido e true quando todos os campos obrigatorios sao preenchidos', async () => {
      const { fixture } = await renderWizard();
      fixture.componentInstance.formPasso1.set({
        nome: 'Aragorn',
        generoId: 1,
        racaId: 1,
        classeId: 1,
        indoleId: 1,
        presencaId: 1,
        isNpc: false,
        descricao: null,
      });
      fixture.detectChanges();
      expect(fixture.componentInstance.passoAtualValido()).toBe(true);
    });

    it('passoAtualValido e false quando generoId e null', async () => {
      const { fixture } = await renderWizard();
      fixture.componentInstance.formPasso1.set({
        nome: 'Aragorn',
        generoId: null,
        racaId: 1,
        classeId: 1,
        indoleId: 1,
        presencaId: 1,
        isNpc: false,
        descricao: null,
      });
      fixture.detectChanges();
      expect(fixture.componentInstance.passoAtualValido()).toBe(false);
    });
  });

  // ----------------------------------------------------------
  // 3. Auto-save: avanco do passo 1
  // ----------------------------------------------------------

  describe('auto-save ao avancar do passo 1', () => {
    it('chama createFicha (POST) ao avancar pela primeira vez (fichaId null)', async () => {
      const { fixture, fichasApi } = await renderWizard();
      const comp = fixture.componentInstance;

      comp.formPasso1.set({
        nome: 'Aragorn',
        generoId: 1,
        racaId: 1,
        classeId: 1,
        indoleId: 1,
        presencaId: 1,
        isNpc: false,
        descricao: null,
      });
      fixture.detectChanges();

      comp.avancarPasso();

      expect(fichasApi.createFicha).toHaveBeenCalledWith(10, expect.objectContaining({
        jogoId: 10,
        nome: 'Aragorn',
      }));
    });

    it('chama updateFicha (PUT) quando fichaId ja existe', async () => {
      const { fixture, fichasApi } = await renderWizard();
      const comp = fixture.componentInstance;

      comp.fichaId.set(42);
      comp.formPasso1.set({
        nome: 'Aragorn Editado',
        generoId: 1,
        racaId: 1,
        classeId: 1,
        indoleId: 1,
        presencaId: 1,
        isNpc: false,
        descricao: null,
      });
      fixture.detectChanges();

      comp.avancarPasso();

      expect(fichasApi.updateFicha).toHaveBeenCalledWith(42, expect.objectContaining({
        nome: 'Aragorn Editado',
      }));
    });

    it('avanca para passo 2 apos save bem-sucedido', async () => {
      const { fixture } = await renderWizard();
      const comp = fixture.componentInstance;

      comp.formPasso1.set({
        nome: 'Aragorn',
        generoId: 1,
        racaId: 1,
        classeId: 1,
        indoleId: 1,
        presencaId: 1,
        isNpc: false,
        descricao: null,
      });
      fixture.detectChanges();
      comp.avancarPasso();
      fixture.detectChanges();

      expect(comp.passoAtual()).toBe(2);
    });

    it('define fichaId com o ID retornado pelo backend apos criacao', async () => {
      const { fixture } = await renderWizard({ fichaRetornada: fichaNovaRetornadaMock });
      const comp = fixture.componentInstance;

      comp.formPasso1.set({
        nome: 'Novo Personagem',
        generoId: 1,
        racaId: 1,
        classeId: 1,
        indoleId: 1,
        presencaId: 1,
        isNpc: false,
        descricao: null,
      });
      fixture.detectChanges();
      comp.avancarPasso();
      fixture.detectChanges();

      expect(comp.fichaId()).toBe(99);
    });

    it('muda estadoSalvamento para "salvando" durante o request', async () => {
      // Usa Subject para controlar quando o observable resolve
      const { Subject } = await import('rxjs');
      const subject = new Subject<Ficha>();

      const { fixture } = await renderWizard({
        fichasApiOverride: {
          createFicha: vi.fn().mockReturnValue(subject.asObservable()),
        },
      });
      const comp = fixture.componentInstance;

      comp.formPasso1.set({
        nome: 'Aragorn',
        generoId: 1,
        racaId: 1,
        classeId: 1,
        indoleId: 1,
        presencaId: 1,
        isNpc: false,
        descricao: null,
      });
      fixture.detectChanges();
      comp.avancarPasso();
      fixture.detectChanges();

      // Enquanto o Subject nao emitiu, estado deve ser 'salvando'
      expect(comp.estadoSalvamento()).toBe('salvando');

      // Resolve o observable para evitar subscriptions pendentes
      subject.next(fichaNovaRetornadaMock);
      subject.complete();
    });

    it('muda estadoSalvamento para "erro" quando o request falha', async () => {
      const { fixture } = await renderWizard({
        fichasApiOverride: {
          createFicha: vi.fn().mockReturnValue(throwError(() => new Error('Server error'))),
        },
      });
      const comp = fixture.componentInstance;

      comp.formPasso1.set({
        nome: 'Aragorn',
        generoId: 1,
        racaId: 1,
        classeId: 1,
        indoleId: 1,
        presencaId: 1,
        isNpc: false,
        descricao: null,
      });
      fixture.detectChanges();
      comp.avancarPasso();
      fixture.detectChanges();

      expect(comp.estadoSalvamento()).toBe('erro');
      expect(comp.passoAtual()).toBe(1); // Nao avanca em caso de erro
    });

    it('nao avanca se o form do passo 1 nao e valido', async () => {
      const { fixture } = await renderWizard();
      const comp = fixture.componentInstance;

      // Form vazio
      comp.avancarPasso();
      fixture.detectChanges();

      expect(comp.passoAtual()).toBe(1);
    });
  });

  // ----------------------------------------------------------
  // 4. Retomada de rascunho
  // ----------------------------------------------------------

  describe('retomada de rascunho', () => {
    it('carrega ficha quando fichaId esta presente na query string', async () => {
      const { fichasApi } = await renderWizard({
        queryParams: { fichaId: '42' },
        fichasApiOverride: {
          getFicha: vi.fn().mockReturnValue(of(fichaRascunhoMock)),
        },
      });
      expect(fichasApi.getFicha).toHaveBeenCalledWith(42);
    });

    it('pre-preenche formPasso1 com dados da ficha rascunho', async () => {
      const { fixture } = await renderWizard({
        queryParams: { fichaId: '42' },
        fichasApiOverride: {
          getFicha: vi.fn().mockReturnValue(of(fichaRascunhoMock)),
        },
      });
      const comp = fixture.componentInstance;
      fixture.detectChanges();

      expect(comp.formPasso1().nome).toBe('Aragorn');
      expect(comp.formPasso1().racaId).toBe(1);
      expect(comp.formPasso1().classeId).toBe(1);
    });

    it('define fichaId com o ID da ficha rascunho', async () => {
      const { fixture } = await renderWizard({
        queryParams: { fichaId: '42' },
        fichasApiOverride: {
          getFicha: vi.fn().mockReturnValue(of(fichaRascunhoMock)),
        },
      });
      const comp = fixture.componentInstance;
      fixture.detectChanges();

      expect(comp.fichaId()).toBe(42);
    });

    it('determina passo 2 quando rascunho tem passo 1 completo', async () => {
      const { fixture } = await renderWizard({
        queryParams: { fichaId: '42' },
        fichasApiOverride: {
          getFicha: vi.fn().mockReturnValue(of(fichaRascunhoMock)),
        },
      });
      const comp = fixture.componentInstance;
      fixture.detectChanges();

      expect(comp.passoAtual()).toBe(2);
    });

    it('determina passo 1 quando rascunho tem campos incompletos', async () => {
      const { fixture } = await renderWizard({
        queryParams: { fichaId: '43' },
        fichasApiOverride: {
          getFicha: vi.fn().mockReturnValue(of(fichaRascunhoParcialMock)),
        },
      });
      const comp = fixture.componentInstance;
      fixture.detectChanges();

      expect(comp.passoAtual()).toBe(1);
    });

    it('nao chama getFicha quando nao ha fichaId na query', async () => {
      const { fichasApi } = await renderWizard({ queryParams: {} });
      expect(fichasApi.getFicha).not.toHaveBeenCalled();
    });
  });

  // ----------------------------------------------------------
  // 5. Filtragem de classes por raca
  // ----------------------------------------------------------

  describe('filtragem de classes por raca', () => {
    it('retorna todas as classes quando nenhuma raca e selecionada', async () => {
      const { fixture } = await renderWizard();
      const comp = fixture.componentInstance;
      fixture.detectChanges();

      expect(comp.classesFiltradas().length).toBe(2);
    });

    it('retorna todas as classes quando raca nao tem restricoes', async () => {
      const { fixture } = await renderWizard();
      const comp = fixture.componentInstance;
      fixture.detectChanges();

      comp.onRacaSelecionada(racaMock.id); // Humano sem restricoes
      fixture.detectChanges();

      expect(comp.classesFiltradas().length).toBe(2);
    });

    it('filtra classes quando raca tem classesPermitidas', async () => {
      const { fixture } = await renderWizard();
      const comp = fixture.componentInstance;
      fixture.detectChanges();

      comp.onRacaSelecionada(racaComRestricao.id); // Anao com restricao para Guerreiro
      fixture.detectChanges();

      const filtradas = comp.classesFiltradas();
      expect(filtradas.length).toBe(1);
      expect(filtradas[0].nome).toBe('Guerreiro');
    });

    it('reseta classeId quando classe atual nao e compativel com nova raca', async () => {
      const { fixture } = await renderWizard();
      const comp = fixture.componentInstance;
      fixture.detectChanges();

      // Seleciona Mago (id=2) com raca sem restricao
      comp.formPasso1.update(f => ({ ...f, classeId: 2, racaId: 1 }));
      comp.onRacaSelecionada(1);
      fixture.detectChanges();

      // Troca para raca que so permite Guerreiro — Mago deve ser resetado
      comp.onRacaSelecionada(racaComRestricao.id);
      fixture.detectChanges();

      expect(comp.formPasso1().classeId).toBeNull();
    });

    it('mantem classeId quando classe e compativel com nova raca', async () => {
      const { fixture } = await renderWizard();
      const comp = fixture.componentInstance;
      fixture.detectChanges();

      // Seleciona Guerreiro (id=1) com raca sem restricao
      comp.formPasso1.update(f => ({ ...f, classeId: 1 }));

      // Troca para raca que permite Guerreiro
      comp.onRacaSelecionada(racaComRestricao.id);
      fixture.detectChanges();

      expect(comp.formPasso1().classeId).toBe(1);
    });
  });

  // ----------------------------------------------------------
  // 6. Navegacao entre passos
  // ----------------------------------------------------------

  describe('navegacao entre passos', () => {
    it('voltarPasso decrementa o passo atual', async () => {
      const { fixture } = await renderWizard();
      const comp = fixture.componentInstance;

      // Simula estar no passo 2
      comp.passoAtual.set(2);
      fixture.detectChanges();

      comp.voltarPasso();
      fixture.detectChanges();

      expect(comp.passoAtual()).toBe(1);
    });

    it('voltarPasso nao vai abaixo de 1', async () => {
      const { fixture } = await renderWizard();
      const comp = fixture.componentInstance;

      comp.voltarPasso();
      fixture.detectChanges();

      expect(comp.passoAtual()).toBe(1);
    });

    it('nos passos 2-6, avancarPasso incrementa sem chamar a API', async () => {
      const { fixture, fichasApi } = await renderWizard();
      const comp = fixture.componentInstance;

      comp.passoAtual.set(2);
      fixture.detectChanges();

      comp.avancarPasso();
      fixture.detectChanges();

      expect(comp.passoAtual()).toBe(3);
      expect(fichasApi.createFicha).not.toHaveBeenCalled();
      expect(fichasApi.updateFicha).not.toHaveBeenCalled();
    });
  });

  // ----------------------------------------------------------
  // 7. Deteccao de rota NPC
  // ----------------------------------------------------------

  describe('rota de NPC', () => {
    it('define isNpc=true no formPasso1 quando rota tem data.npc=true', async () => {
      const { fixture } = await renderWizard({ routeData: { npc: true } });
      const comp = fixture.componentInstance;
      fixture.detectChanges();

      expect(comp.formPasso1().isNpc).toBe(true);
      expect(comp.isNpcRota()).toBe(true);
    });

    it('isNpc permanece false na rota normal', async () => {
      const { fixture } = await renderWizard({ routeData: {} });
      const comp = fixture.componentInstance;
      fixture.detectChanges();

      expect(comp.formPasso1().isNpc).toBe(false);
      expect(comp.isNpcRota()).toBe(false);
    });
  });

  // ----------------------------------------------------------
  // 8. onFormPasso1Changed
  // ----------------------------------------------------------

  describe('onFormPasso1Changed', () => {
    it('atualiza formPasso1 quando step emite formChanged', async () => {
      const { fixture } = await renderWizard();
      const comp = fixture.componentInstance;

      comp.onFormPasso1Changed({
        nome: 'Legolas',
        generoId: 1,
        racaId: 1,
        classeId: 1,
        indoleId: 1,
        presencaId: 1,
        isNpc: false,
        descricao: null,
      });
      fixture.detectChanges();

      expect(comp.formPasso1().nome).toBe('Legolas');
    });
  });

});
