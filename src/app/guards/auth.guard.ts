import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { map, catchError, of } from 'rxjs';

function saveRedirectUrl(url: string): void {
  if (url && url !== '/login') {
    sessionStorage.setItem('REDIRECT_URL', url);
  }
}

export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.getUserInfo().pipe(
    map((user) => {
      if (user) {
        authService.setCurrentUser(user);
        return true;
      }
      saveRedirectUrl(state.url);
      router.navigate(['/login']);
      return false;
    }),
    catchError(() => {
      saveRedirectUrl(state.url);
      router.navigate(['/login']);
      return of(false);
    })
  );
};
