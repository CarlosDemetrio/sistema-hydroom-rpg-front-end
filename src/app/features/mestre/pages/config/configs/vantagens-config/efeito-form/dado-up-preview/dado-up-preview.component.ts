import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SliderModule } from 'primeng/slider';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

import { DadoProspeccaoConfig } from '@core/models/config.models';

/**
 * DadoUpPreviewComponent
 *
 * Exibe visualmente a sequência de dados de prospecção para o tipo
 * de efeito DADO_UP. O Mestre pode simular o dado que o personagem
 * teria em cada nível da vantagem através do slider de preview.
 *
 * - Dado correspondente ao nível de preview recebe classe "dado-ativo"
 * - Quando o nível excede a quantidade de dados na sequência, o último
 *   dado recebe a classe "dado-cap" (indica teto da progressão)
 */
@Component({
  selector: 'app-dado-up-preview',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    SliderModule,
    TagModule,
    TooltipModule,
  ],
  template: `
    <div class="flex flex-column gap-3">

      <p class="m-0 text-sm text-color-secondary">
        Cada nível desta vantagem avança o dado de prospecção uma posição na
        sequência abaixo. O personagem usa o dado correspondente ao nível atual
        da vantagem.
      </p>

      @if (dadosOrdenados().length === 0) {
        <div class="flex align-items-start gap-2 p-3 border-round surface-100">
          <i class="pi pi-exclamation-circle text-orange-400 mt-1"></i>
          <p class="m-0 text-sm text-color-secondary">
            Configure os dados de prospecção no jogo para visualizar a sequência.
          </p>
        </div>
      } @else {

        <!-- Sequência visual de dados -->
        <div class="flex gap-2 overflow-x-auto pb-1">
          @for (dado of dadosOrdenados(); track dado.id; let i = $index) {
            <div
              class="dado-item flex flex-column align-items-center gap-1 p-2 border-round border-1 cursor-default flex-shrink-0"
              [class.dado-ativo]="isDadoAtivo(i)"
              [class.dado-cap]="isDadoCap(i)"
              [style.min-width.rem]="4"
              [pTooltip]="dado.nome"
              tooltipPosition="top"
            >
              <span class="font-bold text-lg">d{{ dado.numeroFaces }}</span>
              <span class="text-xs text-color-secondary">Nível {{ i + 1 }}</span>
              @if (isDadoCap(i)) {
                  <p-tag value="máx" severity="warn" [style]="{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }" />
              }
            </div>
          }
        </div>

        <!-- Slider de preview -->
        <div class="flex flex-column gap-2">
          <div class="flex justify-content-between align-items-center">
            <span class="text-sm font-semibold">Simular nível {{ nivelPreview() }}</span>
            @if (dadoAtual()) {
              <p-tag [value]="dadoAtual()!.nome" severity="success" />
            }
          </div>
          <p-slider
            [(ngModel)]="nivelPreviewModel"
            [min]="1"
            [max]="nivelMaximo()"
            (onChange)="onNivelChange($event.value ?? 1)"
          />
          <small class="text-color-secondary">
            Arraste para simular o dado em diferentes níveis da vantagem.
          </small>
        </div>

      }

    </div>
  `,
  styles: [`
    .dado-item {
      border-color: var(--surface-border);
      background: var(--surface-50);
      transition: border-color 0.2s, background 0.2s;
    }

    .dado-ativo {
      border-color: var(--primary-color) !important;
      background: color-mix(in srgb, var(--primary-color) 10%, transparent) !important;
      color: var(--primary-color);

      span.font-bold {
        color: var(--primary-color);
      }
    }

    .dado-cap {
      border-color: var(--orange-400) !important;
      background: color-mix(in srgb, var(--orange-400) 10%, transparent) !important;
    }
  `],
})
export class DadoUpPreviewComponent {
  dadosOrdenados = input.required<DadoProspeccaoConfig[]>();
  nivelMaximo    = input<number>(10);

  nivelPreview      = signal<number>(1);
  nivelPreviewModel = 1;

  /**
   * Dado resultante para o nível de preview atual.
   * Retorna o dado na posição (nivelPreview - 1), com clamp no último elemento.
   */
  dadoAtual = computed<DadoProspeccaoConfig | null>(() => {
    const dados = this.dadosOrdenados();
    if (dados.length === 0) return null;
    const idx = Math.min(this.nivelPreview() - 1, dados.length - 1);
    return dados[idx];
  });

  /**
   * Retorna true se o dado na posição i é o correspondente ao nível de preview.
   */
  isDadoAtivo(i: number): boolean {
    const dados = this.dadosOrdenados();
    if (dados.length === 0) return false;
    const idx = Math.min(this.nivelPreview() - 1, dados.length - 1);
    return i === idx;
  }

  /**
   * Retorna true se o dado está na última posição E o nível de preview
   * excede o total de dados disponíveis (indicando teto da progressão).
   */
  isDadoCap(i: number): boolean {
    const dados = this.dadosOrdenados();
    return i === dados.length - 1 && this.nivelPreview() > dados.length;
  }

  onNivelChange(nivel: number): void {
    this.nivelPreview.set(nivel);
  }
}
