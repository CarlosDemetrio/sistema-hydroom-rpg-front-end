import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Ficha,
  FichaResumo,
  DuplicarFichaResponse,
  AtualizarAtributoDto,
  AtualizarAptidaoDto,
  FichaAtributoResponse,
  FichaAptidaoResponse,
  FichaVantagemResponse,
  ComprarVantagemDto,
} from '@core/models/ficha.model';
import {
  CreateFichaDto,
  NpcCreateDto,
  UpdateFichaDto,
  DuplicarFichaDto,
} from '@core/models/dtos/ficha.dto';
import { Anotacao, CriarAnotacaoDto, AtualizarAnotacaoDto } from '@core/models/anotacao.model';
import { AnotacaoPasta, CriarPastaDto, AtualizarPastaDto } from '@core/models/anotacao-pasta.model';
import { FichaImagem, UploadImagemDto, AtualizarImagemDto } from '@core/models/ficha-imagem.model';
import { environment } from '@env/environment';

export interface FichaFilters {
  nome?: string;
  classeId?: number;
  racaId?: number;
  nivel?: number;
}

/**
 * API Service para Fichas de personagem.
 *
 * Endpoints do backend:
 * - GET    /api/v1/jogos/{jogoId}/fichas            — listar fichas do jogo
 * - GET    /api/v1/jogos/{jogoId}/fichas/minhas     — minhas fichas no jogo
 * - POST   /api/v1/jogos/{jogoId}/fichas            — criar ficha no jogo
 * - GET    /api/v1/jogos/{jogoId}/npcs              — listar NPCs do jogo (MESTRE)
 * - POST   /api/v1/jogos/{jogoId}/npcs              — criar NPC (MESTRE)
 * - GET    /api/v1/fichas/{id}                      — buscar ficha por ID
 * - GET    /api/v1/fichas/{id}/resumo               — resumo calculado da ficha
 * - PUT    /api/v1/fichas/{id}                      — atualizar ficha
 * - DELETE /api/v1/fichas/{id}                      — deletar ficha (MESTRE)
 * - POST   /api/v1/fichas/{id}/duplicar             — duplicar ficha
 * - POST   /api/v1/fichas/{id}/preview              — preview de cálculos sem persistir
 * - GET    /api/v1/fichas/{id}/vantagens            — listar vantagens da ficha
 * - POST   /api/v1/fichas/{id}/vantagens            — comprar vantagem
 * - PUT    /api/v1/fichas/{id}/vantagens/{vid}      — aumentar nível de vantagem
 * - PUT    /api/v1/fichas/{id}/atributos            — atualizar atributos em lote
 * - PUT    /api/v1/fichas/{id}/aptidoes             — atualizar aptidões em lote
 * - GET    /api/v1/fichas/{fichaId}/anotacoes       — listar anotações da ficha
 * - POST   /api/v1/fichas/{fichaId}/anotacoes       — criar anotação na ficha
 * - DELETE /api/v1/fichas/{fichaId}/anotacoes/{id}  — deletar anotação
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
   * PUT /api/v1/fichas/{id}/completar
   * Finaliza a criacao da ficha (saindo do estado rascunho).
   * Chamado ao concluir o wizard (Passo 6 — Revisao).
   */
  completar(fichaId: number): Observable<Ficha> {
    return this.http.put<Ficha>(`${this.baseUrl}/fichas/${fichaId}/completar`, {});
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
  listVantagens(id: number): Observable<FichaVantagemResponse[]> {
    return this.http.get<FichaVantagemResponse[]>(`${this.baseUrl}/fichas/${id}/vantagens`);
  }

  /**
   * POST /api/v1/fichas/{id}/vantagens
   * Compra uma vantagem para a ficha.
   */
  comprarVantagem(id: number, dto: ComprarVantagemDto): Observable<FichaVantagemResponse> {
    return this.http.post<FichaVantagemResponse>(`${this.baseUrl}/fichas/${id}/vantagens`, dto);
  }

  /**
   * PUT /api/v1/fichas/{id}/vantagens/{vid}
   * Aumenta o nível de uma vantagem da ficha.
   */
  aumentarNivelVantagem(id: number, vid: number): Observable<FichaVantagemResponse> {
    return this.http.put<FichaVantagemResponse>(`${this.baseUrl}/fichas/${id}/vantagens/${vid}`, {});
  }

  /**
   * PUT /api/v1/fichas/{id}/xp
   * Concede XP a uma ficha (Mestre only).
   * A quantidade informada é somada ao XP atual pelo backend.
   */
  concederXp(fichaId: number, quantidade: number): Observable<Ficha> {
    return this.http.put<Ficha>(`${this.baseUrl}/fichas/${fichaId}/xp`, { quantidade });
  }

  /**
   * POST /api/v1/fichas/{id}/vantagens/insolitus/{vantagemConfigId}
   * Concede um Insolitus a uma ficha (Mestre only). Sem custo de pontos.
   */
  concederInsolitus(fichaId: number, vantagemConfigId: number): Observable<FichaVantagemResponse> {
    return this.http.post<FichaVantagemResponse>(
      `${this.baseUrl}/fichas/${fichaId}/vantagens/insolitus/${vantagemConfigId}`,
      {}
    );
  }

  /**
   * DELETE /api/v1/fichas/{fichaId}/vantagens/{fichaVantagemId}
   * Revoga uma vantagem (inclusive Insolitus) de uma ficha (Mestre only).
   */
  revogarVantagem(fichaId: number, fichaVantagemId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/fichas/${fichaId}/vantagens/${fichaVantagemId}`
    );
  }

  // ==================== ATRIBUTOS DIRETOS ====================

  /**
   * GET /api/v1/fichas/{id}/atributos
   * Lista atributos da ficha com valores base, nível, outros e total calculado.
   */
  getAtributos(fichaId: number): Observable<FichaAtributoResponse[]> {
    return this.http.get<FichaAtributoResponse[]>(`${this.baseUrl}/fichas/${fichaId}/atributos`);
  }

  /**
   * PUT /api/v1/fichas/{id}/atributos
   * Atualiza atributos da ficha em lote.
   * Mestre pode editar qualquer ficha; Jogador só as próprias.
   * Valida que base não excede o limitador do nível.
   */
  atualizarAtributos(fichaId: number, dto: AtualizarAtributoDto[]): Observable<FichaAtributoResponse[]> {
    return this.http.put<FichaAtributoResponse[]>(`${this.baseUrl}/fichas/${fichaId}/atributos`, dto);
  }

  // ==================== APTIDOES DIRETAS ====================

  /**
   * GET /api/v1/fichas/{id}/aptidoes
   * Lista aptidões da ficha com valores base, sorte, classe e total calculado.
   */
  getAptidoes(fichaId: number): Observable<FichaAptidaoResponse[]> {
    return this.http.get<FichaAptidaoResponse[]>(`${this.baseUrl}/fichas/${fichaId}/aptidoes`);
  }

  /**
   * PUT /api/v1/fichas/{id}/aptidoes
   * Atualiza aptidões da ficha em lote.
   * Mestre pode editar qualquer ficha; Jogador só as próprias.
   */
  atualizarAptidoes(fichaId: number, dto: AtualizarAptidaoDto[]): Observable<FichaAptidaoResponse[]> {
    return this.http.put<FichaAptidaoResponse[]>(`${this.baseUrl}/fichas/${fichaId}/aptidoes`, dto);
  }

  // ==================== VIDA E PROSPECÇÃO ====================

  /**
   * PUT /api/v1/fichas/{id}/vida
   * Atualiza estado de combate: vidaAtual, essenciaAtual, dano por membro.
   */
  atualizarVida(fichaId: number, dto: { vidaAtual: number; essenciaAtual: number; membros?: { membroCorpoConfigId: number; danoRecebido: number }[] }): Observable<FichaResumo> {
    return this.http.put<FichaResumo>(`${this.baseUrl}/fichas/${fichaId}/vida`, dto);
  }

  /**
   * PUT /api/v1/fichas/{id}/prospeccao
   * Atualiza prospecção da ficha.
   */
  atualizarProspeccao(fichaId: number, dto: { dadoProspeccaoConfigId: number; quantidade: number }): Observable<FichaResumo> {
    return this.http.put<FichaResumo>(`${this.baseUrl}/fichas/${fichaId}/prospeccao`, dto);
  }

  // ==================== NPC DEDICADO ====================

  /**
   * POST /api/v1/jogos/{jogoId}/npcs
   * Cria um NPC no jogo (apenas MESTRE).
   * Endpoint dedicado, distinto do POST /fichas com isNpc=true.
   */
  criarNpc(jogoId: number, dto: NpcCreateDto): Observable<Ficha> {
    return this.http.post<Ficha>(`${this.baseUrl}/jogos/${jogoId}/npcs`, dto);
  }

  // ==================== DUPLICAR FICHA ====================

  /**
   * POST /api/v1/fichas/{id}/duplicar
   * Duplica uma ficha com novo nome.
   * Mestre pode duplicar qualquer ficha; Jogador só as próprias.
   */
  duplicarFicha(fichaId: number, dto: DuplicarFichaDto): Observable<DuplicarFichaResponse> {
    return this.http.post<DuplicarFichaResponse>(`${this.baseUrl}/fichas/${fichaId}/duplicar`, dto);
  }

  // ==================== ESTADO DE COMBATE ====================

  /**
   * POST /api/v1/fichas/{id}/resetar-estado
   * Reseta o estado de combate da ficha (apenas MESTRE):
   * vidaAtual → vidaTotal, essenciaAtual → essenciaTotal, danoRecebido de todos os membros → 0.
   * NÃO reseta: prospecção, atributos, aptidões, vantagens, XP, nível.
   */
  resetarEstado(fichaId: number): Observable<FichaResumo> {
    return this.http.post<FichaResumo>(`${this.baseUrl}/fichas/${fichaId}/resetar-estado`, {});
  }

  // ==================== ANOTACOES ====================

  /**
   * GET /api/v1/fichas/{fichaId}/anotacoes
   * Mestre vê todas as anotações. Jogador vê apenas as próprias e as do Mestre visíveis.
   */
  getAnotacoes(fichaId: number): Observable<Anotacao[]> {
    return this.http.get<Anotacao[]>(`${this.baseUrl}/fichas/${fichaId}/anotacoes`);
  }

  /**
   * POST /api/v1/fichas/{fichaId}/anotacoes
   * Cria uma nova anotação. Jogadores só podem criar anotações do tipo JOGADOR.
   */
  criarAnotacao(fichaId: number, dto: CriarAnotacaoDto): Observable<Anotacao> {
    return this.http.post<Anotacao>(`${this.baseUrl}/fichas/${fichaId}/anotacoes`, dto);
  }

  /**
   * PUT /api/v1/fichas/{fichaId}/anotacoes/{id}
   * Atualiza uma anotação. Mestre pode editar qualquer; Jogador só as próprias.
   * tipoAnotacao é imutável — não incluído no payload.
   */
  atualizarAnotacao(fichaId: number, anotacaoId: number, dto: CriarAnotacaoDto): Observable<Anotacao> {
    return this.http.put<Anotacao>(`${this.baseUrl}/fichas/${fichaId}/anotacoes/${anotacaoId}`, dto);
  }

  /**
   * PUT /api/v1/fichas/{fichaId}/anotacoes/{id}
   * Edita anotação com DTO parcial tipado (AtualizarAnotacaoDto).
   * Usa o mesmo endpoint mas com payload mais restrito e tipado.
   */
  editarAnotacao(fichaId: number, anotacaoId: number, dto: AtualizarAnotacaoDto): Observable<Anotacao> {
    return this.http.put<Anotacao>(`${this.baseUrl}/fichas/${fichaId}/anotacoes/${anotacaoId}`, dto);
  }

  /**
   * GET /api/v1/fichas/{fichaId}/anotacoes?pastaPaiId=X
   * Lista anotações com filtro opcional por pasta.
   * pastaPaiId undefined = sem filtro (retorna todas).
   */
  listarAnotacoes(fichaId: number, pastaPaiId?: number): Observable<Anotacao[]> {
    let params = new HttpParams();
    if (pastaPaiId != null) {
      params = params.set('pastaPaiId', pastaPaiId.toString());
    }
    return this.http.get<Anotacao[]>(`${this.baseUrl}/fichas/${fichaId}/anotacoes`, { params });
  }

  /**
   * DELETE /api/v1/fichas/{fichaId}/anotacoes/{id}
   * Mestre pode deletar qualquer anotação. Jogador só pode deletar as próprias.
   */
  deletarAnotacao(fichaId: number, anotacaoId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/fichas/${fichaId}/anotacoes/${anotacaoId}`);
  }

  // ==================== PASTAS DE ANOTAÇÃO ====================

  /**
   * GET /api/v1/fichas/{fichaId}/anotacao-pastas
   * Lista pastas da ficha em estrutura de árvore.
   */
  listarPastas(fichaId: number): Observable<AnotacaoPasta[]> {
    return this.http.get<AnotacaoPasta[]>(`${this.baseUrl}/fichas/${fichaId}/anotacao-pastas`);
  }

  /**
   * POST /api/v1/fichas/{fichaId}/anotacao-pastas
   * Cria uma nova pasta. pastaPaiId opcional — null/ausente = pasta raiz.
   */
  criarPasta(fichaId: number, dto: CriarPastaDto): Observable<AnotacaoPasta> {
    return this.http.post<AnotacaoPasta>(`${this.baseUrl}/fichas/${fichaId}/anotacao-pastas`, dto);
  }

  /**
   * PUT /api/v1/fichas/{fichaId}/anotacao-pastas/{pastaId}
   * Atualiza nome ou ordem de uma pasta.
   */
  atualizarPasta(fichaId: number, pastaId: number, dto: AtualizarPastaDto): Observable<AnotacaoPasta> {
    return this.http.put<AnotacaoPasta>(
      `${this.baseUrl}/fichas/${fichaId}/anotacao-pastas/${pastaId}`,
      dto
    );
  }

  /**
   * DELETE /api/v1/fichas/{fichaId}/anotacao-pastas/{pastaId}
   * Remove a pasta. Comportamento no backend: move anotações órfãs para raiz.
   */
  deletarPasta(fichaId: number, pastaId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/fichas/${fichaId}/anotacao-pastas/${pastaId}`
    );
  }

  // ==================== GALERIA DE IMAGENS ====================

  /**
   * GET /api/v1/fichas/{fichaId}/imagens
   * Lista todas as imagens da ficha (avatar + galeria).
   */
  getImagens(fichaId: number): Observable<FichaImagem[]> {
    return this.http.get<FichaImagem[]>(`${this.baseUrl}/fichas/${fichaId}/imagens`);
  }

  /**
   * POST /api/v1/fichas/{fichaId}/imagens
   * Faz upload de nova imagem via multipart/form-data.
   * O backend envia o arquivo ao Cloudinary e retorna urlCloudinary e publicId.
   * NAO setar Content-Type manualmente — Angular define automaticamente com boundary correto.
   */
  adicionarImagem(fichaId: number, dto: UploadImagemDto): Observable<FichaImagem> {
    const formData = new FormData();
    formData.append('arquivo', dto.arquivo);
    formData.append('tipoImagem', dto.tipoImagem);
    if (dto.titulo) {
      formData.append('titulo', dto.titulo);
    }
    return this.http.post<FichaImagem>(`${this.baseUrl}/fichas/${fichaId}/imagens`, formData);
  }

  /**
   * PUT /api/v1/fichas/{fichaId}/imagens/{imagemId}
   * Edita apenas metadados da imagem (titulo, ordem).
   * Nao permite trocar o arquivo — para isso: deletar e fazer novo upload.
   */
  atualizarImagem(fichaId: number, imagemId: number, dto: AtualizarImagemDto): Observable<FichaImagem> {
    return this.http.put<FichaImagem>(
      `${this.baseUrl}/fichas/${fichaId}/imagens/${imagemId}`,
      dto
    );
  }

  /**
   * DELETE /api/v1/fichas/{fichaId}/imagens/{imagemId}
   * Remove imagem da ficha e do Cloudinary.
   */
  deletarImagem(fichaId: number, imagemId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/fichas/${fichaId}/imagens/${imagemId}`
    );
  }
}
