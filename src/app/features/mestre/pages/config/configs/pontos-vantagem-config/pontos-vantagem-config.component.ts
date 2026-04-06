import { Component, computed, inject, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DrawerModule } from 'primeng/drawer';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

import { BaseConfigComponent } from '@shared/components/base-config/base-config.component';
import {
  BaseConfigTableComponent,
  ConfigTableColumn,
} from '@shared/components/base-config/base-config-table.component';
import { PontosVantagemConfig } from '@core/models/config.models';
import { PontosVantagemConfigService } from '@core/services/business/config';

@Component({
  selector: 'app-pontos-vantagem-config',
  standalone: true,
  changeDetection: 0, // OnPush
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    ConfirmDialogModule,
    DrawerModule,
    InputNumberModule,
    MessageModule,
    TagModule,
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
              Selecione um jogo no cabeçalho para gerenciar Pontos de Vantagem.
            </p>
          </div>
        </div>
      }

      @if (lacunasNaSequencia().length > 0) {
        <p-message
          severity="warn"
          [text]="'Faltam os níveis: ' + lacunasNaSequencia().join(', ') + '. Personagens com XP suficiente pulam diretamente.'"
          styleClass="mb-3 w-full"
        />
      }

      <div class="text-sm text-color-secondary mb-3 p-3 surface-50 border-round">
        <i class="pi pi-info-circle mr-2"></i>
        Níveis sem registro ganham 0 pontos de vantagem. Apenas os níveis aqui cadastrados concedem pontos.
      </div>

      <app-base-config-table
        [titulo]="'Pontos de Vantagem por Nível'"
        [subtitulo]="'Configure quantos pontos de vantagem os personagens ganham ao atingir cada nível'"
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
      >
        <ng-template #customCell let-item let-col="col">
          @if (col.field === 'pontosGanhos') {
            @if (item.pontosGanhos >= 2) {
              <p-tag
                severity="warn"
                [value]="item.pontosGanhos.toString()"
                icon="pi pi-star"
                [pTooltip]="'Marco especial: ' + item.pontosGanhos + ' pontos'"
              />
            } @else {
              <span>{{ item.pontosGanhos }}</span>
            }
          }
          @if (col.field === 'acumulado') {
            <span class="font-semibold text-primary">{{ acumuladoPorNivel().get(item.nivel) ?? 0 }}</span>
          }
        </ng-template>
      </app-base-config-table>

    </p-card>

    <!-- DRAWER -->
    <p-drawer
      [visible]="drawerVisible()"
      (visibleChange)="onDrawerVisibleChange($event)"
      [header]="editMode() ? 'Editar Configuração' : 'Novo Nível com Pontos'"
      position="right"
      class="w-full md:w-30rem"
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
              [min]="1"
              [max]="35"
            />
            <small class="text-color-secondary">Nível em que os pontos são concedidos (1 a 35). Cada nível pode ter apenas um registro.</small>
            @if (form.get('nivel')?.invalid && form.get('nivel')?.touched) {
              <small class="text-red-400">Nível é obrigatório (1–35).</small>
            }
          </div>

          <!-- Pontos Ganhos -->
          <div class="flex flex-column gap-2">
            <label for="pontosGanhos" class="font-semibold">
              Pontos Ganhos <span class="text-red-400">*</span>
            </label>
            <p-input-number
              inputId="pontosGanhos"
              formControlName="pontosGanhos"
              [showButtons]="true"
              [min]="0"
            />
            <small class="text-color-secondary">Pontos de vantagem concedidos ao atingir este nível.</small>
            @if (form.get('pontosGanhos')?.invalid && form.get('pontosGanhos')?.touched) {
              <small class="text-red-400">Pontos ganhos é obrigatório (mínimo 0).</small>
            }
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
            [label]="editMode() ? 'Salvar Alterações' : 'Criar Configuração'"
            icon="pi pi-check"
            type="submit"
          />
        </div>
      </form>
    </p-drawer>

    <p-confirmDialog />
  `,
})
export class PontosVantagemConfigComponent extends BaseConfigComponent<
  PontosVantagemConfig,
  PontosVantagemConfigService
> {
  protected service = inject(PontosVantagemConfigService);
  private confirmationService = inject(ConfirmationService);

  protected drawerVisible = signal(false);
  protected loading = signal(false);
  protected searchQuery = signal('');

  readonly columns: ConfigTableColumn[] = [
    { field: 'nivel',        header: 'Nível',         width: '8rem' },
    { field: 'pontosGanhos', header: 'Pontos Ganhos',  width: '10rem' },
    { field: 'acumulado',    header: 'Acumulado',      width: '10rem' },
  ];

  /** Filtra e ordena por nível */
  protected filteredItems = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.items().slice().sort((a, b) => a.nivel - b.nivel);
    return this.items()
      .filter((n) => String(n.nivel).includes(q))
      .sort((a, b) => a.nivel - b.nivel);
  });

  /** Mapa nível -> total acumulado de pontos de vantagem */
  protected acumuladoPorNivel = computed(() => {
    const sorted = [...this.items()].sort((a, b) => a.nivel - b.nivel);
    let acumulado = 0;
    const mapa = new Map<number, number>();
    for (const item of sorted) {
      acumulado += item.pontosGanhos;
      mapa.set(item.nivel, acumulado);
    }
    return mapa;
  });

  /** Detecta lacunas na sequência de níveis cadastrados */
  protected lacunasNaSequencia = computed(() => {
    const niveis = new Set(this.items().map(n => n.nivel));
    if (niveis.size < 2) return [];
    const lacunas: number[] = [];
    const min = Math.min(...niveis);
    const max = Math.max(...niveis);
    for (let i = min + 1; i < max; i++) {
      if (!niveis.has(i)) lacunas.push(i);
    }
    return lacunas;
  });

  protected getEntityName(): string { return 'Configuração de Pontos'; }
  protected getEntityNamePlural(): string { return 'Configurações de Pontos de Vantagem'; }

  protected buildForm(): FormGroup {
    return this.fb.group({
      nivel:        [1,  [Validators.required, Validators.min(1), Validators.max(35)]],
      pontosGanhos: [1,  [Validators.required, Validators.min(0)]],
    });
  }

  openDrawer(item?: PontosVantagemConfig): void {
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
        const action = this.editMode() ? 'atualizada' : 'criada';
        this.toastService.success(`Configuração ${action} com sucesso`, 'Sucesso');
        this.closeDrawer();
        this.loadData();
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  override confirmDelete(id: number): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir esta configuração de pontos? Fichas já criadas não são afetadas.',
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.delete(id),
    });
  }
}
