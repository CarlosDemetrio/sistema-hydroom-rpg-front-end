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
 * Response for calculated values endpoint
 *
 * @example
 * {
 *   "fichaId": 123,
 *   "BBA": 8,
 *   "BBM": 5,
 *   "impeto": 12,
 *   "vidaTotal": 85,
 *   "manaTotal": 60
 * }
 */
export interface FichaCalculados {
  fichaId: number;
  BBA: number;
  BBM: number;
  impeto: number;
  vidaTotal: number;
  manaTotal?: number;
  [key: string]: number | undefined;
}

/**
 * Request body for dar experiência (Mestre only)
 *
 * @example
 * {
 *   "experiencia": 1000,
 *   "motivo": "Derrotar o dragão"
 * }
 */
export interface DarExperienciaDto {
  experiencia: number;
  motivo?: string;
}

/**
 * Response after granting XP (includes level up info)
 *
 * @example
 * {
 *   "fichaId": 123,
 *   "experienciaAnterior": 5000,
 *   "experienciaNova": 6000,
 *   "nivelAnterior": 5,
 *   "nivelNovo": 6,
 *   "subiu": true,
 *   "mensagem": "Parabéns! Você subiu para o nível 6!"
 * }
 */
export interface DarExperienciaResponse {
  fichaId: number;
  experienciaAnterior: number;
  experienciaNova: number;
  nivelAnterior: number;
  nivelNovo: number;
  subiu: boolean;
  mensagem: string;
}

/**
 * API Service for Character Sheets (Fichas) endpoints
 *
 * ⚠️ IMPORTANT: Backend recalculates all derived stats on POST/PUT
 *
 * 📋 ENDPOINTS DOCUMENTATION:
 *
 * All endpoints assume base URL: /api/fichas
 *
 * Authentication: Required (Bearer token via HttpOnly cookie)
 * Authorization: Role-based (MESTRE vs JOGADOR)
 */
@Injectable({
  providedIn: 'root'
})
export class FichasApiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/fichas`;

  /**
   * 📌 GET /api/fichas
   *
   * List character sheets (filtered by role on backend)
   * - Mestre: sees ALL fichas (optionally filter by jogoId)
   * - Jogador: sees ONLY own fichas
   *
   * @param filters - Optional filters (jogoId, jogadorId)
   *
   * @returns Observable<Ficha[]>
   *
   * @example Request
   * GET /api/fichas?jogoId=1
   *
   * @example Response
   * [
   *   {
   *     "id": 1,
   *     "nome": "Aragorn",
   *     "jogoId": 1,
   *     "jogadorId": 5,
   *     "identificacao": { ... },
   *     "progressao": { "nivel": 5, "experiencia": 5000, ... },
   *     "atributos": [ ... ],
   *     "vida": { "vidaTotal": 85, ... },
   *     "pericias": [ ... ],
   *     "equipamentos": [ ... ],
   *     "vantagens": [ ... ],
   *     "titulosRunas": [ ... ]
   *   }
   * ]
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
   * 📌 GET /api/fichas/{id}
   *
   * Get character sheet details by ID
   * Response includes ALL calculated values from backend
   *
   * @param id - Ficha ID
   *
   * @returns Observable<Ficha>
   *
   * @example Request
   * GET /api/fichas/123
   *
   * @example Response
   * {
   *   "id": 123,
   *   "nome": "Aragorn",
   *   "jogoId": 1,
   *   "jogadorId": 5,
   *   "identificacao": {
   *     "origem": "Númenor",
   *     "indole": "Leal",
   *     "linhagem": "Humano"
   *   },
   *   "progressao": {
   *     "nivel": 5,
   *     "experiencia": 5000,
   *     "renascimento": 0,
   *     "insolitus": 2,
   *     "nvs": 1
   *   },
   *   "atributos": [
   *     {
   *       "nome": "FOR",
   *       "valorBase": 16,
   *       "valorNivel": 2,
   *       "valorOutros": 0,
   *       "valorTotal": 18,
   *       "modificador": 4
   *     }
   *   ],
   *   "vida": {
   *     "vidaVigor": 20,
   *     "vidaOutros": 5,
   *     "vidaNivel": 60,
   *     "vidaTotal": 85,
   *     "sanguePercentual": 100
   *   },
   *   "pericias": [...],
   *   "equipamentos": [...],
   *   "vantagens": [...],
   *   "titulosRunas": [...]
   * }
   */
  getFicha(id: number): Observable<Ficha> {
    return this.http.get<Ficha>(`${this.baseUrl}/${id}`);
  }

  /**
   * 📌 POST /api/fichas
   *
   * Create new character sheet
   * Backend RECALCULATES all derived stats before returning
   *
   * @param ficha - Ficha data (without calculated fields)
   *
   * @returns Observable<Ficha> - Complete ficha with calculated values
   *
   * @example Request
   * POST /api/fichas
   * {
   *   "nome": "Aragorn",
   *   "jogoId": 1,
   *   "identificacao": { "origem": "Númenor", ... },
   *   "progressao": { "renascimento": 0, "insolitus": 2, "nvs": 1 },
   *   "atributos": [ { "nome": "FOR", "valorBase": 16 } ],
   *   "vida": { "vidaVigor": 20, "vidaOutros": 5, ... },
   *   "pericias": [ { "nome": "Furtividade", "pontosInvestidos": 5, "atributoBase": "DES" } ],
   *   "equipamentos": [ ... ],
   *   "vantagens": [ ... ],
   *   "titulosRunas": [ ... ]
   * }
   *
   * @example Response (includes calculated fields)
   * {
   *   "id": 123,
   *   "nome": "Aragorn",
   *   ...,
   *   "progressao": { "nivel": 1, "experiencia": 0, ... },  // ← Calculado!
   *   "atributos": [
   *     {
   *       "nome": "FOR",
   *       "valorBase": 16,
   *       "valorTotal": 18,  // ← Calculado!
   *       "modificador": 4   // ← Calculado!
   *     }
   *   ],
   *   "vida": { "vidaTotal": 90 }  // ← Recalculado pelo backend!
   * }
   *
   * ⚠️ BACKEND DEVE:
   * - Calcular nivel baseado em XP (inicialmente nível 1)
   * - Calcular valorTotal e modificador de TODOS os atributos
   * - Calcular vidaTotal com base na fórmula
   * - Calcular modificadorTotal de TODAS as perícias
   * - Aplicar bônus de equipamentos equipados
   */
  createFicha(ficha: CreateFichaDto | Partial<Ficha>): Observable<Ficha> {
    return this.http.post<Ficha>(this.baseUrl, ficha);
  }

  /**
   * 📌 PUT /api/fichas/{id}
   *
   * Update existing character sheet
   * Backend RECALCULATES all derived stats after update
   * Supports PARTIAL updates for auto-save
   *
   * @param id - Ficha ID
   * @param ficha - Partial ficha data to update
   *
   * @returns Observable<Ficha> - Complete updated ficha
   *
   * @example Request (partial update)
   * PUT /api/fichas/123
   * {
   *   "atributos": [
   *     { "nome": "FOR", "valorBase": 18 }
   *   ]
   * }
   *
   * @example Response
   * {
   *   "id": 123,
   *   "atributos": [
   *     {
   *       "nome": "FOR",
   *       "valorBase": 18,
   *       "valorTotal": 20,     // ← Recalculado!
   *       "modificador": 5      // ← Recalculado!
   *     }
   *   ]
   * }
   *
   * ⚠️ BACKEND DEVE:
   * - Recalcular TODOS os valores derivados após update
   * - Verificar se nível mudou (caso XP alterado por Mestre)
   * - Recalcular bônus de equipamentos
   */
  updateFicha(id: number, ficha: UpdateFichaDto): Observable<Ficha> {
    return this.http.put<Ficha>(`${this.baseUrl}/${id}`, ficha);
  }

  /**
   * 📌 DELETE /api/fichas/{id}
   *
   * Delete character sheet
   *
   * @param id - Ficha ID
   *
   * @returns Observable<void>
   *
   * @example Request
   * DELETE /api/fichas/123
   *
   * @example Response
   * 204 No Content
   *
   * ⚠️ BACKEND DEVE:
   * - Remover ficha de participantes do jogo (se associada)
   * - Cascade delete de todos os relacionamentos
   *
   * Authorization:
   * - MESTRE: pode deletar qualquer ficha
   * - JOGADOR: pode deletar apenas suas próprias fichas
   */
  deleteFicha(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
