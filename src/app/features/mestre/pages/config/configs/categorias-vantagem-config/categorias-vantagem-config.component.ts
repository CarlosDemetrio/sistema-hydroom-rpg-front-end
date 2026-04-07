import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ColorPickerModule } from 'primeng/colorpicker';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';

import { BaseConfigComponent } from '@shared/components/base-config/base-config.component';
import {
  BaseConfigTableComponent,
  ConfigTableColumn,
} from '@shared/components/base-config/base-config-table.component';
import { CategoriaVantagem } from '@core/models/config.models';
import { CategoriaVantagemConfigService } from '@core/services/business/config';
import { ConfigStore } from '@core/stores/config.store';

@Component({
  selector: 'app-categorias-vantagem-config',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    SlicePipe,
    ButtonModule,
    CardModule,
    ColorPickerModule,
    ConfirmDialogModule,
    DialogModule,
    InputNumberModule,
    InputTextModule,
    TagModule,
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
              Selecione um jogo no cabeçalho para gerenciar Categorias de Vantagem.
            </p>
          </div>
        </div>
      }

      <app-base-config-table
        [titulo]="'Categorias de Vantagem'"
        [subtitulo]="'Agrupe vantagens por tema: Combate, Magia, Social, etc.'"
        [labelNovo]="'Nova Categoria'"
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
          @if (col.field === 'cor') {
            @if (item.cor) {
              <span
                class="inline-flex align-items-center gap-2 px-3 py-1 border-round text-sm font-semibold"
                [style.background-color]="item.cor"
                [style.color]="getContrastColor(item.cor)"
              >
                {{ item.nome }}
              </span>
            } @else {
              <span class="text-color-secondary text-sm">Sem cor</span>
            }
          }
          @if (col.field === 'descricao') {
            <span
              [pTooltip]="item.descricao ?? ''"
              tooltipPosition="top"
              [class.text-color-secondary]="!item.descricao"
            >
              {{ item.descricao ? (item.descricao.length > 60 ? (item.descricao | slice:0:60) + '...' : item.descricao) : '—' }}
            </span>
          }
          @if (col.field === 'vantagensCount') {
            <span class="font-semibold">{{ vantagensCount().get(item.id) ?? 0 }}</span>
          }
        </ng-template>
      </app-base-config-table>

    </p-card>

    <!-- DIALOG -->
    <p-dialog
      [visible]="drawerVisible()"
      (visibleChange)="onDrawerVisibleChange($event)"
      [header]="editMode() ? 'Editar Categoria' : 'Nova Categoria de Vantagem'"
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
              placeholder="Ex.: Combate, Magia, Social..."
              maxlength="100"
            />
            @if (form.get('nome')?.invalid && form.get('nome')?.touched) {
              <small class="text-red-400">Nome é obrigatório.</small>
            }
          </div>

          <!-- Descrição -->
          <div class="flex flex-column gap-2">
            <label for="descricao" class="font-semibold">Descrição</label>
            <textarea
              pTextarea
              id="descricao"
              formControlName="descricao"
              placeholder="Descrição opcional da categoria..."
              rows="3"
            ></textarea>
          </div>

          <!-- Cor -->
          <div class="flex flex-column gap-2">
            <label class="font-semibold">Cor da Categoria</label>
            <div class="flex align-items-center gap-3">
              <p-colorPicker
                formControlName="cor"
                [inline]="false"
                format="hex"
                (onChange)="onColorChange($event.value)"
              />
              <input
                pInputText
                [value]="corValue()"
                (input)="onColorHexInput($any($event.target).value)"
                placeholder="#6c757d"
                maxlength="7"
                class="flex-1"
              />
            </div>
            @if (form.get('cor')?.errors?.['pattern']) {
              <small class="text-red-400">Formato inválido. Use #RRGGBB (ex.: #FF5500).</small>
            }
            <!-- Preview do chip -->
            <div class="flex align-items-center gap-2 mt-2">
              <span
                class="inline-flex align-items-center gap-2 px-3 py-1 border-round text-sm font-semibold"
                [style.background-color]="corValue()"
                [style.color]="getContrastColor(corValue())"
              >
                {{ form.get('nome')?.value || 'Preview' }}
              </span>
              <small class="text-color-secondary">Preview do chip</small>
            </div>
          </div>

          <!-- Ordem de exibição -->
          <div class="flex flex-column gap-2">
            <label for="ordemExibicao" class="font-semibold">Ordem de Exibição</label>
            <p-input-number
              inputId="ordemExibicao"
              formControlName="ordemExibicao"
              [showButtons]="true"
              [min]="0"
            />
            <small class="text-color-secondary">Define a posição desta categoria na listagem.</small>
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
            [label]="editMode() ? 'Salvar Alterações' : 'Criar Categoria'"
            icon="pi pi-check"
            type="submit"
          />
        </div>
      </form>
    </p-dialog>

    <p-confirmDialog />
  `,
})
export class CategoriaVantagemConfigComponent extends BaseConfigComponent<
  CategoriaVantagem,
  CategoriaVantagemConfigService
> {
  protected service = inject(CategoriaVantagemConfigService);
  private confirmationService = inject(ConfirmationService);
  private configStore = inject(ConfigStore);

  protected drawerVisible = signal(false);
  protected loading = signal(false);
  protected searchQuery = signal('');

  /** Cor selecionada pelo color picker — sincronizada com o formulário */
  protected corValue = signal<string>('#6c757d');

  readonly columns: ConfigTableColumn[] = [
    { field: 'nome',          header: 'Nome',          width: '14rem' },
    { field: 'cor',           header: 'Chip',          width: '12rem' },
    { field: 'descricao',     header: 'Descrição',     width: '16rem' },
    { field: 'ordemExibicao', header: 'Ordem',         width: '6rem' },
    { field: 'vantagensCount', header: 'Vantagens',    width: '8rem' },
  ];

  protected filteredItems = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.items().slice().sort((a, b) => a.ordemExibicao - b.ordemExibicao);
    return this.items()
      .filter((c) => c.nome.toLowerCase().includes(q))
      .sort((a, b) => a.ordemExibicao - b.ordemExibicao);
  });

  /** Mapa categoriaId -> quantidade de vantagens vinculadas */
  protected vantagensCount = computed(() => {
    const mapa = new Map<number, number>();
    for (const v of this.configStore.vantagens()) {
      const catId = (v as any).categoriaVantagemId as number | undefined;
      if (catId) {
        mapa.set(catId, (mapa.get(catId) ?? 0) + 1);
      }
    }
    return mapa;
  });

  protected getEntityName(): string { return 'Categoria de Vantagem'; }
  protected getEntityNamePlural(): string { return 'Categorias de Vantagem'; }

  protected buildForm(): FormGroup {
    return this.fb.group({
      nome:           ['', [Validators.required, Validators.maxLength(100)]],
      descricao:      [''],
      cor:            ['#6c757d', [Validators.pattern(/^#[0-9A-Fa-f]{6}$/)]],
      ordemExibicao:  [0,  [Validators.min(0)]],
    });
  }

  openDrawer(item?: CategoriaVantagem): void {
    this.openDialog(item);
    if (item?.cor) {
      this.corValue.set(item.cor);
    } else {
      this.corValue.set('#6c757d');
    }
    this.drawerVisible.set(true);
  }

  closeDrawer(): void {
    this.drawerVisible.set(false);
    this.closeDialog();
    this.corValue.set('#6c757d');
  }

  protected onDrawerVisibleChange(visible: boolean): void {
    if (!visible) this.closeDrawer();
  }

  /** Callback do p-colorpicker (retorna hex sem # em alguns modos) */
  protected onColorChange(value: string | object | null | undefined): void {
    if (!value || typeof value !== 'string') return;
    const normalized = value.startsWith('#') ? value : `#${value}`;
    this.corValue.set(normalized);
    this.form.patchValue({ cor: normalized });
  }

  /** Callback do input de hex manual */
  protected onColorHexInput(value: string): void {
    const normalized = value.startsWith('#') ? value : `#${value}`;
    this.corValue.set(normalized);
    this.form.patchValue({ cor: normalized });
  }

  /**
   * Retorna #000 ou #fff baseado na luminosidade da cor de fundo.
   * Fórmula: (R*299 + G*587 + B*114) / 1000 > 128 ? '#000' : '#fff'
   */
  protected getContrastColor(hex: string): string {
    if (!hex || !hex.startsWith('#') || hex.length < 7) return '#fff';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (r * 299 + g * 587 + b * 114) / 1000;
    return luminance > 128 ? '#000' : '#fff';
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
        this.toastService.success(`Categoria ${action} com sucesso`, 'Sucesso');
        this.closeDrawer();
        this.loadData();
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  override confirmDelete(id: number): void {
    const cat = this.items().find(c => c.id === id);
    const qtdVantagens = cat ? (this.vantagensCount().get(cat.id) ?? 0) : 0;

    const message = qtdVantagens > 0
      ? `${qtdVantagens} vantagen(s) perderão a categoria ao excluir. Deseja continuar?`
      : 'Tem certeza que deseja excluir esta Categoria de Vantagem?';

    this.confirmationService.confirm({
      message,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.delete(id),
    });
  }
}
