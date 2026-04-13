import { Component, computed, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmationService } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';

import { ConfigApiService } from '@core/services/api/config-api.service';
import { CurrentGameService } from '@core/services/current-game.service';
import { ToastService } from '@services/toast.service';
import {
  TipoItemConfig,
  CategoriaItem,
  SubcategoriaItem,
  CATEGORIA_LABELS,
  SUBCATEGORIA_LABELS,
  SUBCATEGORIA_POR_CATEGORIA,
  CATEGORIA_SEVERITY,
} from '@core/models/tipo-item-config.model';

interface SelectOption<T> {
  label: string;
  value: T;
}

/**
 * TiposItemConfigComponent — CRUD de Tipos de Item.
 *
 * Segue o mesmo padrão visual das 13 configurações existentes.
 * Exibe tabela com badge por categoria e formulário com select filtrado de subcategoria.
 */
@Component({
  selector: 'app-tipos-item-config',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    BadgeModule,
    ButtonModule,
    CardModule,
    CheckboxModule,
    ConfirmDialogModule,
    DialogModule,
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

      <!-- Header -->
      <div class="flex justify-content-between align-items-center mb-3">
        <div>
          <h2 class="m-0 text-xl font-bold">Tipos de Item</h2>
          <p class="text-sm text-color-secondary m-0">Configure os tipos de itens disponíveis (Espada, Arco, Poção, etc.)</p>
        </div>
        @if (hasGame()) {
          <p-button
            label="Novo Tipo"
            icon="pi pi-plus"
            (onClick)="openDialog()"
          />
        }
      </div>

      <!-- Tabela -->
      <p-table
        [value]="tipos()"
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
        <ng-template pTemplate="header">
          <tr>
            <th>Nome</th>
            <th>Categoria</th>
            <th>Subcategoria</th>
            <th style="width: 6rem">2 Mãos</th>
            <th style="width: 6rem">Ordem</th>
            <th style="width: 8rem">Ações</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="groupheader" let-tipo>
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

        <ng-template pTemplate="body" let-tipo>
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
            <td>
              <div class="flex gap-1">
                <p-button
                  icon="pi pi-pencil"
                  [rounded]="true"
                  [text]="true"
                  severity="secondary"
                  (onClick)="openDialog(tipo)"
                  pTooltip="Editar"
                />
                <p-button
                  icon="pi pi-trash"
                  [rounded]="true"
                  [text]="true"
                  severity="danger"
                  (onClick)="confirmDelete(tipo.id)"
                  pTooltip="Excluir"
                />
              </div>
            </td>
          </tr>
        </ng-template>

        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="6">
              <div class="text-center p-4 text-color-secondary">
                <i class="pi pi-inbox text-3xl mb-2 block"></i>
                <p class="m-0">Nenhum tipo de item configurado</p>
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
      [style]="{ width: '36rem' }"
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
            <label for="categoria" class="font-semibold">
              Categoria <span class="text-red-400">*</span>
            </label>
            <p-select
              inputId="categoria"
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
              <label for="subcategoria" class="font-semibold">Subcategoria</label>
              <p-select
                inputId="subcategoria"
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
            <p-checkbox inputId="requerDuasMaos" formControlName="requerDuasMaos" [binary]="true" />
            <label for="requerDuasMaos" class="font-semibold cursor-pointer">
              Requer Duas Mãos
            </label>
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

          <!-- Descrição -->
          <div class="flex flex-column gap-2">
            <label for="descricao" class="font-semibold">Descrição</label>
            <textarea
              pTextarea
              id="descricao"
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
export class TiposItemConfigComponent implements OnInit {
  private readonly configApi = inject(ConfigApiService);
  private readonly currentGameService = inject(CurrentGameService);
  private readonly toastService = inject(ToastService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly hasGame = this.currentGameService.hasCurrentGame;
  protected readonly currentGameId = this.currentGameService.currentGameId;
  protected readonly currentGameName = computed(() => this.currentGameService.currentGame()?.nome);

  protected readonly tipos = signal<TipoItemConfig[]>([]);
  protected readonly loading = signal(false);
  protected readonly dialogVisible = signal(false);
  protected readonly editMode = signal(false);
  protected readonly currentEditId = signal<number | null>(null);

  protected readonly categoriaOptions: SelectOption<CategoriaItem>[] = (Object.keys(CATEGORIA_LABELS) as CategoriaItem[])
    .map((key) => ({ label: CATEGORIA_LABELS[key], value: key }));

  protected readonly subcategoriaOptions = computed((): SelectOption<SubcategoriaItem>[] => {
    const categoria = this.form?.get('categoria')?.value as CategoriaItem | null;
    if (!categoria) return [];
    return (SUBCATEGORIA_POR_CATEGORIA[categoria] ?? []).map((sub) => ({
      label: SUBCATEGORIA_LABELS[sub],
      value: sub,
    }));
  });

  protected form!: FormGroup;

  ngOnInit(): void {
    this.form = this.buildForm();
    if (this.hasGame()) {
      this.loadData();
    }
  }

  private buildForm(): FormGroup {
    return this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      categoria: [null, [Validators.required]],
      subcategoria: [null],
      requerDuasMaos: [false],
      ordemExibicao: [1, [Validators.required, Validators.min(1)]],
      descricao: ['', [Validators.maxLength(500)]],
    });
  }

  protected loadData(): void {
    const jogoId = this.currentGameId();
    if (!jogoId) return;
    this.loading.set(true);
    this.configApi.listTiposItem(jogoId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.tipos.set(data);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  protected openDialog(item?: TipoItemConfig): void {
    this.form = this.buildForm();
    if (item) {
      this.editMode.set(true);
      this.currentEditId.set(item.id);
      this.form.patchValue({
        nome: item.nome,
        categoria: item.categoria,
        subcategoria: item.subcategoria ?? null,
        requerDuasMaos: item.requerDuasMaos,
        ordemExibicao: item.ordemExibicao,
        descricao: item.descricao,
      });
    } else {
      this.editMode.set(false);
      this.currentEditId.set(null);
      this.form.reset({ requerDuasMaos: false, ordemExibicao: this.tipos().length + 1 });
    }
    this.dialogVisible.set(true);
  }

  protected closeDialog(): void {
    this.dialogVisible.set(false);
    this.form.reset();
  }

  protected onDialogVisibleChange(visible: boolean): void {
    if (!visible) this.closeDialog();
  }

  protected onCategoriaChange(): void {
    this.form.get('subcategoria')?.setValue(null);
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastService.warning('Preencha todos os campos obrigatórios', 'Atenção');
      return;
    }

    const jogoId = this.currentGameId()!;
    const data = this.form.value;

    const operation$ = this.editMode()
      ? this.configApi.updateTipoItem(this.currentEditId()!, data)
      : this.configApi.createTipoItem({ ...data, jogoId });

    this.loading.set(true);
    operation$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        const action = this.editMode() ? 'atualizado' : 'criado';
        this.toastService.success(`Tipo de item ${action} com sucesso`, 'Sucesso');
        this.closeDialog();
        this.loadData();
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.message ?? 'Erro ao salvar tipo de item';
        this.toastService.error(msg, 'Erro');
      },
    });
  }

  protected confirmDelete(id: number): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir este Tipo de Item? Esta ação não pode ser desfeita.',
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.delete(id),
    });
  }

  private delete(id: number): void {
    this.configApi.deleteTipoItem(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastService.success('Tipo de item excluído com sucesso', 'Sucesso');
          this.loadData();
        },
        error: (err) => {
          const msg = err?.error?.message ?? 'Erro ao excluir tipo de item';
          this.toastService.error(msg, 'Erro');
        },
      });
  }

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
    return this.tipos().filter((t) => t.categoria === categoria).length;
  }
}
