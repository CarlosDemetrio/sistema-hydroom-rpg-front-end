import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  FichaInventarioResponse,
  FichaItemResponse,
  AdicionarFichaItemRequest,
  AdicionarFichaItemCustomizadoRequest,
  AlterarDurabilidadeRequest,
} from '@core/models/ficha-item.model';

/**
 * HTTP Service para endpoints de inventario de fichas.
 * Base: /api/v1/fichas/{fichaId}/itens
 */
@Injectable({ providedIn: 'root' })
export class FichaItemService {
  private readonly http = inject(HttpClient);

  private base(fichaId: number): string {
    return `/api/v1/fichas/${fichaId}/itens`;
  }

  /**
   * GET /api/v1/fichas/{fichaId}/itens
   * Retorna inventario completo separado por equipados e em estoque.
   */
  listarInventario(fichaId: number): Observable<FichaInventarioResponse> {
    return this.http.get<FichaInventarioResponse>(this.base(fichaId));
  }

  /**
   * POST /api/v1/fichas/{fichaId}/itens
   * Adiciona item do catalogo ao inventario.
   */
  adicionar(
    fichaId: number,
    request: AdicionarFichaItemRequest,
  ): Observable<FichaItemResponse> {
    return this.http.post<FichaItemResponse>(this.base(fichaId), request);
  }

  /**
   * POST /api/v1/fichas/{fichaId}/itens/customizado
   * Adiciona item customizado (apenas Mestre).
   */
  adicionarCustomizado(
    fichaId: number,
    request: AdicionarFichaItemCustomizadoRequest,
  ): Observable<FichaItemResponse> {
    return this.http.post<FichaItemResponse>(
      `${this.base(fichaId)}/customizado`,
      request,
    );
  }

  /**
   * PATCH /api/v1/fichas/{fichaId}/itens/{itemId}/equipar
   * Marca o item como equipado.
   */
  equipar(fichaId: number, itemId: number): Observable<FichaItemResponse> {
    return this.http.patch<FichaItemResponse>(
      `${this.base(fichaId)}/${itemId}/equipar`,
      {},
    );
  }

  /**
   * PATCH /api/v1/fichas/{fichaId}/itens/{itemId}/desequipar
   * Remove o item da posicao equipada sem remover do inventario.
   */
  desequipar(fichaId: number, itemId: number): Observable<FichaItemResponse> {
    return this.http.patch<FichaItemResponse>(
      `${this.base(fichaId)}/${itemId}/desequipar`,
      {},
    );
  }

  /**
   * POST /api/v1/fichas/{fichaId}/itens/{itemId}/durabilidade
   * Decrementa ou restaura a durabilidade (apenas Mestre).
   */
  alterarDurabilidade(
    fichaId: number,
    itemId: number,
    request: AlterarDurabilidadeRequest,
  ): Observable<FichaItemResponse> {
    return this.http.post<FichaItemResponse>(
      `${this.base(fichaId)}/${itemId}/durabilidade`,
      request,
    );
  }

  /**
   * DELETE /api/v1/fichas/{fichaId}/itens/{itemId}
   * Remove o item do inventario.
   */
  remover(fichaId: number, itemId: number): Observable<void> {
    return this.http.delete<void>(`${this.base(fichaId)}/${itemId}`);
  }
}
