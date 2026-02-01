import { Component, input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';

/**
 * Titulos/Runas Section Component (DUMB)
 *
 * Seção 10: Títulos e Runas Especiais
 *
 * Features:
 * - FormArray dinâmico (adicionar/remover títulos/runas)
 * - Nome
 * - Tipo (título/runa)
 * - Descrição/efeitos
 *
 * NOTA: Sistema avançado de customização
 */
@Component({
  selector: 'app-titulos-runas-section',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    Textarea,
    SelectModule
  ],
  template: `
    <p-card>
      <ng-template #header>
        <div class="flex align-items-center justify-content-between p-3">
          <div class="flex align-items-center gap-2">
            <i class="pi pi-star-fill text-primary text-xl"></i>
            <h3 class="text-xl font-bold m-0">Títulos e Runas</h3>
          </div>
          <p-button
            icon="pi pi-plus"
            label="Adicionar"
            (onClick)="addItem()"
            size="small"
          ></p-button>
        </div>
      </ng-template>

      @if (getItems().length === 0) {
        <div class="text-center text-color-secondary py-6">
          <i class="pi pi-info-circle text-4xl mb-3"></i>
          <p class="text-lg">Nenhum título ou runa adicionado</p>
          <p class="text-sm">Títulos e runas concedem habilidades especiais</p>
        </div>
      } @else {
        <div [formGroup]="form()" class="grid">
          <div formArrayName="titulosRunas" class="col-12">
            @for (item of getItems().controls; track $index) {
              <div [formGroupName]="$index" class="grid p-3 mb-3 surface-ground border-round">
                <!-- Nome -->
                <div class="col-12 md:col-6">
                  <label [for]="'titulo-nome-' + $index" class="block font-semibold mb-2">
                    Nome
                  </label>
                  <input
                    pInputText
                    [id]="'titulo-nome-' + $index"
                    formControlName="nome"
                    placeholder="Ex: Guerreiro Lendário"
                    class="w-full"
                  />
                </div>

                <!-- Tipo -->
                <div class="col-12 md:col-4">
                  <label [for]="'titulo-tipo-' + $index" class="block font-semibold mb-2">
                    Tipo
                  </label>
                  <p-select
                    [inputId]="'titulo-tipo-' + $index"
                    formControlName="tipo"
                    [options]="tiposItem"
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
                    (onClick)="removeItem($index)"
                    class="w-full"
                  ></p-button>
                </div>

                <!-- Descrição/Efeitos -->
                <div class="col-12">
                  <label [for]="'titulo-desc-' + $index" class="block font-semibold mb-2">
                    Descrição / Efeitos
                  </label>
                  <textarea
                    pTextarea
                    [id]="'titulo-desc-' + $index"
                    formControlName="descricao"
                    rows="2"
                    placeholder="Ex: Concede +5 de dano em combate corpo a corpo"
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
          Títulos e runas podem ser concedidos pelo Mestre durante aventuras
        </div>
      </ng-template>
    </p-card>
  `
})
export class TitulosRunasSectionComponent {
  form = input.required<FormGroup>();
  private fb = new FormBuilder();

  tiposItem = [
    { label: 'Título', value: 'TITULO' },
    { label: 'Runa', value: 'RUNA' }
  ];

  getItems(): FormArray {
    return this.form().get('titulosRunas') as FormArray;
  }

  addItem() {
    const itemGroup = this.fb.group({
      nome: ['', [Validators.required, Validators.maxLength(100)]],
      tipo: ['TITULO', Validators.required],
      descricao: ['', [Validators.required, Validators.maxLength(500)]]
    });
    this.getItems().push(itemGroup);
  }

  removeItem(index: number) {
    this.getItems().removeAt(index);
  }
}
