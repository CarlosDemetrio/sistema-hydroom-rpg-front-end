import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProspeccaoConfig } from '../../../models';
import { BaseConfigService } from './base-config.service';

/**
 * Business Service para Prospecção
 * Gerencia configurações de dados de prospecção
 */
@Injectable({ providedIn: 'root' })
export class ProspeccaoConfigService extends BaseConfigService<ProspeccaoConfig> {

  protected getEndpointName(): string {
    return 'Prospecção';
  }

  protected getApiListMethod(): (jogoId: number) => Observable<ProspeccaoConfig[]> {
    return this.configApi.listProspeccao.bind(this.configApi);
  }

  protected getApiCreateMethod(): (data: any) => Observable<ProspeccaoConfig> {
    return this.configApi.createProspeccao.bind(this.configApi);
  }

  protected getApiUpdateMethod(): (id: number, data: any) => Observable<ProspeccaoConfig> {
    return this.configApi.updateProspeccao.bind(this.configApi);
  }

  protected getApiDeleteMethod(): (id: number) => Observable<void> {
    return this.configApi.deleteProspeccao.bind(this.configApi);
  }
}
