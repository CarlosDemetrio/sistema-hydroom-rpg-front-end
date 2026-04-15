import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmationService } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { FormsModule } from '@angular/forms';

import { BaseConfigComponent } from '@shared/components/base-config/base-config.component';
import {
  TipoItemConfig,
  CategoriaItem,
  SubcategoriaItem,
  CATEGORIA_LABELS,
  SUBCATEGORIA_LABELS,
  SUBCATEGORIA_POR_CATEGORIA,
  CATEGORIA_SEVERITY,
} from '@core/models/tipo-item-config.model';
import { TipoItemConfigService } from '@core/services/business/config/tipo-item-config.service';

interface SelectOption<T> {
  label: string;
  value: T;
}

/**
 * TiposItemConfigComponent — CRUD de Tipos de Item.
 *
 * Migrado para estender BaseConfigComponent.
 * Mantém tabela customizada (rowGroupMode subheader por categoria) pois
 * BaseConfigTableComponent não suporta agrupamento de linhas.
 *
 * Endpoint: /api/v1/configuracoes/tipos-item
 */
@Component({
  selector: 'app-tipos-item-config',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    BadgeModule,
    ButtonModule,
    CardModule,
    CheckboxModule,
    ConfirmDialogModule,
    DialogModule,
    IconFieldModule,
    InputIconModule,
    InputNumberModule,
    InputTextModule,
    SelectModule,
    TableModule,
    TagModule,
    TextareaModule,
    TooltipModule,
  ],
  providers: [ConfirmationService],
  template: `
    <p-card class="card-rpg card-rpg--accented">

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
              Selecione um jogo no cabeçalho para gerenciar Tipos de Item.
            </p>
          </div>
        </div>
      }

      <!-- Header: título + busca + botão Novo -->
      <div
        class="flex flex-column md:flex-row align-items-start md:align-items-center
               justify-content-between gap-3 mb-4"
      >
        <div class="flex flex-column gap-1">
          <h2 class="text-2xl font-bold m-0">
            <i class="pi pi-cog text-primary mr-2"></i>
            Tipos de Item
          </h2>
          <p class="text-color-secondary text-sm m-0">
            Configure os tipos de itens disponíveis (Espada, Arco, Poção, etc.)
          </p>
        </div>

        <div class="flex align-items-center gap-2 flex-wrap">
          <!-- Campo de busca -->
          <p-icon-field iconPosition="left">
            <p-inputicon class="pi pi-search" />
            <input
              pInputText
              type="text"
              placeholder="Buscar tipos de item..."
              [(ngModel)]="searchTermLocal"
              (ngModelChange)="searchQuery.set($event)"
              class="w-14rem"
            />
          </p-icon-field>

          <!-- Botão Novo -->
          <p-button
            label="+ Novo Tipo"
            icon="pi pi-plus"
            (onClick)="openDialog()"
          />
        </div>
      </div>

      <!-- Tabela com agrupamento por categoria -->
      <p-table
        [value]="filteredItems()"
        [loading]="loading()"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[10, 25, 50]"
        styleClass="p-datatable-sm"
        [tableStyle]="{ 'min-width': '50rem' }"
        [rowGroupMode]="'subheader'"
        groupRowsBy="categoria"
        sortField="categoria"
        [sortOrder]="1"
      >
        <ng-template #header>
          <tr>
            <th>Nome</th>
            <th>Categoria</th>
            <th>Subcategoria</th>
            <th style="width: 6rem">2 Mãos</th>
            <th style="width: 6rem">Ordem</th>
            <th style="width: 8rem" class="text-center">Ações</th>
          </tr>
        </ng-template>

        <ng-template #groupheader let-tipo>
          <tr pRowGroupHeader>
            <td colspan="6">
              <div class="flex align-items-center gap-2 py-1">
                <p-tag
                  [value]="getCategoriaLabel(tipo.categoria)"
                  [severity]="getCategoriaSeverity(tipo.categoria)"
                />
                <span class="font-semibold text-color-secondary text-sm">
                  {{ contarPorCategoria(tipo.categoria) }} tipo(s)
                </span>
              </div>
            </td>
          </tr>
        </ng-template>

        <ng-template #body let-tipo>
          <tr>
            <td class="font-semibold">{{ tipo.nome }}</td>
            <td>
              <p-tag
                [value]="getCategoriaLabel(tipo.categoria)"
                [severity]="getCategoriaSeverity(tipo.categoria)"
              />
            </td>
            <td class="text-sm text-color-secondary">
              {{ tipo.subcategoria ? getSubcategoriaLabel(tipo.subcategoria) : '—' }}
            </td>
            <td class="text-center">
              @if (tipo.requerDuasMaos) {
                <i class="pi pi-check-circle text-green-400" pTooltip="Requer duas mãos"></i>
              } @else {
                <span class="text-color-secondary">—</span>
              }
            </td>
            <td class="text-center">{{ tipo.ordemExibicao }}</td>
            <td class="text-center">
              <div class="flex gap-1 justify-content-center">
                <p-button
                  icon="pi pi-pencil"
                  [rounded]="true"
                  [text]="true"
                  severity="secondary"
                  (onClick)="openDialog(tipo)"
                  pTooltip="Editar"
                  tooltipPosition="top"
                />
                <p-button
                  icon="pi pi-trash"
                  [rounded]="true"
                  [text]="true"
                  severity="danger"
                  (onClick)="confirmDelete(tipo.id!)"
                  pTooltip="Excluir"
                  tooltipPosition="top"
                />
              </div>
            </td>
          </tr>
        </ng-template>

        <ng-template #emptymessage>
          <tr>
            <td colspan="6" class="p-0">
              <div class="rpg-empty-state">
                <i class="pi pi-inbox rpg-empty-state__icon"></i>
                <p class="rpg-empty-state__title">Nenhum tipo de item configurado</p>
                <p class="rpg-empty-state__subtitle">
                  Clique em "+ Novo Tipo" para criar o primeiro registro.
                </p>
                <p-button
                  label="+ Novo Tipo"
                  icon="pi pi-plus"
                  size="small"
                  (onClick)="openDialog()"
                />
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>

    </p-card>

    <!-- Dialog de criação/edição -->
    <p-dialog
      [visible]="dialogVisible()"
      (visibleChange)="onDialogVisibleChange($event)"
      [header]="editMode() ? 'Editar Tipo de Item' : 'Novo Tipo de Item'"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      [style]="{ width: '38rem', maxWidth: '95vw' }"
    >
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="flex flex-column gap-4 p-2">

          <!-- Nome -->
          <div class="flex flex-column gap-2">
            <label for="tipo-nome" class="font-semibold">
              Nome <span class="text-red-400">*</span>
            </label>
            <input
              pInputText
              id="tipo-nome"
              formControlName="nome"
              placeholder="Ex: Espada Longa, Poção de Cura..."
              [class.ng-invalid]="form.get('nome')?.invalid && form.get('nome')?.touched"
            />
            @if (form.get('nome')?.invalid && form.get('nome')?.touched) {
              <small class="text-red-400">
                @if (form.get('nome')?.errors?.['required']) { Campo obrigatório }
                @if (form.get('nome')?.errors?.['minlength']) { Mínimo de 2 caracteres }
              </small>
            }
          </div>

          <!-- Categoria -->
          <div class="flex flex-column gap-2">
            <label for="tipo-categoria" class="font-semibold">
              Categoria <span class="text-red-400">*</span>
            </label>
            <p-select
              inputId="tipo-categoria"
              formControlName="categoria"
              [options]="categoriaOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Selecione uma categoria..."
              (onChange)="onCategoriaChange()"
            />
            @if (form.get('categoria')?.invalid && form.get('categoria')?.touched) {
              <small class="text-red-400">Campo obrigatório</small>
            }
          </div>

          <!-- Subcategoria (filtrada por categoria) -->
          @if (subcategoriaOptions().length > 0) {
            <div class="flex flex-column gap-2">
              <label for="tipo-subcategoria" class="font-semibold">Subcategoria</label>
              <p-select
                inputId="tipo-subcategoria"
                formControlName="subcategoria"
                [options]="subcategoriaOptions()"
                optionLabel="label"
                optionValue="value"
                placeholder="Selecione uma subcategoria..."
              />
            </div>
          }

          <!-- Requer Duas Mãos -->
          <div class="flex align-items-center gap-2">
            <p-checkbox inputId="tipo-requerDuasMaos" formControlName="requerDuasMaos" [binary]="true" />
            <label for="tipo-requerDuasMaos" class="font-semibold cursor-pointer">
              Requer Duas Mãos
            </label>
          </div>

          <!-- Ordem -->
          <div class="flex flex-column gap-2">
            <label for="tipo-ordem" class="font-semibold">
              Ordem de Exibição <span class="text-red-400">*</span>
            </label>
            <p-input-number
              inputId="tipo-ordem"
              formControlName="ordemExibicao"
              [showButtons]="true"
              [min]="1"
            />
          </div>

          <!-- Descrição -->
          <div class="flex flex-column gap-2">
            <label for="tipo-descricao" class="font-semibold">Descrição</label>
            <textarea
              pTextarea
              id="tipo-descricao"
              formControlName="descricao"
              [rows]="2"
              placeholder="Descrição opcional do tipo de item..."
              [autoResize]="true"
            ></textarea>
          </div>

        </div>

        <div class="flex justify-content-end gap-2 mt-5 pt-4 border-top-1 surface-border">
          <p-button
            label="Cancelar"
            severity="secondary"
            [outlined]="true"
            type="button"
            (onClick)="closeDialog()"
          />
          <p-button
            [label]="editMode() ? 'Salvar Alterações' : 'Criar Tipo'"
            icon="pi pi-check"
            type="submit"
          />
        </div>
      </form>
    </p-dialog>

    <p-confirmDialog />
  `,
})
export class TiposItemConfigComponent extends BaseConfigComponent<
  TipoItemConfig,
  TipoItemConfigService
> {
  protected override service = inject(TipoItemConfigService);
  private readonly confirmationService = inject(ConfirmationService);

  // ---- Estado específico desta tela ----
  protected readonly loading = signal(false);
  protected readonly searchQuery = signal('');
  protected searchTermLocal = '';

  // ---- Opções de categoria/subcategoria ----
  protected readonly categoriaOptions: SelectOption<CategoriaItem>[] = (
    Object.keys(CATEGORIA_LABELS) as CategoriaItem[]
  ).map((key) => ({ label: CATEGORIA_LABELS[key], value: key }));

  protected readonly subcategoriaOptions = computed((): SelectOption<SubcategoriaItem>[] => {
    const categoria = this.form?.get('categoria')?.value as CategoriaItem | null;
    if (!categoria) return [];
    return (SUBCATEGORIA_POR_CATEGORIA[categoria] ?? []).map((sub) => ({
      label: SUBCATEGORIA_LABELS[sub],
      value: sub,
    }));
  });

  // ---- Itens filtrados por busca ----
  protected filteredItems = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.items();
    return this.items().filter(
      (t) =>
        t.nome?.toLowerCase().includes(q) ||
        getCategoriaLabel(t.categoria).toLowerCase().includes(q),
    );
  });

  // ---- Métodos obrigatórios da base ----

  protected getEntityName(): string {
    return 'Tipo de Item';
  }

  protected getEntityNamePlural(): string {
    return 'Tipos de Item';
  }

  protected buildForm(): FormGroup {
    return this.fb.group({
      nome:          ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      categoria:     [null, [Validators.required]],
      subcategoria:  [null],
      requerDuasMaos: [false],
      ordemExibicao: [1, [Validators.required, Validators.min(1)]],
      descricao:     ['', [Validators.maxLength(500)]],
    });
  }

  // ---- Dialog ----

  override openDialog(item?: TipoItemConfig): void {
    if (item) {
      // Reconstrói o form antes do patchValue para garantir estado limpo
      this.form = this.buildForm();
      this.editMode.set(true);
      this.currentEditId.set(item.id);
      this.form.patchValue({
        nome:          item.nome,
        categoria:     item.categoria,
        subcategoria:  item.subcategoria ?? null,
        requerDuasMaos: item.requerDuasMaos,
        ordemExibicao: item.ordemExibicao,
        descricao:     item.descricao,
      });
    } else {
      this.form = this.buildForm();
      this.editMode.set(false);
      this.currentEditId.set(null);
      this.form.reset({ requerDuasMaos: false, ordemExibicao: this.items().length + 1 });
    }
    this.dialogVisible.set(true);
  }

  protected onDialogVisibleChange(visible: boolean): void {
    if (!visible) this.closeDialog();
  }

  protected onCategoriaChange(): void {
    this.form.get('subcategoria')?.setValue(null);
  }

  // ---- Sobrescreve save para gerenciar loading local ----

  override save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastService.warning('Preencha todos os campos obrigatórios', 'Atenção');
      return;
    }

    const jogoId = this.currentGameId()!;
    const data = this.form.value;

    const operation$ = this.editMode()
      ? this.service.updateItem(this.currentEditId()!, data)
      : this.service.createItem({ ...data, jogoId });

    this.loading.set(true);
    operation$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        const action = this.editMode() ? 'atualizado' : 'criado';
        this.toastService.success(`Tipo de item ${action} com sucesso`, 'Sucesso');
        this.closeDialog();
        this.loadData();
      },
      error: () => this.loading.set(false),
    });
  }

  // ---- Sobrescreve confirmDelete para usar ConfirmationService ----

  override confirmDelete(id: number): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir este Tipo de Item? Esta ação não pode ser desfeita.',
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, excluir',
      rejectLabel: 'Cancelar',
      acceptButtonProps: { severity: 'danger' },
      accept: () => this.delete(id),
    });
  }

  // ---- Sobrescreve loadData para gerenciar loading local ----

  override loadData(): void {
    const jogoId = this.currentGameId();
    if (!jogoId) return;
    this.loading.set(true);
    this.service.loadItems()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.items.set(data);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  // ---- Helpers de label ----

  protected getCategoriaLabel(categoria: CategoriaItem): string {
    return CATEGORIA_LABELS[categoria] ?? categoria;
  }

  protected getCategoriaSeverity(categoria: CategoriaItem): string {
    return CATEGORIA_SEVERITY[categoria] ?? 'secondary';
  }

  protected getSubcategoriaLabel(sub: SubcategoriaItem): string {
    return SUBCATEGORIA_LABELS[sub] ?? sub;
  }

  protected contarPorCategoria(categoria: CategoriaItem): number {
    return this.items().filter((t) => t.categoria === categoria).length;
  }
}

// Helper puro usado no filtro (fora da classe para evitar referência ao this)
function getCategoriaLabel(categoria: CategoriaItem): string {
  return CATEGORIA_LABELS[categoria] ?? categoria;
}
