import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ErrorHandlerService } from '@services/error-handler.service';
import { Router } from '@angular/router';

/**
 * Error Interceptor
 *
 * Intercepta TODOS os erros HTTP e trata automaticamente
 * - 401: Redireciona para login
 * - 403: Redireciona para unauthorized
 * - 404: Mostra mensagem de não encontrado
 * - 500+: Mostra mensagem de erro do servidor
 */
export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const errorHandler = inject(ErrorHandlerService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Erro desconhecido';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Erro: ${error.error.message}`;
      } else {
        // Server-side error
        switch (error.status) {
          case 401:
            errorMessage = 'Sessão expirada. Faça login novamente.';
            router.navigate(['/login']);
            break;
          case 403:
            errorMessage = 'Você não tem permissão para acessar este recurso.';
            router.navigate(['/unauthorized']);
            break;
          case 404:
            errorMessage = 'Recurso não encontrado.';
            break;
          case 500:
            errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
            break;
          default:
            errorMessage = error.error?.message || `Erro ${error.status}: ${error.statusText}`;
        }
      }

      // Log error (pode enviar para serviço de monitoramento)
      console.error('HTTP Error:', {
        url: req.url,
        method: req.method,
        status: error.status,
        message: errorMessage,
        error
      });

      // Notifica ErrorHandlerService
      errorHandler.handleError(errorMessage);

      return throwError(() => new Error(errorMessage));
    })
  );
};
