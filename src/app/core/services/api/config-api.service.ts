import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AtributoConfig,
  AptidaoConfig,
  TipoAptidao,
  NivelConfig,
  LimitadorConfig,
  ClassePersonagem,
  VantagemConfig,
  CategoriaVantagem,
  Raca,
  ProspeccaoConfig,
  PresencaConfig,
  GeneroConfig, IndoleConfig, MembroCorpoConfig, BonusConfig
} from '../../models';
import { environment } from '../../../../environments/environment';

/**
 * API Service for Configuration endpoints
 * Mestre only - used to configure game system
 */
@Injectable({
  providedIn: 'root'
})
export class ConfigApiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/configuracoes`;

  // ===== Atributos (Attributes) =====

  listAtributos(): Observable<AtributoConfig[]> {
    return this.http.get<AtributoConfig[]>(`${this.baseUrl}/atributos`);
  }

  createAtributo(config: Partial<AtributoConfig>): Observable<AtributoConfig> {
    return this.http.post<AtributoConfig>(`${this.baseUrl}/atributos`, config);
  }

  updateAtributo(id: number, config: Partial<AtributoConfig>): Observable<AtributoConfig> {
    return this.http.put<AtributoConfig>(`${this.baseUrl}/atributos/${id}`, config);
  }

  deleteAtributo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/atributos/${id}`);
  }

  // ===== Aptidões (Skills) =====

  listAptidoes(): Observable<AptidaoConfig[]> {
    return this.http.get<AptidaoConfig[]>(`${this.baseUrl}/aptidoes`);
  }

  createAptidao(config: Partial<AptidaoConfig>): Observable<AptidaoConfig> {
    return this.http.post<AptidaoConfig>(`${this.baseUrl}/aptidoes`, config);
  }

  updateAptidao(id: number, config: Partial<AptidaoConfig>): Observable<AptidaoConfig> {
    return this.http.put<AptidaoConfig>(`${this.baseUrl}/aptidoes/${id}`, config);
  }

  deleteAptidao(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/aptidoes/${id}`);
  }

  listTiposAptidao(): Observable<TipoAptidao[]> {
    return this.http.get<TipoAptidao[]>(`${this.baseUrl}/tipos-aptidao`);
  }

  // ===== Níveis (Levels) =====

  listNiveis(jogoId: number): Observable<NivelConfig[]> {
    return this.http.get<NivelConfig[]>(`${this.baseUrl}/niveis`, {
      params: { jogoId: jogoId.toString() }
    });
  }

  createNivel(config: Partial<NivelConfig>): Observable<NivelConfig> {
    return this.http.post<NivelConfig>(`${this.baseUrl}/niveis`, config);
  }

  updateNivel(id: number, config: Partial<NivelConfig>): Observable<NivelConfig> {
    return this.http.put<NivelConfig>(`${this.baseUrl}/niveis/${id}`, config);
  }

  deleteNivel(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/niveis/${id}`);
  }

  // ===== Limitadores (Limiters) =====

  listLimitadores(jogoId: number): Observable<LimitadorConfig[]> {
    return this.http.get<LimitadorConfig[]>(`${this.baseUrl}/limitadores`, {
      params: { jogoId: jogoId.toString() }
    });
  }

   createLimitador(config: Partial<LimitadorConfig>): Observable<LimitadorConfig> {
    return (this.http.post<LimitadorConfig>(`${this.baseUrl}/limitadores`, config));
  }

   updateLimitador(id: number, config: Partial<LimitadorConfig>): Observable<LimitadorConfig> {
    return (this.http.put<LimitadorConfig>(`${this.baseUrl}/limitadores/${id}`, config));
  }

   deleteLimitador(id: number): Observable<void> {
    return (this.http.delete<void>(`${this.baseUrl}/limitadores/${id}`));
  }

  // ===== Classes (Character Classes) =====

   listClasses(jogoId: number): Observable<ClassePersonagem[]> {
    return (this.http.get<ClassePersonagem[]>(`${this.baseUrl}/classes`, {
      params: { jogoId: jogoId.toString() }
    }));
  }

   createClasse(config: Partial<ClassePersonagem>): Observable<ClassePersonagem> {
    return (this.http.post<ClassePersonagem>(`${this.baseUrl}/classes`, config));
  }

   updateClasse(id: number, config: Partial<ClassePersonagem>): Observable<ClassePersonagem> {
    return (this.http.put<ClassePersonagem>(`${this.baseUrl}/classes/${id}`, config));
  }

   deleteClasse(id: number): Observable<void> {
    return (this.http.delete<void>(`${this.baseUrl}/classes/${id}`));
  }

  // ===== Vantagens (Advantages) =====

   listVantagens(jogoId: number): Observable<VantagemConfig[]> {
    return (this.http.get<VantagemConfig[]>(`${this.baseUrl}/vantagens`, {
      params: { jogoId: jogoId.toString() }
    }));
  }

   createVantagem(config: Partial<VantagemConfig>): Observable<VantagemConfig> {
    return (this.http.post<VantagemConfig>(`${this.baseUrl}/vantagens`, config));
  }

   updateVantagem(id: number, config: Partial<VantagemConfig>): Observable<VantagemConfig> {
    return (this.http.put<VantagemConfig>(`${this.baseUrl}/vantagens/${id}`, config));
  }

   deleteVantagem(id: number): Observable<void> {
    return (this.http.delete<void>(`${this.baseUrl}/vantagens/${id}`));
  }

  // ===== Categorias de Vantagem (Advantage Categories) =====

   listCategoriasVantagem(): Observable<CategoriaVantagem[]> {
    return (this.http.get<CategoriaVantagem[]>(`${this.baseUrl}/categorias-vantagem`));
  }

   createCategoriaVantagem(config: Partial<CategoriaVantagem>): Observable<CategoriaVantagem> {
    return (this.http.post<CategoriaVantagem>(`${this.baseUrl}/categorias-vantagem`, config));
  }

   updateCategoriaVantagem(id: number, config: Partial<CategoriaVantagem>): Observable<CategoriaVantagem> {
    return (this.http.put<CategoriaVantagem>(`${this.baseUrl}/categorias-vantagem/${id}`, config));
  }

   deleteCategoriaVantagem(id: number): Observable<void> {
    return (this.http.delete<void>(`${this.baseUrl}/categorias-vantagem/${id}`));
  }

  // ===== Raças (Races) =====

   listRacas(jogoId: number): Observable<Raca[]> {
    return (this.http.get<Raca[]>(`${this.baseUrl}/racas`, {
      params: { jogoId: jogoId.toString() }
    }));
  }

   createRaca(config: Partial<Raca>): Observable<Raca> {
    return (this.http.post<Raca>(`${this.baseUrl}/racas`, config));
  }

   updateRaca(id: number, config: Partial<Raca>): Observable<Raca> {
    return (this.http.put<Raca>(`${this.baseUrl}/racas/${id}`, config));
  }

   deleteRaca(id: number): Observable<void> {
    return (this.http.delete<void>(`${this.baseUrl}/racas/${id}`));
  }

  // ===== Prospecção (Prospecting Dice) =====

   listProspeccao(jogoId: number): Observable<ProspeccaoConfig[]> {
    return (this.http.get<ProspeccaoConfig[]>(`${this.baseUrl}/prospeccao`, {
      params: { jogoId: jogoId.toString() }
    }));
  }

   createProspeccao(config: Partial<ProspeccaoConfig>): Observable<ProspeccaoConfig> {
    return (this.http.post<ProspeccaoConfig>(`${this.baseUrl}/prospeccao`, config));
  }

   updateProspeccao(id: number, config: Partial<ProspeccaoConfig>): Observable<ProspeccaoConfig> {
    return (this.http.put<ProspeccaoConfig>(`${this.baseUrl}/prospeccao/${id}`, config));
  }

   deleteProspeccao(id: number): Observable<void> {
    return (this.http.delete<void>(`${this.baseUrl}/prospeccao/${id}`));
  }

  // ===== Presenças (Presences/Auras) =====

   listPresencas(jogoId: number): Observable<PresencaConfig[]> {
    return (this.http.get<PresencaConfig[]>(`${this.baseUrl}/presencas`, {
      params: { jogoId: jogoId.toString() }
    }));
  }

   createPresenca(config: Partial<PresencaConfig>): Observable<PresencaConfig> {
    return (this.http.post<PresencaConfig>(`${this.baseUrl}/presencas`, config));
  }

   updatePresenca(id: number, config: Partial<PresencaConfig>): Observable<PresencaConfig> {
    return (this.http.put<PresencaConfig>(`${this.baseUrl}/presencas/${id}`, config));
  }

   deletePresenca(id: number): Observable<void> {
    return (this.http.delete<void>(`${this.baseUrl}/presencas/${id}`));
  }

  // ===== Gêneros (Genders) =====

   listGeneros(jogoId: number): Observable<GeneroConfig[]> {
    return (this.http.get<GeneroConfig[]>(`${this.baseUrl}/generos`, {
      params: { jogoId: jogoId.toString() }
    }));
  }

   createGenero(config: Partial<GeneroConfig>): Observable<GeneroConfig> {
    return (this.http.post<GeneroConfig>(`${this.baseUrl}/generos`, config));
  }

   updateGenero(id: number, config: Partial<GeneroConfig>): Observable<GeneroConfig> {
    return (this.http.put<GeneroConfig>(`${this.baseUrl}/generos/${id}`, config));
  }

   deleteGenero(id: number): Observable<void> {
    return (this.http.delete<void>(`${this.baseUrl}/generos/${id}`));
  }

  // ===== Índoles (Alignments) =====

  listIndoles(jogoId: number): Observable<IndoleConfig[]> {
    return this.http.get<IndoleConfig[]>(`${this.baseUrl}/indoles`, {
      params: { jogoId: jogoId.toString() }
    });
  }

  createIndole(config: Partial<IndoleConfig>): Observable<IndoleConfig> {
    return this.http.post<IndoleConfig>(`${this.baseUrl}/indoles`, config);
  }

  updateIndole(id: number, config: Partial<IndoleConfig>): Observable<IndoleConfig> {
    return this.http.put<IndoleConfig>(`${this.baseUrl}/indoles/${id}`, config);
  }

  deleteIndole(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/indoles/${id}`);
  }

  // ===== Membros do Corpo (Body Parts) =====

  listMembrosCorpo(jogoId: number): Observable<MembroCorpoConfig[]> {
    return this.http.get<MembroCorpoConfig[]>(`${this.baseUrl}/membros-corpo`, {
      params: { jogoId: jogoId.toString() }
    });
  }

  createMembroCorpo(config: Partial<MembroCorpoConfig>): Observable<MembroCorpoConfig> {
    return this.http.post<MembroCorpoConfig>(`${this.baseUrl}/membros-corpo`, config);
  }

  updateMembroCorpo(id: number, config: Partial<MembroCorpoConfig>): Observable<MembroCorpoConfig> {
    return this.http.put<MembroCorpoConfig>(`${this.baseUrl}/membros-corpo/${id}`, config);
  }

  deleteMembroCorpo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/membros-corpo/${id}`);
  }

  // ===== Bônus (Bonuses) =====

  listBonus(jogoId: number): Observable<BonusConfig[]> {
    return this.http.get<BonusConfig[]>(`${this.baseUrl}/bonus`, {
      params: { jogoId: jogoId.toString() }
    });
  }

  createBonus(config: Partial<BonusConfig>): Observable<BonusConfig> {
    return this.http.post<BonusConfig>(`${this.baseUrl}/bonus`, config);
  }

  updateBonus(id: number, config: Partial<BonusConfig>): Observable<BonusConfig> {
    return this.http.put<BonusConfig>(`${this.baseUrl}/bonus/${id}`, config);
  }

  deleteBonus(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/bonus/${id}`);
  }
}
