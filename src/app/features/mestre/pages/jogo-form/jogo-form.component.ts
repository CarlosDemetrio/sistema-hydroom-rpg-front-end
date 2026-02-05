import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { JogoManagementFacadeService } from '../../services/jogo-management-facade.service';
import { JogoStatus } from '../../../../core/models';
import { FormFieldErrorComponent } from '../../../../shared';
import { LoadingSpinnerComponent } from '../../../../shared';
import { Textarea } from 'primeng/textarea';

/**
 * Jogo Form Component (Create/Edit)
 *
 * Formulário para criar ou editar jogos
 * SMART COMPONENT - usa JogoManagementFacadeService e reactive forms
 */
@Component({
  selector: 'app-jogo-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    Textarea,
    InputNumberModule,
    SelectModule,
    FormFieldErrorComponent,
    LoadingSpinnerComponent
  ],
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

      @if (loading() && isEditMode()) {
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
                  [errors]="jogoForm.get('nome')?.errors || null"
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
                  [errors]="jogoForm.get('descricao')?.errors || null"
                  [touched]="jogoForm.get('descricao')?.touched || false"
                ></app-form-field-error>
              </div>

              <!-- Status -->
              <div class="col-12">
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
                  [errors]="jogoForm.get('status')?.errors || null"
                  [touched]="jogoForm.get('status')?.touched || false"
                ></app-form-field-error>
              </div>

              <!-- Buttons -->
              <div class="col-12">
                <div class="flex gap-3 justify-content-end">
                  <p-button
                    label="Cancelar"
                    icon="pi pi-times"
                    [outlined]="true"
                    [severity]="'secondary'"
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
  `
})
export class JogoFormComponent implements OnInit {
  private jogoFacade = inject(JogoManagementFacadeService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private destroyRef = inject(DestroyRef);

  isEditMode = signal(false);
  jogoId = signal<number | null>(null);
  isSaving = signal(false);
  loading = this.jogoFacade.loading;

  statusOptions = [
    { label: 'Ativo', value: 'ATIVO' as JogoStatus },
    { label: 'Pausado', value: 'PAUSADO' as JogoStatus },
    { label: 'Finalizado', value: 'FINALIZADO' as JogoStatus }
  ];

  jogoForm: FormGroup = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    descricao: ['', [Validators.maxLength(500)]],
    status: ['ATIVO', [Validators.required]]
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
    this.jogoFacade.getJogo(id).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (jogo) => {
        this.jogoForm.patchValue({
          nome: jogo.nome,
          descricao: jogo.descricao || '',
          status: jogo.status
        });
      }
    });
  }

  onSubmit() {
    if (this.jogoForm.invalid) {
      Object.keys(this.jogoForm.controls).forEach(key => {
        this.jogoForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSaving.set(true);

    const formValue = this.jogoForm.value;

    if (this.isEditMode() && this.jogoId()) {
      // Update existing jogo
      this.jogoFacade.updateJogo(this.jogoId()!, {
        nome: formValue.nome,
        descricao: formValue.descricao,
        status: formValue.status
      }).pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Jogo atualizado com sucesso!'
          });
          setTimeout(() => this.router.navigate(['/mestre/jogos']), 1500);
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao atualizar jogo'
          });
          this.isSaving.set(false);
        }
      });
    } else {
      // Create new jogo
      this.jogoFacade.createJogo({
        nome: formValue.nome,
        descricao: formValue.descricao,
        status: formValue.status
      }).pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Jogo criado com sucesso!'
          });
          setTimeout(() => this.router.navigate(['/mestre/jogos']), 1500);
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao criar jogo'
          });
          this.isSaving.set(false);
        }
      });
    }
  }

  cancel() {
    this.router.navigate(['/mestre/jogos']);
  }
}
