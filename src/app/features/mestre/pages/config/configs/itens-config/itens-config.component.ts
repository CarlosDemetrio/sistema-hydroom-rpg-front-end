import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
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
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';

import { ConfigApiService } from '@core/services/api/config-api.service';
import { CurrentGameService } from '@core/services/current-game.service';
import { ToastService } from '@services/toast.service';
import {
  ItemConfigResumo,
  ItemConfigResponse,
  ItemEfeitoResponse,
  ItemEfeitoRequest,
  ItemRequisitoResponse,
  ItemRequisitoRequest,
  TipoItemEfeito,
  TipoRequisito,
  TIPO_EFEITO_LABELS,
  TIPO_REQUISITO_LABELS,
} from '@core/models/item-config.model';
import {
  RaridadeItemConfig,
} from '@core/models/raridade-item-config.model';
import {
  TipoItemConfig,
  CATEGORIA_LABELS,
  CATEGORIA_SEVERITY,
  CategoriaItem,
} from '@core/models/tipo-item-config.model';
import { AtributoConfig } from '@core/models/atributo-config.model';
import { AptidaoConfig } from '@core/models/aptidao-config.model';
import { BonusConfig } from '@core/models/config.models';

interface SelectOption {
  label: string;
  value: unknown;
}

/**
 * ItensConfigComponent — Catálogo de Itens do Jogo.
 *
 * Tela de configuração para ItemConfig com:
 * - Listagem com filtros por raridade, categoria e nome
 * - Formulário em 3 abas: Dados Básicos, Efeitos, Requisitos
 * - Sub-recursos ItemEfeito e ItemRequisito gerenciados inline
 */
@Component({
  selector: 'app-itens-config',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    BadgeModule,
    ButtonModule,
    CardModule,
    CheckboxModule,
    ConfirmDialogModule,
    DialogModule,
    InputNumberModule,
    InputTextModule,
    SelectModule,
    TableModule,
    TabsModule,
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
              Selecione um jogo no cabeçalho para gerenciar o Catálogo de Itens.
            </p>
          </div>
        </div>
      }

      <!-- Header -->
      <div class="flex justify-content-between align-items-center mb-3">
        <div>
          <h2 class="m-0 text-xl font-bold">Catálogo de Itens</h2>
          <p class="text-sm text-color-secondary m-0">Gerencie todos os itens disponíveis no jogo</p>
        </div>
        @if (hasGame()) {
          <p-button
            label="Novo Item"
            icon="pi pi-plus"
            (onClick)="openDialog()"
          />
        }
      </div>

      <!-- Filtros -->
      @if (hasGame()) {
        <div class="flex gap-2 mb-3 flex-wrap">
          <p-select
            [options]="raridadeFilterOptions()"
            [(ngModel)]="filtroRaridadeId"
            optionLabel="label"
            optionValue="value"
            placeholder="Filtrar por raridade..."
            [showClear]="true"
            style="min-width: 12rem"
            (onChange)="aplicarFiltros()"
          />
          <p-select
            [options]="categoriaFilterOptions"
            [(ngModel)]="filtroCategoria"
            optionLabel="label"
            optionValue="value"
            placeholder="Filtrar por categoria..."
            [showClear]="true"
            style="min-width: 12rem"
            (onChange)="aplicarFiltros()"
          />
          <input
            pInputText
            [(ngModel)]="filtroBusca"
            placeholder="Buscar por nome..."
            (input)="aplicarFiltros()"
            style="min-width: 14rem"
          />
          @if (filtroAtivo()) {
            <p-button
              label="Limpar filtros"
              icon="pi pi-times"
              severity="secondary"
              [outlined]="true"
              (onClick)="limparFiltros()"
            />
          }
        </div>
      }

      <!-- Tabela -->
      <p-table
        [value]="itensFiltrados()"
        [loading]="loading()"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[10, 25, 50]"
        styleClass="p-datatable-sm"
        [tableStyle]="{ 'min-width': '60rem' }"
      >
        <ng-template pTemplate="header">
          <tr>
            <th>Raridade</th>
            <th>Nome</th>
            <th>Tipo</th>
            <th style="width: 6rem">Peso</th>
            <th style="width: 6rem">Valor</th>
            <th style="width: 6rem">Nv. Mín.</th>
            <th style="width: 6rem">Efeitos</th>
            <th style="width: 8rem">Ações</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-item>
          <tr>
            <td>
              <div class="flex align-items-center gap-2">
                <div
                  class="border-round"
                  [style.background-color]="item.raridadeCor"
                  style="width: 1rem; height: 1rem; border: 1px solid var(--surface-border); flex-shrink: 0"
                ></div>
                <span class="text-sm font-semibold">{{ item.raridadeNome }}</span>
              </div>
            </td>
            <td class="font-semibold">{{ item.nome }}</td>
            <td>
              <p-tag
                [value]="getCategoriaLabel(item.categoria)"
                [severity]="getCategoriaSeverity(item.categoria)"
              />
            </td>
            <td class="text-sm">{{ item.peso }} kg</td>
            <td class="text-sm text-color-secondary">
              {{ item.valor != null ? (item.valor + ' po') : '—' }}
            </td>
            <td class="text-center text-sm">{{ item.nivelMinimo }}</td>
            <td class="text-center">
              <p-badge
                [value]="'0'"
                severity="secondary"
                pTooltip="Clique em Editar para ver efeitos"
              />
            </td>
            <td>
              <div class="flex gap-1">
                <p-button
                  icon="pi pi-pencil"
                  [rounded]="true"
                  [text]="true"
                  severity="secondary"
                  (onClick)="editItem(item)"
                  pTooltip="Editar"
                />
                <p-button
                  icon="pi pi-trash"
                  [rounded]="true"
                  [text]="true"
                  severity="danger"
                  (onClick)="confirmDelete(item.id)"
                  pTooltip="Excluir"
                />
              </div>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="8">
              <div class="text-center p-4 text-color-secondary">
                <i class="pi pi-inbox text-3xl mb-2 block"></i>
                <p class="m-0">
                  @if (filtroAtivo()) {
                    Nenhum item encontrado com os filtros aplicados
                  } @else {
                    Nenhum item configurado
                  }
                </p>
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
      [header]="editMode() ? 'Editar Item' : 'Novo Item'"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      [style]="{ width: '56rem', maxWidth: '95vw' }"
    >
      <p-tabs [value]="activeTab()">
        <p-tablist>
          <p-tab value="dados">Dados Básicos</p-tab>
          <p-tab value="efeitos" [disabled]="!editMode()">
            Efeitos
            @if (efeitos().length) {
              <span class="ml-1 badge-atributo">{{ efeitos().length }}</span>
            }
          </p-tab>
          <p-tab value="requisitos" [disabled]="!editMode()">
            Requisitos
            @if (requisitos().length) {
              <span class="ml-1 badge-atributo">{{ requisitos().length }}</span>
            }
          </p-tab>
        </p-tablist>

        <p-tabpanels>
          <!-- Aba 1: Dados Básicos -->
          <p-tabpanel value="dados">
            <form [formGroup]="form" (ngSubmit)="save()">
              <div class="flex flex-column gap-4 p-2">

                <!-- Linha: Nome + Raridade -->
                <div class="grid">
                  <div class="col-6">
                    <div class="flex flex-column gap-2">
                      <label for="nome" class="font-semibold">
                        Nome <span class="text-red-400">*</span>
                      </label>
                      <input
                        pInputText
                        id="nome"
                        formControlName="nome"
                        placeholder="Nome do item..."
                        [class.ng-invalid]="form.get('nome')?.invalid && form.get('nome')?.touched"
                      />
                      @if (form.get('nome')?.invalid && form.get('nome')?.touched) {
                        <small class="text-red-400">
                          @if (form.get('nome')?.errors?.['required']) { Campo obrigatório }
                          @if (form.get('nome')?.errors?.['minlength']) { Mínimo de 2 caracteres }
                        </small>
                      }
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="flex flex-column gap-2">
                      <label class="font-semibold">
                        Raridade <span class="text-red-400">*</span>
                      </label>
                      <div class="flex align-items-center gap-2">
                        @if (raridadeSelecionadaCor()) {
                          <div
                            class="border-round flex-shrink-0"
                            [style.background-color]="raridadeSelecionadaCor()"
                            style="width: 1.2rem; height: 1.2rem; border: 1px solid var(--surface-border)"
                          ></div>
                        }
                        <p-select
                          formControlName="raridadeId"
                          [options]="raridadesOptions()"
                          optionLabel="label"
                          optionValue="value"
                          placeholder="Selecione a raridade..."
                          class="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Linha: Tipo + Nível Mínimo -->
                <div class="grid">
                  <div class="col-6">
                    <div class="flex flex-column gap-2">
                      <label class="font-semibold">
                        Tipo <span class="text-red-400">*</span>
                      </label>
                      <p-select
                        formControlName="tipoId"
                        [options]="tiposOptions()"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecione o tipo..."
                        [group]="true"
                      >
                        <ng-template #group let-group>
                          <p-tag
                            [value]="group.label"
                            [severity]="group.severity"
                            class="text-xs"
                          />
                        </ng-template>
                      </p-select>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="flex flex-column gap-2">
                      <label for="nivelMinimo" class="font-semibold">
                        Nível Mínimo <span class="text-red-400">*</span>
                      </label>
                      <p-input-number
                        inputId="nivelMinimo"
                        formControlName="nivelMinimo"
                        [showButtons]="true"
                        [min]="1"
                      />
                    </div>
                  </div>
                </div>

                <!-- Linha: Peso + Valor -->
                <div class="grid">
                  <div class="col-6">
                    <div class="flex flex-column gap-2">
                      <label for="peso" class="font-semibold">
                        Peso (kg) <span class="text-red-400">*</span>
                      </label>
                      <p-input-number
                        inputId="peso"
                        formControlName="peso"
                        [showButtons]="true"
                        [min]="0"
                        [step]="0.1"
                        [minFractionDigits]="1"
                        [maxFractionDigits]="2"
                      />
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="flex flex-column gap-2">
                      <label for="valor" class="font-semibold">Valor (po)</label>
                      <p-input-number
                        inputId="valor"
                        formControlName="valor"
                        [showButtons]="true"
                        [min]="0"
                      />
                    </div>
                  </div>
                </div>

                <!-- Linha: Durabilidade + Ordem -->
                <div class="grid">
                  <div class="col-6">
                    <div class="flex flex-column gap-2">
                      <label for="duracaoPadrao" class="font-semibold">
                        Durabilidade Padrão
                        <span class="text-color-secondary text-xs ml-1">(null = indestrutível)</span>
                      </label>
                      <p-input-number
                        inputId="duracaoPadrao"
                        formControlName="duracaoPadrao"
                        [showButtons]="true"
                        [min]="1"
                      />
                    </div>
                  </div>
                  <div class="col-6">
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
                  </div>
                </div>

                <!-- Propriedades -->
                <div class="flex flex-column gap-2">
                  <label for="propriedades" class="font-semibold">Propriedades</label>
                  <input
                    pInputText
                    id="propriedades"
                    formControlName="propriedades"
                    placeholder="Ex: versátil, finura, arremesso"
                  />
                </div>

                <!-- Descrição -->
                <div class="flex flex-column gap-2">
                  <label for="descricao" class="font-semibold">Descrição</label>
                  <textarea
                    pTextarea
                    id="descricao"
                    formControlName="descricao"
                    [rows]="3"
                    placeholder="Descrição do item..."
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
                  [label]="editMode() ? 'Salvar Alterações' : 'Criar Item'"
                  icon="pi pi-check"
                  type="submit"
                />
              </div>
            </form>
          </p-tabpanel>

          <!-- Aba 2: Efeitos -->
          <p-tabpanel value="efeitos">
            <div class="flex flex-column gap-3 p-2">
              <div class="rpg-section-title">Efeitos do Item</div>

              @if (efeitos().length) {
                <div class="flex flex-column gap-2">
                  @for (efeito of efeitos(); track efeito.id) {
                    <div class="flex justify-content-between align-items-start p-3 surface-100 border-round">
                      <div class="flex flex-column gap-1">
                        <p-tag [value]="getTipoEfeitoLabel(efeito.tipoEfeito)" severity="info" />
                        <span class="text-sm text-color-secondary">
                          {{ descreverEfeito(efeito) }}
                        </span>
                        @if (efeito.descricaoEfeito) {
                          <span class="text-xs text-color-secondary font-italic">{{ efeito.descricaoEfeito }}</span>
                        }
                      </div>
                      <p-button
                        icon="pi pi-trash"
                        [rounded]="true"
                        [text]="true"
                        severity="danger"
                        (onClick)="confirmRemoveEfeito(efeito.id)"
                        pTooltip="Remover efeito"
                      />
                    </div>
                  }
                </div>
              } @else {
                <div class="text-center p-4 text-color-secondary">
                  <i class="pi pi-bolt text-3xl mb-2 block"></i>
                  <p class="m-0">Nenhum efeito configurado</p>
                </div>
              }

              <!-- Formulário de novo efeito -->
              <div class="flex flex-column gap-3 border-top-1 surface-border pt-3 mt-2">
                <div class="text-sm font-semibold text-color-secondary">Adicionar Efeito</div>

                <div class="flex flex-column gap-2">
                  <label class="font-semibold text-sm">Tipo de Efeito <span class="text-red-400">*</span></label>
                  <p-select
                    [options]="tipoEfeitoOptions"
                    [(ngModel)]="novoEfeitoTipo"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Selecione o tipo..."
                    (onChange)="onTipoEfeitoChange()"
                  />
                </div>

                @if (novoEfeitoTipo()) {

                  @if (novoEfeitoTipo() === 'BONUS_ATRIBUTO') {
                    <div class="flex flex-column gap-2">
                      <label class="font-semibold text-sm">Atributo Alvo <span class="text-red-400">*</span></label>
                      <p-select
                        [options]="atributosOptions()"
                        [(ngModel)]="novoEfeitoAtributoId"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecione o atributo..."
                      />
                    </div>
                  }

                  @if (novoEfeitoTipo() === 'BONUS_APTIDAO') {
                    <div class="flex flex-column gap-2">
                      <label class="font-semibold text-sm">Aptidão Alvo <span class="text-red-400">*</span></label>
                      <p-select
                        [options]="aptidoesOptions()"
                        [(ngModel)]="novoEfeitoAptidaoId"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecione a aptidão..."
                      />
                    </div>
                  }

                  @if (novoEfeitoTipo() === 'BONUS_DERIVADO') {
                    <div class="flex flex-column gap-2">
                      <label class="font-semibold text-sm">Bônus Derivado Alvo <span class="text-red-400">*</span></label>
                      <p-select
                        [options]="bonusOptions()"
                        [(ngModel)]="novoEfeitoBonusId"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecione o bônus..."
                      />
                    </div>
                  }

                  @if (novoEfeitoTipo() !== 'FORMULA_CUSTOMIZADA') {
                    <div class="flex flex-column gap-2">
                      <label class="font-semibold text-sm">
                        Valor Fixo <span class="text-red-400">*</span>
                      </label>
                      <p-input-number
                        [(ngModel)]="novoEfeitoValorFixo"
                        [showButtons]="true"
                        [min]="-999"
                        [max]="999"
                        placeholder="Ex: 2"
                      />
                    </div>
                  }

                  @if (novoEfeitoTipo() === 'FORMULA_CUSTOMIZADA') {
                    <div class="flex flex-column gap-2">
                      <label class="font-semibold text-sm">Fórmula</label>
                      <input
                        pInputText
                        [(ngModel)]="novoEfeitoFormula"
                        placeholder="Ex: FOR * nivel"
                      />
                    </div>
                  }

                  <div class="flex flex-column gap-2">
                    <label class="font-semibold text-sm">Descrição do Efeito</label>
                    <input
                      pInputText
                      [(ngModel)]="novoEfeitoDescricao"
                      placeholder="Ex: +2 de Força enquanto equipado"
                    />
                  </div>

                  <p-button
                    icon="pi pi-plus"
                    label="Adicionar Efeito"
                    [disabled]="!podeAdicionarEfeito()"
                    (onClick)="adicionarEfeito()"
                  />
                }
              </div>
            </div>
          </p-tabpanel>

          <!-- Aba 3: Requisitos -->
          <p-tabpanel value="requisitos">
            <div class="flex flex-column gap-3 p-2">
              <div class="rpg-section-title">Requisitos do Item</div>

              @if (requisitos().length) {
                <div class="flex flex-column gap-2">
                  @for (req of requisitos(); track req.id) {
                    <div class="flex justify-content-between align-items-center p-3 surface-100 border-round">
                      <div class="flex align-items-center gap-2">
                        <p-tag [value]="getTipoRequisitoLabel(req.tipo)" severity="warn" />
                        @if (req.alvo) {
                          <span class="font-semibold text-sm">{{ req.alvo }}</span>
                        }
                        @if (req.valorMinimo != null) {
                          <span class="text-sm text-color-secondary">≥ {{ req.valorMinimo }}</span>
                        }
                      </div>
                      <p-button
                        icon="pi pi-trash"
                        [rounded]="true"
                        [text]="true"
                        severity="danger"
                        (onClick)="confirmRemoveRequisito(req.id)"
                        pTooltip="Remover requisito"
                      />
                    </div>
                  }
                </div>
              } @else {
                <div class="text-center p-4 text-color-secondary">
                  <i class="pi pi-lock text-3xl mb-2 block"></i>
                  <p class="m-0">Nenhum requisito configurado</p>
                </div>
              }

              <!-- Formulário de novo requisito -->
              <div class="flex flex-column gap-3 border-top-1 surface-border pt-3 mt-2">
                <div class="text-sm font-semibold text-color-secondary">Adicionar Requisito</div>

                <div class="flex gap-2 flex-wrap align-items-end">
                  <div class="flex flex-column gap-1">
                    <label class="text-xs font-semibold">Tipo <span class="text-red-400">*</span></label>
                    <p-select
                      [options]="tipoRequisitoOptions"
                      [(ngModel)]="novoRequisitoTipo"
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Tipo..."
                      style="min-width: 10rem"
                    />
                  </div>
                  <div class="flex flex-column gap-1 flex-1">
                    <label class="text-xs font-semibold">Alvo (opcional)</label>
                    <input
                      pInputText
                      [(ngModel)]="novoRequisitoAlvo"
                      placeholder="Ex: Guerreiro, Força..."
                    />
                  </div>
                  <div class="flex flex-column gap-1">
                    <label class="text-xs font-semibold">Valor Mínimo</label>
                    <p-input-number
                      [(ngModel)]="novoRequisitoValorMinimo"
                      [showButtons]="true"
                      [min]="0"
                      style="width: 8rem"
                    />
                  </div>
                  <p-button
                    icon="pi pi-plus"
                    label="Adicionar"
                    [disabled]="!novoRequisitoTipo()"
                    (onClick)="adicionarRequisito()"
                  />
                </div>
              </div>
            </div>
          </p-tabpanel>
        </p-tabpanels>
      </p-tabs>
    </p-dialog>

    <p-confirmDialog />
  `,
})
export class ItensConfigComponent implements OnInit {
  private readonly configApi = inject(ConfigApiService);
  private readonly currentGameService = inject(CurrentGameService);
  private readonly toastService = inject(ToastService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly hasGame = this.currentGameService.hasCurrentGame;
  protected readonly currentGameId = this.currentGameService.currentGameId;
  protected readonly currentGameName = computed(() => this.currentGameService.currentGame()?.nome);

  // Estado principal
  protected readonly itens = signal<ItemConfigResumo[]>([]);
  protected readonly loading = signal(false);
  protected readonly dialogVisible = signal(false);
  protected readonly editMode = signal(false);
  protected readonly currentEditId = signal<number | null>(null);
  protected readonly activeTab = signal('dados');

  // Sub-recursos do item em edição
  protected readonly efeitos = signal<ItemEfeitoResponse[]>([]);
  protected readonly requisitos = signal<ItemRequisitoResponse[]>([]);

  // Dados de apoio
  protected readonly raridades = signal<RaridadeItemConfig[]>([]);
  protected readonly tipos = signal<TipoItemConfig[]>([]);
  protected readonly atributos = signal<AtributoConfig[]>([]);
  protected readonly aptidoes = signal<AptidaoConfig[]>([]);
  protected readonly bonusConfigs = signal<BonusConfig[]>([]);

  // Filtros
  protected filtroRaridadeId: number | null = null;
  protected filtroCategoria: CategoriaItem | null = null;
  protected filtroBusca = '';
  protected readonly filtrosAplicados = signal<{
    raridadeId: number | null;
    categoria: CategoriaItem | null;
    busca: string;
  }>({ raridadeId: null, categoria: null, busca: '' });

  // Formulário de novo efeito
  protected novoEfeitoTipo = signal<TipoItemEfeito | null>(null);
  protected novoEfeitoAtributoId = signal<number | null>(null);
  protected novoEfeitoAptidaoId = signal<number | null>(null);
  protected novoEfeitoBonusId = signal<number | null>(null);
  protected novoEfeitoValorFixo = signal<number | null>(null);
  protected novoEfeitoFormula = signal<string>('');
  protected novoEfeitoDescricao = signal<string>('');

  // Formulário de novo requisito
  protected novoRequisitoTipo = signal<TipoRequisito | null>(null);
  protected novoRequisitoAlvo = signal<string>('');
  protected novoRequisitoValorMinimo = signal<number | null>(null);

  // Options para selects
  protected readonly tipoEfeitoOptions: SelectOption[] = (Object.keys(TIPO_EFEITO_LABELS) as TipoItemEfeito[])
    .map((k) => ({ label: TIPO_EFEITO_LABELS[k], value: k }));

  protected readonly tipoRequisitoOptions: SelectOption[] = (Object.keys(TIPO_REQUISITO_LABELS) as TipoRequisito[])
    .map((k) => ({ label: TIPO_REQUISITO_LABELS[k], value: k }));

  protected readonly categoriaFilterOptions = (Object.keys(CATEGORIA_LABELS) as CategoriaItem[])
    .map((k) => ({ label: CATEGORIA_LABELS[k], value: k }));

  // Computed options
  protected readonly raridadesOptions = computed(() =>
    this.raridades().map((r) => ({ label: r.nome, value: r.id, cor: r.cor }))
  );

  protected readonly raridadeFilterOptions = computed(() => [
    ...this.raridades().map((r) => ({ label: r.nome, value: r.id })),
  ]);

  protected readonly tiposOptions = computed(() => {
    const grupos: { label: string; severity: string; items: SelectOption[] }[] = [];
    (Object.keys(CATEGORIA_LABELS) as CategoriaItem[]).forEach((cat) => {
      const tiposGrupo = this.tipos()
        .filter((t) => t.categoria === cat)
        .map((t) => ({ label: t.nome, value: t.id }));
      if (tiposGrupo.length > 0) {
        grupos.push({ label: CATEGORIA_LABELS[cat], severity: CATEGORIA_SEVERITY[cat], items: tiposGrupo });
      }
    });
    return grupos;
  });

  protected readonly atributosOptions = computed(() =>
    this.atributos().map((a) => ({ label: a.nome, value: a.id }))
  );

  protected readonly aptidoesOptions = computed(() =>
    this.aptidoes().map((a) => ({ label: a.nome, value: a.id }))
  );

  protected readonly bonusOptions = computed(() =>
    this.bonusConfigs().map((b) => ({ label: b.nome, value: b.id }))
  );

  protected readonly raridadeSelecionadaCor = computed(() => {
    const id = this.form?.get('raridadeId')?.value as number | null;
    if (!id) return null;
    return this.raridades().find((r) => r.id === id)?.cor ?? null;
  });

  protected readonly filtroAtivo = computed(() => {
    const f = this.filtrosAplicados();
    return f.raridadeId != null || f.categoria != null || f.busca !== '';
  });

  protected readonly itensFiltrados = computed(() => {
    const f = this.filtrosAplicados();
    return this.itens().filter((item) => {
      if (f.raridadeId != null && item.raridadeId !== f.raridadeId) return false;
      if (f.categoria != null && item.categoria !== f.categoria) return false;
      if (f.busca && !item.nome.toLowerCase().includes(f.busca.toLowerCase())) return false;
      return true;
    });
  });

  protected readonly podeAdicionarEfeito = computed(() => {
    const tipo = this.novoEfeitoTipo();
    if (!tipo) return false;
    if (tipo === 'BONUS_ATRIBUTO' && !this.novoEfeitoAtributoId()) return false;
    if (tipo === 'BONUS_APTIDAO' && !this.novoEfeitoAptidaoId()) return false;
    if (tipo === 'BONUS_DERIVADO' && !this.novoEfeitoBonusId()) return false;
    if (tipo !== 'FORMULA_CUSTOMIZADA' && this.novoEfeitoValorFixo() == null) return false;
    return true;
  });

  protected form!: FormGroup;

  ngOnInit(): void {
    this.form = this.buildForm();
    if (this.hasGame()) {
      this.loadData();
      this.loadApoio();
    }
  }

  private buildForm(): FormGroup {
    return this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      raridadeId: [null, [Validators.required]],
      tipoId: [null, [Validators.required]],
      peso: [0, [Validators.required, Validators.min(0)]],
      valor: [null],
      duracaoPadrao: [null],
      nivelMinimo: [1, [Validators.required, Validators.min(1)]],
      propriedades: [''],
      descricao: ['', [Validators.maxLength(2000)]],
      ordemExibicao: [1, [Validators.required, Validators.min(1)]],
    });
  }

  protected loadData(): void {
    const jogoId = this.currentGameId();
    if (!jogoId) return;
    this.loading.set(true);
    this.configApi.listItens(jogoId, 0, 200)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (page) => {
          this.itens.set(page.content);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  private loadApoio(): void {
    const jogoId = this.currentGameId();
    if (!jogoId) return;
    this.configApi.listRaridadesItem(jogoId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (data) => this.raridades.set(data) });
    this.configApi.listTiposItem(jogoId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (data) => this.tipos.set(data) });
    this.configApi.listAtributos(jogoId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (data) => this.atributos.set(data) });
    this.configApi.listAptidoes(jogoId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (data) => this.aptidoes.set(data) });
    this.configApi.listBonus(jogoId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (data) => this.bonusConfigs.set(data) });
  }

  protected openDialog(): void {
    this.form = this.buildForm();
    this.editMode.set(false);
    this.currentEditId.set(null);
    this.activeTab.set('dados');
    this.efeitos.set([]);
    this.requisitos.set([]);
    this.form.reset({ nivelMinimo: 1, peso: 0, ordemExibicao: this.itens().length + 1 });
    this.dialogVisible.set(true);
  }

  protected editItem(item: ItemConfigResumo): void {
    this.loading.set(true);
    this.configApi.getItem(item.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (full: ItemConfigResponse) => {
          this.loading.set(false);
          this.editMode.set(true);
          this.currentEditId.set(full.id);
          this.activeTab.set('dados');
          this.efeitos.set(full.efeitos ?? []);
          this.requisitos.set(full.requisitos ?? []);
          this.form = this.buildForm();
          this.form.patchValue({
            nome: full.nome,
            raridadeId: full.raridadeId,
            tipoId: full.tipoId,
            peso: full.peso,
            valor: full.valor,
            duracaoPadrao: full.duracaoPadrao,
            nivelMinimo: full.nivelMinimo,
            propriedades: full.propriedades,
            descricao: full.descricao,
            ordemExibicao: full.ordemExibicao,
          });
          this.dialogVisible.set(true);
        },
        error: () => this.loading.set(false),
      });
  }

  protected closeDialog(): void {
    this.dialogVisible.set(false);
    this.form.reset();
    this.resetEfeitoForm();
    this.resetRequisitoForm();
  }

  protected onDialogVisibleChange(visible: boolean): void {
    if (!visible) this.closeDialog();
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
      ? this.configApi.updateItem(this.currentEditId()!, data)
      : this.configApi.createItem({ ...data, jogoId });

    this.loading.set(true);
    operation$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        const action = this.editMode() ? 'atualizado' : 'criado';
        this.toastService.success(`Item ${action} com sucesso`, 'Sucesso');
        this.closeDialog();
        this.loadData();
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.message ?? 'Erro ao salvar item';
        this.toastService.error(msg, 'Erro');
      },
    });
  }

  protected confirmDelete(id: number): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir este Item? Esta ação não pode ser desfeita.',
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, excluir',
      rejectLabel: 'Cancelar',
      acceptButtonProps: { severity: 'danger' },
      accept: () => this.deleteItem(id),
    });
  }

  private deleteItem(id: number): void {
    this.configApi.deleteItem(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastService.success('Item excluído com sucesso', 'Sucesso');
          this.loadData();
        },
        error: (err) => {
          const msg = err?.error?.message ?? 'Erro ao excluir item';
          this.toastService.error(msg, 'Erro');
        },
      });
  }

  // ===== Efeitos =====

  protected onTipoEfeitoChange(): void {
    this.novoEfeitoAtributoId.set(null);
    this.novoEfeitoAptidaoId.set(null);
    this.novoEfeitoBonusId.set(null);
    this.novoEfeitoValorFixo.set(null);
    this.novoEfeitoFormula.set('');
  }

  protected adicionarEfeito(): void {
    const itemId = this.currentEditId();
    if (!itemId) return;

    const dto: ItemEfeitoRequest = {
      tipoEfeito: this.novoEfeitoTipo()!,
      atributoAlvoId: this.novoEfeitoAtributoId(),
      aptidaoAlvoId: this.novoEfeitoAptidaoId(),
      bonusAlvoId: this.novoEfeitoBonusId(),
      valorFixo: this.novoEfeitoValorFixo(),
      formula: this.novoEfeitoFormula() || null,
      descricaoEfeito: this.novoEfeitoDescricao() || null,
    };

    this.configApi.addItemEfeito(itemId, dto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (novo) => {
          this.efeitos.set([...this.efeitos(), novo]);
          this.resetEfeitoForm();
          this.toastService.success('Efeito adicionado', 'Sucesso');
        },
      });
  }

  protected confirmRemoveEfeito(efeitoId: number): void {
    const itemId = this.currentEditId();
    if (!itemId) return;
    this.configApi.removeItemEfeito(itemId, efeitoId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.efeitos.set(this.efeitos().filter((e) => e.id !== efeitoId));
          this.toastService.success('Efeito removido', 'Sucesso');
        },
      });
  }

  private resetEfeitoForm(): void {
    this.novoEfeitoTipo.set(null);
    this.novoEfeitoAtributoId.set(null);
    this.novoEfeitoAptidaoId.set(null);
    this.novoEfeitoBonusId.set(null);
    this.novoEfeitoValorFixo.set(null);
    this.novoEfeitoFormula.set('');
    this.novoEfeitoDescricao.set('');
  }

  // ===== Requisitos =====

  protected adicionarRequisito(): void {
    const itemId = this.currentEditId();
    if (!itemId || !this.novoRequisitoTipo()) return;

    const dto: ItemRequisitoRequest = {
      tipo: this.novoRequisitoTipo()!,
      alvo: this.novoRequisitoAlvo() || null,
      valorMinimo: this.novoRequisitoValorMinimo(),
    };

    this.configApi.addItemRequisito(itemId, dto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (novo) => {
          this.requisitos.set([...this.requisitos(), novo]);
          this.resetRequisitoForm();
          this.toastService.success('Requisito adicionado', 'Sucesso');
        },
      });
  }

  protected confirmRemoveRequisito(requisitoId: number): void {
    const itemId = this.currentEditId();
    if (!itemId) return;
    this.configApi.removeItemRequisito(itemId, requisitoId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.requisitos.set(this.requisitos().filter((r) => r.id !== requisitoId));
          this.toastService.success('Requisito removido', 'Sucesso');
        },
      });
  }

  private resetRequisitoForm(): void {
    this.novoRequisitoTipo.set(null);
    this.novoRequisitoAlvo.set('');
    this.novoRequisitoValorMinimo.set(null);
  }

  // ===== Filtros =====

  protected aplicarFiltros(): void {
    this.filtrosAplicados.set({
      raridadeId: this.filtroRaridadeId,
      categoria: this.filtroCategoria,
      busca: this.filtroBusca,
    });
  }

  protected limparFiltros(): void {
    this.filtroRaridadeId = null;
    this.filtroCategoria = null;
    this.filtroBusca = '';
    this.filtrosAplicados.set({ raridadeId: null, categoria: null, busca: '' });
  }

  // ===== Helpers de display =====

  protected getCategoriaLabel(categoria: CategoriaItem): string {
    return CATEGORIA_LABELS[categoria] ?? categoria;
  }

  protected getCategoriaSeverity(categoria: CategoriaItem): string {
    return CATEGORIA_SEVERITY[categoria] ?? 'secondary';
  }

  protected getTipoEfeitoLabel(tipo: TipoItemEfeito): string {
    return TIPO_EFEITO_LABELS[tipo] ?? tipo;
  }

  protected getTipoRequisitoLabel(tipo: TipoRequisito): string {
    return TIPO_REQUISITO_LABELS[tipo] ?? tipo;
  }

  protected descreverEfeito(efeito: ItemEfeitoResponse): string {
    const partes: string[] = [];
    if (efeito.valorFixo != null) partes.push(`${efeito.valorFixo > 0 ? '+' : ''}${efeito.valorFixo}`);
    if (efeito.formula) partes.push(`fórmula: ${efeito.formula}`);
    return partes.join(', ') || 'Efeito configurado';
  }
}
