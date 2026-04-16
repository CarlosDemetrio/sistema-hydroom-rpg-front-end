import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { ColorPickerModule } from 'primeng/colorpicker';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';

import { BaseConfigComponent } from '@shared/components/base-config/base-config.component';
import { RaridadeItemConfig } from '@core/models/raridade-item-config.model';
import { RaridadeItemConfigService } from '@core/services/business/config/raridade-item-config.service';

/**
 * RaridadesItemConfigComponent — CRUD de Raridades de Item.
 *
 * Migrado para estender BaseConfigComponent.
 * Mantém tabela customizada (exibe coluna de cor e bônus de atributo/derivado).
 *
 * Endpoint: /api/v1/configuracoes/raridades-item
 */
@Component({
  selector: 'app-raridades-item-config',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    CardModule,
    CheckboxModule,
    ColorPickerModule,
    ConfirmDialogModule,
    DialogModule,
    InputNumberModule,
    InputTextModule,
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
              Selecione um jogo no cabeçalho para gerenciar Raridades de Item.
            </p>
          </div>
        </div>
      }

      <!-- Header -->
      <div class="flex justify-content-between align-items-center mb-3">
        <div>
          <h2 class="m-0 text-xl font-bold">Raridades de Item</h2>
          <p class="text-sm text-color-secondary m-0">Configure as raridades disponíveis (Comum, Incomum, Raro, etc.)</p>
        </div>
        @if (hasGame()) {
          <p-button
            label="Nova Raridade"
            icon="pi pi-plus"
            (onClick)="openDialog()"
          />
        }
      </div>

      <!-- Tabela -->
      <p-table
        [value]="items()"
        [loading]="loadingTable()"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[10, 25, 50]"
        styleClass="p-datatable-sm"
        [tableStyle]="{ 'min-width': '50rem' }"
      >
        <ng-template #header>
          <tr>
            <th style="width: 6rem">Cor</th>
            <th>Nome</th>
            <th>Jogador pode adicionar</th>
            <th>Bônus Atributo</th>
            <th>Bônus Derivado</th>
            <th style="width: 6rem">Ordem</th>
            <th style="width: 8rem">Ações</th>
          </tr>
        </ng-template>
        <ng-template #body let-raridade>
          <tr>
            <td>
              <div class="flex align-items-center gap-2">
                <div
                  class="border-round"
                  [style.background-color]="raridade.cor"
                  style="width: 1.5rem; height: 1.5rem; border: 1px solid var(--surface-border)"
                ></div>
                <code class="text-xs text-color-secondary">{{ raridade.cor }}</code>
              </div>
            </td>
            <td class="font-semibold">{{ raridade.nome }}</td>
            <td>
              @if (raridade.podeJogadorAdicionar) {
                <p-tag value="Sim" severity="success" />
              } @else {
                <p-tag value="Não" severity="danger" />
              }
            </td>
            <td class="text-sm text-color-secondary">
              @if (
                raridade.bonusAtributoMin !== null && raridade.bonusAtributoMin !== undefined ||
                raridade.bonusAtributoMax !== null && raridade.bonusAtributoMax !== undefined
              ) {
                {{ raridade.bonusAtributoMin ?? 0 }} – {{ raridade.bonusAtributoMax ?? 0 }}
              } @else {
                —
              }
            </td>
            <td class="text-sm text-color-secondary">
              @if (
                raridade.bonusDerivadoMin !== null && raridade.bonusDerivadoMin !== undefined ||
                raridade.bonusDerivadoMax !== null && raridade.bonusDerivadoMax !== undefined
              ) {
                {{ raridade.bonusDerivadoMin ?? 0 }} – {{ raridade.bonusDerivadoMax ?? 0 }}
              } @else {
                —
              }
            </td>
            <td class="text-center">{{ raridade.ordemExibicao }}</td>
            <td>
              <div class="flex gap-1">
                <p-button
                  icon="pi pi-pencil"
                  [rounded]="true"
                  [text]="true"
                  severity="secondary"
                  (onClick)="openDialog(raridade)"
                  pTooltip="Editar"
                  tooltipPosition="top"
                />
                <p-button
                  icon="pi pi-trash"
                  [rounded]="true"
                  [text]="true"
                  severity="danger"
                  (onClick)="confirmDelete(raridade.id!)"
                  pTooltip="Excluir"
                  tooltipPosition="top"
                />
              </div>
            </td>
          </tr>
        </ng-template>
        <ng-template #emptymessage>
          <tr>
            <td colspan="7">
              <div class="rpg-empty-state">
                <i class="pi pi-inbox rpg-empty-state__icon"></i>
                <p class="rpg-empty-state__title">Nenhuma raridade configurada</p>
                <p class="rpg-empty-state__subtitle">
                  Clique em "Nova Raridade" para criar o primeiro registro.
                </p>
                <p-button
                  label="Nova Raridade"
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
      [header]="editMode() ? 'Editar Raridade' : 'Nova Raridade'"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      [style]="{ width: '38rem', maxWidth: '95vw' }"
    >
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="flex flex-column gap-4 p-2">

          <!-- Nome -->
          <div class="flex flex-column gap-2">
            <label for="raridade-nome" class="font-semibold">
              Nome <span class="text-red-400">*</span>
            </label>
            <input
              pInputText
              id="raridade-nome"
              formControlName="nome"
              placeholder="Ex: Comum, Raro, Épico..."
              [class.ng-invalid]="form.get('nome')?.invalid && form.get('nome')?.touched"
            />
            @if (form.get('nome')?.invalid && form.get('nome')?.touched) {
              <small class="text-red-400">
                @if (form.get('nome')?.errors?.['required']) { Campo obrigatório }
                @if (form.get('nome')?.errors?.['minlength']) { Mínimo de 2 caracteres }
              </small>
            }
          </div>

          <!-- Cor -->
          <div class="flex flex-column gap-2">
            <label class="font-semibold">
              Cor <span class="text-red-400">*</span>
            </label>

            <div class="flex align-items-center gap-3 flex-wrap">
              <!-- PrimeNG ColorPicker — bidirecional com o input hex -->
              <p-colorpicker
                [ngModel]="corPickerValue()"
                (ngModelChange)="onColorPickerNgModelChange($event)"
                [inline]="false"
                appendTo="body"
                aria-label="Seletor de cor"
              ></p-colorpicker>

              <!-- Input hex manual — fonte primária do valor -->
              <input
                pInputText
                id="raridade-cor"
                formControlName="cor"
                placeholder="#9d9d9d"
                style="font-family: monospace; flex: 1; min-width: 8rem;"
                [class.ng-invalid]="form.get('cor')?.invalid && form.get('cor')?.touched"
                aria-label="Valor hexadecimal da cor"
              />

              <!-- Preview em tempo real -->
              <div
                class="border-round flex align-items-center justify-content-center flex-shrink-0"
                [style.background-color]="corPreview()"
                style="width: 6rem; height: 2.5rem; border: 1px solid var(--surface-border)"
                aria-label="Preview da cor selecionada"
              >
                <span class="text-xs font-semibold" [style.color]="corTextoContraste()">
                  Preview
                </span>
              </div>
            </div>

            @if (form.get('cor')?.invalid && form.get('cor')?.touched) {
              <small class="text-red-400">
                @if (form.get('cor')?.errors?.['required']) { Campo obrigatório }
                @if (form.get('cor')?.errors?.['pattern']) { Use formato hexadecimal: #RRGGBB }
              </small>
            }
          </div>

          <!-- Jogador pode adicionar -->
          <div class="flex align-items-center gap-2">
            <p-checkbox inputId="raridade-podeJogadorAdicionar" formControlName="podeJogadorAdicionar" [binary]="true" />
            <label for="raridade-podeJogadorAdicionar" class="font-semibold cursor-pointer">
              Jogador pode adicionar itens desta raridade
            </label>
          </div>

          <!-- Ranges de bônus -->
          <div class="rpg-section-title">Ranges de Bônus (opcionais)</div>

          <!-- Bônus Atributo -->
          <div class="flex flex-column gap-1">
            <label class="font-semibold text-sm">Bônus de Atributo</label>
            <div class="grid">
              <div class="col-6">
                <div class="flex flex-column gap-1">
                  <label class="text-xs text-color-secondary">Mínimo</label>
                  <p-input-number
                    inputId="raridade-bonusAtributoMin"
                    formControlName="bonusAtributoMin"
                    [showButtons]="true"
                    [min]="0"
                  />
                </div>
              </div>
              <div class="col-6">
                <div class="flex flex-column gap-1">
                  <label class="text-xs text-color-secondary">Máximo</label>
                  <p-input-number
                    inputId="raridade-bonusAtributoMax"
                    formControlName="bonusAtributoMax"
                    [showButtons]="true"
                    [min]="0"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Bônus Derivado -->
          <div class="flex flex-column gap-1">
            <label class="font-semibold text-sm">Bônus Derivado</label>
            <div class="grid">
              <div class="col-6">
                <div class="flex flex-column gap-1">
                  <label class="text-xs text-color-secondary">Mínimo</label>
                  <p-input-number
                    inputId="raridade-bonusDerivadoMin"
                    formControlName="bonusDerivadoMin"
                    [showButtons]="true"
                    [min]="0"
                  />
                </div>
              </div>
              <div class="col-6">
                <div class="flex flex-column gap-1">
                  <label class="text-xs text-color-secondary">Máximo</label>
                  <p-input-number
                    inputId="raridade-bonusDerivadoMax"
                    formControlName="bonusDerivadoMax"
                    [showButtons]="true"
                    [min]="0"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Ordem -->
          <div class="flex flex-column gap-2">
            <label for="raridade-ordemExibicao" class="font-semibold">
              Ordem de Exibição <span class="text-red-400">*</span>
            </label>
            <p-input-number
              inputId="raridade-ordemExibicao"
              formControlName="ordemExibicao"
              [showButtons]="true"
              [min]="1"
            />
          </div>

          <!-- Descrição -->
          <div class="flex flex-column gap-2">
            <label for="raridade-descricao" class="font-semibold">Descrição</label>
            <textarea
              pTextarea
              id="raridade-descricao"
              formControlName="descricao"
              [rows]="2"
              placeholder="Descrição opcional da raridade..."
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
            [label]="editMode() ? 'Salvar Alterações' : 'Criar Raridade'"
            icon="pi pi-check"
            type="submit"
          />
        </div>
      </form>
    </p-dialog>

    <p-confirmDialog />
  `,
})
export class RaridadesItemConfigComponent extends BaseConfigComponent<
  RaridadeItemConfig,
  RaridadeItemConfigService
> {
  protected override service = inject(RaridadeItemConfigService);
  private readonly confirmationService = inject(ConfirmationService);

  // ---- Estado local de loading da tabela ----
  protected readonly loadingTable = signal(false);

  /**
   * Valor reativo da cor para disparar recomputação dos computeds de preview.
   * Atualizado manualmente sempre que o form control 'cor' muda.
   */
  protected readonly corFormValue = signal<string>('#9d9d9d');

  /**
   * Cor validada para preview — fallback para cinza padrão se hex inválido.
   */
  protected readonly corPreview = computed(() => {
    const cor = this.corFormValue();
    return /^#[0-9A-Fa-f]{6}$/.test(cor) ? cor : '#9d9d9d';
  });

  /**
   * Valor sem '#' para o p-colorpicker (espera RRGGBB sem o hash).
   */
  protected readonly corPickerValue = computed(() =>
    this.corPreview().replace('#', '')
  );

  /**
   * Cor de texto com contraste adequado sobre o preview.
   */
  protected readonly corTextoContraste = computed(() => {
    const hex = this.corPreview().replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  });

  // ---- Métodos obrigatórios da base ----

  protected getEntityName(): string {
    return 'Raridade';
  }

  protected getEntityNamePlural(): string {
    return 'Raridades de Item';
  }

  protected buildForm(): FormGroup {
    const form = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      cor: ['#9d9d9d', [Validators.required, Validators.pattern(/^#[0-9A-Fa-f]{6}$/)]],
      ordemExibicao: [1, [Validators.required, Validators.min(1)]],
      podeJogadorAdicionar: [false],
      bonusAtributoMin: [null],
      bonusAtributoMax: [null],
      bonusDerivadoMin: [null],
      bonusDerivadoMax: [null],
      descricao: ['', [Validators.maxLength(500)]],
    });

    // Assina mudanças no control 'cor' para manter corFormValue sincronizado
    form.get('cor')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((valor: string | null) => this.corFormValue.set(valor ?? '#9d9d9d'));

    return form;
  }

  // ---- Dialog ----

  override openDialog(item?: RaridadeItemConfig): void {
    this.form = this.buildForm();
    if (item) {
      this.editMode.set(true);
      this.currentEditId.set(item.id);
      this.form.patchValue({
        nome: item.nome,
        cor: item.cor,
        ordemExibicao: item.ordemExibicao,
        podeJogadorAdicionar: item.podeJogadorAdicionar,
        bonusAtributoMin: item.bonusAtributoMin,
        bonusAtributoMax: item.bonusAtributoMax,
        bonusDerivadoMin: item.bonusDerivadoMin,
        bonusDerivadoMax: item.bonusDerivadoMax,
        descricao: item.descricao,
      });
      this.corFormValue.set(item.cor ?? '#9d9d9d');
    } else {
      this.editMode.set(false);
      this.currentEditId.set(null);
      this.form.reset({ cor: '#9d9d9d', ordemExibicao: this.items().length + 1, podeJogadorAdicionar: false });
      this.corFormValue.set('#9d9d9d');
    }
    this.dialogVisible.set(true);
  }

  protected onDialogVisibleChange(visible: boolean): void {
    if (!visible) this.closeDialog();
  }

  /**
   * Callback do p-colorpicker — recebe o valor em formato RRGGBB (sem #).
   * Atualiza o form control 'cor' com o prefixo '#' e em maiúsculas.
   */
  protected onColorPickerNgModelChange(valor: string): void {
    if (!valor) return;
    const hexComHash = `#${valor.toUpperCase()}`;
    this.form.get('cor')?.setValue(hexComHash);
    this.form.get('cor')?.markAsTouched();
  }

  // ---- Sobrescreve save para gerenciar loading local ----

  override save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastService.warning('Preencha todos os campos obrigatórios', 'Atenção');
      return;
    }

    const data = this.form.value;

    const operation$ = this.editMode()
      ? this.service.updateItem(this.currentEditId()!, data)
      : this.service.createItem(data);

    this.loadingTable.set(true);
    operation$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        const action = this.editMode() ? 'atualizada' : 'criada';
        this.toastService.success(`Raridade ${action} com sucesso`, 'Sucesso');
        this.closeDialog();
        this.loadData();
      },
      error: () => this.loadingTable.set(false),
    });
  }

  // ---- Sobrescreve loadData para gerenciar loading local ----

  override loadData(): void {
    const jogoId = this.currentGameId();
    if (!jogoId) return;
    this.loadingTable.set(true);
    this.service.loadItems()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.items.set(data);
          this.loadingTable.set(false);
        },
        error: () => this.loadingTable.set(false),
      });
  }

  // ---- Sobrescreve confirmDelete para usar ConfirmationService ----

  override confirmDelete(id: number): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir esta Raridade? Esta ação não pode ser desfeita.',
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, excluir',
      rejectLabel: 'Cancelar',
      acceptButtonProps: { severity: 'danger' },
      accept: () => this.delete(id),
    });
  }
}
