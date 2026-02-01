import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';

/**
 * Vida Section Component (DUMB)
 *
 * Seção 5: Vida e Saúde do Personagem
 * - Vida Vigor (CON)
 * - Vida Outros (bônus diversos)
 * - Vida Nível (por nível)
 * - Sangue % (integridade)
 *
 * NOTA: vidaTotal é calculado pelo BACKEND
 * NOTA: Membros (integridade de membros) pode ser implementado depois
 */
@Component({
  selector: 'app-vida-section',
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
          <i class="pi pi-heart text-primary text-xl"></i>
          <h3 class="text-xl font-bold m-0">Vida e Saúde</h3>
        </div>
      </ng-template>

      <div [formGroup]="form()" class="grid">
        <!-- Info -->
        <div class="col-12">
          <div class="p-3 bg-blue-50 border-round mb-3">
            <p class="text-sm m-0">
              <i class="pi pi-info-circle mr-2"></i>
              <strong>Preview:</strong> Vida Total é calculada em tempo real para feedback. Backend recalculará oficialmente ao salvar.
            </p>
          </div>
        </div>

        <!-- Vida Vigor (baseado em CON) -->
        <div class="col-12 md:col-4">
          <label for="vidaVigor" class="block font-semibold mb-2">
            Vida Vigor (CON) <span class="text-red-500">*</span>
          </label>
          <p-inputnumber
            inputId="vidaVigor"
            formControlName="vidaVigor"
            [min]="0"
            [max]="200"
            [showButtons]="true"
            placeholder="20"
            class="w-full"
          ></p-inputnumber>
          <small class="text-color-secondary">Baseado no modificador de CON</small>
        </div>

        <!-- Vida Outros (bônus diversos) -->
        <div class="col-12 md:col-4">
          <label for="vidaOutros" class="block font-semibold mb-2">
            Vida Outros
          </label>
          <p-inputnumber
            inputId="vidaOutros"
            formControlName="vidaOutros"
            [min]="0"
            [max]="200"
            [showButtons]="true"
            placeholder="0"
            class="w-full"
          ></p-inputnumber>
          <small class="text-color-secondary">Bônus de itens, magias, etc.</small>
        </div>

        <!-- Vida Nível -->
        <div class="col-12 md:col-4">
          <label for="vidaNivel" class="block font-semibold mb-2">
            Vida por Nível <span class="text-red-500">*</span>
          </label>
          <p-inputnumber
            inputId="vidaNivel"
            formControlName="vidaNivel"
            [min]="0"
            [max]="500"
            [showButtons]="true"
            placeholder="40"
            class="w-full"
          ></p-inputnumber>
          <small class="text-color-secondary">Vida ganha por nível</small>
        </div>

        <!-- Sangue % (Integridade) -->
        <div class="col-12 md:col-6">
          <label for="sanguePercentual" class="block font-semibold mb-2">
            Sangue (%) <span class="text-red-500">*</span>
          </label>
          <p-inputnumber
            inputId="sanguePercentual"
            formControlName="sanguePercentual"
            [min]="0"
            [max]="100"
            [showButtons]="true"
            suffix="%"
            placeholder="100"
            class="w-full"
          ></p-inputnumber>
          <small class="text-color-secondary">Integridade sanguínea (0-100%)</small>
        </div>

        <!-- Preview: Vida Total (calculado temporariamente) -->
        <div class="col-12">
          <div class="p-4 surface-100 border-round">
            <div class="flex justify-content-between align-items-center">
              <div>
                <div class="text-sm text-color-secondary mb-1">
                  <i class="pi pi-eye mr-1"></i>
                  Preview: Vida Total
                </div>
                <div class="text-3xl font-bold text-primary">
                  {{ getVidaTotalPreview() }}
                </div>
                <small class="text-color-secondary">
                  Valor temporário - Backend calculará o oficial
                </small>
              </div>
              <i class="pi pi-heart text-6xl text-red-300"></i>
            </div>
          </div>
        </div>
      </div>
    </p-card>
  `
})
export class VidaSectionComponent {
  form = input.required<FormGroup>();

  /**
   * PREVIEW TEMPORÁRIO (client-side)
   * Fórmula: vidaVigor + vidaOutros + vidaNivel
   * Backend recalculará com fórmula oficial ao salvar
   */
  getVidaTotalPreview(): number {
    const vidaVigor = this.form().get('vidaVigor')?.value || 0;
    const vidaOutros = this.form().get('vidaOutros')?.value || 0;
    const vidaNivel = this.form().get('vidaNivel')?.value || 0;
    return vidaVigor + vidaOutros + vidaNivel;
  }
}
