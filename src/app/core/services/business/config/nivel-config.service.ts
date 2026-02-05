import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NivelConfig } from '../../../models';
import { BaseConfigService } from './base-config.service';

/**
 * Business Service para Níveis
 * Gerencia configurações de níveis de experiência
 */
@Injectable({ providedIn: 'root' })
export class NivelConfigService extends BaseConfigService<NivelConfig> {

  protected getEndpointName(): string {
    return 'Níveis';
  }

  protected getApiListMethod(): (jogoId: number) => Observable<NivelConfig[]> {
    return this.configApi.listNiveis.bind(this.configApi);
  }

  protected getApiCreateMethod(): (data: any) => Observable<NivelConfig> {
    return this.configApi.createNivel.bind(this.configApi);
  }

  protected getApiUpdateMethod(): (id: number, data: any) => Observable<NivelConfig> {
    return this.configApi.updateNivel.bind(this.configApi);
  }

  protected getApiDeleteMethod(): (id: number) => Observable<void> {
    return this.configApi.deleteNivel.bind(this.configApi);
  }
}
