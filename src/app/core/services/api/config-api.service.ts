import { ClassePontosConfig, ClassePontosConfigRequest } from '@core/models/classe-pontos-config.model';
import { ClasseVantagemPreDefinida, ClasseVantagemPreDefinidaRequest } from '@core/models/classe-vantagem-predefinida.model';
import { HabilidadeConfig, CreateHabilidadeConfigDto, UpdateHabilidadeConfigDto } from '@core/models/habilidade-config.model';
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RaridadeItemConfig, CreateRaridadeItemDto, UpdateRaridadeItemDto } from '@core/models/raridade-item-config.model';
import { TipoItemConfig, CreateTipoItemDto, UpdateTipoItemDto } from '@core/models/tipo-item-config.model';
import {
  ItemConfigResumo,
  ItemConfigResponse,
  CreateItemConfigDto,
  UpdateItemConfigDto,
  ItemEfeitoResponse,
  ItemEfeitoRequest,
  ItemRequisitoResponse,
  ItemRequisitoRequest,
  PageResponse,
} from '@core/models/item-config.model';
import { CategoriaItem } from '@core/models/tipo-item-config.model';
import { ClasseEquipamentoInicial, CreateClasseEquipamentoInicialDto, UpdateClasseEquipamentoInicialDto } from '@core/models/classe-equipamento-inicial.model';
import { AtributoConfig, CreateAtributoDto, UpdateAtributoDto } from '@core/models/atributo-config.model';
import { AptidaoConfig, CreateAptidaoDto, UpdateAptidaoDto } from '@core/models/aptidao-config.model';
import { TipoAptidao } from '@core/models/tipo-aptidao.model';
import { VantagemConfig, VantagemPreRequisito, AddPreRequisitoDto, CreateVantagemDto, UpdateVantagemDto } from '@core/models/vantagem-config.model';
import { VantagemEfeito, CriarVantagemEfeitoDto } from '@core/models/vantagem-efeito.model';
import {
  PontosVantagemConfig,
  CategoriaVantagem,
  ClasseBonusConfig,
  ClasseAptidaoBonus,
  ClassePersonagem,
  Raca,
  RacaBonusAtributo,
  RacaClassePermitida,
  RacaPontosConfig,
  RacaPontosConfigRequest,
  RacaVantagemPreDefinida,
  RacaVantagemPreDefinidaRequest,
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
  listClasseBonus(classeId: number): Observable<ClasseBonusConfig[]> {
    return this.http.get<ClasseBonusConfig[]>(`${this.configUrl}/classes/${classeId}/bonus`);
  }

  addClasseBonus(classeId: number, dto: { bonusConfigId: number; valorPorNivel: number }): Observable<ClasseBonusConfig> {
    return this.http.post<ClasseBonusConfig>(`${this.configUrl}/classes/${classeId}/bonus`, dto);
  }

  removeClasseBonus(classeId: number, bonusId: number): Observable<void> {
    return this.http.delete<void>(`${this.configUrl}/classes/${classeId}/bonus/${bonusId}`);
  }

  listClasseAptidaoBonus(classeId: number): Observable<ClasseAptidaoBonus[]> {
    return this.http.get<ClasseAptidaoBonus[]>(`${this.configUrl}/classes/${classeId}/aptidao-bonus`);
  }

  addClasseAptidaoBonus(classeId: number, dto: { aptidaoConfigId: number; bonus: number }): Observable<ClasseAptidaoBonus> {
    return this.http.post<ClasseAptidaoBonus>(`${this.configUrl}/classes/${classeId}/aptidao-bonus`, dto);
  }

  removeClasseAptidaoBonus(classeId: number, aptidaoBonusId: number): Observable<void> {
    return this.http.delete<void>(`${this.configUrl}/classes/${classeId}/aptidao-bonus/${aptidaoBonusId}`);
  }

  // Sub-recursos de ClassePontosConfig
  listClassePontosConfig(classeId: number): Observable<ClassePontosConfig[]> {
    return this.http.get<ClassePontosConfig[]>(`${this.configUrl}/classes/${classeId}/pontos-config`);
  }

  addClassePontosConfig(classeId: number, dto: ClassePontosConfigRequest): Observable<ClassePontosConfig> {
    return this.http.post<ClassePontosConfig>(`${this.configUrl}/classes/${classeId}/pontos-config`, dto);
  }

  updateClassePontosConfig(classeId: number, pontosConfigId: number, dto: ClassePontosConfigRequest): Observable<ClassePontosConfig> {
    return this.http.put<ClassePontosConfig>(`${this.configUrl}/classes/${classeId}/pontos-config/${pontosConfigId}`, dto);
  }

  removeClassePontosConfig(classeId: number, pontosConfigId: number): Observable<void> {
    return this.http.delete<void>(`${this.configUrl}/classes/${classeId}/pontos-config/${pontosConfigId}`);
  }

  // Sub-recursos de ClasseVantagemPreDefinida
  listClasseVantagensPreDefinidas(classeId: number): Observable<ClasseVantagemPreDefinida[]> {
    return this.http.get<ClasseVantagemPreDefinida[]>(`${this.configUrl}/classes/${classeId}/vantagens-predefinidas`);
  }

  addClasseVantagemPreDefinida(classeId: number, dto: ClasseVantagemPreDefinidaRequest): Observable<ClasseVantagemPreDefinida> {
    return this.http.post<ClasseVantagemPreDefinida>(`${this.configUrl}/classes/${classeId}/vantagens-predefinidas`, dto);
  }

  removeClasseVantagemPreDefinida(classeId: number, predefinidaId: number): Observable<void> {
    return this.http.delete<void>(`${this.configUrl}/classes/${classeId}/vantagens-predefinidas/${predefinidaId}`);
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

  // Sub-recursos de Vantagem (pré-requisitos polimórficos)
  listVantagemPreRequisitos(vantagemId: number): Observable<VantagemPreRequisito[]> {
    return this.http.get<VantagemPreRequisito[]>(`${this.configUrl}/vantagens/${vantagemId}/prerequisitos`);
  }

  addVantagemPreRequisito(vantagemId: number, dto: AddPreRequisitoDto): Observable<VantagemPreRequisito> {
    return this.http.post<VantagemPreRequisito>(`${this.configUrl}/vantagens/${vantagemId}/prerequisitos`, dto);
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

  // ===== Pontos de Vantagem =====
  // ATENÇÃO: URL diferente — sem /v1/ e com jogoId no path
  // Base: /api/jogos/{jogoId}/config/pontos-vantagem

  listPontosVantagem(jogoId: number): Observable<PontosVantagemConfig[]> {
    return this.http.get<PontosVantagemConfig[]>(`/api/jogos/${jogoId}/config/pontos-vantagem`);
  }

  getPontosVantagem(jogoId: number, id: number): Observable<PontosVantagemConfig> {
    return this.http.get<PontosVantagemConfig>(`/api/jogos/${jogoId}/config/pontos-vantagem/${id}`);
  }

  createPontosVantagem(jogoId: number, dto: { nivel: number; pontosGanhos: number }): Observable<PontosVantagemConfig> {
    return this.http.post<PontosVantagemConfig>(`/api/jogos/${jogoId}/config/pontos-vantagem`, dto);
  }

  updatePontosVantagem(jogoId: number, id: number, dto: { nivel?: number; pontosGanhos?: number }): Observable<PontosVantagemConfig> {
    return this.http.put<PontosVantagemConfig>(`/api/jogos/${jogoId}/config/pontos-vantagem/${id}`, dto);
  }

  deletePontosVantagem(jogoId: number, id: number): Observable<void> {
    return this.http.delete<void>(`/api/jogos/${jogoId}/config/pontos-vantagem/${id}`);
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
  listRacaBonusAtributos(racaId: number): Observable<RacaBonusAtributo[]> {
    return this.http.get<RacaBonusAtributo[]>(`${this.configUrl}/racas/${racaId}/bonus-atributos`);
  }

  addRacaBonusAtributo(racaId: number, dto: { atributoConfigId: number; bonus: number }): Observable<RacaBonusAtributo> {
    return this.http.post<RacaBonusAtributo>(`${this.configUrl}/racas/${racaId}/bonus-atributos`, dto);
  }

  removeRacaBonusAtributo(racaId: number, bonusAtributoId: number): Observable<void> {
    return this.http.delete<void>(`${this.configUrl}/racas/${racaId}/bonus-atributos/${bonusAtributoId}`);
  }

  listRacaClassesPermitidas(racaId: number): Observable<RacaClassePermitida[]> {
    return this.http.get<RacaClassePermitida[]>(`${this.configUrl}/racas/${racaId}/classes-permitidas`);
  }

  addRacaClassePermitida(racaId: number, dto: { classeId: number }): Observable<RacaClassePermitida> {
    return this.http.post<RacaClassePermitida>(`${this.configUrl}/racas/${racaId}/classes-permitidas`, dto);
  }

  removeRacaClassePermitida(racaId: number, classePermitidaId: number): Observable<void> {
    return this.http.delete<void>(`${this.configUrl}/racas/${racaId}/classes-permitidas/${classePermitidaId}`);
  }

  // Sub-recursos de Raça — Pontos por Nível
  listRacaPontosConfig(racaId: number): Observable<RacaPontosConfig[]> {
    return this.http.get<RacaPontosConfig[]>(`${this.configUrl}/racas/${racaId}/pontos-config`);
  }

  createRacaPontosConfig(racaId: number, dto: RacaPontosConfigRequest): Observable<RacaPontosConfig> {
    return this.http.post<RacaPontosConfig>(`${this.configUrl}/racas/${racaId}/pontos-config`, dto);
  }

  updateRacaPontosConfig(racaId: number, pontosConfigId: number, dto: RacaPontosConfigRequest): Observable<RacaPontosConfig> {
    return this.http.put<RacaPontosConfig>(`${this.configUrl}/racas/${racaId}/pontos-config/${pontosConfigId}`, dto);
  }

  deleteRacaPontosConfig(racaId: number, pontosConfigId: number): Observable<void> {
    return this.http.delete<void>(`${this.configUrl}/racas/${racaId}/pontos-config/${pontosConfigId}`);
  }

  // Sub-recursos de Raça — Vantagens Pré-Definidas
  listRacaVantagensPreDefinidas(racaId: number): Observable<RacaVantagemPreDefinida[]> {
    return this.http.get<RacaVantagemPreDefinida[]>(`${this.configUrl}/racas/${racaId}/vantagens-predefinidas`);
  }

  createRacaVantagemPreDefinida(racaId: number, dto: RacaVantagemPreDefinidaRequest): Observable<RacaVantagemPreDefinida> {
    return this.http.post<RacaVantagemPreDefinida>(`${this.configUrl}/racas/${racaId}/vantagens-predefinidas`, dto);
  }

  deleteRacaVantagemPreDefinida(racaId: number, predefinidaId: number): Observable<void> {
    return this.http.delete<void>(`${this.configUrl}/racas/${racaId}/vantagens-predefinidas/${predefinidaId}`);
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

  // ===== Raridades de Item =====
  // Base: /api/v1/configuracoes/raridades-item

  listRaridadesItem(jogoId: number): Observable<RaridadeItemConfig[]> {
    const params = new HttpParams().set('jogoId', jogoId.toString());
    return this.http.get<RaridadeItemConfig[]>(`${this.configUrl}/raridades-item`, { params });
  }

  getRaridadeItem(id: number): Observable<RaridadeItemConfig> {
    return this.http.get<RaridadeItemConfig>(`${this.configUrl}/raridades-item/${id}`);
  }

  createRaridadeItem(dto: CreateRaridadeItemDto): Observable<RaridadeItemConfig> {
    return this.http.post<RaridadeItemConfig>(`${this.configUrl}/raridades-item`, dto);
  }

  updateRaridadeItem(id: number, dto: UpdateRaridadeItemDto): Observable<RaridadeItemConfig> {
    return this.http.put<RaridadeItemConfig>(`${this.configUrl}/raridades-item/${id}`, dto);
  }

  deleteRaridadeItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.configUrl}/raridades-item/${id}`);
  }

  // ===== Tipos de Item =====
  // Base: /api/v1/configuracoes/tipos-item

  listTiposItem(jogoId: number): Observable<TipoItemConfig[]> {
    const params = new HttpParams().set('jogoId', jogoId.toString());
    return this.http.get<TipoItemConfig[]>(`${this.configUrl}/tipos-item`, { params });
  }

  getTipoItem(id: number): Observable<TipoItemConfig> {
    return this.http.get<TipoItemConfig>(`${this.configUrl}/tipos-item/${id}`);
  }

  createTipoItem(dto: CreateTipoItemDto): Observable<TipoItemConfig> {
    return this.http.post<TipoItemConfig>(`${this.configUrl}/tipos-item`, dto);
  }

  updateTipoItem(id: number, dto: UpdateTipoItemDto): Observable<TipoItemConfig> {
    return this.http.put<TipoItemConfig>(`${this.configUrl}/tipos-item/${id}`, dto);
  }

  deleteTipoItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.configUrl}/tipos-item/${id}`);
  }

  // ===== Itens (ItemConfig) =====
  // Base: /api/v1/configuracoes/itens

  listItens(
    jogoId: number,
    page = 0,
    size = 20,
    nomeQuery?: string,
    raridadeId?: number,
    categoriaItem?: CategoriaItem,
  ): Observable<PageResponse<ItemConfigResumo>> {
    let params = new HttpParams()
      .set('jogoId', jogoId.toString())
      .set('page', page.toString())
      .set('size', size.toString());
    if (nomeQuery) params = params.set('nomeQuery', nomeQuery);
    if (raridadeId) params = params.set('raridadeId', raridadeId.toString());
    if (categoriaItem) params = params.set('categoriaItem', categoriaItem);
    return this.http.get<PageResponse<ItemConfigResumo>>(`${this.configUrl}/itens`, { params });
  }

  getItem(id: number): Observable<ItemConfigResponse> {
    return this.http.get<ItemConfigResponse>(`${this.configUrl}/itens/${id}`);
  }

  createItem(dto: CreateItemConfigDto): Observable<ItemConfigResponse> {
    return this.http.post<ItemConfigResponse>(`${this.configUrl}/itens`, dto);
  }

  updateItem(id: number, dto: UpdateItemConfigDto): Observable<ItemConfigResponse> {
    return this.http.put<ItemConfigResponse>(`${this.configUrl}/itens/${id}`, dto);
  }

  deleteItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.configUrl}/itens/${id}`);
  }

  // ItemEfeito sub-resource

  listItemEfeitos(itemId: number): Observable<ItemEfeitoResponse[]> {
    return this.http.get<ItemEfeitoResponse[]>(`${this.configUrl}/itens/${itemId}/efeitos`);
  }

  addItemEfeito(itemId: number, dto: ItemEfeitoRequest): Observable<ItemEfeitoResponse> {
    return this.http.post<ItemEfeitoResponse>(`${this.configUrl}/itens/${itemId}/efeitos`, dto);
  }

  updateItemEfeito(itemId: number, efeitoId: number, dto: ItemEfeitoRequest): Observable<ItemEfeitoResponse> {
    return this.http.put<ItemEfeitoResponse>(`${this.configUrl}/itens/${itemId}/efeitos/${efeitoId}`, dto);
  }

  removeItemEfeito(itemId: number, efeitoId: number): Observable<void> {
    return this.http.delete<void>(`${this.configUrl}/itens/${itemId}/efeitos/${efeitoId}`);
  }

  // ItemRequisito sub-resource

  listItemRequisitos(itemId: number): Observable<ItemRequisitoResponse[]> {
    return this.http.get<ItemRequisitoResponse[]>(`${this.configUrl}/itens/${itemId}/requisitos`);
  }

  addItemRequisito(itemId: number, dto: ItemRequisitoRequest): Observable<ItemRequisitoResponse> {
    return this.http.post<ItemRequisitoResponse>(`${this.configUrl}/itens/${itemId}/requisitos`, dto);
  }

  removeItemRequisito(itemId: number, requisitoId: number): Observable<void> {
    return this.http.delete<void>(`${this.configUrl}/itens/${itemId}/requisitos/${requisitoId}`);
  }

  // ===== Equipamentos Iniciais de Classe =====
  // Base: /api/v1/configuracoes/classes/{classeId}/equipamentos-iniciais

  listClasseEquipamentosIniciais(classeId: number): Observable<ClasseEquipamentoInicial[]> {
    return this.http.get<ClasseEquipamentoInicial[]>(`${this.configUrl}/classes/${classeId}/equipamentos-iniciais`);
  }

  addClasseEquipamentoInicial(classeId: number, dto: CreateClasseEquipamentoInicialDto): Observable<ClasseEquipamentoInicial> {
    return this.http.post<ClasseEquipamentoInicial>(`${this.configUrl}/classes/${classeId}/equipamentos-iniciais`, dto);
  }

  updateClasseEquipamentoInicial(classeId: number, id: number, dto: UpdateClasseEquipamentoInicialDto): Observable<ClasseEquipamentoInicial> {
    return this.http.put<ClasseEquipamentoInicial>(`${this.configUrl}/classes/${classeId}/equipamentos-iniciais/${id}`, dto);
  }

  removeClasseEquipamentoInicial(classeId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.configUrl}/classes/${classeId}/equipamentos-iniciais/${id}`);
  }

  // ===== Habilidades =====
  // Base: /api/jogos/{jogoId}/config/habilidades  (sem /v1/ — mesmo padrão de CategoriaVantagem)
  // Diferença: MESTRE e JOGADOR têm permissões simétricas (POST, PUT, DELETE)

  listHabilidades(jogoId: number): Observable<HabilidadeConfig[]> {
    return this.http.get<HabilidadeConfig[]>(`/api/jogos/${jogoId}/config/habilidades`);
  }

  getHabilidade(jogoId: number, id: number): Observable<HabilidadeConfig> {
    return this.http.get<HabilidadeConfig>(`/api/jogos/${jogoId}/config/habilidades/${id}`);
  }

  createHabilidade(jogoId: number, dto: CreateHabilidadeConfigDto, context?: HttpContext): Observable<HabilidadeConfig> {
    return this.http.post<HabilidadeConfig>(`/api/jogos/${jogoId}/config/habilidades`, dto, { context });
  }

  updateHabilidade(jogoId: number, id: number, dto: UpdateHabilidadeConfigDto, context?: HttpContext): Observable<HabilidadeConfig> {
    return this.http.put<HabilidadeConfig>(`/api/jogos/${jogoId}/config/habilidades/${id}`, dto, { context });
  }

  deleteHabilidade(jogoId: number, id: number): Observable<void> {
    return this.http.delete<void>(`/api/jogos/${jogoId}/config/habilidades/${id}`);
  }
}
