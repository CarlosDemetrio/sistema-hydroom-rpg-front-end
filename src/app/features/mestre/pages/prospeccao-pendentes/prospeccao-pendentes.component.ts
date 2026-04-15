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
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';
import { ProspeccaoApiService } from '@core/services/api/prospeccao.api.service';
import { ProspeccaoUsoResponse, ProspeccaoUsoStatus } from '@core/models/ficha.model';
import { CurrentGameService } from '@core/services/current-game.service';
import { ToastService } from '@services/toast.service';
import { EmptyStateComponent } from '@shared/components/empty-state.component';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner.component';

/**
 * ProspeccaoPendentesComponent — Smart Component (Mestre)
 *
 * Painel de gerenciamento de usos de prospecção pendentes do jogo atual.
 * O Mestre pode confirmar ou reverter cada uso pendente registrado pelos Jogadores.
 *
 * Endpoints:
 * - GET   /api/v1/jogos/{jogoId}/prospeccao/pendentes
 * - PATCH /api/v1/fichas/{fichaId}/prospeccao/usos/{usoId}/confirmar
 * - PATCH /api/v1/fichas/{fichaId}/prospeccao/usos/{usoId}/reverter
 */
@Component({
  selector: 'app-prospeccao-pendentes',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BadgeModule,
    ButtonModule,
    CardModule,
    SkeletonModule,
    TableModule,
    TagModule,
    TooltipModule,
    EmptyStateComponent,
    LoadingSpinnerComponent,
  ],
  template: `
    <div class="p-4">

      <!-- Page Header -->
      <div class="flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="text-3xl font-bold m-0 mb-2">
            <i class="pi pi-clock text-primary mr-2" aria-hidden="true"></i>
            Prospecções Pendentes
            @if (totalPendentes() > 0) {
              <p-badge
                [value]="totalPendentes()"
                severity="warn"
                class="ml-2"
                [pTooltip]="totalPendentes() + ' uso(s) aguardando revisão'"
              />
            }
          </h1>
          <p class="text-color-secondary m-0">
            Gerencie os usos de prospecção que aguardam confirmação
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
          (onClick)="carregarPendentes()"
          aria-label="Recarregar lista de prospecções pendentes"
        />
      </div>

      <!-- Aviso: sem jogo selecionado -->
      @if (!hasGame()) {
        <p-card>
          <div class="flex align-items-center gap-3 p-4 border-round surface-100">
            <i class="pi pi-exclamation-triangle text-2xl" style="color: var(--p-amber-400)" aria-hidden="true"></i>
            <div>
              <p class="font-semibold m-0 mb-1">Nenhum jogo selecionado</p>
              <p class="text-sm text-color-secondary m-0">Selecione um jogo no cabeçalho para gerenciar prospecções.</p>
            </div>
          </div>
        </p-card>
      } @else {

        <!-- Conteúdo principal -->
        <p-card>
          @if (isLoading()) {
            <app-loading-spinner message="Carregando prospecções pendentes..." />
          } @else if (pendentes().length === 0) {
            <app-empty-state
              icon="pi pi-check-circle"
              message="Nenhum uso pendente"
              description="Todos os usos de prospecção foram revisados ou nenhum jogador usou dados ainda."
            />
          } @else {
            <p-table
              [value]="pendentes()"
              [rowHover]="true"
              [paginator]="pendentes().length > 10"
              [rows]="10"
              [rowsPerPageOptions]="[5, 10, 20]"
              dataKey="usoId"
              styleClass="p-datatable-sm"
              aria-label="Lista de usos de prospecção pendentes"
            >
              <ng-template #header>
                <tr>
                  <th scope="col">Personagem</th>
                  <th scope="col" class="hidden md:table-cell">Dado</th>
                  <th scope="col" class="hidden lg:table-cell">Data do Uso</th>
                  <th scope="col">Status</th>
                  <th scope="col" class="text-center">Ações</th>
                </tr>
              </ng-template>

              <ng-template #body let-uso>
                <tr [attr.aria-label]="'Uso pendente de ' + uso.personagemNome + ' — ' + uso.dadoNome">
                  <td>
                    <div class="flex flex-column gap-1">
                      <span class="font-semibold">{{ uso.personagemNome }}</span>
                      <span class="text-xs text-color-secondary md:hidden">{{ uso.dadoNome }}</span>
                    </div>
                  </td>
                  <td class="hidden md:table-cell">
                    <span class="font-medium">{{ uso.dadoNome }}</span>
                  </td>
                  <td class="hidden lg:table-cell text-sm text-color-secondary">
                    {{ formatarData(uso.criadoEm) }}
                  </td>
                  <td>
                    <p-tag
                      value="Pendente"
                      severity="warn"
                      [rounded]="true"
                      icon="pi pi-clock"
                    />
                  </td>
                  <td class="text-center">
                    <div class="flex justify-content-center gap-2">
                      <p-button
                        icon="pi pi-check"
                        severity="success"
                        [text]="true"
                        [rounded]="true"
                        size="small"
                        [loading]="confirmandoId() === uso.usoId"
                        [disabled]="confirmandoId() !== null || revertendoId() !== null"
                        (onClick)="confirmar(uso)"
                        [pTooltip]="'Confirmar uso de ' + uso.dadoNome + ' por ' + uso.personagemNome"
                        tooltipPosition="top"
                        aria-label="Confirmar uso"
                      />
                      <p-button
                        icon="pi pi-undo"
                        severity="danger"
                        [text]="true"
                        [rounded]="true"
                        size="small"
                        [loading]="revertendoId() === uso.usoId"
                        [disabled]="confirmandoId() !== null || revertendoId() !== null"
                        (onClick)="reverter(uso)"
                        [pTooltip]="'Reverter uso de ' + uso.dadoNome + ' — restaura quantidade'"
                        tooltipPosition="top"
                        aria-label="Reverter uso"
                      />
                    </div>
                  </td>
                </tr>
              </ng-template>

              <ng-template #emptymessage>
                <tr>
                  <td colspan="5" class="text-center p-4 text-color-secondary">
                    Nenhum uso pendente encontrado
                  </td>
                </tr>
              </ng-template>
            </p-table>
          }
        </p-card>
      }

    </div>
  `,
})
export class ProspeccaoPendentesComponent implements OnInit {
  private readonly prospeccaoApi = inject(ProspeccaoApiService);
  private readonly currentGameService = inject(CurrentGameService);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  // Estado
  protected readonly pendentes = signal<ProspeccaoUsoResponse[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly confirmandoId = signal<number | null>(null);
  protected readonly revertendoId = signal<number | null>(null);

  // Jogo atual
  protected readonly hasGame = this.currentGameService.hasCurrentGame;
  protected readonly currentGameId = this.currentGameService.currentGameId;
  protected readonly currentGameName = computed(() => this.currentGameService.currentGame()?.nome ?? null);

  // Computed
  protected readonly totalPendentes = computed(() => this.pendentes().length);

  ngOnInit(): void {
    if (this.hasGame()) {
      this.carregarPendentes();
    }
  }

  carregarPendentes(): void {
    const jogoId = this.currentGameId();
    if (!jogoId) return;

    this.isLoading.set(true);
    this.prospeccaoApi
      .listarPendentesJogo(jogoId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (lista) => {
          this.pendentes.set(lista);
          this.isLoading.set(false);
        },
        error: () => {
          // Interceptor exibe o toast de erro automaticamente
          this.isLoading.set(false);
        },
      });
  }

  confirmar(uso: ProspeccaoUsoResponse): void {
    if (this.confirmandoId() !== null) return;

    this.confirmandoId.set(uso.usoId);
    this.prospeccaoApi
      .confirmar(uso.fichaId, uso.usoId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.pendentes.update(lista => lista.filter(u => u.usoId !== uso.usoId));
          this.confirmandoId.set(null);
          this.toastService.success(
            `Uso de "${uso.dadoNome}" por ${uso.personagemNome} confirmado.`,
            'Uso confirmado',
          );
        },
        error: () => {
          // Interceptor exibe o toast de erro automaticamente
          this.confirmandoId.set(null);
        },
      });
  }

  reverter(uso: ProspeccaoUsoResponse): void {
    if (this.revertendoId() !== null) return;

    this.revertendoId.set(uso.usoId);
    this.prospeccaoApi
      .reverter(uso.fichaId, uso.usoId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.pendentes.update(lista => lista.filter(u => u.usoId !== uso.usoId));
          this.revertendoId.set(null);
          this.toastService.success(
            `Uso de "${uso.dadoNome}" revertido. Quantidade restaurada para ${uso.personagemNome}.`,
            'Uso revertido',
          );
        },
        error: () => {
          // Interceptor exibe o toast de erro automaticamente
          this.revertendoId.set(null);
        },
      });
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

  protected labelStatus(status: ProspeccaoUsoStatus): string {
    const labels: Record<ProspeccaoUsoStatus, string> = {
      PENDENTE: 'Pendente',
      CONFIRMADO: 'Confirmado',
      REVERTIDO: 'Revertido',
    };
    return labels[status] ?? status;
  }
}
