import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { ProgressBarModule } from 'primeng/progressbar';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { FichaResumo, FichaEstadoCombate } from '@core/models/ficha.model';
import { MembroCorpoConfig } from '@core/models/config.models';
import { FichasApiService } from '@core/services/api/fichas-api.service';
import { ConfigStore } from '@core/stores/config.store';
import { ToastService } from '@services/toast.service';

/** Estado editável de um membro do corpo na sessão */
interface MembroSessao {
  membroCorpoConfigId: number;
  nome: string;
  danoRecebido: number;
}

const POLLING_INTERVAL_MS = 30_000;

@Component({
  selector: 'app-ficha-sessao-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    ButtonModule,
    CardModule,
    InputNumberModule,
    ProgressBarModule,
    SkeletonModule,
    TagModule,
  ],
  template: `
    <div class="p-3 flex flex-col gap-4">

      <!-- Cards de Vida e Essencia -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <!-- Card Vida -->
        <p-card>
          <ng-template #header>
            <div class="flex items-center gap-2 px-4 pt-3">
              <i class="pi pi-heart text-red-500"></i>
              <span class="font-semibold text-lg">Vida</span>
            </div>
          </ng-template>

          <div class="flex flex-col gap-3">
            <div class="flex items-center gap-3">
              <p-inputnumber
                [(ngModel)]="vidaAtualEditando"
                [min]="0"
                [max]="resumo().vidaTotal"
                [showButtons]="true"
                buttonLayout="horizontal"
                decrementButtonIcon="pi pi-minus"
                incrementButtonIcon="pi pi-plus"
                inputStyleClass="text-center font-bold text-xl w-20"
                styleClass="flex-1"
                aria-label="Vida atual"
                (ngModelChange)="marcarDirty()"
              />
              <span class="text-color-secondary text-sm">
                / <strong>{{ resumo().vidaTotal }}</strong>
              </span>
            </div>

            <p-progressBar
              [value]="vidaPercent()"
              [showValue]="false"
              class="vida-bar"
              [attr.aria-label]="'Vida: ' + vidaAtualEditando() + ' de ' + resumo().vidaTotal"
            />

            <div class="text-xs text-color-secondary text-right">
              {{ vidaAtualEditando() }} / {{ resumo().vidaTotal }}
            </div>
          </div>
        </p-card>

        <!-- Card Essencia -->
        <p-card>
          <ng-template #header>
            <div class="flex items-center gap-2 px-4 pt-3">
              <i class="pi pi-bolt text-blue-500"></i>
              <span class="font-semibold text-lg">Essencia</span>
            </div>
          </ng-template>

          <div class="flex flex-col gap-3">
            <div class="flex items-center gap-3">
              <p-inputnumber
                [(ngModel)]="essenciaAtualEditando"
                [min]="0"
                [max]="resumo().essenciaTotal"
                [showButtons]="true"
                buttonLayout="horizontal"
                decrementButtonIcon="pi pi-minus"
                incrementButtonIcon="pi pi-plus"
                inputStyleClass="text-center font-bold text-xl w-20"
                styleClass="flex-1"
                aria-label="Essencia atual"
                (ngModelChange)="marcarDirty()"
              />
              <span class="text-color-secondary text-sm">
                / <strong>{{ resumo().essenciaTotal }}</strong>
              </span>
            </div>

            <p-progressBar
              [value]="essenciaPercent()"
              [showValue]="false"
              class="essencia-bar"
              [attr.aria-label]="'Essencia: ' + essenciaAtualEditando() + ' de ' + resumo().essenciaTotal"
            />

            <div class="text-xs text-color-secondary text-right">
              {{ essenciaAtualEditando() }} / {{ resumo().essenciaTotal }}
            </div>
          </div>
        </p-card>
      </div>

      <!-- Membros do Corpo -->
      @if (membros().length > 0) {
        <p-card>
          <ng-template #header>
            <div class="flex items-center gap-2 px-4 pt-3">
              <i class="pi pi-user"></i>
              <span class="font-semibold text-lg">Membros do Corpo</span>
            </div>
          </ng-template>

          <div class="flex flex-col gap-3">
            @for (membro of membros(); track membro.membroCorpoConfigId) {
              <div class="flex items-center justify-between gap-3 p-2 surface-ground border-round">
                <span class="font-medium min-w-24">{{ membro.nome }}</span>
                <div class="flex items-center gap-2 flex-1 justify-end">
                  <label [for]="'dano-' + membro.membroCorpoConfigId" class="text-sm text-color-secondary">
                    Dano:
                  </label>
                  <p-inputnumber
                    [inputId]="'dano-' + membro.membroCorpoConfigId"
                    [(ngModel)]="membro.danoRecebido"
                    [min]="0"
                    [showButtons]="true"
                    buttonLayout="horizontal"
                    decrementButtonIcon="pi pi-minus"
                    incrementButtonIcon="pi pi-plus"
                    inputStyleClass="text-center w-16"
                    [attr.aria-label]="'Dano recebido em ' + membro.nome"
                    (ngModelChange)="onDanoMembroChange(membro.membroCorpoConfigId, $event)"
                  />
                </div>
              </div>
            }
          </div>
        </p-card>
      }

      <!-- Acoes -->
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div class="flex items-center gap-2">
          <p-button
            label="Salvar estado"
            icon="pi pi-save"
            [loading]="salvando()"
            [disabled]="!dirty()"
            (onClick)="salvar()"
            aria-label="Salvar estado de combate da ficha"
          />
          @if (isMestre()) {
            <p-button
              label="Resetar (Mestre)"
              icon="pi pi-refresh"
              severity="warn"
              outlined
              [loading]="resetando()"
              (onClick)="resetar()"
              aria-label="Resetar estado de combate ao maximo (apenas Mestre)"
            />
          }
        </div>

        <div class="flex items-center gap-2 text-sm text-color-secondary">
          <i class="pi pi-clock text-xs"></i>
          <span>Ultima atualizacao: {{ ultimaAtualizacao() }}</span>
          @if (pollingAtivo()) {
            <p-tag value="Sincronizando" severity="info" class="text-xs" />
          }
        </div>
      </div>

      @if (dirty()) {
        <div class="flex items-center gap-2 p-2 border-round"
             style="background: var(--yellow-50); border: 1px solid var(--yellow-200);">
          <i class="pi pi-exclamation-triangle text-yellow-500"></i>
          <span class="text-sm text-yellow-700">Ha alteracoes nao salvas.</span>
        </div>
      }
    </div>
  `,
  styles: [`
    :host ::ng-deep .vida-bar .p-progressbar-value {
      background: var(--green-500);
    }

    :host ::ng-deep .essencia-bar .p-progressbar-value {
      background: var(--blue-400);
    }

    :host ::ng-deep .p-card .p-card-body {
      padding-top: 0.5rem;
    }
  `],
})
export class FichaSessaoTabComponent {
  private fichasApi = inject(FichasApiService);
  private configStore = inject(ConfigStore);
  private toastService = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  /** ID da ficha passado pelo componente pai */
  fichaId = input.required<number>();
  /** Resumo atual da ficha (vida, essência totais e atuais) */
  resumo = input.required<FichaResumo>();
  /** Indica se o usuário autenticado é Mestre */
  isMestre = input<boolean>(false);

  /** Valores editáveis (desacoplados do resumo para não corromper edição durante polling) */
  protected vidaAtualEditando = signal<number>(0);
  protected essenciaAtualEditando = signal<number>(0);

  /** Lista de membros do corpo com dano editável */
  protected membros = signal<MembroSessao[]>([]);

  /** Estado da UI */
  protected salvando = signal(false);
  protected resetando = signal(false);
  protected dirty = signal(false);
  protected pollingAtivo = signal(false);
  protected ultimaAtualizacao = signal<string>('--:--:--');
  /** Flag interna para inicializar apenas uma vez via effect */
  private inicializado = signal(false);

  protected vidaPercent = computed(() => {
    const total = this.resumo().vidaTotal;
    if (total <= 0) return 0;
    const atual = this.vidaAtualEditando();
    return Math.round(Math.max(0, Math.min(100, (atual / total) * 100)));
  });

  protected essenciaPercent = computed(() => {
    const total = this.resumo().essenciaTotal;
    if (total <= 0) return 0;
    const atual = this.essenciaAtualEditando();
    return Math.round(Math.max(0, Math.min(100, (atual / total) * 100)));
  });

  constructor() {
    // Inicializa os valores editáveis na primeira vez que o resumo estiver disponível
    effect(() => {
      if (this.inicializado()) return;
      const r = this.resumo();
      // Garante que o resumo tem valores antes de inicializar
      if (!r) return;
      this.vidaAtualEditando.set(r.vidaAtual);
      this.essenciaAtualEditando.set(r.essenciaAtual);
      this.atualizarUltimaAtualizacao();
      // Inicializa membros com danoRecebido=0 imediatamente para renderização rápida,
      // depois sobrescreve com os valores reais do backend via getEstadoCombate
      this.inicializarMembros([]);
      this.carregarEstadoCombate();
      this.iniciarPolling();
      this.inicializado.set(true);
    });
  }

  private inicializarMembros(estadoMembros: FichaEstadoCombate['membros']): void {
    const configs: MembroCorpoConfig[] = this.configStore.membrosCorpo();
    const lista: MembroSessao[] = configs.map(config => {
      const estado = estadoMembros.find(m => m.membroCorpoConfigId === config.id);
      return {
        membroCorpoConfigId: config.id,
        nome: config.nome,
        danoRecebido: estado?.danoRecebido ?? 0,
      };
    });
    this.membros.set(lista);
  }

  private carregarEstadoCombate(): void {
    this.fichasApi.getEstadoCombate(this.fichaId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (estado: FichaEstadoCombate) => {
          // Atualiza vida/essência apenas se não há edição pendente
          if (!this.dirty()) {
            this.vidaAtualEditando.set(estado.vidaAtual);
            this.essenciaAtualEditando.set(estado.essenciaAtual);
          }
          // Membros: sempre sobrescreve danoRecebido com valores reais (não afeta dirty da vida)
          this.inicializarMembros(estado.membros);
          this.atualizarUltimaAtualizacao();
        },
        error: () => {
          // Falha silenciosa — mantém valores do resumo já populados
        },
      });
  }

  private iniciarPolling(): void {
    this.pollingAtivo.set(true);
    timer(POLLING_INTERVAL_MS, POLLING_INTERVAL_MS)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(() => this.fichasApi.getFichaResumo(this.fichaId()))
      )
      .subscribe({
        next: (novoResumo) => {
          // Atualiza apenas se o usuário não está com alterações pendentes (não sobrescreve edição ativa)
          if (!this.dirty()) {
            this.vidaAtualEditando.set(novoResumo.vidaAtual);
            this.essenciaAtualEditando.set(novoResumo.essenciaAtual);
          }
          this.atualizarUltimaAtualizacao();
        },
        error: () => {
          // Falha silenciosa — polling continuará na próxima iteração
          this.pollingAtivo.set(false);
        },
      });
  }

  private atualizarUltimaAtualizacao(): void {
    const agora = new Date();
    const h = agora.getHours().toString().padStart(2, '0');
    const m = agora.getMinutes().toString().padStart(2, '0');
    const s = agora.getSeconds().toString().padStart(2, '0');
    this.ultimaAtualizacao.set(`${h}:${m}:${s}`);
  }

  protected marcarDirty(): void {
    this.dirty.set(true);
  }

  protected onDanoMembroChange(membroId: number, valor: number): void {
    this.membros.update(lista =>
      lista.map(m =>
        m.membroCorpoConfigId === membroId
          ? { ...m, danoRecebido: valor ?? 0 }
          : m
      )
    );
    this.dirty.set(true);
  }

  protected salvar(): void {
    if (this.salvando()) return;
    this.salvando.set(true);

    const dto = {
      vidaAtual: this.vidaAtualEditando(),
      essenciaAtual: this.essenciaAtualEditando(),
      membros: this.membros().map(m => ({
        membroCorpoConfigId: m.membroCorpoConfigId,
        danoRecebido: m.danoRecebido,
      })),
    };

    this.fichasApi.atualizarVida(this.fichaId(), dto).subscribe({
      next: () => {
        this.salvando.set(false);
        this.dirty.set(false);
        this.atualizarUltimaAtualizacao();
        this.toastService.success('Estado de combate salvo com sucesso!');
      },
      error: () => {
        this.salvando.set(false);
      },
    });
  }

  protected resetar(): void {
    if (this.resetando()) return;
    this.resetando.set(true);

    this.fichasApi.resetarEstado(this.fichaId()).subscribe({
      next: (novoResumo) => {
        this.vidaAtualEditando.set(novoResumo.vidaAtual);
        this.essenciaAtualEditando.set(novoResumo.essenciaAtual);
        this.membros.update(lista => lista.map(m => ({ ...m, danoRecebido: 0 })));
        this.resetando.set(false);
        this.dirty.set(false);
        this.atualizarUltimaAtualizacao();
        this.toastService.success('Estado de combate resetado ao maximo.');
      },
      error: () => {
        this.resetando.set(false);
      },
    });
  }
}
