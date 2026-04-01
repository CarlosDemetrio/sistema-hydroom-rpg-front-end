import { Component, computed, inject, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DrawerModule } from 'primeng/drawer';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';

import { BaseConfigComponent } from '@shared/components/base-config/base-config.component';
import {
  BaseConfigTableComponent,
  ConfigTableColumn,
} from '@shared/components/base-config/base-config-table.component';
import { BonusConfig } from '@core/models';
import { BonusConfigService } from '@core/services/business/config';
import {
  uniqueNameValidator,
  uppercaseValidator,
} from '@shared/validators/config-validators';

@Component({
  selector: 'app-bonus-config',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    CheckboxModule,
    ConfirmDialogModule,
    DrawerModule,
    InputNumberModule,
    InputTextModule,
    TextareaModule,
    TooltipModule,
    BaseConfigTableComponent,
  ],
  providers: [ConfirmationService],
  template: `
    <p-card styleClass="card-rpg card-rpg--accented">

      @if (hasGame()) {
        <div class="flex align-items-center gap-2 mb-3 p-2 border-round surface-100">
          <i class="pi pi-book text-primary text-sm"></i>
          <span class="text-sm font-semibold text-primary">
            Configurando: {{ currentGameName() }}
          </span>
        </div>
      }

      @if (!hasGame()) {
        <div class="flex align-items-center gap-3 p-4 border-round surface-100 mb-4">
          <i class="pi pi-exclamation-triangle text-2xl" style="color: var(--rpg-amber-400)"></i>
          <div>
            <p class="font-semibold m-0 mb-1">Nenhum jogo selecionado</p>
            <p class="text-sm text-color-secondary m-0">
              Selecione um jogo no cabeçalho para gerenciar Bônus.
            </p>
          </div>
        </div>
      }

      <app-base-config-table
        [titulo]="'Bônus'"
        [subtitulo]="'Configure os bônus derivados do sistema (B.B.A, Bloqueio, Reflexo, etc.)'"
        [labelNovo]="'Novo Bônus'"
        [items]="filteredItems()"
        [loading]="loading()"
        [columns]="columns"
        [canReorder]="true"
        [rowsPerPage]="10"
        (onCreate)="openDrawer()"
        (onEdit)="openDrawer($event)"
        (onDelete)="confirmDelete($event.id!)"
        (onReorder)="handleReorder($event)"
        (onSearch)="searchQuery.set($event)"
      />

    </p-card>

    <!-- DRAWER -->
    <p-drawer
      [visible]="drawerVisible()"
      (visibleChange)="onDrawerVisibleChange($event)"
      [header]="editMode() ? 'Editar Bônus' : 'Novo Bônus'"
      position="right"
      styleClass="w-full md:w-30rem"
    >
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="flex flex-column gap-4 p-2">

          <!-- Nome -->
          <div class="flex flex-column gap-2">
            <label for="nome" class="font-semibold">
              Nome <span class="text-red-400">*</span>
            </label>
            <input
              pInputText
              id="nome"
              formControlName="nome"
              placeholder="Ex: Bônus Base de Ataque"
              [class.ng-invalid]="form.get('nome')?.invalid && form.get('nome')?.touched"
            />
            @if (form.get('nome')?.invalid && form.get('nome')?.touched) {
              <small class="text-red-400">
                @if (form.get('nome')?.errors?.['required']) { Campo obrigatório }
                @if (form.get('nome')?.errors?.['minlength']) { Mínimo de 3 caracteres }
                @if (form.get('nome')?.errors?.['uniqueName']) { Este nome já está em uso }
              </small>
            }
          </div>

          <!-- Sigla -->
          <div class="flex flex-column gap-2">
            <label for="sigla" class="font-semibold">
              Sigla <span class="text-red-400">*</span>
            </label>
            <input
              pInputText
              id="sigla"
              formControlName="sigla"
              placeholder="Ex: BBA"
              style="text-transform: uppercase; font-family: var(--rpg-font-mono); font-weight: 700;"
              [class.ng-invalid]="form.get('sigla')?.invalid && form.get('sigla')?.touched"
            />
            <small class="text-color-secondary">2 a 5 caracteres, maiúsculas. Única por jogo.</small>
            @if (form.get('sigla')?.invalid && form.get('sigla')?.touched) {
              <small class="text-red-400">
                @if (form.get('sigla')?.errors?.['required']) { Campo obrigatório }
                @if (form.get('sigla')?.errors?.['minlength']) { Mínimo 2 caracteres }
                @if (form.get('sigla')?.errors?.['maxlength']) { Máximo 5 caracteres }
                @if (form.get('sigla')?.errors?.['uppercase']) { Deve estar em maiúsculas }
              </small>
            }
          </div>

          <!-- Fórmula Base -->
          <div class="flex flex-column gap-2">
            <label for="formulaBase" class="font-semibold">Fórmula Base</label>
            <input
              pInputText
              id="formulaBase"
              formControlName="formulaBase"
              placeholder="Ex: (FOR + DES) / 3"
              style="font-family: var(--rpg-font-mono);"
            />
            <small class="text-color-secondary">
              Variáveis: abreviações dos atributos (FOR, AGI...), nivel, total, base.
            </small>
          </div>

          <!-- Descrição -->
          <div class="flex flex-column gap-2">
            <label for="descricao" class="font-semibold">Descrição</label>
            <textarea
              pTextarea
              id="descricao"
              formControlName="descricao"
              [rows]="3"
              placeholder="Descreva o bônus e como ele é aplicado..."
              [autoResize]="true"
            ></textarea>
          </div>

          <!-- Ordem -->
          <div class="flex flex-column gap-2">
            <label for="ordemExibicao" class="font-semibold">
              Ordem de Exibição <span class="text-red-400">*</span>
            </label>
            <p-input-number
              inputId="ordemExibicao"
              formControlName="ordemExibicao"
              [showButtons]="true"
              [min]="1"
            />
          </div>

        </div>

        <div class="flex justify-content-end gap-2 mt-5 pt-4 border-top-1 surface-border">
          <p-button
            label="Cancelar"
            severity="secondary"
            [outlined]="true"
            type="button"
            (onClick)="closeDrawer()"
          />
          <p-button
            [label]="editMode() ? 'Salvar Alterações' : 'Criar Bônus'"
            icon="pi pi-check"
            type="submit"
          />
        </div>
      </form>
    </p-drawer>

    <p-confirmDialog />
  `,
})
export class BonusConfigComponent extends BaseConfigComponent<
  BonusConfig,
  BonusConfigService
> {
  protected service = inject(BonusConfigService);
  private confirmationService = inject(ConfirmationService);

  protected drawerVisible = signal(false);
  protected loading = signal(false);
  protected searchQuery = signal('');

  readonly columns: ConfigTableColumn[] = [
    { field: 'ordemExibicao', header: 'Ordem', width: '5rem' },
    { field: 'nome',          header: 'Nome' },
    { field: 'sigla',         header: 'Sigla', width: '6rem' },
    { field: 'formulaBase',   header: 'Fórmula' },
  ];

  protected filteredItems = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.items();
    return this.items().filter(
      (b) =>
        b.nome?.toLowerCase().includes(q) ||
        (b.sigla ?? '').toLowerCase().includes(q) ||
        (b.descricao ?? '').toLowerCase().includes(q),
    );
  });

  protected getEntityName(): string { return 'Bônus'; }
  protected getEntityNamePlural(): string { return 'Bônus'; }

  protected buildForm(): FormGroup {
    return this.fb.group({
      nome:          ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      sigla:         ['', [Validators.required, Validators.minLength(2), Validators.maxLength(5), uppercaseValidator()]],
      formulaBase:   ['', [Validators.maxLength(200)]],
      descricao:     ['', [Validators.maxLength(500)]],
      ordemExibicao: [1,  [Validators.required, Validators.min(1)]],
    });
  }

  openDrawer(item?: BonusConfig): void {
    this.openDialog(item);
    this.drawerVisible.set(true);
  }

  closeDrawer(): void {
    this.drawerVisible.set(false);
    this.closeDialog();
  }

  protected onDrawerVisibleChange(visible: boolean): void {
    if (!visible) this.closeDrawer();
  }

  override openDialog(item?: BonusConfig): void {
    super.openDialog(item);
    const nomeControl = this.form.get('nome');
    if (nomeControl) {
      const currentId = item?.id ?? null;
      nomeControl.setValidators([
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        uniqueNameValidator(this.items(), currentId),
      ]);
      nomeControl.updateValueAndValidity();
    }
  }

  override save(): void {
    if (this.form.invalid) {
      super.save();
      return;
    }
    const data = this.form.value;
    const operation$ = this.editMode()
      ? this.service.updateItem(this.currentEditId()!, data)
      : this.service.createItem(data);

    this.loading.set(true);
    operation$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        const action = this.editMode() ? 'atualizado' : 'criado';
        this.toastService.success(`Bônus ${action} com sucesso`, 'Sucesso');
        this.closeDrawer();
        this.loadData();
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  override confirmDelete(id: number): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir este Bônus? Esta ação não pode ser desfeita.',
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.delete(id),
    });
  }

  protected handleReorder(payload: { itemId: number; novaOrdem: number }[]): void {
    this.toastService.success(`Ordem atualizada (${payload.length} itens).`, 'Reordenação');
  }
}
