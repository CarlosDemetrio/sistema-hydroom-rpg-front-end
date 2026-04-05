import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { StepsModule } from 'primeng/steps';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MenuItem, MessageService } from 'primeng/api';
import { FichasApiService } from '@core/services/api/fichas-api.service';
import { ConfigApiService } from '@core/services/api/config-api.service';
import { CurrentGameService } from '@core/services/current-game.service';
import { AuthService } from '@services/auth.service';
import {
  ClassePersonagem,
  GeneroConfig,
  IndoleConfig,
  PresencaConfig,
  Raca,
} from '@core/models/config.models';
import { Ficha } from '@core/models/ficha.model';
import { CreateFichaDto, UpdateFichaDto } from '@core/models/dtos/ficha.dto';
import { StepIdentificacaoComponent } from './steps/step-identificacao/step-identificacao.component';
import { StepDescricaoComponent } from './steps/step-descricao/step-descricao.component';
import { EstadoSalvamento, FormPasso1, FormPasso2 } from './ficha-wizard.types';
import { Observable } from 'rxjs';

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
    ToastModule,
    ProgressSpinnerModule,
    StepIdentificacaoComponent,
    StepDescricaoComponent,
  ],
  providers: [MessageService],
  template: `
    <div class="p-4">

      <!-- Header -->
      <div class="mb-4">
        <h1 class="text-3xl font-bold m-0 mb-2">
          @if (isNpcRota()) {
            Criar NPC
          } @else {
            Criar Personagem
          }
        </h1>
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
          <div class="surface-100 border-round p-5 text-center">
            <i class="pi pi-star text-primary text-4xl mb-3 block"></i>
            <p class="text-xl font-semibold m-0">Passo 3 — Vantagens</p>
            <p class="text-color-secondary mt-2">Em breve (T8)</p>
          </div>
        }

        @if (passoAtual() === 4) {
          <div class="surface-100 border-round p-5 text-center">
            <i class="pi pi-chart-bar text-primary text-4xl mb-3 block"></i>
            <p class="text-xl font-semibold m-0">Passo 4 — Aptidoes</p>
            <p class="text-color-secondary mt-2">Em breve (T9)</p>
          </div>
        }

        @if (passoAtual() === 5) {
          <div class="surface-100 border-round p-5 text-center">
            <i class="pi pi-eye text-primary text-4xl mb-3 block"></i>
            <p class="text-xl font-semibold m-0">Passo 5 — Revisao</p>
            <p class="text-color-secondary mt-2">Em breve (T10)</p>
          </div>
        }

        @if (passoAtual() === 6) {
          <div class="surface-100 border-round p-5 text-center">
            <i class="pi pi-check-circle text-primary text-4xl mb-3 block"></i>
            <p class="text-xl font-semibold m-0">Passo 6 — Conclusao</p>
            <p class="text-color-secondary mt-2">Em breve (T11)</p>
          </div>
        }

        <!-- Rodape de navegacao -->
        <div class="flex justify-content-between align-items-center mt-5 pt-4 border-top-1 border-200">

          <!-- Botao Voltar / Cancelar -->
          <div>
            @if (passoAtual() > 1) {
              <p-button
                label="Voltar"
                icon="pi pi-arrow-left"
                [text]="true"
                severity="secondary"
                (onClick)="voltarPasso()"
                [disabled]="estadoSalvamento() === 'salvando'"
              ></p-button>
            } @else {
              <p-button
                label="Cancelar"
                icon="pi pi-times"
                [text]="true"
                severity="secondary"
                (onClick)="cancelar()"
              ></p-button>
            }
          </div>

          <!-- Indicador de estado de salvamento + Botao Proximo -->
          <div class="flex align-items-center gap-3">

            <!-- Estado: salvando -->
            @if (estadoSalvamento() === 'salvando') {
              <div class="flex align-items-center gap-2 text-color-secondary">
                <p-progress-spinner
                  strokeWidth="4"
                  animationDuration=".5s"
                  [style]="{ width: '20px', height: '20px' }"
                ></p-progress-spinner>
                <span class="text-sm">Salvando...</span>
              </div>
            }

            <!-- Estado: salvo -->
            @if (estadoSalvamento() === 'salvo') {
              <div class="flex align-items-center gap-2 text-green-500">
                <i class="pi pi-check-circle"></i>
                <span class="text-sm">Salvo</span>
              </div>
            }

            <!-- Estado: erro -->
            @if (estadoSalvamento() === 'erro') {
              <div class="flex align-items-center gap-2 text-red-500">
                <i class="pi pi-exclamation-triangle"></i>
                <span class="text-sm">Erro ao salvar</span>
              </div>
            }

            <!-- Botao Proximo -->
            @if (passoAtual() < 6) {
              <p-button
                label="Proximo"
                icon="pi pi-arrow-right"
                iconPos="right"
                (onClick)="avancarPasso()"
                [disabled]="!passoAtualValido() || estadoSalvamento() === 'salvando'"
                [loading]="estadoSalvamento() === 'salvando'"
              ></p-button>
            }

          </div>
        </div>

      }

    </div>

    <p-toast></p-toast>
  `,
})
export class FichaWizardComponent implements OnInit {
  private fichasApi = inject(FichasApiService);
  private configApi = inject(ConfigApiService);
  private currentGameService = inject(CurrentGameService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);
  private destroyRef = inject(DestroyRef);

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
    { label: 'Revisao' },
    { label: 'Conclusao' },
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
      this.messageService.add({
        severity: 'warn',
        summary: 'Atencao',
        detail: 'Selecione um jogo antes de criar uma ficha',
      });
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
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Nao foi possivel carregar o rascunho da ficha',
          });
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
        this.messageService.add({
          severity: 'error',
          summary: 'Erro ao salvar',
          detail: 'Nao foi possivel salvar os dados. Tente novamente.',
        });
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
          this.messageService.add({
            severity: 'error',
            summary: 'Erro ao salvar',
            detail: 'Nao foi possivel salvar a descricao. Tente novamente.',
          });
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
