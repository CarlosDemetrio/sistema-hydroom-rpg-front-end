import { Component, inject, signal, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { JogosStore } from '../../../../core/stores/jogos.store';
import { JogoStatus } from '../../../../core/models/jogo.model';
import { FormFieldErrorComponent } from '../../../../shared/components/form-field-error.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner.component';

/**
 * Jogo Form Component (Create/Edit)
 *
 * Formulário para criar ou editar jogos
 * SMART COMPONENT - usa JogosStore e reactive forms
 */
@Component({
  selector: 'app-jogo-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
    InputNumberModule,
    SelectModule,
    ToastModule,
    FormFieldErrorComponent,
    LoadingSpinnerComponent
  ],
  providers: [MessageService],
  template: `
    <div class="p-4">
      <div class="mb-4">
        <h1 class="text-3xl font-bold m-0 mb-2">
          {{ isEditMode() ? 'Editar Jogo' : 'Criar Novo Jogo' }}
        </h1>
        <p class="text-color-secondary m-0">
          {{ isEditMode() ? 'Atualize as informações do jogo' : 'Preencha os dados para criar um novo jogo' }}
        </p>
      </div>

      @if (jogosStore.loading() && isEditMode()) {
        <app-loading-spinner message="Carregando jogo..."></app-loading-spinner>
      } @else {
        <p-card>
          <form [formGroup]="jogoForm" (ngSubmit)="onSubmit()">
            <div class="grid">
              <!-- Nome -->
              <div class="col-12">
                <label for="nome" class="block font-semibold mb-2">
                  Nome do Jogo <span class="text-red-500">*</span>
                </label>
                <input
                  id="nome"
                  pInputText
                  formControlName="nome"
                  placeholder="Ex: Campanha dos Heróis do Reino"
                  class="w-full"
                />
                <app-form-field-error
                  [errors]="jogoForm.get('nome')?.errors"
                  [touched]="jogoForm.get('nome')?.touched || false"
                ></app-form-field-error>
              </div>

              <!-- Descrição -->
              <div class="col-12">
                <label for="descricao" class="block font-semibold mb-2">
                  Descrição
                </label>
                <textarea
                  id="descricao"
                  pInputTextarea
                  formControlName="descricao"
                  placeholder="Descreva o enredo e objetivo do jogo..."
                  rows="5"
                  class="w-full"
                ></textarea>
                <app-form-field-error
                  [errors]="jogoForm.get('descricao')?.errors"
                  [touched]="jogoForm.get('descricao')?.touched || false"
                ></app-form-field-error>
              </div>

              <!-- Status -->
              <div class="col-12 md:col-6">
                <label for="status" class="block font-semibold mb-2">
                  Status <span class="text-red-500">*</span>
                </label>
                <p-select
                  id="status"
                  formControlName="status"
                  [options]="statusOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Selecione o status"
                  class="w-full"
                ></p-select>
                <app-form-field-error
                  [errors]="jogoForm.get('status')?.errors"
                  [touched]="jogoForm.get('status')?.touched || false"
                ></app-form-field-error>
              </div>

              <!-- Max Participantes -->
              <div class="col-12 md:col-6">
                <label for="maxParticipantes" class="block font-semibold mb-2">
                  Máximo de Participantes <span class="text-red-500">*</span>
                </label>
                <p-inputnumber
                  id="maxParticipantes"
                  formControlName="maxParticipantes"
                  [min]="1"
                  [max]="20"
                  [showButtons]="true"
                  placeholder="Ex: 6"
                  class="w-full"
                ></p-inputnumber>
                <app-form-field-error
                  [errors]="jogoForm.get('maxParticipantes')?.errors"
                  [touched]="jogoForm.get('maxParticipantes')?.touched || false"
                ></app-form-field-error>
              </div>

              <!-- Buttons -->
              <div class="col-12">
                <div class="flex gap-3 justify-content-end">
                  <p-button
                    label="Cancelar"
                    icon="pi pi-times"
                    [outlined]="true"
                    severity="secondary"
                    (onClick)="cancel()"
                  ></p-button>
                  <p-button
                    [label]="isEditMode() ? 'Salvar Alterações' : 'Criar Jogo'"
                    icon="pi pi-check"
                    type="submit"
                    [loading]="isSaving()"
                    [disabled]="jogoForm.invalid || isSaving()"
                  ></p-button>
                </div>
              </div>
            </div>
          </form>
        </p-card>
      }
    </div>

    <p-toast></p-toast>
  `
})
export class JogoFormComponent implements OnInit {
  jogosStore = inject(JogosStore);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);

  isEditMode = signal(false);
  jogoId = signal<number | null>(null);
  isSaving = signal(false);

  statusOptions = [
    { label: 'Ativo', value: 'ATIVO' as JogoStatus },
    { label: 'Pausado', value: 'PAUSADO' as JogoStatus },
    { label: 'Finalizado', value: 'FINALIZADO' as JogoStatus }
  ];

  jogoForm: FormGroup = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    descricao: ['', [Validators.maxLength(500)]],
    status: ['ATIVO', [Validators.required]],
    maxParticipantes: [6, [Validators.required, Validators.min(1), Validators.max(20)]]
  });

  ngOnInit() {
    // Check if edit mode
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.jogoId.set(Number(id));
      this.loadJogo(Number(id));
    }
  }

  loadJogo(id: number) {
    effect(() => {
      const jogo = this.jogosStore.jogos().find(j => j.id === id);
      if (jogo) {
        this.jogoForm.patchValue({
          nome: jogo.nome,
          descricao: jogo.descricao || '',
          status: jogo.status,
          maxParticipantes: jogo.maxParticipantes || 6
        });
      }
    });

    this.jogosStore.loadJogos();
  }

  async onSubmit() {
    if (this.jogoForm.invalid) {
      Object.keys(this.jogoForm.controls).forEach(key => {
        this.jogoForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSaving.set(true);

    try {
      const formValue = this.jogoForm.value;

      if (this.isEditMode() && this.jogoId()) {
        // Update existing jogo
        await this.jogosStore.updateJogo(this.jogoId()!, {
          id: this.jogoId()!,
          nome: formValue.nome,
          descricao: formValue.descricao,
          status: formValue.status,
          maxParticipantes: formValue.maxParticipantes,
          mestreId: 0, // Will be set by backend
          dataCriacao: new Date(),
          dataAtualizacao: new Date()
        });

        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Jogo atualizado com sucesso!'
        });
      } else {
        // Create new jogo
        await this.jogosStore.createJogo({
          nome: formValue.nome,
          descricao: formValue.descricao,
          status: formValue.status,
          maxParticipantes: formValue.maxParticipantes
        });

        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Jogo criado com sucesso!'
        });
      }

      // Navigate back to list after short delay
      setTimeout(() => {
        this.router.navigate(['/mestre/jogos']);
      }, 1500);

    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: this.isEditMode() ? 'Erro ao atualizar jogo' : 'Erro ao criar jogo'
      });
    } finally {
      this.isSaving.set(false);
    }
  }

  cancel() {
    this.router.navigate(['/mestre/jogos']);
  }
}
