import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RaridadeItemConfig, CreateRaridadeItemDto, UpdateRaridadeItemDto } from '@core/models/raridade-item-config.model';
import { BaseConfigService } from './base-config.service';

/**
 * Business Service para Raridades de Item.
 * Gerencia as raridades disponíveis no jogo (Comum, Incomum, Raro, etc.).
 * Endpoint: /api/v1/configuracoes/raridades-item
 */
@Injectable({ providedIn: 'root' })
export class RaridadeItemConfigService extends BaseConfigService<RaridadeItemConfig> {

  protected getEndpointName(): string {
    return 'Raridades de Item';
  }

  protected getApiListMethod(): (jogoId: number) => Observable<RaridadeItemConfig[]> {
    return (jogoId) => this.configApi.listRaridadesItem(jogoId);
  }

  protected getApiCreateMethod(): (data: CreateRaridadeItemDto) => Observable<RaridadeItemConfig> {
    return (data) => this.configApi.createRaridadeItem(data);
  }

  protected getApiUpdateMethod(): (id: number, data: UpdateRaridadeItemDto) => Observable<RaridadeItemConfig> {
    return (id, data) => this.configApi.updateRaridadeItem(id, data);
  }

  protected getApiDeleteMethod(): (id: number) => Observable<void> {
    return (id) => this.configApi.deleteRaridadeItem(id);
  }
}
