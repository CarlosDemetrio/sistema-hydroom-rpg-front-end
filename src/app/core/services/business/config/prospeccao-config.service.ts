import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DadoProspeccaoConfig } from '../../../models/config.models';
import { BaseConfigService } from './base-config.service';

/**
 * Business Service para Dados de Prospecção.
 * ProspeccaoConfig is now DadoProspeccaoConfig aligned with backend.
 */
@Injectable({ providedIn: 'root' })
export class ProspeccaoConfigService extends BaseConfigService<DadoProspeccaoConfig> {

  protected getEndpointName(): string {
    return 'Dados de Prospecção';
  }

  protected getApiListMethod(): (jogoId: number) => Observable<DadoProspeccaoConfig[]> {
    return this.configApi.listDadosProspeccao.bind(this.configApi);
  }

  protected getApiCreateMethod(): (data: any) => Observable<DadoProspeccaoConfig> {
    return this.configApi.createDadoProspeccao.bind(this.configApi);
  }

  protected getApiUpdateMethod(): (id: number, data: any) => Observable<DadoProspeccaoConfig> {
    return this.configApi.updateDadoProspeccao.bind(this.configApi);
  }

  protected getApiDeleteMethod(): (id: number) => Observable<void> {
    return this.configApi.deleteDadoProspeccao.bind(this.configApi);
  }
}
