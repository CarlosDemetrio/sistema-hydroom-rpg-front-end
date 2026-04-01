import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AtributoConfig } from '@core/models';
import { BaseConfigService } from './base-config.service';

/**
 * Business Service para Atributos
 * Gerencia configurações de atributos (FOR, DES, CON, etc)
 */
@Injectable({ providedIn: 'root' })
export class AtributoConfigService extends BaseConfigService<AtributoConfig> {

  protected getEndpointName(): string {
    return 'Atributos';
  }

  protected getApiListMethod(): (jogoId: number) => Observable<AtributoConfig[]> {
    return this.configApi.listAtributos.bind(this.configApi);
  }

  protected getApiCreateMethod(): (data: any) => Observable<AtributoConfig> {
    return this.configApi.createAtributo.bind(this.configApi);
  }

  protected getApiUpdateMethod(): (id: number, data: any) => Observable<AtributoConfig> {
    return this.configApi.updateAtributo.bind(this.configApi);
  }

  protected getApiDeleteMethod(): (id: number) => Observable<void> {
    return this.configApi.deleteAtributo.bind(this.configApi);
  }
}
