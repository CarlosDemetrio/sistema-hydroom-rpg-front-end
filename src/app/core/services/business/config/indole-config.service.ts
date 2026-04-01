import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IndoleConfig } from '@core/models';
import { BaseConfigService } from './base-config.service';

/**
 * Business Service para Índoles
 * Gerencia configurações de índoles/alinhamentos de personagem
 */
@Injectable({ providedIn: 'root' })
export class IndoleConfigService extends BaseConfigService<IndoleConfig> {

  protected getEndpointName(): string {
    return 'Índoles';
  }

  protected getApiListMethod(): (jogoId: number) => Observable<IndoleConfig[]> {
    return this.configApi.listIndoles.bind(this.configApi);
  }

  protected getApiCreateMethod(): (data: any) => Observable<IndoleConfig> {
    return this.configApi.createIndole.bind(this.configApi);
  }

  protected getApiUpdateMethod(): (id: number, data: any) => Observable<IndoleConfig> {
    return this.configApi.updateIndole.bind(this.configApi);
  }

  protected getApiDeleteMethod(): (id: number) => Observable<void> {
    return this.configApi.deleteIndole.bind(this.configApi);
  }
}
