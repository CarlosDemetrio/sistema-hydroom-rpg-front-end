import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { CurrentGameService } from '@core/services';

/**
 * Current Game Guard
 *
 * Bloqueia acesso a rotas que requerem um jogo selecionado
 * Usado principalmente para configurações do sistema
 */
export const currentGameGuard: CanActivateFn = () => {
  const currentGameService = inject(CurrentGameService);
  const router = inject(Router);

  if (currentGameService.hasCurrentGame()) {
    return true;
  }

  // Redireciona para lista de jogos se não houver jogo selecionado
  router.navigate(['/mestre/jogos']);
  return false;
};
