import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { ToastService } from '@services/toast.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SkeletonModule } from 'primeng/skeleton';

import { FormsModule } from '@angular/forms';
import { ConfigApiService } from '@core/services/api/config-api.service';
import { FichasApiService } from '@core/services/api/fichas-api.service';
import { VantagemConfig } from '@core/models/vantagem-config.model';
import { FichaVantagemResponse } from '@core/models/ficha.model';

/**
 * StepVantagensComponent (SMART)
 *
 * Passo 5 do Wizard de Ficha: compra de vantagens iniciais.
 *
 * Este passo e SMART porque as compras sao persistidas individualmente
 * com feedback imediato — nao ha "salvar ao avancar".
 *
 * Inputs:
 * - fichaId: ID da ficha em criacao
 * - jogoId: ID do jogo atual
 * - pontosDisponiveis: saldo atual de pontos de vantagem
 *
 * Outputs:
 * - pontosAtualizados: emite novo saldo apos cada compra
 */
@Component({
  selector: 'app-step-vantagens',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    SelectModule,
    TagModule,
    ProgressSpinnerModule,
    SkeletonModule,
  ],
  template: `
    <div class="flex flex-column gap-4">

      <!-- Header do passo -->
      <div>
        <h3 class="text-xl font-bold m-0 mb-1">Vantagens</h3>
        <p class="text-color-secondary m-0 text-sm">
          (Opcional) Use seus pontos de vantagem para adquirir habilidades especiais para o seu personagem.
        </p>
      </div>

      <!-- Estado de carregamento inicial -->
      @if (carregando()) {
        <div class="flex flex-column gap-3">
          @for (i of [1, 2, 3, 4, 5, 6]; track i) {
            <p-skeleton height="5rem" borderRadius="8px"></p-skeleton>
          }
        </div>
      } @else {

        <!-- Controles: pontos + busca + filtro de categoria -->
        <div class="flex flex-wrap align-items-center gap-3 surface-100 border-round p-3">
          <div class="flex align-items-center gap-2">
            <i class="pi pi-star text-primary"></i>
            <span class="font-semibold">Pontos disponíveis:</span>
            <span
              class="font-bold text-lg"
              [class.text-green-500]="pontosDisponiveis() > 0"
              [class.text-color-secondary]="pontosDisponiveis() === 0"
            >{{ pontosDisponiveis() }}</span>
          </div>

          <div class="flex-1" style="min-width: 200px;">
            <input
              pInputText
              type="text"
              placeholder="Buscar vantagem..."
              [value]="termoBusca()"
              (input)="termoBusca.set($any($event.target).value)"
              class="w-full"
              aria-label="Buscar vantagem por nome"
            />
          </div>

          <div style="min-width: 180px;">
            <p-select
              [options]="categorias()"
              [ngModel]="filtroCategoria() ?? 'Todas'"
              (ngModelChange)="onFiltroCategoria($event)"
              placeholder="Todas as categorias"
              styleClass="w-full"
              aria-label="Filtrar por categoria"
            ></p-select>
          </div>
        </div>

        <!-- Lista vazia -->
        @if (vantagensConfig().length === 0) {
          <div class="surface-100 border-round p-5 text-center">
            <i class="pi pi-info-circle text-color-secondary text-3xl mb-3 block"></i>
            <p class="text-color-secondary m-0">Nenhuma vantagem configurada para este jogo.</p>
          </div>
        } @else if (vantagensExibidas().length === 0) {
          <div class="surface-100 border-round p-5 text-center">
            <i class="pi pi-search text-color-secondary text-3xl mb-3 block"></i>
            <p class="text-color-secondary m-0">Nenhuma vantagem encontrada para o filtro aplicado.</p>
          </div>
        } @else {

          <!-- Grupos por categoria -->
          @for (grupo of vantagensAgrupadasPorCategoria(); track grupo.cat) {
            <div>
              <h4 class="text-base font-semibold text-color-secondary uppercase letter-spacing-1 m-0 mb-3">
                {{ grupo.cat }}
              </h4>

              <div class="grid">
                @for (vantagem of grupo.vantagens; track vantagem.id) {
                  <div class="col-12 md:col-6 lg:col-4">
                    <div class="border-1 border-200 border-round p-3 h-full flex flex-column gap-2 surface-card">

                      <!-- Nome e sigla -->
                      <div class="flex align-items-start justify-content-between gap-2">
                        <div>
                          <span class="font-semibold">{{ vantagem.nome }}</span>
                          @if (vantagem.sigla) {
                            <span class="text-color-secondary text-xs ml-1">({{ vantagem.sigla }})</span>
                          }
                        </div>
                        <span class="text-sm font-semibold white-space-nowrap">
                          Custo: {{ calcularCustoExibicao(vantagem.formulaCusto) }} pt
                        </span>
                      </div>

                      <!-- Descricao do efeito -->
                      @if (vantagem.descricaoEfeito) {
                        <p class="text-sm text-color-secondary m-0 line-height-3"
                           style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                          {{ vantagem.descricaoEfeito }}
                        </p>
                      }

                      <!-- Pre-requisitos -->
                      @if (vantagem.preRequisitos && vantagem.preRequisitos.length > 0) {
                        <div class="flex flex-wrap gap-1 mt-auto">
                          <span class="text-xs text-color-secondary">Requer:</span>
                          @for (pr of vantagem.preRequisitos; track pr.id) {
                            <p-tag
                              [value]="pr.preRequisitoNome"
                              severity="secondary"
                              styleClass="text-xs"
                            ></p-tag>
                          }
                        </div>
                      }

                      <!-- Botao de compra -->
                      <div class="mt-auto pt-2">
                        @switch (estadoBotao(vantagem.id, vantagem.formulaCusto)) {
                          @case ('comprada') {
                            <p-button
                              label="Comprada"
                              icon="pi pi-check"
                              severity="success"
                              [outlined]="true"
                              size="small"
                              styleClass="w-full"
                              [disabled]="true"
                              [attr.aria-label]="'Vantagem ' + vantagem.nome + ' ja comprada'"
                            ></p-button>
                          }
                          @case ('comprando') {
                            <p-button
                              label="Comprando..."
                              icon="pi pi-spin pi-spinner"
                              severity="primary"
                              size="small"
                              styleClass="w-full"
                              [disabled]="true"
                            ></p-button>
                          }
                          @case ('sem-pontos') {
                            <p-button
                              label="Sem pontos"
                              icon="pi pi-lock"
                              severity="secondary"
                              [outlined]="true"
                              size="small"
                              styleClass="w-full"
                              [disabled]="true"
                              [attr.aria-label]="'Pontos insuficientes para ' + vantagem.nome"
                            ></p-button>
                          }
                          @default {
                            <p-button
                              label="Comprar"
                              icon="pi pi-plus"
                              severity="primary"
                              size="small"
                              styleClass="w-full"
                              (onClick)="comprar(vantagem.id)"
                              [attr.aria-label]="'Comprar vantagem ' + vantagem.nome"
                            ></p-button>
                          }
                        }
                      </div>

                    </div>
                  </div>
                }
              </div>
            </div>
          }

        }
      }

    </div>

  `,
})
export class StepVantagensComponent implements OnInit {
  private configApi = inject(ConfigApiService);
  private fichasApi = inject(FichasApiService);
  private toastService = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  // ============================================================
  // Inputs
  // ============================================================

  fichaId = input.required<number>();
  jogoId = input.required<number>();
  pontosDisponiveis = input.required<number>();

  // ============================================================
  // Outputs
  // ============================================================

  pontosAtualizados = output<number>();

  // ============================================================
  // Estado interno
  // ============================================================

  readonly vantagensConfig = signal<VantagemConfig[]>([]);
  readonly vantagensCompradas = signal<FichaVantagemResponse[]>([]);
  readonly carregando = signal<boolean>(false);
  readonly comprando = signal<number | null>(null); // vantagemConfigId em compra
  readonly filtroCategoria = signal<string | null>(null);
  readonly termoBusca = signal<string>('');

  // ============================================================
  // Computed
  // ============================================================

  readonly categorias = computed<string[]>(() => {
    const cats = new Set(this.vantagensConfig().map((v) => v.categoriaNome));
    return ['Todas', ...Array.from(cats)];
  });

  readonly vantagensExibidas = computed<VantagemConfig[]>(() => {
    let lista = this.vantagensConfig();

    const cat = this.filtroCategoria();
    if (cat !== null && cat !== 'Todas') {
      lista = lista.filter((v) => v.categoriaNome === cat);
    }

    const termo = this.termoBusca().trim().toLowerCase();
    if (termo) {
      lista = lista.filter((v) => v.nome.toLowerCase().includes(termo));
    }

    return lista;
  });

  readonly vantagensAgrupadasPorCategoria = computed<{ cat: string; vantagens: VantagemConfig[] }[]>(() => {
    const grupos = new Map<string, VantagemConfig[]>();
    for (const v of this.vantagensExibidas()) {
      const cat = v.categoriaNome ?? 'Sem categoria';
      if (!grupos.has(cat)) grupos.set(cat, []);
      grupos.get(cat)!.push(v);
    }
    return Array.from(grupos.entries()).map(([cat, vantagens]) => ({ cat, vantagens }));
  });

  readonly idsComprados = computed<Set<number>>(() =>
    new Set(this.vantagensCompradas().map((v) => v.vantagemConfigId))
  );

  // ============================================================
  // ngOnInit: carregar dados iniciais
  // ============================================================

  ngOnInit(): void {
    this.carregando.set(true);

    forkJoin({
      vantagensConfig: this.configApi.listVantagens(this.jogoId()),
      vantagensCompradas: this.fichasApi.listVantagens(this.fichaId()),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ vantagensConfig, vantagensCompradas }) => {
          this.vantagensConfig.set(vantagensConfig);
          this.vantagensCompradas.set(vantagensCompradas);
          this.carregando.set(false);
        },
        error: () => {
          this.carregando.set(false);
          this.toastService.error('Não foi possível carregar as vantagens. Tente novamente.', 'Erro ao carregar');
        },
      });
  }

  // ============================================================
  // Metodos publicos
  // ============================================================

  estadoBotao(
    vantagemConfigId: number,
    formulaCusto: string | null
  ): 'comprar' | 'comprada' | 'sem-pontos' | 'comprando' {
    if (this.idsComprados().has(vantagemConfigId)) return 'comprada';
    if (this.comprando() === vantagemConfigId) return 'comprando';
    const custo = formulaCusto ? (Number(formulaCusto) || 1) : 1;
    if (this.pontosDisponiveis() < custo) return 'sem-pontos';
    return 'comprar';
  }

  calcularCustoExibicao(formulaCusto: string | null): string {
    if (!formulaCusto) return '1';
    const numerico = Number(formulaCusto);
    return isNaN(numerico) ? formulaCusto : String(numerico);
  }

  comprar(vantagemConfigId: number): void {
    if (this.comprando() !== null) return;
    this.comprando.set(vantagemConfigId);

    this.fichasApi
      .comprarVantagem(this.fichaId(), { vantagemConfigId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (fichaVantagem) => {
          this.vantagensCompradas.update((v) => [...v, fichaVantagem]);
          this.comprando.set(null);

          this.fichasApi
            .getFichaResumo(this.fichaId())
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: (r) => this.pontosAtualizados.emit(r.pontosVantagemDisponiveis ?? 0),
              error: () => this.pontosAtualizados.emit(0),
            });
        },
        error: (err: { error?: { message?: string } }) => {
          this.toastService.error(err?.error?.message ?? 'Tente novamente.', 'Erro ao comprar vantagem');
          this.comprando.set(null);
        },
      });
  }

  onFiltroCategoria(valor: string): void {
    this.filtroCategoria.set(valor === 'Todas' ? null : valor);
  }
}
