import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { OAuthCallbackComponent } from './oauth-callback.component';
import { AuthService } from '@services/auth.service';
import { ToastService } from '@services/toast.service';

describe('OAuthCallbackComponent', () => {
  let authService: { getUserInfo: ReturnType<typeof vi.fn> };
  let router: { navigate: ReturnType<typeof vi.fn>; navigateByUrl: ReturnType<typeof vi.fn> };
  let toastService: { error: ReturnType<typeof vi.fn>; info: ReturnType<typeof vi.fn> };

  const mockUser = { name: 'Carlos', email: 'carlos@test.com' };

  beforeEach(() => {
    authService = { getUserInfo: vi.fn() };
    router = { navigate: vi.fn(), navigateByUrl: vi.fn() };
    toastService = { error: vi.fn(), info: vi.fn() };

    sessionStorage.clear();

    TestBed.configureTestingModule({
      imports: [OAuthCallbackComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
        { provide: ToastService, useValue: toastService }
      ]
    });
  });

  it('navega para /dashboard quando autenticado com sucesso (sem REDIRECT_URL)', () => {
    authService.getUserInfo.mockReturnValue(of(mockUser));

    const fixture = TestBed.createComponent(OAuthCallbackComponent);
    fixture.detectChanges();

    expect(router.navigateByUrl).toHaveBeenCalledWith('/dashboard');
    expect(toastService.error).not.toHaveBeenCalled();
  });

  it('navega para REDIRECT_URL salvo no sessionStorage quando disponível', () => {
    sessionStorage.setItem('REDIRECT_URL', '/mestre/jogos/42');
    authService.getUserInfo.mockReturnValue(of(mockUser));

    const fixture = TestBed.createComponent(OAuthCallbackComponent);
    fixture.detectChanges();

    expect(router.navigateByUrl).toHaveBeenCalledWith('/mestre/jogos/42');
  });

  it('limpa REDIRECT_URL do sessionStorage após usar', () => {
    sessionStorage.setItem('REDIRECT_URL', '/mestre/jogos/42');
    authService.getUserInfo.mockReturnValue(of(mockUser));

    TestBed.createComponent(OAuthCallbackComponent).detectChanges();

    expect(sessionStorage.getItem('REDIRECT_URL')).toBeNull();
  });

  it('exibe toast de erro e navega para /login quando autenticação falha', async () => {
    // retry({ count: 2, delay: (_, i) => timer(i * 300) }) aguarda até 900ms total
    // (300ms na 1ª retry + 600ms na 2ª retry). Usamos fake timers para controlar.
    vi.useFakeTimers();
    authService.getUserInfo.mockReturnValue(throwError(() => new Error('Auth failed')));

    const fixture = TestBed.createComponent(OAuthCallbackComponent);
    fixture.detectChanges();

    // Avançar 900ms para cobrir os dois delays do retry (300 + 600)
    await vi.advanceTimersByTimeAsync(1000);

    expect(toastService.error).toHaveBeenCalledWith(expect.stringContaining('login'));
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
    expect(router.navigateByUrl).not.toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('renderiza spinner e texto de autenticação', () => {
    authService.getUserInfo.mockReturnValue(of(mockUser));

    const fixture = TestBed.createComponent(OAuthCallbackComponent);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('p-progressspinner')).toBeTruthy();
    expect(element.textContent).toContain('Autenticando');
  });
});
