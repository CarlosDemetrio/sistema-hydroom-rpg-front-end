import { Component, input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';

/**
 * Vantagens Section Component (DUMB)
 *
 * Seção 9: Vantagens e Desvantagens
 *
 * Features:
 * - FormArray dinâmico (adicionar/remover vantagens)
 * - Nome
 * - Tipo (vantagem/desvantagem)
 * - Custo em pontos
 * - Descrição
 *
 * NOTA: Sistema de pontos de vantagem será validado pelo BACKEND
 */
@Component({
  selector: 'app-vantagens-section',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    Textarea,
    InputNumberModule,
    SelectModule
  ],
  template: `
    <p-card>
      <ng-template #header>
        <div class="flex align-items-center justify-content-between p-3">
          <div class="flex align-items-center gap-2">
            <i class="pi pi-bolt text-primary text-xl"></i>
            <h3 class="text-xl font-bold m-0">Vantagens e Desvantagens</h3>
          </div>
          <p-button
            icon="pi pi-plus"
            label="Adicionar"
            (onClick)="addVantagem()"
            size="small"
          ></p-button>
        </div>
      </ng-template>

      @if (getVantagens().length === 0) {
        <div class="text-center text-color-secondary py-6">
          <i class="pi pi-info-circle text-4xl mb-3"></i>
          <p class="text-lg">Nenhuma vantagem/desvantagem adicionada</p>
          <p class="text-sm">Clique em "Adicionar" para começar</p>
        </div>
      } @else {
        <div [formGroup]="form()" class="grid">
          <div formArrayName="vantagens" class="col-12">
            @for (vantagem of getVantagens().controls; track $index) {
              <div [formGroupName]="$index" class="grid p-3 mb-3 surface-ground border-round">
                <!-- Nome -->
                <div class="col-12 md:col-5">
                  <label [for]="'vantagem-nome-' + $index" class="block font-semibold mb-2">
                    Nome
                  </label>
                  <input
                    pInputText
                    [id]="'vantagem-nome-' + $index"
                    formControlName="nome"
                    placeholder="Ex: Reflexos Rápidos"
                    class="w-full"
                  />
                </div>

                <!-- Tipo -->
                <div class="col-12 md:col-3">
                  <label [for]="'vantagem-tipo-' + $index" class="block font-semibold mb-2">
                    Tipo
                  </label>
                  <p-select
                    [inputId]="'vantagem-tipo-' + $index"
                    formControlName="tipo"
                    [options]="tiposVantagem"
                    placeholder="Selecione"
                    class="w-full"
                  ></p-select>
                </div>

                <!-- Custo -->
                <div class="col-12 md:col-2">
                  <label [for]="'vantagem-custo-' + $index" class="block font-semibold mb-2">
                    Custo (pontos)
                  </label>
                  <p-inputnumber
                    [inputId]="'vantagem-custo-' + $index"
                    formControlName="custo"
                    [showButtons]="true"
                    class="w-full"
                  ></p-inputnumber>
                </div>

                <!-- Botão Remover -->
                <div class="col-12 md:col-2 flex align-items-end">
                  <p-button
                    icon="pi pi-trash"
                    severity="danger"
                    [text]="true"
                    (onClick)="removeVantagem($index)"
                    class="w-full"
                  ></p-button>
                </div>

                <!-- Descrição -->
                <div class="col-12">
                  <label [for]="'vantagem-desc-' + $index" class="block font-semibold mb-2">
                    Descrição / Efeitos
                  </label>
                  <textarea
                    pTextarea
                    [id]="'vantagem-desc-' + $index"
                    formControlName="descricao"
                    rows="2"
                    placeholder="Ex: +2 em testes de iniciativa"
                    class="w-full"
                  ></textarea>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <ng-template #footer>
        <div class="flex justify-content-between align-items-center text-sm">
          <div class="text-color-secondary">
            <i class="pi pi-info-circle mr-2"></i>
            Total de pontos será validado pelo sistema
          </div>
          <div class="font-semibold">
            Pontos gastos: {{ calcularPontosGastos() }}
          </div>
        </div>
      </ng-template>
    </p-card>
  `
})
export class VantagensSectionComponent {
  form = input.required<FormGroup>();
  private fb = new FormBuilder();

  tiposVantagem = [
    { label: 'Vantagem', value: 'VANTAGEM' },
    { label: 'Desvantagem', value: 'DESVANTAGEM' }
  ];

  getVantagens(): FormArray {
    return this.form().get('vantagens') as FormArray;
  }

  addVantagem() {
    const vantagemGroup = this.fb.group({
      nome: ['', [Validators.required, Validators.maxLength(100)]],
      tipo: ['VANTAGEM', Validators.required],
      custo: [1, Validators.required],
      descricao: ['', Validators.maxLength(500)]
    });
    this.getVantagens().push(vantagemGroup);
  }

  removeVantagem(index: number) {
    this.getVantagens().removeAt(index);
  }

  calcularPontosGastos(): number {
    return this.getVantagens().controls.reduce((total, control) => {
      const custo = control.get('custo')?.value || 0;
      const tipo = control.get('tipo')?.value;
      // Desvantagens são negativas (dão pontos de volta)
      return total + (tipo === 'DESVANTAGEM' ? -custo : custo);
    }, 0);
  }
}
