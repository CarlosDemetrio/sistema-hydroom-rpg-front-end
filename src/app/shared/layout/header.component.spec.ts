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
import { vi } from 'vitest';

import { HeaderComponent } from './header.component';
import { AuthService, UserInfo } from '@services/auth.service';

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
  async function renderWithUser(user: UserInfo | null) {
    const mockAuth = createMockAuthService(user);
    return render(HeaderComponent, {
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: mockAuth },
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
});
