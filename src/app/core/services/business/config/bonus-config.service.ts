import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BonusConfig } from '../../../models';
import { BaseConfigService } from './base-config.service';

/**
 * Business Service para Bônus
 * Gerencia configurações de bônus de atributos, aptidões, etc
 */
@Injectable({ providedIn: 'root' })
export class BonusConfigService extends BaseConfigService<BonusConfig> {

  protected getEndpointName(): string {
    return 'Bônus';
  }

  protected getApiListMethod(): (jogoId: number) => Observable<BonusConfig[]> {
    return this.configApi.listBonus.bind(this.configApi);
  }

  protected getApiCreateMethod(): (data: any) => Observable<BonusConfig> {
    return this.configApi.createBonus.bind(this.configApi);
  }

  protected getApiUpdateMethod(): (id: number, data: any) => Observable<BonusConfig> {
    return this.configApi.updateBonus.bind(this.configApi);
  }

  protected getApiDeleteMethod(): (id: number) => Observable<void> {
    return this.configApi.deleteBonus.bind(this.configApi);
  }
}
