import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CurrentGameService } from '@core/services/current-game.service';
import { ConfigApiService } from '@core/services/api/config-api.service';

/**
 * Classe abstrata base para todos os Business Services de configuração.
 *
 * Cada service específico estende esta classe e:
 * - Define o tipo genérico T
 * - Implementa os métodos abstratos que delegam para ConfigApiService
 */
@Injectable()
export abstract class BaseConfigService<T extends { id?: number; jogoId?: number }> {
  protected currentGameService = inject(CurrentGameService);
  protected configApi = inject(ConfigApiService);

  currentGameId = this.currentGameService.currentGameId;
  hasCurrentGame = this.currentGameService.hasCurrentGame;
  currentGame = this.currentGameService.currentGame;

  protected abstract getEndpointName(): string;
  protected abstract getApiListMethod(): (jogoId: number) => Observable<T[]>;
  protected abstract getApiCreateMethod(): (data: any) => Observable<T>;
  protected abstract getApiUpdateMethod(): (id: number, data: any) => Observable<T>;
  protected abstract getApiDeleteMethod(): (id: number) => Observable<void>;

  protected ensureGameSelected(): number {
    const jogoId = this.currentGameId();
    if (!jogoId) {
      throw new Error(
        `Nenhum jogo selecionado. Selecione um jogo no cabeçalho para gerenciar ${this.getEndpointName()}.`
      );
    }
    return jogoId;
  }

  loadItems(): Observable<T[]> {
    const jogoId = this.ensureGameSelected();
    return this.getApiListMethod()(jogoId);
  }

  createItem(data: Record<string, unknown>): Observable<T> {
    const jogoId = this.ensureGameSelected();
    const dataWithJogoId = { ...data, jogoId };
    return this.getApiCreateMethod()(dataWithJogoId);
  }

  updateItem(id: number, data: Record<string, unknown>): Observable<T> {
    return this.getApiUpdateMethod()(id, data);
  }

  deleteItem(id: number): Observable<void> {
    return this.getApiDeleteMethod()(id);
  }
}
