import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MembroCorpoConfig } from '../../../models';
import { BaseConfigService } from './base-config.service';

/**
 * Business Service para Membros do Corpo
 * Gerencia configurações de membros do corpo (cabeça, braços, pernas, etc)
 */
@Injectable({ providedIn: 'root' })
export class MembroCorpoConfigService extends BaseConfigService<MembroCorpoConfig> {

  protected getEndpointName(): string {
    return 'Membros do Corpo';
  }

  protected getApiListMethod(): (jogoId: number) => Observable<MembroCorpoConfig[]> {
    return this.configApi.listMembrosCorpo.bind(this.configApi);
  }

  protected getApiCreateMethod(): (data: any) => Observable<MembroCorpoConfig> {
    return this.configApi.createMembroCorpo.bind(this.configApi);
  }

  protected getApiUpdateMethod(): (id: number, data: any) => Observable<MembroCorpoConfig> {
    return this.configApi.updateMembroCorpo.bind(this.configApi);
  }

  protected getApiDeleteMethod(): (id: number) => Observable<void> {
    return this.configApi.deleteMembroCorpo.bind(this.configApi);
  }
}
