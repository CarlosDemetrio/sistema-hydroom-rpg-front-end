import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PresencaConfig } from '../../../models';
import { BaseConfigService } from './base-config.service';

/**
 * Business Service para Presenças
 * Gerencia configurações de presenças/auras
 */
@Injectable({ providedIn: 'root' })
export class PresencaConfigService extends BaseConfigService<PresencaConfig> {

  protected getEndpointName(): string {
    return 'Presenças';
  }

  protected getApiListMethod(): (jogoId: number) => Observable<PresencaConfig[]> {
    return this.configApi.listPresencas.bind(this.configApi);
  }

  protected getApiCreateMethod(): (data: any) => Observable<PresencaConfig> {
    return this.configApi.createPresenca.bind(this.configApi);
  }

  protected getApiUpdateMethod(): (id: number, data: any) => Observable<PresencaConfig> {
    return this.configApi.updatePresenca.bind(this.configApi);
  }

  protected getApiDeleteMethod(): (id: number) => Observable<void> {
    return this.configApi.deletePresenca.bind(this.configApi);
  }
}
