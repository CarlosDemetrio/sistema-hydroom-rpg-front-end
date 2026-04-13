import { TestBed } from '@angular/core/testing';
import { UrlTree, provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { Observable, of, firstValueFrom } from 'rxjs';
import { vi } from 'vitest';

import { currentGameGuard } from './current-game.guard';
import { CurrentGameService } from '@core/services/current-game.service';
import { JogoBusinessService } from '@core/services/business/jogo-business.service';

function createCurrentGameServiceMock(initialHasCurrentGame = false) {
  const hasCurrentGameSignal = signal(initialHasCurrentGame);

  return {
    hasCurrentGame: hasCurrentGameSignal.asReadonly(),
    reconcileSelection: vi.fn(),
    __setHasCurrentGame(value: boolean) {
      hasCurrentGameSignal.set(value);
    },
  };
}

function createJogoBusinessServiceMock() {
  return {
    loadJogos: vi.fn().mockReturnValue(of([])),
  };
}

describe('currentGameGuard', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.clearAllMocks();
  });

  async function executeGuard(options?: {
    currentGameService?: ReturnType<typeof createCurrentGameServiceMock>;
    jogoBusinessService?: ReturnType<typeof createJogoBusinessServiceMock>;
  }) {
    const currentGameService = options?.currentGameService ?? createCurrentGameServiceMock();
    const jogoBusinessService = options?.jogoBusinessService ?? createJogoBusinessServiceMock();

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: CurrentGameService, useValue: currentGameService },
        { provide: JogoBusinessService, useValue: jogoBusinessService },
      ],
    });

    const result = await TestBed.runInInjectionContext(() =>
      firstValueFrom(
        currentGameGuard({} as never, {} as never) as Observable<boolean | UrlTree>
      )
    );

    return { result, currentGameService, jogoBusinessService };
  }

  it('deve permitir acesso quando ha jogo atual valido apos carregar os jogos', async () => {
    const currentGameService = createCurrentGameServiceMock(false);
    currentGameService.reconcileSelection.mockImplementation(() => {
      currentGameService.__setHasCurrentGame(true);
    });

    const { result, jogoBusinessService } = await executeGuard({ currentGameService });

    expect(jogoBusinessService.loadJogos).toHaveBeenCalledOnce();
    expect(currentGameService.reconcileSelection).toHaveBeenCalledOnce();
    expect(result).toBe(true);
  });

  it('deve redirecionar para /mestre/jogos quando nao houver jogo atual valido', async () => {
    const currentGameService = createCurrentGameServiceMock(false);

    const { result, jogoBusinessService } = await executeGuard({ currentGameService });

    expect(jogoBusinessService.loadJogos).toHaveBeenCalledOnce();
    expect(currentGameService.reconcileSelection).toHaveBeenCalledOnce();
    expect(result).toBeInstanceOf(UrlTree);
    expect((result as UrlTree).toString()).toBe('/mestre/jogos');
  });
});
