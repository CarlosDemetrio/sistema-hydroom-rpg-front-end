import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { DashboardMestreComponent } from './dashboard-mestre.component';
import { JogosApiService } from '@core/services/api/jogos-api.service';
import { CurrentGameService } from '@core/services/current-game.service';
import { DashboardMestre } from '@core/models/jogo.model';
import { MessageService } from 'primeng/api';

// ============================================================
// Mock data
// ============================================================

const dashboardMock: DashboardMestre = {
  totalFichas: 8,
  totalParticipantes: 5,
  fichasPorNivel: { 1: 3, 2: 4, 3: 1 },
  ultimasAlteracoes: [
    { fichaId: 10, nome: 'Thorin o Bravo', dataUltimaAlteracao: '2026-04-10T14:30:00' },
    { fichaId: 11, nome: 'Elara a Sábia', dataUltimaAlteracao: '2026-04-09T10:00:00' },
  ],
};

const jogoAtualMock = { id: 42, nome: 'Campanha Épica', ativo: true };

// ============================================================
// Mock factories
// ============================================================

function criarJogosApiMock(dashboard: DashboardMestre = dashboardMock) {
  return {
    getDashboard: vi.fn().mockReturnValue(of(dashboard)),
  };
}

function criarCurrentGameServiceMock(temJogo = true) {
  return {
    hasCurrentGame: signal(temJogo).asReadonly(),
    currentGameId: signal<number | null>(temJogo ? 42 : null).asReadonly(),
    currentGame: signal(temJogo ? jogoAtualMock : null).asReadonly(),
  };
}

// ============================================================
// Helper de configuração do TestBed
// ============================================================

const TEMPLATE_STUB = `
  <div>
    @if (!hasGame()) { <p data-testid="sem-jogo">Nenhum jogo selecionado</p> }
    @if (hasGame() && isLoading()) { <p data-testid="carregando">Carregando...</p> }
    @if (hasGame() && !isLoading() && dashboard()) {
      <div data-testid="dashboard-content">
        <span data-testid="total-fichas">{{ dashboard()!.totalFichas }}</span>
        <span data-testid="total-participantes">{{ dashboard()!.totalParticipantes }}</span>
      </div>
    }
  </div>
`;

function configurarTestBed(temJogo = true, dashboardData: DashboardMestre = dashboardMock) {
  const jogosApiMock = criarJogosApiMock(dashboardData);
  const currentGameServiceMock = criarCurrentGameServiceMock(temJogo);
  const routerMock = { navigate: vi.fn() };
  const messageServiceMock = { add: vi.fn(), clear: vi.fn() };

  TestBed.configureTestingModule({
    imports: [DashboardMestreComponent],
    providers: [
      { provide: JogosApiService, useValue: jogosApiMock },
      { provide: CurrentGameService, useValue: currentGameServiceMock },
      { provide: Router, useValue: routerMock },
      { provide: MessageService, useValue: messageServiceMock },
    ],
  });

  TestBed.overrideTemplate(DashboardMestreComponent, TEMPLATE_STUB);

  const fixture = TestBed.createComponent(DashboardMestreComponent);
  const component = fixture.componentInstance;

  return { fixture, component, jogosApiMock, routerMock, currentGameServiceMock };
}

// ============================================================
// Testes
// ============================================================

describe('DashboardMestreComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  // ----------------------------------------------------------
  // Inicialização
  // ----------------------------------------------------------

  describe('ngOnInit()', () => {
    it('deve chamar getDashboard() ao iniciar quando há jogo selecionado', () => {
      const { component, jogosApiMock } = configurarTestBed(true);

      component.ngOnInit();

      expect(jogosApiMock.getDashboard).toHaveBeenCalledWith(42);
    });

    it('NÃO deve chamar getDashboard() ao iniciar quando não há jogo selecionado', () => {
      const { component, jogosApiMock } = configurarTestBed(false);

      component.ngOnInit();

      expect(jogosApiMock.getDashboard).not.toHaveBeenCalled();
    });
  });

  // ----------------------------------------------------------
  // carregarDashboard()
  // ----------------------------------------------------------

  describe('carregarDashboard()', () => {
    it('deve popular dashboard signal após carregamento bem-sucedido', () => {
      const { component } = configurarTestBed(true);

      component.carregarDashboard();

      expect(component['dashboard']()).toEqual(dashboardMock);
    });

    it('deve definir isLoading=false após carregamento bem-sucedido', () => {
      const { component } = configurarTestBed(true);

      component.carregarDashboard();

      expect(component['isLoading']()).toBe(false);
    });

    it('deve definir isLoading=false em caso de erro', () => {
      TestBed.configureTestingModule({
        imports: [DashboardMestreComponent],
        providers: [
          { provide: JogosApiService, useValue: { getDashboard: vi.fn().mockReturnValue(throwError(() => new Error('Server error'))) } },
          { provide: CurrentGameService, useValue: criarCurrentGameServiceMock(true) },
          { provide: Router, useValue: { navigate: vi.fn() } },
          { provide: MessageService, useValue: { add: vi.fn() } },
        ],
      });
      TestBed.overrideTemplate(DashboardMestreComponent, TEMPLATE_STUB);

      const fixture = TestBed.createComponent(DashboardMestreComponent);
      const component = fixture.componentInstance;

      component.carregarDashboard();

      expect(component['isLoading']()).toBe(false);
    });

    it('NÃO deve chamar a API quando não há jogoId', () => {
      const { component, jogosApiMock } = configurarTestBed(false);

      component.carregarDashboard();

      expect(jogosApiMock.getDashboard).not.toHaveBeenCalled();
    });
  });

  // ----------------------------------------------------------
  // fichasPorNivelEntries (computed)
  // ----------------------------------------------------------

  describe('fichasPorNivelEntries()', () => {
    it('deve converter o Record em array ordenado por nível', () => {
      const { component } = configurarTestBed(true);
      component.carregarDashboard();

      const entries = component['fichasPorNivelEntries']();

      expect(entries).toEqual([
        { nivel: 1, quantidade: 3 },
        { nivel: 2, quantidade: 4 },
        { nivel: 3, quantidade: 1 },
      ]);
    });

    it('deve retornar array vazio quando dashboard é null', () => {
      const { component } = configurarTestBed(false);

      const entries = component['fichasPorNivelEntries']();

      expect(entries).toEqual([]);
    });

    it('deve ordenar os níveis em ordem crescente', () => {
      const dashboardComNiveisDesordenados: DashboardMestre = {
        ...dashboardMock,
        fichasPorNivel: { 5: 1, 2: 3, 1: 2 },
      };

      TestBed.configureTestingModule({
        imports: [DashboardMestreComponent],
        providers: [
          { provide: JogosApiService, useValue: criarJogosApiMock(dashboardComNiveisDesordenados) },
          { provide: CurrentGameService, useValue: criarCurrentGameServiceMock(true) },
          { provide: Router, useValue: { navigate: vi.fn() } },
          { provide: MessageService, useValue: { add: vi.fn() } },
        ],
      });
      TestBed.overrideTemplate(DashboardMestreComponent, TEMPLATE_STUB);

      const fixture = TestBed.createComponent(DashboardMestreComponent);
      const component = fixture.componentInstance;
      component.carregarDashboard();

      const entries = component['fichasPorNivelEntries']();
      const niveis = entries.map(e => e.nivel);

      expect(niveis).toEqual([1, 2, 5]);
    });
  });

  // ----------------------------------------------------------
  // ultimasAlteracoes (computed)
  // ----------------------------------------------------------

  describe('ultimasAlteracoes()', () => {
    it('deve retornar as últimas alterações do dashboard', () => {
      const { component } = configurarTestBed(true);
      component.carregarDashboard();

      const alteracoes = component['ultimasAlteracoes']();

      expect(alteracoes).toHaveLength(2);
      expect(alteracoes[0].nome).toBe('Thorin o Bravo');
      expect(alteracoes[1].nome).toBe('Elara a Sábia');
    });

    it('deve retornar array vazio quando dashboard é null', () => {
      const { component } = configurarTestBed(false);

      expect(component['ultimasAlteracoes']()).toEqual([]);
    });
  });

  // ----------------------------------------------------------
  // verFicha()
  // ----------------------------------------------------------

  describe('verFicha()', () => {
    it('deve navegar para a rota da ficha do mestre', () => {
      const { component, routerMock } = configurarTestBed(true);

      component.verFicha(10);

      expect(routerMock.navigate).toHaveBeenCalledWith(['/mestre/fichas', 10]);
    });
  });

  // ----------------------------------------------------------
  // formatarData()
  // ----------------------------------------------------------

  describe('formatarData()', () => {
    it('deve formatar uma data ISO em formato pt-BR', () => {
      const { component } = configurarTestBed(true);

      const resultado = component['formatarData']('2026-04-10T14:30:00');

      expect(resultado).toMatch(/10\/04\/2026/);
    });

    it('deve retornar string vazia para input vazio', () => {
      const { component } = configurarTestBed(true);

      expect(component['formatarData']('')).toBe('');
    });
  });

  // ----------------------------------------------------------
  // currentGameName (computed)
  // ----------------------------------------------------------

  describe('currentGameName()', () => {
    it('deve retornar o nome do jogo atual quando selecionado', () => {
      const { component } = configurarTestBed(true);

      expect(component['currentGameName']()).toBe('Campanha Épica');
    });

    it('deve retornar null quando não há jogo selecionado', () => {
      const { component } = configurarTestBed(false);

      expect(component['currentGameName']()).toBeNull();
    });
  });
});
