import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';

/**
 * Progressao Section Component (DUMB)
 *
 * Seção 2: Progressão do Personagem
 * - Nível (required)
 * - Experiência
 * - Renascimento
 * - Insolitus
 * - NVS
 */
@Component({
  selector: 'app-progressao-section',
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
          <i class="pi pi-chart-line text-primary text-xl"></i>
          <h3 class="text-xl font-bold m-0">Progressão</h3>
        </div>
      </ng-template>

      <div [formGroup]="form()" class="grid">
        <!-- Info importante -->
        <div class="col-12">
          <div class="p-3 bg-yellow-50 border-round mb-3">
            <p class="text-sm m-0">
              <i class="pi pi-exclamation-triangle mr-2"></i>
              <strong>Importante:</strong> Experiência (XP) só pode ser concedida pelo Mestre. O Nível é calculado automaticamente pelo sistema com base na XP.
            </p>
          </div>
        </div>

        <!-- Nível (read-only, calculado pelo backend) -->
        <div class="col-12 md:col-6">
          <label for="nivel" class="block font-semibold mb-2">
            Nível (Calculado pelo Sistema)
          </label>
          <p-inputnumber
            inputId="nivel"
            formControlName="nivel"
            [min]="1"
            [max]="20"
            [disabled]="true"
            placeholder="1"
            class="w-full"
          ></p-inputnumber>
          <small class="text-color-secondary">Calculado automaticamente baseado na XP</small>
        </div>

        <!-- Experiência (read-only para jogador) -->
        <div class="col-12 md:col-6">
          <label for="experiencia" class="block font-semibold mb-2">
            Experiência (XP) - Apenas Mestre
          </label>
          <p-inputnumber
            inputId="experiencia"
            formControlName="experiencia"
            [min]="0"
            [disabled]="true"
            placeholder="0"
            class="w-full"
          ></p-inputnumber>
          <small class="text-color-secondary">Apenas o Mestre pode conceder XP</small>
        </div>

        <!-- Renascimento -->
        <div class="col-12 md:col-4">
          <label for="renascimento" class="block font-semibold mb-2">
            Renascimento
          </label>
          <p-inputnumber
            inputId="renascimento"
            formControlName="renascimento"
            [min]="0"
            [showButtons]="true"
            placeholder="0"
            class="w-full"
          ></p-inputnumber>
          <small class="text-color-secondary">Número de renascimentos</small>
        </div>

        <!-- Insolitus -->
        <div class="col-12 md:col-4">
          <label for="insolitus" class="block font-semibold mb-2">
            Insolitus
          </label>
          <p-inputnumber
            inputId="insolitus"
            formControlName="insolitus"
            [min]="0"
            [showButtons]="true"
            placeholder="0"
            class="w-full"
          ></p-inputnumber>
          <small class="text-color-secondary">Pontos Insolitus</small>
        </div>

        <!-- NVS -->
        <div class="col-12 md:col-4">
          <label for="nvs" class="block font-semibold mb-2">
            NVS
          </label>
          <p-inputnumber
            inputId="nvs"
            formControlName="nvs"
            [min]="0"
            [showButtons]="true"
            placeholder="0"
            class="w-full"
          ></p-inputnumber>
          <small class="text-color-secondary">Nível de Vida Superior</small>
        </div>
      </div>
    </p-card>
  `
})
export class ProgressaoSectionComponent {
  form = input.required<FormGroup>();
}
