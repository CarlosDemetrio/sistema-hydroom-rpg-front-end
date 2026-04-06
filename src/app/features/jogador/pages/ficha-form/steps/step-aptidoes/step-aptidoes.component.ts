import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { FichaAptidaoEditavel, TipoAptidaoComAptidoes } from '../../ficha-wizard.types';

/**
 * StepAptidoesComponent (DUMB)
 *
 * Passo 4 do Wizard de Ficha: distribuicao de pontos de aptidao base.
 *
 * Inputs:
 * - aptidoesAgrupadas: aptidoes agrupadas por tipo de aptidao
 * - pontosDisponiveis: total de pontos de aptidao que o jogador pode distribuir
 *
 * Outputs:
 * - aptidoesChanged: emite a lista achatada atualizada a cada incremento/decremento
 *
 * Regras:
 * - apenas `base` e editavel — `sorte` e `classe` sao somente leitura
 * - base nao pode ser negativa (minimo 0)
 * - soma de todos os base nao pode exceder pontosDisponiveis
 * - botao [+] desabilitado quando pontosRestantes === 0
 * - Sempre valido — nao bloqueia o avanco do wizard
 */
@Component({
  selector: 'app-step-aptidoes',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonModule,
    CardModule,
    DividerModule,
    MessageModule,
    ProgressBarModule,
    TagModule,
  ],
  template: `
    <p-card>
      <ng-template #header>
        <div class="flex align-items-center justify-content-between p-3 pb-0">
          <div class="flex align-items-center gap-2">
            <i class="pi pi-bolt text-primary text-xl"></i>
            <h3 class="text-xl font-bold m-0">Aptidoes</h3>
          </div>
          <div class="flex align-items-center gap-2">
            <span class="text-color-secondary text-sm">Pontos utilizados:</span>
            <span
              class="font-bold text-lg"
              [class.text-green-500]="pontosRestantes() > 0"
              [class.text-orange-500]="pontosRestantes() === 0"
              aria-label="Pontos utilizados de aptidao"
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

      <div class="flex flex-column gap-4">
        @for (grupo of aptidoesAgrupadas(); track grupo.tipoNome) {

          <div>
            <div class="flex align-items-center gap-2 mb-3">
              <i class="pi pi-tag text-color-secondary text-sm"></i>
              <span class="font-semibold text-color-secondary text-sm uppercase tracking-wide">
                {{ grupo.tipoNome }}
              </span>
            </div>

            <div class="flex flex-column gap-2">
              @for (aptidao of grupo.aptidoes; track aptidao.aptidaoConfigId) {
                <div class="border-1 border-200 border-round p-3">
                  <div class="flex align-items-center justify-content-between">

                    <!-- Nome da aptidao -->
                    <span
                      class="font-semibold"
                      [attr.aria-label]="aptidao.aptidaoNome"
                    >{{ aptidao.aptidaoNome }}</span>

                    <!-- Controles e badges -->
                    <div class="flex align-items-center gap-3">

                      <!-- Badges somente leitura: sorte e classe -->
                      @if (aptidao.sorte !== 0) {
                        <span
                          class="text-xs text-color-secondary"
                          aria-label="Sorte: {{ aptidao.sorte }}"
                        >
                          Sorte: <span class="font-semibold">{{ aptidao.sorte > 0 ? '+' : '' }}{{ aptidao.sorte }}</span>
                        </span>
                      }
                      @if (aptidao.classe !== 0) {
                        <span
                          class="text-xs text-color-secondary"
                          aria-label="Classe: {{ aptidao.classe }}"
                        >
                          Classe: <span class="font-semibold">{{ aptidao.classe > 0 ? '+' : '' }}{{ aptidao.classe }}</span>
                        </span>
                      }

                      <!-- Spinner [-][base][+] -->
                      <div class="flex align-items-center gap-1">
                        <p-button
                          icon="pi pi-minus"
                          [rounded]="true"
                          [text]="true"
                          size="small"
                          [disabled]="aptidao.base <= 0"
                          (onClick)="decrementar(aptidao.aptidaoConfigId)"
                          [attr.aria-label]="'Diminuir ' + aptidao.aptidaoNome"
                        ></p-button>
                        <span
                          class="font-bold text-lg"
                          style="min-width: 2rem; text-align: center"
                          [attr.aria-label]="aptidao.aptidaoNome + ': ' + aptidao.base"
                        >{{ aptidao.base }}</span>
                        <p-button
                          icon="pi pi-plus"
                          [rounded]="true"
                          [text]="true"
                          size="small"
                          [disabled]="pontosRestantes() <= 0"
                          (onClick)="incrementar(aptidao.aptidaoConfigId)"
                          [attr.aria-label]="'Aumentar ' + aptidao.aptidaoNome"
                        ></p-button>
                      </div>

                    </div>
                  </div>
                </div>
              }
            </div>

            @if (!$last) {
              <p-divider styleClass="mt-3 mb-1"></p-divider>
            }
          </div>
        }

        @if (aptidoesAgrupadas().length === 0) {
          <div class="text-center text-color-secondary p-4">
            <i class="pi pi-info-circle text-2xl mb-2 block"></i>
            <p class="m-0">Nenhuma aptidao configurada para este jogo.</p>
          </div>
        }
      </div>
    </p-card>
  `,
})
export class StepAptidoesComponent {
  aptidoesAgrupadas = input.required<TipoAptidaoComAptidoes[]>();
  pontosDisponiveis = input.required<number>();

  aptidoesChanged = output<FichaAptidaoEditavel[]>();

  readonly pontosUtilizados = computed(() =>
    this.aptidoesAgrupadas()
      .flatMap((g) => g.aptidoes)
      .reduce((sum, a) => sum + a.base, 0)
  );

  readonly pontosRestantes = computed(() =>
    Math.max(0, this.pontosDisponiveis() - this.pontosUtilizados())
  );

  readonly mensagemInfo = computed(() => {
    const restantes = this.pontosRestantes();
    return `Voce tem ${restantes} ponto(s) restante(s) de aptidao. Pontos nao usados ficam disponiveis para futuros niveis.`;
  });

  private todasAptidoes(): FichaAptidaoEditavel[] {
    return this.aptidoesAgrupadas().flatMap((g) => g.aptidoes);
  }

  private emitirAtualizacao(atualizado: FichaAptidaoEditavel[]): void {
    // Reconstruir a estrutura agrupada mantendo a ordem dos grupos
    // mas emitir a lista achatada para o wizard gerenciar
    this.aptidoesChanged.emit(atualizado);
  }

  incrementar(aptidaoConfigId: number): void {
    if (this.pontosRestantes() <= 0) return;
    const atualizado = this.todasAptidoes().map((a) => {
      if (a.aptidaoConfigId !== aptidaoConfigId) return a;
      if (this.pontosRestantes() <= 0) return a;
      return { ...a, base: a.base + 1 };
    });
    this.emitirAtualizacao(atualizado);
  }

  decrementar(aptidaoConfigId: number): void {
    const atualizado = this.todasAptidoes().map((a) => {
      if (a.aptidaoConfigId !== aptidaoConfigId) return a;
      if (a.base <= 0) return a;
      return { ...a, base: a.base - 1 };
    });
    this.emitirAtualizacao(atualizado);
  }
}
