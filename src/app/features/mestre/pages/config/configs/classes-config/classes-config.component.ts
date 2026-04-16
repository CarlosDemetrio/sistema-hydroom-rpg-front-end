import { Component, computed, inject, signal, ViewChild } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';

import { BaseConfigComponent } from '@shared/components/base-config/base-config.component';
import {
  BaseConfigTableComponent,
  ConfigTableColumn,
} from '@shared/components/base-config/base-config-table.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ClassePersonagem, BonusConfig, AptidaoConfig } from '@core/models';
import { ClassePontosConfig, ClassePontosConfigRequest } from '@core/models/classe-pontos-config.model';
import { ClasseVantagemPreDefinida, ClasseVantagemPreDefinidaRequest } from '@core/models/classe-vantagem-predefinida.model';
import { VantagemConfig } from '@core/models/vantagem-config.model';
import { ClasseConfigService } from '@core/services/business/config';
import { ConfigApiService } from '@core/services/api/config-api.service';
import { uniqueNameValidator } from '@shared/validators/config-validators';
import { ClasseEquipInicialComponent } from './classe-equipamento-inicial/classe-equip-inicial.component';

@Component({
  selector: 'app-classes-config',
  standalone: true,
  imports: [
    DecimalPipe,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    CheckboxModule,
    ConfirmDialogModule,
    DialogModule,
    InputNumberModule,
    InputTextModule,
    TableModule,
    TabsModule,
    TagModule,
    TextareaModule,
    TooltipModule,
    SelectModule,
    BaseConfigTableComponent,
    ClasseEquipInicialComponent,
    PageHeaderComponent,
  ],
  providers: [ConfirmationService],
  template: `
    <app-page-header title="Classes" backRoute="/mestre/config" />
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
              Selecione um jogo no cabeçalho para gerenciar Classes.
            </p>
          </div>
        </div>
      }

      <app-base-config-table
        [titulo]="'Classes'"
        [subtitulo]="'Configure as classes de personagem (Guerreiro, Mago, Ladino, etc.)'"
        [labelNovo]="'Nova Classe'"
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

    <!-- DIALOG -->
    <p-dialog
      [visible]="drawerVisible()"
      (visibleChange)="onDrawerVisibleChange($event)"
      [header]="editMode() ? 'Editar Classe' : 'Nova Classe'"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      [style]="{ width: '56rem', maxWidth: '95vw' }"
    >
      <p-tabs [value]="activeTab()" (valueChange)="onTabChange($event)">
        <p-tablist>
          <p-tab value="dados">Dados Gerais</p-tab>
          <p-tab
            value="bonus"
            [disabled]="!editMode()"
            pTooltip="Salve os dados gerais primeiro para habilitar esta aba"
            tooltipPosition="top"
          >
            Bônus
            @if (selectedClasse()?.bonusConfig?.length) {
              <span class="ml-1 badge-atributo">{{ selectedClasse()!.bonusConfig.length }}</span>
            }
          </p-tab>
          <p-tab
            value="aptidoes"
            [disabled]="!editMode()"
            pTooltip="Salve os dados gerais primeiro para habilitar esta aba"
            tooltipPosition="top"
          >
            Aptidões c/ Bônus
            @if (selectedClasse()?.aptidaoBonus?.length) {
              <span class="ml-1 badge-atributo">{{ selectedClasse()!.aptidaoBonus.length }}</span>
            }
          </p-tab>
          <p-tab
            value="pontos-nivel"
            [disabled]="!editMode()"
            pTooltip="Salve os dados gerais primeiro para habilitar esta aba"
            tooltipPosition="top"
          >
            Pontos por Nível
            @if (pontosConfig().length) {
              <span class="ml-1 badge-atributo">{{ pontosConfig().length }}</span>
            }
          </p-tab>
          <p-tab
            value="vantagens-predefinidas"
            [disabled]="!editMode()"
            pTooltip="Salve os dados gerais primeiro para habilitar esta aba"
            tooltipPosition="top"
          >
            Vantagens Pré-definidas
            @if (vantagensPreDefinidas().length) {
              <span class="ml-1 badge-atributo">{{ vantagensPreDefinidas().length }}</span>
            }
          </p-tab>
          <p-tab
            value="equipamentos-iniciais"
            [disabled]="!editMode()"
            pTooltip="Salve os dados gerais primeiro para habilitar esta aba"
            tooltipPosition="top"
          >
            Equipamentos Iniciais
          </p-tab>
        </p-tablist>

        <!-- Aba: Dados Gerais -->
        <p-tabpanels>
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
                    placeholder="Ex: Guerreiro"
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

                <!-- Descrição -->
                <div class="flex flex-column gap-2">
                  <label for="descricao" class="font-semibold">Descrição</label>
                  <textarea
                    pTextarea
                    id="descricao"
                    formControlName="descricao"
                    [rows]="4"
                    placeholder="Descreva a classe, suas habilidades e estilo de jogo..."
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
                  [label]="editMode() ? 'Salvar Alterações' : 'Criar Classe'"
                  icon="pi pi-check"
                  type="submit"
                />
              </div>
            </form>
          </p-tabpanel>

          <!-- Aba: Bônus por Nível -->
          <p-tabpanel value="bonus">
            <div class="flex flex-column gap-3 p-2">
              <div class="rpg-section-title">Bônus de Combate / Atributo por Nível</div>

              @if (selectedClasse()?.bonusConfig?.length) {
                <div class="flex flex-column gap-2">
                  @for (bonus of selectedClasse()!.bonusConfig; track bonus.id) {
                    <div class="flex justify-content-between align-items-center p-3 surface-100 border-round">
                      <div class="flex flex-column gap-1">
                        <span class="font-semibold">{{ bonus.bonusNome }}</span>
                        <span class="text-sm text-color-secondary">
                          +{{ bonus.valorPorNivel | number:'1.0-2' }} por nível
                        </span>
                        @if (getBonusFormula(bonus.bonusConfigId); as formula) {
                          <code class="text-xs text-color-secondary font-mono">{{ formula }}</code>
                        }
                      </div>
                      <p-button
                        icon="pi pi-trash"
                        [rounded]="true"
                        [text]="true"
                        severity="danger"
                        (onClick)="removeClasseBonus(bonus.id)"
                        pTooltip="Remover bônus"
                      />
                    </div>
                  }
                </div>
              } @else {
                <div class="text-center p-4 text-color-secondary">
                  <i class="pi pi-inbox text-3xl mb-2 block"></i>
                  <p class="m-0">Nenhum bônus configurado</p>
                </div>
              }

              <!-- Adicionar bônus -->
              <div class="flex flex-column gap-2 mt-2">
                <p-select
                  [options]="bonusDisponiveis()"
                  [(ngModel)]="selectedBonusId"
                  optionLabel="nome"
                  optionValue="id"
                  placeholder="Selecione um bônus..."
                  class="w-full"
                />
                <div class="flex gap-2 align-items-end">
                  <div class="flex flex-column gap-1 flex-1">
                    <label class="text-sm font-semibold">Valor por nível</label>
                    <p-input-number
                      [(ngModel)]="valorPorNivelInput"
                      [showButtons]="true"
                      [min]="0.01"
                      [step]="0.01"
                      [minFractionDigits]="2"
                      [maxFractionDigits]="2"
                      style="width: 100%"
                    />
                    @if (selectedBonusId() && valorPorNivelInput() > 0) {
                      <small class="text-color-secondary">
                        Exemplo no nível 5: +{{ (valorPorNivelInput() * 5) | number:'1.0-2' }}
                      </small>
                    }
                  </div>
                  <p-button
                    icon="pi pi-plus"
                    label="Adicionar"
                    [disabled]="!selectedBonusId() || valorPorNivelInput() <= 0"
                    (onClick)="addClasseBonus()"
                  />
                </div>
              </div>
            </div>
          </p-tabpanel>

          <!-- Aba: Aptidões com bônus -->
          <p-tabpanel value="aptidoes">
            <div class="flex flex-column gap-3 p-2">
              <div class="rpg-section-title">Aptidões com Bônus de Classe</div>

              @if (selectedClasse()?.aptidaoBonus?.length) {
                <div class="flex flex-column gap-2">
                  @for (apt of selectedClasse()!.aptidaoBonus; track apt.id) {
                    <div class="flex justify-content-between align-items-center p-3 surface-100 border-round">
                      <div class="flex align-items-center gap-2">
                        <span class="font-semibold">{{ apt.aptidaoNome }}</span>
                        <span class="text-sm font-semibold text-green-400">+{{ apt.bonus }}</span>
                      </div>
                      <p-button
                        icon="pi pi-trash"
                        [rounded]="true"
                        [text]="true"
                        severity="danger"
                        (onClick)="removeClasseAptidaoBonus(apt.id)"
                        pTooltip="Remover aptidão"
                      />
                    </div>
                  }
                </div>
              } @else {
                <div class="text-center p-4 text-color-secondary">
                  <i class="pi pi-inbox text-3xl mb-2 block"></i>
                  <p class="m-0">Nenhuma aptidão com bônus configurada</p>
                </div>
              }

              <!-- Adicionar aptidão -->
              <div class="flex gap-2 mt-2">
                <p-select
                  [options]="aptidoesDisponiveis()"
                  [(ngModel)]="selectedAptidaoId"
                  optionLabel="nome"
                  optionValue="id"
                  placeholder="Selecione uma aptidão..."
                  class="flex-1"
                />
                <p-input-number
                  [(ngModel)]="bonusAptidaoInput"
                  [showButtons]="true"
                  [min]="0"
                  placeholder="Bônus"
                  pTooltip="Bônus fixo (mín. 0)"
                  style="width: 7rem"
                />
                <p-button
                  icon="pi pi-plus"
                  label="Adicionar"
                  [disabled]="!selectedAptidaoId() || bonusAptidaoInput() < 0"
                  (onClick)="addClasseAptidaoBonus()"
                />
              </div>
            </div>
          </p-tabpanel>

          <!-- Aba: Pontos por Nível -->
          <p-tabpanel value="pontos-nivel">
            <div class="flex flex-column gap-3 p-2">
              <div class="rpg-section-title">Pontos Ganhos por Nível</div>

              @if (pontosConfig().length) {
                <p-table [value]="pontosConfigOrdenado()" [tableStyle]="{'min-width': '100%'}">
                  <ng-template pTemplate="header">
                    <tr>
                      <th>Nível</th>
                      <th>Pts. Atributo</th>
                      <th>Pts. Vantagem</th>
                      <th style="width: 5rem"></th>
                    </tr>
                  </ng-template>
                  <ng-template pTemplate="body" let-pontos>
                    <tr>
                      <td>{{ pontos.nivel }}</td>
                      <td>{{ pontos.pontosAtributo }}</td>
                      <td>{{ pontos.pontosVantagem }}</td>
                      <td>
                        <p-button
                          icon="pi pi-trash"
                          [rounded]="true"
                          [text]="true"
                          severity="danger"
                          (onClick)="confirmRemoveClassePontos(pontos.id)"
                        />
                      </td>
                    </tr>
                  </ng-template>
                </p-table>
              } @else {
                <div class="text-center p-4 text-color-secondary">
                  <i class="pi pi-inbox text-3xl mb-2 block"></i>
                  <p class="m-0">Nenhum nível configurado</p>
                </div>
              }

              <!-- Add form -->
              <div class="flex flex-column gap-2 border-top-1 surface-border pt-3 mt-2">
                <div class="text-sm font-semibold text-color-secondary">Adicionar Nível</div>
                <div class="flex gap-2 align-items-end flex-wrap">
                  <div class="flex flex-column gap-1">
                    <label class="text-xs font-semibold">Nível</label>
                    <p-input-number [(ngModel)]="novoNivelPontos" [showButtons]="true" [min]="1" style="width: 6rem" />
                  </div>
                  <div class="flex flex-column gap-1">
                    <label class="text-xs font-semibold">Pts. Atributo</label>
                    <p-input-number [(ngModel)]="novoPontosAtributo" [showButtons]="true" [min]="0" style="width: 8rem" />
                  </div>
                  <div class="flex flex-column gap-1">
                    <label class="text-xs font-semibold">Pts. Vantagem</label>
                    <p-input-number [(ngModel)]="novoPontosVantagem" [showButtons]="true" [min]="0" style="width: 8rem" />
                  </div>
                  <p-button
                    icon="pi pi-plus"
                    label="Adicionar"
                    [disabled]="novoNivelPontos() < 1"
                    (onClick)="addClassePontos()"
                  />
                </div>
              </div>
            </div>
          </p-tabpanel>

          <!-- Aba: Vantagens Pré-definidas -->
          <p-tabpanel value="vantagens-predefinidas">
            <div class="flex flex-column gap-3 p-2">
              <div class="rpg-section-title">Vantagens Concedidas por Nível</div>
              <small class="text-color-secondary">
                Vantagens automaticamente atribuídas ao personagem ao atingir o nível configurado.
              </small>

              @if (vantagensPreDefinidas().length) {
                <div class="flex flex-column gap-2">
                  @for (vp of vantagensPreDefinidasOrdenadas(); track vp.id) {
                    <div class="flex justify-content-between align-items-center p-3 surface-100 border-round">
                      <div class="flex align-items-center gap-2">
                        <span class="text-xs font-semibold surface-200 border-round px-2 py-1">Nv. {{ vp.nivel }}</span>
                        <span class="font-semibold">{{ vp.vantagemConfigNome }}</span>
                      </div>
                      <p-button
                        icon="pi pi-trash"
                        [rounded]="true"
                        [text]="true"
                        severity="danger"
                        (onClick)="confirmRemoveClasseVantagem(vp.id)"
                        pTooltip="Remover vantagem"
                      />
                    </div>
                  }
                </div>
              } @else {
                <div class="text-center p-4 text-color-secondary">
                  <i class="pi pi-inbox text-3xl mb-2 block"></i>
                  <p class="m-0">Nenhuma vantagem pré-definida</p>
                </div>
              }

              <!-- Add form -->
              <div class="flex gap-2 mt-2 align-items-end flex-wrap">
                <div class="flex flex-column gap-1">
                  <label class="text-xs font-semibold">Nível</label>
                  <p-input-number [(ngModel)]="novoNivelVantagem" [showButtons]="true" [min]="1" style="width: 6rem" />
                </div>
                <p-select
                  [options]="todasVantagens()"
                  [(ngModel)]="selectedVantagemId"
                  optionLabel="nome"
                  optionValue="id"
                  placeholder="Selecione uma vantagem..."
                  class="flex-1"
                  [filter]="true"
                  filterBy="nome"
                />
                <p-button
                  icon="pi pi-plus"
                  label="Adicionar"
                  [disabled]="!selectedVantagemId() || novoNivelVantagem() < 1"
                  (onClick)="addClasseVantagemPreDefinida()"
                />
              </div>
            </div>
          </p-tabpanel>

          <!-- Aba: Equipamentos Iniciais -->
          <p-tabpanel value="equipamentos-iniciais">
            @if (selectedClasse()?.id) {
              <app-classe-equip-inicial
                [classeId]="selectedClasse()!.id"
                #equipInicialRef
              />
            }
          </p-tabpanel>
        </p-tabpanels>
      </p-tabs>
    </p-dialog>

    <p-confirmDialog />
  `,
})
export class ClassesConfigComponent extends BaseConfigComponent<
  ClassePersonagem,
  ClasseConfigService
> {
  protected service = inject(ClasseConfigService);
  private confirmationService = inject(ConfirmationService);
  private configApi = inject(ConfigApiService);

  @ViewChild('equipInicialRef') equipInicialRef?: ClasseEquipInicialComponent;

  protected drawerVisible = signal(false);
  protected loading = signal(false);
  protected searchQuery = signal('');
  protected activeTab = signal('dados');
  protected selectedClasse = signal<ClassePersonagem | null>(null);

  // Para sub-recursos
  protected todosBonus = signal<BonusConfig[]>([]);
  protected todasAptidoes = signal<AptidaoConfig[]>([]);
  protected selectedBonusId = signal<number | null>(null);
  protected selectedAptidaoId = signal<number | null>(null);
  protected valorPorNivelInput = signal<number>(1.0);
  protected bonusAptidaoInput = signal<number>(0);

  // Sinais para Pontos por Nível e Vantagens Pré-definidas
  protected pontosConfig = signal<ClassePontosConfig[]>([]);
  protected vantagensPreDefinidas = signal<ClasseVantagemPreDefinida[]>([]);
  protected novoNivelPontos = signal<number>(1);
  protected novoPontosAtributo = signal<number>(0);
  protected novoPontosVantagem = signal<number>(0);
  protected editingPontosId = signal<number | null>(null);
  protected novoNivelVantagem = signal<number>(1);
  protected selectedVantagemId = signal<number | null>(null);
  protected todasVantagens = signal<VantagemConfig[]>([]);

  readonly columns: ConfigTableColumn[] = [
    { field: 'ordemExibicao', header: 'Ordem', width: '5rem' },
    { field: 'nome',          header: 'Nome' },
    { field: 'descricao',     header: 'Descrição' },
  ];

  protected filteredItems = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.items();
    return this.items().filter(
      (c) =>
        c.nome?.toLowerCase().includes(q) ||
        (c.descricao ?? '').toLowerCase().includes(q),
    );
  });

  protected bonusDisponiveis = computed(() => {
    const ja = new Set((this.selectedClasse()?.bonusConfig ?? []).map((b) => b.bonusConfigId));
    return this.todosBonus().filter((b) => !ja.has(b.id));
  });

  protected aptidoesDisponiveis = computed(() => {
    const ja = new Set((this.selectedClasse()?.aptidaoBonus ?? []).map((a) => a.aptidaoConfigId));
    return this.todasAptidoes().filter((a) => !ja.has(a.id));
  });

  protected pontosConfigOrdenado = computed(() =>
    [...this.pontosConfig()].sort((a, b) => a.nivel - b.nivel)
  );

  protected vantagensPreDefinidasOrdenadas = computed(() =>
    [...this.vantagensPreDefinidas()].sort((a, b) => a.nivel - b.nivel || a.vantagemConfigNome.localeCompare(b.vantagemConfigNome))
  );

  protected getEntityName(): string { return 'Classe'; }
  protected getEntityNamePlural(): string { return 'Classes'; }

  /** Retorna a formulaBase do BonusConfig correspondente ao bonusConfigId, ou null se não tiver. */
  protected getBonusFormula(bonusConfigId: number): string | null {
    return this.todosBonus().find((b) => b.id === bonusConfigId)?.formulaBase ?? null;
  }

  protected buildForm(): FormGroup {
    return this.fb.group({
      nome:          ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      descricao:     ['', [Validators.maxLength(500)]],
      ordemExibicao: [1,  [Validators.required, Validators.min(1)]],
      ativo:         [true],
    });
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.loadSubResources();
  }

  private loadSubResources(): void {
    const jogoId = this.service.currentGameId();
    if (!jogoId) return;
    this.configApi.listBonus(jogoId).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (b) => this.todosBonus.set(b) });
    this.configApi.listAptidoes(jogoId).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (a) => this.todasAptidoes.set(a) });
    this.configApi.listVantagens(jogoId).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (v) => this.todasVantagens.set(v) });
  }

  openDrawer(item?: ClassePersonagem): void {
    this.openDialog(item);
    this.selectedClasse.set(item ?? null);
    this.activeTab.set('dados');
    this.drawerVisible.set(true);
    if (item?.id) {
      this.loadPontosConfig(item.id);
      this.loadVantagensPreDefinidas(item.id);
      // Pré-carrega catálogo de itens para a aba de equipamentos iniciais
      const jogoId = this.service.currentGameId();
      if (jogoId) {
        // equipInicialRef pode não estar disponível ainda (lazy render no tab)
        // O carregamento ocorrerá quando a aba for aberta via onTabChange
        this._pendingJogoIdParaItens = jogoId;
      }
    }
  }

  /** jogoId pendente para carregar itens quando a aba equipamentos for aberta */
  private _pendingJogoIdParaItens: number | null = null;

  protected onTabChange(tabValue: string | number | undefined): void {
    if (typeof tabValue !== 'string') {
      return;
    }

    this.activeTab.set(tabValue);
    if (tabValue === 'equipamentos-iniciais' && this._pendingJogoIdParaItens) {
      // Dar um tick para o ViewChild ser renderizado
      setTimeout(() => {
        if (this._pendingJogoIdParaItens) {
          this.equipInicialRef?.carregarItensParaJogo(this._pendingJogoIdParaItens);
        }
      }, 50);
    }
  }

  closeDrawer(): void {
    this.drawerVisible.set(false);
    this.selectedClasse.set(null);
    this.closeDialog();
  }

  protected onDrawerVisibleChange(visible: boolean): void {
    if (!visible) this.closeDrawer();
  }

  override openDialog(item?: ClassePersonagem): void {
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
      next: (classe) => {
        const action = this.editMode() ? 'atualizada' : 'criada';
        this.toastService.success(`Classe ${action} com sucesso`, 'Sucesso');
        if (!this.editMode()) {
          this.selectedClasse.set(classe);
          this.activeTab.set('bonus');
          this.editMode.set(true);
          this.currentEditId.set(classe.id);
        }
        this.loadData();
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  addClasseBonus(): void {
    const classeId = this.selectedClasse()?.id;
    const bonusId = this.selectedBonusId();
    const valorPorNivel = this.valorPorNivelInput();
    if (!classeId || !bonusId || valorPorNivel <= 0) return;
    this.configApi.addClasseBonus(classeId, { bonusConfigId: bonusId, valorPorNivel })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.selectedBonusId.set(null);
          this.valorPorNivelInput.set(1.0);
          this.refreshSelectedClasse(classeId);
          this.toastService.success('Bônus adicionado à classe', 'Sucesso');
        },
      });
  }

  removeClasseBonus(bonusId: number): void {
    const classeId = this.selectedClasse()?.id;
    if (!classeId) return;
    this.configApi.removeClasseBonus(classeId, bonusId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.refreshSelectedClasse(classeId);
          this.toastService.success('Bônus removido da classe', 'Sucesso');
        },
      });
  }

  addClasseAptidaoBonus(): void {
    const classeId = this.selectedClasse()?.id;
    const aptidaoId = this.selectedAptidaoId();
    const bonus = this.bonusAptidaoInput();
    if (!classeId || !aptidaoId || bonus < 0) return;
    this.configApi.addClasseAptidaoBonus(classeId, { aptidaoConfigId: aptidaoId, bonus })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.selectedAptidaoId.set(null);
          this.bonusAptidaoInput.set(0);
          this.refreshSelectedClasse(classeId);
          this.toastService.success('Aptidão adicionada à classe', 'Sucesso');
        },
      });
  }

  removeClasseAptidaoBonus(aptidaoBonusId: number): void {
    const classeId = this.selectedClasse()?.id;
    if (!classeId) return;
    this.configApi.removeClasseAptidaoBonus(classeId, aptidaoBonusId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.refreshSelectedClasse(classeId);
          this.toastService.success('Aptidão removida da classe', 'Sucesso');
        },
      });
  }

  private loadPontosConfig(classeId: number): void {
    this.configApi.listClassePontosConfig(classeId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (p) => this.pontosConfig.set(p) });
  }

  private loadVantagensPreDefinidas(classeId: number): void {
    this.configApi.listClasseVantagensPreDefinidas(classeId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (v) => this.vantagensPreDefinidas.set(v) });
  }

  addClassePontos(): void {
    const classeId = this.selectedClasse()?.id;
    if (!classeId || this.novoNivelPontos() < 1) return;
    const dto: ClassePontosConfigRequest = {
      nivel: this.novoNivelPontos(),
      pontosAtributo: this.novoPontosAtributo(),
      pontosVantagem: this.novoPontosVantagem(),
    };
    this.configApi.addClassePontosConfig(classeId, dto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.novoNivelPontos.set(1);
          this.novoPontosAtributo.set(0);
          this.novoPontosVantagem.set(0);
          this.loadPontosConfig(classeId);
          this.toastService.success('Pontos do nível adicionados', 'Sucesso');
        },
        error: (err) => {
          const msg = err?.error?.message ?? 'Erro ao adicionar pontos';
          this.toastService.error(msg, 'Erro');
        },
      });
  }

  confirmRemoveClassePontos(pontosConfigId: number): void {
    this.confirmationService.confirm({
      message: 'Remover a configuração de pontos deste nível?',
      header: 'Confirmar Remoção',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, remover',
      rejectLabel: 'Cancelar',
      acceptButtonProps: { severity: 'danger' },
      accept: () => {
        const classeId = this.selectedClasse()?.id;
        if (!classeId) return;
        this.configApi.removeClassePontosConfig(classeId, pontosConfigId)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.loadPontosConfig(classeId);
              this.toastService.success('Pontos do nível removidos', 'Sucesso');
            },
          });
      },
    });
  }

  addClasseVantagemPreDefinida(): void {
    const classeId = this.selectedClasse()?.id;
    const vantagemId = this.selectedVantagemId();
    if (!classeId || !vantagemId || this.novoNivelVantagem() < 1) return;
    const dto: ClasseVantagemPreDefinidaRequest = {
      nivel: this.novoNivelVantagem(),
      vantagemConfigId: vantagemId,
    };
    this.configApi.addClasseVantagemPreDefinida(classeId, dto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.selectedVantagemId.set(null);
          this.novoNivelVantagem.set(1);
          this.loadVantagensPreDefinidas(classeId);
          this.toastService.success('Vantagem pré-definida adicionada', 'Sucesso');
        },
        error: (err) => {
          const msg = err?.error?.message ?? 'Erro ao adicionar vantagem';
          this.toastService.error(msg, 'Erro');
        },
      });
  }

  confirmRemoveClasseVantagem(predefinidaId: number): void {
    this.confirmationService.confirm({
      message: 'Remover esta vantagem pré-definida?',
      header: 'Confirmar Remoção',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, remover',
      rejectLabel: 'Cancelar',
      acceptButtonProps: { severity: 'danger' },
      accept: () => {
        const classeId = this.selectedClasse()?.id;
        if (!classeId) return;
        this.configApi.removeClasseVantagemPreDefinida(classeId, predefinidaId)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.loadVantagensPreDefinidas(classeId);
              this.toastService.success('Vantagem removida', 'Sucesso');
            },
          });
      },
    });
  }

  private refreshSelectedClasse(classeId: number): void {
    this.configApi.getClasse(classeId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (c) => this.selectedClasse.set(c) });
  }

  override confirmDelete(id: number): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir esta Classe? Esta ação não pode ser desfeita.',
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
    this.configApi.reordenarClasses(jogoId, { itens: payload.map((p) => ({ id: p.itemId, ordemExibicao: p.novaOrdem })) })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.toastService.success('Ordem salva com sucesso.', 'Reordenação'),
        error: () => this.toastService.error('Erro ao salvar a ordem.', 'Reordenação'),
      });
  }
}
