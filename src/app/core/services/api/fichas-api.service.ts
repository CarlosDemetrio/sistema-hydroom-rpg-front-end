import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
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
 *
 * IMPORTANT: Backend recalculates all derived stats on POST/PUT
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
  listFichas(filters?: FichaFilters): Observable<Ficha[]> {
    let params = new HttpParams();
    if (filters?.jogoId) {
      params = params.set('jogoId', filters.jogoId.toString());
    }
    if (filters?.jogadorId) {
      params = params.set('jogadorId', filters.jogadorId.toString());
    }
    return this.http.get<Ficha[]>(this.baseUrl, { params });
  }

  /**
   * Get character sheet details by ID
   * Response includes all calculated values from backend
   */
  getFicha(id: number): Observable<Ficha> {
    return this.http.get<Ficha>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create new character sheet
   * Backend recalculates all derived stats before returning
   */
  createFicha(ficha: CreateFichaDto | Partial<Ficha>): Observable<Ficha> {
    return this.http.post<Ficha>(this.baseUrl, ficha);
  }

  /**
   * Update existing character sheet
   * Backend recalculates all derived stats after update
   * Supports partial updates for auto-save
   */
  updateFicha(id: number, ficha: UpdateFichaDto): Observable<Ficha> {
    return this.http.put<Ficha>(`${this.baseUrl}/${id}`, ficha);
  }

  /**
   * Delete character sheet
   * Cascades: removes from participantes if associated with game
   */
  deleteFicha(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
