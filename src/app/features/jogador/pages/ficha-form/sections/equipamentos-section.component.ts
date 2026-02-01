import { Component, input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { Checkbox } from 'primeng/checkbox';

/**
 * Equipamentos Section Component (DUMB)
 *
 * Seção 8: Equipamentos e Itens
 *
 * Features:
 * - FormArray dinâmico (adicionar/remover equipamentos)
 * - Nome do item
 * - Tipo (arma, armadura, acessório, consumível)
 * - Descrição/efeitos
 * - Equipado (checkbox)
 *
 * NOTA: Bônus de equipamentos são calculados pelo BACKEND
 */
@Component({
  selector: 'app-equipamentos-section',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    Textarea,
    SelectModule,
    Checkbox
  ],
  template: `
    <p-card>
      <ng-template #header>
        <div class="flex align-items-center justify-content-between p-3">
          <div class="flex align-items-center gap-2">
            <i class="pi pi-shield text-primary text-xl"></i>
            <h3 class="text-xl font-bold m-0">Equipamentos e Itens</h3>
          </div>
          <p-button
            icon="pi pi-plus"
            label="Adicionar Item"
            (onClick)="addEquipamento()"
            size="small"
          ></p-button>
        </div>
      </ng-template>

      @if (getEquipamentos().length === 0) {
        <div class="text-center text-color-secondary py-6">
          <i class="pi pi-info-circle text-4xl mb-3"></i>
          <p class="text-lg">Nenhum equipamento adicionado</p>
          <p class="text-sm">Clique em "Adicionar Item" para começar</p>
        </div>
      } @else {
        <div [formGroup]="form()" class="grid">
          <div formArrayName="equipamentos" class="col-12">
            @for (equipamento of getEquipamentos().controls; track $index) {
              <div [formGroupName]="$index" class="grid p-3 mb-3 surface-ground border-round">
                <!-- Nome do Item -->
                <div class="col-12 md:col-5">
                  <label [for]="'equip-nome-' + $index" class="block font-semibold mb-2">
                    Nome do Item
                  </label>
                  <input
                    pInputText
                    [id]="'equip-nome-' + $index"
                    formControlName="nome"
                    placeholder="Ex: Espada Longa +1"
                    class="w-full"
                  />
                </div>

                <!-- Tipo -->
                <div class="col-12 md:col-3">
                  <label [for]="'equip-tipo-' + $index" class="block font-semibold mb-2">
                    Tipo
                  </label>
                  <p-select
                    [inputId]="'equip-tipo-' + $index"
                    formControlName="tipo"
                    [options]="tiposEquipamento"
                    placeholder="Selecione"
                    class="w-full"
                  ></p-select>
                </div>

                <!-- Equipado -->
                <div class="col-12 md:col-2 flex align-items-center">
                  <div class="flex align-items-center gap-2 mt-4">
                    <p-checkbox
                      [inputId]="'equip-equipado-' + $index"
                      formControlName="equipado"
                      [binary]="true"
                    ></p-checkbox>
                    <label [for]="'equip-equipado-' + $index" class="font-semibold cursor-pointer">
                      Equipado
                    </label>
                  </div>
                </div>

                <!-- Botão Remover -->
                <div class="col-12 md:col-2 flex align-items-start">
                  <p-button
                    icon="pi pi-trash"
                    severity="danger"
                    [text]="true"
                    (onClick)="removeEquipamento($index)"
                    class="w-full"
                  ></p-button>
                </div>

                <!-- Descrição/Efeitos -->
                <div class="col-12">
                  <label [for]="'equip-desc-' + $index" class="block font-semibold mb-2">
                    Descrição / Efeitos
                  </label>
                  <textarea
                    pTextarea
                    [id]="'equip-desc-' + $index"
                    formControlName="descricao"
                    rows="2"
                    placeholder="Ex: +1 ataque, 1d8+1 dano"
                    class="w-full"
                  ></textarea>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <ng-template #footer>
        <div class="text-color-secondary text-sm">
          <i class="pi pi-info-circle mr-2"></i>
          Bônus de equipamentos equipados serão aplicados automaticamente pelo sistema
        </div>
      </ng-template>
    </p-card>
  `
})
export class EquipamentosSectionComponent {
  form = input.required<FormGroup>();
  private fb = new FormBuilder();

  tiposEquipamento = [
    { label: 'Arma', value: 'ARMA' },
    { label: 'Armadura', value: 'ARMADURA' },
    { label: 'Acessório', value: 'ACESSORIO' },
    { label: 'Consumível', value: 'CONSUMIVEL' },
    { label: 'Outro', value: 'OUTRO' }
  ];

  getEquipamentos(): FormArray {
    return this.form().get('equipamentos') as FormArray;
  }

  addEquipamento() {
    const equipamentoGroup = this.fb.group({
      nome: ['', [Validators.required, Validators.maxLength(100)]],
      tipo: ['ARMA', Validators.required],
      descricao: ['', Validators.maxLength(500)],
      equipado: [false]
    });
    this.getEquipamentos().push(equipamentoGroup);
  }

  removeEquipamento(index: number) {
    this.getEquipamentos().removeAt(index);
  }
}
