import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GeneroConfig } from '@core/models';
import { BaseConfigService } from './base-config.service';

/**
 * Business Service para Gêneros
 * Gerencia configurações de gêneros de personagem
 */
@Injectable({ providedIn: 'root' })
export class GeneroConfigService extends BaseConfigService<GeneroConfig> {

  protected getEndpointName(): string {
    return 'Gêneros';
  }

  protected getApiListMethod(): (jogoId: number) => Observable<GeneroConfig[]> {
    return this.configApi.listGeneros.bind(this.configApi);
  }

  protected getApiCreateMethod(): (data: any) => Observable<GeneroConfig> {
    return this.configApi.createGenero.bind(this.configApi);
  }

  protected getApiUpdateMethod(): (id: number, data: any) => Observable<GeneroConfig> {
    return this.configApi.updateGenero.bind(this.configApi);
  }

  protected getApiDeleteMethod(): (id: number) => Observable<void> {
    return this.configApi.deleteGenero.bind(this.configApi);
  }
}
