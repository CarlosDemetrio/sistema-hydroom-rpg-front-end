import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Jogo, Participante, CreateJogoDto, UpdateJogoDto } from '../../models';
import { environment } from '../../../../environments/environment';

/**
 * Filter options for listing games
 */
export interface JogoFilters {
  status?: 'ATIVO' | 'PAUSADO' | 'FINALIZADO';
  search?: string;
}

/**
 * API Service for Games (Jogos) endpoints
 */
@Injectable({
  providedIn: 'root'
})
export class JogosApiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/jogos`;

  /**
   * List all games (filtered by role on backend)
   * Mestre sees all, Jogador sees only participated games
   */
  listJogos(filters?: JogoFilters): Observable<Jogo[]> {
    let params = new HttpParams();
    if (filters?.status) {
      params = params.set('status', filters.status);
    }
    if (filters?.search) {
      params = params.set('search', filters.search);
    }

    return this.http.get<Jogo[]>(this.baseUrl, { params });
  }

  /**
   * Get game details by ID
   */
  getJogo(id: number): Observable<Jogo> {
    return this.http.get<Jogo>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create new game (Mestre only)
   */
  createJogo(jogo: CreateJogoDto): Observable<Jogo> {
    return this.http.post<Jogo>(this.baseUrl, jogo);
  }

  /**
   * Update existing game (Mestre only)
   */
  updateJogo(id: number, jogo: UpdateJogoDto): Observable<Jogo> {
    return this.http.put<Jogo>(`${this.baseUrl}/${id}`, jogo);
  }

  /**
   * Delete game (Mestre only)
   * Cascades: deletes participantes, updates fichas (jogoId = null)
   */
  deleteJogo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // ===== Participant Management =====

  /**
   * List participants for a game
   */
  listParticipantes(jogoId: number): Observable<Participante[]> {
    return this.http.get<Participante[]>(`${this.baseUrl}/${jogoId}/participantes`);
  }

  /**
   * Request to join game (Jogador only)
   */
  solicitarParticipacao(jogoId: number, fichaId: number): Observable<Participante> {
    return this.http.post<Participante>(`${this.baseUrl}/${jogoId}/participantes`, { fichaId });
  }

  /**
   * Approve or reject participant (Mestre only)
   */
  updateParticipante(
    jogoId: number,
    participanteId: number,
    status: 'APROVADO' | 'REJEITADO'
  ): Observable<Participante> {
    return this.http.put<Participante>(
      `${this.baseUrl}/${jogoId}/participantes/${participanteId}`,
      { status }
    );
  }

  /**
   * Remove participant (Mestre or Jogador self)
   */
  removerParticipante(jogoId: number, participanteId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${jogoId}/participantes/${participanteId}`);
  }
}
