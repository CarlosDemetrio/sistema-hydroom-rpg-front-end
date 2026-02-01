import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { Textarea } from 'primeng/textarea';

/**
 * Descricao Fisica Section Component (DUMB)
 *
 * Seção 3: Descrição Física do Personagem
 * - Altura, Peso, Idade
 * - Olhos, Cabelo, Pele
 * - Aparência (descrição livre)
 */
@Component({
  selector: 'app-descricao-fisica-section',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    Textarea
  ],
  template: `
    <p-card>
      <ng-template #header>
        <div class="flex align-items-center gap-2 p-3">
          <i class="pi pi-user-edit text-primary text-xl"></i>
          <h3 class="text-xl font-bold m-0">Descrição Física</h3>
        </div>
      </ng-template>

      <div [formGroup]="form()" class="grid">
        <!-- Altura, Peso, Idade -->
        <div class="col-12 md:col-4">
          <label for="altura" class="block font-semibold mb-2">
            Altura (cm)
          </label>
          <p-inputnumber
            inputId="altura"
            formControlName="altura"
            [min]="50"
            [max]="300"
            [showButtons]="true"
            suffix=" cm"
            placeholder="170"
            class="w-full"
          ></p-inputnumber>
        </div>

        <div class="col-12 md:col-4">
          <label for="peso" class="block font-semibold mb-2">
            Peso (kg)
          </label>
          <p-inputnumber
            inputId="peso"
            formControlName="peso"
            [min]="10"
            [max]="500"
            [showButtons]="true"
            suffix=" kg"
            placeholder="70"
            class="w-full"
          ></p-inputnumber>
        </div>

        <div class="col-12 md:col-4">
          <label for="idade" class="block font-semibold mb-2">
            Idade
          </label>
          <p-inputnumber
            inputId="idade"
            formControlName="idade"
            [min]="1"
            [max]="1000"
            [showButtons]="true"
            suffix=" anos"
            placeholder="25"
            class="w-full"
          ></p-inputnumber>
        </div>

        <!-- Olhos, Cabelo, Pele -->
        <div class="col-12 md:col-4">
          <label for="olhos" class="block font-semibold mb-2">
            Cor dos Olhos
          </label>
          <input
            id="olhos"
            type="text"
            pInputText
            formControlName="olhos"
            placeholder="Ex: Castanhos"
            class="w-full"
          />
        </div>

        <div class="col-12 md:col-4">
          <label for="cabelo" class="block font-semibold mb-2">
            Cabelo
          </label>
          <input
            id="cabelo"
            type="text"
            pInputText
            formControlName="cabelo"
            placeholder="Ex: Preto curto"
            class="w-full"
          />
        </div>

        <div class="col-12 md:col-4">
          <label for="pele" class="block font-semibold mb-2">
            Tom de Pele
          </label>
          <input
            id="pele"
            type="text"
            pInputText
            formControlName="pele"
            placeholder="Ex: Morena"
            class="w-full"
          />
        </div>

        <!-- Aparência (descrição livre) -->
        <div class="col-12">
          <label for="aparencia" class="block font-semibold mb-2">
            Aparência Geral
          </label>
          <textarea
            id="aparencia"
            pTextarea
            formControlName="aparencia"
            rows="4"
            placeholder="Descreva a aparência geral do personagem, marcas, cicatrizes, estilo de vestir, etc."
            class="w-full"
          ></textarea>
        </div>
      </div>
    </p-card>
  `
})
export class DescricaoFisicaSectionComponent {
  form = input.required<FormGroup>();
}
