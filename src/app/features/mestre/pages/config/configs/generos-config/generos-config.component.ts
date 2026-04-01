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

import { BaseConfigComponent } from '../../../../../../shared/components/base-config/base-config.component';
import {
  BaseConfigTableComponent,
  ConfigTableColumn,
} from '../../../../../../shared/components/base-config/base-config-table.component';
import { GeneroConfig } from '../../../../../../core/models';
import { GeneroConfigService } from '../../../../../../core/services/business/config';
import { uniqueNameValidator } from '../../../../../../shared/validators/config-validators';

@Component({
  selector: 'app-generos-config',
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
          <span class="text-sm font-semibold text-primary">Configurando: {{ currentGameName() }}</span>
        </div>
      }

      @if (!hasGame()) {
        <div class="flex align-items-center gap-3 p-4 border-round surface-100 mb-4">
          <i class="pi pi-exclamation-triangle text-2xl" style="color: var(--rpg-amber-400)"></i>
          <div>
            <p class="font-semibold m-0 mb-1">Nenhum jogo selecionado</p>
            <p class="text-sm text-color-secondary m-0">Selecione um jogo para gerenciar Gêneros.</p>
          </div>
        </div>
      }

      <app-base-config-table
        [titulo]="'Gêneros'"
        [subtitulo]="'Configure os gêneros de personagem disponíveis no sistema'"
        [labelNovo]="'Novo Gênero'"
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

    <p-drawer
      [visible]="drawerVisible()"
      (visibleChange)="onDrawerVisibleChange($event)"
      [header]="editMode() ? 'Editar Gênero' : 'Novo Gênero'"
      position="right"
      styleClass="w-full md:w-30rem"
    >
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="flex flex-column gap-4 p-2">

          <div class="flex flex-column gap-2">
            <label for="nome" class="font-semibold">Nome <span class="text-red-400">*</span></label>
            <input
              pInputText id="nome" formControlName="nome" placeholder="Ex: Masculino"
              [class.ng-invalid]="form.get('nome')?.invalid && form.get('nome')?.touched"
            />
            @if (form.get('nome')?.invalid && form.get('nome')?.touched) {
              <small class="text-red-400">
                @if (form.get('nome')?.errors?.['required']) { Campo obrigatório }
                @if (form.get('nome')?.errors?.['uniqueName']) { Este nome já está em uso }
              </small>
            }
          </div>

          <div class="flex flex-column gap-2">
            <label for="descricao" class="font-semibold">Descrição</label>
            <textarea pTextarea id="descricao" formControlName="descricao" [rows]="3" [autoResize]="true"
              placeholder="Descrição opcional..."></textarea>
          </div>

          <div class="flex flex-column gap-2">
            <label for="ordemExibicao" class="font-semibold">Ordem de Exibição <span class="text-red-400">*</span></label>
            <p-input-number inputId="ordemExibicao" formControlName="ordemExibicao" [showButtons]="true" [min]="1" />
          </div>

          <div class="flex align-items-center gap-2">
            <p-checkbox inputId="ativo" formControlName="ativo" [binary]="true" />
            <label for="ativo" class="font-semibold cursor-pointer">Ativo</label>
          </div>

        </div>

        <div class="flex justify-content-end gap-2 mt-5 pt-4 border-top-1 surface-border">
          <p-button label="Cancelar" severity="secondary" [outlined]="true" type="button" (onClick)="closeDrawer()" />
          <p-button [label]="editMode() ? 'Salvar Alterações' : 'Criar Gênero'" icon="pi pi-check" type="submit" />
        </div>
      </form>
    </p-drawer>

    <p-confirmDialog />
  `,
})
export class GenerosConfigComponent extends BaseConfigComponent<GeneroConfig, GeneroConfigService> {
  protected service = inject(GeneroConfigService);
  private confirmationService = inject(ConfirmationService);

  protected drawerVisible = signal(false);
  protected loading = signal(false);
  protected searchQuery = signal('');

  readonly columns: ConfigTableColumn[] = [
    { field: 'ordemExibicao', header: 'Ordem', width: '5rem' },
    { field: 'nome',          header: 'Nome' },
    { field: 'descricao',     header: 'Descrição' },
  ];

  protected filteredItems = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.items();
    return this.items().filter((g) => g.nome?.toLowerCase().includes(q) || (g.descricao ?? '').toLowerCase().includes(q));
  });

  protected getEntityName(): string { return 'Gênero'; }
  protected getEntityNamePlural(): string { return 'Gêneros'; }

  protected buildForm(): FormGroup {
    return this.fb.group({
      nome:          ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      descricao:     ['', [Validators.maxLength(500)]],
      ordemExibicao: [1,  [Validators.required, Validators.min(1)]],
      ativo:         [true],
    });
  }

  openDrawer(item?: GeneroConfig): void {
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

  override openDialog(item?: GeneroConfig): void {
    super.openDialog(item);
    const ctrl = this.form.get('nome');
    if (ctrl) {
      ctrl.setValidators([Validators.required, Validators.minLength(2), Validators.maxLength(50), uniqueNameValidator(this.items(), item?.id ?? null)]);
      ctrl.updateValueAndValidity();
    }
  }

  override save(): void {
    if (this.form.invalid) { super.save(); return; }
    const data = this.form.value;
    const op$ = this.editMode() ? this.service.updateItem(this.currentEditId()!, data) : this.service.createItem(data);
    this.loading.set(true);
    op$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.toastService.success(`Gênero ${this.editMode() ? 'atualizado' : 'criado'} com sucesso`, 'Sucesso');
        this.closeDrawer();
        this.loadData();
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  override confirmDelete(id: number): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir este Gênero?',
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
