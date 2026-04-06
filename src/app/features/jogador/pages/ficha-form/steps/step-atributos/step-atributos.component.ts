import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { ProgressBarModule } from 'primeng/progressbar';
import { FichaAtributoEditavel } from '../../ficha-wizard.types';

/**
 * StepAtributosComponent (DUMB)
 *
 * Passo 3 do Wizard de Ficha: distribuicao de pontos de atributo base.
 *
 * Inputs:
 * - atributos: lista de atributos editaveis com valores atuais
 * - pontosDisponiveis: total de pontos que o jogador pode distribuir
 * - limitadorAtributo: valor maximo que qualquer atributo base pode atingir
 *
 * Outputs:
 * - atributosChanged: emite a lista atualizada a cada incremento/decremento
 *
 * Regras:
 * - base nao pode exceder limitadorAtributo
 * - soma de todos os base nao pode exceder pontosDisponiveis
 * - jogador pode reservar pontos (nao e obrigatorio gastar tudo)
 * - Sempre valido — nao bloqueia o avanco do wizard
 */
@Component({
  selector: 'app-step-atributos',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonModule,
    CardModule,
    MessageModule,
    ProgressBarModule,
  ],
  template: `
    <p-card>
      <ng-template #header>
        <div class="flex align-items-center justify-content-between p-3 pb-0">
          <div class="flex align-items-center gap-2">
            <i class="pi pi-sliders-h text-primary text-xl"></i>
            <h3 class="text-xl font-bold m-0">Atributos</h3>
          </div>
          <div class="flex align-items-center gap-2">
            <span class="text-color-secondary text-sm">Pontos utilizados:</span>
            <span
              class="font-bold text-lg"
              [class.text-green-500]="pontosRestantes() > 0"
              [class.text-orange-500]="pontosRestantes() === 0"
            >
              {{ pontosUtilizados() }} / {{ pontosDisponiveis() }}
            </span>
          </div>
        </div>
      </ng-template>

      <p-message
        severity="info"
        [text]="mensagemInfo()"
        styleClass="mb-4 w-full"
      ></p-message>

      <div class="flex flex-column gap-3">
        @for (atributo of atributos(); track atributo.atributoConfigId) {
          <div class="border-1 border-200 border-round p-3">
            <div class="flex align-items-center justify-content-between mb-2">
              <div>
                <span class="font-semibold">{{ atributo.atributoNome }}</span>
                <span class="text-color-secondary text-sm ml-2">({{ atributo.atributoAbreviacao }})</span>
              </div>
              <div class="flex align-items-center gap-2">
                <p-button
                  icon="pi pi-minus"
                  [rounded]="true"
                  [text]="true"
                  size="small"
                  [disabled]="atributo.base <= 0"
                  (onClick)="decrementar(atributo.atributoConfigId)"
                  [attr.aria-label]="'Diminuir ' + atributo.atributoNome"
                ></p-button>
                <span
                  class="font-bold text-xl"
                  style="min-width: 2rem; text-align: center"
                  [attr.aria-label]="atributo.atributoNome + ': ' + atributo.base"
                >{{ atributo.base }}</span>
                <p-button
                  icon="pi pi-plus"
                  [rounded]="true"
                  [text]="true"
                  size="small"
                  [disabled]="atributo.base >= limitadorAtributo() || pontosRestantes() <= 0"
                  (onClick)="incrementar(atributo.atributoConfigId)"
                  [attr.aria-label]="'Aumentar ' + atributo.atributoNome"
                ></p-button>
              </div>
            </div>
            <p-progress-bar
              [value]="calcularPercentual(atributo.base)"
              [showValue]="false"
              styleClass="h-1rem mb-2"
            ></p-progress-bar>
            <div class="flex justify-content-between text-sm text-color-secondary">
              <span>Base: {{ atributo.base }} / {{ limitadorAtributo() }}</span>
              @if (atributo.outros !== 0) {
                <span>Bonus de raca: {{ atributo.outros > 0 ? '+' : '' }}{{ atributo.outros }}</span>
              }
            </div>
          </div>
        }
      </div>
    </p-card>
  `,
})
export class StepAtributosComponent {
  atributos = input.required<FichaAtributoEditavel[]>();
  pontosDisponiveis = input.required<number>();
  limitadorAtributo = input.required<number>();

  atributosChanged = output<FichaAtributoEditavel[]>();

  readonly pontosUtilizados = computed(() =>
    this.atributos().reduce((sum, a) => sum + a.base, 0)
  );

  readonly pontosRestantes = computed(() =>
    Math.max(0, this.pontosDisponiveis() - this.pontosUtilizados())
  );

  readonly mensagemInfo = computed(() => {
    const restantes = this.pontosRestantes();
    const limitador = this.limitadorAtributo();
    return `Voce tem ${restantes} ponto(s) restante(s). Limite por atributo: ${limitador}. Pontos nao usados ficam disponiveis para futuros niveis.`;
  });

  calcularPercentual(base: number): number {
    const limitador = this.limitadorAtributo();
    if (limitador <= 0) return 0;
    return (base / limitador) * 100;
  }

  incrementar(atributoConfigId: number): void {
    const atualizado = this.atributos().map((a) => {
      if (a.atributoConfigId !== atributoConfigId) return a;
      if (a.base >= this.limitadorAtributo()) return a;
      if (this.pontosRestantes() <= 0) return a;
      return { ...a, base: a.base + 1 };
    });
    this.atributosChanged.emit(atualizado);
  }

  decrementar(atributoConfigId: number): void {
    const atualizado = this.atributos().map((a) => {
      if (a.atributoConfigId !== atributoConfigId) return a;
      if (a.base <= 0) return a;
      return { ...a, base: a.base - 1 };
    });
    this.atributosChanged.emit(atualizado);
  }
}
