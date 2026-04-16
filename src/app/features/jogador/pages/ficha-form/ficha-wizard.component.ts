import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { StepsModule } from 'primeng/steps';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MenuItem } from 'primeng/api';
import { FichasApiService } from '@core/services/api/fichas-api.service';
import { ConfigApiService } from '@core/services/api/config-api.service';
import { CurrentGameService } from '@core/services/current-game.service';
import { AuthService } from '@services/auth.service';
import {
  ClassePersonagem,
  GeneroConfig,
  IndoleConfig,
  NivelConfig,
  PresencaConfig,
  Raca,
} from '@core/models/config.models';
import { AtualizarAptidaoDto, AtualizarAtributoDto, Ficha, FichaVantagemResponse } from '@core/models/ficha.model';
import { CreateFichaDto, UpdateFichaDto } from '@core/models/dtos/ficha.dto';
import { StepIdentificacaoComponent } from './steps/step-identificacao/step-identificacao.component';
import { StepDescricaoComponent } from './steps/step-descricao/step-descricao.component';
import { StepAtributosComponent } from './steps/step-atributos/step-atributos.component';
import { StepAptidoesComponent } from './steps/step-aptidoes/step-aptidoes.component';
import { StepVantagensComponent } from './steps/step-vantagens/step-vantagens.component';
import { StepRevisaoComponent, FormPasso1Revisao } from './steps/step-revisao/step-revisao.component';
import { WizardRodapeComponent } from '@shared/components/wizard-rodape/wizard-rodape.component';
import {
  EstadoSalvamento,
  FichaAptidaoEditavel,
  FichaAtributoEditavel,
  FormPasso1,
  FormPasso2,
  TipoAptidaoComAptidoes,
} from './ficha-wizard.types';
import { forkJoin, Observable } from 'rxjs';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ToastService } from '@services/toast.service';

/**
 * FichaWizardComponent (SMART — Orquestrador)
 *
 * Wizard de 6 passos para criacao/edicao de fichas.
 *
 * Passo 1 (T6): Identificacao — nome, genero, raca, classe, indole, presenca
 * Passos 2-6 (T7-T11): Placeholders (a implementar)
 *
 * Fluxo:
 * - Avancar do Passo 1: POST /fichas (se novo) ou PUT /fichas/{id} (se rascunho)
 * - Retomada: ?fichaId=N na query pre-preenche o form e determina o passo inicial
 * - isNpc: detectado via data.npc na rota ('criar-npc') ou via toggle (MESTRE)
 */
@Component({
  selector: 'app-ficha-wizard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonModule,
    StepsModule,
    ProgressSpinnerModule,
    StepIdentificacaoComponent,
    StepDescricaoComponent,
    StepAtributosComponent,
    StepAptidoesComponent,
    StepVantagensComponent,
    StepRevisaoComponent,
    WizardRodapeComponent,
    PageHeaderComponent,
  ],
  template: `
    <div class="p-4">

      <!-- Header -->
      <div class="mb-4">
        <app-page-header
          [title]="isNpcRota() ? 'Criar NPC' : 'Criar Personagem'"
          backRoute="/jogador/fichas"
        />
        @if (currentGame()) {
          <p class="text-color-secondary m-0">
            Campanha: <span class="font-semibold text-primary">{{ currentGame()!.nome }}</span>
          </p>
        }
      </div>

      <!-- Steps -->
      <p-steps
        [model]="passos"
        [activeIndex]="passoAtual() - 1"
        [readonly]="true"
        styleClass="mb-5"
      ></p-steps>

      <!-- Indicador de carregamento das configs -->
      @if (carregandoConfigs() || carregandoRascunho()) {
        <div class="flex justify-content-center align-items-center" style="min-height: 300px;">
          <p-progress-spinner strokeWidth="4" animationDuration=".8s"></p-progress-spinner>
        </div>
      } @else {

        <!-- Conteudo do passo atual -->

        <!-- Passo 1: Identificacao -->
        @if (passoAtual() === 1) {
          <app-step-identificacao
            [jogoId]="jogoId()"
            [generos]="generos()"
            [racas]="racas()"
            [classesFiltradas]="classesFiltradas()"
            [indoles]="indoles()"
            [presencas]="presencas()"
            [isMestre]="isMestre()"
            [dadosIniciais]="formPasso1()"
            (formChanged)="onFormPasso1Changed($event)"
            (racaSelecionada)="onRacaSelecionada($event)"
          ></app-step-identificacao>
        }

        <!-- Passo 2: Descricao -->
        @if (passoAtual() === 2) {
          <app-step-descricao
            [descricao]="formPasso2().descricao"
            (descricaoChanged)="onFormPasso2Changed($event)"
          ></app-step-descricao>
        }

        @if (passoAtual() === 3) {
          @if (carregandoAtributos()) {
            <div class="flex justify-content-center p-5">
              <p-progress-spinner strokeWidth="4" animationDuration=".8s"></p-progress-spinner>
            </div>
          } @else {
            <app-step-atributos
              [atributos]="formPasso3()"
              [pontosDisponiveis]="pontosAtributoDisponiveis()"
              [limitadorAtributo]="limitadorAtributo()"
              (atributosChanged)="onFormPasso3Changed($event)"
            ></app-step-atributos>
          }
        }

        @if (passoAtual() === 4) {
          @if (carregandoAptidoes()) {
            <div class="flex justify-content-center p-5">
              <p-progress-spinner strokeWidth="4" animationDuration=".8s"></p-progress-spinner>
            </div>
          } @else {
            <app-step-aptidoes
              [aptidoesAgrupadas]="aptidoesAgrupadas()"
              [pontosDisponiveis]="pontosAptidaoDisponiveis()"
              (aptidoesChanged)="onFormPasso4Changed($event)"
            ></app-step-aptidoes>
          }
        }

        @if (passoAtual() === 5) {
          <app-step-vantagens
            [fichaId]="fichaId()!"
            [jogoId]="jogoId()"
            [pontosDisponiveis]="pontosVantagemDisponiveis()"
            (pontosAtualizados)="onPontosVantagemAtualizados($event)"
          ></app-step-vantagens>
        }

        @if (passoAtual() === 6) {
          <app-step-revisao
            [formPasso1]="formPasso1Revisao()"
            [formPasso2]="{ descricao: formPasso2().descricao }"
            [atributos]="formPasso3()"
            [aptidoesAgrupadas]="aptidoesAgrupadas()"
            [vantagensCompradas]="vantagensCompradasList()"
            [pontosAtributoNaoUsados]="pontosAtributoDisponiveis()"
            [pontosAptidaoNaoUsados]="pontosAptidaoDisponiveis()"
            [pontosVantagemNaoUsados]="pontosVantagemDisponiveis()"
            [criando]="criando()"
            (editarPasso)="irParaPasso($event)"
            (confirmar)="confirmarCriacao()"
          ></app-step-revisao>
        }

        <!-- Rodape de navegacao -->
        <app-wizard-rodape
          [estadoSalvamento]="estadoSalvamento()"
          [passoAtual]="passoAtual()"
          [totalPassos]="6"
          [podeAvancar]="passoAtualValido()"
          [podeCriar]="passoAtual() === 6"
          [criando]="criando()"
          (avancar)="avancarPasso()"
          (voltar)="voltarPasso()"
          (criar)="confirmarCriacao()"
        ></app-wizard-rodape>

      }

    </div>

  `,
})
export class FichaWizardComponent implements OnInit {
  private fichasApi = inject(FichasApiService);
  private configApi = inject(ConfigApiService);
  private currentGameService = inject(CurrentGameService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  constructor() {
    // Carrega os dados do passo 3 quando o jogador entra nele pela primeira vez
    effect(() => {
      if (
        this.passoAtual() === 3 &&
        this.fichaId() !== null &&
        this.formPasso3().length === 0 &&
        !this.carregandoAtributos()
      ) {
        this.carregarDadosPasso3();
      }
    });

    // Carrega os dados do passo 4 quando o jogador entra nele pela primeira vez
    effect(() => {
      if (
        this.passoAtual() === 4 &&
        this.fichaId() !== null &&
        this.formPasso4().length === 0 &&
        !this.carregandoAptidoes()
      ) {
        this.carregarDadosPasso4();
      }
    });

    // Carrega saldo de pontos de vantagem ao entrar no passo 5
    effect(() => {
      if (this.passoAtual() === 5 && this.fichaId() !== null) {
        this.fichasApi.getFichaResumo(this.fichaId()!)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(r => this.pontosVantagemDisponiveis.set(r.pontosVantagemDisponiveis ?? 0));
      }
    });

    // Carrega vantagens compradas ao entrar no passo 6 (revisao)
    effect(() => {
      if (this.passoAtual() === 6 && this.fichaId() !== null) {
        this.fichasApi.listVantagens(this.fichaId()!)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (vantagens) => this.vantagensCompradasList.set(vantagens),
            error: () => this.vantagensCompradasList.set([]),
          });
      }
    });

  }

  // ============================================================
  // Estado do wizard
  // ============================================================

  readonly passoAtual = signal<number>(1);
  readonly fichaId = signal<number | null>(null);
  readonly estadoSalvamento = signal<EstadoSalvamento>('idle');
  readonly carregandoConfigs = signal<boolean>(false);
  readonly carregandoRascunho = signal<boolean>(false);

  // ============================================================
  // Configs carregadas
  // ============================================================

  readonly generos = signal<GeneroConfig[]>([]);
  readonly racas = signal<Raca[]>([]);
  readonly classes = signal<ClassePersonagem[]>([]);
  readonly indoles = signal<IndoleConfig[]>([]);
  readonly presencas = signal<PresencaConfig[]>([]);

  // ============================================================
  // Classes filtradas pela raca selecionada
  // ============================================================

  private readonly racaIdSelecionada = signal<number | null>(null);

  readonly classesFiltradas = computed<ClassePersonagem[]>(() => {
    const racaId = this.racaIdSelecionada();
    const todasClasses = this.classes();

    if (!racaId) {
      return todasClasses;
    }

    const racaSelecionada = this.racas().find((r) => r.id === racaId);
    if (!racaSelecionada) {
      return todasClasses;
    }

    // Se a raca tem classesPermitidas definidas, filtra
    if (
      racaSelecionada.classesPermitidas &&
      racaSelecionada.classesPermitidas.length > 0
    ) {
      const idsPermitidos = new Set(
        racaSelecionada.classesPermitidas.map((cp) => cp.classeId)
      );
      return todasClasses.filter((c) => idsPermitidos.has(c.id));
    }

    // Sem restricoes: todas as classes disponiveis
    return todasClasses;
  });

  // ============================================================
  // Dados do formulario Passo 1
  // ============================================================

  readonly formPasso1 = signal<FormPasso1>({
    nome: '',
    generoId: null,
    racaId: null,
    classeId: null,
    indoleId: null,
    presencaId: null,
    isNpc: false,
    descricao: null,
  });

  // ============================================================
  // Dados do formulario Passo 2
  // ============================================================

  readonly formPasso2 = signal<FormPasso2>({ descricao: null });

  // ============================================================
  // Dados do formulario Passo 3 — Atributos
  // ============================================================

  readonly formPasso3 = signal<FichaAtributoEditavel[]>([]);
  readonly pontosAtributoDisponiveis = signal<number>(0);
  readonly limitadorAtributo = signal<number>(20);
  readonly carregandoAtributos = signal<boolean>(false);

  // ============================================================
  // Dados do formulario Passo 4 — Aptidoes
  // ============================================================

  readonly formPasso4 = signal<FichaAptidaoEditavel[]>([]);
  readonly pontosAptidaoDisponiveis = signal<number>(0);
  readonly carregandoAptidoes = signal<boolean>(false);

  // ============================================================
  // Dados do formulario Passo 5 — Vantagens
  // ============================================================

  readonly pontosVantagemDisponiveis = signal<number>(0);

  // ============================================================
  // Dados do Passo 6 — Revisao
  // ============================================================

  /** Vantagens compradas carregadas para exibicao na revisao */
  readonly vantagensCompradasList = signal<FichaVantagemResponse[]>([]);

  /** Flag para o estado de criacao final (chamada ao completar()) */
  readonly criando = signal<boolean>(false);

  /**
   * FormPasso1 com os nomes resolvidos para exibicao na revisao (Passo 6).
   * Recomputa sempre que formPasso1, generos, racas, classes, indoles ou presencas mudam.
   */
  readonly formPasso1Revisao = computed<FormPasso1Revisao>(() => {
    const f = this.formPasso1();
    return {
      nome: f.nome,
      generoNome: this.generos().find((g) => g.id === f.generoId)?.nome ?? null,
      racaNome: this.racas().find((r) => r.id === f.racaId)?.nome ?? null,
      classeNome: this.classes().find((c) => c.id === f.classeId)?.nome ?? null,
      indoleNome: this.indoles().find((i) => i.id === f.indoleId)?.nome ?? null,
      presencaNome: this.presencas().find((p) => p.id === f.presencaId)?.nome ?? null,
      isNpc: f.isNpc,
    };
  });

  /**
   * Aptidoes agrupadas por tipo para o StepAptidoesComponent.
   * Recomputa sempre que formPasso4 muda.
   */
  readonly aptidoesAgrupadas = computed<TipoAptidaoComAptidoes[]>(() => {
    const grupos = new Map<string, FichaAptidaoEditavel[]>();
    for (const a of this.formPasso4()) {
      if (!grupos.has(a.tipoAptidaoNome)) {
        grupos.set(a.tipoAptidaoNome, []);
      }
      grupos.get(a.tipoAptidaoNome)!.push(a);
    }
    return Array.from(grupos.entries()).map(([tipoNome, aptidoes]) => ({ tipoNome, aptidoes }));
  });

  // ============================================================
  // Computed: validacao do passo atual
  // ============================================================

  readonly passoAtualValido = computed<boolean>(() => {
    if (this.passoAtual() !== 1) {
      // Passos 2-6 sao validados nos proprios steps (T7-T11)
      return true;
    }
    const f = this.formPasso1();
    return !!(
      f.nome?.trim().length >= 2 &&
      f.generoId !== null &&
      f.racaId !== null &&
      f.classeId !== null &&
      f.indoleId !== null &&
      f.presencaId !== null
    );
  });

  // ============================================================
  // Contexto: jogo e usuario
  // ============================================================

  readonly currentGame = this.currentGameService.currentGame;
  readonly jogoId = computed<number>(() => this.currentGameService.currentGameId() ?? 0);
  readonly isMestre = computed<boolean>(() => this.authService.isMestre());
  readonly isNpcRota = signal<boolean>(false);

  // ============================================================
  // Steps para p-steps
  // ============================================================

  readonly passos: MenuItem[] = [
    { label: 'Identificacao' },
    { label: 'Descricao' },
    { label: 'Atributos' },
    { label: 'Aptidoes' },
    { label: 'Vantagens' },
    { label: 'Revisao' },
  ];

  // ============================================================
  // ngOnInit
  // ============================================================

  ngOnInit(): void {
    // Detectar se a rota e de NPC (data: { npc: true })
    const routeData = this.route.snapshot.data;
    if (routeData['npc'] === true) {
      this.isNpcRota.set(true);
      this.formPasso1.update((f) => ({ ...f, isNpc: true }));
    }

    // Verificar se ha jogo selecionado
    if (!this.currentGameService.hasCurrentGame()) {
      this.toastService.warning('Selecione um jogo antes de criar uma ficha', 'Atenção');
      const destino = this.isMestre()
        ? '/mestre/jogos'
        : '/jogador/fichas';
      this.router.navigate([destino]);
      return;
    }

    // Verificar retomada de rascunho
    const fichaIdParam = this.route.snapshot.queryParamMap.get('fichaId');
    if (fichaIdParam) {
      const id = +fichaIdParam;
      this.fichaId.set(id);
      this.carregarRascunho(id);
    }

    this.carregarConfigs();
  }

  // ============================================================
  // Carregar configuracoes
  // ============================================================

  carregarConfigs(): void {
    const jogoId = this.jogoId();
    if (!jogoId) return;

    this.carregandoConfigs.set(true);

    let pendentes = 5;
    const decrementar = () => {
      pendentes--;
      if (pendentes === 0) {
        this.carregandoConfigs.set(false);
      }
    };

    this.configApi.listGeneros(jogoId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (g) => { this.generos.set(g); decrementar(); }, error: decrementar });

    this.configApi.listRacas(jogoId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (r) => { this.racas.set(r); decrementar(); }, error: decrementar });

    this.configApi.listClasses(jogoId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (c) => { this.classes.set(c); decrementar(); }, error: decrementar });

    this.configApi.listIndoles(jogoId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (i) => { this.indoles.set(i); decrementar(); }, error: decrementar });

    this.configApi.listPresencas(jogoId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (p) => { this.presencas.set(p); decrementar(); }, error: decrementar });
  }

  // ============================================================
  // Retomada de rascunho
  // ============================================================

  carregarRascunho(fichaId: number): void {
    this.carregandoRascunho.set(true);
    this.fichasApi.getFicha(fichaId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (ficha: Ficha) => {
          this.formPasso1.set({
            nome: ficha.nome,
            generoId: ficha.generoId,
            racaId: ficha.racaId,
            classeId: ficha.classeId,
            indoleId: ficha.indoleId,
            presencaId: ficha.presencaId,
            isNpc: ficha.isNpc,
            descricao: ficha.descricao ?? null,
          });
          this.formPasso2.set({ descricao: ficha.descricao ?? null });
          this.racaIdSelecionada.set(ficha.racaId);
          const passoInicial = this.determinarPassoInicial(ficha);
          this.passoAtual.set(passoInicial);
          this.carregandoRascunho.set(false);
        },
        error: () => {
          this.toastService.error('Não foi possível carregar o rascunho da ficha');
          this.carregandoRascunho.set(false);
        },
      });
  }

  private determinarPassoInicial(ficha: Ficha): number {
    if (
      !ficha.nome ||
      !ficha.generoId ||
      !ficha.racaId ||
      !ficha.classeId ||
      !ficha.indoleId ||
      !ficha.presencaId
    ) {
      return 1;
    }
    // Passo 1 completo e passo 2 (opcional) ja pode ser considerado visitado —
    // iniciar no passo 3 para nao repetir a descricao quando o rascunho ja foi salvo
    return 3;
  }

  // ============================================================
  // Acoes do wizard
  // ============================================================

  avancarPasso(): void {
    if (!this.passoAtualValido()) return;

    if (this.passoAtual() === 1) {
      this.salvarPasso1();
    } else if (this.passoAtual() === 2) {
      this.salvarPasso2();
    } else if (this.passoAtual() === 3) {
      this.salvarPasso3();
    } else if (this.passoAtual() === 4) {
      this.salvarPasso4();
    } else if (this.passoAtual() === 5) {
      // Passo 5 (Vantagens) e opcional — compras ja foram persistidas individualmente
      this.passoAtual.set(6);
    } else {
      this.passoAtual.update((p) => p + 1);
    }
  }

  voltarPasso(): void {
    if (this.passoAtual() > 1) {
      this.passoAtual.update((p) => p - 1);
    }
  }

  cancelar(): void {
    const destino = this.isMestre()
      ? '/mestre/npcs'
      : '/jogador/fichas';
    this.router.navigate([destino]);
  }

  /**
   * Navega diretamente para um passo especifico.
   * Usado pelo StepRevisaoComponent para permitir edicao de passos anteriores.
   */
  irParaPasso(passo: number): void {
    this.passoAtual.set(passo);
  }

  /**
   * Finaliza a criacao da ficha chamando PUT /fichas/{id}/completar.
   * Navega para a pagina de detalhes da ficha em caso de sucesso.
   */
  confirmarCriacao(): void {
    if (this.criando()) return;

    const fichaId = this.fichaId();
    if (!fichaId) return;

    this.criando.set(true);
    this.estadoSalvamento.set('salvando');

    this.fichasApi.completar(fichaId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (ficha: Ficha) => {
          this.criando.set(false);
          this.estadoSalvamento.set('salvo');
          this.router.navigate(['/fichas', ficha.id]);
        },
        error: (err: { error?: { message?: string } }) => {
          this.criando.set(false);
          this.estadoSalvamento.set('erro');
          this.toastService.error(err.error?.message ?? 'Verifique os dados e tente novamente.', 'Erro ao criar personagem');
        },
      });
  }

  private salvarPasso1(): void {
    this.estadoSalvamento.set('salvando');

    const salvar$: Observable<Ficha> = this.fichaId() === null
      ? this.criarFicha()
      : this.atualizarFicha();

    salvar$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (ficha: Ficha) => {
        this.fichaId.set(ficha.id);
        this.estadoSalvamento.set('salvo');
        this.passoAtual.set(2);
        setTimeout(() => this.estadoSalvamento.set('idle'), 3000);
      },
      error: () => {
        this.estadoSalvamento.set('erro');
        this.toastService.error('Não foi possível salvar os dados. Tente novamente.', 'Erro ao salvar');
      },
    });
  }

  private salvarPasso2(): void {
    const fichaId = this.fichaId();
    if (!fichaId) {
      // Sem fichaId nao deveria acontecer apos passo 1
      this.passoAtual.set(3);
      return;
    }

    this.estadoSalvamento.set('salvando');

    const dto: UpdateFichaDto = {
      descricao: this.formPasso2().descricao || null,
    };

    this.fichasApi.updateFicha(fichaId, dto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.estadoSalvamento.set('salvo');
          this.passoAtual.set(3);
          setTimeout(() => this.estadoSalvamento.set('idle'), 3000);
        },
        error: () => {
          this.estadoSalvamento.set('erro');
          this.toastService.error('Não foi possível salvar a descrição. Tente novamente.', 'Erro ao salvar');
        },
      });
  }

  private carregarDadosPasso3(): void {
    const fichaId = this.fichaId();
    if (!fichaId) return;

    this.carregandoAtributos.set(true);

    forkJoin({
      atributos: this.fichasApi.getAtributos(fichaId),
      resumo: this.fichasApi.getFichaResumo(fichaId),
      niveis: this.configApi.listNiveis(this.jogoId()),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ atributos, resumo, niveis }) => {
          const nivel1 = niveis.find((n: NivelConfig) => n.nivel === 1) ?? niveis[0];
          this.limitadorAtributo.set(nivel1?.limitadorAtributo ?? 20);
          this.pontosAtributoDisponiveis.set(resumo.pontosAtributoDisponiveis ?? 0);
          this.formPasso3.set(
            atributos.map((a) => ({
              atributoConfigId: a.atributoConfigId,
              atributoNome: a.atributoNome,
              atributoAbreviacao: a.atributoAbreviacao,
              base: a.base,
              outros: a.outros,
            }))
          );
          this.carregandoAtributos.set(false);
        },
        error: () => {
          this.carregandoAtributos.set(false);
          this.toastService.error('Não foi possível carregar os atributos.');
        },
      });
  }

  private salvarPasso3(): void {
    const fichaId = this.fichaId();
    if (!fichaId) {
      this.passoAtual.set(4);
      return;
    }

    this.estadoSalvamento.set('salvando');

    const dtos: AtualizarAtributoDto[] = this.formPasso3().map((a) => ({
      atributoConfigId: a.atributoConfigId,
      base: a.base,
    }));

    this.fichasApi
      .atualizarAtributos(fichaId, dtos)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.estadoSalvamento.set('salvo');
          this.passoAtual.set(4);
          setTimeout(() => this.estadoSalvamento.set('idle'), 3000);
        },
        error: () => {
          this.estadoSalvamento.set('erro');
          this.toastService.error('Não foi possível salvar os atributos. Tente novamente.', 'Erro ao salvar');
        },
      });
  }

  private carregarDadosPasso4(): void {
    const fichaId = this.fichaId();
    if (!fichaId) return;

    this.carregandoAptidoes.set(true);

    forkJoin({
      aptidoes: this.fichasApi.getAptidoes(fichaId),
      resumo: this.fichasApi.getFichaResumo(fichaId),
      aptidoesConfig: this.configApi.listAptidoes(this.jogoId()),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ aptidoes, resumo, aptidoesConfig }) => {
          this.pontosAptidaoDisponiveis.set(resumo.pontosAptidaoDisponiveis ?? 0);
          const configMap = new Map(aptidoesConfig.map((c) => [c.id, c]));
          this.formPasso4.set(
            aptidoes.map((a) => ({
              aptidaoConfigId: a.aptidaoConfigId,
              aptidaoNome: a.aptidaoNome,
              tipoAptidaoNome: configMap.get(a.aptidaoConfigId)?.tipoAptidaoNome ?? 'Sem tipo',
              base: a.base,
              sorte: a.sorte,
              classe: a.classe,
            }))
          );
          this.carregandoAptidoes.set(false);
        },
        error: () => {
          this.carregandoAptidoes.set(false);
          this.toastService.error('Não foi possível carregar as aptidões.');
        },
      });
  }

  private salvarPasso4(): void {
    const fichaId = this.fichaId();
    if (!fichaId) {
      this.passoAtual.set(5);
      return;
    }

    this.estadoSalvamento.set('salvando');

    const dtos: AtualizarAptidaoDto[] = this.formPasso4().map((a) => ({
      aptidaoConfigId: a.aptidaoConfigId,
      base: a.base,
    }));

    this.fichasApi
      .atualizarAptidoes(fichaId, dtos)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.estadoSalvamento.set('salvo');
          this.passoAtual.set(5);
          setTimeout(() => this.estadoSalvamento.set('idle'), 3000);
        },
        error: () => {
          this.estadoSalvamento.set('erro');
          this.toastService.error('Não foi possível salvar as aptidões.', 'Erro ao salvar');
        },
      });
  }

  private criarFicha(): Observable<Ficha> {
    const f = this.formPasso1();
    const dto: CreateFichaDto = {
      jogoId: this.jogoId(),
      nome: f.nome.trim(),
      generoId: f.generoId,
      racaId: f.racaId,
      classeId: f.classeId,
      indoleId: f.indoleId,
      presencaId: f.presencaId,
      isNpc: f.isNpc,
    };
    return this.fichasApi.createFicha(this.jogoId(), dto);
  }

  private atualizarFicha(): Observable<Ficha> {
    const f = this.formPasso1();
    const dto: UpdateFichaDto = {
      nome: f.nome.trim(),
      generoId: f.generoId,
      racaId: f.racaId,
      classeId: f.classeId,
      indoleId: f.indoleId,
      presencaId: f.presencaId,
    };
    return this.fichasApi.updateFicha(this.fichaId()!, dto);
  }

  // ============================================================
  // Handlers de output dos steps
  // ============================================================

  onFormPasso1Changed(form: FormPasso1): void {
    this.formPasso1.set(form);
  }

  onFormPasso2Changed(descricao: string | null): void {
    this.formPasso2.set({ descricao });
  }

  onFormPasso3Changed(atributos: FichaAtributoEditavel[]): void {
    this.formPasso3.set(atributos);
  }

  onFormPasso4Changed(aptidoes: FichaAptidaoEditavel[]): void {
    this.formPasso4.set(aptidoes);
  }

  onPontosVantagemAtualizados(pontos: number): void {
    this.pontosVantagemDisponiveis.set(pontos);
  }

  onRacaSelecionada(racaId: number | null): void {
    this.racaIdSelecionada.set(racaId);

    // Se a classe atual nao e compativel com a nova raca, resetar
    const classeAtualId = this.formPasso1().classeId;
    if (classeAtualId !== null) {
      const aindaPermitida = this.classesFiltradas().some(
        (c) => c.id === classeAtualId
      );
      if (!aindaPermitida) {
        this.formPasso1.update((f) => ({ ...f, classeId: null }));
      }
    }
  }
}
