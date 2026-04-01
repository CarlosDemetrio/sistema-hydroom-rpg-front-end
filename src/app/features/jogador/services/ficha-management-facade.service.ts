import { Injectable, inject, computed } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { FichasStore } from '@core/stores/fichas.store';
import { FichasApiService, FichaFilters } from '@core/services/api/fichas-api.service';
import { Ficha } from '@core/models/ficha.model';
import { CreateFichaDto, UpdateFichaDto } from '@core/models/dtos/ficha.dto';
import { AuthService } from '@services/auth.service';

/**
 * Ficha Management Facade Service
 *
 * Component → Facade (Observable) → API Service → Backend
 *                ↓ tap(Store.setState())
 */
@Injectable({
  providedIn: 'root'
})
export class FichaManagementFacadeService {
  private fichasStore = inject(FichasStore);
  private fichasApi = inject(FichasApiService);
  private authService = inject(AuthService);

  // Exposed state
  fichas = this.fichasStore.fichas;
  currentFicha = this.fichasStore.currentFicha;
  loading = this.fichasStore.loading;
  error = this.fichasStore.error;

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

  fichasPorJogo(jogoId: number) {
    return computed(() =>
      this.fichasStore.fichas().filter(f => f.jogoId === jogoId)
    );
  }

  // ============================================
  // LOAD
  // ============================================

  loadFichas(jogoId: number, filtros?: FichaFilters): Observable<Ficha[]> {
    return this.fichasApi.listFichas(jogoId, filtros).pipe(
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

  setCurrentFicha(ficha: Ficha | null) {
    this.fichasStore.setCurrentFicha(ficha);
  }

  clearCurrentFicha() {
    this.fichasStore.clearCurrentFicha();
  }
}
