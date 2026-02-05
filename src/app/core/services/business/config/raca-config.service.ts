import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Raca } from '../../../models';
import { BaseConfigService } from './base-config.service';

/**
 * Business Service para Raças
 * Gerencia configurações de raças de personagem
 */
@Injectable({ providedIn: 'root' })
export class RacaConfigService extends BaseConfigService<Raca> {

  protected getEndpointName(): string {
    return 'Raças';
  }

  protected getApiListMethod(): (jogoId: number) => Observable<Raca[]> {
    return this.configApi.listRacas.bind(this.configApi);
  }

  protected getApiCreateMethod(): (data: any) => Observable<Raca> {
    return this.configApi.createRaca.bind(this.configApi);
  }

  protected getApiUpdateMethod(): (id: number, data: any) => Observable<Raca> {
    return this.configApi.updateRaca.bind(this.configApi);
  }

  protected getApiDeleteMethod(): (id: number) => Observable<void> {
    return this.configApi.deleteRaca.bind(this.configApi);
  }
}
