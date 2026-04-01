import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SkeletonModule } from 'primeng/skeleton';
import { TextareaModule } from 'primeng/textarea';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { Anotacao, CriarAnotacaoDto, TipoAnotacao } from '@models/anotacao.model';
import { FichaBusinessService } from '@core/services/business/ficha-business.service';
import { ToastService } from '@services/toast.service';
import { AnotacaoCardComponent } from '@features/jogador/pages/ficha-detail/components/anotacao-card/anotacao-card.component';

@Component({
  selector: 'app-ficha-anotacoes-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    SelectButtonModule,
    SkeletonModule,
    TextareaModule,
    ToggleButtonModule,
    AnotacaoCardComponent,
  ],
  template: `
    <div class="p-3 flex flex-col gap-4">

      <!-- Botao nova anotacao -->
      <div class="flex justify-end">
        <p-button
          label="Nova Anotacao"
          icon="pi pi-plus"
          outlined
          size="small"
          (onClick)="toggleForm()"
          [attr.aria-label]="showForm() ? 'Fechar formulario' : 'Abrir formulario de nova anotacao'"
        />
      </div>

      <!-- Formulario nova anotacao -->
      @if (showForm()) {
        <p-card class="nova-anotacao-card">
          <div class="flex flex-col gap-3">
            <div class="flex flex-col gap-1">
              <label for="tituloAnotacao" class="font-medium text-sm">Titulo</label>
              <input
                pInputText
                id="tituloAnotacao"
                type="text"
                [ngModel]="novoTitulo()"
                (ngModelChange)="novoTitulo.set($event)"
                placeholder="Titulo da anotacao"
                class="w-full"
                aria-label="Titulo da anotacao"
              />
            </div>

            <div class="flex flex-col gap-1">
              <label for="conteudoAnotacao" class="font-medium text-sm">Conteudo</label>
              <textarea
                pTextarea
                id="conteudoAnotacao"
                [ngModel]="novoConteudo()"
                (ngModelChange)="novoConteudo.set($event)"
                placeholder="Conteudo da anotacao..."
                rows="4"
                class="w-full"
                aria-label="Conteudo da anotacao"
              ></textarea>
            </div>

            @if (userRole() === 'MESTRE') {
              <div class="flex flex-col gap-2">
                <div class="flex flex-col gap-1">
                  <label class="font-medium text-sm">Tipo</label>
                  <p-selectbutton
                    [options]="tipoOptions"
                    [ngModel]="novoTipo()"
                    (ngModelChange)="novoTipo.set($event)"
                    optionLabel="label"
                    optionValue="value"
                  />
                </div>

                <div class="flex items-center gap-2">
                  <p-togglebutton
                    [ngModel]="novaVisivelParaJogador()"
                    (ngModelChange)="novaVisivelParaJogador.set($event)"
                    onLabel="Visivel para jogador"
                    offLabel="Apenas Mestre"
                    onIcon="pi pi-eye"
                    offIcon="pi pi-eye-slash"
                  />
                </div>
              </div>
            }

            <div class="flex gap-2 justify-end">
              <p-button label="Cancelar" text size="small" (onClick)="cancelarForm()" />
              <p-button
                label="Salvar"
                icon="pi pi-check"
                size="small"
                [loading]="salvando()"
                [disabled]="!novoTitulo().trim() || !novoConteudo().trim()"
                (onClick)="salvarAnotacao()"
              />
            </div>
          </div>
        </p-card>
      }

      <!-- Lista de anotacoes -->
      @if (loading()) {
        @for (_ of [1, 2, 3]; track $index) {
          <p-skeleton height="5rem" borderRadius="8px" />
        }
      } @else if (anotacoes().length === 0) {
        <div class="flex flex-col items-center py-10 gap-3 text-center">
          <i class="pi pi-book" style="font-size: 3rem; color: var(--text-color-secondary)"></i>
          <p class="text-color-secondary m-0">Nenhuma anotacao registrada ainda.</p>
        </div>
      } @else {
        @for (anotacao of anotacoes(); track anotacao.id) {
          <app-anotacao-card
            [anotacao]="anotacao"
            [podeDeletar]="podeDeletarAnotacao(anotacao)"
            (deletar)="deletarAnotacao($event)"
          />
        }
      }
    </div>
  `,
})
export class FichaAnotacoesTabComponent implements OnInit {
  fichaId = input.required<number>();
  userRole = input.required<'MESTRE' | 'JOGADOR'>();
  userId = input.required<number>();

  private fichaBusinessService = inject(FichaBusinessService);
  private toastService = inject(ToastService);

  protected anotacoes = signal<Anotacao[]>([]);
  protected loading = signal(false);
  protected salvando = signal(false);
  protected showForm = signal(false);

  protected novoTitulo = signal('');
  protected novoConteudo = signal('');
  protected novoTipo = signal<TipoAnotacao>('JOGADOR');
  protected novaVisivelParaJogador = signal(false);

  protected readonly tipoOptions: Array<{ label: string; value: TipoAnotacao }> = [
    { label: 'Jogador', value: 'JOGADOR' },
    { label: 'Mestre', value: 'MESTRE' },
  ];

  constructor() {
    effect(() => {
      const id = this.fichaId();
      if (id) {
        this.carregarAnotacoes(id);
      }
    });
  }

  ngOnInit(): void {
    // Loaded via effect
  }

  private carregarAnotacoes(fichaId: number): void {
    this.loading.set(true);
    this.fichaBusinessService.loadAnotacoes(fichaId).subscribe({
      next: (anotacoes) => {
        this.anotacoes.set(anotacoes);
        this.loading.set(false);
      },
      error: () => {
        this.toastService.error('Nao foi possivel carregar as anotacoes.');
        this.loading.set(false);
      },
    });
  }

  protected toggleForm(): void {
    this.showForm.update(v => !v);
    if (!this.showForm()) {
      this.resetForm();
    }
  }

  protected cancelarForm(): void {
    this.showForm.set(false);
    this.resetForm();
  }

  private resetForm(): void {
    this.novoTitulo.set('');
    this.novoConteudo.set('');
    this.novoTipo.set('JOGADOR');
    this.novaVisivelParaJogador.set(false);
  }

  protected salvarAnotacao(): void {
    const dto: CriarAnotacaoDto = {
      titulo: this.novoTitulo().trim(),
      conteudo: this.novoConteudo().trim(),
      tipoAnotacao: this.novoTipo(),
      visivelParaJogador: this.novaVisivelParaJogador(),
    };

    this.salvando.set(true);
    this.fichaBusinessService.criarAnotacao(this.fichaId(), dto).subscribe({
      next: (nova) => {
        this.anotacoes.update(list => [nova, ...list]);
        this.toastService.success('Anotacao criada com sucesso!');
        this.salvando.set(false);
        this.cancelarForm();
      },
      error: () => {
        this.toastService.error('Erro ao criar anotacao. Tente novamente.');
        this.salvando.set(false);
      },
    });
  }

  protected deletarAnotacao(anotacaoId: number): void {
    this.fichaBusinessService.deletarAnotacao(this.fichaId(), anotacaoId).subscribe({
      next: () => {
        this.anotacoes.update(list => list.filter(a => a.id !== anotacaoId));
        this.toastService.success('Anotacao removida.');
      },
      error: () => {
        this.toastService.error('Erro ao deletar anotacao.');
      },
    });
  }

  protected podeDeletarAnotacao(anotacao: Anotacao): boolean {
    return this.userRole() === 'MESTRE' || anotacao.autorId === this.userId();
  }
}
