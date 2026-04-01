import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TipoAptidao } from '@core/models/tipo-aptidao.model';
import { BaseConfigService } from './base-config.service';

/**
 * Business Service para Tipos de Aptidão (Física, Mental, etc.)
 */
@Injectable({ providedIn: 'root' })
export class TipoAptidaoConfigService extends BaseConfigService<TipoAptidao> {

  protected getEndpointName(): string {
    return 'TiposAptidao';
  }

  protected getApiListMethod(): (jogoId: number) => Observable<TipoAptidao[]> {
    return this.configApi.listTiposAptidao.bind(this.configApi);
  }

  protected getApiCreateMethod(): (data: any) => Observable<TipoAptidao> {
    return this.configApi.createTipoAptidao.bind(this.configApi);
  }

  protected getApiUpdateMethod(): (id: number, data: any) => Observable<TipoAptidao> {
    return this.configApi.updateTipoAptidao.bind(this.configApi);
  }

  protected getApiDeleteMethod(): (id: number) => Observable<void> {
    return this.configApi.deleteTipoAptidao.bind(this.configApi);
  }
}
