import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { AptidaoConfig } from '@core/models/aptidao-config.model';
import { FichaAptidaoResponse } from '@core/models/ficha.model';

/** Grupo de aptidões agrupadas por tipo. */
interface GrupoAptidao {
  tipo: string;
  aptidoes: FichaAptidaoResponse[];
}

/**
 * LevelUpAptidoesStepComponent — Dumb
 *
 * Step 2 do wizard de level-up: distribuição de pontos de aptidão.
 * Agrupa as aptidões por tipoAptidaoNome via join com configAptidoes (ConfigStore).
 * Exibe p-accordion por tipo com controles + e - para alocar pontos.
 *
 * FichaAptidaoResponse não possui tipoAptidaoNome diretamente; o lookup é feito
 * via configAptidoes (AptidaoConfig[]) usando aptidaoConfigId → tipoAptidaoNome.
 */
@Component({
  selector: 'app-level-up-aptidoes-step',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AccordionModule, ButtonModule, TooltipModule],
  template: `
    <div class="p-3">
      <div class="flex justify-content-between align-items-center mb-3">
        <span class="font-medium">Pontos disponíveis:</span>
        <span
          class="text-xl font-bold"
          [class.text-orange-500]="pontosRestantes() > 0"
          aria-live="polite"
          [attr.aria-label]="pontosRestantes() + ' pontos de aptidão restantes'"
        >
          {{ pontosRestantes() }}
        </span>
      </div>

      <p-accordion [multiple]="true">
        @for (grupo of aptidoesPorTipo(); track grupo.tipo) {
          <p-accordion-panel [value]="grupo.tipo">
            <p-accordion-header>
              {{ grupo.tipo }} ({{ grupo.aptidoes.length }})
            </p-accordion-header>
            <p-accordion-content>
              @for (apt of grupo.aptidoes; track apt.aptidaoConfigId) {
                <div
                  class="flex align-items-center justify-content-between gap-2 py-2 border-bottom-1 surface-border"
                >
                  <div class="flex-1">
                    <span class="font-semibold text-sm">{{ apt.aptidaoNome }}</span>
                    <div class="flex gap-3 text-xs text-color-secondary mt-1">
                      <span [pTooltip]="'Controlado pelo Mestre'">
                        Sorte: <strong>{{ apt.sorte }}</strong>
                      </span>
                      <span [pTooltip]="'Controlado pelo Mestre'">
                        Classe: <strong>{{ apt.classe }}</strong>
                      </span>
                      <span>
                        Total:
                        <strong>{{
                          apt.total + (pontosAdicionados()[apt.aptidaoConfigId] ?? 0)
                        }}</strong>
                      </span>
                    </div>
                  </div>
                  <div class="flex align-items-center gap-2">
                    <p-button
                      icon="pi pi-minus"
                      [text]="true"
                      [rounded]="true"
                      size="small"
                      severity="secondary"
                      [disabled]="(pontosAdicionados()[apt.aptidaoConfigId] ?? 0) === 0"
                      (onClick)="removerPonto(apt.aptidaoConfigId)"
                      [attr.aria-label]="'Remover ponto de ' + apt.aptidaoNome"
                    />
                    <span
                      class="font-bold min-w-6 text-center"
                      aria-live="polite"
                    >
                      {{
                        apt.base + (pontosAdicionados()[apt.aptidaoConfigId] ?? 0)
                      }}
                    </span>
                    <p-button
                      icon="pi pi-plus"
                      [text]="true"
                      [rounded]="true"
                      size="small"
                      severity="success"
                      [disabled]="pontosRestantes() === 0"
                      (onClick)="adicionarPonto(apt.aptidaoConfigId)"
                      [attr.aria-label]="'Adicionar ponto em ' + apt.aptidaoNome"
                    />
                  </div>
                </div>
              }
            </p-accordion-content>
          </p-accordion-panel>
        }
      </p-accordion>
    </div>
  `,
})
export class LevelUpAptidoesStepComponent {
  aptidoes = input.required<FichaAptidaoResponse[]>();
  pontosDisponiveis = input.required<number>();
  /** AptidaoConfig[] do ConfigStore — necessário para lookup de tipoAptidaoNome. */
  configAptidoes = input.required<AptidaoConfig[]>();

  distribuicaoChanged = output<Record<number, number>>();

  protected pontosAdicionados = signal<Record<number, number>>({});

  protected pontosRestantes = computed(
    () =>
      this.pontosDisponiveis() -
      Object.values(this.pontosAdicionados()).reduce((a, b) => a + b, 0)
  );

  protected aptidoesPorTipo = computed<GrupoAptidao[]>(() => {
    const grupos = new Map<string, FichaAptidaoResponse[]>();
    for (const apt of this.aptidoes()) {
      const config = this.configAptidoes().find((c) => c.id === apt.aptidaoConfigId);
      const tipo = config?.tipoAptidaoNome ?? 'Geral';
      if (!grupos.has(tipo)) {
        grupos.set(tipo, []);
      }
      grupos.get(tipo)!.push(apt);
    }
    return Array.from(grupos.entries()).map(([tipo, aptidoes]) => ({ tipo, aptidoes }));
  });

  protected adicionarPonto(id: number): void {
    if (this.pontosRestantes() <= 0) return;
    this.pontosAdicionados.update((m) => ({ ...m, [id]: (m[id] ?? 0) + 1 }));
    this.distribuicaoChanged.emit(this.pontosAdicionados());
  }

  protected removerPonto(id: number): void {
    if ((this.pontosAdicionados()[id] ?? 0) <= 0) return;
    this.pontosAdicionados.update((m) => ({ ...m, [id]: m[id] - 1 }));
    this.distribuicaoChanged.emit(this.pontosAdicionados());
  }
}
