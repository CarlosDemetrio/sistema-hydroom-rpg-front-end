import { Component, input } from '@angular/core';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';

/**
 * Atributos Section Component (DUMB)
 *
 * Seção 4: Atributos do Personagem
 * - FOR, DES, CON, INT, SAB, CAR
 * - FormArray com 6 atributos fixos
 * - Valor base (distribuição de pontos pelo jogador)
 * - Modificador calculado pelo backend
 */
@Component({
  selector: 'app-atributos-section',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CardModule,
    InputNumberModule
  ],
  template: `
    <p-card>
      <ng-template #header>
        <div class="flex align-items-center gap-2 p-3">
          <i class="pi pi-chart-bar text-primary text-xl"></i>
          <h3 class="text-xl font-bold m-0">Atributos</h3>
        </div>
      </ng-template>

      <div [formGroup]="form()" class="grid">
        <div class="col-12">
          <p class="text-sm text-color-secondary mb-3">
            Distribua os pontos de atributo. Modificadores são calculados em tempo real para preview (Backend recalculará oficialmente).
          </p>
        </div>

        <!-- Lista de Atributos -->
        <div formArrayName="atributos" class="col-12">
          <div class="grid">
            @for (atributo of getAtributosArray().controls; track $index) {
              <div class="col-12 md:col-6 lg:col-4" [formGroupName]="$index">
                <div class="p-3 surface-100 border-round">
                  <div class="flex justify-content-between align-items-center mb-2">
                    <label class="font-bold text-lg">
                      {{ getAtributoNome($index) }}
                    </label>
                    <!-- Preview do Modificador (calculado temporariamente) -->
                    <span class="text-sm font-semibold" [class]="getModificadorClass($index)">
                      <i class="pi pi-eye text-xs mr-1"></i>
                      {{ getModificadorPreview($index) }}
                    </span>
                  </div>

                  <!-- Valor Base -->
                  <div>
                    <label [for]="'atributo-' + $index" class="block text-sm mb-1">
                      Valor Base <span class="text-red-500">*</span>
                    </label>
                    <p-inputnumber
                      [inputId]="'atributo-' + $index"
                      formControlName="valorBase"
                      [min]="1"
                      [max]="30"
                      [showButtons]="true"
                      placeholder="10"
                      class="w-full"
                    ></p-inputnumber>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Info: Preview vs Backend -->
        <div class="col-12">
          <div class="p-3 bg-primary-reverse border-round">
            <p class="text-sm m-0">
              <i class="pi pi-info-circle mr-2"></i>
              <strong>Preview:</strong> Modificadores são calculados em tempo real (valorBase - 10) / 2 para feedback imediato.
              O backend recalculará com as fórmulas oficiais ao salvar.
              Valores típicos: 8-10 (fraco), 12-14 (médio), 16-18 (forte), 20+ (excepcional).
            </p>
          </div>
        </div>
      </div>
    </p-card>
  `
})
export class AtributosSectionComponent {
  form = input.required<FormGroup>();

  // Nomes dos atributos (ordem fixa)
  private atributosNomes = ['FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR'];

  getAtributosArray(): FormArray {
    return this.form().get('atributos') as FormArray;
  }

  getAtributoNome(index: number): string {
    return this.atributosNomes[index] || `Atributo ${index + 1}`;
  }

  /**
   * PREVIEW TEMPORÁRIO (client-side)
   * Fórmula básica: (valorBase - 10) / 2
   * Backend recalculará com fórmula oficial ao salvar
   */
  getModificadorPreview(index: number): string {
    const atributo = this.getAtributosArray().at(index);
    const valorBase = atributo?.get('valorBase')?.value || 10;
    const mod = Math.floor((valorBase - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  }

  getModificadorClass(index: number): string {
    const atributo = this.getAtributosArray().at(index);
    const valorBase = atributo?.get('valorBase')?.value || 10;
    const mod = Math.floor((valorBase - 10) / 2);

    if (mod >= 4) return 'text-green-600';
    if (mod >= 2) return 'text-blue-600';
    if (mod >= 0) return 'text-color';
    return 'text-red-600';
  }
}
