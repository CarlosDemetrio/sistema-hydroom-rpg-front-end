import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LimitadorConfig } from '../../../models';
import { BaseConfigService } from './base-config.service';

/**
 * Business Service para Limitadores
 * Gerencia configurações de limitadores (penalidades)
 */
@Injectable({ providedIn: 'root' })
export class LimitadorConfigService extends BaseConfigService<LimitadorConfig> {

  protected getEndpointName(): string {
    return 'Limitadores';
  }

  protected getApiListMethod(): (jogoId: number) => Observable<LimitadorConfig[]> {
    return this.configApi.listLimitadores.bind(this.configApi);
  }

  protected getApiCreateMethod(): (data: any) => Observable<LimitadorConfig> {
    return this.configApi.createLimitador.bind(this.configApi);
  }

  protected getApiUpdateMethod(): (id: number, data: any) => Observable<LimitadorConfig> {
    return this.configApi.updateLimitador.bind(this.configApi);
  }

  protected getApiDeleteMethod(): (id: number) => Observable<void> {
    return this.configApi.deleteLimitador.bind(this.configApi);
  }
}
