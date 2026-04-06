import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  FichaResumo,
  ProspeccaoUsoResponse,
  ConcederProspeccaoRequest,
  UsarProspeccaoRequest,
} from '@core/models/ficha.model';
import { environment } from '@env/environment';

/**
 * API Service para prospecção semântica de fichas.
 *
 * Endpoints do backend:
 * - POST   /api/v1/fichas/{id}/prospeccao/conceder              — conceder dados (MESTRE)
 * - POST   /api/v1/fichas/{id}/prospeccao/usar                  — registrar uso (MESTRE+JOGADOR)
 * - PATCH  /api/v1/fichas/{id}/prospeccao/usos/{usoId}/confirmar — confirmar uso (MESTRE)
 * - PATCH  /api/v1/fichas/{id}/prospeccao/usos/{usoId}/reverter  — reverter uso (MESTRE)
 * - GET    /api/v1/fichas/{id}/prospeccao/usos                  — listar usos (MESTRE+JOGADOR)
 * - GET    /api/v1/jogos/{jogoId}/prospeccao/pendentes          — listar pendentes do jogo (MESTRE)
 */
@Injectable({ providedIn: 'root' })
export class ProspeccaoApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/fichas`;
  private readonly jogosUrl = `${environment.apiUrl}/jogos`;

  /**
   * POST /api/v1/fichas/{id}/prospeccao/conceder
   * Concede dados de prospecção a uma ficha. Retorna o resumo atualizado da ficha.
   */
  conceder(fichaId: number, req: ConcederProspeccaoRequest): Observable<FichaResumo> {
    return this.http.post<FichaResumo>(
      `${this.baseUrl}/${fichaId}/prospeccao/conceder`,
      req,
    );
  }

  /**
   * POST /api/v1/fichas/{id}/prospeccao/usar
   * Registra o uso de um dado de prospecção. Decrementa a quantidade e cria registro PENDENTE.
   */
  usar(fichaId: number, req: UsarProspeccaoRequest): Observable<ProspeccaoUsoResponse> {
    return this.http.post<ProspeccaoUsoResponse>(
      `${this.baseUrl}/${fichaId}/prospeccao/usar`,
      req,
    );
  }

  /**
   * PATCH /api/v1/fichas/{id}/prospeccao/usos/{usoId}/confirmar
   * Confirma um uso PENDENTE. Apenas MESTRE.
   */
  confirmar(fichaId: number, usoId: number): Observable<ProspeccaoUsoResponse> {
    return this.http.patch<ProspeccaoUsoResponse>(
      `${this.baseUrl}/${fichaId}/prospeccao/usos/${usoId}/confirmar`,
      {},
    );
  }

  /**
   * PATCH /api/v1/fichas/{id}/prospeccao/usos/{usoId}/reverter
   * Reverte um uso PENDENTE e restaura a quantidade. Apenas MESTRE.
   */
  reverter(fichaId: number, usoId: number): Observable<ProspeccaoUsoResponse> {
    return this.http.patch<ProspeccaoUsoResponse>(
      `${this.baseUrl}/${fichaId}/prospeccao/usos/${usoId}/reverter`,
      {},
    );
  }

  /**
   * GET /api/v1/fichas/{id}/prospeccao/usos
   * Lista todos os usos de prospecção da ficha. Mestre vê todos; Jogador vê os próprios.
   */
  listarUsos(fichaId: number): Observable<ProspeccaoUsoResponse[]> {
    return this.http.get<ProspeccaoUsoResponse[]>(
      `${this.baseUrl}/${fichaId}/prospeccao/usos`,
    );
  }

  /**
   * GET /api/v1/jogos/{jogoId}/prospeccao/pendentes
   * Lista todos os usos PENDENTES do jogo. Apenas MESTRE.
   */
  listarPendentesJogo(jogoId: number): Observable<ProspeccaoUsoResponse[]> {
    return this.http.get<ProspeccaoUsoResponse[]>(
      `${this.jogosUrl}/${jogoId}/prospeccao/pendentes`,
    );
  }
}
