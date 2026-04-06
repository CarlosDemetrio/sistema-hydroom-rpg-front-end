import { Component, computed, inject, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DrawerModule } from 'primeng/drawer';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';

import { BaseConfigComponent } from '@shared/components/base-config/base-config.component';
import {
  BaseConfigTableComponent,
  ConfigTableColumn,
} from '@shared/components/base-config/base-config-table.component';
import { VantagemConfig, CategoriaVantagem } from '@core/models';
import { AtributoConfig } from '@core/models/atributo-config.model';
import { AptidaoConfig } from '@core/models/aptidao-config.model';
import { BonusConfig, DadoProspeccaoConfig, MembroCorpoConfig } from '@core/models/config.models';
import { VantagemEfeito, CriarVantagemEfeitoDto } from '@core/models/vantagem-efeito.model';
import { VantagemConfigService } from '@core/services/business/config';
import { ConfigApiService } from '@core/services/api/config-api.service';
import { uniqueNameValidator } from '@shared/validators/config-validators';
import { EfeitoFormComponent } from './efeito-form/efeito-form.component';

@Component({
  selector: 'app-vantagens-config',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    CheckboxModule,
    ConfirmDialogModule,
    DrawerModule,
    InputNumberModule,
    InputTextModule,
    SelectModule,
    SkeletonModule,
    TabsModule,
    TagModule,
    TextareaModule,
    TooltipModule,
    BaseConfigTableComponent,
    EfeitoFormComponent,
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
              Selecione um jogo no cabeçalho para gerenciar Vantagens.
            </p>
          </div>
        </div>
      }

      <app-base-config-table
        [titulo]="'Vantagens'"
        [subtitulo]="'Configure as vantagens/perks do sistema (TCO, TCD, Saúde de Ferro, etc.)'"
        [labelNovo]="'Nova Vantagem'"
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

    <!-- DRAWER -->
    <p-drawer
      [visible]="drawerVisible()"
      (visibleChange)="onDrawerVisibleChange($event)"
      [header]="editMode() ? 'Editar Vantagem' : 'Nova Vantagem'"
      position="right"
      class="w-full md:w-35rem"
    >
      <p-tabs [value]="activeTab()">
        <p-tablist>
          <p-tab value="dados">Dados Gerais</p-tab>
          <p-tab
            value="prerequisitos"
            [disabled]="!editMode()"
            pTooltip="Salve os dados gerais primeiro para habilitar esta aba"
            tooltipPosition="top"
          >
            Pré-requisitos
            @if (selectedVantagem()?.preRequisitos?.length) {
              <span class="ml-1 badge-atributo">{{ selectedVantagem()!.preRequisitos.length }}</span>
            }
          </p-tab>
          <p-tab
            value="efeitos"
            [disabled]="!editMode()"
            pTooltip="Salve os dados gerais primeiro para habilitar esta aba"
            tooltipPosition="top"
          >
            Efeitos
            @if (efeitos().length) {
              <span class="ml-1 badge-atributo">{{ efeitos().length }}</span>
            }
          </p-tab>
        </p-tablist>

        <p-tabpanels>
          <!-- Aba: Dados Gerais -->
          <p-tabpanel value="dados">
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
                    placeholder="Ex: Treinamento em Combate Ofensivo"
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

                <!-- Sigla -->
                <div class="flex flex-column gap-2">
                  <label for="sigla" class="font-semibold">Sigla</label>
                  <input
                    pInputText
                    id="sigla"
                    formControlName="sigla"
                    placeholder="Ex: TCO"
                    style="text-transform: uppercase; font-family: var(--rpg-font-mono); font-weight: 700;"
                  />
                  <small class="text-color-secondary">Opcional. 2-5 chars maiúsculos, única por jogo.</small>
                </div>

                <!-- Categoria -->
                <div class="flex flex-column gap-2">
                  <label for="categoriaVantagemId" class="font-semibold">
                    Categoria <span class="text-red-400">*</span>
                  </label>
                  <p-select
                    inputId="categoriaVantagemId"
                    formControlName="categoriaVantagemId"
                    [options]="categoriasVantagem()"
                    optionLabel="nome"
                    optionValue="id"
                    placeholder="Selecione a categoria..."
                    [class.ng-invalid]="form.get('categoriaVantagemId')?.invalid && form.get('categoriaVantagemId')?.touched"
                  />
                  @if (form.get('categoriaVantagemId')?.invalid && form.get('categoriaVantagemId')?.touched) {
                    <small class="text-red-400">Campo obrigatório</small>
                  }
                </div>

                <!-- Nível Máximo -->
                <div class="flex flex-column gap-2">
                  <label for="nivelMaximo" class="font-semibold">
                    Nível Máximo <span class="text-red-400">*</span>
                  </label>
                  <p-input-number
                    inputId="nivelMaximo"
                    formControlName="nivelMaximo"
                    [showButtons]="true"
                    [min]="1"
                    [max]="99"
                  />
                  <small class="text-color-secondary">Quantas vezes esta vantagem pode ser melhorada.</small>
                </div>

                <!-- Fórmula de Custo -->
                <div class="flex flex-column gap-2">
                  <label for="formulaCusto" class="font-semibold">Fórmula de Custo</label>
                  <input
                    pInputText
                    id="formulaCusto"
                    formControlName="formulaCusto"
                    placeholder="Ex: nivel * 2"
                    style="font-family: var(--rpg-font-mono);"
                  />
                  <small class="text-color-secondary">
                    Variáveis: nivel (nível atual da vantagem).
                  </small>
                </div>

                <!-- Descrição Efeito -->
                <div class="flex flex-column gap-2">
                  <label for="descricaoEfeito" class="font-semibold">Descrição do Efeito</label>
                  <textarea
                    pTextarea
                    id="descricaoEfeito"
                    formControlName="descricaoEfeito"
                    [rows]="3"
                    placeholder="Ex: +1 em BBA por nível comprado"
                    [autoResize]="true"
                  ></textarea>
                </div>

                <!-- Descrição geral -->
                <div class="flex flex-column gap-2">
                  <label for="descricao" class="font-semibold">Descrição</label>
                  <textarea
                    pTextarea
                    id="descricao"
                    formControlName="descricao"
                    [rows]="3"
                    placeholder="Descrição geral da vantagem..."
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
                  [label]="editMode() ? 'Salvar Alterações' : 'Criar Vantagem'"
                  icon="pi pi-check"
                  type="submit"
                />
              </div>
            </form>
          </p-tabpanel>

          <!-- Aba: Pré-requisitos -->
          <p-tabpanel value="prerequisitos">
            <div class="flex flex-column gap-3 p-2">
              <div class="rpg-section-title">Pré-requisitos para esta Vantagem</div>
              <small class="text-color-secondary">
                O jogador deve ter todas as vantagens listadas abaixo para comprar esta.
              </small>

              @if (selectedVantagem()?.preRequisitos?.length) {
                <div class="flex flex-column gap-2">
                  @for (pr of selectedVantagem()!.preRequisitos; track pr.id) {
                    <div class="flex justify-content-between align-items-center p-3 surface-100 border-round">
                      <span class="font-semibold">{{ pr.preRequisitoNome }}</span>
                      <p-button
                        icon="pi pi-trash"
                        [rounded]="true"
                        [text]="true"
                        severity="danger"
                        (onClick)="removePreRequisito(pr.id)"
                        pTooltip="Remover pré-requisito"
                      />
                    </div>
                  }
                </div>
              } @else {
                <div class="text-center p-4 text-color-secondary">
                  <i class="pi pi-inbox text-3xl mb-2 block"></i>
                  <p class="m-0">Nenhum pré-requisito configurado</p>
                </div>
              }

              <div class="flex gap-2 mt-2">
                <p-select
                  [options]="vantagensDisponiveis()"
                  [(ngModel)]="selectedPreRequisitoId"
                  optionLabel="nome"
                  optionValue="id"
                  placeholder="Selecione uma vantagem..."
                  class="flex-1"
                />
                <p-button
                  icon="pi pi-plus"
                  label="Adicionar"
                  [disabled]="!selectedPreRequisitoId()"
                  (onClick)="addPreRequisito()"
                />
              </div>
            </div>
          </p-tabpanel>

          <!-- Aba: Efeitos Mecânicos -->
          <p-tabpanel value="efeitos">
            <div class="flex flex-column gap-3 p-2">
              <div class="rpg-section-title">Efeitos Mecânicos</div>
              <small class="text-color-secondary">
                Defina os efeitos concretos que esta vantagem concede ao personagem.
                Cada nível comprado pode aumentar os bônus conforme configurado.
              </small>

              <!-- Loading dos efeitos -->
              @if (loadingEfeitos()) {
                <div class="flex flex-column gap-2">
                  <p-skeleton height="3rem" />
                  <p-skeleton height="3rem" />
                </div>
              } @else {

                <!-- Lista de efeitos existentes -->
                @if (efeitos().length) {
                  <div class="flex flex-column gap-2">
                    @for (efeito of efeitos(); track efeito.id) {
                      <div class="flex justify-content-between align-items-center p-3 surface-100 border-round">
                        <div class="flex flex-column gap-1 flex-1">
                          <div class="flex align-items-center gap-2">
                            <p-tag [value]="efeito.tipoEfeito" severity="info" />
                            @if (efeito.atributoAlvoNome) {
                              <span class="text-sm">→ {{ efeito.atributoAlvoNome }}</span>
                            }
                            @if (efeito.aptidaoAlvoNome) {
                              <span class="text-sm">→ {{ efeito.aptidaoAlvoNome }}</span>
                            }
                            @if (efeito.bonusAlvoNome) {
                              <span class="text-sm">→ {{ efeito.bonusAlvoNome }}</span>
                            }
                            @if (efeito.membroAlvoNome) {
                              <span class="text-sm">→ {{ efeito.membroAlvoNome }}</span>
                            }
                          </div>
                          <div class="flex gap-3 text-sm text-color-secondary">
                            @if (efeito.valorFixo != null) {
                              <span>Fixo: {{ efeito.valorFixo }}</span>
                            }
                            @if (efeito.valorPorNivel != null) {
                              <span>Por nível: {{ efeito.valorPorNivel }}</span>
                            }
                            @if (efeito.descricaoEfeito) {
                              <span>{{ efeito.descricaoEfeito }}</span>
                            }
                          </div>
                        </div>
                        <p-button
                          icon="pi pi-trash"
                          [rounded]="true"
                          [text]="true"
                          severity="danger"
                          (onClick)="confirmarDelecaoEfeito(efeito)"
                          pTooltip="Remover efeito"
                        />
                      </div>
                    }
                  </div>
                } @else {
                  <div class="text-center p-4 text-color-secondary">
                    <i class="pi pi-bolt text-3xl mb-2 block"></i>
                    <p class="m-0">Nenhum efeito configurado</p>
                    <small>Adicione efeitos para definir o impacto mecânico desta vantagem.</small>
                  </div>
                }

                <!-- Formulário para novo efeito -->
                @if (mostrarFormAdicionarEfeito()) {
                  <div class="p-3 border-1 border-round surface-border">
                    <p class="font-semibold mb-3 mt-0">Novo Efeito</p>
                    <app-efeito-form
                      [vantagemId]="selectedVantagem()!.id"
                      [nivelMaximoVantagem]="selectedVantagem()!.nivelMaximo"
                      [atributosDisponiveis]="atributosConfig()"
                      [aptidoesDisponiveis]="aptidoesConfig()"
                      [bonusDisponiveis]="bonusConfig()"
                      [membrosDisponiveis]="membrosConfig()"
                      [dadosDisponiveis]="dadosConfig()"
                      (efeitoSalvo)="onEfeitoSalvo($event)"
                      (cancelar)="mostrarFormAdicionarEfeito.set(false)"
                    />
                  </div>
                }

                @if (!mostrarFormAdicionarEfeito()) {
                  <p-button
                    label="Adicionar Efeito"
                    icon="pi pi-plus"
                    [outlined]="true"
                    (onClick)="mostrarFormAdicionarEfeito.set(true)"
                  />
                }

              }
            </div>
          </p-tabpanel>

        </p-tabpanels>
      </p-tabs>
    </p-drawer>

    <p-confirmDialog />
  `,
})
export class VantagensConfigComponent extends BaseConfigComponent<
  VantagemConfig,
  VantagemConfigService
> {
  protected service = inject(VantagemConfigService);
  private confirmationService = inject(ConfirmationService);
  private configApi = inject(ConfigApiService);

  protected drawerVisible           = signal(false);
  protected loading                 = signal(false);
  protected searchQuery             = signal('');
  protected activeTab               = signal('dados');
  protected selectedVantagem        = signal<VantagemConfig | null>(null);
  protected selectedPreRequisitoId  = signal<number | null>(null);
  protected categoriasVantagem      = signal<CategoriaVantagem[]>([]);

  // Efeitos
  protected efeitos                 = signal<VantagemEfeito[]>([]);
  protected loadingEfeitos          = signal(false);
  protected mostrarFormAdicionarEfeito = signal(false);

  // Dados de configuração para os dropdowns do formulário de efeito
  protected atributosConfig  = signal<AtributoConfig[]>([]);
  protected aptidoesConfig   = signal<AptidaoConfig[]>([]);
  protected bonusConfig      = signal<BonusConfig[]>([]);
  protected membrosConfig    = signal<MembroCorpoConfig[]>([]);
  protected dadosConfig      = signal<DadoProspeccaoConfig[]>([]);

  readonly columns: ConfigTableColumn[] = [
    { field: 'ordemExibicao',  header: 'Ordem', width: '5rem' },
    { field: 'nome',           header: 'Nome' },
    { field: 'sigla',          header: 'Sigla', width: '6rem' },
    { field: 'categoriaNome',  header: 'Categoria', width: '12rem' },
    { field: 'nivelMaximo',    header: 'Nível Máx.', width: '8rem' },
  ];

  protected filteredItems = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.items();
    return this.items().filter(
      (v) =>
        v.nome?.toLowerCase().includes(q) ||
        (v.sigla ?? '').toLowerCase().includes(q) ||
        (v.categoriaNome ?? '').toLowerCase().includes(q),
    );
  });

  protected vantagensDisponiveis = computed(() => {
    const self = this.selectedVantagem()?.id;
    const jaIds = new Set((this.selectedVantagem()?.preRequisitos ?? []).map((p) => p.preRequisitoId));
    return this.items().filter((v) => v.id !== self && !jaIds.has(v.id));
  });

  protected getEntityName(): string { return 'Vantagem'; }
  protected getEntityNamePlural(): string { return 'Vantagens'; }

  protected buildForm(): FormGroup {
    return this.fb.group({
      nome:                ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      sigla:               ['', [Validators.maxLength(5)]],
      categoriaVantagemId: [null, [Validators.required]],
      nivelMaximo:         [1,    [Validators.required, Validators.min(1)]],
      formulaCusto:        ['',   [Validators.maxLength(200)]],
      descricaoEfeito:     ['',   [Validators.maxLength(500)]],
      descricao:           ['',   [Validators.maxLength(500)]],
      ordemExibicao:       [1,    [Validators.required, Validators.min(1)]],
    });
  }

  override ngOnInit(): void {
    super.ngOnInit();
    const jogoId = this.service.currentGameId();
    if (jogoId) {
      this.configApi.listCategoriasVantagem(jogoId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({ next: (c) => this.categoriasVantagem.set(c) });

      this.configApi.listAtributos(jogoId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({ next: (a) => this.atributosConfig.set(a) });

      this.configApi.listAptidoes(jogoId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({ next: (a) => this.aptidoesConfig.set(a) });

      this.configApi.listBonus(jogoId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({ next: (b) => this.bonusConfig.set(b) });

      this.configApi.listMembrosCorpo(jogoId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({ next: (m) => this.membrosConfig.set(m) });

      this.configApi.listDadosProspeccao(jogoId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({ next: (d) => this.dadosConfig.set(d) });
    }
  }

  openDrawer(item?: VantagemConfig): void {
    this.openDialog(item);
    this.selectedVantagem.set(item ?? null);
    this.activeTab.set('dados');
    this.efeitos.set([]);
    this.mostrarFormAdicionarEfeito.set(false);
    this.drawerVisible.set(true);
    if (item?.id) {
      this.carregarEfeitos(item.id);
    }
  }

  closeDrawer(): void {
    this.drawerVisible.set(false);
    this.selectedVantagem.set(null);
    this.efeitos.set([]);
    this.mostrarFormAdicionarEfeito.set(false);
    this.closeDialog();
  }

  protected onDrawerVisibleChange(visible: boolean): void {
    if (!visible) this.closeDrawer();
  }

  override openDialog(item?: VantagemConfig): void {
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
      next: (v) => {
        const action = this.editMode() ? 'atualizada' : 'criada';
        this.toastService.success(`Vantagem ${action} com sucesso`, 'Sucesso');
        if (!this.editMode()) {
          this.selectedVantagem.set(v);
          this.activeTab.set('prerequisitos');
          this.editMode.set(true);
          this.currentEditId.set(v.id);
          this.carregarEfeitos(v.id);
        }
        this.loadData();
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  addPreRequisito(): void {
    const vantagemId = this.selectedVantagem()?.id;
    const prId = this.selectedPreRequisitoId();
    if (!vantagemId || !prId) return;
    this.configApi.addVantagemPreRequisito(vantagemId, { preRequisitoId: prId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.selectedPreRequisitoId.set(null);
          this.refreshSelectedVantagem(vantagemId);
          this.toastService.success('Pré-requisito adicionado', 'Sucesso');
        },
      });
  }

  removePreRequisito(prId: number): void {
    const vantagemId = this.selectedVantagem()?.id;
    if (!vantagemId) return;
    this.configApi.removeVantagemPreRequisito(vantagemId, prId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.refreshSelectedVantagem(vantagemId);
          this.toastService.success('Pré-requisito removido', 'Sucesso');
        },
      });
  }

  private refreshSelectedVantagem(vantagemId: number): void {
    this.configApi.getVantagem(vantagemId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (v) => this.selectedVantagem.set(v) });
  }

  // ============================================================
  // Efeitos Mecânicos
  // ============================================================

  private carregarEfeitos(vantagemId: number): void {
    const jogoId = this.currentGameId();
    if (!jogoId) return;
    this.loadingEfeitos.set(true);
    this.configApi.listVantagemEfeitos(jogoId, vantagemId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (lista) => {
          this.efeitos.set(lista);
          this.loadingEfeitos.set(false);
        },
        error: () => this.loadingEfeitos.set(false),
      });
  }

  onEfeitoSalvo(dto: CriarVantagemEfeitoDto): void {
    const vantagemId = this.selectedVantagem()?.id;
    const jogoId     = this.currentGameId();
    if (!vantagemId || !jogoId) return;

    this.configApi.criarVantagemEfeito(jogoId, vantagemId, dto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.mostrarFormAdicionarEfeito.set(false);
          this.carregarEfeitos(vantagemId);
          this.toastService.success('Efeito adicionado com sucesso', 'Sucesso');
        },
      });
  }

  confirmarDelecaoEfeito(efeito: VantagemEfeito): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja remover o efeito "${efeito.tipoEfeito}"? Esta ação não pode ser desfeita.`,
      header: 'Confirmar Remoção',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, remover',
      rejectLabel: 'Cancelar',
      acceptButtonProps: { severity: 'danger' },
      accept: () => this.deletarEfeito(efeito),
    });
  }

  private deletarEfeito(efeito: VantagemEfeito): void {
    const vantagemId = this.selectedVantagem()?.id;
    const jogoId     = this.currentGameId();
    if (!vantagemId || !jogoId) return;

    this.configApi.deletarVantagemEfeito(jogoId, vantagemId, efeito.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.carregarEfeitos(vantagemId);
          this.toastService.success('Efeito removido com sucesso', 'Sucesso');
        },
      });
  }

  override confirmDelete(id: number): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir esta Vantagem? Esta ação não pode ser desfeita.',
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
    this.configApi.reordenarVantagens(jogoId, { itens: payload.map((p) => ({ id: p.itemId, ordemExibicao: p.novaOrdem })) })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.toastService.success('Ordem salva com sucesso.', 'Reordenação'),
        error: () => this.toastService.error('Erro ao salvar a ordem.', 'Reordenação'),
      });
  }
}
