import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HabilidadeConfig } from '@core/models/habilidade-config.model';
import { BaseConfigService } from './base-config.service';

/**
 * Business Service para Habilidades de Configuração.
 * Gerencia ataques, técnicas e manobras disponíveis no jogo.
 * Endpoint: /api/jogos/{jogoId}/config/habilidades
 */
@Injectable({ providedIn: 'root' })
export class HabilidadeConfigService extends BaseConfigService<HabilidadeConfig> {

  protected getEndpointName(): string {
    return 'Habilidades';
  }

  protected getApiListMethod(): (jogoId: number) => Observable<HabilidadeConfig[]> {
    return (jogoId) => this.configApi.listHabilidades(jogoId);
  }

  protected getApiCreateMethod(): (data: any) => Observable<HabilidadeConfig> {
    return (data) => this.configApi.createHabilidade(data.jogoId, data);
  }

  protected getApiUpdateMethod(): (id: number, data: any) => Observable<HabilidadeConfig> {
    const jogoId = this.currentGameId()!;
    return (id, data) => this.configApi.updateHabilidade(jogoId, id, data);
  }

  protected getApiDeleteMethod(): (id: number) => Observable<void> {
    const jogoId = this.currentGameId()!;
    return (id) => this.configApi.deleteHabilidade(jogoId, id);
  }
}
