import { Component, computed, inject, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';

import { BaseConfigComponent } from '@shared/components/base-config/base-config.component';
import {
  BaseConfigTableComponent,
  ConfigTableColumn,
} from '@shared/components/base-config/base-config-table.component';
import { PresencaConfig } from '@core/models';
import { PresencaConfigService } from '@core/services/business/config';
import { ConfigApiService } from '@core/services/api/config-api.service';
import { uniqueNameValidator } from '@shared/validators/config-validators';

@Component({
  selector: 'app-presencas-config',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    CheckboxModule,
    ConfirmDialogModule,
    DialogModule,
    InputNumberModule,
    InputTextModule,
    TextareaModule,
    TooltipModule,
    BaseConfigTableComponent,
  ],
  providers: [ConfirmationService],
  template: `
    <p-card class="card-rpg card-rpg--accented">

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
            <p class="text-sm text-color-secondary m-0">Selecione um jogo para gerenciar Presenças.</p>
          </div>
        </div>
      }

      <app-base-config-table
        [titulo]="'Presenças'"
        [subtitulo]="'Configure os alinhamentos éticos (Leal, Caótico, Neutro, etc.)'"
        [labelNovo]="'Nova Presença'"
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

    <p-dialog
      [visible]="drawerVisible()"
      (visibleChange)="onDrawerVisibleChange($event)"
      [header]="editMode() ? 'Editar Presença' : 'Nova Presença'"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
    >
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="flex flex-column gap-4 p-2">

          <div class="flex flex-column gap-2">
            <label for="nome" class="font-semibold">Nome <span class="text-red-400">*</span></label>
            <input
              pInputText id="nome" formControlName="nome" placeholder="Ex: Leal"
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
              placeholder="Descreva como este alinhamento se comporta na narrativa..."></textarea>
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
          <p-button [label]="editMode() ? 'Salvar Alterações' : 'Criar Presença'" icon="pi pi-check" type="submit" />
        </div>
      </form>
    </p-dialog>

    <p-confirmDialog />
  `,
})
export class PresencasConfigComponent extends BaseConfigComponent<PresencaConfig, PresencaConfigService> {
  protected service = inject(PresencaConfigService);
  private confirmationService = inject(ConfirmationService);
  private configApi = inject(ConfigApiService);

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
    return this.items().filter((p) => p.nome?.toLowerCase().includes(q) || (p.descricao ?? '').toLowerCase().includes(q));
  });

  protected getEntityName(): string { return 'Presença'; }
  protected getEntityNamePlural(): string { return 'Presenças'; }

  protected buildForm(): FormGroup {
    return this.fb.group({
      nome:          ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      descricao:     ['', [Validators.maxLength(500)]],
      ordemExibicao: [1,  [Validators.required, Validators.min(1)]],
      ativo:         [true],
    });
  }

  openDrawer(item?: PresencaConfig): void {
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

  override openDialog(item?: PresencaConfig): void {
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
        this.toastService.success(`Presença ${this.editMode() ? 'atualizada' : 'criada'} com sucesso`, 'Sucesso');
        this.closeDrawer();
        this.loadData();
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  override confirmDelete(id: number): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir esta Presença?',
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.delete(id),
    });
  }

  protected handleReorder(payload: { itemId: number; novaOrdem: number }[]): void {
    const jogoId = this.currentGameId();
    if (!jogoId || payload.length === 0) return;
    this.configApi.reordenarPresencas(jogoId, { itens: payload.map((p) => ({ id: p.itemId, ordemExibicao: p.novaOrdem })) })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.toastService.success('Ordem salva com sucesso.', 'Reordenação'),
        error: () => this.toastService.error('Erro ao salvar a ordem.', 'Reordenação'),
      });
  }
}
