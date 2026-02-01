import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Ficha, CreateFichaDto, UpdateFichaDto } from '../../models';
import { environment } from '../../../../environments/environment';

/**
 * Filter options for listing character sheets
 */
export interface FichaFilters {
  jogoId?: number;
  jogadorId?: number;
}

/**
 * API Service for Character Sheets (Fichas) endpoints
 * Handles all HTTP communication with /api/fichas
 *
 * IMPORTANT: Backend recalculates all derived stats on POST/PUT
 * Always use values from backend response as source of truth
 */
@Injectable({
  providedIn: 'root'
})
export class FichasApiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/fichas`;

  /**
   * List character sheets (filtered by role on backend)
   * Mestre sees all, Jogador sees only own fichas
   */
  async listFichas(filters?: FichaFilters): Promise<Ficha[]> {
    let params = new HttpParams();
    if (filters?.jogoId) {
      params = params.set('jogoId', filters.jogoId.toString());
    }
    if (filters?.jogadorId) {
      params = params.set('jogadorId', filters.jogadorId.toString());
    }

    return firstValueFrom(
      this.http.get<Ficha[]>(this.baseUrl, { params })
    );
  }

  /**
   * Get character sheet details by ID
   * Response includes all calculated values from backend
   */
  async getFicha(id: number): Promise<Ficha> {
    return firstValueFrom(
      this.http.get<Ficha>(`${this.baseUrl}/${id}`)
    );
  }

  /**
   * Create new character sheet
   * Backend recalculates all derived stats before returning
   */
  async createFicha(ficha: CreateFichaDto | Partial<Ficha>): Promise<Ficha> {
    return firstValueFrom(
      this.http.post<Ficha>(this.baseUrl, ficha)
    );
  }

  /**
   * Update existing character sheet
   * Backend recalculates all derived stats after update
   * Supports partial updates for auto-save
   */
  async updateFicha(id: number, ficha: UpdateFichaDto): Promise<Ficha> {
    return firstValueFrom(
      this.http.put<Ficha>(`${this.baseUrl}/${id}`, ficha)
    );
  }

  /**
   * Delete character sheet
   * Cascades: removes from participantes if associated with game
   */
  async deleteFicha(id: number): Promise<void> {
    return firstValueFrom(
      this.http.delete<void>(`${this.baseUrl}/${id}`)
    );
  }
}
