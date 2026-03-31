import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Jogo,
  JogoResumo,
  MeuJogo,
  DuplicarJogoResponse,
  DashboardMestre,
} from '../../models/jogo.model';
import { Participante } from '../../models/participante.model';
import { CreateJogoDto, UpdateJogoDto, DuplicarJogoDto } from '../../models/dtos/jogo.dto';
import { environment } from '../../../../environments/environment';

/**
 * API Service para Jogos/Campanhas.
 *
 * Endpoints do backend:
 * - GET    /api/v1/jogos                              — listar todos os jogos do usuário
 * - GET    /api/v1/jogos/meus                         — meus jogos com role e nº de personagens
 * - GET    /api/v1/jogos/ativo                        — jogo ativo onde sou Mestre
 * - GET    /api/v1/jogos/{id}                         — detalhes do jogo
 * - POST   /api/v1/jogos                              — criar jogo (Mestre)
 * - PUT    /api/v1/jogos/{id}                         — editar jogo (Mestre)
 * - DELETE /api/v1/jogos/{id}                         — deletar jogo (Mestre)
 * - POST   /api/v1/jogos/{id}/ativar                  — reativar jogo (Mestre)
 * - POST   /api/v1/jogos/{id}/duplicar                — duplicar jogo (Mestre)
 * - GET    /api/v1/jogos/{id}/config/export           — exportar configurações (Mestre)
 * - POST   /api/v1/jogos/{id}/config/import           — importar configurações (Mestre)
 * - GET    /api/v1/jogos/{id}/dashboard               — dashboard do Mestre
 *
 * Participantes:
 * - GET    /api/v1/jogos/{jogoId}/participantes               — listar participantes
 * - POST   /api/v1/jogos/{jogoId}/participantes/solicitar     — solicitar entrada
 * - PUT    /api/v1/jogos/{jogoId}/participantes/{id}/aprovar  — aprovar (Mestre)
 * - PUT    /api/v1/jogos/{jogoId}/participantes/{id}/rejeitar — rejeitar (Mestre)
 * - DELETE /api/v1/jogos/{jogoId}/participantes/{id}          — banir (Mestre)
 */
@Injectable({ providedIn: 'root' })
export class JogosApiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/jogos`;

  // ===== Jogos =====

  /**
   * GET /api/v1/jogos
   * Lista todos os jogos onde o usuário é Mestre ou Jogador.
   */
  listJogos(): Observable<JogoResumo[]> {
    return this.http.get<JogoResumo[]>(this.baseUrl);
  }

  /**
   * GET /api/v1/jogos/meus
   * Lista meus jogos com informação de role e quantidade de personagens.
   */
  listMeusJogos(): Observable<MeuJogo[]> {
    return this.http.get<MeuJogo[]>(`${this.baseUrl}/meus`);
  }

  /**
   * GET /api/v1/jogos/ativo
   * Retorna o jogo ativo onde o usuário é Mestre (404 se não houver).
   */
  getJogoAtivo(): Observable<Jogo> {
    return this.http.get<Jogo>(`${this.baseUrl}/ativo`);
  }

  /**
   * GET /api/v1/jogos/{id}
   * Detalhes completos de um jogo.
   */
  getJogo(id: number): Observable<Jogo> {
    return this.http.get<Jogo>(`${this.baseUrl}/${id}`);
  }

  /**
   * POST /api/v1/jogos
   * Cria um novo jogo (Mestre apenas).
   */
  createJogo(dto: CreateJogoDto): Observable<Jogo> {
    return this.http.post<Jogo>(this.baseUrl, dto);
  }

  /**
   * PUT /api/v1/jogos/{id}
   * Atualiza informações do jogo (Mestre apenas).
   */
  updateJogo(id: number, dto: UpdateJogoDto): Observable<Jogo> {
    return this.http.put<Jogo>(`${this.baseUrl}/${id}`, dto);
  }

  /**
   * DELETE /api/v1/jogos/{id}
   * Soft delete do jogo (Mestre apenas).
   */
  deleteJogo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * POST /api/v1/jogos/{id}/ativar
   * Reativa um jogo inativo (Mestre apenas).
   */
  ativarJogo(id: number): Observable<Jogo> {
    return this.http.post<Jogo>(`${this.baseUrl}/${id}/ativar`, {});
  }

  /**
   * POST /api/v1/jogos/{id}/duplicar
   * Duplica o jogo com todas as configurações, sem fichas nem participantes (Mestre apenas).
   */
  duplicarJogo(id: number, dto: DuplicarJogoDto): Observable<DuplicarJogoResponse> {
    return this.http.post<DuplicarJogoResponse>(`${this.baseUrl}/${id}/duplicar`, dto);
  }

  /**
   * GET /api/v1/jogos/{id}/config/export
   * Exporta todas as configurações do jogo em formato portável (Mestre apenas).
   */
  exportarConfig(id: number): Observable<unknown> {
    return this.http.get<unknown>(`${this.baseUrl}/${id}/config/export`);
  }

  /**
   * POST /api/v1/jogos/{id}/config/import
   * Importa configurações para o jogo. Itens com nomes já existentes são ignorados (Mestre apenas).
   */
  importarConfig(id: number, configData: unknown): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/config/import`, configData);
  }

  /**
   * GET /api/v1/jogos/{id}/dashboard
   * Dashboard do Mestre com estatísticas do jogo (Mestre apenas).
   */
  getDashboard(id: number): Observable<DashboardMestre> {
    return this.http.get<DashboardMestre>(`${this.baseUrl}/${id}/dashboard`);
  }

  // ===== Participantes =====

  /**
   * GET /api/v1/jogos/{jogoId}/participantes
   * Mestre vê todos (qualquer status). Jogador vê apenas APROVADOS.
   */
  listParticipantes(jogoId: number): Observable<Participante[]> {
    return this.http.get<Participante[]>(`${this.baseUrl}/${jogoId}/participantes`);
  }

  /**
   * POST /api/v1/jogos/{jogoId}/participantes/solicitar
   * Solicita entrada no jogo — cria participação com status PENDENTE.
   */
  solicitarParticipacao(jogoId: number): Observable<Participante> {
    return this.http.post<Participante>(`${this.baseUrl}/${jogoId}/participantes/solicitar`, {});
  }

  /**
   * PUT /api/v1/jogos/{jogoId}/participantes/{participanteId}/aprovar
   * Aprova uma solicitação de participação (Mestre apenas).
   */
  aprovarParticipante(jogoId: number, participanteId: number): Observable<Participante> {
    return this.http.put<Participante>(
      `${this.baseUrl}/${jogoId}/participantes/${participanteId}/aprovar`,
      {}
    );
  }

  /**
   * PUT /api/v1/jogos/{jogoId}/participantes/{participanteId}/rejeitar
   * Rejeita uma solicitação de participação (Mestre apenas).
   */
  rejeitarParticipante(jogoId: number, participanteId: number): Observable<Participante> {
    return this.http.put<Participante>(
      `${this.baseUrl}/${jogoId}/participantes/${participanteId}/rejeitar`,
      {}
    );
  }

  /**
   * DELETE /api/v1/jogos/{jogoId}/participantes/{participanteId}
   * Bane um participante do jogo — marca como BANIDO (Mestre apenas).
   */
  banirParticipante(jogoId: number, participanteId: number): Observable<Participante> {
    return this.http.delete<Participante>(
      `${this.baseUrl}/${jogoId}/participantes/${participanteId}`
    );
  }
}
