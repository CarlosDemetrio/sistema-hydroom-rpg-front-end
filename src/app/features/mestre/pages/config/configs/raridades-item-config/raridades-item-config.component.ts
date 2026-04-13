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
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';

import { ConfigApiService } from '@core/services/api/config-api.service';
import { CurrentGameService } from '@core/services/current-game.service';
import { ToastService } from '@services/toast.service';
import { RaridadeItemConfig } from '@core/models/raridade-item-config.model';

/**
 * RaridadesItemConfigComponent — CRUD de Raridades de Item.
 *
 * Segue o mesmo padrão visual das 13 configurações existentes.
 * Sem BaseConfigComponent (endpoint não segue o padrão /configuracoes/{tipo}?jogoId=).
 */
@Component({
  selector: 'app-raridades-item-config',
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
        [value]="raridades()"
        [loading]="loading()"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[10, 25, 50]"
        styleClass="p-datatable-sm"
        [tableStyle]="{ 'min-width': '50rem' }"
      >
        <ng-template pTemplate="header">
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
        <ng-template pTemplate="body" let-raridade>
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
              @if (raridade.bonusAtributoMin != null || raridade.bonusAtributoMax != null) {
                {{ raridade.bonusAtributoMin ?? 0 }} – {{ raridade.bonusAtributoMax ?? 0 }}
              } @else {
                —
              }
            </td>
            <td class="text-sm text-color-secondary">
              @if (raridade.bonusDerivadoMin != null || raridade.bonusDerivadoMax != null) {
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
                />
                <p-button
                  icon="pi pi-trash"
                  [rounded]="true"
                  [text]="true"
                  severity="danger"
                  (onClick)="confirmDelete(raridade.id)"
                  pTooltip="Excluir"
                />
              </div>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="7">
              <div class="text-center p-4 text-color-secondary">
                <i class="pi pi-inbox text-3xl mb-2 block"></i>
                <p class="m-0">Nenhuma raridade configurada</p>
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
            <div class="flex align-items-center gap-3">
              <!-- Color picker nativo -->
              <input
                type="color"
                [value]="corPreview()"
                (input)="onColorPickerChange($event)"
                style="width: 3rem; height: 3rem; border: none; cursor: pointer; padding: 0; border-radius: 4px;"
                aria-label="Seletor de cor"
              />
              <!-- Input hex manual -->
              <input
                pInputText
                id="cor"
                formControlName="cor"
                placeholder="#9d9d9d"
                style="font-family: monospace; flex: 1"
                [class.ng-invalid]="form.get('cor')?.invalid && form.get('cor')?.touched"
              />
              <!-- Preview chip -->
              <div
                class="border-round flex align-items-center justify-content-center"
                [style.background-color]="corPreview()"
                style="width: 6rem; height: 2rem; border: 1px solid var(--surface-border)"
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
            <p-checkbox inputId="podeJogadorAdicionar" formControlName="podeJogadorAdicionar" [binary]="true" />
            <label for="podeJogadorAdicionar" class="font-semibold cursor-pointer">
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
                    inputId="bonusAtributoMin"
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
                    inputId="bonusAtributoMax"
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
                    inputId="bonusDerivadoMin"
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
                    inputId="bonusDerivadoMax"
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
export class RaridadesItemConfigComponent implements OnInit {
  private readonly configApi = inject(ConfigApiService);
  private readonly currentGameService = inject(CurrentGameService);
  private readonly toastService = inject(ToastService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly hasGame = this.currentGameService.hasCurrentGame;
  protected readonly currentGameId = this.currentGameService.currentGameId;
  protected readonly currentGameName = computed(() => this.currentGameService.currentGame()?.nome);

  protected readonly raridades = signal<RaridadeItemConfig[]>([]);
  protected readonly loading = signal(false);
  protected readonly dialogVisible = signal(false);
  protected readonly editMode = signal(false);
  protected readonly currentEditId = signal<number | null>(null);

  protected readonly corPreview = computed(() => {
    const cor = this.form?.get('cor')?.value ?? '#9d9d9d';
    return /^#[0-9A-Fa-f]{6}$/.test(cor) ? cor : '#9d9d9d';
  });

  protected readonly corTextoContraste = computed(() => {
    const hex = this.corPreview().replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
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
  }

  protected loadData(): void {
    const jogoId = this.currentGameId();
    if (!jogoId) return;
    this.loading.set(true);
    this.configApi.listRaridadesItem(jogoId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.raridades.set(data);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  protected openDialog(item?: RaridadeItemConfig): void {
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
    } else {
      this.editMode.set(false);
      this.currentEditId.set(null);
      this.form.reset({ cor: '#9d9d9d', ordemExibicao: this.raridades().length + 1, podeJogadorAdicionar: false });
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

  protected onColorPickerChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.form.get('cor')?.setValue(input.value.toUpperCase());
    this.form.get('cor')?.markAsTouched();
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
      ? this.configApi.updateRaridadeItem(this.currentEditId()!, data)
      : this.configApi.createRaridadeItem({ ...data, jogoId });

    this.loading.set(true);
    operation$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        const action = this.editMode() ? 'atualizada' : 'criada';
        this.toastService.success(`Raridade ${action} com sucesso`, 'Sucesso');
        this.closeDialog();
        this.loadData();
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.message ?? 'Erro ao salvar raridade';
        this.toastService.error(msg, 'Erro');
      },
    });
  }

  protected confirmDelete(id: number): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir esta Raridade? Esta ação não pode ser desfeita.',
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.delete(id),
    });
  }

  private delete(id: number): void {
    this.configApi.deleteRaridadeItem(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastService.success('Raridade excluída com sucesso', 'Sucesso');
          this.loadData();
        },
        error: (err) => {
          const msg = err?.error?.message ?? 'Erro ao excluir raridade';
          this.toastService.error(msg, 'Erro');
        },
      });
  }
}
