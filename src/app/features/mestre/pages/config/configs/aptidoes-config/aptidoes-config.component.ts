import { Component, computed, inject, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';

import { BaseConfigComponent } from '@shared/components/base-config/base-config.component';
import {
  BaseConfigTableComponent,
  ConfigTableColumn,
} from '@shared/components/base-config/base-config-table.component';
import { AptidaoConfig, TipoAptidao } from '@core/models';
import { AptidaoConfigService } from '@core/services/business/config';
import { ConfigApiService } from '@core/services/api/config-api.service';
import { uniqueNameValidator } from '@shared/validators/config-validators';

@Component({
  selector: 'app-aptidoes-config',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    CardModule,
    CheckboxModule,
    ConfirmDialogModule,
    DialogModule,
    InputNumberModule,
    InputTextModule,
    MessageModule,
    SelectModule,
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
              Selecione um jogo no cabeçalho para gerenciar Aptidões.
            </p>
          </div>
        </div>
      }

      @if (tiposAptidao().length === 0) {
        <p-message severity="warn" styleClass="mb-3 w-full">
          <span>
            Para criar aptidões, configure ao menos um
            <a routerLink="/mestre/config/tipos-aptidao" class="text-primary font-semibold">
              Tipo de Aptidão
            </a>
            primeiro.
          </span>
        </p-message>
      }

      <app-base-config-table
        [titulo]="'Aptidões'"
        [subtitulo]="'Configure as aptidões/habilidades do sistema (Furtividade, Diplomacia, etc.)'"
        [labelNovo]="'Nova Aptidão'"
        [items]="filteredItems()"
        [loading]="loading()"
        [columns]="columns"
        [canReorder]="true"
        [rowsPerPage]="15"
        (onCreate)="openDrawer()"
        (onEdit)="openDrawer($event)"
        (onDelete)="confirmDelete($event.id!)"
        (onReorder)="handleReorder($event)"
        (onSearch)="searchQuery.set($event)"
      />

    </p-card>

    <!-- DIALOG -->
    <p-dialog
      [visible]="drawerVisible()"
      (visibleChange)="onDrawerVisibleChange($event)"
      [header]="editMode() ? 'Editar Aptidão' : 'Nova Aptidão'"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      [style]="{ width: '38rem', maxWidth: '95vw' }"
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
              placeholder="Ex: Furtividade"
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

          <!-- Tipo de Aptidão -->
          <div class="flex flex-column gap-2">
            <label for="tipoAptidaoId" class="font-semibold">
              Tipo de Aptidão <span class="text-red-400">*</span>
            </label>
            <p-select
              inputId="tipoAptidaoId"
              formControlName="tipoAptidaoId"
              [options]="tiposAptidao()"
              optionLabel="nome"
              optionValue="id"
              placeholder="Selecione o tipo..."
              [class.ng-invalid]="form.get('tipoAptidaoId')?.invalid && form.get('tipoAptidaoId')?.touched"
            />
            @if (form.get('tipoAptidaoId')?.invalid && form.get('tipoAptidaoId')?.touched) {
              <small class="text-red-400">Campo obrigatório</small>
            }
          </div>

          <!-- Sigla -->
          <div class="flex flex-column gap-2">
            <label for="sigla" class="font-semibold">Sigla</label>
            <input
              pInputText
              id="sigla"
              formControlName="sigla"
              placeholder="Ex: FUR"
              style="text-transform: uppercase; font-family: var(--rpg-font-mono); font-weight: 700;"
            />
            <small class="text-color-secondary">Opcional. 2 a 5 caracteres maiúsculos.</small>
          </div>

          <!-- Descrição -->
          <div class="flex flex-column gap-2">
            <label for="descricao" class="font-semibold">Descrição</label>
            <textarea
              pTextarea
              id="descricao"
              formControlName="descricao"
              [rows]="3"
              placeholder="Descreva a aptidão e seu papel no sistema..."
              [autoResize]="true"
            ></textarea>
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

        <div class="flex justify-content-end gap-2 mt-5 pt-4 border-top-1 surface-border">
          <p-button
            label="Cancelar"
            severity="secondary"
            [outlined]="true"
            type="button"
            (onClick)="closeDrawer()"
          />
          <p-button
            [label]="editMode() ? 'Salvar Alterações' : 'Criar Aptidão'"
            icon="pi pi-check"
            type="submit"
            [disabled]="tiposAptidao().length === 0"
            [pTooltip]="tiposAptidao().length === 0 ? 'Configure ao menos um Tipo de Aptidão primeiro' : ''"
            tooltipPosition="top"
          />
        </div>
      </form>
    </p-dialog>

    <p-confirmDialog />
  `,
})
export class AptidoesConfigComponent extends BaseConfigComponent<
  AptidaoConfig,
  AptidaoConfigService
> {
  protected service = inject(AptidaoConfigService);
  private confirmationService = inject(ConfirmationService);
  private configApi = inject(ConfigApiService);

  protected drawerVisible = signal(false);
  protected loading = signal(false);
  protected searchQuery = signal('');
  tiposAptidao = signal<TipoAptidao[]>([]);

  readonly columns: ConfigTableColumn[] = [
    { field: 'ordemExibicao', header: 'Ordem', width: '5rem' },
    { field: 'nome',          header: 'Nome' },
    { field: 'tipoNome',      header: 'Tipo', width: '10rem' },
    { field: 'descricao',     header: 'Descrição' },
  ];

  protected filteredItems = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.items();
    return this.items().filter(
      (a) =>
        a.nome?.toLowerCase().includes(q) ||
        (a.descricao ?? '').toLowerCase().includes(q),
    );
  });

  protected getEntityName(): string { return 'Aptidão'; }
  protected getEntityNamePlural(): string { return 'Aptidões'; }

  protected buildForm(): FormGroup {
    return this.fb.group({
      nome:          ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      tipoAptidaoId: [null, [Validators.required]],
      sigla:         ['', [Validators.maxLength(5)]],
      descricao:     ['', [Validators.maxLength(500)]],
      ordemExibicao: [1,  [Validators.required, Validators.min(1)]],
      ativo:         [true],
    });
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.loadTiposAptidao();
  }

  private loadTiposAptidao(): void {
    const jogoId = this.service.currentGameId();
    if (!jogoId) return;
    this.configApi.listTiposAptidao(jogoId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (tipos) => this.tiposAptidao.set(tipos) });
  }

  openDrawer(item?: AptidaoConfig): void {
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

  override openDialog(item?: AptidaoConfig): void {
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
        const action = this.editMode() ? 'atualizada' : 'criada';
        this.toastService.success(`Aptidão ${action} com sucesso`, 'Sucesso');
        this.closeDrawer();
        this.loadData();
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  override confirmDelete(id: number): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir esta Aptidão? Esta ação não pode ser desfeita.',
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, excluir',
      rejectLabel: 'Cancelar',
      acceptButtonProps: { severity: 'danger' },
      accept: () => this.delete(id),
    });
  }

  protected handleReorder(payload: { itemId: number; novaOrdem: number }[]): void {
    const jogoId = this.currentGameId();
    if (!jogoId || payload.length === 0) return;
    this.configApi.reordenarAptidoes(jogoId, { itens: payload.map((p) => ({ id: p.itemId, ordemExibicao: p.novaOrdem })) })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.toastService.success('Ordem salva com sucesso.', 'Reordenação'),
        error: () => this.toastService.error('Erro ao salvar a ordem.', 'Reordenação'),
      });
  }
}
