import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AptidaoConfig } from '../../../models';
import { BaseConfigService } from './base-config.service';

/**
 * Business Service para Aptidões
 * Gerencia configurações de aptidões/habilidades
 */
@Injectable({ providedIn: 'root' })
export class AptidaoConfigService extends BaseConfigService<AptidaoConfig> {

  protected getEndpointName(): string {
    return 'Aptidões';
  }

  protected getApiListMethod(): (jogoId: number) => Observable<AptidaoConfig[]> {
    return this.configApi.listAptidoes.bind(this.configApi);
  }

  protected getApiCreateMethod(): (data: any) => Observable<AptidaoConfig> {
    return this.configApi.createAptidao.bind(this.configApi);
  }

  protected getApiUpdateMethod(): (id: number, data: any) => Observable<AptidaoConfig> {
    return this.configApi.updateAptidao.bind(this.configApi);
  }

  protected getApiDeleteMethod(): (id: number) => Observable<void> {
    return this.configApi.deleteAptidao.bind(this.configApi);
  }
}
