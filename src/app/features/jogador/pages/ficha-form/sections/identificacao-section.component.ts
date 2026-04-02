import { Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { FormFieldErrorComponent } from '@shared/components/form-field-error.component';

/**
 * Identificacao Section Component (DUMB)
 *
 * Seção 1: Dados de Identificação da Ficha
 * - Nome (required)
 * - Origem
 * - Indole
 * - Linhagem
 */
@Component({
  selector: 'app-identificacao-section',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    FormFieldErrorComponent
  ],
  template: `
    <p-card>
      <ng-template #header>
        <div class="flex align-items-center gap-2 p-3">
          <i class="pi pi-user text-primary text-xl"></i>
          <h3 class="text-xl font-bold m-0">Identificação</h3>
        </div>
      </ng-template>

      <div [formGroup]="form()" class="grid">
        <!-- Nome -->
        <div class="col-12">
          <label for="nome" class="block font-semibold mb-2">
            Nome do Personagem <span class="text-red-500">*</span>
          </label>
          <input
            id="nome"
            type="text"
            pInputText
            formControlName="nome"
            placeholder="Digite o nome do personagem"
            class="w-full"
          />
          <app-form-field-error
            [errors]="form().get('nome')?.errors || null"
            [touched]="form().get('nome')?.touched || false"
          ></app-form-field-error>
        </div>

        <!-- Origem -->
        <div class="col-12 md:col-6">
          <label for="origem" class="block font-semibold mb-2">
            Origem
          </label>
          <input
            id="origem"
            type="text"
            pInputText
            formControlName="origem"
            placeholder="Ex: Humano de Valkaria"
            class="w-full"
          />
        </div>

        <!-- Indole -->
        <div class="col-12 md:col-6">
          <label for="indole" class="block font-semibold mb-2">
            Índole
          </label>
          <input
            id="indole"
            type="text"
            pInputText
            formControlName="indole"
            placeholder="Ex: Corajoso, Cauteloso"
            class="w-full"
          />
        </div>

        <!-- Linhagem -->
        <div class="col-12">
          <label for="linhagem" class="block font-semibold mb-2">
            Linhagem
          </label>
          <input
            id="linhagem"
            type="text"
            pInputText
            formControlName="linhagem"
            placeholder="Ex: Nobre, Plebeu"
            class="w-full"
          />
        </div>
      </div>
    </p-card>
  `
})
export class IdentificacaoSectionComponent {
  // Input: FormGroup da seção
  form = input.required<FormGroup>();

  // Output: Eventos se necessário (opcional)
  changed = output<void>();
}
