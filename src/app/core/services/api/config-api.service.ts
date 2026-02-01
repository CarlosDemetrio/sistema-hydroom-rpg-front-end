import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
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
  GeneroConfig
} from '../../models';
import { environment } from '../../../../environments/environment';

/**
 * API Service for Configuration endpoints
 * Handles all HTTP communication with /api/config/*
 * Mestre only - used to configure game system
 */
@Injectable({
  providedIn: 'root'
})
export class ConfigApiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/config`;

  // ===== Atributos (Attributes) =====

  async listAtributos(): Promise<AtributoConfig[]> {
    return firstValueFrom(this.http.get<AtributoConfig[]>(`${this.baseUrl}/atributos`));
  }

  async createAtributo(config: Partial<AtributoConfig>): Promise<AtributoConfig> {
    return firstValueFrom(this.http.post<AtributoConfig>(`${this.baseUrl}/atributos`, config));
  }

  async updateAtributo(id: number, config: Partial<AtributoConfig>): Promise<AtributoConfig> {
    return firstValueFrom(this.http.put<AtributoConfig>(`${this.baseUrl}/atributos/${id}`, config));
  }

  async deleteAtributo(id: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.baseUrl}/atributos/${id}`));
  }

  // ===== Aptidões (Skills) =====

  async listAptidoes(): Promise<AptidaoConfig[]> {
    return firstValueFrom(this.http.get<AptidaoConfig[]>(`${this.baseUrl}/aptidoes`));
  }

  async createAptidao(config: Partial<AptidaoConfig>): Promise<AptidaoConfig> {
    return firstValueFrom(this.http.post<AptidaoConfig>(`${this.baseUrl}/aptidoes`, config));
  }

  async updateAptidao(id: number, config: Partial<AptidaoConfig>): Promise<AptidaoConfig> {
    return firstValueFrom(this.http.put<AptidaoConfig>(`${this.baseUrl}/aptidoes/${id}`, config));
  }

  async deleteAptidao(id: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.baseUrl}/aptidoes/${id}`));
  }

  // ===== Tipos de Aptidão (Skill Types) =====

  async listTiposAptidao(): Promise<TipoAptidao[]> {
    return firstValueFrom(this.http.get<TipoAptidao[]>(`${this.baseUrl}/tipos-aptidao`));
  }

  // ===== Níveis (Levels) =====

  async listNiveis(): Promise<NivelConfig[]> {
    return firstValueFrom(this.http.get<NivelConfig[]>(`${this.baseUrl}/niveis`));
  }

  async createNivel(config: Partial<NivelConfig>): Promise<NivelConfig> {
    return firstValueFrom(this.http.post<NivelConfig>(`${this.baseUrl}/niveis`, config));
  }

  async updateNivel(id: number, config: Partial<NivelConfig>): Promise<NivelConfig> {
    return firstValueFrom(this.http.put<NivelConfig>(`${this.baseUrl}/niveis/${id}`, config));
  }

  async deleteNivel(id: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.baseUrl}/niveis/${id}`));
  }

  // ===== Limitadores (Limiters) =====

  async listLimitadores(): Promise<LimitadorConfig[]> {
    return firstValueFrom(this.http.get<LimitadorConfig[]>(`${this.baseUrl}/limitadores`));
  }

  async createLimitador(config: Partial<LimitadorConfig>): Promise<LimitadorConfig> {
    return firstValueFrom(this.http.post<LimitadorConfig>(`${this.baseUrl}/limitadores`, config));
  }

  async updateLimitador(id: number, config: Partial<LimitadorConfig>): Promise<LimitadorConfig> {
    return firstValueFrom(this.http.put<LimitadorConfig>(`${this.baseUrl}/limitadores/${id}`, config));
  }

  async deleteLimitador(id: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.baseUrl}/limitadores/${id}`));
  }

  // ===== Classes (Character Classes) =====

  async listClasses(): Promise<ClassePersonagem[]> {
    return firstValueFrom(this.http.get<ClassePersonagem[]>(`${this.baseUrl}/classes`));
  }

  async createClasse(config: Partial<ClassePersonagem>): Promise<ClassePersonagem> {
    return firstValueFrom(this.http.post<ClassePersonagem>(`${this.baseUrl}/classes`, config));
  }

  async updateClasse(id: number, config: Partial<ClassePersonagem>): Promise<ClassePersonagem> {
    return firstValueFrom(this.http.put<ClassePersonagem>(`${this.baseUrl}/classes/${id}`, config));
  }

  async deleteClasse(id: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.baseUrl}/classes/${id}`));
  }

  // ===== Vantagens (Advantages) =====

  async listVantagens(): Promise<VantagemConfig[]> {
    return firstValueFrom(this.http.get<VantagemConfig[]>(`${this.baseUrl}/vantagens`));
  }

  async createVantagem(config: Partial<VantagemConfig>): Promise<VantagemConfig> {
    return firstValueFrom(this.http.post<VantagemConfig>(`${this.baseUrl}/vantagens`, config));
  }

  async updateVantagem(id: number, config: Partial<VantagemConfig>): Promise<VantagemConfig> {
    return firstValueFrom(this.http.put<VantagemConfig>(`${this.baseUrl}/vantagens/${id}`, config));
  }

  async deleteVantagem(id: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.baseUrl}/vantagens/${id}`));
  }

  // ===== Categorias de Vantagem (Advantage Categories) =====

  async listCategoriasVantagem(): Promise<CategoriaVantagem[]> {
    return firstValueFrom(this.http.get<CategoriaVantagem[]>(`${this.baseUrl}/categorias-vantagem`));
  }

  async createCategoriaVantagem(config: Partial<CategoriaVantagem>): Promise<CategoriaVantagem> {
    return firstValueFrom(this.http.post<CategoriaVantagem>(`${this.baseUrl}/categorias-vantagem`, config));
  }

  async updateCategoriaVantagem(id: number, config: Partial<CategoriaVantagem>): Promise<CategoriaVantagem> {
    return firstValueFrom(this.http.put<CategoriaVantagem>(`${this.baseUrl}/categorias-vantagem/${id}`, config));
  }

  async deleteCategoriaVantagem(id: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.baseUrl}/categorias-vantagem/${id}`));
  }

  // ===== Raças (Races) =====

  async listRacas(): Promise<Raca[]> {
    return firstValueFrom(this.http.get<Raca[]>(`${this.baseUrl}/racas`));
  }

  async createRaca(config: Partial<Raca>): Promise<Raca> {
    return firstValueFrom(this.http.post<Raca>(`${this.baseUrl}/racas`, config));
  }

  async updateRaca(id: number, config: Partial<Raca>): Promise<Raca> {
    return firstValueFrom(this.http.put<Raca>(`${this.baseUrl}/racas/${id}`, config));
  }

  async deleteRaca(id: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.baseUrl}/racas/${id}`));
  }

  // ===== Prospecção (Prospecting Dice) =====

  async listProspeccao(): Promise<ProspeccaoConfig[]> {
    return firstValueFrom(this.http.get<ProspeccaoConfig[]>(`${this.baseUrl}/prospeccao`));
  }

  async createProspeccao(config: Partial<ProspeccaoConfig>): Promise<ProspeccaoConfig> {
    return firstValueFrom(this.http.post<ProspeccaoConfig>(`${this.baseUrl}/prospeccao`, config));
  }

  async updateProspeccao(id: number, config: Partial<ProspeccaoConfig>): Promise<ProspeccaoConfig> {
    return firstValueFrom(this.http.put<ProspeccaoConfig>(`${this.baseUrl}/prospeccao/${id}`, config));
  }

  async deleteProspeccao(id: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.baseUrl}/prospeccao/${id}`));
  }

  // ===== Presenças (Presences/Auras) =====

  async listPresencas(): Promise<PresencaConfig[]> {
    return firstValueFrom(this.http.get<PresencaConfig[]>(`${this.baseUrl}/presencas`));
  }

  async createPresenca(config: Partial<PresencaConfig>): Promise<PresencaConfig> {
    return firstValueFrom(this.http.post<PresencaConfig>(`${this.baseUrl}/presencas`, config));
  }

  async updatePresenca(id: number, config: Partial<PresencaConfig>): Promise<PresencaConfig> {
    return firstValueFrom(this.http.put<PresencaConfig>(`${this.baseUrl}/presencas/${id}`, config));
  }

  async deletePresenca(id: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.baseUrl}/presencas/${id}`));
  }

  // ===== Gêneros (Genders) =====

  async listGeneros(): Promise<GeneroConfig[]> {
    return firstValueFrom(this.http.get<GeneroConfig[]>(`${this.baseUrl}/generos`));
  }

  async createGenero(config: Partial<GeneroConfig>): Promise<GeneroConfig> {
    return firstValueFrom(this.http.post<GeneroConfig>(`${this.baseUrl}/generos`, config));
  }

  async updateGenero(id: number, config: Partial<GeneroConfig>): Promise<GeneroConfig> {
    return firstValueFrom(this.http.put<GeneroConfig>(`${this.baseUrl}/generos/${id}`, config));
  }

  async deleteGenero(id: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.baseUrl}/generos/${id}`));
  }
}
