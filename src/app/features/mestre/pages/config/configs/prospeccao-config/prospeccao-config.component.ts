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
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';

import { BaseConfigComponent } from '@shared/components/base-config/base-config.component';
import {
  BaseConfigTableComponent,
  ConfigTableColumn,
} from '@shared/components/base-config/base-config-table.component';
import { DadoProspeccaoConfig } from '@core/models';
import { ProspeccaoConfigService } from '@core/services/business/config';
import { ConfigApiService } from '@core/services/api/config-api.service';
import { uniqueNameValidator } from '@shared/validators/config-validators';

const FACES_OPTIONS = [
  { label: 'd3 (3 faces)',  value: 3 },
  { label: 'd4 (4 faces)',  value: 4 },
  { label: 'd6 (6 faces)',  value: 6 },
  { label: 'd8 (8 faces)',  value: 8 },
  { label: 'd10 (10 faces)', value: 10 },
  { label: 'd12 (12 faces)', value: 12 },
];

@Component({
  selector: 'app-prospeccao-config',
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
    SelectModule,
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
            <p class="text-sm text-color-secondary m-0">Selecione um jogo para gerenciar Dados de Prospecção.</p>
          </div>
        </div>
      }

      <app-base-config-table
        [titulo]="'Dados de Prospecção'"
        [subtitulo]="'Configure os dados especiais de prospecção — recurso raro concedido pelo Mestre'"
        [labelNovo]="'Novo Dado'"
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
      [header]="editMode() ? 'Editar Dado de Prospecção' : 'Novo Dado de Prospecção'"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      [style]="{ width: '30rem', maxWidth: '95vw' }"
    >
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="flex flex-column gap-4 p-2">

          <div class="flex align-items-center gap-3 p-3 border-round surface-100">
            <i class="pi pi-info-circle text-primary"></i>
            <small class="text-color-secondary">
              Prospecção é um recurso extremamente raro que o Mestre concede.
              O jogador o usa para somar um dado extra em uma jogada de alto risco.
            </small>
          </div>

          <div class="flex flex-column gap-2">
            <label for="nome" class="font-semibold">Nome <span class="text-red-400">*</span></label>
            <input
              pInputText id="nome" formControlName="nome" placeholder="Ex: Prospecção d6"
              [class.ng-invalid]="form.get('nome')?.invalid && form.get('nome')?.touched"
            />
            @if (form.get('nome')?.invalid && form.get('nome')?.touched) {
              <small class="text-red-400">
                @if (form.get('nome')?.errors?.['required']) { Campo obrigatório }
                @if (form.get('nome')?.errors?.['uniqueName']) { Este nome já está em uso }
              </small>
            }
          </div>

          <!-- Tipo de dado -->
          <div class="flex flex-column gap-2">
            <label for="numeroFaces" class="font-semibold">
              Tipo de Dado <span class="text-red-400">*</span>
            </label>
            <p-select
              inputId="numeroFaces"
              formControlName="numeroFaces"
              [options]="facesOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Selecione o dado..."
              [class.ng-invalid]="form.get('numeroFaces')?.invalid && form.get('numeroFaces')?.touched"
            />
            <small class="text-color-secondary">
              Quanto mais faces, mais poderoso. d12 pode somar até 12 a uma jogada.
            </small>
            @if (form.get('numeroFaces')?.invalid && form.get('numeroFaces')?.touched) {
              <small class="text-red-400">Campo obrigatório</small>
            }
          </div>

          <!-- Descrição -->
          <div class="flex flex-column gap-2">
            <label for="descricao" class="font-semibold">Descrição</label>
            <textarea pTextarea id="descricao" formControlName="descricao" [rows]="3" [autoResize]="true"
              placeholder="Regras de uso deste dado de prospecção..."></textarea>
          </div>

          <div class="flex flex-column gap-2">
            <label for="ordemExibicao" class="font-semibold">Ordem de Exibição <span class="text-red-400">*</span></label>
            <p-input-number inputId="ordemExibicao" formControlName="ordemExibicao" [showButtons]="true" [min]="1" />
          </div>

        </div>

        <div class="flex justify-content-end gap-2 mt-5 pt-4 border-top-1 surface-border">
          <p-button label="Cancelar" severity="secondary" [outlined]="true" type="button" (onClick)="closeDrawer()" />
          <p-button [label]="editMode() ? 'Salvar Alterações' : 'Criar Dado'" icon="pi pi-check" type="submit" />
        </div>
      </form>
    </p-dialog>

    <p-confirmDialog />
  `,
})
export class ProspeccaoConfigComponent extends BaseConfigComponent<DadoProspeccaoConfig, ProspeccaoConfigService> {
  protected service = inject(ProspeccaoConfigService);
  private confirmationService = inject(ConfirmationService);
  private configApi = inject(ConfigApiService);

  protected drawerVisible = signal(false);
  protected loading = signal(false);
  protected searchQuery = signal('');

  readonly facesOptions = FACES_OPTIONS;

  readonly columns: ConfigTableColumn[] = [
    { field: 'ordemExibicao', header: 'Ordem', width: '5rem' },
    { field: 'nome',          header: 'Nome' },
    { field: 'numeroFaces',   header: 'Dado', width: '6rem' },
    { field: 'descricao',     header: 'Descrição' },
  ];

  protected filteredItems = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.items();
    return this.items().filter((p) =>
      p.nome?.toLowerCase().includes(q) ||
      String(p.numeroFaces).includes(q) ||
      (p.descricao ?? '').toLowerCase().includes(q),
    );
  });

  protected getEntityName(): string { return 'Dado de Prospecção'; }
  protected getEntityNamePlural(): string { return 'Dados de Prospecção'; }

  protected buildForm(): FormGroup {
    return this.fb.group({
      nome:          ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      numeroFaces:   [null, [Validators.required]],
      descricao:     ['', [Validators.maxLength(500)]],
      ordemExibicao: [1,  [Validators.required, Validators.min(1)]],
    });
  }

  openDrawer(item?: DadoProspeccaoConfig): void {
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

  override openDialog(item?: DadoProspeccaoConfig): void {
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
        this.toastService.success(`Dado de Prospecção ${this.editMode() ? 'atualizado' : 'criado'} com sucesso`, 'Sucesso');
        this.closeDrawer();
        this.loadData();
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  override confirmDelete(id: number): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir este Dado de Prospecção?',
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
    this.configApi.reordenarDadosProspeccao(jogoId, { itens: payload.map((p) => ({ id: p.itemId, ordemExibicao: p.novaOrdem })) })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.toastService.success('Ordem salva com sucesso.', 'Reordenação'),
        error: () => this.toastService.error('Erro ao salvar a ordem.', 'Reordenação'),
      });
  }
}
