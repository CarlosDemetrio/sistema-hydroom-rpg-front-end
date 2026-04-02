import { Component, inject, signal, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { FichaBusinessService } from '@core/services/business/ficha-business.service';
import { CurrentGameService } from '@core/services';
import { AuthService } from '@services/auth.service';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner.component';
import {
  IdentificacaoSectionComponent,
  ProgressaoSectionComponent,
  DescricaoFisicaSectionComponent,
  AtributosSectionComponent,
  VidaSectionComponent,
  ObservacoesSectionComponent,
  PericiasSectionComponent,
  EquipamentosSectionComponent,
  VantagensSectionComponent,
  TitulosRunasSectionComponent
} from './sections';

/**
 * Ficha Form Component (SMART)
 *
 * Formulário de Criação/Edição de Fichas - TODAS as 10 seções ✅
 *
 * Responsabilidades:
 * - Orquestra formulário reativo com 10 seções
 * - Gerencia navegação entre seções
 * - Salva/atualiza ficha via FichaBusinessService
 * - Integra com CurrentGameService (jogo atual)
 *
 * Seções implementadas (10/10):
 * 1. Identificacao - Nome, origem, índole, linhagem
 * 2. Progressao - Nível, XP, renascimento, insolitus, nvs
 * 3. Descricao Fisica - Altura, peso, aparência
 * 4. Atributos - FOR, DES, CON, INT, SAB, CAR
 * 5. Vida - Vida, sangue
 * 6. Observacoes - Anotações livres
 * 7. Pericias - Lista de perícias
 * 8. Equipamentos - Armas, armaduras, itens
 * 9. Vantagens - Vantagens/desvantagens
 * 10. Titulos/Runas - Títulos e runas especiais
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
    ObservacoesSectionComponent,
    PericiasSectionComponent,
    EquipamentosSectionComponent,
    VantagensSectionComponent,
    TitulosRunasSectionComponent
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

  // Form Groups por seção (10 seções)
  identificacaoForm!: FormGroup;
  progressaoForm!: FormGroup;
  descricaoFisicaForm!: FormGroup;
  atributosForm!: FormGroup;
  vidaForm!: FormGroup;
  observacoesForm!: FormGroup;
  periciasForm!: FormGroup;
  equipamentosForm!: FormGroup;
  vantagensForm!: FormGroup;
  titulosRunasForm!: FormGroup;

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

    // Seção 7: Perícias (FormArray dinâmico)
    this.periciasForm = this.fb.group({
      pericias: this.fb.array([])
    });

    // Seção 8: Equipamentos (FormArray dinâmico)
    this.equipamentosForm = this.fb.group({
      equipamentos: this.fb.array([])
    });

    // Seção 9: Vantagens (FormArray dinâmico)
    this.vantagensForm = this.fb.group({
      vantagens: this.fb.array([])
    });

    // Seção 10: Títulos e Runas (FormArray dinâmico)
    this.titulosRunasForm = this.fb.group({
      titulosRunas: this.fb.array([])
    });

    // Form principal (agrega TODAS as 10 seções)
    this.fichaForm = this.fb.group({
      identificacao: this.identificacaoForm,
      progressao: this.progressaoForm,
      descricaoFisica: this.descricaoFisicaForm,
      atributos: this.atributosForm,
      vida: this.vidaForm,
      observacoes: this.observacoesForm,
      pericias: this.periciasForm,
      equipamentos: this.equipamentosForm,
      vantagens: this.vantagensForm,
      titulosRunas: this.titulosRunasForm
    });
  }

  private loadFicha(id: number) {
    this.loading.set(true);
    this.fichaService.getFicha(id).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (ficha) => {
        // Preenche formulário com campos flat do modelo Ficha
        this.identificacaoForm.patchValue({
          nome: ficha.nome,
          origem: '',
          indole: ficha.indoleNome || '',
          linhagem: ''
        });

        this.progressaoForm.patchValue({
          nivel: ficha.nivel,
          experiencia: ficha.xp || 0,
          renascimento: ficha.renascimentos || 0,
          insolitus: 0,
          nvs: 0
        });

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

    // CreateFichaDto — campos flat alinhados com o backend
    const fichaData = {
      jogoId: gameId!,
      nome: formValue.identificacao.nome,
      jogadorId: userId ? Number(userId) : null,
    };

    const operation$ = this.isEditMode()
      ? this.fichaService.updateFicha(this.fichaId()!, { nome: fichaData.nome })
      : this.fichaService.createFicha(gameId!, fichaData);

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

