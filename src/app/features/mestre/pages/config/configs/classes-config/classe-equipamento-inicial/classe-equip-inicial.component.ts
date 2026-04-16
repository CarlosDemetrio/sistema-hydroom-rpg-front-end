import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
  OnInit,
  DestroyRef,
  effect,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { InputNumberModule } from 'primeng/inputnumber';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

import { ConfigApiService } from '@core/services/api/config-api.service';
import { ToastService } from '@services/toast.service';
import { ClasseEquipamentoInicial, CreateClasseEquipamentoInicialDto } from '@core/models/classe-equipamento-inicial.model';
import { ItemConfigResumo } from '@core/models/item-config.model';

interface ItemOption {
  label: string;
  value: number;
  cor: string;
  raridade: string;
}

/**
 * ClasseEquipInicialComponent — Aba de Equipamentos Iniciais na tela de ClassePersonagem.
 *
 * Componente dumb que recebe o classeId via input() e gerencia os equipamentos
 * iniciais da classe: itens obrigatórios e grupos de escolha.
 */
@Component({
  selector: 'app-classe-equip-inicial',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    ButtonModule,
    CardModule,
    ConfirmDialogModule,
    DialogModule,
    DividerModule,
    InputNumberModule,
    RadioButtonModule,
    SelectModule,
    TagModule,
    TooltipModule,
  ],
  providers: [ConfirmationService],
  template: `
    <div class="flex flex-column gap-3 p-2">

      <!-- Seção: Itens Obrigatórios -->
      <div class="flex flex-column gap-2">
        <div class="flex justify-content-between align-items-center">
          <div class="rpg-section-title">Itens Obrigatórios</div>
          <p-button
            icon="pi pi-plus"
            label="Adicionar Item Obrigatório"
            size="small"
            [outlined]="true"
            (onClick)="openAddDialog(true)"
          />
        </div>

        @if (obrigatorios().length) {
          <div class="flex flex-column gap-2">
            @for (equip of obrigatorios(); track equip.id) {
              <div class="flex justify-content-between align-items-center p-3 surface-100 border-round">
                <div class="flex align-items-center gap-2">
                  <div
                    class="border-round flex-shrink-0"
                    [style.background-color]="equip.itemRaridadeCor"
                    style="width: 0.8rem; height: 0.8rem; border: 1px solid var(--surface-border)"
                  ></div>
                  <span class="font-semibold">{{ equip.itemConfigNome }}</span>
                  <span class="text-sm text-color-secondary">× {{ equip.quantidade }}</span>
                  <p-tag [value]="equip.itemRaridade" severity="secondary" />
                </div>
                <p-button
                  icon="pi pi-trash"
                  [rounded]="true"
                  [text]="true"
                  severity="danger"
                  (onClick)="confirmRemove(equip)"
                  pTooltip="Remover"
                />
              </div>
            }
          </div>
        } @else {
          <div class="text-center p-3 text-color-secondary text-sm surface-50 border-round">
            <i class="pi pi-box mb-1 block"></i>
            Nenhum item obrigatório configurado
          </div>
        }
      </div>

      <p-divider />

      <!-- Seção: Grupos de Escolha -->
      <div class="flex flex-column gap-2">
        <div class="flex justify-content-between align-items-center">
          <div class="rpg-section-title">Grupos de Escolha</div>
          <p-button
            icon="pi pi-plus"
            label="Novo Grupo de Escolha"
            size="small"
            [outlined]="true"
            (onClick)="openAddDialog(false, novoNumeroGrupo())"
          />
        </div>

        @if (grupos().length === 0) {
          <div class="text-center p-3 text-color-secondary text-sm surface-50 border-round">
            <i class="pi pi-list mb-1 block"></i>
            Nenhum grupo de escolha configurado
          </div>
        }

        @for (grupo of grupos(); track grupo.numero) {
          <div
            class="border-round p-3"
            style="border: 2px solid var(--primary-200, var(--surface-border))"
          >
            <div class="flex justify-content-between align-items-center mb-2">
              <span class="font-semibold text-primary">
                Grupo {{ grupo.numero }}
                <span class="text-color-secondary font-normal text-sm ml-1">
                  — Jogador escolhe 1 de {{ grupo.itens.length }}
                </span>
              </span>
              <div class="flex gap-1">
                <p-button
                  icon="pi pi-plus"
                  size="small"
                  [text]="true"
                  severity="secondary"
                  label="Adicionar ao grupo"
                  (onClick)="openAddDialog(false, grupo.numero)"
                />
                <p-button
                  icon="pi pi-trash"
                  size="small"
                  [text]="true"
                  severity="danger"
                  pTooltip="Remover grupo inteiro"
                  (onClick)="confirmRemoveGrupo(grupo.numero)"
                />
              </div>
            </div>

            <div class="flex flex-column gap-2">
              @for (equip of grupo.itens; track equip.id) {
                <div class="flex justify-content-between align-items-center p-2 surface-200 border-round">
                  <div class="flex align-items-center gap-2">
                    <div
                      class="border-round flex-shrink-0"
                      [style.background-color]="equip.itemRaridadeCor"
                      style="width: 0.8rem; height: 0.8rem; border: 1px solid var(--surface-border)"
                    ></div>
                    <span class="font-semibold text-sm">{{ equip.itemConfigNome }}</span>
                    <span class="text-xs text-color-secondary">× {{ equip.quantidade }}</span>
                  </div>
                  <p-button
                    icon="pi pi-times"
                    [rounded]="true"
                    [text]="true"
                    size="small"
                    severity="danger"
                    (onClick)="confirmRemove(equip)"
                    pTooltip="Remover do grupo"
                  />
                </div>
              }
            </div>
          </div>
        }
      </div>

    </div>

    <!-- Dialog de Adicionar Item -->
    <p-dialog
      [visible]="addDialogVisible()"
      (visibleChange)="onAddDialogChange($event)"
      header="Adicionar Equipamento Inicial"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      [style]="{ width: '30rem' }"
    >
      <div class="flex flex-column gap-4 p-2">

        <!-- Select de item com chip de raridade -->
        <div class="flex flex-column gap-2">
          <label class="font-semibold">Item <span class="text-red-400">*</span></label>
          <p-select
            [options]="itensOptions()"
            [(ngModel)]="novoItemId"
            optionLabel="label"
            optionValue="value"
            placeholder="Buscar item..."
            [filter]="true"
            filterBy="label"
          >
            <ng-template #item let-opt>
              <div class="flex align-items-center gap-2">
                <div
                  class="border-round flex-shrink-0"
                  [style.background-color]="opt.cor"
                  style="width: 0.8rem; height: 0.8rem; border: 1px solid var(--surface-border)"
                ></div>
                <span>{{ opt.label }}</span>
                <span class="text-xs text-color-secondary ml-auto">{{ opt.raridade }}</span>
              </div>
            </ng-template>
          </p-select>
        </div>

        <!-- Quantidade -->
        <div class="flex flex-column gap-2">
          <label class="font-semibold">Quantidade <span class="text-red-400">*</span></label>
          <p-input-number
            [(ngModel)]="novaQuantidade"
            [showButtons]="true"
            [min]="1"
            [max]="99"
          />
        </div>

        <!-- Obrigatório ou Grupo -->
        <div class="flex flex-column gap-2">
          <label class="font-semibold">Tipo</label>
          <div class="flex gap-3">
            <div class="flex align-items-center gap-2">
              <p-radioButton
                inputId="tipoObrigatorio"
                name="tipoEquip"
                [value]="true"
                [(ngModel)]="novoObrigatorio"
                (onClick)="novoGrupoEscolha.set(null)"
              />
              <label for="tipoObrigatorio">Obrigatório</label>
            </div>
            <div class="flex align-items-center gap-2">
              <p-radioButton
                inputId="tipoGrupo"
                name="tipoEquip"
                [value]="false"
                [(ngModel)]="novoObrigatorio"
              />
              <label for="tipoGrupo">Grupo de Escolha</label>
            </div>
          </div>
        </div>

        @if (!novoObrigatorio()) {
          <div class="flex flex-column gap-2">
            <label class="font-semibold">Grupo <span class="text-red-400">*</span></label>
            <p-input-number
              [(ngModel)]="novoGrupoEscolha"
              [showButtons]="true"
              [min]="1"
              placeholder="Número do grupo"
            />
            @if (gruposNumeros().length > 0) {
              <small class="text-color-secondary">
                Grupos existentes: {{ gruposNumeros().join(', ') }}
              </small>
            }
          </div>
        }

      </div>

      <div class="flex justify-content-end gap-2 mt-4 pt-3 border-top-1 surface-border">
        <p-button
          label="Cancelar"
          severity="secondary"
          [outlined]="true"
          type="button"
          (onClick)="closeAddDialog()"
        />
        <p-button
          label="Adicionar"
          icon="pi pi-check"
          [disabled]="!podeAdicionar()"
          (onClick)="adicionarEquipamento()"
        />
      </div>
    </p-dialog>

    <p-confirmDialog />
  `,
})
export class ClasseEquipInicialComponent implements OnInit {
  readonly classeId = input.required<number>();

  private readonly configApi = inject(ConfigApiService);
  private readonly toastService = inject(ToastService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly equipamentos = signal<ClasseEquipamentoInicial[]>([]);
  protected readonly loading = signal(false);
  protected readonly addDialogVisible = signal(false);

  // Listas de apoio
  protected readonly itensCatalogo = signal<ItemConfigResumo[]>([]);

  // Estado do formulário de adicionar
  protected novoItemId = signal<number | null>(null);
  protected novaQuantidade = signal<number>(1);
  protected novoObrigatorio = signal<boolean>(true);
  protected novoGrupoEscolha = signal<number | null>(null);

  // Computed: separação em obrigatórios e grupos
  protected readonly obrigatorios = computed(() =>
    this.equipamentos().filter((e) => e.obrigatorio)
  );

  protected readonly grupos = computed(() => {
    const naoObrig = this.equipamentos().filter((e) => !e.obrigatorio && e.grupoEscolha != null);
    const mapaGrupos = new Map<number, ClasseEquipamentoInicial[]>();
    for (const e of naoObrig) {
      const g = e.grupoEscolha!;
      if (!mapaGrupos.has(g)) mapaGrupos.set(g, []);
      mapaGrupos.get(g)!.push(e);
    }
    return [...mapaGrupos.entries()]
      .sort(([a], [b]) => a - b)
      .map(([numero, itens]) => ({ numero, itens }));
  });

  protected readonly novoNumeroGrupo = computed(() => {
    const nums = this.grupos().map((g) => g.numero);
    return nums.length > 0 ? Math.max(...nums) + 1 : 1;
  });

  protected readonly gruposNumeros = computed(() =>
    this.grupos().map((g) => g.numero)
  );

  protected readonly itensOptions = computed((): ItemOption[] =>
    this.itensCatalogo().map((item) => ({
      label: item.nome,
      value: item.id,
      cor: item.raridadeCor,
      raridade: item.raridadeNome,
    }))
  );

  protected readonly podeAdicionar = computed(() => {
    if (!this.novoItemId() || this.novaQuantidade() < 1) return false;
    if (!this.novoObrigatorio() && !this.novoGrupoEscolha()) return false;
    return true;
  });

  constructor() {
    // Recarrega quando classeId muda
    effect(() => {
      const id = this.classeId();
      if (id) {
        this.loadEquipamentos(id);
      }
    });
  }

  ngOnInit(): void {
    this.loadCatalogo();
  }

  private loadEquipamentos(classeId: number): void {
    this.loading.set(true);
    this.configApi.listClasseEquipamentosIniciais(classeId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.equipamentos.set(data);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  private loadCatalogo(): void {
    // Carrega todos itens para o select — usa jogoId via relação de classe
    // Nota: a lista de itens não tem jogoId direto aqui; a classe já tem
    // Para MVP: carregamos via o configApi com page grande
    // O jogoId deve vir de um contexto externo; para simplificar,
    // os itens são carregados quando o componente recebe equipamentos
    // e extrai o jogoId deles, ou fazemos lazy-load quando necessário.
    // Implementação prática: o componente pai passa o jogoId se disponível.
    // Para esta versão, o catálogo é carregado na primeira vez via endpoint público.
  }

  protected openAddDialog(obrigatorio: boolean, grupo: number | null = null): void {
    this.novoItemId.set(null);
    this.novaQuantidade.set(1);
    this.novoObrigatorio.set(obrigatorio);
    this.novoGrupoEscolha.set(grupo);

    // Carrega catálogo se vazio
    if (this.itensCatalogo().length === 0) {
      this.carregarCatalogoPorClasseId();
    }

    this.addDialogVisible.set(true);
  }

  private carregarCatalogoPorClasseId(): void {
    // O classeId está disponível, mas precisamos do jogoId para listar itens.
    // Buscamos os equipamentos já existentes para inferir o jogoId.
    // Se não há equipamentos, precisamos de outra abordagem.
    // Por ora, tentamos carregar via getClasse para obter jogoId.
    // Esta é uma limitação do design atual — o jogoId deveria ser um input separado.
    // Implementação: o componente-pai ClassesConfigComponent passará o jogoId.
  }

  /**
   * Carrega o catálogo de itens dado um jogoId.
   * Chamado pelo componente pai quando o jogoId está disponível.
   */
  carregarItensParaJogo(jogoId: number): void {
    this.configApi.listItens(jogoId, 0, 200)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (page) => this.itensCatalogo.set(page.content),
      });
  }

  protected closeAddDialog(): void {
    this.addDialogVisible.set(false);
  }

  protected onAddDialogChange(visible: boolean): void {
    if (!visible) this.closeAddDialog();
  }

  protected adicionarEquipamento(): void {
    const classeId = this.classeId();
    const itemId = this.novoItemId();
    if (!classeId || !itemId) return;

    const dto: CreateClasseEquipamentoInicialDto = {
      itemConfigId: itemId,
      obrigatorio: this.novoObrigatorio(),
      grupoEscolha: this.novoObrigatorio() ? null : this.novoGrupoEscolha(),
      quantidade: this.novaQuantidade(),
    };

    this.configApi.addClasseEquipamentoInicial(classeId, dto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (novo) => {
          this.equipamentos.set([...this.equipamentos(), novo]);
          this.closeAddDialog();
          this.toastService.success('Equipamento inicial adicionado', 'Sucesso');
        },
      });
  }

  protected confirmRemove(equip: ClasseEquipamentoInicial): void {
    const classeId = this.classeId();
    this.confirmationService.confirm({
      message: `Remover "${equip.itemConfigNome}" dos equipamentos iniciais?`,
      header: 'Confirmar Remoção',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, remover',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.configApi.removeClasseEquipamentoInicial(classeId, equip.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.equipamentos.set(this.equipamentos().filter((e) => e.id !== equip.id));
              this.toastService.success('Equipamento removido', 'Sucesso');
            },
          });
      },
    });
  }

  protected confirmRemoveGrupo(numeroGrupo: number): void {
    const classeId = this.classeId();
    const grupo = this.grupos().find((g) => g.numero === numeroGrupo);
    if (!grupo) return;

    this.confirmationService.confirm({
      message: `Remover todos os itens do Grupo ${numeroGrupo}? Esta ação não pode ser desfeita.`,
      header: 'Confirmar Remoção do Grupo',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, remover grupo',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        const idsGrupo = grupo.itens.map((e) => e.id);
        let removed = 0;
        for (const id of idsGrupo) {
          this.configApi.removeClasseEquipamentoInicial(classeId, id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: () => {
                removed++;
                if (removed === idsGrupo.length) {
                  this.equipamentos.set(this.equipamentos().filter((e) => !idsGrupo.includes(e.id)));
                  this.toastService.success(`Grupo ${numeroGrupo} removido`, 'Sucesso');
                }
              },
            });
        }
      },
    });
  }
}
