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
import { TooltipModule } from 'primeng/tooltip';

import { BaseConfigComponent } from '@shared/components/base-config/base-config.component';
import {
  BaseConfigTableComponent,
  ConfigTableColumn,
} from '@shared/components/base-config/base-config-table.component';
import { MembroCorpoConfig } from '@core/models';
import { MembroCorpoConfigService } from '@core/services/business/config';
import { ConfigApiService } from '@core/services/api/config-api.service';
import { uniqueNameValidator } from '@shared/validators/config-validators';

/** Formata porcentagem como "75%" */
function formatPorcentagem(v: number | null): string {
  if (v == null) return '—';
  return `${Math.round(v * 100)}%`;
}

@Component({
  selector: 'app-membros-corpo-config',
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
            <p class="text-sm text-color-secondary m-0">Selecione um jogo para gerenciar Membros do Corpo.</p>
          </div>
        </div>
      }

      <app-base-config-table
        [titulo]="'Membros do Corpo'"
        [subtitulo]="'Configure os membros corporais e sua proporção de vida (Cabeça, Tronco, Braços, etc.)'"
        [labelNovo]="'Novo Membro'"
        [items]="filteredItemsFormatted()"
        [loading]="loading()"
        [columns]="columns"
        [canReorder]="true"
        [rowsPerPage]="10"
        (onCreate)="openDrawer()"
        (onEdit)="openDrawerByFormatted($event)"
        (onDelete)="confirmDelete($event.id!)"
        (onReorder)="handleReorder($event)"
        (onSearch)="searchQuery.set($event)"
      />

    </p-card>

    <p-drawer
      [visible]="drawerVisible()"
      (visibleChange)="onDrawerVisibleChange($event)"
      [header]="editMode() ? 'Editar Membro' : 'Novo Membro do Corpo'"
      position="right"
      class="w-full md:w-30rem"
    >
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="flex flex-column gap-4 p-2">

          <div class="flex flex-column gap-2">
            <label for="nome" class="font-semibold">Nome <span class="text-red-400">*</span></label>
            <input
              pInputText id="nome" formControlName="nome" placeholder="Ex: Cabeça"
              [class.ng-invalid]="form.get('nome')?.invalid && form.get('nome')?.touched"
            />
            @if (form.get('nome')?.invalid && form.get('nome')?.touched) {
              <small class="text-red-400">
                @if (form.get('nome')?.errors?.['required']) { Campo obrigatório }
                @if (form.get('nome')?.errors?.['uniqueName']) { Este nome já está em uso }
              </small>
            }
          </div>

          <!-- Porcentagem de Vida -->
          <div class="flex flex-column gap-2">
            <label for="porcentagemVida" class="font-semibold">
              Porcentagem de Vida <span class="text-red-400">*</span>
            </label>
            <p-input-number
              inputId="porcentagemVida"
              formControlName="porcentagemVida"
              [showButtons]="true"
              [min]="1"
              [max]="100"
              suffix="%"
            />
            <small class="text-color-secondary">
              Percentual da vida total que este membro aguenta.
              Ex: Cabeça = 75%, Tronco = 100%, Sangue = 100%.
            </small>
            @if (form.get('porcentagemVida')?.invalid && form.get('porcentagemVida')?.touched) {
              <small class="text-red-400">
                @if (form.get('porcentagemVida')?.errors?.['required']) { Campo obrigatório }
                @if (form.get('porcentagemVida')?.errors?.['min']) { Mínimo 1% }
                @if (form.get('porcentagemVida')?.errors?.['max']) { Máximo 100% }
              </small>
            }
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
          <p-button [label]="editMode() ? 'Salvar Alterações' : 'Criar Membro'" icon="pi pi-check" type="submit" />
        </div>
      </form>
    </p-drawer>

    <p-confirmDialog />
  `,
})
export class MembrosCorpoConfigComponent extends BaseConfigComponent<MembroCorpoConfig, MembroCorpoConfigService> {
  protected service = inject(MembroCorpoConfigService);
  private confirmationService = inject(ConfirmationService);
  private configApi = inject(ConfigApiService);

  protected drawerVisible = signal(false);
  protected loading = signal(false);
  protected searchQuery = signal('');

  readonly columns: ConfigTableColumn[] = [
    { field: 'ordemExibicao',      header: 'Ordem', width: '5rem' },
    { field: 'nome',               header: 'Nome' },
    { field: 'porcentagemFormatada', header: '% Vida', width: '8rem' },
  ];

  /** Items com porcentagem formatada para exibição na tabela */
  protected filteredItemsFormatted = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const mapped = this.items().map((m) => ({
      ...m,
      porcentagemFormatada: formatPorcentagem(m.porcentagemVida),
    }));
    if (!q) return mapped;
    return mapped.filter((m) => m.nome?.toLowerCase().includes(q));
  });

  protected getEntityName(): string { return 'Membro do Corpo'; }
  protected getEntityNamePlural(): string { return 'Membros do Corpo'; }

  protected buildForm(): FormGroup {
    return this.fb.group({
      nome:              ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      porcentagemVida:   [75, [Validators.required, Validators.min(1), Validators.max(100)]],
      ordemExibicao:     [1,  [Validators.required, Validators.min(1)]],
      ativo:             [true],
    });
  }

  openDrawer(item?: MembroCorpoConfig): void {
    if (item) {
      // Converte 0-1 para 0-100 ao abrir para edição
      const pct = item.porcentagemVida != null ? Math.round(item.porcentagemVida * 100) : 75;
      this.openDialog({ ...item, porcentagemVida: pct } as any);
    } else {
      this.openDialog();
    }
    this.drawerVisible.set(true);
  }

  /** Chamado quando o item vem da tabela formatada (tem porcentagemFormatada extra) */
  openDrawerByFormatted(item: any): void {
    const original = this.items().find((m) => m.id === item.id);
    if (original) this.openDrawer(original);
  }

  closeDrawer(): void {
    this.drawerVisible.set(false);
    this.closeDialog();
  }

  protected onDrawerVisibleChange(visible: boolean): void {
    if (!visible) this.closeDrawer();
  }

  override openDialog(item?: any): void {
    super.openDialog(item);
    const ctrl = this.form.get('nome');
    if (ctrl) {
      const originalItem = item?.id ? this.items().find((m) => m.id === item.id) : undefined;
      ctrl.setValidators([Validators.required, Validators.minLength(2), Validators.maxLength(50), uniqueNameValidator(this.items(), originalItem?.id ?? null)]);
      ctrl.updateValueAndValidity();
    }
  }

  override save(): void {
    if (this.form.invalid) { super.save(); return; }
    // Converte 0-100 de volta para 0-1 antes de enviar
    const raw = this.form.value;
    const data = { ...raw, porcentagemVida: raw.porcentagemVida / 100 };
    const op$ = this.editMode() ? this.service.updateItem(this.currentEditId()!, data) : this.service.createItem(data);
    this.loading.set(true);
    op$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.toastService.success(`Membro ${this.editMode() ? 'atualizado' : 'criado'} com sucesso`, 'Sucesso');
        this.closeDrawer();
        this.loadData();
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  override confirmDelete(id: number): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir este Membro do Corpo?',
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
    this.configApi.reordenarMembrosCorpo(jogoId, { itens: payload.map((p) => ({ id: p.itemId, ordemExibicao: p.novaOrdem })) })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.toastService.success('Ordem salva com sucesso.', 'Reordenação'),
        error: () => this.toastService.error('Erro ao salvar a ordem.', 'Reordenação'),
      });
  }
}
