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
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

import { BaseConfigComponent } from '@shared/components/base-config/base-config.component';
import {
  BaseConfigTableComponent,
  ConfigTableColumn,
} from '@shared/components/base-config/base-config-table.component';
import { NivelConfig } from '@core/models';
import { NivelConfigService } from '@core/services/business/config';

@Component({
  selector: 'app-niveis-config',
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
    TagModule,
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
              Selecione um jogo no cabeçalho para gerenciar Níveis.
            </p>
          </div>
        </div>
      }

      <app-base-config-table
        [titulo]="'Níveis'"
        [subtitulo]="'Configure a progressão de níveis, XP e pontos por nível (0 a 35)'"
        [labelNovo]="'Novo Nível'"
        [items]="filteredItems()"
        [loading]="loading()"
        [columns]="columns"
        [canReorder]="false"
        [rowsPerPage]="15"
        (onCreate)="openDrawer()"
        (onEdit)="openDrawer($event)"
        (onDelete)="confirmDelete($event.id!)"
        (onSearch)="searchQuery.set($event)"
      />

    </p-card>

    <!-- DRAWER -->
    <p-drawer
      [visible]="drawerVisible()"
      (visibleChange)="onDrawerVisibleChange($event)"
      [header]="editMode() ? 'Editar Nível' : 'Novo Nível'"
      position="right"
      styleClass="w-full md:w-30rem"
    >
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="flex flex-column gap-4 p-2">

          <!-- Nível -->
          <div class="flex flex-column gap-2">
            <label for="nivel" class="font-semibold">
              Nível <span class="text-red-400">*</span>
            </label>
            <p-input-number
              inputId="nivel"
              formControlName="nivel"
              [showButtons]="true"
              [min]="0"
              [max]="35"
            />
            <small class="text-color-secondary">Níveis de 0 (iniciante) a 35 (transcendente).</small>
          </div>

          <!-- XP Necessária -->
          <div class="flex flex-column gap-2">
            <label for="xpNecessaria" class="font-semibold">
              XP Necessária <span class="text-red-400">*</span>
            </label>
            <p-input-number
              inputId="xpNecessaria"
              formControlName="xpNecessaria"
              [showButtons]="true"
              [min]="0"
            />
            <small class="text-color-secondary">XP acumulada para atingir este nível.</small>
          </div>

          <div class="rpg-section-title">Pontos Ganhos ao Subir de Nível</div>

          <!-- Pontos Atributo -->
          <div class="flex flex-column gap-2">
            <label for="pontosAtributo" class="font-semibold">
              Pontos de Atributo <span class="text-red-400">*</span>
            </label>
            <p-input-number
              inputId="pontosAtributo"
              formControlName="pontosAtributo"
              [showButtons]="true"
              [min]="0"
            />
          </div>

          <!-- Pontos Aptidão -->
          <div class="flex flex-column gap-2">
            <label for="pontosAptidao" class="font-semibold">
              Pontos de Aptidão <span class="text-red-400">*</span>
            </label>
            <p-input-number
              inputId="pontosAptidao"
              formControlName="pontosAptidao"
              [showButtons]="true"
              [min]="0"
            />
          </div>

          <!-- Limitador Atributo -->
          <div class="flex flex-column gap-2">
            <label for="limitadorAtributo" class="font-semibold">
              Limitador de Atributo <span class="text-red-400">*</span>
            </label>
            <p-input-number
              inputId="limitadorAtributo"
              formControlName="limitadorAtributo"
              [showButtons]="true"
              [min]="0"
            />
            <small class="text-color-secondary">
              Teto máximo que qualquer atributo pode atingir neste nível.
            </small>
          </div>

          <!-- Permite Renascimento -->
          <div class="flex align-items-center gap-2">
            <p-checkbox inputId="permitirRenascimento" formControlName="permitirRenascimento" [binary]="true" />
            <label for="permitirRenascimento" class="font-semibold cursor-pointer">
              Permite Renascimento
            </label>
          </div>
          <small class="text-color-secondary -mt-3">
            Renascimento disponível para personagens a partir deste nível.
          </small>

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
            [label]="editMode() ? 'Salvar Alterações' : 'Criar Nível'"
            icon="pi pi-check"
            type="submit"
          />
        </div>
      </form>
    </p-drawer>

    <p-confirmDialog />
  `,
})
export class NiveisConfigComponent extends BaseConfigComponent<
  NivelConfig,
  NivelConfigService
> {
  protected service = inject(NivelConfigService);
  private confirmationService = inject(ConfirmationService);

  protected drawerVisible = signal(false);
  protected loading = signal(false);
  protected searchQuery = signal('');

  readonly columns: ConfigTableColumn[] = [
    { field: 'nivel',             header: 'Nível', width: '6rem' },
    { field: 'xpNecessaria',      header: 'XP', width: '8rem' },
    { field: 'pontosAtributo',    header: 'Pts Attr.', width: '8rem' },
    { field: 'pontosAptidao',     header: 'Pts Apt.', width: '8rem' },
    { field: 'limitadorAtributo', header: 'Limitador', width: '8rem' },
  ];

  protected filteredItems = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.items().slice().sort((a, b) => a.nivel - b.nivel);
    return this.items()
      .filter((n) => String(n.nivel).includes(q))
      .sort((a, b) => a.nivel - b.nivel);
  });

  protected getEntityName(): string { return 'Nível'; }
  protected getEntityNamePlural(): string { return 'Níveis'; }

  protected buildForm(): FormGroup {
    return this.fb.group({
      nivel:                [1,    [Validators.required, Validators.min(0), Validators.max(35)]],
      xpNecessaria:         [0,    [Validators.required, Validators.min(0)]],
      pontosAtributo:       [3,    [Validators.required, Validators.min(0)]],
      pontosAptidao:        [3,    [Validators.required, Validators.min(0)]],
      limitadorAtributo:    [10,   [Validators.required, Validators.min(0)]],
      permitirRenascimento: [false],
    });
  }

  openDrawer(item?: NivelConfig): void {
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
        this.toastService.success(`Nível ${action} com sucesso`, 'Sucesso');
        this.closeDrawer();
        this.loadData();
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  override confirmDelete(id: number): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir este Nível? Esta ação não pode ser desfeita.',
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.delete(id),
    });
  }
}
