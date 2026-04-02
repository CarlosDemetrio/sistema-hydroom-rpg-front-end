import { Component, computed, inject, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DrawerModule } from 'primeng/drawer';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
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
import { ClassePersonagem, BonusConfig, AptidaoConfig } from '@core/models';
import { ClasseConfigService } from '@core/services/business/config';
import { ConfigApiService } from '@core/services/api/config-api.service';
import { uniqueNameValidator } from '@shared/validators/config-validators';

@Component({
  selector: 'app-classes-config',
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
    TabsModule,
    TagModule,
    TextareaModule,
    TooltipModule,
    SelectModule,
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

    <!-- DRAWER -->
    <p-drawer
      [visible]="drawerVisible()"
      (visibleChange)="onDrawerVisibleChange($event)"
      [header]="editMode() ? 'Editar Classe' : 'Nova Classe'"
      position="right"
      class="w-full md:w-35rem"
    >
      <p-tabs [value]="activeTab()">
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
              <div class="flex gap-2 mt-2">
                <p-select
                  [options]="bonusDisponiveis()"
                  [(ngModel)]="selectedBonusId"
                  optionLabel="nome"
                  optionValue="id"
                  placeholder="Selecione um bônus..."
                  class="flex-1"
                />
                <p-button
                  icon="pi pi-plus"
                  label="Adicionar"
                  [disabled]="!selectedBonusId()"
                  (onClick)="addClasseBonus()"
                />
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
                      <span class="font-semibold">{{ apt.aptidaoNome }}</span>
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
                <p-button
                  icon="pi pi-plus"
                  label="Adicionar"
                  [disabled]="!selectedAptidaoId()"
                  (onClick)="addClasseAptidaoBonus()"
                />
              </div>
            </div>
          </p-tabpanel>
        </p-tabpanels>
      </p-tabs>
    </p-drawer>

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
  }

  openDrawer(item?: ClassePersonagem): void {
    this.openDialog(item);
    this.selectedClasse.set(item ?? null);
    this.activeTab.set('dados');
    this.drawerVisible.set(true);
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
    if (!classeId || !bonusId) return;
    this.configApi.addClasseBonus(classeId, { bonusConfigId: bonusId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.selectedBonusId.set(null);
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
    if (!classeId || !aptidaoId) return;
    this.configApi.addClasseAptidaoBonus(classeId, { aptidaoConfigId: aptidaoId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.selectedAptidaoId.set(null);
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
      acceptButtonStyleClass: 'p-button-danger',
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
