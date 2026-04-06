import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CategoriaVantagem } from '@core/models/config.models';
import { BaseConfigService } from './base-config.service';

/**
 * Business Service para Categorias de Vantagem.
 *
 * ATENÇÃO: endpoint usa jogoId no path (diferente dos outros configs).
 * URL base: /api/jogos/{jogoId}/config/categorias-vantagem
 *
 * Métodos create, update e delete são sobrescritos para passar jogoId corretamente.
 */
@Injectable({ providedIn: 'root' })
export class CategoriaVantagemConfigService extends BaseConfigService<CategoriaVantagem> {

  protected getEndpointName(): string {
    return 'Categorias de Vantagem';
  }

  protected getApiListMethod(): (jogoId: number) => Observable<CategoriaVantagem[]> {
    return (jogoId: number) => this.configApi.listCategoriasVantagem(jogoId);
  }

  protected getApiCreateMethod(): (data: any) => Observable<CategoriaVantagem> {
    // Não usado diretamente — createItem é sobrescrito
    return (data: any) => this.configApi.createCategoriaVantagem(data.jogoId, data);
  }

  protected getApiUpdateMethod(): (id: number, data: any) => Observable<CategoriaVantagem> {
    // Não usado diretamente — updateItem é sobrescrito
    return (id: number, data: any) => this.configApi.updateCategoriaVantagem(data.jogoId ?? 0, id, data);
  }

  protected getApiDeleteMethod(): (id: number) => Observable<void> {
    // Não usado diretamente — deleteItem é sobrescrito
    return (id: number) => this.configApi.deleteCategoriaVantagem(this.ensureGameSelected(), id);
  }

  override createItem(data: Record<string, unknown>): Observable<CategoriaVantagem> {
    const jogoId = this.ensureGameSelected();
    return this.configApi.createCategoriaVantagem(jogoId, {
      nome: data['nome'] as string,
      descricao: data['descricao'] as string | undefined,
      cor: data['cor'] as string | undefined,
    });
  }

  override updateItem(id: number, data: Record<string, unknown>): Observable<CategoriaVantagem> {
    const jogoId = this.ensureGameSelected();
    return this.configApi.updateCategoriaVantagem(jogoId, id, {
      nome: data['nome'] as string | undefined,
      descricao: data['descricao'] as string | undefined,
      cor: data['cor'] as string | undefined,
    });
  }

  override deleteItem(id: number): Observable<void> {
    const jogoId = this.ensureGameSelected();
    return this.configApi.deleteCategoriaVantagem(jogoId, id);
  }
}
