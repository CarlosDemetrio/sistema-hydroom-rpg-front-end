import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HttpClient, HttpContext, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { errorInterceptor } from './error.interceptor';
import { ToastService } from '@services/toast.service';
import { SKIP_ERROR_INTERCEPTOR } from '@core/tokens/skip-error.token';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let toastService: {
    info: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
    warning: ReturnType<typeof vi.fn>;
    success: ReturnType<typeof vi.fn>;
  };
  let router: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    toastService = {
      info: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      success: vi.fn()
    };
    router = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: ToastService, useValue: toastService },
        { provide: Router, useValue: router }
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  describe('401 Unauthorized', () => {
    it('dispara toast.info com mensagem de sessão e navega para /login', () => {
      http.get('/api/v1/jogos').subscribe({ error: () => {} });
      httpMock.expectOne('/api/v1/jogos').flush(null, { status: 401, statusText: 'Unauthorized' });

      expect(toastService.info).toHaveBeenCalledWith(expect.stringContaining('sess'));
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
      expect(toastService.error).not.toHaveBeenCalled();
    });
  });

  describe('403 Forbidden', () => {
    it('navega para /unauthorized sem toast', () => {
      http.get('/api/v1/jogos').subscribe({ error: () => {} });
      httpMock.expectOne('/api/v1/jogos').flush(null, { status: 403, statusText: 'Forbidden' });

      expect(router.navigate).toHaveBeenCalledWith(['/unauthorized']);
      expect(toastService.error).not.toHaveBeenCalled();
      expect(toastService.info).not.toHaveBeenCalled();
    });
  });

  describe('status 0 (rede/CORS)', () => {
    it('dispara toast.error com mensagem de conexão e não navega', () => {
      http.get('/api/v1/jogos').subscribe({ error: () => {} });
      httpMock.expectOne('/api/v1/jogos').error(new ProgressEvent('error'), { status: 0 });

      expect(toastService.error).toHaveBeenCalledWith(expect.stringContaining('conex'));
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('404 Not Found', () => {
    it('dispara toast.warning com mensagem de recurso não encontrado', () => {
      http.get('/api/v1/jogos/999').subscribe({ error: () => {} });
      httpMock.expectOne('/api/v1/jogos/999').flush(null, { status: 404, statusText: 'Not Found' });

      expect(toastService.warning).toHaveBeenCalled();
      expect(toastService.error).not.toHaveBeenCalled();
    });
  });

  describe('500 Internal Server Error', () => {
    it('dispara toast.error com mensagem do backend quando fornecida', () => {
      http.get('/api/v1/jogos').subscribe({ error: () => {} });
      httpMock.expectOne('/api/v1/jogos').flush(
        { message: 'Erro de banco de dados' },
        { status: 500, statusText: 'Server Error' }
      );

      expect(toastService.error).toHaveBeenCalledWith('Erro de banco de dados');
    });

    it('usa mensagem genérica com status quando backend não fornece message', () => {
      http.get('/api/v1/jogos').subscribe({ error: () => {} });
      httpMock.expectOne('/api/v1/jogos').flush(null, { status: 500, statusText: 'Server Error' });

      expect(toastService.error).toHaveBeenCalledWith(expect.stringContaining('500'));
    });

    it('usa campo error do backend como fallback quando message não está presente', () => {
      http.get('/api/v1/jogos').subscribe({ error: () => {} });
      httpMock.expectOne('/api/v1/jogos').flush(
        { error: 'Internal Server Error' },
        { status: 500, statusText: 'Server Error' }
      );

      expect(toastService.error).toHaveBeenCalledWith('Internal Server Error');
    });
  });

  describe('4xx genérico', () => {
    it('dispara toast.error com mensagem de status para erros 4xx não mapeados', () => {
      http.get('/api/v1/jogos').subscribe({ error: () => {} });
      httpMock.expectOne('/api/v1/jogos').flush(null, { status: 422, statusText: 'Unprocessable Entity' });

      expect(toastService.error).toHaveBeenCalledWith(expect.stringContaining('422'));
    });
  });

  describe('SKIP_ERROR_INTERCEPTOR', () => {
    it('não dispara nenhum toast quando token é true (401)', () => {
      const ctx = new HttpContext().set(SKIP_ERROR_INTERCEPTOR, true);
      http.get('/api/v1/auth/me', { context: ctx }).subscribe({ error: () => {} });
      httpMock.expectOne('/api/v1/auth/me').flush(null, { status: 401, statusText: 'Unauthorized' });

      expect(toastService.info).not.toHaveBeenCalled();
      expect(toastService.error).not.toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('não dispara nenhum toast quando token é true (500)', () => {
      const ctx = new HttpContext().set(SKIP_ERROR_INTERCEPTOR, true);
      http.get('/api/v1/auth/me', { context: ctx }).subscribe({ error: () => {} });
      httpMock.expectOne('/api/v1/auth/me').flush(
        { message: 'Erro interno' },
        { status: 500, statusText: 'Server Error' }
      );

      expect(toastService.error).not.toHaveBeenCalled();
      expect(toastService.info).not.toHaveBeenCalled();
    });
  });

  describe('requests com sucesso', () => {
    it('passa transparente sem disparar toast em 200', () => {
      let result: unknown;
      http.get('/api/v1/jogos').subscribe(r => (result = r));
      httpMock.expectOne('/api/v1/jogos').flush([{ id: 1, nome: 'Jogo Teste' }]);

      expect(result).toEqual([{ id: 1, nome: 'Jogo Teste' }]);
      expect(toastService.error).not.toHaveBeenCalled();
      expect(toastService.info).not.toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });
});
