import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
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
 * Handles all HTTP communication with /api/jogos
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
  async listJogos(filters?: JogoFilters): Promise<Jogo[]> {
    let params = new HttpParams();
    if (filters?.status) {
      params = params.set('status', filters.status);
    }
    if (filters?.search) {
      params = params.set('search', filters.search);
    }

    return firstValueFrom(
      this.http.get<Jogo[]>(this.baseUrl, { params })
    );
  }

  /**
   * Get game details by ID
   */
  async getJogo(id: number): Promise<Jogo> {
    return firstValueFrom(
      this.http.get<Jogo>(`${this.baseUrl}/${id}`)
    );
  }

  /**
   * Create new game (Mestre only)
   */
  async createJogo(jogo: CreateJogoDto): Promise<Jogo> {
    return firstValueFrom(
      this.http.post<Jogo>(this.baseUrl, jogo)
    );
  }

  /**
   * Update existing game (Mestre only)
   */
  async updateJogo(id: number, jogo: UpdateJogoDto): Promise<Jogo> {
    return firstValueFrom(
      this.http.put<Jogo>(`${this.baseUrl}/${id}`, jogo)
    );
  }

  /**
   * Delete game (Mestre only)
   * Cascades: deletes participantes, updates fichas (jogoId = null)
   */
  async deleteJogo(id: number): Promise<void> {
    return firstValueFrom(
      this.http.delete<void>(`${this.baseUrl}/${id}`)
    );
  }

  // ===== Participant Management =====

  /**
   * List participants for a game
   */
  async listParticipantes(jogoId: number): Promise<Participante[]> {
    return firstValueFrom(
      this.http.get<Participante[]>(`${this.baseUrl}/${jogoId}/participantes`)
    );
  }

  /**
   * Request to join game (Jogador only)
   */
  async solicitarParticipacao(jogoId: number, fichaId: number): Promise<Participante> {
    return firstValueFrom(
      this.http.post<Participante>(`${this.baseUrl}/${jogoId}/participantes`, { fichaId })
    );
  }

  /**
   * Approve or reject participant (Mestre only)
   */
  async updateParticipante(
    jogoId: number,
    participanteId: number,
    status: 'APROVADO' | 'REJEITADO'
  ): Promise<Participante> {
    return firstValueFrom(
      this.http.put<Participante>(
        `${this.baseUrl}/${jogoId}/participantes/${participanteId}`,
        { status }
      )
    );
  }

  /**
   * Remove participant (Mestre or Jogador self)
   */
  async removerParticipante(jogoId: number, participanteId: number): Promise<void> {
    return firstValueFrom(
      this.http.delete<void>(`${this.baseUrl}/${jogoId}/participantes/${participanteId}`)
    );
  }
}
