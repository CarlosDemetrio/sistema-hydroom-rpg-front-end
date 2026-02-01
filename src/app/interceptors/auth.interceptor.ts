import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Interceptor de autenticação.
 * - Adiciona withCredentials para enviar cookies (session + CSRF)
 * - Adiciona CSRF token nos métodos não-safe (POST, PUT, DELETE, PATCH)
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Pegar CSRF token do cookie
  const csrfToken = getCookie('XSRF-TOKEN');

  // Clone request com credentials
  let authReq = req.clone({
    withCredentials: true
  });

  // Adicionar CSRF token para métodos não-safe (POST, PUT, DELETE, PATCH)
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method) && csrfToken) {
    authReq = authReq.clone({
      setHeaders: {
        'X-XSRF-TOKEN': csrfToken
      }
    });
  }

  return next(authReq);
};

/**
 * Utility function para pegar cookie por nome.
 * @param name Nome do cookie
 * @returns Valor do cookie ou null
 */
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}
