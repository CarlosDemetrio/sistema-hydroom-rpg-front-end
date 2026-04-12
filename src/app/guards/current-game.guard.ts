import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { CurrentGameService } from '@core/services';
import { JogoBusinessService } from '@core/services/business/jogo-business.service';
import { map } from 'rxjs/operators';

/**
 * Current Game Guard
 *
 * Bloqueia acesso a rotas que requerem um jogo selecionado
 * Usado principalmente para configurações do sistema
 */
export const currentGameGuard: CanActivateFn = () => {
  const currentGameService = inject(CurrentGameService);
  const jogoBusinessService = inject(JogoBusinessService);
  const router = inject(Router);

  return jogoBusinessService.loadJogos().pipe(
    map(() => {
      currentGameService.reconcileSelection();

      if (currentGameService.hasCurrentGame()) {
        return true;
      }

      return router.createUrlTree(['/mestre/jogos']);
    })
  );
};
