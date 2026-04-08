import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ProgressBarModule } from 'primeng/progressbar';
import { FichaAtributoResponse } from '@core/models/ficha.model';

/** Atributo com total provisório incluindo pontos adicionados no wizard. */
interface AtributoComDistribuicao extends FichaAtributoResponse {
  totalComDistribuicao: number;
}

/**
 * LevelUpAtributosStepComponent — Dumb
 *
 * Step 1 do wizard de level-up: distribuição de pontos de atributo.
 * Exibe grid de atributos com controles + e - para alocar pontos.
 * Respeita o limitador de atributo do nível atual.
 */
@Component({
  selector: 'app-level-up-atributos-step',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonModule, MessageModule, ProgressBarModule],
  template: `
    <div class="p-3">
      <div class="flex justify-content-between align-items-center mb-3">
        <span class="font-medium">Pontos disponíveis:</span>
        <span
          class="text-xl font-bold"
          [class.text-orange-500]="pontosRestantes() > 0"
          aria-live="polite"
          [attr.aria-label]="pontosRestantes() + ' pontos de atributo restantes'"
        >
          {{ pontosRestantes() }}
        </span>
      </div>

      @if (todosNoLimite() && pontosRestantes() > 0) {
        <p-message severity="warn" class="mb-3 block">
          Todos os atributos atingiram o teto ({{ limitadorAtributo() }}). Os
          {{ pontosRestantes() }} pontos restantes não podem ser distribuídos agora.
        </p-message>
      }

      <div class="flex flex-col gap-2">
        @for (a of atributosComDistribuicao(); track a.atributoAbreviacao) {
          <div class="flex align-items-center gap-2 p-2 border-round surface-100">
            <span class="font-medium w-6rem">{{ a.atributoNome }}</span>
            <p-progressbar
              [value]="(a.totalComDistribuicao / limitadorAtributo()) * 100"
              [showValue]="false"
              class="flex-1"
              style="height: 8px"
              [attr.aria-valuemin]="0"
              [attr.aria-valuemax]="limitadorAtributo()"
              [attr.aria-valuenow]="a.totalComDistribuicao"
            />
            <span class="text-sm text-color-secondary w-3rem text-right">
              {{ a.totalComDistribuicao }}/{{ limitadorAtributo() }}
            </span>
            <p-button
              icon="pi pi-minus"
              [text]="true"
              size="small"
              severity="secondary"
              [disabled]="!podeRemover(a.atributoAbreviacao)"
              [attr.aria-label]="'Remover ponto de ' + a.atributoNome"
              (onClick)="removerPonto(a.atributoAbreviacao)"
            />
            <p-button
              icon="pi pi-plus"
              [text]="true"
              size="small"
              severity="primary"
              [disabled]="!podeAdicionar(a.atributoAbreviacao)"
              [attr.aria-label]="'Adicionar ponto em ' + a.atributoNome"
              (onClick)="adicionarPonto(a.atributoAbreviacao)"
            />
          </div>
        }
      </div>
    </div>
  `,
})
export class LevelUpAtributosStepComponent {
  atributos = input.required<FichaAtributoResponse[]>();
  pontosDisponiveis = input.required<number>();
  limitadorAtributo = input.required<number>();

  distribuicaoChanged = output<Record<string, number>>();

  protected pontosAdicionados = signal<Record<string, number>>({});

  protected pontosRestantes = computed(
    () =>
      this.pontosDisponiveis() -
      Object.values(this.pontosAdicionados()).reduce((a, b) => a + b, 0)
  );

  protected atributosComDistribuicao = computed<AtributoComDistribuicao[]>(() =>
    this.atributos().map((a) => ({
      ...a,
      totalComDistribuicao:
        a.total + (this.pontosAdicionados()[a.atributoAbreviacao] ?? 0),
    }))
  );

  protected todosNoLimite = computed(() =>
    this.atributosComDistribuicao().every(
      (a) => a.totalComDistribuicao >= this.limitadorAtributo()
    )
  );

  protected podeAdicionar(sigla: string): boolean {
    const a = this.atributosComDistribuicao().find(
      (x) => x.atributoAbreviacao === sigla
    );
    return (
      this.pontosRestantes() > 0 &&
      !!a &&
      a.totalComDistribuicao < this.limitadorAtributo()
    );
  }

  protected podeRemover(sigla: string): boolean {
    return (this.pontosAdicionados()[sigla] ?? 0) > 0;
  }

  protected adicionarPonto(sigla: string): void {
    if (!this.podeAdicionar(sigla)) return;
    const atual = this.pontosAdicionados()[sigla] ?? 0;
    this.pontosAdicionados.update((m) => ({ ...m, [sigla]: atual + 1 }));
    this.distribuicaoChanged.emit(this.pontosAdicionados());
  }

  protected removerPonto(sigla: string): void {
    if (!this.podeRemover(sigla)) return;
    const atual = this.pontosAdicionados()[sigla] ?? 0;
    this.pontosAdicionados.update((m) => ({ ...m, [sigla]: atual - 1 }));
    this.distribuicaoChanged.emit(this.pontosAdicionados());
  }
}
