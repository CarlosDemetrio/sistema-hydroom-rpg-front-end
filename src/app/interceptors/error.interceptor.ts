import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '@services/toast.service';
import { SKIP_ERROR_INTERCEPTOR } from '@core/tokens/skip-error.token';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toast = inject(ToastService);

  const skip = req.context.get(SKIP_ERROR_INTERCEPTOR);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (skip) {
        return throwError(() => error);
      }

      switch (error.status) {
        case 401:
          toast.info('Sua sessão expirou. Faça login novamente.');
          router.navigate(['/login']);
          break;
        case 403:
          router.navigate(['/unauthorized']);
          break;
        case 0:
          toast.error('Sem conexão com o servidor. Verifique sua internet.');
          break;
        case 404:
          toast.warning('Recurso não encontrado.');
          break;
        default: {
          const message = error.error?.message
            ?? error.error?.error
            ?? `Erro ${error.status}: ${error.statusText || 'Erro inesperado'}`;
          toast.error(message);
          break;
        }
      }

      return throwError(() => error);
    })
  );
};
