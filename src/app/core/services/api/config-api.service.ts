import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AtributoConfig, CreateAtributoDto, UpdateAtributoDto } from '@core/models/atributo-config.model';
import { AptidaoConfig, CreateAptidaoDto, UpdateAptidaoDto } from '@core/models/aptidao-config.model';
import { TipoAptidao } from '@core/models/tipo-aptidao.model';
import { VantagemConfig, CreateVantagemDto, UpdateVantagemDto } from '@core/models/vantagem-config.model';
import { VantagemEfeito, CriarVantagemEfeitoDto } from '@core/models/vantagem-efeito.model';
import {
  CategoriaVantagem,
  ClassePersonagem,
  Raca,
  NivelConfig,
  DadoProspeccaoConfig,
  PresencaConfig,
  GeneroConfig,
  IndoleConfig,
  MembroCorpoConfig,
  BonusConfig,
  ReordenarRequest,
} from '@core/models/config.models';
import { environment } from '@env/environment';

/**
 * API Service para endpoints de configuração do jogo.
 *
 * Padrão de URLs do backend:
 * - A maioria dos endpoints usa: /api/v1/configuracoes/{tipo}?jogoId={jogoId}
 * - CategoriaVantagem usa: /api/jogos/{jogoId}/config/categorias-vantagem  (sem /v1/)
 *
 * Operações CRUD completas por tipo + reordenação batch (/reordenar).
 * Apenas MESTRE pode criar/editar/deletar. MESTRE e JOGADOR podem listar.
 */
@Injectable({ providedIn: 'root' })
export class ConfigApiService {
  private http = inject(HttpClient);
  private configUrl = `${environment.apiUrl}/configuracoes`;

  // ===== Atributos =====
  // Base: /api/v1/configuracoes/atributos

  listAtributos(jogoId: number, nome?: string): Observable<AtributoConfig[]> {
    let params = new HttpParams().set('jogoId', jogoId.toString());
    if (nome) {
      params = params.set('nome', nome);
    }
    return this.http.get<AtributoConfig[]>(`${this.configUrl}/atributos`, { params });
  }

  getAtributo(id: number): Observable<AtributoConfig> {
    return this.http.get<AtributoConfig>(`${this.configUrl}/atributos/${id}`);
  }

  createAtributo(dto: CreateAtributoDto): Observable<AtributoConfig> {
    return this.http.post<AtributoConfig>(`${this.configUrl}/atributos`, dto);
  }

  updateAtributo(id: number, dto: UpdateAtributoDto): Observable<AtributoConfig> {
    return this.http.put<AtributoConfig>(`${this.configUrl}/atributos/${id}`, dto);
  }

  deleteAtributo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.configUrl}/atributos/${id}`);
  }

  reordenarAtributos(jogoId: number, request: ReordenarRequest): Observable<void> {
    return this.http.put<void>(`${this.configUrl}/atributos/reordenar?jogoId=${jogoId}`, request);
  }

  // ===== Aptidões =====
  // Base: /api/v1/configuracoes/aptidoes

  listAptidoes(jogoId: number, nome?: string): Observable<AptidaoConfig[]> {
    let params = new HttpParams().set('jogoId', jogoId.toString());
    if (nome) {
      params = params.set('nome', nome);
    }
    return this.http.get<AptidaoConfig[]>(`${this.configUrl}/aptidoes`, { params });
  }

  getAptidao(id: number): Observable<AptidaoConfig> {
    return this.http.get<AptidaoConfig>(`${this.configUrl}/aptidoes/${id}`);
  }

  createAptidao(dto: CreateAptidaoDto): Observable<AptidaoConfig> {
    return this.http.post<AptidaoConfig>(`${this.configUrl}/aptidoes`, dto);
  }

  updateAptidao(id: number, dto: UpdateAptidaoDto): Observable<AptidaoConfig> {
    return this.http.put<AptidaoConfig>(`${this.configUrl}/aptidoes/${id}`, dto);
  }

  deleteAptidao(id: number): Observable<void> {
    return this.http.delete<void>(`${this.configUrl}/aptidoes/${id}`);
  }

  reordenarAptidoes(jogoId: number, request: ReordenarRequest): Observable<void> {
    return this.http.put<void>(`${this.configUrl}/aptidoes/reordenar?jogoId=${jogoId}`, request);
  }

  // ===== Tipos de Aptidão =====
  // Base: /api/v1/configuracoes/tipos-aptidao

  listTiposAptidao(jogoId: number): Observable<TipoAptidao[]> {
    const params = new HttpParams().set('jogoId', jogoId.toString());
    return this.http.get<TipoAptidao[]>(`${this.configUrl}/tipos-aptidao`, { params });
  }

  getTipoAptidao(id: number): Observable<TipoAptidao> {
    return this.http.get<TipoAptidao>(`${this.configUrl}/tipos-aptidao/${id}`);
  }

  createTipoAptidao(dto: { jogoId: number; nome: string; descricao?: string }): Observable<TipoAptidao> {
    return this.http.post<TipoAptidao>(`${this.configUrl}/tipos-aptidao`, dto);
  }

  updateTipoAptidao(id: number, dto: { nome?: string; descricao?: string }): Observable<TipoAptidao> {
    return this.http.put<TipoAptidao>(`${this.configUrl}/tipos-aptidao/${id}`, dto);
  }

  deleteTipoAptidao(id: number): Observable<void> {
    return this.http.delete<void>(`${this.configUrl}/tipos-aptidao/${id}`);
  }

  reordenarTiposAptidao(jogoId: number, request: ReordenarRequest): Observable<void> {
    return this.http.put<void>(`${this.configUrl}/tipos-aptidao/reordenar?jogoId=${jogoId}`, request);
  }

  // ===== Níveis =====
  // Base: /api/v1/configuracoes/niveis

  listNiveis(jogoId: number): Observable<NivelConfig[]> {
    const params = new HttpParams().set('jogoId', jogoId.toString());
    return this.http.get<NivelConfig[]>(`${this.configUrl}/niveis`, { params });
  }

  getNivel(id: number): Observable<NivelConfig> {
    return this.http.get<NivelConfig>(`${this.configUrl}/niveis/${id}`);
  }

  createNivel(dto: {
    jogoId: number;
    nivel: number;
    xpNecessaria: number;
    pontosAtributo: number;
    pontosAptidao: number;
    limitadorAtributo: number;
  }): Observable<NivelConfig> {
    return this.http.post<NivelConfig>(`${this.configUrl}/niveis`, dto);
  }

  updateNivel(id: number, dto: Partial<Omit<NivelConfig, 'id' | 'jogoId' | 'dataCriacao' | 'dataUltimaAtualizacao'>>): Observable<NivelConfig> {
    return this.http.put<NivelConfig>(`${this.configUrl}/niveis/${id}`, dto);
  }

  deleteNivel(id: number): Observable<void> {
    return this.http.delete<void>(`${this.configUrl}/niveis/${id}`);
  }

  // ===== Classes =====
  // Base: /api/v1/configuracoes/classes

  listClasses(jogoId: number, nome?: string): Observable<ClassePersonagem[]> {
    let params = new HttpParams().set('jogoId', jogoId.toString());
    if (nome) {
      params = params.set('nome', nome);
    }
    return this.http.get<ClassePersonagem[]>(`${this.configUrl}/classes`, { params });
  }

  getClasse(id: number): Observable<ClassePersonagem> {
    return this.http.get<ClassePersonagem>(`${this.configUrl}/classes/${id}`);
  }

  createClasse(dto: { jogoId: number; nome: string; descricao?: string }): Observable<ClassePersonagem> {
    return this.http.post<ClassePersonagem>(`${this.configUrl}/classes`, dto);
  }

  updateClasse(id: number, dto: { nome?: string; descricao?: string }): Observable<ClassePersonagem> {
    return this.http.put<ClassePersonagem>(`${this.configUrl}/classes/${id}`, dto);
  }

  deleteClasse(id: number): Observable<void> {
    return this.http.delete<void>(`${this.configUrl}/classes/${id}`);
  }

  reordenarClasses(jogoId: number, request: ReordenarRequest): Observable<void> {
    return this.http.put<void>(`${this.configUrl}/classes/reordenar?jogoId=${jogoId}`, request);
  }

  // Sub-recursos de Classe
  listClasseBonus(classeId: number): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.configUrl}/classes/${classeId}/bonus`);
  }

  addClasseBonus(classeId: number, dto: { bonusConfigId: number }): Observable<unknown> {
    return this.http.post<unknown>(`${this.configUrl}/classes/${classeId}/bonus`, dto);
  }

  removeClasseBonus(classeId: number, bonusId: number): Observable<void> {
    return this.http.delete<void>(`${this.configUrl}/classes/${classeId}/bonus/${bonusId}`);
  }

  listClasseAptidaoBonus(classeId: number): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.configUrl}/classes/${classeId}/aptidao-bonus`);
  }

  addClasseAptidaoBonus(classeId: number, dto: { aptidaoConfigId: number }): Observable<unknown> {
    return this.http.post<unknown>(`${this.configUrl}/classes/${classeId}/aptidao-bonus`, dto);
  }

  removeClasseAptidaoBonus(classeId: number, aptidaoBonusId: number): Observable<void> {
    return this.http.delete<void>(`${this.configUrl}/classes/${classeId}/aptidao-bonus/${aptidaoBonusId}`);
  }

  // ===== Vantagens =====
  // Base: /api/v1/configuracoes/vantagens

  listVantagens(jogoId: number, nome?: string): Observable<VantagemConfig[]> {
    let params = new HttpParams().set('jogoId', jogoId.toString());
    if (nome) {
      params = params.set('nome', nome);
    }
    return this.http.get<VantagemConfig[]>(`${this.configUrl}/vantagens`, { params });
  }

  getVantagem(id: number): Observable<VantagemConfig> {
    return this.http.get<VantagemConfig>(`${this.configUrl}/vantagens/${id}`);
  }

  createVantagem(dto: CreateVantagemDto): Observable<VantagemConfig> {
    return this.http.post<VantagemConfig>(`${this.configUrl}/vantagens`, dto);
  }

  updateVantagem(id: number, dto: UpdateVantagemDto): Observable<VantagemConfig> {
    return this.http.put<VantagemConfig>(`${this.configUrl}/vantagens/${id}`, dto);
  }

  deleteVantagem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.configUrl}/vantagens/${id}`);
  }

  reordenarVantagens(jogoId: number, request: ReordenarRequest): Observable<void> {
    return this.http.put<void>(`${this.configUrl}/vantagens/reordenar?jogoId=${jogoId}`, request);
  }

  // Sub-recursos de Vantagem (pré-requisitos)
  listVantagemPreRequisitos(vantagemId: number): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.configUrl}/vantagens/${vantagemId}/prerequisitos`);
  }

  addVantagemPreRequisito(vantagemId: number, dto: { preRequisitoId: number }): Observable<unknown> {
    return this.http.post<unknown>(`${this.configUrl}/vantagens/${vantagemId}/prerequisitos`, dto);
  }

  removeVantagemPreRequisito(vantagemId: number, prId: number): Observable<void> {
    return this.http.delete<void>(`${this.configUrl}/vantagens/${vantagemId}/prerequisitos/${prId}`);
  }

  // ===== Categorias de Vantagem =====
  // ATENÇÃO: URL diferente — sem /v1/ e com jogoId no path
  // Base: /api/jogos/{jogoId}/config/categorias-vantagem

  listCategoriasVantagem(jogoId: number): Observable<CategoriaVantagem[]> {
    return this.http.get<CategoriaVantagem[]>(`/api/jogos/${jogoId}/config/categorias-vantagem`);
  }

  getCategoriaVantagem(jogoId: number, id: number): Observable<CategoriaVantagem> {
    return this.http.get<CategoriaVantagem>(`/api/jogos/${jogoId}/config/categorias-vantagem/${id}`);
  }

  createCategoriaVantagem(jogoId: number, dto: { nome: string; descricao?: string; cor?: string }): Observable<CategoriaVantagem> {
    return this.http.post<CategoriaVantagem>(`/api/jogos/${jogoId}/config/categorias-vantagem`, dto);
  }

  updateCategoriaVantagem(jogoId: number, id: number, dto: { nome?: string; descricao?: string; cor?: string }): Observable<CategoriaVantagem> {
    return this.http.put<CategoriaVantagem>(`/api/jogos/${jogoId}/config/categorias-vantagem/${id}`, dto);
  }

  deleteCategoriaVantagem(jogoId: number, id: number): Observable<void> {
    return this.http.delete<void>(`/api/jogos/${jogoId}/config/categorias-vantagem/${id}`);
  }

  // ===== Raças =====
  // Base: /api/v1/configuracoes/racas

  listRacas(jogoId: number, nome?: string): Observable<Raca[]> {
    let params = new HttpParams().set('jogoId', jogoId.toString());
    if (nome) {
      params = params.set('nome', nome);
    }
    return this.http.get<Raca[]>(`${this.configUrl}/racas`, { params });
  }

  getRaca(id: number): Observable<Raca> {
    return this.http.get<Raca>(`${this.configUrl}/racas/${id}`);
  }

  createRaca(dto: { jogoId: number; nome: string; descricao?: string }): Observable<Raca> {
    return this.http.post<Raca>(`${this.configUrl}/racas`, dto);
  }

  updateRaca(id: number, dto: { nome?: string; descricao?: string }): Observable<Raca> {
    return this.http.put<Raca>(`${this.configUrl}/racas/${id}`, dto);
  }

  deleteRaca(id: number): Observable<void> {
    return this.http.delete<void>(`${this.configUrl}/racas/${id}`);
  }

  reordenarRacas(jogoId: number, request: ReordenarRequest): Observable<void> {
    return this.http.put<void>(`${this.configUrl}/racas/reordenar?jogoId=${jogoId}`, request);
  }

  // Sub-recursos de Raça
  listRacaBonusAtributos(racaId: number): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.configUrl}/racas/${racaId}/bonus-atributos`);
  }

  addRacaBonusAtributo(racaId: number, dto: { atributoConfigId: number; bonus: number }): Observable<unknown> {
    return this.http.post<unknown>(`${this.configUrl}/racas/${racaId}/bonus-atributos`, dto);
  }

  removeRacaBonusAtributo(racaId: number, bonusAtributoId: number): Observable<void> {
    return this.http.delete<void>(`${this.configUrl}/racas/${racaId}/bonus-atributos/${bonusAtributoId}`);
  }

  listRacaClassesPermitidas(racaId: number): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.configUrl}/racas/${racaId}/classes-permitidas`);
  }

  addRacaClassePermitida(racaId: number, dto: { classeId: number }): Observable<unknown> {
    return this.http.post<unknown>(`${this.configUrl}/racas/${racaId}/classes-permitidas`, dto);
  }

  removeRacaClassePermitida(racaId: number, classePermitidaId: number): Observable<void> {
    return this.http.delete<void>(`${this.configUrl}/racas/${racaId}/classes-permitidas/${classePermitidaId}`);
  }

  // ===== Dados de Prospecção =====
  // Base: /api/v1/configuracoes/dados-prospeccao

  listDadosProspeccao(jogoId: number): Observable<DadoProspeccaoConfig[]> {
    const params = new HttpParams().set('jogoId', jogoId.toString());
    return this.http.get<DadoProspeccaoConfig[]>(`${this.configUrl}/dados-prospeccao`, { params });
  }

  getDadoProspeccao(id: number): Observable<DadoProspeccaoConfig> {
    return this.http.get<DadoProspeccaoConfig>(`${this.configUrl}/dados-prospeccao/${id}`);
  }

  createDadoProspeccao(dto: { jogoId: number; nome: string; numeroFaces: number; descricao?: string }): Observable<DadoProspeccaoConfig> {
    return this.http.post<DadoProspeccaoConfig>(`${this.configUrl}/dados-prospeccao`, dto);
  }

  updateDadoProspeccao(id: number, dto: { nome?: string; numeroFaces?: number; descricao?: string }): Observable<DadoProspeccaoConfig> {
    return this.http.put<DadoProspeccaoConfig>(`${this.configUrl}/dados-prospeccao/${id}`, dto);
  }

  deleteDadoProspeccao(id: number): Observable<void> {
    return this.http.delete<void>(`${this.configUrl}/dados-prospeccao/${id}`);
  }

  reordenarDadosProspeccao(jogoId: number, request: ReordenarRequest): Observable<void> {
    return this.http.put<void>(`${this.configUrl}/dados-prospeccao/reordenar?jogoId=${jogoId}`, request);
  }

  // ===== Presenças =====
  // Base: /api/v1/configuracoes/presencas

  listPresencas(jogoId: number, nome?: string): Observable<PresencaConfig[]> {
    let params = new HttpParams().set('jogoId', jogoId.toString());
    if (nome) {
      params = params.set('nome', nome);
    }
    return this.http.get<PresencaConfig[]>(`${this.configUrl}/presencas`, { params });
  }

  getPresenca(id: number): Observable<PresencaConfig> {
    return this.http.get<PresencaConfig>(`${this.configUrl}/presencas/${id}`);
  }

  createPresenca(dto: { jogoId: number; nome: string; descricao?: string }): Observable<PresencaConfig> {
    return this.http.post<PresencaConfig>(`${this.configUrl}/presencas`, dto);
  }

  updatePresenca(id: number, dto: { nome?: string; descricao?: string }): Observable<PresencaConfig> {
    return this.http.put<PresencaConfig>(`${this.configUrl}/presencas/${id}`, dto);
  }

  deletePresenca(id: number): Observable<void> {
    return this.http.delete<void>(`${this.configUrl}/presencas/${id}`);
  }

  reordenarPresencas(jogoId: number, request: ReordenarRequest): Observable<void> {
    return this.http.put<void>(`${this.configUrl}/presencas/reordenar?jogoId=${jogoId}`, request);
  }

  // ===== Gêneros =====
  // Base: /api/v1/configuracoes/generos

  listGeneros(jogoId: number, nome?: string): Observable<GeneroConfig[]> {
    let params = new HttpParams().set('jogoId', jogoId.toString());
    if (nome) {
      params = params.set('nome', nome);
    }
    return this.http.get<GeneroConfig[]>(`${this.configUrl}/generos`, { params });
  }

  getGenero(id: number): Observable<GeneroConfig> {
    return this.http.get<GeneroConfig>(`${this.configUrl}/generos/${id}`);
  }

  createGenero(dto: { jogoId: number; nome: string; descricao?: string }): Observable<GeneroConfig> {
    return this.http.post<GeneroConfig>(`${this.configUrl}/generos`, dto);
  }

  updateGenero(id: number, dto: { nome?: string; descricao?: string }): Observable<GeneroConfig> {
    return this.http.put<GeneroConfig>(`${this.configUrl}/generos/${id}`, dto);
  }

  deleteGenero(id: number): Observable<void> {
    return this.http.delete<void>(`${this.configUrl}/generos/${id}`);
  }

  reordenarGeneros(jogoId: number, request: ReordenarRequest): Observable<void> {
    return this.http.put<void>(`${this.configUrl}/generos/reordenar?jogoId=${jogoId}`, request);
  }

  // ===== Índoles =====
  // Base: /api/v1/configuracoes/indoles

  listIndoles(jogoId: number, nome?: string): Observable<IndoleConfig[]> {
    let params = new HttpParams().set('jogoId', jogoId.toString());
    if (nome) {
      params = params.set('nome', nome);
    }
    return this.http.get<IndoleConfig[]>(`${this.configUrl}/indoles`, { params });
  }

  getIndole(id: number): Observable<IndoleConfig> {
    return this.http.get<IndoleConfig>(`${this.configUrl}/indoles/${id}`);
  }

  createIndole(dto: { jogoId: number; nome: string; descricao?: string }): Observable<IndoleConfig> {
    return this.http.post<IndoleConfig>(`${this.configUrl}/indoles`, dto);
  }

  updateIndole(id: number, dto: { nome?: string; descricao?: string }): Observable<IndoleConfig> {
    return this.http.put<IndoleConfig>(`${this.configUrl}/indoles/${id}`, dto);
  }

  deleteIndole(id: number): Observable<void> {
    return this.http.delete<void>(`${this.configUrl}/indoles/${id}`);
  }

  reordenarIndoles(jogoId: number, request: ReordenarRequest): Observable<void> {
    return this.http.put<void>(`${this.configUrl}/indoles/reordenar?jogoId=${jogoId}`, request);
  }

  // ===== Membros do Corpo =====
  // Base: /api/v1/configuracoes/membros-corpo

  listMembrosCorpo(jogoId: number, nome?: string): Observable<MembroCorpoConfig[]> {
    let params = new HttpParams().set('jogoId', jogoId.toString());
    if (nome) {
      params = params.set('nome', nome);
    }
    return this.http.get<MembroCorpoConfig[]>(`${this.configUrl}/membros-corpo`, { params });
  }

  getMembroCorpo(id: number): Observable<MembroCorpoConfig> {
    return this.http.get<MembroCorpoConfig>(`${this.configUrl}/membros-corpo/${id}`);
  }

  createMembroCorpo(dto: { jogoId: number; nome: string; porcentagemVida: number }): Observable<MembroCorpoConfig> {
    return this.http.post<MembroCorpoConfig>(`${this.configUrl}/membros-corpo`, dto);
  }

  updateMembroCorpo(id: number, dto: { nome?: string; porcentagemVida?: number }): Observable<MembroCorpoConfig> {
    return this.http.put<MembroCorpoConfig>(`${this.configUrl}/membros-corpo/${id}`, dto);
  }

  deleteMembroCorpo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.configUrl}/membros-corpo/${id}`);
  }

  reordenarMembrosCorpo(jogoId: number, request: ReordenarRequest): Observable<void> {
    return this.http.put<void>(`${this.configUrl}/membros-corpo/reordenar?jogoId=${jogoId}`, request);
  }

  // ===== Bônus =====
  // Base: /api/v1/configuracoes/bonus

  listBonus(jogoId: number, nome?: string): Observable<BonusConfig[]> {
    let params = new HttpParams().set('jogoId', jogoId.toString());
    if (nome) {
      params = params.set('nome', nome);
    }
    return this.http.get<BonusConfig[]>(`${this.configUrl}/bonus`, { params });
  }

  getBonus(id: number): Observable<BonusConfig> {
    return this.http.get<BonusConfig>(`${this.configUrl}/bonus/${id}`);
  }

  createBonus(dto: { jogoId: number; nome: string; sigla?: string; descricao?: string; formulaBase?: string }): Observable<BonusConfig> {
    return this.http.post<BonusConfig>(`${this.configUrl}/bonus`, dto);
  }

  updateBonus(id: number, dto: { nome?: string; sigla?: string; descricao?: string; formulaBase?: string }): Observable<BonusConfig> {
    return this.http.put<BonusConfig>(`${this.configUrl}/bonus/${id}`, dto);
  }

  deleteBonus(id: number): Observable<void> {
    return this.http.delete<void>(`${this.configUrl}/bonus/${id}`);
  }

  reordenarBonus(jogoId: number, request: ReordenarRequest): Observable<void> {
    return this.http.put<void>(`${this.configUrl}/bonus/reordenar?jogoId=${jogoId}`, request);
  }

  // ===== Efeitos de Vantagem =====
  // Base: /api/v1/jogos/{jogoId}/configuracoes/vantagens/{vantagemId}/efeitos

  /**
   * GET /api/v1/jogos/{jogoId}/configuracoes/vantagens/{vantagemId}/efeitos
   * Lista efeitos de uma vantagem. MESTRE e JOGADOR podem listar.
   */
  listVantagemEfeitos(jogoId: number, vantagemId: number): Observable<VantagemEfeito[]> {
    return this.http.get<VantagemEfeito[]>(
      `${environment.apiUrl}/jogos/${jogoId}/configuracoes/vantagens/${vantagemId}/efeitos`
    );
  }

  /**
   * POST /api/v1/jogos/{jogoId}/configuracoes/vantagens/{vantagemId}/efeitos
   * Adiciona um efeito concreto a uma vantagem. Apenas MESTRE.
   */
  criarVantagemEfeito(jogoId: number, vantagemId: number, dto: CriarVantagemEfeitoDto): Observable<VantagemEfeito> {
    return this.http.post<VantagemEfeito>(
      `${environment.apiUrl}/jogos/${jogoId}/configuracoes/vantagens/${vantagemId}/efeitos`,
      dto
    );
  }

  /**
   * DELETE /api/v1/jogos/{jogoId}/configuracoes/vantagens/{vantagemId}/efeitos/{efeitoId}
   * Remove um efeito de uma vantagem. Apenas MESTRE.
   */
  deletarVantagemEfeito(jogoId: number, vantagemId: number, efeitoId: number): Observable<void> {
    return this.http.delete<void>(
      `${environment.apiUrl}/jogos/${jogoId}/configuracoes/vantagens/${vantagemId}/efeitos/${efeitoId}`
    );
  }
}
