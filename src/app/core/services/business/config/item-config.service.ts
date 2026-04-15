import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ItemConfigResumo,
  ItemConfigResponse,
  CreateItemConfigDto,
  UpdateItemConfigDto,
} from '@core/models/item-config.model';
import { BaseConfigService } from './base-config.service';

/**
 * Business Service para Itens de Configuração.
 * Gerencia o catálogo de itens disponíveis no jogo.
 * Endpoint: /api/v1/configuracoes/itens
 *
 * Nota: loadItems busca até 200 itens em uma única página.
 * Para paginação server-side, usar configApi.listItens() diretamente.
 */
@Injectable({ providedIn: 'root' })
export class ItemConfigService extends BaseConfigService<ItemConfigResumo> {

  protected getEndpointName(): string {
    return 'Itens';
  }

  protected getApiListMethod(): (jogoId: number) => Observable<ItemConfigResumo[]> {
    return (jogoId) =>
      this.configApi.listItens(jogoId, 0, 200).pipe(
        map((page) => page.content)
      );
  }

  protected getApiCreateMethod(): (data: CreateItemConfigDto) => Observable<ItemConfigResumo> {
    return (data) => this.configApi.createItem(data) as Observable<ItemConfigResumo>;
  }

  protected getApiUpdateMethod(): (id: number, data: UpdateItemConfigDto) => Observable<ItemConfigResumo> {
    return (id, data) => this.configApi.updateItem(id, data) as Observable<ItemConfigResumo>;
  }

  protected getApiDeleteMethod(): (id: number) => Observable<void> {
    return (id) => this.configApi.deleteItem(id);
  }

  /** Busca item completo (com efeitos e requisitos) */
  getItem(id: number): Observable<ItemConfigResponse> {
    return this.configApi.getItem(id);
  }
}
