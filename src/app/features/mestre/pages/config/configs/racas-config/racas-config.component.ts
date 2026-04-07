import { Component, computed, inject, signal } from '@angular/core';
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
import { SelectModule } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';

import { BaseConfigComponent } from '@shared/components/base-config/base-config.component';
import {
  BaseConfigTableComponent,
  ConfigTableColumn,
} from '@shared/components/base-config/base-config-table.component';
import {
  Raca,
  AtributoConfig,
  ClassePersonagem,
  RacaPontosConfig,
  RacaPontosConfigRequest,
  RacaVantagemPreDefinida,
  VantagemConfig,
} from '@core/models';
import { RacaConfigService } from '@core/services/business/config';
import { ConfigApiService } from '@core/services/api/config-api.service';
import { uniqueNameValidator } from '@shared/validators/config-validators';

@Component({
  selector: 'app-racas-config',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
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
              Selecione um jogo no cabeçalho para gerenciar Raças.
            </p>
          </div>
        </div>
      }

      <app-base-config-table
        [titulo]="'Raças'"
        [subtitulo]="'Configure as raças de personagem (Humano, Elfo, Anão, etc.)'"
        [labelNovo]="'Nova Raça'"
        [items]="racasComInfo()"
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
      [header]="editMode() ? 'Editar Raça' : 'Nova Raça'"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
    >
      <p-tabs [value]="activeTab()">
        <p-tablist>
          <p-tab value="dados">Dados Gerais</p-tab>
          <p-tab
            value="bonus-atributos"
            [disabled]="!editMode()"
            pTooltip="Salve os dados gerais primeiro para habilitar esta aba"
            tooltipPosition="top"
          >
            Bônus em Atributos
            @if (selectedRaca()?.bonusAtributos?.length) {
              <span class="ml-1 badge-atributo">{{ selectedRaca()!.bonusAtributos.length }}</span>
            }
          </p-tab>
          <p-tab
            value="classes-permitidas"
            [disabled]="!editMode()"
            pTooltip="Salve os dados gerais primeiro para habilitar esta aba"
            tooltipPosition="top"
          >
            Classes Permitidas
            @if (selectedRaca()?.classesPermitidas?.length) {
              <span class="ml-1 badge-atributo">{{ selectedRaca()!.classesPermitidas.length }}</span>
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
        </p-tablist>

        <p-tabpanels>
          <!-- Aba: Dados Gerais -->
          <p-tabpanel value="dados">
            <form [formGroup]="form" (ngSubmit)="save()">
              <div class="flex flex-column gap-4 p-2">

                <div class="flex flex-column gap-2">
                  <label for="nome" class="font-semibold">
                    Nome <span class="text-red-400">*</span>
                  </label>
                  <input
                    pInputText
                    id="nome"
                    formControlName="nome"
                    placeholder="Ex: Humano"
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

                <div class="flex flex-column gap-2">
                  <label for="descricao" class="font-semibold">Descrição</label>
                  <textarea
                    pTextarea
                    id="descricao"
                    formControlName="descricao"
                    [rows]="4"
                    placeholder="Descreva a raça, sua origem e características..."
                    [autoResize]="true"
                  ></textarea>
                </div>

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
                  [label]="editMode() ? 'Salvar Alterações' : 'Criar Raça'"
                  icon="pi pi-check"
                  type="submit"
                />
              </div>
            </form>
          </p-tabpanel>

          <!-- Aba: Bônus em Atributos -->
          <p-tabpanel value="bonus-atributos">
            <div class="flex flex-column gap-3 p-2">
              <div class="rpg-section-title">Bônus/Penalidades em Atributos</div>
              <small class="text-color-secondary">
                Valores positivos = bônus. Negativos = penalidade.
              </small>

              @if (selectedRaca()?.bonusAtributos?.length) {
                <div class="flex flex-column gap-2">
                  @for (bonus of selectedRaca()!.bonusAtributos; track bonus.id) {
                    <div class="flex justify-content-between align-items-center p-3 surface-100 border-round">
                      <div class="flex align-items-center gap-2">
                        <span class="font-semibold">{{ bonus.atributoNome }}</span>
                        <span class="valor-numerico--sm" [class.text-green-400]="bonus.bonus > 0" [class.text-red-400]="bonus.bonus < 0">
                          {{ bonus.bonus > 0 ? '+' : '' }}{{ bonus.bonus }}
                        </span>
                        @if (bonus.bonus < 0) {
                          <span class="text-xs text-red-400">(penalidade)</span>
                        }
                      </div>
                      <p-button
                        icon="pi pi-trash"
                        [rounded]="true"
                        [text]="true"
                        severity="danger"
                        (onClick)="removeRacaBonus(bonus.id)"
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

              <div class="flex gap-2 mt-2">
                <p-select
                  [options]="atributosDisponiveis()"
                  [(ngModel)]="selectedAtributoId"
                  optionLabel="nome"
                  optionValue="id"
                  placeholder="Atributo..."
                  class="flex-1"
                />
                <p-input-number
                  [(ngModel)]="bonusValor"
                  [showButtons]="true"
                  [min]="-99"
                  [max]="99"
                  style="width: 7rem"
                />
                <p-button
                  icon="pi pi-plus"
                  label="Adicionar"
                  [disabled]="!selectedAtributoId()"
                  (onClick)="addRacaBonus()"
                />
              </div>
            </div>
          </p-tabpanel>

          <!-- Aba: Classes Permitidas -->
          <p-tabpanel value="classes-permitidas">
            <div class="flex flex-column gap-3 p-2">
              <div class="rpg-section-title">Classes Permitidas para esta Raça</div>
              <small class="text-color-secondary">
                Se vazio, todas as classes são permitidas.
              </small>

              @if (selectedRaca()?.classesPermitidas?.length) {
                <div class="flex flex-column gap-2">
                  @for (cp of selectedRaca()!.classesPermitidas; track cp.id) {
                    <div class="flex justify-content-between align-items-center p-3 surface-100 border-round">
                      <span class="font-semibold">{{ cp.classeNome }}</span>
                      <p-button
                        icon="pi pi-trash"
                        [rounded]="true"
                        [text]="true"
                        severity="danger"
                        (onClick)="removeRacaClasse(cp.id)"
                        pTooltip="Remover classe"
                      />
                    </div>
                  }
                </div>
              } @else {
                <div class="text-center p-4 text-color-secondary">
                  <i class="pi pi-check-circle text-3xl mb-2 block text-green-400"></i>
                  <p class="m-0">Todas as classes são permitidas</p>
                </div>
              }

              <div class="flex gap-2 mt-2">
                <p-select
                  [options]="classesDisponiveis()"
                  [(ngModel)]="selectedClasseId"
                  optionLabel="nome"
                  optionValue="id"
                  placeholder="Selecione uma classe..."
                  class="flex-1"
                />
                <p-button
                  icon="pi pi-plus"
                  label="Adicionar"
                  [disabled]="!selectedClasseId()"
                  (onClick)="addRacaClasse()"
                />
              </div>
            </div>
          </p-tabpanel>

          <!-- Aba: Pontos por Nível -->
          <p-tabpanel value="pontos-nivel">
            <div class="flex flex-column gap-3 p-2">
              <div class="rpg-section-title">Pontos Ganhos por Nível</div>
              <small class="text-color-secondary">
                Configure quantos pontos de atributo e vantagem o personagem ganha em cada nível desta raça.
              </small>

              @if (loadingPontosConfig()) {
                <div class="text-center p-4 text-color-secondary">
                  <i class="pi pi-spin pi-spinner text-2xl mb-2 block"></i>
                  <p class="m-0">Carregando...</p>
                </div>
              } @else {
                @if (pontosConfig().length) {
                  <p-table
                    [value]="pontosConfig()"
                    styleClass="p-datatable-sm"
                    [tableStyle]="{'min-width': '100%'}"
                  >
                    <ng-template pTemplate="header">
                      <tr>
                        <th>Nível</th>
                        <th>Pts. Atributo</th>
                        <th>Pts. Vantagem</th>
                        <th style="width: 6rem">Ações</th>
                      </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-pontos>
                      <tr>
                        <td class="font-semibold">{{ pontos.nivel }}</td>
                        <td>{{ pontos.pontosAtributo }}</td>
                        <td>{{ pontos.pontosVantagem }}</td>
                        <td>
                          <div class="flex gap-1">
                            <p-button
                              icon="pi pi-pencil"
                              [rounded]="true"
                              [text]="true"
                              severity="secondary"
                              pTooltip="Editar"
                              (onClick)="editarPontosConfig(pontos)"
                            />
                            <p-button
                              icon="pi pi-trash"
                              [rounded]="true"
                              [text]="true"
                              severity="danger"
                              pTooltip="Remover nível"
                              (onClick)="confirmDeletePontosConfig(pontos.id)"
                            />
                          </div>
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
              }

              <!-- Formulário: Adicionar / Editar Pontos Config -->
              @if (!showPontosForm()) {
                <p-button
                  icon="pi pi-plus"
                  label="Adicionar Nível"
                  severity="secondary"
                  [outlined]="true"
                  (onClick)="abrirFormPontos()"
                />
              } @else {
                <div class="flex flex-column gap-3 p-3 surface-50 border-round border-1 surface-border">
                  <div class="font-semibold text-sm">
                    {{ editingPontosConfigId() ? 'Editar Nível' : 'Novo Nível' }}
                  </div>
                  <div class="flex flex-wrap gap-3">
                    <div class="flex flex-column gap-1 flex-1" style="min-width: 6rem">
                      <label class="text-sm font-semibold">
                        Nível <span class="text-red-400">*</span>
                      </label>
                      <p-input-number
                        [(ngModel)]="pontosFormNivel"
                        [showButtons]="true"
                        [min]="1"
                        inputId="pontos-nivel-input"
                      />
                    </div>
                    <div class="flex flex-column gap-1 flex-1" style="min-width: 7rem">
                      <label class="text-sm font-semibold">Pts. Atributo</label>
                      <p-input-number
                        [(ngModel)]="pontosFormAtributo"
                        [showButtons]="true"
                        [min]="0"
                        inputId="pontos-atributo-input"
                      />
                    </div>
                    <div class="flex flex-column gap-1 flex-1" style="min-width: 7rem">
                      <label class="text-sm font-semibold">Pts. Vantagem</label>
                      <p-input-number
                        [(ngModel)]="pontosFormVantagem"
                        [showButtons]="true"
                        [min]="0"
                        inputId="pontos-vantagem-input"
                      />
                    </div>
                  </div>
                  <div class="flex gap-2 justify-content-end">
                    <p-button
                      label="Cancelar"
                      severity="secondary"
                      [outlined]="true"
                      (onClick)="fecharFormPontos()"
                    />
                    <p-button
                      [label]="editingPontosConfigId() ? 'Salvar' : 'Adicionar'"
                      icon="pi pi-check"
                      [disabled]="pontosFormNivel() < 1"
                      (onClick)="salvarPontosConfig()"
                    />
                  </div>
                </div>
              }
            </div>
          </p-tabpanel>

          <!-- Aba: Vantagens Pré-definidas -->
          <p-tabpanel value="vantagens-predefinidas">
            <div class="flex flex-column gap-3 p-2">
              <div class="rpg-section-title">Vantagens Pré-definidas da Raça</div>
              <small class="text-color-secondary">
                Vantagens que personagens desta raça recebem automaticamente ao atingir o nível configurado.
              </small>

              @if (loadingVantagens()) {
                <div class="text-center p-4 text-color-secondary">
                  <i class="pi pi-spin pi-spinner text-2xl mb-2 block"></i>
                  <p class="m-0">Carregando...</p>
                </div>
              } @else {
                @if (vantagensPreDefinidas().length) {
                  <p-table
                    [value]="vantagensPreDefinidas()"
                    styleClass="p-datatable-sm"
                    [tableStyle]="{'min-width': '100%'}"
                  >
                    <ng-template pTemplate="header">
                      <tr>
                        <th>Nível</th>
                        <th>Vantagem</th>
                        <th style="width: 4rem">Ações</th>
                      </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-vp>
                      <tr>
                        <td class="font-semibold">{{ vp.nivel }}</td>
                        <td>{{ vp.vantagemConfigNome }}</td>
                        <td>
                          <p-button
                            icon="pi pi-trash"
                            [rounded]="true"
                            [text]="true"
                            severity="danger"
                            pTooltip="Remover vantagem"
                            (onClick)="confirmDeleteVantagemPreDefinida(vp.id)"
                          />
                        </td>
                      </tr>
                    </ng-template>
                  </p-table>
                } @else {
                  <div class="text-center p-4 text-color-secondary">
                    <i class="pi pi-inbox text-3xl mb-2 block"></i>
                    <p class="m-0">Nenhuma vantagem pré-definida</p>
                  </div>
                }
              }

              <!-- Formulário: Adicionar Vantagem Pré-definida -->
              <div class="flex flex-wrap gap-2 mt-2 align-items-end">
                <div class="flex flex-column gap-1" style="min-width: 6rem">
                  <label class="text-sm font-semibold">Nível</label>
                  <p-input-number
                    [(ngModel)]="vantagemFormNivel"
                    [showButtons]="true"
                    [min]="1"
                    inputId="vantagem-nivel-input"
                    style="width: 7rem"
                  />
                </div>
                <div class="flex flex-column gap-1 flex-1">
                  <label class="text-sm font-semibold">Vantagem</label>
                  <p-select
                    [options]="todasVantagens()"
                    [(ngModel)]="selectedVantagemId"
                    optionLabel="nome"
                    optionValue="id"
                    placeholder="Selecione uma vantagem..."
                    [filter]="true"
                    filterBy="nome"
                    class="w-full"
                  />
                </div>
                <p-button
                  icon="pi pi-plus"
                  label="Adicionar"
                  [disabled]="!selectedVantagemId() || vantagemFormNivel() < 1"
                  (onClick)="addVantagemPreDefinida()"
                />
              </div>
            </div>
          </p-tabpanel>
        </p-tabpanels>
      </p-tabs>
    </p-dialog>

    <p-confirmDialog />
  `,
})
export class RacasConfigComponent extends BaseConfigComponent<
  Raca,
  RacaConfigService
> {
  protected service = inject(RacaConfigService);
  private confirmationService = inject(ConfirmationService);
  private configApi = inject(ConfigApiService);

  protected drawerVisible = signal(false);
  protected loading = signal(false);
  protected searchQuery = signal('');
  protected activeTab = signal('dados');
  protected selectedRaca = signal<Raca | null>(null);

  // Sub-recursos — Bônus em Atributos e Classes Permitidas
  protected todosAtributos = signal<AtributoConfig[]>([]);
  protected todasClasses = signal<ClassePersonagem[]>([]);
  protected selectedAtributoId = signal<number | null>(null);
  protected selectedClasseId = signal<number | null>(null);
  protected bonusValor = signal(1);

  // Sub-recursos — Pontos por Nível
  protected pontosConfig = signal<RacaPontosConfig[]>([]);
  protected loadingPontosConfig = signal(false);
  protected showPontosForm = signal(false);
  protected editingPontosConfigId = signal<number | null>(null);
  protected pontosFormNivel = signal(1);
  protected pontosFormAtributo = signal(0);
  protected pontosFormVantagem = signal(0);

  // Sub-recursos — Vantagens Pré-definidas
  protected vantagensPreDefinidas = signal<RacaVantagemPreDefinida[]>([]);
  protected loadingVantagens = signal(false);
  protected todasVantagens = signal<VantagemConfig[]>([]);
  protected selectedVantagemId = signal<number | null>(null);
  protected vantagemFormNivel = signal(1);

  readonly columns: ConfigTableColumn[] = [
    { field: 'ordemExibicao',  header: 'Ordem',   width: '5rem' },
    { field: 'nome',           header: 'Nome' },
    { field: 'descricao',      header: 'Descrição' },
    { field: 'restricaoLabel', header: 'Classes',  width: '10rem' },
  ];

  protected filteredItems = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.items();
    return this.items().filter(
      (r) =>
        r.nome?.toLowerCase().includes(q) ||
        (r.descricao ?? '').toLowerCase().includes(q),
    );
  });

  protected racasComInfo = computed(() =>
    this.filteredItems().map((r) => ({
      ...r,
      restricaoLabel: r.classesPermitidas?.length
        ? `${r.classesPermitidas.length} classe(s)`
        : 'Sem restrições',
      temRestricao: (r.classesPermitidas?.length ?? 0) > 0,
    }))
  );

  protected atributosDisponiveis = computed(() => {
    const ja = new Set((this.selectedRaca()?.bonusAtributos ?? []).map((b) => b.atributoConfigId));
    return this.todosAtributos().filter((a) => !ja.has(a.id));
  });

  protected classesDisponiveis = computed(() => {
    const ja = new Set((this.selectedRaca()?.classesPermitidas ?? []).map((c) => c.classeId));
    return this.todasClasses().filter((c) => !ja.has(c.id));
  });

  protected getEntityName(): string { return 'Raça'; }
  protected getEntityNamePlural(): string { return 'Raças'; }

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
    const jogoId = this.service.currentGameId();
    if (jogoId) {
      this.configApi.listAtributos(jogoId).pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({ next: (a) => this.todosAtributos.set(a) });
      this.configApi.listClasses(jogoId).pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({ next: (c) => this.todasClasses.set(c) });
      this.configApi.listVantagens(jogoId).pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({ next: (v) => this.todasVantagens.set(v) });
    }
  }

  openDrawer(item?: Raca): void {
    this.openDialog(item);
    this.selectedRaca.set(item ?? null);
    this.activeTab.set('dados');
    this.drawerVisible.set(true);
    // Reset pontos/vantagens state
    this.pontosConfig.set([]);
    this.vantagensPreDefinidas.set([]);
    this.fecharFormPontos();
    if (item?.id) {
      this.loadPontosConfig(item.id);
      this.loadVantagensPreDefinidas(item.id);
    }
  }

  closeDrawer(): void {
    this.drawerVisible.set(false);
    this.selectedRaca.set(null);
    this.pontosConfig.set([]);
    this.vantagensPreDefinidas.set([]);
    this.fecharFormPontos();
    this.selectedVantagemId.set(null);
    this.vantagemFormNivel.set(1);
    this.closeDialog();
  }

  protected onDrawerVisibleChange(visible: boolean): void {
    if (!visible) this.closeDrawer();
  }

  override openDialog(item?: Raca): void {
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
      next: (raca) => {
        const action = this.editMode() ? 'atualizada' : 'criada';
        this.toastService.success(`Raça ${action} com sucesso`, 'Sucesso');
        if (!this.editMode()) {
          this.selectedRaca.set(raca);
          this.activeTab.set('bonus-atributos');
          this.editMode.set(true);
          this.currentEditId.set(raca.id);
          this.loadPontosConfig(raca.id);
          this.loadVantagensPreDefinidas(raca.id);
        }
        this.loadData();
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  addRacaBonus(): void {
    const racaId = this.selectedRaca()?.id;
    const atributoId = this.selectedAtributoId();
    if (!racaId || !atributoId) return;
    this.configApi.addRacaBonusAtributo(racaId, { atributoConfigId: atributoId, bonus: this.bonusValor() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.selectedAtributoId.set(null);
          this.bonusValor.set(1);
          this.refreshSelectedRaca(racaId);
          this.toastService.success('Bônus adicionado à raça', 'Sucesso');
        },
      });
  }

  removeRacaBonus(bonusId: number): void {
    const racaId = this.selectedRaca()?.id;
    if (!racaId) return;
    this.configApi.removeRacaBonusAtributo(racaId, bonusId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.refreshSelectedRaca(racaId);
          this.toastService.success('Bônus removido da raça', 'Sucesso');
        },
      });
  }

  addRacaClasse(): void {
    const racaId = this.selectedRaca()?.id;
    const classeId = this.selectedClasseId();
    if (!racaId || !classeId) return;
    this.configApi.addRacaClassePermitida(racaId, { classeId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.selectedClasseId.set(null);
          this.refreshSelectedRaca(racaId);
          this.toastService.success('Classe adicionada à raça', 'Sucesso');
        },
      });
  }

  removeRacaClasse(classePermitidaId: number): void {
    const racaId = this.selectedRaca()?.id;
    if (!racaId) return;
    this.configApi.removeRacaClassePermitida(racaId, classePermitidaId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.refreshSelectedRaca(racaId);
          this.toastService.success('Classe removida da raça', 'Sucesso');
        },
      });
  }

  private refreshSelectedRaca(racaId: number): void {
    this.configApi.getRaca(racaId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (r) => this.selectedRaca.set(r) });
  }

  override confirmDelete(id: number): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir esta Raça? Esta ação não pode ser desfeita.',
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
    this.configApi.reordenarRacas(jogoId, { itens: payload.map((p) => ({ id: p.itemId, ordemExibicao: p.novaOrdem })) })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.toastService.success('Ordem salva com sucesso.', 'Reordenação'),
        error: () => this.toastService.error('Erro ao salvar a ordem.', 'Reordenação'),
      });
  }

  // ─── Pontos por Nível ────────────────────────────────────────────────────────

  private loadPontosConfig(racaId: number): void {
    this.loadingPontosConfig.set(true);
    this.configApi.listRacaPontosConfig(racaId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (lista) => {
          this.pontosConfig.set([...lista].sort((a, b) => a.nivel - b.nivel));
          this.loadingPontosConfig.set(false);
        },
        error: () => {
          this.toastService.error('Erro ao carregar pontos por nível.', 'Erro');
          this.loadingPontosConfig.set(false);
        },
      });
  }

  protected abrirFormPontos(): void {
    this.editingPontosConfigId.set(null);
    this.pontosFormNivel.set(1);
    this.pontosFormAtributo.set(0);
    this.pontosFormVantagem.set(0);
    this.showPontosForm.set(true);
  }

  protected fecharFormPontos(): void {
    this.showPontosForm.set(false);
    this.editingPontosConfigId.set(null);
  }

  protected editarPontosConfig(pontos: RacaPontosConfig): void {
    this.editingPontosConfigId.set(pontos.id);
    this.pontosFormNivel.set(pontos.nivel);
    this.pontosFormAtributo.set(pontos.pontosAtributo);
    this.pontosFormVantagem.set(pontos.pontosVantagem);
    this.showPontosForm.set(true);
  }

  protected salvarPontosConfig(): void {
    const racaId = this.selectedRaca()?.id;
    if (!racaId || this.pontosFormNivel() < 1) return;

    const dto: RacaPontosConfigRequest = {
      nivel: this.pontosFormNivel(),
      pontosAtributo: this.pontosFormAtributo(),
      pontosVantagem: this.pontosFormVantagem(),
    };

    const editId = this.editingPontosConfigId();
    const op$ = editId
      ? this.configApi.updateRacaPontosConfig(racaId, editId, dto)
      : this.configApi.createRacaPontosConfig(racaId, dto);

    op$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        const msg = editId ? 'Pontos atualizados com sucesso.' : 'Nível adicionado com sucesso.';
        this.toastService.success(msg, 'Sucesso');
        this.fecharFormPontos();
        this.loadPontosConfig(racaId);
      },
      error: (err) => {
        const msg = err?.status === 409
          ? 'Já existe uma configuração para este nível.'
          : 'Erro ao salvar configuração de pontos.';
        this.toastService.error(msg, 'Erro');
      },
    });
  }

  protected confirmDeletePontosConfig(pontosConfigId: number): void {
    this.confirmationService.confirm({
      message: 'Deseja remover a configuração de pontos deste nível?',
      header: 'Confirmar Remoção',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, remover',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deletePontosConfig(pontosConfigId),
    });
  }

  private deletePontosConfig(pontosConfigId: number): void {
    const racaId = this.selectedRaca()?.id;
    if (!racaId) return;
    this.configApi.deleteRacaPontosConfig(racaId, pontosConfigId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastService.success('Configuração removida com sucesso.', 'Sucesso');
          this.loadPontosConfig(racaId);
        },
        error: () => this.toastService.error('Erro ao remover configuração.', 'Erro'),
      });
  }

  // ─── Vantagens Pré-definidas ─────────────────────────────────────────────────

  private loadVantagensPreDefinidas(racaId: number): void {
    this.loadingVantagens.set(true);
    this.configApi.listRacaVantagensPreDefinidas(racaId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (lista) => {
          this.vantagensPreDefinidas.set([...lista].sort((a, b) => a.nivel - b.nivel));
          this.loadingVantagens.set(false);
        },
        error: () => {
          this.toastService.error('Erro ao carregar vantagens pré-definidas.', 'Erro');
          this.loadingVantagens.set(false);
        },
      });
  }

  protected addVantagemPreDefinida(): void {
    const racaId = this.selectedRaca()?.id;
    const vantagemId = this.selectedVantagemId();
    if (!racaId || !vantagemId || this.vantagemFormNivel() < 1) return;

    this.configApi.createRacaVantagemPreDefinida(racaId, {
      nivel: this.vantagemFormNivel(),
      vantagemConfigId: vantagemId,
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.toastService.success('Vantagem adicionada com sucesso.', 'Sucesso');
        this.selectedVantagemId.set(null);
        this.vantagemFormNivel.set(1);
        this.loadVantagensPreDefinidas(racaId);
      },
      error: () => this.toastService.error('Erro ao adicionar vantagem pré-definida.', 'Erro'),
    });
  }

  protected confirmDeleteVantagemPreDefinida(predefinidaId: number): void {
    this.confirmationService.confirm({
      message: 'Deseja remover esta vantagem pré-definida da raça?',
      header: 'Confirmar Remoção',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, remover',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteVantagemPreDefinida(predefinidaId),
    });
  }

  private deleteVantagemPreDefinida(predefinidaId: number): void {
    const racaId = this.selectedRaca()?.id;
    if (!racaId) return;
    this.configApi.deleteRacaVantagemPreDefinida(racaId, predefinidaId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastService.success('Vantagem removida com sucesso.', 'Sucesso');
          this.loadVantagensPreDefinidas(racaId);
        },
        error: () => this.toastService.error('Erro ao remover vantagem.', 'Erro'),
      });
  }
}
