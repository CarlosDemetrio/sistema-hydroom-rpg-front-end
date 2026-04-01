import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { VantagemConfig } from '@core/models';
import { BaseConfigService } from './base-config.service';

/**
 * Business Service para Vantagens
 * Gerencia configurações de vantagens/perks
 */
@Injectable({ providedIn: 'root' })
export class VantagemConfigService extends BaseConfigService<VantagemConfig> {

  protected getEndpointName(): string {
    return 'Vantagens';
  }

  protected getApiListMethod(): (jogoId: number) => Observable<VantagemConfig[]> {
    return this.configApi.listVantagens.bind(this.configApi);
  }

  protected getApiCreateMethod(): (data: any) => Observable<VantagemConfig> {
    return this.configApi.createVantagem.bind(this.configApi);
  }

  protected getApiUpdateMethod(): (id: number, data: any) => Observable<VantagemConfig> {
    return this.configApi.updateVantagem.bind(this.configApi);
  }

  protected getApiDeleteMethod(): (id: number) => Observable<void> {
    return this.configApi.deleteVantagem.bind(this.configApi);
  }
}
