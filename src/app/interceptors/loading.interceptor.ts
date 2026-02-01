import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

/**
 * Loading Interceptor
 *
 * Intercepta TODAS as requisições HTTP e gerencia loading automaticamente
 * - Mostra loading ao iniciar requisição
 * - Esconde loading ao finalizar (sucesso ou erro)
 */
export const loadingInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const loadingService = inject(LoadingService);

  // Ignora requisições que não queremos mostrar loading
  if (req.url.includes('/ping') || req.url.includes('/health')) {
    return next(req);
  }

  loadingService.show();

  return next(req).pipe(
    finalize(() => loadingService.hide())
  );
};
