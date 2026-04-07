import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { FichaAtributoResponse, FichaResumo } from '@models/ficha.model';
import { NivelConfig } from '@core/models/config.models';

interface BonusEntry {
  nome: string;
  valor: number;
}

@Component({
  selector: 'app-ficha-resumo-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonModule, CardModule, DecimalPipe, ProgressBarModule],
  template: `
    <div class="p-3 flex flex-col gap-4">

      <!-- Atributos Totais -->
      <section>
        <h3 class="section-title">Atributos Totais</h3>

        @if (atributos().length === 0) {
          <div class="empty-state flex flex-col items-center py-8 gap-3 text-center">
            <i class="pi pi-list-check" style="font-size: 3rem; color: var(--text-color-secondary)"></i>
            <p class="text-color-secondary m-0">Nenhum atributo distribuido ainda.</p>
          </div>
        } @else {
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            @for (atrib of atributos(); track atrib.atributoConfigId) {
              <p-card class="atributo-card text-center">
                <div class="flex flex-col items-center gap-1">
                  <span class="atrib-abrev">{{ atrib.atributoAbreviacao }}</span>
                  <span class="atrib-total">{{ atrib.total }}</span>
                  <span class="atrib-impeto">imp: {{ atrib.impeto | number:'1.1-1' }}</span>
                </div>
              </p-card>
            }
          </div>
        }
      </section>

      <!-- Bonus Derivados -->
      <section>
        <h3 class="section-title">Bonus Derivados</h3>

        @if (bonusEntries().length === 0) {
          <p class="text-color-secondary text-sm m-0">Nenhum bonus calculado.</p>
        } @else {
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            @for (entry of bonusEntries(); track entry.nome) {
              <p-card class="bonus-card text-center">
                <div class="flex flex-col items-center gap-1">
                  <span class="bonus-nome">{{ entry.nome }}</span>
                  <span class="bonus-valor">
                    @if (entry.valor >= 0) { +{{ entry.valor }} } @else { {{ entry.valor }} }
                  </span>
                </div>
              </p-card>
            }
          </div>
        }
      </section>

      <!-- Painel de XP e Progressão -->
      <section>
        <div class="xp-panel">
          <div class="flex items-center justify-between mb-1">
            <div class="flex items-center gap-2">
              <span class="stat-label">XP</span>
              <span class="xp-valor">{{ resumo().xp | number:'1.0-0':'pt-BR' }}</span>
              @if (proximoNivel(); as proximo) {
                <span class="text-color-secondary text-sm">/ {{ proximo.xpNecessaria | number:'1.0-0':'pt-BR' }}</span>
              }
            </div>
            @if (isMestre()) {
              <p-button
                label="+XP"
                icon="pi pi-plus"
                severity="secondary"
                size="small"
                aria-label="Conceder XP a esta ficha"
                (onClick)="abrirDialogXp.emit()"
              />
            }
          </div>
          @if (proximoNivel()) {
            <p-progressBar
              [value]="progressoXp()"
              [showValue]="false"
              class="xp-bar"
              [attr.aria-label]="'Progresso de XP: ' + progressoXp() + '%'"
            />
          } @else {
            <p-progressBar
              [value]="100"
              [showValue]="false"
              class="xp-bar xp-bar-max"
              aria-label="Nivel maximo atingido"
            />
          }
        </div>
      </section>

      <section>
        <h3 class="section-title">Estatisticas</h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <div class="stat-item">
            <span class="stat-label">Vida Total</span>
            <span class="stat-value">{{ resumo().vidaTotal }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Essencia Total</span>
            <span class="stat-value">{{ resumo().essenciaTotal }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Ameaca Total</span>
            <span class="stat-value text-danger">{{ resumo().ameacaTotal }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Nivel</span>
            <span class="stat-value">{{ resumo().nivel }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">XP Total</span>
            <span class="stat-value">{{ resumo().xp | number:'1.0-0':'pt-BR' }}</span>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .section-title {
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--text-color-secondary);
      margin: 0 0 0.75rem 0;
    }

    :host ::ng-deep .atributo-card .p-card-body {
      padding: 0.75rem;
    }

    .atrib-abrev {
      font-family: monospace;
      font-size: 0.75rem;
      text-transform: uppercase;
      color: var(--text-color-secondary);
    }

    .atrib-total {
      font-family: monospace;
      font-size: 2rem;
      font-weight: 700;
      color: var(--primary-color);
      line-height: 1;
    }

    .atrib-impeto {
      font-size: 0.75rem;
      color: var(--text-color-secondary);
    }

    :host ::ng-deep .bonus-card .p-card-body {
      padding: 0.5rem 0.75rem;
    }

    .bonus-nome {
      font-size: 0.875rem;
      color: var(--text-color-secondary);
    }

    .bonus-valor {
      font-family: monospace;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--primary-color);
      line-height: 1;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--surface-border);
      border-radius: 6px;
      background: var(--surface-card);
    }

    .stat-label {
      font-size: 0.75rem;
      color: var(--text-color-secondary);
    }

    .stat-value {
      font-family: monospace;
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-color);
    }

    .stat-value.text-danger {
      color: var(--red-500);
    }

    .xp-panel {
      padding: 0.75rem;
      border: 1px solid var(--surface-border);
      border-radius: 8px;
      background: var(--surface-card);
    }

    .xp-valor {
      font-family: monospace;
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--primary-color);
    }

    :host ::ng-deep .xp-bar .p-progressbar {
      height: 0.5rem;
      border-radius: 4px;
    }

    :host ::ng-deep .xp-bar .p-progressbar-value {
      background: var(--primary-color);
    }

    :host ::ng-deep .xp-bar-max .p-progressbar-value {
      background: var(--yellow-500);
    }
  `],
})
export class FichaResumoTabComponent {
  atributos = input.required<FichaAtributoResponse[]>();
  resumo = input.required<FichaResumo>();
  /** Quando true, exibe o botão [+XP] para conceder XP (apenas Mestre). */
  isMestre = input<boolean>(false);
  /** Lista de níveis para calcular o progresso de XP. */
  niveis = input<NivelConfig[]>([]);

  /** Emitido ao clicar no botão [+XP] (Mestre only). */
  abrirDialogXp = output<void>();

  protected bonusEntries = computed<BonusEntry[]>(() => {
    const totais = this.resumo().bonusTotais;
    return Object.entries(totais).map(([nome, valor]) => ({ nome, valor }));
  });

  /** Configuração do próximo nível, ou null se já está no nível máximo. */
  protected proximoNivel = computed<NivelConfig | null>(() => {
    const nivel = this.resumo().nivel;
    return this.niveis().find(n => n.nivel === nivel + 1) ?? null;
  });

  /** Percentual de progresso de XP para o próximo nível (0–100). */
  protected progressoXp = computed<number>(() => {
    const resumo = this.resumo();
    const niveis = this.niveis();
    const nivelAtual = niveis.find(n => n.nivel === resumo.nivel);
    const proximoNivel = niveis.find(n => n.nivel === resumo.nivel + 1);
    if (!nivelAtual || !proximoNivel) return 100;
    const xpBase = nivelAtual.xpNecessaria;
    const xpProximo = proximoNivel.xpNecessaria;
    const diff = xpProximo - xpBase;
    if (diff <= 0) return 100;
    return Math.min(100, Math.max(0, Math.round(((resumo.xp - xpBase) / diff) * 100)));
  });
}
