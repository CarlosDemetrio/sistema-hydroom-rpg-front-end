import { Injectable, inject, computed } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { tap } from 'rxjs/operators';
import { FichasStore } from '@core/stores/fichas.store';
import { FichasApiService, FichaFilters } from '@core/services/api/fichas-api.service';
import {
  Ficha,
  FichaAtributoResponse,
  FichaAptidaoResponse,
  FichaVantagemResponse,
  FichaCompletaData,
  ComprarVantagemDto,
  DuplicarFichaResponse,
} from '@core/models/ficha.model';
import { CreateFichaDto, UpdateFichaDto, DuplicarFichaDto, NpcCreateDto } from '@core/models/dtos/ficha.dto';
import { Anotacao, CriarAnotacaoDto, AtualizarAnotacaoDto } from '@core/models/anotacao.model';
import { AnotacaoPasta, CriarPastaDto, AtualizarPastaDto } from '@core/models/anotacao-pasta.model';
import { FichaImagem, UploadImagemDto, AtualizarImagemDto } from '@core/models/ficha-imagem.model';
import { AuthService } from '@services/auth.service';

/**
 * Ficha Business Service
 *
 * Responsabilidades:
 * - Lógica de negócio de Fichas (personagens)
 * - Validações
 * - Atualiza Store
 *
 * Backend é a fonte oficial de todos os valores calculados.
 */
@Injectable({
  providedIn: 'root'
})
export class FichaBusinessService {
  private fichasStore = inject(FichasStore);
  private fichasApi = inject(FichasApiService);
  private authService = inject(AuthService);

  // Exposed state
  fichas = this.fichasStore.fichas;
  currentFicha = this.fichasStore.currentFicha;
  loading = this.fichasStore.loading;
  error = this.fichasStore.error;

  // ============================================
  // COMPUTED (BUSINESS LOGIC)
  // ============================================

  minhasFichas = computed(() => {
    const user = this.authService.currentUser();
    const isMestre = this.authService.isMestre();

    if (isMestre) {
      return this.fichasStore.fichas();
    }

    const userId = user?.id ? Number(user.id) : undefined;
    return this.fichasStore.fichas().filter(f => f.jogadorId === userId);
  });

  totalFichas = computed(() => this.minhasFichas().length);

  fichasRecentes = computed(() => {
    return this.minhasFichas()
      .slice()
      .sort((a, b) =>
        new Date(b.dataUltimaAtualizacao || 0).getTime() -
        new Date(a.dataUltimaAtualizacao || 0).getTime()
      )
      .slice(0, 5);
  });

  // ============================================
  // LOAD
  // ============================================

  loadFichas(jogoId: number, filtros?: FichaFilters): Observable<Ficha[]> {
    return this.fichasApi.listFichas(jogoId, filtros).pipe(
      tap(fichas => this.fichasStore.setFichas(fichas))
    );
  }

  loadMinhasFichas(jogoId: number): Observable<Ficha[]> {
    return this.fichasApi.listMinhasFichas(jogoId).pipe(
      tap(fichas => this.fichasStore.setFichas(fichas))
    );
  }

  getFicha(id: number): Observable<Ficha> {
    return this.fichasApi.getFicha(id).pipe(
      tap(ficha => {
        this.fichasStore.updateFichaInState(id, ficha);
        this.fichasStore.setCurrentFicha(ficha);
      })
    );
  }

  // ============================================
  // CRUD
  // ============================================

  createFicha(jogoId: number, dto: CreateFichaDto): Observable<Ficha> {
    return this.fichasApi.createFicha(jogoId, dto).pipe(
      tap(novaFicha => {
        this.fichasStore.addFicha(novaFicha);
        this.fichasStore.setCurrentFicha(novaFicha);
      })
    );
  }

  updateFicha(id: number, dto: UpdateFichaDto): Observable<Ficha> {
    return this.fichasApi.updateFicha(id, dto).pipe(
      tap(fichaAtualizada => {
        this.fichasStore.updateFichaInState(id, fichaAtualizada);
        this.fichasStore.setCurrentFicha(fichaAtualizada);
      })
    );
  }

  deleteFicha(id: number): Observable<void> {
    return this.fichasApi.deleteFicha(id).pipe(
      tap(() => {
        this.fichasStore.removeFicha(id);
        if (this.fichasStore.currentFicha()?.id === id) {
          this.fichasStore.clearCurrentFicha();
        }
      })
    );
  }

  // ============================================
  // FICHA COMPLETA (ficha + resumo em paralelo)
  // ============================================

  /**
   * Carrega ficha e resumo calculado em paralelo.
   * Usar na FichaDetailPage para ter todos os dados de uma vez.
   */
  loadFichaCompleta(fichaId: number): Observable<FichaCompletaData> {
    return forkJoin({
      ficha: this.fichasApi.getFicha(fichaId),
      resumo: this.fichasApi.getFichaResumo(fichaId),
    }).pipe(
      tap(({ ficha }) => {
        this.fichasStore.updateFichaInState(fichaId, ficha);
        this.fichasStore.setCurrentFicha(ficha);
      })
    );
  }

  // ============================================
  // ATRIBUTOS / APTIDOES
  // ============================================

  loadAtributos(fichaId: number): Observable<FichaAtributoResponse[]> {
    return this.fichasApi.getAtributos(fichaId);
  }

  loadAptidoes(fichaId: number): Observable<FichaAptidaoResponse[]> {
    return this.fichasApi.getAptidoes(fichaId);
  }

  // ============================================
  // VANTAGENS
  // ============================================

  loadVantagens(fichaId: number): Observable<FichaVantagemResponse[]> {
    return this.fichasApi.listVantagens(fichaId);
  }

  comprarVantagem(fichaId: number, dto: ComprarVantagemDto): Observable<FichaVantagemResponse> {
    return this.fichasApi.comprarVantagem(fichaId, dto);
  }

  aumentarNivelVantagem(fichaId: number, vantagemId: number): Observable<FichaVantagemResponse> {
    return this.fichasApi.aumentarNivelVantagem(fichaId, vantagemId);
  }

  concederInsolitus(fichaId: number, vantagemConfigId: number): Observable<FichaVantagemResponse> {
    return this.fichasApi.concederInsolitus(fichaId, vantagemConfigId);
  }

  revogarVantagem(fichaId: number, fichaVantagemId: number): Observable<void> {
    return this.fichasApi.revogarVantagem(fichaId, fichaVantagemId);
  }

  // ============================================
  // ANOTAÇÕES
  // ============================================

  loadAnotacoes(fichaId: number): Observable<Anotacao[]> {
    return this.fichasApi.getAnotacoes(fichaId);
  }

  listarAnotacoes(fichaId: number, pastaPaiId?: number): Observable<Anotacao[]> {
    return this.fichasApi.listarAnotacoes(fichaId, pastaPaiId);
  }

  criarAnotacao(fichaId: number, dto: CriarAnotacaoDto): Observable<Anotacao> {
    return this.fichasApi.criarAnotacao(fichaId, dto);
  }

  atualizarAnotacao(fichaId: number, anotacaoId: number, dto: CriarAnotacaoDto): Observable<Anotacao> {
    return this.fichasApi.atualizarAnotacao(fichaId, anotacaoId, dto);
  }

  editarAnotacao(fichaId: number, anotacaoId: number, dto: AtualizarAnotacaoDto): Observable<Anotacao> {
    return this.fichasApi.editarAnotacao(fichaId, anotacaoId, dto);
  }

  deletarAnotacao(fichaId: number, anotacaoId: number): Observable<void> {
    return this.fichasApi.deletarAnotacao(fichaId, anotacaoId);
  }

  // ============================================
  // PASTAS DE ANOTAÇÃO
  // ============================================

  listarPastas(fichaId: number): Observable<AnotacaoPasta[]> {
    return this.fichasApi.listarPastas(fichaId);
  }

  criarPasta(fichaId: number, dto: CriarPastaDto): Observable<AnotacaoPasta> {
    return this.fichasApi.criarPasta(fichaId, dto);
  }

  atualizarPasta(fichaId: number, pastaId: number, dto: AtualizarPastaDto): Observable<AnotacaoPasta> {
    return this.fichasApi.atualizarPasta(fichaId, pastaId, dto);
  }

  deletarPasta(fichaId: number, pastaId: number): Observable<void> {
    return this.fichasApi.deletarPasta(fichaId, pastaId);
  }

  // ============================================
  // GALERIA DE IMAGENS
  // ============================================

  loadImagens(fichaId: number): Observable<FichaImagem[]> {
    return this.fichasApi.getImagens(fichaId);
  }

  adicionarImagem(fichaId: number, dto: UploadImagemDto): Observable<FichaImagem> {
    return this.fichasApi.adicionarImagem(fichaId, dto);
  }

  atualizarImagem(fichaId: number, imagemId: number, dto: AtualizarImagemDto): Observable<FichaImagem> {
    return this.fichasApi.atualizarImagem(fichaId, imagemId, dto);
  }

  deletarImagem(fichaId: number, imagemId: number): Observable<void> {
    return this.fichasApi.deletarImagem(fichaId, imagemId);
  }

  // ============================================
  // DUPLICAR / NPC
  // ============================================

  duplicarFicha(fichaId: number, dto: DuplicarFichaDto): Observable<DuplicarFichaResponse> {
    return this.fichasApi.duplicarFicha(fichaId, dto);
  }

  criarNpc(jogoId: number, dto: NpcCreateDto): Observable<Ficha> {
    return this.fichasApi.criarNpc(jogoId, dto);
  }

  loadNpcs(jogoId: number): Observable<Ficha[]> {
    return this.fichasApi.listNpcs(jogoId);
  }

  // ============================================
  // UI HELPERS
  // ============================================

  setCurrentFicha(ficha: Ficha | null) {
    this.fichasStore.setCurrentFicha(ficha);
  }

  clearCurrentFicha() {
    this.fichasStore.clearCurrentFicha();
  }

  // ============================================
  // BUSINESS LOGIC / VALIDATIONS
  // ============================================

  canEdit(ficha: Ficha): boolean {
    const user = this.authService.currentUser();
    const isMestre = this.authService.isMestre();

    if (isMestre) return true;

    const userId = user?.id ? Number(user.id) : undefined;
    return ficha.jogadorId === userId;
  }

  hasJogo(ficha: Ficha): boolean {
    return !!ficha.jogoId;
  }
}
