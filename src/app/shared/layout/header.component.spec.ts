/**
 * HeaderComponent (layout) — Spec
 *
 * Cobre o método hasBothRoles() que determina se o seletor "Visualizar como"
 * deve aparecer para o usuário autenticado.
 *
 * Regra de negócio MVP: UserInfo.role é string única — um usuário só pode ter
 * uma role (MESTRE ou JOGADOR), nunca ambas. Portanto, hasBothRoles() deve
 * sempre retornar false. O seletor "Visualizar como" não deve aparecer.
 *
 * Cenários cobertos:
 * 1. Usuário com role MESTRE: hasBothRoles() === false
 * 2. Usuário com role JOGADOR: hasBothRoles() === false
 * 3. Usuário sem role definida: hasBothRoles() === false
 * 4. Usuário não autenticado (null): hasBothRoles() === false
 * 5. Seletor "Visualizar como" não aparece no template para nenhum dos casos
 */

import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { render, screen } from '@testing-library/angular';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { HeaderComponent } from './header.component';
import { AuthService, UserInfo } from '@services/auth.service';
import { CurrentGameService } from '@core/services/current-game.service';
import { JogoBusinessService } from '@core/services/business/jogo-business.service';
import { JogoResumo } from '@core/models/jogo.model';

// ================================================================
// Helpers
// ================================================================

function createMockAuthService(userOverride: UserInfo | null = null) {
  const currentUserSignal = signal<UserInfo | null>(userOverride);
  return {
    currentUser: currentUserSignal.asReadonly(),
    isAuthenticated: signal(userOverride !== null).asReadonly(),
    isMestre: signal(userOverride?.role === 'MESTRE').asReadonly(),
    isJogador: signal(userOverride?.role === 'JOGADOR').asReadonly(),
    login: vi.fn(),
    logout: vi.fn().mockReturnValue({ subscribe: vi.fn() }),
  };
}

const mestreMock: UserInfo = {
  name: 'Carlos Mestre',
  email: 'mestre@example.com',
  role: 'MESTRE',
};

const jogadorMock: UserInfo = {
  name: 'Ana Jogadora',
  email: 'jogadora@example.com',
  role: 'JOGADOR',
};

const semRoleMock: UserInfo = {
  name: 'Sem Role',
  email: 'semrole@example.com',
};

const jogoAtualMock: JogoResumo = {
  id: 1,
  nome: 'Campanha dos Heróis',
  descricao: 'Uma grande aventura',
  totalParticipantes: 5,
  ativo: true,
  meuRole: 'MESTRE',
};

function createMockCurrentGameService(
  currentGame: JogoResumo | null = null,
  availableGames: JogoResumo[] = []
) {
  return {
    currentGame: signal(currentGame).asReadonly(),
    currentGameId: signal(currentGame?.id ?? null).asReadonly(),
    availableGames: signal(availableGames).asReadonly(),
    hasCurrentGame: signal(currentGame !== null).asReadonly(),
    selectGame: vi.fn(),
    clearGame: vi.fn(),
    reconcileSelection: vi.fn(),
  };
}

function createMockJogoBusinessService() {
  return {
    loadJogos: vi.fn().mockReturnValue(of([])),
    jogos: signal<JogoResumo[]>([]).asReadonly(),
  };
}

// ================================================================
// Testes
// ================================================================

describe('HeaderComponent — hasBothRoles()', () => {
  it('deve retornar false para usuário com role MESTRE', () => {
    const comp = TestBed.runInInjectionContext(() => {
      const header = new HeaderComponent();
      (header as any).authService = createMockAuthService(mestreMock);
      return header;
    });

    expect(comp.hasBothRoles()).toBe(false);
  });

  it('deve retornar false para usuário com role JOGADOR', () => {
    const comp = TestBed.runInInjectionContext(() => {
      const header = new HeaderComponent();
      (header as any).authService = createMockAuthService(jogadorMock);
      return header;
    });

    expect(comp.hasBothRoles()).toBe(false);
  });

  it('deve retornar false para usuário sem role definida', () => {
    const comp = TestBed.runInInjectionContext(() => {
      const header = new HeaderComponent();
      (header as any).authService = createMockAuthService(semRoleMock);
      return header;
    });

    expect(comp.hasBothRoles()).toBe(false);
  });

  it('deve retornar false quando usuário não está autenticado (null)', () => {
    const comp = TestBed.runInInjectionContext(() => {
      const header = new HeaderComponent();
      (header as any).authService = createMockAuthService(null);
      return header;
    });

    expect(comp.hasBothRoles()).toBe(false);
  });
});

describe('HeaderComponent — template: seletor "Visualizar como"', () => {
  async function renderWithUser(
    user: UserInfo | null,
    options?: {
      currentGameService?: ReturnType<typeof createMockCurrentGameService>;
      jogoBusinessService?: ReturnType<typeof createMockJogoBusinessService>;
    }
  ) {
    const mockAuth = createMockAuthService(user);
    const mockCurrentGame = options?.currentGameService ?? createMockCurrentGameService();
    const mockJogoBusiness = options?.jogoBusinessService ?? createMockJogoBusinessService();
    return render(HeaderComponent, {
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: mockAuth },
        { provide: CurrentGameService, useValue: mockCurrentGame },
        { provide: JogoBusinessService, useValue: mockJogoBusiness },
      ],
    });
  }

  it('não deve exibir seletor "Visualizar como" para usuário MESTRE', async () => {
    await renderWithUser(mestreMock);
    expect(screen.queryByText(/Visualizar como/i)).toBeNull();
  });

  it('não deve exibir seletor "Visualizar como" para usuário JOGADOR', async () => {
    await renderWithUser(jogadorMock);
    expect(screen.queryByText(/Visualizar como/i)).toBeNull();
  });

  it('não deve exibir seletor "Visualizar como" quando não autenticado', async () => {
    await renderWithUser(null);
    expect(screen.queryByText(/Visualizar como/i)).toBeNull();
  });

  it('deve exibir o contexto de jogo atual para usuario MESTRE', async () => {
    await renderWithUser(mestreMock, {
      currentGameService: createMockCurrentGameService(
        jogoAtualMock,
        [jogoAtualMock]
      ),
    });

    expect(screen.getByText(/Jogo atual/i)).toBeTruthy();
    expect(screen.getByText('Campanha dos Heróis')).toBeTruthy();
  });

  it('não deve exibir contexto de jogo atual para usuario JOGADOR', async () => {
    await renderWithUser(jogadorMock, {
      currentGameService: createMockCurrentGameService(
        jogoAtualMock,
        [jogoAtualMock]
      ),
    });

    expect(screen.queryByText(/Jogo atual/i)).toBeNull();
  });
});
