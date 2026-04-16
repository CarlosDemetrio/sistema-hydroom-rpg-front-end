import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { TabsModule } from 'primeng/tabs';
import { ConfirmationService } from 'primeng/api';
import {
  Ficha,
  FichaAptidaoResponse,
  FichaAtributoResponse,
  FichaResumo,
  FichaVantagemResponse,
  JogadorAcessoItem,
  NpcVisibilidadeUpdate,
} from '@models/ficha.model';
import { VantagemConfig } from '@models/vantagem-config.model';
import { FichaBusinessService } from '@core/services/business/ficha-business.service';
import { FichaVisibilidadeApiService } from '@core/services/api/ficha-visibilidade.api.service';
import { FichasApiService } from '@core/services/api/fichas-api.service';
import { ConfigApiService } from '@core/services/api/config-api.service';
import { ConfigStore } from '@core/stores/config.store';
import { AuthService } from '@services/auth.service';
import { ToastService } from '@services/toast.service';
import { DuplicarFichaDto } from '@models/dtos/ficha.dto';
import { FichaAnotacoesTabComponent } from './components/ficha-anotacoes-tab/ficha-anotacoes-tab.component';
import { FichaAptidoesTabComponent } from './components/ficha-aptidoes-tab/ficha-aptidoes-tab.component';
import { FichaAtributosTabComponent } from './components/ficha-atributos-tab/ficha-atributos-tab.component';
import { FichaEquipamentosTabComponent } from './components/ficha-equipamentos-tab/ficha-equipamentos-tab.component';
import { FichaGaleriaTabComponent } from './components/ficha-galeria-tab/ficha-galeria-tab.component';
import { FichaHeaderComponent } from './components/ficha-header/ficha-header.component';
import { FichaResumoTabComponent } from './components/ficha-resumo-tab/ficha-resumo-tab.component';
import { FichaSessaoTabComponent } from './components/ficha-sessao-tab/ficha-sessao-tab.component';
import { FichaVantagensTabComponent } from './components/ficha-vantagens-tab/ficha-vantagens-tab.component';
import { NpcVisibilidadeComponent } from './components/npc-visibilidade/npc-visibilidade.component';
import { ProspeccaoComponent } from './components/prospeccao/prospeccao.component';
import { LevelUpDialogComponent } from './components/level-up-dialog/level-up-dialog.component';

@Component({
  selector: 'app-ficha-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ConfirmationService],
  imports: [
    RouterModule,
    FormsModule,
    ButtonModule,
    CardModule,
    ConfirmDialogModule,
    DialogModule,
    DividerModule,
    InputNumberModule,
    InputTextModule,
    MessageModule,
    SkeletonModule,
    TabsModule,
    // Sub-components
    FichaAnotacoesTabComponent,
    FichaAptidoesTabComponent,
    FichaAtributosTabComponent,
    FichaEquipamentosTabComponent,
    FichaGaleriaTabComponent,
    FichaHeaderComponent,
    FichaResumoTabComponent,
    FichaSessaoTabComponent,
    FichaVantagensTabComponent,
    NpcVisibilidadeComponent,
    ProspeccaoComponent,
    LevelUpDialogComponent,
  ],
  template: `
    <p-confirmdialog />

    <!-- Loading State -->
    @if (loading()) {
      <div class="p-4 flex flex-col gap-4" aria-busy="true" aria-label="Carregando ficha">
        <!-- Header skeleton -->
        <div class="flex items-center gap-4">
          <p-skeleton shape="circle" size="5rem" />
          <div class="flex flex-col gap-2 flex-1">
            <p-skeleton width="60%" height="1.5rem" />
            <p-skeleton width="40%" height="1rem" />
          </div>
          <p-skeleton width="80px" height="2rem" borderRadius="16px" />
        </div>
        <!-- Stats bar skeleton -->
        <div class="flex flex-col gap-2">
          <p-skeleton width="100%" height="1.25rem" borderRadius="8px" />
          <p-skeleton width="70%" height="1.25rem" borderRadius="8px" />
        </div>
        <!-- Content grid skeleton -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
          @for (_ of [1, 2, 3, 4]; track $index) {
            <p-skeleton height="100px" borderRadius="8px" />
          }
        </div>
      </div>
    }

    <!-- Error State -->
    @if (!loading() && erro()) {
      <div class="flex flex-col items-center justify-center p-8 gap-4">
        <i class="pi pi-exclamation-circle text-red-500" style="font-size: 3rem"></i>
        <h2 class="text-xl font-semibold m-0">Erro ao carregar ficha</h2>
        <p class="text-color-secondary text-center m-0">{{ erro() }}</p>
        <p-button
          label="Tentar novamente"
          icon="pi pi-refresh"
          outlined
          (onClick)="recarregar()"
        />
      </div>
    }

    <!-- Main Content -->
    @if (!loading() && !erro() && ficha() && resumo()) {
      <!-- Ficha Header (sticky on desktop) -->
      <div class="ficha-header-sticky surface-card shadow-2">
        <app-ficha-header
          [ficha]="ficha()!"
          [resumo]="resumo()!"
          [podeEditar]="podeEditar()"
          [podeDeletar]="podeDeletar()"
          [podeDuplicar]="podeDuplicar()"
          [mostrarBotaoVisibilidade]="mostrarPainelNpc()"
          [podeResetar]="podeResetar()"
          [resetando]="resetando()"
          [animandoLevelUp]="fichaHeaderAnimando()"
          [pontosAtributoDisponiveis]="resumo()?.pontosAtributoDisponiveis ?? 0"
          [pontosAptidaoDisponiveis]="resumo()?.pontosAptidaoDisponiveis ?? 0"
          (editarClick)="irParaEdicao()"
          (deletarClick)="abrirConfirmacaoDeletar()"
          (duplicarClick)="showDuplicarDialog.set(true)"
          (visibilidadeClick)="drawerVisibilidadeAberto.set(true)"
          (resetarClick)="abrirConfirmacaoReset()"
          (abrirLevelUpDialog)="levelUpDialogVisivel.set(true)"
        />
      </div>

      <!-- Layout: 2 colunas em desktop quando NPC + MESTRE, coluna única caso contrário -->
      <div [class]="mostrarPainelNpc() ? 'lg:grid lg:grid-cols-3 lg:gap-4' : ''">

        <!-- Coluna principal: Abas -->
        <div [class]="mostrarPainelNpc() ? 'lg:col-span-2' : ''">
          <div class="p-3">
            <p-tabs [value]="abaAtiva()" scrollable (valueChange)="onTabChange($event ?? 0)">
              <p-tablist>
                <p-tab [value]="0">
                  <i class="pi pi-chart-bar mr-2"></i>Resumo
                </p-tab>
                <p-tab [value]="1">
                  <i class="pi pi-sliders-h mr-2"></i>Atributos
                </p-tab>
                <p-tab [value]="2">
                  <i class="pi pi-list mr-2"></i>Aptidoes
                </p-tab>
                <p-tab [value]="3">
                  <i class="pi pi-star mr-2"></i>Vantagens
                </p-tab>
                <p-tab [value]="4">
                  <i class="pi pi-pencil mr-2"></i>Anotacoes
                </p-tab>
                <p-tab [value]="5">
                  <i class="pi pi-shield mr-2"></i>Equipamentos
                </p-tab>
                <p-tab [value]="6">
                  <i class="pi pi-dice mr-2"></i>Prospecção
                </p-tab>
                <p-tab [value]="7">
                  <i class="pi pi-images mr-2"></i>Galeria
                </p-tab>
                <p-tab [value]="8">
                  <i class="pi pi-shield mr-2"></i>Sessao
                </p-tab>
              </p-tablist>

              <p-tabpanels>
                <!-- Aba 0: Resumo -->
                <p-tabpanel [value]="0">
                  <app-ficha-resumo-tab
                    [atributos]="atributos()"
                    [resumo]="resumo()!"
                    [isMestre]="isMestre()"
                    (abrirDialogXp)="dialogXpVisivel.set(true)"
                  />
                </p-tabpanel>

                <!-- Aba 1: Atributos -->
                <p-tabpanel [value]="1">
                  @if (loadingAtributos()) {
                    <div class="p-3">
                      <p-skeleton height="2rem" class="mb-3" />
                      @for (_ of [1, 2, 3, 4]; track $index) {
                        <p-skeleton height="2.5rem" class="mb-1" />
                      }
                    </div>
                  } @else {
                    <app-ficha-atributos-tab [atributos]="atributos()" />
                  }
                </p-tabpanel>

                <!-- Aba 2: Aptidoes -->
                <p-tabpanel [value]="2">
                  @if (loadingAptidoes()) {
                    <div class="p-3">
                      @for (_ of [1, 2, 3, 4]; track $index) {
                        <p-skeleton height="2.5rem" class="mb-1" />
                      }
                    </div>
                  } @else {
                    <app-ficha-aptidoes-tab [aptidoes]="aptidoes()" />
                  }
                </p-tabpanel>

                <!-- Aba 3: Vantagens -->
                <p-tabpanel [value]="3">
                  @if (loadingVantagens()) {
                    <div class="p-3 flex flex-col gap-3">
                      @for (_ of [1, 2, 3]; track $index) {
                        <p-skeleton height="5rem" borderRadius="8px" />
                      }
                    </div>
                  } @else {
                    <app-ficha-vantagens-tab
                      [vantagens]="vantagens()"
                      [pontosVantagemRestantes]="resumo()!.pontosVantagemDisponiveis"
                      [podeAumentarNivel]="podeEditar()"
                      [isMestre]="isMestre()"
                      [vantagensInsolitusConfig]="vantagensInsolitusConfig()"
                      (aumentarNivelVantagem)="onAumentarNivelVantagem($event)"
                      (revogarVantagem)="onRevogarVantagem($event)"
                      (concederInsolitusConfirmado)="onConcederInsolitus($event)"
                    />
                  }
                </p-tabpanel>

                <!-- Aba 4: Anotacoes -->
                <p-tabpanel [value]="4">
                  @if (userInfo()) {
                    <app-ficha-anotacoes-tab
                      [fichaId]="fichaId()!"
                      [userRole]="userRole()"
                      [userId]="userIdNumber()"
                    />
                  }
                </p-tabpanel>

                <!-- Aba 5: Equipamentos -->
                <p-tabpanel [value]="5">
                  @if (fichaId() && ficha()) {
                    <app-ficha-equipamentos-tab
                      [fichaId]="fichaId()!"
                      [jogoId]="ficha()!.jogoId"
                      [podeEditar]="podeEditar()"
                      [isMestre]="isMestre()"
                    />
                  }
                </p-tabpanel>

                <!-- Aba 6: Prospecção -->
                <p-tabpanel [value]="6">
                  @if (fichaId() && ficha()) {
                    <app-prospeccao
                      [fichaId]="fichaId()!"
                      [jogoId]="ficha()!.jogoId"
                    />
                  }
                </p-tabpanel>

                <!-- Aba 7: Galeria -->
                <p-tabpanel [value]="7">
                  @if (fichaId() && ficha()) {
                    <app-ficha-galeria-tab
                      [fichaId]="fichaId()!"
                      [userRole]="userRole()"
                      [userId]="userIdNumber()"
                      [fichaJogadorId]="ficha()?.jogadorId ?? null"
                    />
                  }
                </p-tabpanel>

                <!-- Aba 8: Sessao (vida, essencia, membros do corpo em combate) -->
                <p-tabpanel [value]="8">
                  @if (fichaId() && resumo()) {
                    <app-ficha-sessao-tab
                      [fichaId]="fichaId()!"
                      [resumo]="resumo()!"
                      [isMestre]="isMestre()"
                    />
                  }
                </p-tabpanel>
              </p-tabpanels>
            </p-tabs>
          </div>
        </div>

        <!-- Coluna lateral: Painel de Visibilidade NPC (desktop lg+) -->
        @if (mostrarPainelNpc()) {
          <div class="hidden lg:block p-3">
            <div class="surface-card border-round p-4 border-1 surface-border">
              <app-npc-visibilidade
                [fichaId]="fichaId()!"
                [jogoId]="ficha()!.jogoId"
                [visivelGlobalmente]="ficha()!.visivelGlobalmente ?? false"
                [jogadoresComAcesso]="jogadoresComAcessoDetalhado()"
                (visibilidadeAtualizada)="onVisibilidadeAtualizada($event)"
              />
            </div>
          </div>
        }
      </div>
    }

    <!-- Dialog mobile: Painel de Visibilidade NPC -->
    @if (mostrarPainelNpc() && ficha()) {
      <p-dialog
        [visible]="drawerVisibilidadeAberto()"
        (visibleChange)="drawerVisibilidadeAberto.set($event)"
        header="Visibilidade do NPC"
        [modal]="true"
        [draggable]="false"
        [resizable]="false"
        styleClass="lg:hidden"
      >
        <app-npc-visibilidade
          [fichaId]="fichaId()!"
          [jogoId]="ficha()!.jogoId"
          [visivelGlobalmente]="ficha()!.visivelGlobalmente ?? false"
          [jogadoresComAcesso]="jogadoresComAcessoDetalhado()"
          (visibilidadeAtualizada)="onVisibilidadeAtualizada($event)"
        />
      </p-dialog>
    }

    <!-- Dialog: Conceder XP (Mestre only) -->
    @if (isMestre()) {
      <p-dialog
        header="Conceder XP"
        [visible]="dialogXpVisivel()"
        (visibleChange)="dialogXpVisivel.set($event)"
        [modal]="true"
        [draggable]="false"
        [resizable]="false"
        [style]="{ width: '360px' }"
      >
        <div class="flex flex-col gap-3 p-2">
          <label for="qtdXp" class="font-medium">Quantidade de XP</label>
          <p-inputnumber
            inputId="qtdXp"
            [ngModel]="quantidadeXp()"
            (ngModelChange)="quantidadeXp.set($event)"
            [min]="1"
            [useGrouping]="true"
            placeholder="Ex: 500"
            class="w-full"
            aria-label="Quantidade de XP a conceder"
          />
        </div>
        <ng-template #footer>
          <p-button label="Cancelar" text (onClick)="dialogXpVisivel.set(false)" />
          <p-button
            label="Confirmar"
            icon="pi pi-check"
            [loading]="salvandoXp()"
            [disabled]="!quantidadeXp() || quantidadeXp() < 1"
            (onClick)="concederXp()"
          />
        </ng-template>
      </p-dialog>
    }

    <!-- Dialog: Level Up — distribuição de pontos -->
    @if (levelUpDialogVisivel() && resumo() && atributos().length > 0) {
      <app-level-up-dialog
        [fichaId]="fichaId()!"
        [nivelNovo]="ficha()!.nivel"
        [fichaNome]="ficha()!.nome"
        [limitadorAtributo]="nivelAtual()?.limitadorAtributo ?? 999"
        [pontosAtributoDisponiveis]="resumo()!.pontosAtributoDisponiveis"
        [pontosAptidaoDisponiveis]="resumo()!.pontosAptidaoDisponiveis"
        [pontosVantagemDisponiveis]="resumo()!.pontosVantagemDisponiveis"
        [atributos]="atributos()"
        [aptidoes]="aptidoes()"
        (fechado)="levelUpDialogVisivel.set(false)"
        (distribuicaoSalva)="recarregar()"
        (navegarParaVantagens)="abaAtiva.set(3)"
      />
    }

    <!-- Dialog: Duplicar Ficha -->
    <p-dialog
      header="Duplicar Ficha"
      [visible]="showDuplicarDialog()"
      (visibleChange)="showDuplicarDialog.set($event)"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
    >
      <div class="flex flex-col gap-4">
        <p class="text-color-secondary m-0">
          Cria uma copia desta ficha com todos os atributos, aptidoes e vantagens.
        </p>
        <div class="flex flex-col gap-1">
          <label for="novoNomeDuplicar" class="font-medium">Nome da nova ficha</label>
          <input
            pInputText
            id="novoNomeDuplicar"
            type="text"
            [ngModel]="novoNomeDuplicar()"
            (ngModelChange)="novoNomeDuplicar.set($event)"
            placeholder="Ex: Aldric Copia"
            class="w-full"
            aria-label="Nome da nova ficha duplicada"
          />
        </div>
      </div>
      <ng-template #footer>
        <p-button label="Cancelar" text (onClick)="showDuplicarDialog.set(false)" />
        <p-button
          label="Duplicar"
          icon="pi pi-copy"
          [disabled]="!novoNomeDuplicar().trim()"
          [loading]="duplicando()"
          (onClick)="confirmarDuplicar()"
        />
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .ficha-header-sticky {
      position: sticky;
      top: 0;
      z-index: 100;
    }

    @media (max-width: 768px) {
      .ficha-header-sticky {
        position: static;
        z-index: auto;
      }
    }
  `],
})
export class FichaDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fichaBusinessService = inject(FichaBusinessService);
  private fichaVisibilidadeApiService = inject(FichaVisibilidadeApiService);
  private fichasApiService = inject(FichasApiService);
  private configApiService = inject(ConfigApiService);
  private configStore = inject(ConfigStore);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private confirmationService = inject(ConfirmationService);

  // ViewChild para acessar o metodo resetarConcedendo do dumb component
  private vantagensTabRef = viewChild(FichaVantagensTabComponent);

  // Route param
  protected fichaId = signal<number | null>(null);

  // Data signals
  protected ficha = signal<Ficha | null>(null);
  protected resumo = signal<FichaResumo | null>(null);
  protected atributos = signal<FichaAtributoResponse[]>([]);
  protected aptidoes = signal<FichaAptidaoResponse[]>([]);
  protected vantagens = signal<FichaVantagemResponse[]>([]);
  /** Config de vantagens do tipo INSOLITUS disponíveis para conceder (carregado quando Mestre abre a aba). */
  protected vantagensInsolitusConfig = signal<VantagemConfig[]>([]);

  // NPC Visibilidade state
  /** Jogadores com acesso detalhado ao NPC (carregado quando mostrarPainelNpc=true). */
  protected jogadoresComAcessoDetalhado = signal<JogadorAcessoItem[]>([]);
  /** Controle do drawer mobile de visibilidade (mobile only). */
  protected drawerVisibilidadeAberto = signal<boolean>(false);

  // UI state
  protected loading = signal(true);
  protected loadingAtributos = signal(false);
  protected loadingAptidoes = signal(false);
  protected loadingVantagens = signal(false);
  protected erro = signal<string | null>(null);
  protected abaAtiva = signal<number>(0);

  // Dialog state
  protected showDuplicarDialog = signal(false);
  protected novoNomeDuplicar = signal('');
  protected duplicando = signal(false);
  protected resetando = signal(false);

  // XP / Level-up state
  protected fichaHeaderAnimando = signal(false);
  protected dialogXpVisivel = signal(false);
  protected levelUpDialogVisivel = signal(false);
  protected quantidadeXp = signal<number>(0);
  protected salvandoXp = signal(false);

  // Auth shortcuts
  protected userInfo = computed(() => this.authService.currentUser());
  protected isMestre = computed(() => this.authService.isMestre());
  protected userIdNumber = computed(() => {
    const id = this.authService.currentUser()?.id;
    return id ? Number(id) : 0;
  });
  protected userRole = computed<'MESTRE' | 'JOGADOR'>(() => {
    return this.authService.currentUser()?.role ?? 'JOGADOR';
  });

  // Permission computed
  protected podeEditar = computed(() => {
    const f = this.ficha();
    if (!f) return false;
    return this.fichaBusinessService.canEdit(f);
  });

  protected podeDeletar = computed(() =>
    this.authService.isMestre()
  );

  protected podeDuplicar = computed(() =>
    this.authService.isMestre() || this.podeEditar()
  );

  /** Exibe o painel lateral de visibilidade apenas quando a ficha é NPC e o usuário é Mestre. */
  protected mostrarPainelNpc = computed(() => {
    const f = this.ficha();
    return !!(f?.isNpc && this.isMestre());
  });

  /** Exibe o botao "Resetar Estado" apenas para o Mestre quando há ficha carregada. */
  protected podeResetar = computed(() => this.isMestre() && this.ficha() !== null);

  /** Configuração de nível correspondente ao nível atual da ficha (para limitadorAtributo). */
  protected nivelAtual = computed(() => {
    const nivel = this.ficha()?.nivel;
    if (nivel == null) return null;
    return this.configStore.niveis().find((n) => n.nivel === nivel) ?? null;
  });

  constructor() {
    effect(() => {
      const id = this.fichaId();
      if (id) {
        this.carregarFichaCompleta(id);
      }
    });
  }

  ngOnInit(): void {
    const rawId = this.route.snapshot.params['id'];
    const parsed = Number(rawId);
    if (!isNaN(parsed) && parsed > 0) {
      this.fichaId.set(parsed);
    } else {
      this.erro.set('ID de ficha invalido.');
      this.loading.set(false);
    }
  }

  private carregarFichaCompleta(fichaId: number): void {
    this.loading.set(true);
    this.erro.set(null);

    this.fichaBusinessService.loadFichaCompleta(fichaId).subscribe({
      next: ({ ficha, resumo }) => {
        this.ficha.set(ficha);
        this.resumo.set(resumo);
        this.loading.set(false);
        // Pre-load atributos from resumo (available immediately)
        // Full atributos list requires a separate call on tab activation

        // Carregar visibilidade se for NPC e Mestre
        if (ficha.isNpc && this.isMestre()) {
          this.carregarVisibilidadeNpc(fichaId);
        }
      },
      error: (err: { status?: number }) => {
        if (err.status === 404) {
          this.erro.set('Ficha nao encontrada ou foi removida.');
        } else {
          this.erro.set('Nao foi possivel carregar a ficha. Verifique sua conexao.');
        }
        this.loading.set(false);
      },
    });
  }

  private carregarVisibilidadeNpc(fichaId: number): void {
    this.fichaVisibilidadeApiService.listarVisibilidade(fichaId).subscribe({
      next: (visibilidade) => {
        this.jogadoresComAcessoDetalhado.set(visibilidade.jogadoresComAcesso);
        // Sincronizar visivelGlobalmente na ficha local
        this.ficha.update(f => f ? { ...f, visivelGlobalmente: visibilidade.visivelGlobalmente } : f);
      },
      error: () => {
        // Falha silenciosa — painel continua visível mas sem dados de acesso detalhado
      },
    });
  }

  protected onVisibilidadeAtualizada(update: NpcVisibilidadeUpdate): void {
    this.ficha.update(f => f ? { ...f, visivelGlobalmente: update.visivelGlobalmente } : f);
    // Recarregar dados completos de visibilidade para manter jogadoresComAcessoDetalhado atualizado
    const fichaId = this.fichaId();
    if (fichaId) {
      this.carregarVisibilidadeNpc(fichaId);
    }
  }

  protected recarregar(): void {
    const id = this.fichaId();
    if (id) {
      this.carregarFichaCompleta(id);
    }
  }

  protected concederXp(): void {
    const fichaId = this.fichaId();
    const ficha = this.ficha();
    const qtd = this.quantidadeXp();
    if (!fichaId || !ficha || qtd < 1) return;
    const nivelAntes = ficha.nivel;
    this.salvandoXp.set(true);
    this.fichasApiService.concederXp(fichaId, qtd).subscribe({
      next: (fichaAtualizada) => {
        this.dialogXpVisivel.set(false);
        this.quantidadeXp.set(0);
        this.salvandoXp.set(false);
        this.toastService.success('XP concedido com sucesso!');
        if (fichaAtualizada.nivel > nivelAntes) {
          this.onLevelUp(nivelAntes, fichaAtualizada.nivel, fichaAtualizada.nome);
        }
        this.carregarFichaCompleta(fichaId);
      },
      error: () => {
        this.salvandoXp.set(false);
        this.toastService.error('Erro ao conceder XP. Tente novamente.');
      },
    });
  }

  private onLevelUp(_nivelAntes: number, nivelNovo: number, nome: string): void {
    this.toastService.levelUp(nivelNovo, nome);
    this.fichaHeaderAnimando.set(true);
    setTimeout(() => this.fichaHeaderAnimando.set(false), 1500);
    // Garantir que atributos estejam carregados antes de abrir o dialog de level-up
    const fichaId = this.fichaId();
    if (fichaId && this.atributos().length === 0) {
      this.carregarAtributos(fichaId);
    }
    this.levelUpDialogVisivel.set(true);
  }

  protected onTabChange(value: number | string): void {
    const tab = Number(value);
    this.abaAtiva.set(tab);
    this.carregarDadosAba(tab);
  }

  private carregarDadosAba(aba: number): void {
    const fichaId = this.fichaId();
    if (!fichaId) return;

    switch (aba) {
      case 1:
        if (this.atributos().length === 0) {
          this.carregarAtributos(fichaId);
        }
        break;
      case 2:
        if (this.aptidoes().length === 0) {
          this.carregarAptidoes(fichaId);
        }
        break;
      case 3:
        if (this.vantagens().length === 0) {
          this.carregarVantagens(fichaId);
        }
        break;
    }
  }

  private carregarAtributos(fichaId: number): void {
    this.loadingAtributos.set(true);
    this.fichaBusinessService.loadAtributos(fichaId).subscribe({
      next: (atributos) => {
        this.atributos.set(atributos);
        this.loadingAtributos.set(false);
      },
      error: () => {
        this.toastService.error('Erro ao carregar atributos.');
        this.loadingAtributos.set(false);
      },
    });
  }

  private carregarAptidoes(fichaId: number): void {
    this.loadingAptidoes.set(true);
    this.fichaBusinessService.loadAptidoes(fichaId).subscribe({
      next: (aptidoes) => {
        this.aptidoes.set(aptidoes);
        this.loadingAptidoes.set(false);
      },
      error: () => {
        this.toastService.error('Erro ao carregar aptidoes.');
        this.loadingAptidoes.set(false);
      },
    });
  }

  private carregarVantagens(fichaId: number): void {
    this.loadingVantagens.set(true);
    this.fichaBusinessService.loadVantagens(fichaId).subscribe({
      next: (vantagens) => {
        this.vantagens.set(vantagens);
        this.loadingVantagens.set(false);
        // Se for Mestre e ainda não carregou as configs INSOLITUS, carrega agora
        if (this.isMestre() && this.vantagensInsolitusConfig().length === 0) {
          const jogoId = this.ficha()?.jogoId;
          if (jogoId) {
            this.carregarVantagensInsolitusConfig(jogoId);
          }
        }
      },
      error: () => {
        this.toastService.error('Erro ao carregar vantagens.');
        this.loadingVantagens.set(false);
      },
    });
  }

  private carregarVantagensInsolitusConfig(jogoId: number): void {
    this.configApiService.listVantagens(jogoId).subscribe({
      next: (configs) => {
        const insolitus = configs.filter(v => v.tipoVantagem === 'INSOLITUS');
        this.vantagensInsolitusConfig.set(insolitus);
      },
      error: () => {
        // Falha silenciosa — o Mestre verá lista vazia no dialog, mas nao bloqueia a UI
      },
    });
  }

  protected onAumentarNivelVantagem(vantagemId: number): void {
    const fichaId = this.fichaId();
    if (!fichaId) return;

    this.fichaBusinessService.aumentarNivelVantagem(fichaId, vantagemId).subscribe({
      next: (vantagemAtualizada) => {
        this.vantagens.update(list =>
          list.map(v => v.id === vantagemId ? vantagemAtualizada : v)
        );
        this.toastService.success('Nivel da vantagem aumentado!');
        // Reload resumo to reflect updated pontosVantagemDisponiveis
        this.fichasApiService.getFichaResumo(fichaId).subscribe({
          next: (novoResumo) => this.resumo.set(novoResumo),
        });
      },
      error: () => {
        this.toastService.error('Erro ao aumentar nivel da vantagem.');
      },
    });
  }

  protected onConcederInsolitus(vantagemConfigId: number): void {
    const fichaId = this.fichaId();
    if (!fichaId) return;

    this.fichaBusinessService.concederInsolitus(fichaId, vantagemConfigId).subscribe({
      next: (novaVantagem) => {
        this.vantagens.update(list => [...list, novaVantagem]);
        this.toastService.success('Insolitus concedido com sucesso!');
        this.vantagensTabRef()?.resetarConcedendo(true);
      },
      error: () => {
        this.toastService.error('Erro ao conceder Insolitus. Verifique se ja foi concedido.');
        this.vantagensTabRef()?.resetarConcedendo(false);
      },
    });
  }

  protected onRevogarVantagem(fichaVantagemId: number): void {
    const fichaId = this.fichaId();
    if (!fichaId) return;

    this.fichaBusinessService.revogarVantagem(fichaId, fichaVantagemId).subscribe({
      next: () => {
        this.vantagens.update(list => list.filter(v => v.id !== fichaVantagemId));
        this.toastService.success('Vantagem revogada com sucesso.');
      },
      error: () => {
        this.toastService.error('Erro ao revogar vantagem.');
      },
    });
  }

  protected irParaEdicao(): void {
    const fichaId = this.fichaId();
    if (fichaId) {
      const prefixo = this.isMestre() ? '/mestre' : '/jogador';
      this.router.navigate([prefixo, 'fichas', fichaId, 'edit']);
    }
  }

  protected abrirConfirmacaoDeletar(): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja deletar a ficha "${this.ficha()?.nome}"? Esta acao nao pode ser desfeita.`,
      header: 'Deletar Ficha',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      acceptLabel: 'Sim, deletar',
      rejectLabel: 'Cancelar',
      accept: () => this.deletarFicha(),
    });
  }

  protected abrirConfirmacaoReset(): void {
    this.confirmationService.confirm({
      message: 'Isso restaurara vida, essencia e dano dos membros ao estado base. Esta acao nao pode ser desfeita.',
      header: 'Resetar Estado de Combate',
      icon: 'pi pi-refresh',
      acceptButtonStyleClass: 'p-button-warning',
      acceptLabel: 'Sim, resetar',
      rejectLabel: 'Cancelar',
      accept: () => this.executarResetarEstado(),
    });
  }

  protected executarResetarEstado(): void {
    const fichaId = this.fichaId();
    if (!fichaId) return;

    this.resetando.set(true);
    this.fichasApiService.resetarEstado(fichaId).subscribe({
      next: (novoResumo) => {
        this.resumo.set(novoResumo);
        this.resetando.set(false);
        this.toastService.success('Estado de combate resetado com sucesso.');
      },
      error: () => {
        this.toastService.error('Erro ao resetar estado de combate.');
        this.resetando.set(false);
      },
    });
  }

  private deletarFicha(): void {
    const fichaId = this.fichaId();
    if (!fichaId) return;

    this.fichaBusinessService.deleteFicha(fichaId).subscribe({
      next: () => {
        this.toastService.success('Ficha deletada com sucesso.');
        const prefixo = this.isMestre() ? '/mestre' : '/jogador';
        this.router.navigate([prefixo, 'fichas']);
      },
      error: () => {
        this.toastService.error('Erro ao deletar a ficha.');
      },
    });
  }

  protected confirmarDuplicar(): void {
    const fichaId = this.fichaId();
    if (!fichaId || !this.novoNomeDuplicar().trim()) return;

    const dto: DuplicarFichaDto = {
      novoNome: this.novoNomeDuplicar().trim(),
      manterJogador: false,
    };

    this.duplicando.set(true);
    this.fichaBusinessService.duplicarFicha(fichaId, dto).subscribe({
      next: (resultado) => {
        this.toastService.success(`Ficha "${resultado.nome}" criada com sucesso!`);
        this.showDuplicarDialog.set(false);
        this.novoNomeDuplicar.set('');
        this.duplicando.set(false);
        const prefixo = this.isMestre() ? '/mestre' : '/jogador';
        this.router.navigate([prefixo, 'fichas', resultado.fichaId]);
      },
      error: () => {
        this.toastService.error('Erro ao duplicar a ficha.');
        this.duplicando.set(false);
      },
    });
  }
}
