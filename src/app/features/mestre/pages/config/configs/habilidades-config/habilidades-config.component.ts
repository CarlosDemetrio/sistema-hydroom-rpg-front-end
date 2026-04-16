import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpContext } from '@angular/common/http';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
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
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { HabilidadeConfig } from '@core/models/habilidade-config.model';
import { HabilidadeConfigService } from '@core/services/business/config/habilidade-config.service';
import { ConfigApiService } from '@core/services/api/config-api.service';
import { SKIP_ERROR_INTERCEPTOR } from '@core/tokens/skip-error.token';

/**
 * HabilidadesConfigComponent — CRUD de Habilidades do Jogo (tela do Mestre).
 *
 * Migrado para estender BaseConfigComponent + usar app-base-config-table.
 * Mantém lógica específica:
 * - erroConflito signal para feedback inline de 409
 * - saving signal para loading do botão submit
 * - truncar() helper para exibir danoEfeito na tabela
 * - SKIP_ERROR_INTERCEPTOR em create/update para tratar 409 localmente
 *
 * Endpoint: /api/jogos/{jogoId}/config/habilidades
 */
@Component({
  selector: 'app-habilidades-config',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    ConfirmDialogModule,
    DialogModule,
    InputNumberModule,
    InputTextModule,
    TextareaModule,
    TooltipModule,
    BaseConfigTableComponent,
    PageHeaderComponent,
  ],
  providers: [ConfirmationService],
  template: `
    <app-page-header title="Habilidades" backRoute="/mestre/config" />
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
              Selecione um jogo no cabeçalho para gerenciar Habilidades.
            </p>
          </div>
        </div>
      }

      <app-base-config-table
        [titulo]="'Habilidades'"
        [subtitulo]="'Cadastre ataques, técnicas e manobras disponíveis no jogo (ex: Golpe Brutal — 2D6+FOR)'"
        [labelNovo]="'Nova Habilidade'"
        [items]="filteredItems()"
        [loading]="loading()"
        [columns]="columns"
        [canReorder]="false"
        [rowsPerPage]="10"
        (onCreate)="openDialogHabilidade()"
        (onEdit)="openDialogHabilidade($event)"
        (onDelete)="confirmDelete($event.id!)"
        (onSearch)="searchQuery.set($event)"
      />

    </p-card>

    <!-- Dialog de criação/edição -->
    <p-dialog
      [visible]="dialogVisible()"
      (visibleChange)="onDialogVisibleChange($event)"
      [header]="editMode() ? 'Editar Habilidade' : 'Nova Habilidade'"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      [style]="{ width: '38rem', maxWidth: '95vw' }"
    >
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="flex flex-column gap-4 p-2">

          <!-- Nome -->
          <div class="flex flex-column gap-2">
            <label for="habil-nome" class="font-semibold">
              Nome <span class="text-red-400">*</span>
            </label>
            <input
              pInputText
              id="habil-nome"
              formControlName="nome"
              placeholder="Ex: Golpe Brutal, Chama Sagrada..."
              maxlength="100"
              [class.ng-invalid]="form.get('nome')?.invalid && form.get('nome')?.touched"
            />
            @if (form.get('nome')?.invalid && form.get('nome')?.touched) {
              <small class="text-red-400">Nome é obrigatório.</small>
            }
          </div>

          <!-- Dano / Efeito -->
          <div class="flex flex-column gap-2">
            <label for="habil-danoEfeito" class="font-semibold">Dano / Efeito</label>
            <input
              pInputText
              id="habil-danoEfeito"
              formControlName="danoEfeito"
              placeholder="Ex: 2D6+FOR de dano físico"
              maxlength="500"
            />
            <small class="text-color-secondary">
              Texto livre descrevendo o efeito mecânico. Não é processado pelo sistema.
            </small>
          </div>

          <!-- Descrição -->
          <div class="flex flex-column gap-2">
            <label for="habil-descricao" class="font-semibold">Descrição</label>
            <textarea
              pTextarea
              id="habil-descricao"
              formControlName="descricao"
              placeholder="Descrição narrativa opcional da habilidade..."
              [rows]="3"
              [autoResize]="true"
              maxlength="1000"
            ></textarea>
          </div>

          <!-- Ordem de Exibição -->
          <div class="flex flex-column gap-2">
            <label for="habil-ordem" class="font-semibold">
              Ordem de Exibição <span class="text-red-400">*</span>
            </label>
            <p-input-number
              inputId="habil-ordem"
              formControlName="ordemExibicao"
              [showButtons]="true"
              [min]="0"
            />
          </div>

        </div>

        @if (erroConflito()) {
          <div class="mt-3 p-3 border-round" style="background: var(--red-50); border: 1px solid var(--red-200)">
            <small class="text-red-600">
              <i class="pi pi-exclamation-circle mr-1"></i>
              Já existe uma habilidade com este nome neste jogo.
            </small>
          </div>
        }

        <div class="flex justify-content-end gap-2 mt-5 pt-4 border-top-1 surface-border">
          <p-button
            label="Cancelar"
            severity="secondary"
            [outlined]="true"
            type="button"
            (onClick)="closeDialog()"
          />
          <p-button
            [label]="editMode() ? 'Salvar Alterações' : 'Criar Habilidade'"
            icon="pi pi-check"
            type="submit"
            [loading]="saving()"
          />
        </div>
      </form>
    </p-dialog>

    <p-confirmDialog />
  `,
})
export class HabilidadesConfigComponent extends BaseConfigComponent<
  HabilidadeConfig,
  HabilidadeConfigService
> {
  protected override service = inject(HabilidadeConfigService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly configApi = inject(ConfigApiService);

  // ---- Estado específico desta tela ----
  protected readonly saving = signal(false);
  protected readonly erroConflito = signal(false);
  protected readonly searchQuery = signal('');
  protected readonly loading = signal(false);

  // ---- Colunas da tabela ----
  readonly columns: ConfigTableColumn[] = [
    { field: 'ordemExibicao', header: 'Ordem',      width: '5rem' },
    { field: 'nome',          header: 'Nome' },
    { field: 'danoEfeito',    header: 'Dano / Efeito' },
    { field: 'descricao',     header: 'Descrição' },
  ];

  // ---- Itens filtrados por busca ----
  protected filteredItems = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.items();
    return this.items().filter(
      (h) =>
        h.nome?.toLowerCase().includes(q) ||
        (h.danoEfeito ?? '').toLowerCase().includes(q) ||
        (h.descricao ?? '').toLowerCase().includes(q),
    );
  });

  // ---- Métodos obrigatórios da base ----

  protected getEntityName(): string {
    return 'Habilidade';
  }

  protected getEntityNamePlural(): string {
    return 'Habilidades';
  }

  protected buildForm(): FormGroup {
    return this.fb.group({
      nome:          ['', [Validators.required, Validators.maxLength(100)]],
      danoEfeito:    ['', [Validators.maxLength(500)]],
      descricao:     ['', [Validators.maxLength(1000)]],
      ordemExibicao: [0,  [Validators.required, Validators.min(0)]],
    });
  }

  // ---- Dialog ----

  /** Wrapper para abrir o dialog, inicializando ordemExibicao automática em modo criação */
  openDialogHabilidade(item?: HabilidadeConfig): void {
    this.erroConflito.set(false);
    this.openDialog(item);
    if (!item) {
      this.form.patchValue({ ordemExibicao: this.items().length + 1 });
    } else {
      // patchValue com conversão null→'' para danoEfeito e descricao
      this.form.patchValue({
        danoEfeito: item.danoEfeito ?? '',
        descricao:  item.descricao ?? '',
      });
    }
  }

  protected onDialogVisibleChange(visible: boolean): void {
    if (!visible) this.closeDialog();
  }

  override closeDialog(): void {
    this.erroConflito.set(false);
    super.closeDialog();
  }

  // ---- Sobrescreve save para lógica de 409 e SKIP_ERROR_INTERCEPTOR ----

  override save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastService.warning('Preencha todos os campos obrigatórios', 'Atenção');
      return;
    }

    const jogoId = this.currentGameId()!;
    const { nome, danoEfeito, descricao, ordemExibicao } = this.form.value;
    const dto = {
      nome:          nome.trim(),
      danoEfeito:    danoEfeito?.trim() || null,
      descricao:     descricao?.trim() || null,
      ordemExibicao,
    };

    const ctx = new HttpContext().set(SKIP_ERROR_INTERCEPTOR, true);
    const operation$ = this.editMode()
      ? this.configApi.updateHabilidade(jogoId, this.currentEditId()!, dto, ctx)
      : this.configApi.createHabilidade(jogoId, dto, ctx);

    this.saving.set(true);
    this.erroConflito.set(false);

    operation$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        const action = this.editMode() ? 'atualizada' : 'criada';
        this.toastService.success(`Habilidade ${action} com sucesso`, 'Sucesso');
        this.closeDialog();
        this.loadData();
        this.saving.set(false);
      },
      error: (err) => {
        this.saving.set(false);
        if (err?.status === 409) {
          this.erroConflito.set(true);
        } else {
          const msg = err?.error?.message ?? 'Erro ao salvar habilidade';
          this.toastService.error(msg, 'Erro');
        }
      },
    });
  }

  // ---- Sobrescreve confirmDelete para usar ConfirmationService ----

  override confirmDelete(id: number): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir esta Habilidade? Esta ação não pode ser desfeita.',
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, excluir',
      rejectLabel: 'Cancelar',
      acceptButtonProps: { severity: 'danger' },
      accept: () => this.delete(id),
    });
  }

  // ---- Sobrescreve loadData para gerenciar o loading local ----

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

  // ---- Helper de truncamento para exibição na tabela ----

  protected truncar(texto: string, limite: number): string {
    if (!texto || texto.length <= limite) return texto;
    return texto.substring(0, limite) + '...';
  }
}
