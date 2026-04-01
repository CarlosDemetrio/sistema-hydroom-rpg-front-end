import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { FieldsetModule } from 'primeng/fieldset';
import { TableModule } from 'primeng/table';
import { FichaAptidaoResponse } from '@models/ficha.model';

interface GrupoAptidao {
  tipo: string;
  aptidoes: FichaAptidaoResponse[];
}

@Component({
  selector: 'app-ficha-aptidoes-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FieldsetModule, TableModule],
  template: `
    <div class="p-3 flex flex-col gap-4">
      @if (aptidoes().length === 0) {
        <div class="flex flex-col items-center py-10 gap-3 text-center">
          <i class="pi pi-list" style="font-size: 3rem; color: var(--text-color-secondary)"></i>
          <p class="text-color-secondary m-0">Nenhuma aptidao distribuida ainda.</p>
        </div>
      } @else {
        @for (grupo of aptidoesAgrupadas(); track grupo.tipo) {
          <p-fieldset [legend]="grupo.tipo" [toggleable]="true">
            <p-table
              [value]="grupo.aptidoes"
              class="p-datatable-sm"
              responsiveLayout="scroll"
            >
              <ng-template #header>
                <tr>
                  <th>Aptidao</th>
                  <th class="text-center">Base</th>
                  <th class="text-center">Sorte</th>
                  <th class="text-center">Classe</th>
                  <th class="text-center">Total</th>
                </tr>
              </ng-template>
              <ng-template #body let-apt>
                <tr>
                  <td>{{ apt.aptidaoNome }}</td>
                  <td class="text-center font-mono">{{ apt.base }}</td>
                  <td class="text-center font-mono">{{ apt.sorte }}</td>
                  <td class="text-center font-mono">{{ apt.classe }}</td>
                  <td class="text-center">
                    <strong class="text-primary font-mono">{{ apt.total }}</strong>
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </p-fieldset>
        }
      }
    </div>
  `,
})
export class FichaAptidoesTabComponent {
  aptidoes = input.required<FichaAptidaoResponse[]>();

  protected aptidoesAgrupadas = computed<GrupoAptidao[]>(() => {
    const grupos = new Map<string, FichaAptidaoResponse[]>();
    for (const apt of this.aptidoes()) {
      // FichaAptidaoResponse does not include tipoAptidaoNome — group as "Geral" in Phase 1
      const tipo = (apt as FichaAptidaoResponse & { tipoAptidaoNome?: string }).tipoAptidaoNome ?? 'Geral';
      if (!grupos.has(tipo)) grupos.set(tipo, []);
      grupos.get(tipo)!.push(apt);
    }
    return Array.from(grupos.entries()).map(([tipo, aptidoes]) => ({ tipo, aptidoes }));
  });
}
