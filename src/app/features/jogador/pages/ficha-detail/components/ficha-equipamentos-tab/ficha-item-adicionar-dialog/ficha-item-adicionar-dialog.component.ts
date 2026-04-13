import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageModule } from 'primeng/message';
import { ConfigApiService } from '@core/services/api/config-api.service';
import {
  ItemConfigResumo,
  PageResponse,
} from '@core/models/item-config.model';
import { RaridadeItemConfig } from '@core/models/raridade-item-config.model';
import {
  AdicionarFichaItemRequest,
  AdicionarFichaItemCustomizadoRequest,
} from '@core/models/ficha-item.model';
import { CATEGORIA_LABELS } from '@core/models/tipo-item-config.model';

interface SelectOption {
  label: string;
  value: unknown;
}

/**
 * FichaItemAdicionarDialogComponent — Componente SEMI-SMART.
 *
 * Carrega o catalogo de itens do jogo via ConfigApiService.
 * Emite `adicionarItem` ou `adicionarCustomizado` para o componente pai executar.
 *
 * Regras de permissao:
 * - Jogador: so pode adicionar itens em que raridade.podeJogadorAdicionar === true.
 *   Demais itens exibem icone de cadeado.
 * - Mestre: pode adicionar qualquer item. Acesso ao campo "Forcar adicao".
 *   Pode tambem adicionar item customizado.
 */
@Component({
  selector: 'app-ficha-item-adicionar-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    FormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    TableModule,
    TagModule,
    TooltipModule,
    SkeletonModule,
    MessageModule,
  ],
  template: `
    <p-dialog
      header="Adicionar Item ao Inventario"
      [visible]="visivel()"
      (visibleChange)="visivel.set($event)"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      [style]="{ width: 'min(700px, 100vw)' }"
      [contentStyle]="{ 'padding-top': '0.5rem' }"
    >
      <div class="flex flex-col gap-3">

        <!-- Busca e filtros -->
        <div class="flex flex-col gap-2">
          <input
            pInputText
            type="text"
            [ngModel]="filtroNome()"
            (ngModelChange)="filtroNome.set($event)"
            placeholder="Buscar item por nome..."
            class="w-full"
            aria-label="Buscar item por nome"
          />
          <div class="flex gap-2 align-items-center flex-wrap">
            <p-select
              [options]="opcoesRaridade()"
              [ngModel]="filtroRaridadeId()"
              (ngModelChange)="filtroRaridadeId.set($event)"
              placeholder="Raridade"
              optionLabel="label"
              optionValue="value"
              styleClass="flex-1"
              aria-label="Filtrar por raridade"
            />
            <p-button
              label="Limpar"
              icon="pi pi-times"
              size="small"
              severity="secondary"
              text
              (onClick)="limparFiltros()"
              aria-label="Limpar filtros"
            />
          </div>
        </div>

        <!-- Aviso para Jogador -->
        @if (!isMestre()) {
          <p-message
            severity="info"
            text="Itens com raridade restrita (cadeado) so podem ser adicionados pelo Mestre."
          />
        }

        <!-- Tabela de itens -->
        @if (loadingItens()) {
          <div class="flex flex-col gap-2">
            @for (_ of [1, 2, 3, 4]; track $index) {
              <p-skeleton height="2.5rem" borderRadius="4px" />
            }
          </div>
        } @else {
          <p-table
            [value]="itensFiltrados()"
            [scrollable]="true"
            scrollHeight="300px"
            styleClass="p-datatable-sm p-datatable-hoverable"
            [rowHover]="true"
            aria-label="Catalogo de itens"
          >
            <ng-template #header>
              <tr>
                <th scope="col">Nome</th>
                <th scope="col">Raridade</th>
                <th scope="col">Peso</th>
                <th scope="col" style="width: 80px"></th>
              </tr>
            </ng-template>
            <ng-template #body let-item>
              <tr>
                <td>
                  <div class="flex flex-col">
                    <span class="font-medium text-sm">{{ item.nome }}</span>
                    <span class="text-xs text-color-secondary">
                      {{ categoriaLabel(item.categoria) }}
                    </span>
                  </div>
                </td>
                <td>
                  <p-tag
                    [value]="item.raridadeNome"
                    [style]="{
                      'background-color': item.raridadeCor + '22',
                      'color': item.raridadeCor,
                      'border': '1px solid ' + item.raridadeCor
                    }"
                    styleClass="text-xs"
                  />
                </td>
                <td class="text-sm">
                  {{ item.peso | number: '1.1-2' }} kg
                </td>
                <td>
                  @if (podeAdicionarItem(item)) {
                    <p-button
                      icon="pi pi-plus"
                      size="small"
                      [attr.aria-label]="'Adicionar ' + item.nome"
                      (onClick)="selecionarItem(item)"
                    />
                  } @else {
                    <span
                      class="pi pi-lock text-color-secondary"
                      pTooltip="Apenas o Mestre pode adicionar este item"
                      tooltipPosition="top"
                      role="img"
                      [attr.aria-label]="item.nome + ': requer Mestre'"
                    ></span>
                  }
                </td>
              </tr>
            </ng-template>
            <ng-template #emptymessage>
              <tr>
                <td colspan="4" class="text-center text-color-secondary p-4">
                  Nenhum item encontrado com os filtros atuais.
                </td>
              </tr>
            </ng-template>
          </p-table>
        }

        <!-- Confirmacao de adicao (apos selecionar item) -->
        @if (itemSelecionado()) {
          <div
            class="surface-section border-1 surface-border border-round p-3 flex flex-col gap-3"
          >
            <div class="flex align-items-center justify-content-between">
              <span class="font-semibold">{{ itemSelecionado()!.nome }}</span>
              <p-button
                icon="pi pi-times"
                size="small"
                text
                severity="secondary"
                aria-label="Cancelar selecao"
                (onClick)="itemSelecionado.set(null)"
              />
            </div>

            <div class="flex gap-3 align-items-end">
              <div class="flex flex-col gap-1 flex-1">
                <label for="qtdAdicionar" class="text-sm font-medium">
                  Quantidade
                </label>
                <p-inputnumber
                  inputId="qtdAdicionar"
                  [ngModel]="quantidade()"
                  (ngModelChange)="quantidade.set($event ?? 1)"
                  [min]="1"
                  [max]="99"
                  aria-label="Quantidade"
                />
              </div>
              <div class="flex flex-col gap-1 flex-1">
                <label for="notasAdicionar" class="text-sm font-medium">
                  Notas (opcional)
                </label>
                <input
                  pInputText
                  id="notasAdicionar"
                  type="text"
                  [ngModel]="notas()"
                  (ngModelChange)="notas.set($event)"
                  placeholder="Observacoes..."
                  class="w-full"
                  aria-label="Notas do item"
                />
              </div>
            </div>

            @if (isMestre()) {
              <div class="flex align-items-center gap-2">
                <input
                  type="checkbox"
                  id="forcarAdicao"
                  [ngModel]="forcarAdicao()"
                  (ngModelChange)="forcarAdicao.set($event)"
                  aria-label="Forcar adicao sem validacao de requisitos"
                />
                <label
                  for="forcarAdicao"
                  class="text-sm cursor-pointer"
                  pTooltip="Bypassa validacao de requisitos ao adicionar"
                  tooltipPosition="top"
                >
                  Forcar adicao (sem validar requisitos)
                </label>
              </div>
            }

            <p-button
              label="Confirmar Adicao"
              icon="pi pi-check"
              class="w-full"
              (onClick)="confirmarAdicao()"
              aria-label="Confirmar adicao do item selecionado"
            />
          </div>
        }

        <!-- Adicionar customizado (apenas Mestre) -->
        @if (isMestre() && !itemSelecionado()) {
          <div class="flex justify-content-end">
            <p-button
              label="+ Item Customizado"
              icon="pi pi-pencil"
              size="small"
              severity="secondary"
              outlined
              (onClick)="abrirCustomizado.set(!abrirCustomizado())"
              aria-label="Adicionar item customizado sem catalogo"
            />
          </div>
        }

        @if (isMestre() && abrirCustomizado()) {
          <div
            class="surface-section border-1 surface-border border-round p-3 flex flex-col gap-3"
          >
            <span class="font-semibold text-sm">Item Customizado</span>

            <div class="flex flex-col gap-1">
              <label for="nomeCustom" class="text-sm font-medium">Nome</label>
              <input
                pInputText
                id="nomeCustom"
                type="text"
                [ngModel]="customNome()"
                (ngModelChange)="customNome.set($event)"
                placeholder="Nome do item..."
                class="w-full"
                aria-label="Nome do item customizado"
              />
            </div>

            <div class="flex gap-3">
              <div class="flex flex-col gap-1 flex-1">
                <label for="customPeso" class="text-sm font-medium">
                  Peso (kg)
                </label>
                <p-inputnumber
                  inputId="customPeso"
                  [ngModel]="customPeso()"
                  (ngModelChange)="customPeso.set($event ?? 0)"
                  [minFractionDigits]="1"
                  [maxFractionDigits]="2"
                  [min]="0"
                  aria-label="Peso do item customizado"
                />
              </div>
              <div class="flex flex-col gap-1 flex-1">
                <label for="customQtd" class="text-sm font-medium">
                  Quantidade
                </label>
                <p-inputnumber
                  inputId="customQtd"
                  [ngModel]="customQuantidade()"
                  (ngModelChange)="customQuantidade.set($event ?? 1)"
                  [min]="1"
                  [max]="99"
                  aria-label="Quantidade do item customizado"
                />
              </div>
            </div>

            <div class="flex flex-col gap-1">
              <label for="customNotas" class="text-sm font-medium">
                Notas (opcional)
              </label>
              <input
                pInputText
                id="customNotas"
                type="text"
                [ngModel]="customNotas()"
                (ngModelChange)="customNotas.set($event)"
                placeholder="Descricao ou observacoes..."
                class="w-full"
                aria-label="Notas do item customizado"
              />
            </div>

            <p-button
              label="Adicionar Item Customizado"
              icon="pi pi-check"
              class="w-full"
              [disabled]="!customNome().trim()"
              (onClick)="confirmarCustomizado()"
              aria-label="Confirmar adicao do item customizado"
            />
          </div>
        }

      </div>

      <ng-template #footer>
        <p-button
          label="Fechar"
          severity="secondary"
          outlined
          (onClick)="visivel.set(false)"
          aria-label="Fechar dialog de adicionar item"
        />
      </ng-template>
    </p-dialog>
  `,
})
export class FichaItemAdicionarDialogComponent implements OnInit {
  visivel = model.required<boolean>();
  jogoId = input.required<number>();
  isMestre = input.required<boolean>();

  adicionarItem = output<AdicionarFichaItemRequest>();
  adicionarCustomizado = output<AdicionarFichaItemCustomizadoRequest>();

  private configApi = inject(ConfigApiService);

  // Catalogo
  protected todosItens = signal<ItemConfigResumo[]>([]);
  protected raridades = signal<RaridadeItemConfig[]>([]);
  protected loadingItens = signal(false);

  // Filtros
  protected filtroNome = signal('');
  protected filtroRaridadeId = signal<number | null>(null);

  // Selecao para adicionar
  protected itemSelecionado = signal<ItemConfigResumo | null>(null);
  protected quantidade = signal(1);
  protected notas = signal('');
  protected forcarAdicao = signal(false);

  // Customizado
  protected abrirCustomizado = signal(false);
  protected customNome = signal('');
  protected customPeso = signal(0);
  protected customQuantidade = signal(1);
  protected customNotas = signal('');

  protected opcoesRaridade = computed<SelectOption[]>(() => [
    { label: 'Todas as raridades', value: null },
    ...this.raridades().map((r) => ({ label: r.nome, value: r.id })),
  ]);

  protected itensFiltrados = computed(() => {
    const nome = this.filtroNome().toLowerCase().trim();
    const raridadeId = this.filtroRaridadeId();
    return this.todosItens().filter((item) => {
      const nomeOk = !nome || item.nome.toLowerCase().includes(nome);
      const rarOk = !raridadeId || item.raridadeId === raridadeId;
      return nomeOk && rarOk;
    });
  });

  ngOnInit(): void {
    this.carregarCatalogo();
  }

  private carregarCatalogo(): void {
    const jogoId = this.jogoId();
    this.loadingItens.set(true);
    this.configApi.listItens(jogoId, 0, 200).subscribe({
      next: (page: PageResponse<ItemConfigResumo>) => {
        this.todosItens.set(page.content);
        this.loadingItens.set(false);
      },
      error: () => this.loadingItens.set(false),
    });
    this.configApi.listRaridadesItem(jogoId).subscribe({
      next: (r) => this.raridades.set(r),
    });
  }

  protected podeAdicionarItem(item: ItemConfigResumo): boolean {
    if (this.isMestre()) return true;
    // Para o Jogador: verificar se a raridade do item permite
    const raridade = this.raridades().find((r) => r.id === item.raridadeId);
    return raridade?.podeJogadorAdicionar ?? false;
  }

  protected selecionarItem(item: ItemConfigResumo): void {
    this.itemSelecionado.set(item);
    this.quantidade.set(1);
    this.notas.set('');
    this.forcarAdicao.set(false);
  }

  protected confirmarAdicao(): void {
    const item = this.itemSelecionado();
    if (!item) return;
    this.adicionarItem.emit({
      itemConfigId: item.id,
      quantidade: this.quantidade(),
      notas: this.notas() || undefined,
      forcarAdicao: this.forcarAdicao(),
    });
    this.itemSelecionado.set(null);
  }

  protected confirmarCustomizado(): void {
    if (!this.customNome().trim()) return;
    this.adicionarCustomizado.emit({
      nome: this.customNome().trim(),
      raridadeId: this.raridades()[0]?.id ?? 1,
      peso: this.customPeso(),
      quantidade: this.customQuantidade(),
      notas: this.customNotas() || undefined,
    });
    this.abrirCustomizado.set(false);
    this.customNome.set('');
    this.customPeso.set(0);
    this.customQuantidade.set(1);
    this.customNotas.set('');
  }

  protected limparFiltros(): void {
    this.filtroNome.set('');
    this.filtroRaridadeId.set(null);
  }

  protected categoriaLabel(categoria: string): string {
    return CATEGORIA_LABELS[categoria as keyof typeof CATEGORIA_LABELS] ?? categoria;
  }
}
