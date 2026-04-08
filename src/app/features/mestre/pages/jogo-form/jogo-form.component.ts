import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { JogoManagementFacadeService } from '@features/mestre/services/jogo-management-facade.service';
import { Textarea } from 'primeng/textarea';
import {InputNumberModule} from 'primeng/inputnumber';
import {FormFieldErrorComponent, LoadingSpinnerComponent, PageHeaderComponent} from '@shared/components';
import { ToastService } from '@services/toast.service';

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
    FormFieldErrorComponent,
    LoadingSpinnerComponent,
    PageHeaderComponent,
    ToastModule,
  ],
  template: `
    <p-toast />
    <div class="p-4">
      <app-page-header
        [title]="isEditMode() ? 'Editar Jogo' : 'Criar Novo Jogo'"
        backRoute="/mestre/jogos"
      />

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
  private toastService = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  isEditMode = signal(false);
  jogoId = signal<number | null>(null);
  isSaving = signal(false);
  loading = this.jogoFacade.loading;

  jogoForm: FormGroup = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    descricao: ['', [Validators.maxLength(500)]]
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
          descricao: jogo.descricao || ''
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
        descricao: formValue.descricao
      }).pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
        next: () => {
          this.toastService.success('Jogo atualizado com sucesso!');
          setTimeout(() => this.router.navigate(['/mestre/jogos']), 1500);
        },
        error: () => {
          this.toastService.error('Erro ao atualizar jogo');
          this.isSaving.set(false);
        }
      });
    } else {
      // Create new jogo
      this.jogoFacade.createJogo({
        nome: formValue.nome,
        descricao: formValue.descricao
      }).pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
        next: () => {
          this.toastService.success('Jogo criado com sucesso!');
          setTimeout(() => this.router.navigate(['/mestre/jogos']), 1500);
        },
        error: () => {
          this.toastService.error('Erro ao criar jogo');
          this.isSaving.set(false);
        }
      });
    }
  }

  cancel() {
    this.router.navigate(['/mestre/jogos']);
  }
}
