import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
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
import { TreeModule } from 'primeng/tree';
import { TreeNode } from 'primeng/api';
import { Anotacao, CriarAnotacaoDto, AtualizarAnotacaoDto, TipoAnotacao } from '@models/anotacao.model';
import { AnotacaoPasta } from '@models/anotacao-pasta.model';
import { FichaBusinessService } from '@core/services/business/ficha-business.service';
import { ToastService } from '@services/toast.service';
import { AnotacaoCardComponent } from '@features/jogador/pages/ficha-detail/components/anotacao-card/anotacao-card.component';

/**
 * FichaAnotacoesTabComponent — SMART (Container)
 *
 * Responsabilidades:
 * - Carrega anotações e pastas via FichaBusinessService
 * - Exibe árvore de pastas com p-tree para filtrar anotações
 * - Orquestra criação, edição e remoção de anotações
 * - Trata o output `editar` do AnotacaoCardComponent (dumb) fazendo a chamada HTTP
 */
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
    TreeModule,
    AnotacaoCardComponent,
  ],
  template: `
    <div class="p-3 flex flex-col gap-4">

      <!-- Layout: sidebar pastas + lista anotações -->
      <div class="flex gap-3">

        <!-- Sidebar: Árvore de Pastas -->
        @if (pastas().length > 0 || loadingPastas()) {
          <div class="w-56 flex-shrink-0">
            <p-card>
              <div class="flex flex-col gap-2">
                <span class="text-sm font-semibold text-color-secondary uppercase tracking-wide">
                  Pastas
                </span>

                @if (loadingPastas()) {
                  @for (_ of [1, 2, 3]; track $index) {
                    <p-skeleton height="1.5rem" borderRadius="4px" />
                  }
                } @else {
                  <!-- Opção "Todas" -->
                  <button
                    type="button"
                    class="flex items-center gap-2 px-2 py-1 rounded text-sm cursor-pointer border-none bg-transparent w-full text-left hover:surface-hover"
                    [class.font-semibold]="pastaSelecionada() === null"
                    [attr.aria-pressed]="pastaSelecionada() === null"
                    (click)="selecionarTodasPastas()"
                    aria-label="Ver todas as anotacoes"
                  >
                    <i class="pi pi-inbox text-xs"></i>
                    Todas
                  </button>

                  <p-tree
                    [value]="pastaTreeNodes()"
                    selectionMode="single"
                    [selection]="pastaSelecionadaNode()"
                    (onNodeSelect)="onPastaSelect($event)"
                    (onNodeUnselect)="selecionarTodasPastas()"
                    styleClass="text-sm border-none p-0"
                    [attr.aria-label]="'Arvore de pastas de anotacoes'"
                  />
                }
              </div>
            </p-card>
          </div>
        }

        <!-- Coluna principal: botão + formulário + lista -->
        <div class="flex-1 flex flex-col gap-4">

          <!-- Botão nova anotação -->
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

          <!-- Formulário nova anotação -->
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
                  <label for="conteudoAnotacao" class="font-medium text-sm">
                    Conteudo (Markdown)
                  </label>
                  <textarea
                    pTextarea
                    id="conteudoAnotacao"
                    [ngModel]="novoConteudo()"
                    (ngModelChange)="novoConteudo.set($event)"
                    placeholder="Conteudo da anotacao... Suporta **Markdown**"
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

          <!-- Cabeçalho da lista com indicação da pasta selecionada -->
          @if (pastaSelecionada() !== null) {
            <div class="flex items-center gap-2 text-sm text-color-secondary">
              <i class="pi pi-folder-open"></i>
              <span>{{ pastaSelecionada()!.nome }}</span>
              <p-button
                icon="pi pi-times"
                text
                size="small"
                (onClick)="selecionarTodasPastas()"
                aria-label="Limpar filtro de pasta"
              />
            </div>
          }

          <!-- Lista de anotações -->
          @if (loading()) {
            @for (_ of [1, 2, 3]; track $index) {
              <p-skeleton height="5rem" borderRadius="8px" />
            }
          } @else if (anotacoes().length === 0) {
            <div class="flex flex-col items-center py-10 gap-3 text-center">
              <i class="pi pi-book" style="font-size: 3rem; color: var(--text-color-secondary)"></i>
              <p class="text-color-secondary m-0">
                @if (pastaSelecionada() !== null) {
                  Nenhuma anotacao nesta pasta.
                } @else {
                  Nenhuma anotacao registrada ainda.
                }
              </p>
            </div>
          } @else {
            @for (anotacao of anotacoes(); track anotacao.id) {
              <app-anotacao-card
                [anotacao]="anotacao"
                [podeDeletar]="podeDeletarAnotacao(anotacao)"
                [userRole]="userRole()"
                [userId]="userId()"
                (editar)="onEditarAnotacao($event)"
                (deletar)="deletarAnotacao($event)"
              />
            }
          }
        </div>
      </div>
    </div>
  `,
})
export class FichaAnotacoesTabComponent {
  fichaId = input.required<number>();
  userRole = input.required<'MESTRE' | 'JOGADOR'>();
  userId = input.required<number>();

  private fichaBusinessService = inject(FichaBusinessService);
  private toastService = inject(ToastService);

  // ===== ESTADO PRINCIPAL =====
  protected anotacoes = signal<Anotacao[]>([]);
  protected loading = signal(false);
  protected salvando = signal(false);
  protected showForm = signal(false);

  // ===== ESTADO FORMULÁRIO NOVA ANOTAÇÃO =====
  protected novoTitulo = signal('');
  protected novoConteudo = signal('');
  protected novoTipo = signal<TipoAnotacao>('JOGADOR');
  protected novaVisivelParaJogador = signal(false);

  // ===== PASTAS =====
  protected pastas = signal<AnotacaoPasta[]>([]);
  protected loadingPastas = signal(false);
  protected pastaSelecionada = signal<AnotacaoPasta | null>(null);
  protected pastaSelecionadaNode = signal<TreeNode | null>(null);

  protected pastaTreeNodes = computed((): TreeNode[] =>
    this.converterParaTreeNode(this.pastas())
  );

  protected readonly tipoOptions: Array<{ label: string; value: TipoAnotacao }> = [
    { label: 'Jogador', value: 'JOGADOR' },
    { label: 'Mestre', value: 'MESTRE' },
  ];

  constructor() {
    effect(() => {
      const id = this.fichaId();
      if (id) {
        this.carregarAnotacoes(id);
        this.carregarPastas(id);
      }
    });
  }

  // ===== CARREGAMENTO =====

  private carregarAnotacoes(fichaId: number, pastaPaiId?: number): void {
    this.loading.set(true);
    this.fichaBusinessService.listarAnotacoes(fichaId, pastaPaiId).subscribe({
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

  private carregarPastas(fichaId: number): void {
    this.loadingPastas.set(true);
    this.fichaBusinessService.listarPastas(fichaId).subscribe({
      next: (pastas) => {
        this.pastas.set(pastas);
        this.loadingPastas.set(false);
      },
      error: () => {
        // Falha silenciosa — pastas são feature adicional, não bloqueante
        this.loadingPastas.set(false);
      },
    });
  }

  // ===== PASTAS — SELEÇÃO =====

  protected converterParaTreeNode(pastas: AnotacaoPasta[]): TreeNode[] {
    return pastas.map(p => ({
      key: p.id.toString(),
      label: p.nome,
      data: p,
      icon: 'pi pi-folder',
      children: p.subPastas?.length ? this.converterParaTreeNode(p.subPastas) : [],
    }));
  }

  protected onPastaSelect(event: { node: TreeNode }): void {
    const pasta = event.node.data as AnotacaoPasta;
    this.pastaSelecionada.set(pasta);
    this.pastaSelecionadaNode.set(event.node);
    this.carregarAnotacoes(this.fichaId(), pasta.id);
  }

  protected selecionarTodasPastas(): void {
    this.pastaSelecionada.set(null);
    this.pastaSelecionadaNode.set(null);
    this.carregarAnotacoes(this.fichaId());
  }

  // ===== FORMULÁRIO NOVA ANOTAÇÃO =====

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

  // ===== EDIÇÃO DE ANOTAÇÃO =====

  /**
   * Trata o output `editar` emitido pelo AnotacaoCardComponent (dumb).
   * O card emite a anotação com os novos campos preenchidos.
   * O SMART extrai o DTO de atualização, chama a API e atualiza a lista local.
   */
  protected onEditarAnotacao(anotacaoAtualizada: Anotacao): void {
    const dto: AtualizarAnotacaoDto = {
      titulo: anotacaoAtualizada.titulo,
      conteudo: anotacaoAtualizada.conteudo,
      visivelParaJogador: anotacaoAtualizada.visivelParaJogador,
      visivelParaTodos: anotacaoAtualizada.visivelParaTodos,
    };

    this.fichaBusinessService
      .editarAnotacao(this.fichaId(), anotacaoAtualizada.id, dto)
      .subscribe({
        next: (atualizada) => {
          // Substitui o objeto na lista — o AnotacaoCardComponent detecta via OnPush
          // e fecha o modo de edição ao receber o novo input `anotacao`
          this.anotacoes.update(list =>
            list.map(a => (a.id === atualizada.id ? atualizada : a))
          );
          this.toastService.success('Anotacao atualizada com sucesso!');
        },
        error: () => {
          this.toastService.error('Erro ao atualizar anotacao. Tente novamente.');
        },
      });
  }

  // ===== REMOÇÃO =====

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
