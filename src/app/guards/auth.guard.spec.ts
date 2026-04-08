import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { vi } from 'vitest';
import { authGuard } from './auth.guard';
import { AuthService } from '@services/auth.service';
import type { UserInfo } from '@services/auth.service';

const userStub: UserInfo = { name: 'Mestre', email: 'mestre@test.com', role: 'MESTRE' };

function buildRoute() {
  return {} as any;
}

function buildState(url: string) {
  return { url } as any;
}

async function runGuard(url: string): Promise<boolean> {
  const result = TestBed.runInInjectionContext(() => authGuard(buildRoute(), buildState(url)));
  return firstValueFrom(result as any);
}

describe('authGuard', () => {
  let authServiceMock: { getUserInfo: ReturnType<typeof vi.fn>; setCurrentUser: ReturnType<typeof vi.fn> };
  let routerMock: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authServiceMock = { getUserInfo: vi.fn(), setCurrentUser: vi.fn() };
    routerMock = { navigate: vi.fn() };
    sessionStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });
  });

  it('permite acesso quando usuário está autenticado', async () => {
    authServiceMock.getUserInfo.mockReturnValue(of(userStub));
    const result = await runGuard('/mestre/config');
    expect(result).toBe(true);
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('redireciona para /login quando não autenticado (catchError)', async () => {
    authServiceMock.getUserInfo.mockReturnValue(throwError(() => new Error('401')));
    const result = await runGuard('/mestre/config/atributos');
    expect(result).toBe(false);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('salva state.url no sessionStorage ao redirecionar sem sessão', async () => {
    authServiceMock.getUserInfo.mockReturnValue(throwError(() => new Error('401')));
    await runGuard('/mestre/config/atributos');
    expect(sessionStorage.getItem('REDIRECT_URL')).toBe('/mestre/config/atributos');
  });

  it('não salva REDIRECT_URL quando url é /login (evita loop)', async () => {
    authServiceMock.getUserInfo.mockReturnValue(throwError(() => new Error('401')));
    await runGuard('/login');
    expect(sessionStorage.getItem('REDIRECT_URL')).toBeNull();
  });
});
