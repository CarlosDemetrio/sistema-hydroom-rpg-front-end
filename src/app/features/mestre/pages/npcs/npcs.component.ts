import { Component, ChangeDetectionStrategy, DestroyRef, inject, signal, computed, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { Ficha } from '@core/models/ficha.model';
import { NpcDificuldadeConfig } from '@core/models/npc-dificuldade-config.model';
import { NpcCreateDto } from '@core/models/dtos/ficha.dto';
import { FichaBusinessService } from '@core/services/business/ficha-business.service';
import { ConfigApiService } from '@core/services/api/config-api.service';
import { CurrentGameService } from '@core/services/current-game.service';
import { ConfigStore } from '@core/stores/config.store';
import { ToastService } from '@services/toast.service';
import { EmptyStateComponent } from '@shared/components/empty-state.component';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';

/**
 * NPCs Component (Mestre)
 *
 * Lista e criação de NPCs do jogo atual.
 * SMART COMPONENT — injeta serviços diretamente.
 *
 * Endpoints:
 * - GET  /api/v1/jogos/{jogoId}/npcs              — carregado via FichaBusinessService.loadNpcs()
 * - POST /api/v1/jogos/{jogoId}/npcs              — criado via FichaBusinessService.criarNpc()
 * - GET  /api/jogos/{jogoId}/config/npc-dificuldades — via ConfigApiService.listNpcDificuldades()
 * - GET  /api/v1/configuracoes/atributos?jogoId=  — via ConfigApiService.listAtributos()
 */
@Component({
  selector: 'app-npcs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    ConfirmDialogModule,
    DialogModule,
    DividerModule,
    InputNumberModule,
    InputTextModule,
    SelectModule,
    TableModule,
    TagModule,
    TooltipModule,
    EmptyStateComponent,
    LoadingSpinnerComponent,
    PageHeaderComponent,
  ],
  providers: [ConfirmationService],
  template: `
    <div class="p-4">

      <!-- Page Header -->
      <div class="flex justify-content-between align-items-center">
        <app-page-header title="NPCs" backRoute="/mestre/jogos" />
        <p-button
          label="Novo NPC"
          icon="pi pi-plus"
          (onClick)="abrirDrawer()"
          [disabled]="!hasGame()"
        ></p-button>
      </div>

      @if (currentGameName()) {
        <p class="text-color-secondary m-0 mb-4">
          Personagens não-jogadores do jogo
          <span class="font-semibold text-primary"> — {{ currentGameName() }}</span>
        </p>
      }

      <!-- Aviso: sem jogo selecionado -->
      @if (!hasGame()) {
        <p-card>
          <div class="flex align-items-center gap-3 p-4 border-round surface-100">
            <i class="pi pi-exclamation-triangle text-2xl" style="color: var(--p-amber-400)"></i>
            <div>
              <p class="font-semibold m-0 mb-1">Nenhum jogo selecionado</p>
              <p class="text-sm text-color-secondary m-0">Selecione um jogo no cabeçalho para gerenciar NPCs.</p>
            </div>
          </div>
        </p-card>
      } @else {

        <!-- Conteúdo principal -->
        <p-card>

          @if (isLoading()) {
            <app-loading-spinner message="Carregando NPCs..."></app-loading-spinner>
          } @else if (npcs().length === 0) {
            <app-empty-state
              icon="pi pi-users"
              message="Nenhum NPC criado"
              description="Clique em 'Novo NPC' para criar o primeiro personagem não-jogador deste jogo."
            ></app-empty-state>
          } @else {
            <p-table
              [value]="npcs()"
              [rowHover]="true"
              [paginator]="true"
              [rows]="10"
              [rowsPerPageOptions]="[5, 10, 20]"
              dataKey="id"
            >
              <ng-template #header>
                <tr>
                  <th>Nome</th>
                  <th>Raça</th>
                  <th>Classe</th>
                  <th>Nível</th>
                  <th>Tipo</th>
                  <th class="text-center">Ações</th>
                </tr>
              </ng-template>

              <ng-template #body let-npc>
                <tr>
                  <td>
                    <span class="font-semibold">{{ npc.nome }}</span>
                  </td>
                  <td>
                    @if (npc.racaNome) {
                      {{ npc.racaNome }}
                    } @else {
                      <span class="text-color-secondary">—</span>
                    }
                  </td>
                  <td>
                    @if (npc.classeNome) {
                      {{ npc.classeNome }}
                    } @else {
                      <span class="text-color-secondary">—</span>
                    }
                  </td>
                  <td>{{ npc.nivel }}</td>
                  <td>
                    <p-tag value="NPC" severity="warn" icon="pi pi-users"></p-tag>
                  </td>
                  <td class="text-center">
                    <p-button
                      icon="pi pi-eye"
                      [rounded]="true"
                      [text]="true"
                      pTooltip="Ver Ficha"
                      tooltipPosition="top"
                      (onClick)="verFicha(npc.id)"
                    ></p-button>
                    <p-button
                      icon="pi pi-trash"
                      [rounded]="true"
                      [text]="true"
                      severity="danger"
                      pTooltip="Excluir NPC"
                      tooltipPosition="top"
                      (onClick)="confirmarExclusao(npc)"
                      [attr.aria-label]="'Excluir NPC ' + npc.nome"
                    ></p-button>
                  </td>
                </tr>
              </ng-template>

              <ng-template #emptymessage>
                <tr>
                  <td colspan="6" class="text-center p-4">Nenhum NPC encontrado</td>
                </tr>
              </ng-template>
            </p-table>
          }

        </p-card>
      }

    </div>

    <!-- Confirm Dialog: Exclusão de NPC -->
    <p-confirmDialog></p-confirmDialog>

    <!-- Dialog: Criar NPC -->
    <p-dialog
      [visible]="drawerVisible()"
      (visibleChange)="onDrawerVisibleChange($event)"
      header="Novo NPC"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      [style]="{ width: '38rem', maxWidth: '95vw' }"
    >
      <form [formGroup]="form" (ngSubmit)="salvar()">
        <div class="flex flex-column gap-4 p-2">

          <!-- Nome -->
          <div class="flex flex-column gap-2">
            <label for="npc-nome" class="font-semibold">
              Nome <span class="text-red-400">*</span>
            </label>
            <input
              pInputText
              id="npc-nome"
              formControlName="nome"
              placeholder="Ex: Goblin Chefe"
              [class.ng-invalid]="form.get('nome')?.invalid && form.get('nome')?.touched"
              aria-label="Nome do NPC"
            />
            @if (form.get('nome')?.invalid && form.get('nome')?.touched) {
              <small class="text-red-400">
                @if (form.get('nome')?.errors?.['required']) { Campo obrigatório }
                @if (form.get('nome')?.errors?.['minlength']) { Mínimo de 2 caracteres }
                @if (form.get('nome')?.errors?.['maxlength']) { Máximo de 100 caracteres }
              </small>
            }
          </div>

          <!-- Nível de Dificuldade -->
          <div class="flex flex-column gap-2">
            <label for="npc-dificuldade" class="font-semibold">Nível de Dificuldade</label>
            <p-select
              inputId="npc-dificuldade"
              formControlName="dificuldadeId"
              [options]="dificuldadesOptions()"
              optionLabel="label"
              optionValue="value"
              placeholder="Selecione um nível (opcional)"
              [showClear]="true"
              class="w-full"
              aria-label="Nível de Dificuldade do NPC"
              (onChange)="onDificuldadeChange($event.value)"
            ></p-select>
            @if (dificuldadeSelecionada()) {
              <small class="text-color-secondary">
                <i class="pi pi-info-circle mr-1"></i>
                Foco: {{ dificuldadeSelecionada()!.foco === 'FISICO' ? 'Físico' : 'Mágico' }} — atributos preenchidos automaticamente (editáveis)
              </small>
            }
          </div>

          <!-- Raça -->
          <div class="flex flex-column gap-2">
            <label for="npc-raca" class="font-semibold">Raça</label>
            <p-select
              inputId="npc-raca"
              formControlName="racaId"
              [options]="racasOptions()"
              optionLabel="label"
              optionValue="value"
              placeholder="Selecione uma raça (opcional)"
              [showClear]="true"
              class="w-full"
              aria-label="Raça do NPC"
            ></p-select>
          </div>

          <!-- Classe -->
          <div class="flex flex-column gap-2">
            <label for="npc-classe" class="font-semibold">Classe</label>
            <p-select
              inputId="npc-classe"
              formControlName="classeId"
              [options]="classesOptions()"
              optionLabel="label"
              optionValue="value"
              placeholder="Selecione uma classe (opcional)"
              [showClear]="true"
              class="w-full"
              aria-label="Classe do NPC"
            ></p-select>
          </div>

          <!-- Gênero -->
          <div class="flex flex-column gap-2">
            <label for="npc-genero" class="font-semibold">Gênero</label>
            <p-select
              inputId="npc-genero"
              formControlName="generoId"
              [options]="generosOptions()"
              optionLabel="label"
              optionValue="value"
              placeholder="Selecione um gênero (opcional)"
              [showClear]="true"
              class="w-full"
              aria-label="Gênero do NPC"
            ></p-select>
          </div>

          <!-- Índole -->
          <div class="flex flex-column gap-2">
            <label for="npc-indole" class="font-semibold">Índole</label>
            <p-select
              inputId="npc-indole"
              formControlName="indoleId"
              [options]="indolesOptions()"
              optionLabel="label"
              optionValue="value"
              placeholder="Selecione uma índole (opcional)"
              [showClear]="true"
              class="w-full"
              aria-label="Índole do NPC"
            ></p-select>
          </div>

          <!-- Presença -->
          <div class="flex flex-column gap-2">
            <label for="npc-presenca" class="font-semibold">Presença</label>
            <p-select
              inputId="npc-presenca"
              formControlName="presencaId"
              [options]="presencasOptions()"
              optionLabel="label"
              optionValue="value"
              placeholder="Selecione uma presença (opcional)"
              [showClear]="true"
              class="w-full"
              aria-label="Presença do NPC"
            ></p-select>
          </div>

          <!-- Seção: Atributos Base -->
          @if (atributosForm.length > 0) {
            <p-divider></p-divider>
            <div>
              <p class="font-semibold m-0 mb-3">
                <i class="pi pi-sliders-h mr-2 text-primary"></i>
                Atributos Base
              </p>
              <div class="grid">
                @for (atributo of atributosForm; track atributo.atributoId) {
                  <div class="col-6 md:col-4">
                    <div class="flex flex-column gap-1">
                      <label
                        [for]="'npc-attr-' + atributo.atributoId"
                        class="text-sm font-medium"
                        [title]="atributo.atributoNome"
                      >
                        {{ atributo.atributoAbreviacao }}
                      </label>
                      <p-inputnumber
                        [inputId]="'npc-attr-' + atributo.atributoId"
                        [formControlName]="'atributo_' + atributo.atributoId"
                        [min]="0"
                        [max]="999"
                        [showButtons]="false"
                        inputStyleClass="w-full text-center"
                        [aria-label]="atributo.atributoNome"
                      ></p-inputnumber>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

        </div>

        <div class="flex justify-content-end gap-2 mt-5 pt-4 border-top-1 surface-border">
          <p-button
            label="Cancelar"
            severity="secondary"
            [outlined]="true"
            type="button"
            (onClick)="fecharDrawer()"
          ></p-button>
          <p-button
            label="Criar NPC"
            icon="pi pi-check"
            type="submit"
            [loading]="isSaving()"
          ></p-button>
        </div>
      </form>
    </p-dialog>
  `,
})
export class NpcsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private fichaService = inject(FichaBusinessService);
  private configApiService = inject(ConfigApiService);
  private currentGameService = inject(CurrentGameService);
  private configStore = inject(ConfigStore);
  private toastService = inject(ToastService);
  private confirmationService = inject(ConfirmationService);

  // State
  npcs = signal<Ficha[]>([]);
  isLoading = signal(false);
  isSaving = signal(false);
  drawerVisible = signal(false);

  dificuldades = signal<NpcDificuldadeConfig[]>([]);
  dificuldadeSelecionada = signal<NpcDificuldadeConfig | null>(null);

  /** Atributos exibidos na seção "Atributos Base" (sincronizados com o form) */
  atributosForm: Array<{ atributoId: number; atributoNome: string; atributoAbreviacao: string }> = [];

  // Current game
  hasGame = this.currentGameService.hasCurrentGame;
  currentGameId = this.currentGameService.currentGameId;
  currentGameName = computed(() => this.currentGameService.currentGame()?.nome ?? null);

  // Config options for selects
  racasOptions = computed(() =>
    this.configStore.racas().map(r => ({ label: r.nome, value: r.id }))
  );

  classesOptions = computed(() =>
    this.configStore.classes().map(c => ({ label: c.nome, value: c.id }))
  );

  generosOptions = computed(() =>
    this.configStore.generos().map(g => ({ label: g.nome, value: g.id }))
  );

  indolesOptions = computed(() =>
    this.configStore.indoles().map(i => ({ label: i.nome, value: i.id }))
  );

  presencasOptions = computed(() =>
    this.configStore.presencas().map(p => ({ label: p.nome, value: p.id }))
  );

  dificuldadesOptions = computed(() =>
    this.dificuldades().map(d => ({
      label: `${d.nome} (${d.foco === 'FISICO' ? 'Físico' : 'Mágico'})`,
      value: d.id,
    }))
  );

  // Form
  form: FormGroup = this.fb.group({
    nome:         ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    dificuldadeId:[null],
    racaId:       [null],
    classeId:     [null],
    generoId:     [null],
    indoleId:     [null],
    presencaId:   [null],
  });

  ngOnInit(): void {
    if (this.hasGame()) {
      this.carregarNpcs();
      this.carregarDificuldadesEAtributos();
    }
  }

  carregarNpcs(): void {
    const jogoId = this.currentGameId();
    if (!jogoId) return;

    this.isLoading.set(true);
    this.fichaService.loadNpcs(jogoId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (lista) => {
          this.npcs.set(lista);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.toastService.error('Erro ao carregar NPCs');
        },
      });
  }

  carregarDificuldadesEAtributos(): void {
    const jogoId = this.currentGameId();
    if (!jogoId) return;

    // Carrega dificuldades e atributos em paralelo
    this.configApiService.listNpcDificuldades(jogoId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (lista) => this.dificuldades.set(lista),
        // falha silenciosa — campo de dificuldade fica oculto, não bloqueia o formulário
      });

    this.configApiService.listAtributos(jogoId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (atributos) => {
          this.atributosForm = atributos.map(a => ({
            atributoId: a.id,
            atributoNome: a.nome,
            atributoAbreviacao: a.abreviacao,
          }));
          // Adiciona um FormControl por atributo
          for (const atributo of this.atributosForm) {
            this.form.addControl(`atributo_${atributo.atributoId}`, this.fb.control(null));
          }
        },
        // falha silenciosa — seção de atributos fica vazia, não bloqueia o formulário
      });
  }

  onDificuldadeChange(dificuldadeId: number | null): void {
    if (!dificuldadeId) {
      this.dificuldadeSelecionada.set(null);
      return;
    }

    const dificuldade = this.dificuldades().find(d => d.id === dificuldadeId) ?? null;
    this.dificuldadeSelecionada.set(dificuldade);

    if (!dificuldade) return;

    // Auto-preenche os atributos com os valores base da dificuldade selecionada
    for (const valorAtributo of dificuldade.valoresAtributo) {
      const controlName = `atributo_${valorAtributo.atributoId}`;
      const control = this.form.get(controlName);
      if (control) {
        control.setValue(valorAtributo.valorBase);
      }
    }
  }

  abrirDrawer(): void {
    this.form.reset();
    this.form.markAsUntouched();
    this.dificuldadeSelecionada.set(null);
    this.drawerVisible.set(true);
  }

  fecharDrawer(): void {
    this.drawerVisible.set(false);
    this.form.reset();
    this.form.markAsUntouched();
    this.dificuldadeSelecionada.set(null);
  }

  onDrawerVisibleChange(visible: boolean): void {
    if (!visible) {
      this.fecharDrawer();
    }
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastService.warning('Preencha todos os campos obrigatórios', 'Atenção');
      return;
    }

    const jogoId = this.currentGameId();
    if (!jogoId) return;

    const dto: NpcCreateDto = {
      jogoId,
      nome:       this.form.value.nome,
      racaId:     this.form.value.racaId ?? null,
      classeId:   this.form.value.classeId ?? null,
      generoId:   this.form.value.generoId ?? null,
      indoleId:   this.form.value.indoleId ?? null,
      presencaId: this.form.value.presencaId ?? null,
    };

    this.isSaving.set(true);
    this.fichaService.criarNpc(jogoId, dto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (npcCriado) => {
          this.npcs.update(lista => [...lista, npcCriado]);
          this.isSaving.set(false);
          this.fecharDrawer();
          this.toastService.success(`NPC "${npcCriado.nome}" criado com sucesso`);
        },
        error: () => {
          this.isSaving.set(false);
          this.toastService.error('Erro ao criar NPC');
        },
      });
  }

  confirmarExclusao(npc: Ficha): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir o NPC "${npc.nome}"?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, excluir',
      rejectLabel: 'Cancelar',
      acceptButtonProps: { severity: 'danger' },
      accept: () => this.excluirNpc(npc),
    });
  }

  excluirNpc(npc: Ficha): void {
    this.fichaService.deleteFicha(npc.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.npcs.update(lista => lista.filter(n => n.id !== npc.id));
          this.toastService.success(`NPC "${npc.nome}" excluído com sucesso`);
        },
      });
  }

  verFicha(fichaId: number): void {
    this.router.navigate(['/mestre/fichas', fichaId]);
  }
}
