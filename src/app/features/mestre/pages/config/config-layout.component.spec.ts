/**
 * ConfigLayoutComponent — Spec
 *
 * Testa o seletor de jogo no header do layout de configurações.
 * Usa overrideTemplate para evitar dependências de sub-componentes PrimeNG
 * e ConfigSidebarComponent com inputs.required() em JIT.
 */
import { TestBed } from '@angular/core/testing';
import { render, screen } from '@testing-library/angular';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { ConfigLayoutComponent } from './config-layout.component';
import { CurrentGameService } from '@core/services/current-game.service';
import { JogoBusinessService } from '@core/services/business/jogo-business.service';
import { JogoResumo } from '@core/models/jogo.model';

// ============================================================
// Dados de teste
// ============================================================

const jogo1Mock: JogoResumo = {
  id: 10,
  nome: 'Campanha Principal',
  descricao: null,
  totalParticipantes: 4,
  ativo: true,
  meuRole: 'MESTRE',
};

const jogo2Mock: JogoResumo = {
  id: 20,
  nome: 'Segunda Campanha',
  descricao: null,
  totalParticipantes: 2,
  ativo: true,
  meuRole: 'MESTRE',
};

// ============================================================
// Helpers de mock
// ============================================================

function criarCurrentGameServiceMock(
  jogos: JogoResumo[] = [jogo1Mock, jogo2Mock],
  jogoSelecionadoId: number | null = 10,
) {
  const jogoSelecionado = jogoSelecionadoId !== null
    ? jogos.find(j => j.id === jogoSelecionadoId) ?? null
    : null;

  return {
    availableGames:  signal(jogos).asReadonly(),
    hasCurrentGame:  () => jogoSelecionado !== null,
    currentGame:     () => jogoSelecionado,
    currentGameId:   () => jogoSelecionadoId,
    selectGame:      vi.fn(),
    clearGame:       vi.fn(),
    reconcileSelection: vi.fn(),
  };
}

function criarJogoBusinessServiceMock() {
  return {
    loadJogos: vi.fn().mockReturnValue(of([jogo1Mock, jogo2Mock])),
  };
}

// Template stub — isola o componente de deps externas (RouterOutlet, ConfigSidebar, PrimeNG)
const TEMPLATE_STUB = `
  <div id="config-layout-stub">
    <div id="header">
      <h1>Configurações do Sistema</h1>

      @if (availableGames().length === 0) {
        <span id="sem-jogos">Nenhum jogo ativo disponível</span>
      }

      @if (hasCurrentGame()) {
        <span id="jogo-selecionado">{{ selectedGameId() }}</span>
      } @else {
        <span id="sem-selecao">Sem jogo selecionado</span>
      }
    </div>

    <div id="content-area">conteúdo</div>
  </div>
`;

async function renderLayout(
  jogos: JogoResumo[] = [jogo1Mock, jogo2Mock],
  jogoSelecionadoId: number | null = 10,
) {
  const currentGameMock  = criarCurrentGameServiceMock(jogos, jogoSelecionadoId);
  const jogoBusinessMock = criarJogoBusinessServiceMock();

  const result = await render(ConfigLayoutComponent, {
    configureTestBed: (tb) => {
      tb.overrideTemplate(ConfigLayoutComponent, TEMPLATE_STUB);
    },
    providers: [
      { provide: CurrentGameService,   useValue: currentGameMock },
      { provide: JogoBusinessService,  useValue: jogoBusinessMock },
    ],
  });

  return { ...result, currentGameMock, jogoBusinessMock };
}

// ============================================================
// Testes
// ============================================================

describe('ConfigLayoutComponent', () => {

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  // ----------------------------------------------------------
  // 1. Renderização básica
  // ----------------------------------------------------------

  describe('renderização', () => {
    it('deve renderizar o título de configurações', async () => {
      await renderLayout();

      expect(screen.getByText('Configurações do Sistema')).toBeTruthy();
    });

    it('deve renderizar o id do jogo selecionado quando há seleção', async () => {
      await renderLayout([jogo1Mock, jogo2Mock], 10);

      expect(screen.getByText('10')).toBeTruthy();
    });

    it('deve exibir "Sem jogo selecionado" quando não há seleção', async () => {
      await renderLayout([jogo1Mock, jogo2Mock], null);

      expect(screen.getByText('Sem jogo selecionado')).toBeTruthy();
    });

    it('deve exibir mensagem quando não há jogos disponíveis', async () => {
      await renderLayout([], null);

      expect(screen.getByText('Nenhum jogo ativo disponível')).toBeTruthy();
    });
  });

  // ----------------------------------------------------------
  // 2. Seleção de jogo
  // ----------------------------------------------------------

  describe('seleção de jogo', () => {
    it('deve chamar selectGame ao trocar o jogo', async () => {
      const { fixture, currentGameMock } = await renderLayout();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.onGameChange(20);

      expect(currentGameMock.selectGame).toHaveBeenCalledWith(20);
    });

    it('deve chamar clearGame ao receber null', async () => {
      const { fixture, currentGameMock } = await renderLayout();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.onGameChange(null);

      expect(currentGameMock.clearGame).toHaveBeenCalled();
    });

    it('selectedGameId deve refletir o jogo atual', async () => {
      const { fixture } = await renderLayout([jogo1Mock, jogo2Mock], 10);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      expect(comp.selectedGameId()).toBe(10);
    });

    it('selectedGameId deve ser null quando não há seleção', async () => {
      const { fixture } = await renderLayout([jogo1Mock, jogo2Mock], null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      expect(comp.selectedGameId()).toBeNull();
    });
  });

  // ----------------------------------------------------------
  // 3. Carregamento de jogos no ngOnInit
  // ----------------------------------------------------------

  describe('ngOnInit — carregamento de jogos', () => {
    it('deve chamar loadJogos quando a lista está vazia ao inicializar', async () => {
      const { jogoBusinessMock } = await renderLayout([], null);

      expect(jogoBusinessMock.loadJogos).toHaveBeenCalled();
    });

    it('não deve chamar loadJogos quando a lista já tem jogos', async () => {
      const { jogoBusinessMock } = await renderLayout([jogo1Mock, jogo2Mock], 10);

      expect(jogoBusinessMock.loadJogos).not.toHaveBeenCalled();
    });

    it('deve chamar reconcileSelection após loadJogos', async () => {
      const { currentGameMock } = await renderLayout([], null);

      expect(currentGameMock.reconcileSelection).toHaveBeenCalled();
    });
  });

  // ----------------------------------------------------------
  // 4. Sinais reativos
  // ----------------------------------------------------------

  describe('sinais reativos', () => {
    it('availableGames deve conter os jogos disponíveis', async () => {
      const { fixture } = await renderLayout([jogo1Mock, jogo2Mock], 10);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      expect(comp.availableGames()).toHaveLength(2);
    });

    it('hasCurrentGame deve ser true quando há jogo selecionado', async () => {
      const { fixture } = await renderLayout([jogo1Mock], 10);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      expect(comp.hasCurrentGame()).toBe(true);
    });

    it('hasCurrentGame deve ser false quando não há jogo selecionado', async () => {
      const { fixture } = await renderLayout([jogo1Mock, jogo2Mock], null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      expect(comp.hasCurrentGame()).toBe(false);
    });
  });
});
