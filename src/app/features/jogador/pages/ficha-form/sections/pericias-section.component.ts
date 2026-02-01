import { Component, input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';

/**
 * Pericias Section Component (DUMB)
 *
 * Seção 7: Perícias do Personagem
 *
 * Features:
 * - FormArray dinâmico (adicionar/remover perícias)
 * - Nome da perícia (input text)
 * - Pontos investidos (input number)
 * - Atributo base (select: FOR, DES, CON, INT, SAB, CAR)
 *
 * NOTA: Modificador total é calculado pelo BACKEND
 * NOTA: Lista de perícias disponíveis virá de ConfigStore (futuro)
 */
@Component({
  selector: 'app-pericias-section',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule
  ],
  template: `
    <p-card>
      <ng-template #header>
        <div class="flex align-items-center justify-content-between p-3">
          <div class="flex align-items-center gap-2">
            <i class="pi pi-star text-primary text-xl"></i>
            <h3 class="text-xl font-bold m-0">Perícias</h3>
          </div>
          <p-button
            icon="pi pi-plus"
            label="Adicionar Perícia"
            (onClick)="addPericia()"
            size="small"
          ></p-button>
        </div>
      </ng-template>

      @if (getPericias().length === 0) {
        <div class="text-center text-color-secondary py-6">
          <i class="pi pi-info-circle text-4xl mb-3"></i>
          <p class="text-lg">Nenhuma perícia adicionada</p>
          <p class="text-sm">Clique em "Adicionar Perícia" para começar</p>
        </div>
      } @else {
        <div [formGroup]="form()" class="grid">
          <div formArrayName="pericias" class="col-12">
            @for (pericia of getPericias().controls; track $index) {
              <div [formGroupName]="$index" class="grid p-3 mb-3 surface-ground border-round">
                <!-- Nome da Perícia -->
                <div class="col-12 md:col-5">
                  <label [for]="'pericia-nome-' + $index" class="block font-semibold mb-2">
                    Nome da Perícia
                  </label>
                  <input
                    pInputText
                    [id]="'pericia-nome-' + $index"
                    formControlName="nome"
                    placeholder="Ex: Furtividade"
                    class="w-full"
                  />
                </div>

                <!-- Pontos Investidos -->
                <div class="col-12 md:col-2">
                  <label [for]="'pericia-pontos-' + $index" class="block font-semibold mb-2">
                    Pontos
                  </label>
                  <p-inputnumber
                    [inputId]="'pericia-pontos-' + $index"
                    formControlName="pontosInvestidos"
                    [min]="0"
                    [showButtons]="true"
                    class="w-full"
                  ></p-inputnumber>
                </div>

                <!-- Atributo Base -->
                <div class="col-12 md:col-3">
                  <label [for]="'pericia-atributo-' + $index" class="block font-semibold mb-2">
                    Atributo Base
                  </label>
                  <p-select
                    [inputId]="'pericia-atributo-' + $index"
                    formControlName="atributoBase"
                    [options]="atributosDisponiveis"
                    placeholder="Selecione"
                    class="w-full"
                  ></p-select>
                </div>

                <!-- Botão Remover -->
                <div class="col-12 md:col-2 flex align-items-end">
                  <p-button
                    icon="pi pi-trash"
                    severity="danger"
                    [text]="true"
                    (onClick)="removePericia($index)"
                    class="w-full"
                  ></p-button>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <ng-template #footer>
        <div class="text-color-secondary text-sm">
          <i class="pi pi-info-circle mr-2"></i>
          Modificador total será calculado pelo sistema (Atributo + Pontos + Bônus)
        </div>
      </ng-template>
    </p-card>
  `
})
export class PericiasSectionComponent {
  form = input.required<FormGroup>();
  private fb = new FormBuilder();

  atributosDisponiveis = [
    { label: 'Força (FOR)', value: 'FOR' },
    { label: 'Destreza (DES)', value: 'DES' },
    { label: 'Constituição (CON)', value: 'CON' },
    { label: 'Inteligência (INT)', value: 'INT' },
    { label: 'Sabedoria (SAB)', value: 'SAB' },
    { label: 'Carisma (CAR)', value: 'CAR' }
  ];

  getPericias(): FormArray {
    return this.form().get('pericias') as FormArray;
  }

  addPericia() {
    const periciaGroup = this.fb.group({
      nome: ['', [Validators.required, Validators.maxLength(100)]],
      pontosInvestidos: [0, [Validators.required, Validators.min(0)]],
      atributoBase: ['DES', Validators.required]
    });
    this.getPericias().push(periciaGroup);
  }

  removePericia(index: number) {
    this.getPericias().removeAt(index);
  }
}
