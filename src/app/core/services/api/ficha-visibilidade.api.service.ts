import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Ficha,
  FichaVisibilidadeResponse,
  AtualizarVisibilidadeDto,
} from '@core/models/ficha.model';
import { environment } from '@env/environment';

/**
 * API Service para controle de visibilidade de NPCs.
 *
 * Endpoints do backend:
 * - GET    /api/v1/fichas/{fichaId}/visibilidade              — listar configuração de visibilidade
 * - POST   /api/v1/fichas/{fichaId}/visibilidade              — conceder/revogar acesso individual
 * - DELETE /api/v1/fichas/{fichaId}/visibilidade/{jogadorId}  — remover acesso individual
 * - PATCH  /api/v1/fichas/{fichaId}/visibilidade/global       — toggle visibilidade global
 */
@Injectable({ providedIn: 'root' })
export class FichaVisibilidadeApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/fichas`;

  /**
   * GET /api/v1/fichas/{fichaId}/visibilidade
   * Retorna a configuração completa de visibilidade do NPC (MESTRE only).
   */
  listarVisibilidade(fichaId: number): Observable<FichaVisibilidadeResponse> {
    return this.http.get<FichaVisibilidadeResponse>(`${this.baseUrl}/${fichaId}/visibilidade`);
  }

  /**
   * POST /api/v1/fichas/{fichaId}/visibilidade
   * Concede ou revoga acesso de um jogador específico aos stats do NPC (MESTRE only).
   */
  atualizarVisibilidade(fichaId: number, dto: AtualizarVisibilidadeDto): Observable<FichaVisibilidadeResponse> {
    return this.http.post<FichaVisibilidadeResponse>(`${this.baseUrl}/${fichaId}/visibilidade`, dto);
  }

  /**
   * DELETE /api/v1/fichas/{fichaId}/visibilidade/{jogadorId}
   * Remove o acesso granular de um jogador ao NPC (MESTRE only).
   */
  revogarAcesso(fichaId: number, jogadorId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${fichaId}/visibilidade/${jogadorId}`);
  }

  /**
   * PATCH /api/v1/fichas/{fichaId}/visibilidade/global
   * Alterna a visibilidade global do NPC para todos os jogadores (MESTRE only).
   */
  atualizarGlobal(fichaId: number, visivelGlobalmente: boolean): Observable<Ficha> {
    return this.http.patch<Ficha>(`${this.baseUrl}/${fichaId}/visibilidade/global`, { visivelGlobalmente });
  }
}
