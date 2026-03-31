import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Ficha,
  FichaResumo,
  DuplicarFichaResponse,
} from '../../models/ficha.model';
import {
  CreateFichaDto,
  NpcCreateDto,
  UpdateFichaDto,
  DuplicarFichaDto,
} from '../../models/dtos/ficha.dto';
import { environment } from '../../../../environments/environment';

export interface FichaFilters {
  nome?: string;
  classeId?: number;
  racaId?: number;
  nivel?: number;
}

/**
 * API Service para Fichas de personagem.
 *
 * Endpoints corretos do backend:
 * - GET  /api/v1/jogos/{jogoId}/fichas          — listar fichas do jogo
 * - GET  /api/v1/jogos/{jogoId}/fichas/minhas   — minhas fichas no jogo
 * - POST /api/v1/jogos/{jogoId}/fichas          — criar ficha no jogo
 * - GET  /api/v1/jogos/{jogoId}/npcs            — listar NPCs do jogo
 * - POST /api/v1/jogos/{jogoId}/npcs            — criar NPC (via isNpc=true em fichas)
 * - GET  /api/v1/fichas/{id}                    — buscar ficha por ID
 * - GET  /api/v1/fichas/{id}/resumo             — resumo calculado da ficha
 * - PUT  /api/v1/fichas/{id}                    — atualizar ficha
 * - DELETE /api/v1/fichas/{id}                  — deletar ficha (Mestre)
 * - POST /api/v1/fichas/{id}/duplicar           — duplicar ficha
 * - POST /api/v1/fichas/{id}/preview            — preview de cálculos sem persistir
 * - GET  /api/v1/fichas/{id}/vantagens          — listar vantagens da ficha
 * - POST /api/v1/fichas/{id}/vantagens          — comprar vantagem
 * - PUT  /api/v1/fichas/{id}/vantagens/{vid}    — aumentar nível de vantagem
 */
@Injectable({ providedIn: 'root' })
export class FichasApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  /**
   * GET /api/v1/jogos/{jogoId}/fichas
   * Mestre vê todas; Jogador vê apenas as suas. Suporta filtros opcionais.
   */
  listFichas(jogoId: number, filtros?: FichaFilters): Observable<Ficha[]> {
    let params = new HttpParams();
    if (filtros?.nome) {
      params = params.set('nome', filtros.nome);
    }
    if (filtros?.classeId != null) {
      params = params.set('classeId', filtros.classeId.toString());
    }
    if (filtros?.racaId != null) {
      params = params.set('racaId', filtros.racaId.toString());
    }
    if (filtros?.nivel != null) {
      params = params.set('nivel', filtros.nivel.toString());
    }
    return this.http.get<Ficha[]>(`${this.baseUrl}/jogos/${jogoId}/fichas`, { params });
  }

  /**
   * GET /api/v1/jogos/{jogoId}/fichas/minhas
   * Retorna apenas as fichas do usuário atual no jogo.
   */
  listMinhasFichas(jogoId: number): Observable<Ficha[]> {
    return this.http.get<Ficha[]>(`${this.baseUrl}/jogos/${jogoId}/fichas/minhas`);
  }

  /**
   * GET /api/v1/jogos/{jogoId}/npcs
   * Lista NPCs do jogo (apenas MESTRE).
   */
  listNpcs(jogoId: number): Observable<Ficha[]> {
    return this.http.get<Ficha[]>(`${this.baseUrl}/jogos/${jogoId}/npcs`);
  }

  /**
   * GET /api/v1/fichas/{id}
   * Busca ficha por ID.
   */
  getFicha(id: number): Observable<Ficha> {
    return this.http.get<Ficha>(`${this.baseUrl}/fichas/${id}`);
  }

  /**
   * GET /api/v1/fichas/{id}/resumo
   * Resumo calculado da ficha: atributos, bônus, vida, essência, ameaça.
   */
  getFichaResumo(id: number): Observable<FichaResumo> {
    return this.http.get<FichaResumo>(`${this.baseUrl}/fichas/${id}/resumo`);
  }

  /**
   * POST /api/v1/jogos/{jogoId}/fichas
   * Cria uma nova ficha no jogo.
   */
  createFicha(jogoId: number, dto: CreateFichaDto): Observable<Ficha> {
    return this.http.post<Ficha>(`${this.baseUrl}/jogos/${jogoId}/fichas`, dto);
  }

  /**
   * POST /api/v1/jogos/{jogoId}/fichas  (com isNpc=true)
   * Cria um NPC no jogo.
   */
  createNpc(jogoId: number, dto: NpcCreateDto): Observable<Ficha> {
    const body: CreateFichaDto = { ...dto, isNpc: true };
    return this.http.post<Ficha>(`${this.baseUrl}/jogos/${jogoId}/fichas`, body);
  }

  /**
   * PUT /api/v1/fichas/{id}
   * Atualiza uma ficha. Mestre pode editar qualquer ficha; Jogador só as próprias.
   */
  updateFicha(id: number, dto: UpdateFichaDto): Observable<Ficha> {
    return this.http.put<Ficha>(`${this.baseUrl}/fichas/${id}`, dto);
  }

  /**
   * DELETE /api/v1/fichas/{id}
   * Soft delete da ficha (apenas MESTRE).
   */
  deleteFicha(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/fichas/${id}`);
  }

  /**
   * POST /api/v1/fichas/{id}/duplicar
   * Duplica uma ficha com novo nome.
   */
  duplicarFicha(id: number, dto: DuplicarFichaDto): Observable<DuplicarFichaResponse> {
    return this.http.post<DuplicarFichaResponse>(`${this.baseUrl}/fichas/${id}/duplicar`, dto);
  }

  /**
   * POST /api/v1/fichas/{id}/preview
   * Simula mudanças de atributos/XP e retorna valores recalculados sem salvar.
   */
  previewFicha(id: number, dto: Record<string, unknown>): Observable<unknown> {
    return this.http.post<unknown>(`${this.baseUrl}/fichas/${id}/preview`, dto);
  }

  /**
   * GET /api/v1/fichas/{id}/vantagens
   * Lista vantagens da ficha.
   */
  listVantagens(id: number): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.baseUrl}/fichas/${id}/vantagens`);
  }

  /**
   * POST /api/v1/fichas/{id}/vantagens
   * Compra uma vantagem para a ficha.
   */
  comprarVantagem(id: number, vantagemConfigId: number): Observable<unknown> {
    return this.http.post<unknown>(`${this.baseUrl}/fichas/${id}/vantagens`, { vantagemConfigId });
  }

  /**
   * PUT /api/v1/fichas/{id}/vantagens/{vid}
   * Aumenta o nível de uma vantagem da ficha.
   */
  aumentarNivelVantagem(id: number, vid: number): Observable<unknown> {
    return this.http.put<unknown>(`${this.baseUrl}/fichas/${id}/vantagens/${vid}`, {});
  }
}
