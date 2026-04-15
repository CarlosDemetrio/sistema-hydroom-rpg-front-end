import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TipoItemConfig, CreateTipoItemDto, UpdateTipoItemDto } from '@core/models/tipo-item-config.model';
import { BaseConfigService } from './base-config.service';

/**
 * Business Service para Tipos de Item.
 * Gerencia os tipos de itens disponíveis no jogo (Espada, Arco, Poção, etc.).
 * Endpoint: /api/v1/configuracoes/tipos-item
 */
@Injectable({ providedIn: 'root' })
export class TipoItemConfigService extends BaseConfigService<TipoItemConfig> {

  protected getEndpointName(): string {
    return 'Tipos de Item';
  }

  protected getApiListMethod(): (jogoId: number) => Observable<TipoItemConfig[]> {
    return (jogoId) => this.configApi.listTiposItem(jogoId);
  }

  protected getApiCreateMethod(): (data: CreateTipoItemDto) => Observable<TipoItemConfig> {
    return (data) => this.configApi.createTipoItem(data);
  }

  protected getApiUpdateMethod(): (id: number, data: UpdateTipoItemDto) => Observable<TipoItemConfig> {
    return (id, data) => this.configApi.updateTipoItem(id, data);
  }

  protected getApiDeleteMethod(): (id: number) => Observable<void> {
    return (id) => this.configApi.deleteTipoItem(id);
  }
}
