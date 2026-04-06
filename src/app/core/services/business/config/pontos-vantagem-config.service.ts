import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PontosVantagemConfig } from '@core/models/config.models';
import { BaseConfigService } from './base-config.service';

/**
 * Business Service para Pontos de Vantagem por Nível.
 *
 * Gerencia a tabela esparsa de pontos de vantagem ganhos em cada nível.
 * Ausência de registro = 0 pontos no nível.
 *
 * ATENÇÃO: endpoint usa jogoId no path (mesma convenção de CategoriaVantagem),
 * diferente dos outros configs que usam ?jogoId= como query param.
 * Os métodos de create/load são sobrescritos para passar jogoId corretamente.
 */
@Injectable({ providedIn: 'root' })
export class PontosVantagemConfigService extends BaseConfigService<PontosVantagemConfig> {

  protected getEndpointName(): string {
    return 'Pontos de Vantagem';
  }

  protected getApiListMethod(): (jogoId: number) => Observable<PontosVantagemConfig[]> {
    return (jogoId: number) => this.configApi.listPontosVantagem(jogoId);
  }

  protected getApiCreateMethod(): (data: any) => Observable<PontosVantagemConfig> {
    // Não usado diretamente — createItem é sobrescrito
    return (data: any) => this.configApi.createPontosVantagem(data.jogoId, data);
  }

  protected getApiUpdateMethod(): (id: number, data: any) => Observable<PontosVantagemConfig> {
    // Não usado diretamente — updateItem é sobrescrito
    return (id: number, data: any) => this.configApi.updatePontosVantagem(data.jogoId ?? 0, id, data);
  }

  protected getApiDeleteMethod(): (id: number) => Observable<void> {
    // Não usado diretamente — deleteItem é sobrescrito
    return (id: number) => this.configApi.deletePontosVantagem(this.ensureGameSelected(), id);
  }

  /**
   * Sobrescreve para passar jogoId no path (não no body como os outros configs).
   */
  override createItem(data: Record<string, unknown>): Observable<PontosVantagemConfig> {
    const jogoId = this.ensureGameSelected();
    return this.configApi.createPontosVantagem(jogoId, {
      nivel: data['nivel'] as number,
      pontosGanhos: data['pontosGanhos'] as number,
    });
  }

  /**
   * Sobrescreve para passar jogoId no path (não como query param).
   */
  override updateItem(id: number, data: Record<string, unknown>): Observable<PontosVantagemConfig> {
    const jogoId = this.ensureGameSelected();
    return this.configApi.updatePontosVantagem(jogoId, id, {
      nivel: data['nivel'] as number | undefined,
      pontosGanhos: data['pontosGanhos'] as number | undefined,
    });
  }

  /**
   * Sobrescreve para passar jogoId no path.
   */
  override deleteItem(id: number): Observable<void> {
    const jogoId = this.ensureGameSelected();
    return this.configApi.deletePontosVantagem(jogoId, id);
  }
}
