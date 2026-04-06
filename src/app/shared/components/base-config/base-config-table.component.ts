import {
  Component,
  input,
  output,
  computed,
  signal,
  InputSignal,
  OutputEmitterRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

/** Definição de coluna para a tabela genérica */
export interface ConfigTableColumn {
  /** Campo do objeto (ex: 'nome', 'abreviacao') */
  field: string;
  /** Cabeçalho exibido (ex: 'Nome', 'Abreviação') */
  header: string;
  /** Largura opcional (ex: '8rem') */
  width?: string;
}

/**
 * BaseConfigTableComponent — Componente de tabela genérico para todas as 13 páginas de config.
 *
 * DUMB component: recebe dados via input() e emite eventos via output().
 * Não faz HTTP, não conhece services — apenas renderiza e emite.
 *
 * Funcionalidades:
 * - Tabela PrimeNG com colunas dinâmicas
 * - Campo de busca integrado (emite onSearch)
 * - Drag-and-drop de reordenação (quando canReorder = true)
 * - Estado vazio com CTA opcional
 * - Skeleton de loading (8 linhas enquanto carrega)
 * - Botão "+ Novo" no cabeçalho
 *
 * Uso:
 * ```html
 * <app-base-config-table
 *   [titulo]="'Atributos'"
 *   [items]="atributos()"
 *   [loading]="loading()"
 *   [columns]="columns"
 *   [canReorder]="true"
 *   (onCreate)="openDialog()"
 *   (onEdit)="openDialog($event)"
 *   (onDelete)="confirmDelete($event)"
 *   (onReorder)="handleReorder($event)"
 *   (onSearch)="filterItems($event)"
 * >
 *   <!-- Slot para colunas extras (opcional) -->
 * </app-base-config-table>
 * ```
 */
@Component({
  selector: 'app-base-config-table',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    SkeletonModule,
    TableModule,
    TagModule,
    TooltipModule,
  ],
  template: `
    <!-- ================================================================
         HEADER: título + botão Novo + busca
    ================================================================ -->
    <div
      class="flex flex-column md:flex-row align-items-start md:align-items-center
             justify-content-between gap-3 mb-4"
    >
      <!-- Título -->
      <div class="flex flex-column gap-1">
        <h2 class="text-2xl font-bold m-0">
          <i class="pi pi-cog text-primary mr-2"></i>
          {{ titulo() }}
        </h2>
        @if (subtitulo()) {
          <p class="text-color-secondary text-sm m-0">{{ subtitulo() }}</p>
        }
      </div>

      <!-- Controles direita: busca + botão novo -->
      <div class="flex align-items-center gap-2 flex-wrap">
        <!-- Campo de busca -->
        <p-icon-field iconPosition="left">
          <p-inputicon class="pi pi-search" />
          <input
            pInputText
            type="text"
            [placeholder]="'Buscar ' + titulo().toLowerCase() + '...'"
            [(ngModel)]="searchTerm"
            (ngModelChange)="onSearchChange($event)"
            class="w-14rem"
          />
        </p-icon-field>

        <!-- Botão Novo -->
        <p-button
          [label]="'+ ' + labelNovo()"
          icon="pi pi-plus"
          (onClick)="onCreate.emit()"
        />
      </div>
    </div>

    <!-- ================================================================
         SKELETON — exibido enquanto loading = true
    ================================================================ -->
    @if (loading()) {
      <div class="flex flex-column gap-2">
        <!-- Cabeçalho fake -->
        <div class="flex gap-3 px-3 py-2">
          @for (col of columns(); track col.field) {
            <p-skeleton height="1.5rem" [style]="{ flex: '1' }" />
          }
          <p-skeleton height="1.5rem" width="6rem" />
        </div>
        <!-- Linhas fake -->
        @for (row of skeletonRows(); track row) {
          <div class="flex gap-3 px-3 py-2 border-round surface-100">
            @for (col of columns(); track col.field) {
              <p-skeleton height="1.25rem" [style]="{ flex: '1' }" />
            }
            <p-skeleton height="1.25rem" width="6rem" />
          </div>
        }
      </div>
    }

    <!-- ================================================================
         TABELA — exibida quando loading = false
    ================================================================ -->
    @if (!loading()) {
      <p-table
        [value]="items()"
        [rowHover]="true"
        [paginator]="items().length > rowsPerPage()"
        [rows]="rowsPerPage()"
        [rowsPerPageOptions]="[5, 10, 25, 50]"
        [reorderableColumns]="false"
        (onRowReorder)="handleRowReorder($event)"
        class="rpg-table"
        responsiveLayout="scroll"
      >
        <!-- ---- CABEÇALHO ---- -->
        <ng-template #header>
          <tr>
            <!-- Coluna drag handle (quando reordenável) -->
            @if (canReorder()) {
              <th style="width: 3rem"></th>
            }

            <!-- Colunas dinâmicas -->
            @for (col of columns(); track col.field) {
              <th [style]="col.width ? 'width: ' + col.width : ''">
                {{ col.header }}
              </th>
            }

            <!-- Coluna de ações (fixa) -->
            <th class="text-center" style="width: 8rem">Ações</th>
          </tr>
        </ng-template>

        <!-- ---- CORPO ---- -->
        <ng-template #body let-item let-index="rowIndex">
          <tr [pReorderableRow]="index">

            <!-- Drag handle -->
            @if (canReorder()) {
              <td>
                <span
                  class="pi pi-bars rpg-drag-handle"
                  pReorderableRowHandle
                  pTooltip="Arrastar para reordenar"
                ></span>
              </td>
            }

            <!-- Colunas dinâmicas -->
            @for (col of columns(); track col.field) {
              <td>
                <!-- Detecta se é campo de sigla/abreviação para estilizar como badge -->
                @if (isAbreviacaoField(col.field)) {
                  <span class="badge-atributo">{{ item[col.field] ?? '—' }}</span>
                } @else if (isBooleanField(col.field, item)) {
                  @if (item[col.field]) {
                    <p-tag severity="warn" value="Sim" icon="pi pi-check" />
                  } @else {
                    <span class="text-color-secondary">—</span>
                  }
                } @else if (isNumericField(col.field, item)) {
                  <span class="valor-numerico--sm">{{ item[col.field] ?? '—' }}</span>
                } @else {
                  <span>{{ item[col.field] ?? '—' }}</span>
                }
              </td>
            }

            <!-- Ações -->
            <td class="text-center">
              <div class="flex gap-1 justify-content-center">
                <p-button
                  icon="pi pi-pencil"
                  [rounded]="true"
                  [text]="true"
                  severity="secondary"
                  (onClick)="onEdit.emit(item)"
                  pTooltip="Editar"
                  tooltipPosition="top"
                />
                <p-button
                  icon="pi pi-trash"
                  [rounded]="true"
                  [text]="true"
                  severity="danger"
                  (onClick)="onDelete.emit(item)"
                  pTooltip="Excluir"
                  tooltipPosition="top"
                />
              </div>
            </td>
          </tr>
        </ng-template>

        <!-- ---- ESTADO VAZIO ---- -->
        <ng-template #emptymessage>
          <tr>
            <td [attr.colspan]="emptyColspan()" class="p-0">
              <div class="rpg-empty-state">
                <i class="pi pi-inbox rpg-empty-state__icon"></i>
                <p class="rpg-empty-state__title">
                  Nenhum(a) {{ titulo().toLowerCase() }} cadastrado(a)
                </p>
                <p class="rpg-empty-state__subtitle">
                  Clique em "+ {{ labelNovo() }}" para criar o primeiro registro.
                </p>
                <p-button
                  [label]="'+ ' + labelNovo()"
                  icon="pi pi-plus"
                  size="small"
                  (onClick)="onCreate.emit()"
                />
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    }
  `,
})
export class BaseConfigTableComponent {
  // ----------------------------------------------------------------
  // Inputs
  // ----------------------------------------------------------------

  /** Nome da seção (ex: "Atributos") */
  titulo: InputSignal<string> = input.required<string>();

  /** Subtítulo/descrição opcional exibido abaixo do título */
  subtitulo: InputSignal<string> = input<string>('');

  /** Label do botão "+ Novo" (padrão = titulo sem "s" final) */
  labelNovo: InputSignal<string> = input<string>('Novo');

  /** Lista de itens a exibir na tabela */
  items: InputSignal<any[]> = input.required<any[]>();

  /** Exibe skeleton quando true */
  loading: InputSignal<boolean> = input<boolean>(false);

  /** Definição das colunas dinâmicas */
  columns: InputSignal<ConfigTableColumn[]> = input.required<ConfigTableColumn[]>();

  /** Habilita drag-and-drop para reordenação de linhas */
  canReorder: InputSignal<boolean> = input<boolean>(false);

  /** Quantidade de linhas por página */
  rowsPerPage: InputSignal<number> = input<number>(10);

  // ----------------------------------------------------------------
  // Outputs
  // ----------------------------------------------------------------

  /** Clique em "+ Novo" */
  onCreate: OutputEmitterRef<void> = output<void>();

  /** Clique em editar — emite o item completo */
  onEdit: OutputEmitterRef<any> = output<any>();

  /** Clique em excluir — emite o item completo */
  onDelete: OutputEmitterRef<any> = output<any>();

  /**
   * Reordenação concluída — emite array com nova ordem.
   * Cada elemento: { itemId: number, novaOrdem: number }
   */
  onReorder: OutputEmitterRef<{ itemId: number; novaOrdem: number }[]> =
    output<{ itemId: number; novaOrdem: number }[]>();

  /** Texto de busca alterado */
  onSearch: OutputEmitterRef<string> = output<string>();

  // ----------------------------------------------------------------
  // Estado interno
  // ----------------------------------------------------------------

  protected searchTerm = signal('');

  /** Linha de skeleton: array fixo de 8 elementos para @for */
  protected skeletonRows = computed(() => Array.from({ length: 8 }, (_, i) => i));

  /** Colspan da mensagem de vazio (colunas + ações + handle opcional) */
  protected emptyColspan = computed(
    () => this.columns().length + 1 + (this.canReorder() ? 1 : 0),
  );

  // ----------------------------------------------------------------
  // Handlers
  // ----------------------------------------------------------------

  protected onSearchChange(term: string): void {
    this.onSearch.emit(term);
  }

  /** Converte o evento nativo do p-table rowReorder para o formato do output */
  protected handleRowReorder(event: { dragIndex?: number; dropIndex?: number }): void {
    if (event.dragIndex == null || event.dropIndex == null) return;
    const reordered = [...this.items()];
    const moved = reordered.splice(event.dragIndex, 1)[0];
    reordered.splice(event.dropIndex, 0, moved);

    const payload: { itemId: number; novaOrdem: number }[] = reordered
      .filter((item) => item?.id != null)
      .map((item, index) => ({ itemId: item.id as number, novaOrdem: index + 1 }));

    this.onReorder.emit(payload);
  }

  // ----------------------------------------------------------------
  // Helpers para renderização condicional de colunas
  // ----------------------------------------------------------------

  /** Campos que devem ser renderizados como badge de atributo */
  protected isAbreviacaoField(field: string): boolean {
    return ['abreviacao', 'sigla', 'codigo'].includes(field);
  }

  /** Campos que devem ser renderizados como valor booleano com p-tag */
  protected isBooleanField(field: string, item: any): boolean {
    const booleanFields = [
      'permitirRenascimento',
      'ativo',
      'visivel',
      'publico',
      'isNpc',
    ];
    return booleanFields.includes(field) && typeof item?.[field] === 'boolean';
  }

  /** Campos que devem ser renderizados como valor numérico */
  protected isNumericField(field: string, item: any): boolean {
    const numericFields = [
      'ordemExibicao',
      'nivel',
      'valorMinimo',
      'valorMaximo',
      'nivelMaximo',
      'numeroFaces',
      'porcentagemVida',
      'xpNecessaria',
      'pontosAtributo',
      'pontosAptidao',
      'limitadorAtributo',
      'pontosGanhos',
    ];
    return numericFields.includes(field) && typeof item?.[field] === 'number';
  }
}
