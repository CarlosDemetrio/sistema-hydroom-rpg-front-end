import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { FichaAtributoResponse } from '../../../../../../core/models/ficha.model';

@Component({
  selector: 'app-ficha-atributos-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, ProgressBarModule, TableModule],
  template: `
    <div class="p-3 flex flex-col gap-3">

      <!-- Pontos utilizados -->
      @if (pontosAtributoTotal() > 0) {
        <div class="flex flex-col gap-1">
          <div class="flex justify-between text-sm">
            <span>Pontos utilizados: {{ pontosAtributoUsados() }} / {{ pontosAtributoTotal() }}</span>
            @if (limitadorAtributo() > 0) {
              <span class="text-color-secondary">Limite por atributo (Nv.): {{ limitadorAtributo() }}</span>
            }
          </div>
          <p-progressBar
            [value]="percentualPontosUsados()"
            [showValue]="false"
            [attr.aria-label]="'Pontos de atributo: ' + pontosAtributoUsados() + ' de ' + pontosAtributoTotal()"
          />
        </div>
      }

      <!-- Tabela de atributos -->
      @if (atributos().length === 0) {
        <div class="flex flex-col items-center py-10 gap-3 text-center">
          <i class="pi pi-list-check" style="font-size: 3rem; color: var(--text-color-secondary)"></i>
          <p class="text-color-secondary m-0">Nenhum atributo distribuido ainda.</p>
        </div>
      } @else {
        <p-table
          [value]="atributos()"
          [tableStyle]="{'min-width': '500px'}"
          styleClass="p-datatable-sm p-datatable-striped"
          responsiveLayout="scroll"
        >
          <ng-template #header>
            <tr>
              <th>Atributo</th>
              <th class="text-center">Base</th>
              <th class="text-center">Nivel</th>
              <th class="text-center">Outros</th>
              <th class="text-center">Total</th>
              <th class="text-center">Impeto</th>
            </tr>
          </ng-template>
          <ng-template #body let-atrib>
            <tr>
              <td>
                <span class="font-semibold">{{ atrib.atributoNome }}</span>
                <span class="text-color-secondary ml-2 font-mono text-sm">({{ atrib.atributoAbreviacao }})</span>
              </td>
              <td class="text-center font-mono">{{ atrib.base }}</td>
              <td class="text-center font-mono">{{ atrib.nivel }}</td>
              <td class="text-center font-mono">{{ atrib.outros }}</td>
              <td class="text-center">
                <strong class="text-primary font-mono text-lg">{{ atrib.total }}</strong>
              </td>
              <td class="text-center text-color-secondary font-mono">
                {{ atrib.impeto | number:'1.1-1' }}
              </td>
            </tr>
          </ng-template>
        </p-table>
      }
    </div>
  `,
})
export class FichaAtributosTabComponent {
  atributos = input.required<FichaAtributoResponse[]>();
  limitadorAtributo = input<number>(0);
  pontosAtributoTotal = input<number>(0);
  pontosAtributoUsados = input<number>(0);

  protected percentualPontosUsados = computed(() => {
    const total = this.pontosAtributoTotal();
    if (total === 0) return 0;
    return Math.round((this.pontosAtributoUsados() / total) * 100);
  });
}
