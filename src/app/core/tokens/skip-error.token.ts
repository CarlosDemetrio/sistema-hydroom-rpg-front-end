import { HttpContextToken } from '@angular/common/http';

/**
 * Token para sinalizar ao ErrorInterceptor que a request não deve disparar
 * toast genérico de erro. O caller assume responsabilidade pelo tratamento.
 *
 * Uso:
 * ```ts
 * import { HttpContext } from '@angular/common/http';
 * import { SKIP_ERROR_INTERCEPTOR } from '@core/tokens/skip-error.token';
 *
 * this.http.get('/api/v1/auth/me', {
 *   context: new HttpContext().set(SKIP_ERROR_INTERCEPTOR, true)
 * });
 * ```
 *
 * Default: `false` (interceptor age normalmente).
 */
export const SKIP_ERROR_INTERCEPTOR = new HttpContextToken<boolean>(() => false);
