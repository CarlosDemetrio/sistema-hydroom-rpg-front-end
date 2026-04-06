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
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { TabsModule } from 'primeng/tabs';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService } from 'primeng/api';
import {
  Ficha,
  FichaAptidaoResponse,
  FichaAtributoResponse,
  FichaResumo,
  FichaVantagemResponse,
} from '@models/ficha.model';
import { VantagemConfig } from '@models/vantagem-config.model';
import { FichaBusinessService } from '@core/services/business/ficha-business.service';
import { ConfigApiService } from '@core/services/api/config-api.service';
import { AuthService } from '@services/auth.service';
import { ToastService } from '@services/toast.service';
import { DuplicarFichaDto } from '@models/dtos/ficha.dto';
import { FichaAnotacoesTabComponent } from './components/ficha-anotacoes-tab/ficha-anotacoes-tab.component';
import { FichaAptidoesTabComponent } from './components/ficha-aptidoes-tab/ficha-aptidoes-tab.component';
import { FichaAtributosTabComponent } from './components/ficha-atributos-tab/ficha-atributos-tab.component';
import { FichaHeaderComponent } from './components/ficha-header/ficha-header.component';
import { FichaResumoTabComponent } from './components/ficha-resumo-tab/ficha-resumo-tab.component';
import { FichaVantagensTabComponent } from './components/ficha-vantagens-tab/ficha-vantagens-tab.component';

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
    InputTextModule,
    MessageModule,
    SkeletonModule,
    TabsModule,
    ToastModule,
    // Sub-components
    FichaAnotacoesTabComponent,
    FichaAptidoesTabComponent,
    FichaAtributosTabComponent,
    FichaHeaderComponent,
    FichaResumoTabComponent,
    FichaVantagensTabComponent,
  ],
  template: `
    <p-toast />
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
      <div class="ficha-header-sticky">
        <app-ficha-header
          [ficha]="ficha()!"
          [resumo]="resumo()!"
          [podeEditar]="podeEditar()"
          [podeDeletar]="podeDeletar()"
          [podeDuplicar]="podeDuplicar()"
          (editarClick)="irParaEdicao()"
          (deletarClick)="abrirConfirmacaoDeletar()"
          (duplicarClick)="showDuplicarDialog.set(true)"
        />
      </div>

      <!-- Abas -->
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
          </p-tablist>

          <p-tabpanels>
            <!-- Aba 0: Resumo -->
            <p-tabpanel [value]="0">
              <app-ficha-resumo-tab
                [atributos]="atributos()"
                [resumo]="resumo()!"
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
                  [pontosVantagemRestantes]="resumo()!.pontosVantagemDisponiveis ?? 0"
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
          </p-tabpanels>
        </p-tabs>
      </div>
    }

    <!-- Dialog: Duplicar Ficha -->
    <p-dialog
      header="Duplicar Ficha"
      [visible]="showDuplicarDialog()"
      (visibleChange)="showDuplicarDialog.set($event)"
      [modal]="true"
      [style]="{width: '400px'}"
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
      z-index: 10;
    }

    @media (max-width: 768px) {
      .ficha-header-sticky {
        position: static;
      }
    }
  `],
})
export class FichaDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fichaBusinessService = inject(FichaBusinessService);
  private configApiService = inject(ConfigApiService);
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

  protected recarregar(): void {
    const id = this.fichaId();
    if (id) {
      this.carregarFichaCompleta(id);
    }
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
      this.router.navigate(['/fichas', fichaId, 'editar']);
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

  private deletarFicha(): void {
    const fichaId = this.fichaId();
    if (!fichaId) return;

    this.fichaBusinessService.deleteFicha(fichaId).subscribe({
      next: () => {
        this.toastService.success('Ficha deletada com sucesso.');
        this.router.navigate(['/fichas']);
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
        this.router.navigate(['/fichas', resultado.fichaId]);
      },
      error: () => {
        this.toastService.error('Erro ao duplicar a ficha.');
        this.duplicando.set(false);
      },
    });
  }
}
