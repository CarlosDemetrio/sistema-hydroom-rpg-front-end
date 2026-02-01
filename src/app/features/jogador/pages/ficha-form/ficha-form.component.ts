import { Component, inject, signal, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { FichaBusinessService } from '../../../../core/services/business/ficha-business.service';
import { CurrentGameService } from '../../../../core/services';
import { AuthService } from '../../../../services/auth.service';
import { LoadingSpinnerComponent } from '../../../../shared';
import { IdentificacaoSectionComponent } from './sections';
import { ProgressaoSectionComponent } from './sections';
import { DescricaoFisicaSectionComponent } from './sections';
import { AtributosSectionComponent } from './sections';
import { VidaSectionComponent } from './sections';
import { ObservacoesSectionComponent } from './sections';

/**
 * Ficha Form Component (SMART)
 *
 * Formulário de Criação/Edição de Fichas
 *
 * Responsabilidades:
 * - Orquestra formulário reativo
 * - Gerencia navegação entre seções
 * - Salva/atualiza ficha via FichaBusinessService
 * - Integra com CurrentGameService (jogo atual)
 *
 * Componentes modulares (DUMB):
 * - IdentificacaoSectionComponent
 * - ProgressaoSectionComponent
 * - (mais seções podem ser adicionadas)
 */
@Component({
  selector: 'app-ficha-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    ToastModule,
    LoadingSpinnerComponent,
    IdentificacaoSectionComponent,
    ProgressaoSectionComponent,
    DescricaoFisicaSectionComponent,
    AtributosSectionComponent,
    VidaSectionComponent,
    ObservacoesSectionComponent
  ],
  providers: [MessageService],
  templateUrl: './ficha-form.component.html'
})
export class FichaFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private fichaService = inject(FichaBusinessService);
  private currentGameService = inject(CurrentGameService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);
  private destroyRef = inject(DestroyRef);

  // State
  isEditMode = signal(false);
  fichaId = signal<number | null>(null);
  isSaving = signal(false);
  loading = signal(false);

  // Current game
  currentGame = this.currentGameService.currentGame;
  hasGame = this.currentGameService.hasCurrentGame;

  // Main Form
  fichaForm!: FormGroup;

  // Form Groups por seção
  identificacaoForm!: FormGroup;
  progressaoForm!: FormGroup;
  descricaoFisicaForm!: FormGroup;
  atributosForm!: FormGroup;
  vidaForm!: FormGroup;
  observacoesForm!: FormGroup;

  ngOnInit() {
    // Verifica se tem jogo selecionado
    if (!this.hasGame()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Selecione um jogo no menu superior antes de criar uma ficha'
      });
      this.router.navigate(['/jogador/dashboard']);
      return;
    }

    this.buildForm();

    // Check if edit mode
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.fichaId.set(Number(id));
      this.loadFicha(Number(id));
    }
  }

  private buildForm() {
    // Seção 1: Identificação
    this.identificacaoForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      origem: ['', [Validators.maxLength(100)]],
      indole: ['', [Validators.maxLength(100)]],
      linhagem: ['', [Validators.maxLength(100)]]
    });

    // Seção 2: Progressão
    this.progressaoForm = this.fb.group({
      nivel: [{ value: 1, disabled: true }, [Validators.required]], // Read-only, calculado pelo backend
      experiencia: [{ value: 0, disabled: true }], // Read-only, apenas Mestre pode dar
      renascimento: [0, [Validators.min(0)]],
      insolitus: [0, [Validators.min(0)]],
      nvs: [0, [Validators.min(0)]]
    });

    // Seção 3: Descrição Física
    this.descricaoFisicaForm = this.fb.group({
      altura: [null],
      peso: [null],
      idade: [null],
      olhos: [''],
      cabelo: [''],
      pele: [''],
      aparencia: ['']
    });

    // Seção 4: Atributos (FormArray com 6 atributos fixos)
    const atributosArray = this.fb.array([
      this.fb.group({ nome: ['FOR'], valorBase: [10, [Validators.required, Validators.min(1), Validators.max(30)]] }),
      this.fb.group({ nome: ['DES'], valorBase: [10, [Validators.required, Validators.min(1), Validators.max(30)]] }),
      this.fb.group({ nome: ['CON'], valorBase: [10, [Validators.required, Validators.min(1), Validators.max(30)]] }),
      this.fb.group({ nome: ['INT'], valorBase: [10, [Validators.required, Validators.min(1), Validators.max(30)]] }),
      this.fb.group({ nome: ['SAB'], valorBase: [10, [Validators.required, Validators.min(1), Validators.max(30)]] }),
      this.fb.group({ nome: ['CAR'], valorBase: [10, [Validators.required, Validators.min(1), Validators.max(30)]] })
    ]);

    this.atributosForm = this.fb.group({
      atributos: atributosArray
    });

    // Seção 5: Vida
    this.vidaForm = this.fb.group({
      vidaVigor: [0, [Validators.required, Validators.min(0)]],
      vidaOutros: [0, [Validators.min(0)]],
      vidaNivel: [0, [Validators.required, Validators.min(0)]],
      sanguePercentual: [100, [Validators.required, Validators.min(0), Validators.max(100)]]
    });

    // Seção 6: Observações
    this.observacoesForm = this.fb.group({
      observacoes: ['', [Validators.maxLength(5000)]]
    });

    // Form principal (agrega todas as seções)
    this.fichaForm = this.fb.group({
      identificacao: this.identificacaoForm,
      progressao: this.progressaoForm,
      descricaoFisica: this.descricaoFisicaForm,
      atributos: this.atributosForm,
      vida: this.vidaForm,
      observacoes: this.observacoesForm
    });
  }

  private loadFicha(id: number) {
    this.loading.set(true);
    this.fichaService.getFicha(id).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (ficha) => {
        // Preenche formulário
        if (ficha.identificacao) {
          this.identificacaoForm.patchValue({
            nome: ficha.nome,
            origem: ficha.identificacao.origem || '',
            indole: ficha.identificacao.indole || '',
            linhagem: ficha.identificacao.linhagem || ''
          });
        }

        if (ficha.progressao) {
          this.progressaoForm.patchValue({
            nivel: ficha.progressao.nivel,
            experiencia: ficha.progressao.experiencia || 0,
            renascimento: ficha.progressao.renascimento || 0,
            insolitus: ficha.progressao.insolitus || 0,
            nvs: ficha.progressao.nvs || 0
          });
        }

        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar ficha'
        });
        this.loading.set(false);
        this.router.navigate(['/jogador/fichas']);
      }
    });
  }

  onSubmit() {
    if (this.fichaForm.invalid) {
      Object.keys(this.fichaForm.controls).forEach(key => {
        const control = this.fichaForm.get(key);
        if (control instanceof FormGroup) {
          Object.keys(control.controls).forEach(subKey => {
            control.get(subKey)?.markAsTouched();
          });
        } else {
          control?.markAsTouched();
        }
      });

      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Preencha todos os campos obrigatórios'
      });
      return;
    }

    this.isSaving.set(true);

    const formValue = this.fichaForm.value;
    const gameId = this.currentGameService.currentGameId();
    const userId = this.authService.currentUser()?.id;

    const fichaData = {
      nome: formValue.identificacao.nome,
      jogoId: gameId!,
      jogadorId: Number(userId),
      identificacao: {
        origem: formValue.identificacao.origem,
        indole: formValue.identificacao.indole,
        linhagem: formValue.identificacao.linhagem
      },
      progressao: {
        nivel: 1, // Sempre começa em 1, backend calculará baseado em XP
        experiencia: 0, // Apenas Mestre pode dar
        renascimento: formValue.progressao.renascimento,
        insolitus: formValue.progressao.insolitus,
        nvs: formValue.progressao.nvs
      },
      descricaoFisica: {
        altura: formValue.descricaoFisica.altura,
        peso: formValue.descricaoFisica.peso,
        idade: formValue.descricaoFisica.idade,
        olhos: formValue.descricaoFisica.olhos,
        cabelo: formValue.descricaoFisica.cabelo,
        pele: formValue.descricaoFisica.pele,
        aparencia: formValue.descricaoFisica.aparencia
      },
      atributos: formValue.atributos.atributos.map((attr: any) => ({
        nome: attr.nome,
        valorBase: attr.valorBase
        // valorNivel, valorOutros, modificador serão calculados pelo backend
      })),
      vida: {
        vidaVigor: formValue.vida.vidaVigor,
        vidaOutros: formValue.vida.vidaOutros,
        vidaNivel: formValue.vida.vidaNivel,
        vidaTotal: 0, // Backend recalculará
        sanguePercentual: formValue.vida.sanguePercentual,
        membros: [] // TODO: Implementar membros depois
      },
      observacoes: formValue.observacoes.observacoes
    };

    const operation$ = this.isEditMode()
      ? this.fichaService.updateFicha(this.fichaId()!, fichaData)
      : this.fichaService.createFicha(fichaData);

    operation$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: this.isEditMode() ? 'Ficha atualizada com sucesso!' : 'Ficha criada com sucesso!'
        });
        setTimeout(() => this.router.navigate(['/jogador/fichas']), 1500);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: this.isEditMode() ? 'Erro ao atualizar ficha' : 'Erro ao criar ficha'
        });
        this.isSaving.set(false);
      }
    });
  }

  onCancel() {
    this.router.navigate(['/jogador/fichas']);
  }
}

