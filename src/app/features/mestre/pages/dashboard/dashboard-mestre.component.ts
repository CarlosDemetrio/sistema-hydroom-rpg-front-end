import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { JogosApiService } from '@core/services/api/jogos-api.service';
import { DashboardMestre } from '@core/models/jogo.model';
import { CurrentGameService } from '@core/services/current-game.service';
import { EmptyStateComponent } from '@shared/components/empty-state.component';

/**
 * DashboardMestreComponent — Smart Component
 *
 * Painel de visão geral do jogo atual para o Mestre.
 * Exibe estatísticas: total de fichas, participantes, fichas por nível e últimas alterações.
 *
 * Endpoint: GET /api/v1/jogos/{id}/dashboard
 */
@Component({
  selector: 'app-dashboard-mestre',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonModule,
    CardModule,
    SkeletonModule,
    TableModule,
    TagModule,
    TooltipModule,
    EmptyStateComponent,
  ],
  template: `
    <div class="p-4">

      <!-- Cabeçalho -->
      <div class="flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="text-3xl font-bold m-0 mb-2">
            <i class="pi pi-chart-bar text-primary mr-2" aria-hidden="true"></i>
            Dashboard
          </h1>
          <p class="text-color-secondary m-0">
            Visão geral do jogo
            @if (currentGameName()) {
              <span class="font-semibold text-primary"> — {{ currentGameName() }}</span>
            }
          </p>
        </div>

        <p-button
          label="Atualizar"
          icon="pi pi-refresh"
          severity="secondary"
          [outlined]="true"
          [loading]="isLoading()"
          [disabled]="!hasGame()"
          (onClick)="carregarDashboard()"
          aria-label="Recarregar dados do dashboard"
        />
      </div>

      <!-- Aviso: sem jogo selecionado -->
      @if (!hasGame()) {
        <p-card>
          <div class="flex align-items-center gap-3 p-4 border-round surface-100">
            <i class="pi pi-exclamation-triangle text-2xl" style="color: var(--p-amber-400)" aria-hidden="true"></i>
            <div>
              <p class="font-semibold m-0 mb-1">Nenhum jogo selecionado</p>
              <p class="text-sm text-color-secondary m-0">Selecione um jogo no cabeçalho para ver o dashboard.</p>
            </div>
          </div>
        </p-card>

      } @else {

        <!-- Card Resumo -->
        <div class="grid mb-4">
          <div class="col-12 md:col-6">
            <p-card styleClass="h-full">
              <ng-template #header>
                <div class="p-3 pb-0">
                  <h2 class="text-xl font-semibold m-0">
                    <i class="pi pi-users text-primary mr-2" aria-hidden="true"></i>
                    Resumo
                  </h2>
                </div>
              </ng-template>

              @if (isLoading()) {
                <div class="flex gap-4 p-2">
                  <div class="flex-1">
                    <p-skeleton width="100%" height="4rem" styleClass="mb-2" />
                    <p-skeleton width="60%" height="1.25rem" />
                  </div>
                  <div class="flex-1">
                    <p-skeleton width="100%" height="4rem" styleClass="mb-2" />
                    <p-skeleton width="60%" height="1.25rem" />
                  </div>
                </div>
              } @else if (dashboard()) {
                <div class="flex gap-4 p-2">
                  <div
                    class="flex-1 text-center p-3 border-round surface-100"
                    role="region"
                    aria-label="Total de fichas"
                  >
                    <div class="text-4xl font-bold text-primary mb-2">
                      {{ dashboard()!.totalFichas }}
                    </div>
                    <div class="text-color-secondary text-sm font-medium">
                      <i class="pi pi-id-card mr-1" aria-hidden="true"></i>
                      Fichas
                    </div>
                  </div>
                  <div
                    class="flex-1 text-center p-3 border-round surface-100"
                    role="region"
                    aria-label="Total de participantes"
                  >
                    <div class="text-4xl font-bold text-primary mb-2">
                      {{ dashboard()!.totalParticipantes }}
                    </div>
                    <div class="text-color-secondary text-sm font-medium">
                      <i class="pi pi-users mr-1" aria-hidden="true"></i>
                      Participantes
                    </div>
                  </div>
                </div>
              }

              @if (!isLoading() && !dashboard()) {
                <p class="text-color-secondary text-center p-3">Nenhum dado disponível</p>
              }
            </p-card>
          </div>

          <!-- Card Fichas por Nível -->
          <div class="col-12 md:col-6">
            <p-card styleClass="h-full">
              <ng-template #header>
                <div class="p-3 pb-0">
                  <h2 class="text-xl font-semibold m-0">
                    <i class="pi pi-chart-line text-primary mr-2" aria-hidden="true"></i>
                    Fichas por Nível
                  </h2>
                </div>
              </ng-template>

              @if (isLoading()) {
                @for (i of skeletonRows; track i) {
                  <div class="flex justify-content-between align-items-center py-2 border-bottom-1 surface-border">
                    <p-skeleton width="5rem" height="1.25rem" />
                    <p-skeleton width="3rem" height="1.25rem" />
                  </div>
                }
              } @else if (fichasPorNivelEntries().length > 0) {
                <p-table
                  [value]="fichasPorNivelEntries()"
                  styleClass="p-datatable-sm"
                  [showGridlines]="false"
                  aria-label="Distribuição de fichas por nível"
                >
                  <ng-template #header>
                    <tr>
                      <th scope="col">Nível</th>
                      <th scope="col" class="text-right">Fichas</th>
                    </tr>
                  </ng-template>
                  <ng-template #body let-entry>
                    <tr>
                      <td>
                        <p-tag
                          [value]="'Nível ' + entry.nivel"
                          severity="secondary"
                          [rounded]="true"
                        />
                      </td>
                      <td class="text-right font-semibold">{{ entry.quantidade }}</td>
                    </tr>
                  </ng-template>
                </p-table>
              } @else if (!isLoading()) {
                <app-empty-state
                  icon="pi-chart-line"
                  message="Sem dados de nível"
                  description="Nenhuma ficha com nível registrado ainda."
                />
              }
            </p-card>
          </div>
        </div>

        <!-- Card Últimas Alterações -->
        <p-card>
          <ng-template #header>
            <div class="p-3 pb-0">
              <h2 class="text-xl font-semibold m-0">
                <i class="pi pi-history text-primary mr-2" aria-hidden="true"></i>
                Últimas Alterações
              </h2>
            </div>
          </ng-template>

          @if (isLoading()) {
            @for (i of skeletonRows; track i) {
              <div class="flex justify-content-between align-items-center py-2 border-bottom-1 surface-border">
                <p-skeleton width="12rem" height="1.25rem" />
                <p-skeleton width="8rem" height="1.25rem" />
              </div>
            }
          } @else if (ultimasAlteracoes().length > 0) {
            <p-table
              [value]="ultimasAlteracoes()"
              [rowHover]="true"
              styleClass="p-datatable-sm"
              aria-label="Fichas modificadas recentemente"
            >
              <ng-template #header>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Personagem</th>
                  <th scope="col" class="hidden md:table-cell text-right">Última Alteração</th>
                  <th scope="col" class="text-center">Ação</th>
                </tr>
              </ng-template>
              <ng-template #body let-alteracao>
                <tr>
                  <td class="text-color-secondary text-sm">{{ alteracao.fichaId }}</td>
                  <td class="font-semibold">{{ alteracao.nome }}</td>
                  <td class="hidden md:table-cell text-right text-color-secondary text-sm">
                    {{ formatarData(alteracao.dataUltimaAlteracao) }}
                  </td>
                  <td class="text-center">
                    <p-button
                      icon="pi pi-eye"
                      [text]="true"
                      [rounded]="true"
                      size="small"
                      severity="secondary"
                      (onClick)="verFicha(alteracao.fichaId)"
                      [pTooltip]="'Ver ficha de ' + alteracao.nome"
                      tooltipPosition="top"
                      [attr.aria-label]="'Ver ficha de ' + alteracao.nome"
                    />
                  </td>
                </tr>
              </ng-template>
              <ng-template #emptymessage>
                <tr>
                  <td colspan="4" class="text-center p-4 text-color-secondary">
                    Nenhuma alteração recente
                  </td>
                </tr>
              </ng-template>
            </p-table>
          } @else if (!isLoading()) {
            <app-empty-state
              icon="pi-history"
              message="Nenhuma alteração recente"
              description="As fichas modificadas aparecerão aqui."
            />
          }
        </p-card>

      }
    </div>
  `,
})
export class DashboardMestreComponent implements OnInit {
  private readonly jogosApi = inject(JogosApiService);
  private readonly currentGameService = inject(CurrentGameService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  // Estado
  protected readonly dashboard = signal<DashboardMestre | null>(null);
  protected readonly isLoading = signal(false);

  // Jogo atual
  protected readonly hasGame = this.currentGameService.hasCurrentGame;
  protected readonly currentGameId = this.currentGameService.currentGameId;
  protected readonly currentGameName = computed(() => this.currentGameService.currentGame()?.nome ?? null);

  // Computed derivados
  protected readonly fichasPorNivelEntries = computed(() => {
    const raw = this.dashboard()?.fichasPorNivel ?? {};
    return Object.entries(raw)
      .map(([nivel, quantidade]) => ({ nivel: Number(nivel), quantidade }))
      .sort((a, b) => a.nivel - b.nivel);
  });

  protected readonly ultimasAlteracoes = computed(() =>
    this.dashboard()?.ultimasAlteracoes ?? []
  );

  // Auxiliar para skeleton rows
  protected readonly skeletonRows = [1, 2, 3, 4, 5];

  ngOnInit(): void {
    if (this.hasGame()) {
      this.carregarDashboard();
    }
  }

  carregarDashboard(): void {
    const jogoId = this.currentGameId();
    if (!jogoId) return;

    this.isLoading.set(true);
    this.jogosApi
      .getDashboard(jogoId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.dashboard.set(data);
          this.isLoading.set(false);
        },
        error: () => {
          // Interceptor exibe o toast de erro automaticamente
          this.isLoading.set(false);
        },
      });
  }

  verFicha(fichaId: number): void {
    this.router.navigate(['/mestre/fichas', fichaId]);
  }

  protected formatarData(isoString: string): string {
    if (!isoString) return '';
    try {
      return new Date(isoString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  }
}
