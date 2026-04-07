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
import { FormulaEditorComponent } from '@shared/components/formula-editor/formula-editor.component';
import { AtributoConfig } from '@core/models';
import { AtributoConfigService } from '@core/services/business/config';
import { ConfigApiService } from '@core/services/api/config-api.service';
import {
  uppercaseValidator,
  uniqueNameValidator,
} from '@shared/validators/config-validators';

/**
 * AtributosConfigComponent — modelo para todas as 13 páginas de config do Mestre.
 *
 * Usa BaseConfigTableComponent como UI genérica (tabela, busca, drag-and-drop).
 * Usa BaseConfigComponent (abstract Directive) para lógica CRUD, estado e formulário.
 *
 * Padrão para replicar nos outros 12 configs:
 *   1. Estender BaseConfigComponent com o tipo correto
 *   2. Implementar buildForm(), getEntityName(), getEntityNamePlural()
 *   3. Sobrescrever confirmDelete() para usar ConfirmationService
 *   4. Incluir <app-base-config-table> no template com bindings
 *   5. Incluir <p-dialog> para o formulário modal
 */
@Component({
  selector: 'app-atributos-config',
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
    FormulaEditorComponent,
  ],
  providers: [ConfirmationService],
  template: `
    <p-card class="card-rpg card-rpg--accented">

      <!-- Indicador de jogo -->
      @if (hasGame()) {
        <div class="flex align-items-center gap-2 mb-3 p-2 border-round surface-100">
          <i class="pi pi-book text-primary text-sm"></i>
          <span class="text-sm font-semibold text-primary">
            Configurando: {{ currentGameName() }}
          </span>
        </div>
      }

      <!-- Aviso sem jogo -->
      @if (!hasGame()) {
        <div class="flex align-items-center gap-3 p-4 border-round surface-100 mb-4">
          <i class="pi pi-exclamation-triangle text-2xl" style="color: var(--rpg-amber-400)"></i>
          <div>
            <p class="font-semibold m-0 mb-1">Nenhum jogo selecionado</p>
            <p class="text-sm text-color-secondary m-0">
              Selecione um jogo no cabeçalho para gerenciar Atributos.
            </p>
          </div>
        </div>
      }

      <!-- Tabela genérica -->
      <app-base-config-table
        [titulo]="'Atributos'"
        [subtitulo]="'Configure os atributos base do sistema (FOR, DES, CON, etc.)'"
        [labelNovo]="'Novo Atributo'"
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

    <!-- ============================================================
         DRAWER LATERAL — Formulário criar/editar
    ============================================================ -->
    <p-dialog
      [visible]="drawerVisible()"
      (visibleChange)="onDrawerVisibleChange($event)"
      [header]="editMode() ? 'Editar Atributo' : 'Novo Atributo'"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
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
              placeholder="Ex: Força"
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

          <!-- Abreviação -->
          <div class="flex flex-column gap-2">
            <label for="abreviacao" class="font-semibold">
              Abreviação / Sigla <span class="text-red-400">*</span>
            </label>
            <input
              pInputText
              id="abreviacao"
              formControlName="abreviacao"
              placeholder="Ex: FOR"
              style="text-transform: uppercase; font-family: var(--rpg-font-mono); font-weight: 700;"
              [class.ng-invalid]="form.get('abreviacao')?.invalid && form.get('abreviacao')?.touched"
            />
            <small class="text-color-secondary">2 a 5 caracteres, maiúsculas. Única por jogo.</small>
            @if (form.get('abreviacao')?.invalid && form.get('abreviacao')?.touched) {
              <small class="text-red-400">
                @if (form.get('abreviacao')?.errors?.['required']) { Campo obrigatório }
                @if (form.get('abreviacao')?.errors?.['minlength']) { Mínimo 2 caracteres }
                @if (form.get('abreviacao')?.errors?.['maxlength']) { Máximo 5 caracteres }
                @if (form.get('abreviacao')?.errors?.['uppercase']) { Deve estar em maiúsculas }
              </small>
            }
          </div>

          <!-- Descrição -->
          <div class="flex flex-column gap-2">
            <label for="descricao" class="font-semibold">Descrição</label>
            <textarea
              pTextarea
              id="descricao"
              formControlName="descricao"
              [rows]="3"
              placeholder="Descreva o atributo e seu papel no sistema..."
              [autoResize]="true"
            ></textarea>
          </div>

          <!-- Divider: campos avançados -->
          <div class="rpg-section-title">Fórmulas e Limites</div>

          <!-- Fórmula Ímpeto -->
          <app-formula-editor
            [formula]="form.get('formulaImpeto')!.value ?? ''"
            (formulaChange)="form.get('formulaImpeto')!.setValue($event)"
            [variaveisFixas]="['total']"
            placeholder="Ex: total / 10"
            label="Fórmula de Ímpeto"
            (validationChange)="formulaImpetoValida.set($event)"
          />

          <!-- Descrição Ímpeto -->
          <div class="flex flex-column gap-2">
            <label for="descricaoImpeto" class="font-semibold">Descrição do Ímpeto</label>
            <textarea
              pTextarea
              id="descricaoImpeto"
              formControlName="descricaoImpeto"
              [rows]="2"
              placeholder="Explica como o ímpeto é calculado..."
              [autoResize]="true"
            ></textarea>
          </div>

          <!-- Valor Mínimo / Máximo -->
          <div class="grid">
            <div class="col-12 md:col-6">
              <div class="flex flex-column gap-2">
                <label for="valorMinimo" class="font-semibold">Valor Mínimo</label>
                <p-input-number
                  inputId="valorMinimo"
                  formControlName="valorMinimo"
                  [showButtons]="true"
                />
              </div>
            </div>
            <div class="col-12 md:col-6">
              <div class="flex flex-column gap-2">
                <label for="valorMaximo" class="font-semibold">Valor Máximo</label>
                <p-input-number
                  inputId="valorMaximo"
                  formControlName="valorMaximo"
                  [showButtons]="true"
                />
              </div>
            </div>
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

          <!-- Ativo -->
          <div class="flex align-items-center gap-2">
            <p-checkbox inputId="ativo" formControlName="ativo" [binary]="true" />
            <label for="ativo" class="font-semibold cursor-pointer">Ativo</label>
          </div>

        </div>

        <!-- Rodapé -->
        <div class="flex justify-content-end gap-2 mt-5 pt-4 border-top-1 surface-border">
          <p-button
            label="Cancelar"
            severity="secondary"
            [outlined]="true"
            type="button"
            (onClick)="closeDrawer()"
          />
          <p-button
            [label]="editMode() ? 'Salvar Alterações' : 'Criar Atributo'"
            icon="pi pi-check"
            type="submit"
          />
        </div>
      </form>
    </p-dialog>

    <p-confirmDialog />
  `,
})
export class AtributosConfigComponent extends BaseConfigComponent<
  AtributoConfig,
  AtributoConfigService
> {
  protected service = inject(AtributoConfigService);
  private confirmationService = inject(ConfirmationService);
  private configApi = inject(ConfigApiService);

  // ---- Estado ----
  protected drawerVisible = signal(false);
  protected loading = signal(false);
  protected searchQuery = signal('');
  protected formulaImpetoValida = signal(true);

  // ---- Colunas da tabela ----
  readonly columns: ConfigTableColumn[] = [
    { field: 'ordemExibicao', header: 'Ordem', width: '5rem' },
    { field: 'nome',          header: 'Nome' },
    { field: 'abreviacao',    header: 'Sigla', width: '6rem' },
    { field: 'descricao',     header: 'Descrição' },
  ];

  // ---- Itens filtrados por busca ----
  protected filteredItems = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.items();
    return this.items().filter(
      (a) =>
        a.nome?.toLowerCase().includes(q) ||
        a.abreviacao?.toLowerCase().includes(q) ||
        (a.descricao ?? '').toLowerCase().includes(q),
    );
  });

  // ---- Métodos obrigatórios da base ----

  protected getEntityName(): string {
    return 'Atributo';
  }

  protected getEntityNamePlural(): string {
    return 'Atributos';
  }

  protected buildForm(): FormGroup {
    return this.fb.group({
      nome: [
        '',
        [Validators.required, Validators.minLength(3), Validators.maxLength(50)],
      ],
      abreviacao: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(5),
          uppercaseValidator(),
        ],
      ],
      descricao:       ['', [Validators.maxLength(500)]],
      formulaImpeto:   ['', [Validators.maxLength(100)]],
      descricaoImpeto: ['', [Validators.maxLength(200)]],
      valorMinimo:     [null],
      valorMaximo:     [null],
      ordemExibicao:   [1, [Validators.required, Validators.min(1)]],
      ativo:           [true],
    });
  }

  // ---- Drawer ----

  openDrawer(item?: AtributoConfig): void {
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

  // ---- Sobrescreve openDialog para injetar uniqueNameValidator ----

  override openDialog(item?: AtributoConfig): void {
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

  // ---- Sobrescreve save para fechar o drawer ao concluir ----

  override save(): void {
    if (this.form.invalid) {
      // Delega validação para a base (que mostra o toast)
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
        this.toastService.success(`Atributo ${action} com sucesso`, 'Sucesso');
        this.closeDrawer();
        this.loadData();
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  // ---- Confirmação de exclusão ----

  override confirmDelete(id: number): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir este Atributo? Esta ação não pode ser desfeita.',
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.delete(id),
    });
  }

  // ---- Reordenação em batch ----
  // Nota: o endpoint de reordenação PATCH /atributos/reordenar será implementado
  // quando o ConfigApiService expor o método. Por ora, exibe toast informativo.

  protected handleReorder(payload: { itemId: number; novaOrdem: number }[]): void {
    const jogoId = this.currentGameId();
    if (!jogoId || payload.length === 0) return;
    this.configApi.reordenarAtributos(jogoId, { itens: payload.map((p) => ({ id: p.itemId, ordemExibicao: p.novaOrdem })) })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.toastService.success('Ordem salva com sucesso.', 'Reordenação'),
        error: () => this.toastService.error('Erro ao salvar a ordem.', 'Reordenação'),
      });
  }
}
