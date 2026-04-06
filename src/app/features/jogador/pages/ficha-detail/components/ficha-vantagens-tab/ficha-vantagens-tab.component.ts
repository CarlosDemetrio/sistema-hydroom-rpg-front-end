import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { FichaVantagemResponse } from '@models/ficha.model';
import { VantagemConfig } from '@models/vantagem-config.model';

interface GrupoVantagem {
  categoria: string;
  vantagens: FichaVantagemResponse[];
}

@Component({
  selector: 'app-ficha-vantagens-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    BadgeModule,
    ButtonModule,
    CardModule,
    DialogModule,
    DividerModule,
    InputTextModule,
    ProgressBarModule,
    TagModule,
  ],
  template: `
    <!-- Cabecalho: pontos + botao conceder insolitus -->
    <div class="p-3 flex flex-col gap-4">

      <div class="flex items-center justify-between gap-2 flex-wrap">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium">Pontos de vantagem disponiveis:</span>
          <p-badge [value]="pontosVantagemRestantes().toString()" severity="info" />
        </div>

        @if (isMestre()) {
          <p-button
            label="Conceder Insolitus"
            icon="pi pi-gift"
            size="small"
            severity="secondary"
            outlined
            aria-label="Conceder Insolitus ao personagem"
            (onClick)="abrirDialogInsolitus()"
          />
        }
      </div>

      <!-- Lista de vantagens -->
      @if (vantagens().length === 0) {
        <div class="flex flex-col items-center py-10 gap-3 text-center">
          <i class="pi pi-star" style="font-size: 3rem; color: var(--text-color-secondary)"></i>
          <h3 class="text-lg font-semibold m-0">Nenhuma vantagem concedida ainda</h3>
          <p class="text-color-secondary m-0">As vantagens serao exibidas aqui apos a compra ou concessao.</p>
        </div>
      } @else {
        @for (grupo of vantagensAgrupadas(); track grupo.categoria) {
          <section>
            <p-tag [value]="grupo.categoria" class="mb-3" />

            @for (vantagem of grupo.vantagens; track vantagem.id) {
              <p-card class="vantagem-card mb-3">
                <div class="flex items-start justify-between gap-3 flex-wrap">
                  <div class="flex flex-col gap-1 flex-1 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="font-semibold">{{ vantagem.nomeVantagem }}</span>
                      @if (vantagem.tipoVantagem === 'INSOLITUS') {
                        <p-tag
                          value="Insolitus"
                          severity="warn"
                          [style]="{'font-size': '0.7rem'}"
                        />
                      }
                    </div>
                    <p-progressBar
                      [value]="nivelPercent(vantagem)"
                      [showValue]="false"
                      class="vantagem-nivel-bar"
                      [attr.aria-label]="'Nivel ' + vantagem.nivelAtual + ' de ' + vantagem.nivelMaximo"
                    />
                    <span class="text-sm text-color-secondary">
                      Nivel {{ vantagem.nivelAtual }} / {{ vantagem.nivelMaximo }}
                    </span>
                  </div>

                  <!-- Acoes do Mestre: revogar -->
                  @if (isMestre()) {
                    <p-button
                      icon="pi pi-trash"
                      severity="danger"
                      text
                      size="small"
                      [attr.aria-label]="'Revogar vantagem ' + vantagem.nomeVantagem"
                      (onClick)="revogarVantagem.emit(vantagem.id)"
                    />
                  }
                </div>

                <p-divider />

                <div class="flex items-center justify-between gap-2">
                  @if (vantagem.tipoVantagem === 'INSOLITUS') {
                    <span class="text-sm text-color-secondary">
                      Concedida pelo Mestre (sem custo)
                    </span>
                  } @else {
                    <span class="text-sm text-color-secondary">
                      Custo pago: {{ vantagem.custoPago }} pontos
                    </span>
                  }

                  @if (podeAumentarNivel() && vantagem.nivelAtual < vantagem.nivelMaximo && vantagem.tipoVantagem !== 'INSOLITUS') {
                    <p-button
                      label="Subir Nivel"
                      icon="pi pi-arrow-up"
                      text
                      size="small"
                      [attr.aria-label]="'Subir nivel da vantagem ' + vantagem.nomeVantagem"
                      (onClick)="aumentarNivelVantagem.emit(vantagem.id)"
                    />
                  }
                </div>
              </p-card>
            }
          </section>
        }
      }
    </div>

    <!-- Dialog: Conceder Insolitus -->
    <p-dialog
      header="Conceder Insolitus"
      [visible]="dialogInsoliusAberto()"
      (visibleChange)="dialogInsoliusAberto.set($event)"
      [modal]="true"
      [style]="{width: '480px'}"
      [draggable]="false"
      [resizable]="false"
      aria-label="Dialog para conceder Insolitus ao personagem"
    >
      <div class="flex flex-col gap-4">
        <p class="text-color-secondary m-0">
          Insolitus sao vantagens especiais concedidas gratuitamente pelo Mestre, sem custo de pontos.
        </p>

        <!-- Busca por nome -->
        <div class="flex flex-col gap-1">
          <label for="buscaInsolitus" class="font-medium text-sm">Buscar por nome</label>
          <input
            pInputText
            id="buscaInsolitus"
            type="text"
            [ngModel]="buscaInsolitus()"
            (ngModelChange)="buscaInsolitus.set($event)"
            placeholder="Digite o nome do Insolitus..."
            class="w-full"
            aria-label="Buscar Insolitus por nome"
          />
        </div>

        <!-- Lista de opcoes -->
        <div class="flex flex-col gap-2 max-h-64 overflow-y-auto" role="listbox" aria-label="Lista de Insolitus disponiveis">
          @if (vantagensInsolitusDisponiveis().length === 0) {
            <div class="py-6 text-center text-color-secondary">
              <i class="pi pi-info-circle mr-2"></i>
              @if (buscaInsolitus()) {
                Nenhum Insolitus encontrado para "{{ buscaInsolitus() }}".
              } @else {
                Nenhum Insolitus configurado para este jogo.
              }
            </div>
          } @else {
            @for (v of vantagensInsolitusDisponiveis(); track v.id) {
              <div
                class="insolitus-item flex items-center justify-between gap-2 p-3 border-round cursor-pointer"
                [class.insolitus-item--selecionado]="insoliusSelecionadoId() === v.id"
                role="option"
                [attr.aria-selected]="insoliusSelecionadoId() === v.id"
                (click)="insoliusSelecionadoId.set(v.id)"
                (keydown.enter)="insoliusSelecionadoId.set(v.id)"
                tabindex="0"
              >
                <div class="flex flex-col gap-1 min-w-0">
                  <span class="font-medium truncate">{{ v.nome }}</span>
                  @if (v.descricaoEfeito) {
                    <span class="text-xs text-color-secondary truncate">{{ v.descricaoEfeito }}</span>
                  }
                </div>
                @if (insoliusSelecionadoId() === v.id) {
                  <i class="pi pi-check text-primary flex-shrink-0"></i>
                }
              </div>
            }
          }
        </div>
      </div>

      <ng-template #footer>
        <p-button
          label="Cancelar"
          text
          (onClick)="fecharDialogInsolitus()"
        />
        <p-button
          label="Conceder"
          icon="pi pi-gift"
          [disabled]="!insoliusSelecionadoId()"
          [loading]="concedendo()"
          (onClick)="confirmarConcederInsolitus()"
        />
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    :host ::ng-deep .vantagem-nivel-bar .p-progressbar {
      height: 6px;
    }

    :host ::ng-deep .vantagem-nivel-bar .p-progressbar-value {
      background: var(--primary-color);
    }

    :host ::ng-deep .vantagem-card .p-card-body {
      padding: 0.75rem 1rem;
    }

    .insolitus-item {
      border: 1px solid var(--surface-border);
      transition: background 0.15s, border-color 0.15s;
    }

    .insolitus-item:hover {
      background: var(--surface-hover);
    }

    .insolitus-item--selecionado {
      border-color: var(--primary-color);
      background: var(--primary-50, rgba(var(--primary-color-rgb), 0.06));
    }
  `],
})
export class FichaVantagensTabComponent {
  // Inputs
  vantagens = input.required<FichaVantagemResponse[]>();
  pontosVantagemRestantes = input<number>(0);
  podeAumentarNivel = input<boolean>(false);
  isMestre = input<boolean>(false);
  /** Lista de VantagemConfig do tipo INSOLITUS disponíveis para conceder. */
  vantagensInsolitusConfig = input<VantagemConfig[]>([]);

  // Outputs
  aumentarNivelVantagem = output<number>();
  revogarVantagem = output<number>();
  concederInsolitusConfirmado = output<number>();

  // Dialog state
  protected dialogInsoliusAberto = signal(false);
  protected buscaInsolitus = signal('');
  protected insoliusSelecionadoId = signal<number | null>(null);
  protected concedendo = signal(false);

  protected vantagensAgrupadas = computed<GrupoVantagem[]>(() => {
    const grupos = new Map<string, FichaVantagemResponse[]>();
    for (const v of this.vantagens()) {
      const cat = (v as FichaVantagemResponse & { categoriaNome?: string }).categoriaNome ?? 'Vantagens';
      if (!grupos.has(cat)) grupos.set(cat, []);
      grupos.get(cat)!.push(v);
    }
    return Array.from(grupos.entries()).map(([categoria, vantagens]) => ({ categoria, vantagens }));
  });

  protected vantagensInsolitusDisponiveis = computed<VantagemConfig[]>(() => {
    const busca = this.buscaInsolitus().toLowerCase().trim();
    const config = this.vantagensInsolitusConfig();
    if (!busca) return config;
    return config.filter(v => v.nome.toLowerCase().includes(busca));
  });

  protected nivelPercent(v: FichaVantagemResponse): number {
    if (v.nivelMaximo === 0) return 0;
    return Math.round((v.nivelAtual / v.nivelMaximo) * 100);
  }

  protected abrirDialogInsolitus(): void {
    this.buscaInsolitus.set('');
    this.insoliusSelecionadoId.set(null);
    this.concedendo.set(false);
    this.dialogInsoliusAberto.set(true);
  }

  protected fecharDialogInsolitus(): void {
    this.dialogInsoliusAberto.set(false);
    this.buscaInsolitus.set('');
    this.insoliusSelecionadoId.set(null);
  }

  protected confirmarConcederInsolitus(): void {
    const id = this.insoliusSelecionadoId();
    if (!id) return;
    this.concedendo.set(true);
    this.concederInsolitusConfirmado.emit(id);
  }

  /** Chamado pelo componente pai após sucesso ou erro para resetar o estado de loading do dialog. */
  resetarConcedendo(fecharDialog: boolean): void {
    this.concedendo.set(false);
    if (fecharDialog) {
      this.fecharDialogInsolitus();
    }
  }
}
