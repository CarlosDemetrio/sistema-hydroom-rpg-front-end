import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { Anotacao } from '@models/anotacao.model';
import { MarkdownPipe } from '@shared/pipes/markdown.pipe';

/**
 * AnotacaoCardComponent — DUMB (Presentational)
 *
 * Exibe uma anotação de ficha com:
 * - Modo visualização: conteúdo renderizado como Markdown
 * - Modo edição: campos inline com textarea de Markdown bruto
 *
 * Regras de permissão:
 * - MESTRE pode editar qualquer anotação
 * - JOGADOR pode editar apenas as próprias (autorId === userId)
 * - Toggle visivelParaJogador: apenas MESTRE em anotações do tipo MESTRE
 * - Toggle visivelParaTodos: qualquer usuário com permissão de edição
 *
 * O componente NÃO faz chamadas HTTP — emite o output `editar` com
 * a anotação atualizada para o componente SMART tratar a persistência.
 */
@Component({
  selector: 'app-anotacao-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    FormsModule,
    BadgeModule,
    ButtonModule,
    CardModule,
    CheckboxModule,
    DividerModule,
    InputTextModule,
    TagModule,
    TextareaModule,
    ToggleButtonModule,
    MarkdownPipe,
  ],
  template: `
    @if (!modoEdicao()) {
      <!-- MODO VISUALIZAÇÃO -->
      <p-card
        [class]="cardClass()"
        [attr.aria-label]="'Anotacao: ' + anotacao().titulo"
      >
        <!-- Header -->
        <div class="flex items-start justify-between gap-2">
          <div class="flex flex-col gap-1 flex-1 min-w-0">
            <h4 class="m-0 font-semibold">{{ anotacao().titulo }}</h4>
            <div class="flex items-center gap-2 flex-wrap">
              @if (anotacao().tipoAnotacao === 'MESTRE') {
                <p-tag value="MESTRE" severity="warn" />
              } @else {
                <p-tag value="JOGADOR" severity="success" />
              }
              @if (anotacao().visivelParaJogador) {
                <p-tag value="Visivel" severity="info" />
              }
              @if (anotacao().visivelParaTodos) {
                <p-tag value="Compartilhado" severity="secondary" />
              }
            </div>
          </div>

          <div class="flex gap-1">
            @if (podeEditar()) {
              <p-button
                icon="pi pi-pencil"
                text
                size="small"
                [attr.aria-label]="'Editar anotacao ' + anotacao().titulo"
                (onClick)="iniciarEdicao()"
              />
            }
            @if (podeDeletar()) {
              <p-button
                icon="pi pi-trash"
                text
                severity="danger"
                size="small"
                [attr.aria-label]="'Deletar anotacao ' + anotacao().titulo"
                (onClick)="deletar.emit(anotacao().id)"
              />
            }
          </div>
        </div>

        <p-divider />

        <!-- Conteúdo renderizado como Markdown -->
        <div
          class="markdown-content text-sm"
          [innerHTML]="anotacao().conteudo | markdown"
          aria-label="Conteudo da anotacao"
        ></div>

        <!-- Rodapé -->
        <div class="flex items-center justify-between mt-2 text-xs text-color-secondary">
          <span>Por {{ anotacao().autorNome }}</span>
          <span>{{ anotacao().dataCriacao | date:'dd/MM/yyyy' }}</span>
        </div>
      </p-card>
    } @else {
      <!-- MODO EDIÇÃO -->
      <p-card
        [class]="cardClass()"
        [attr.aria-label]="'Editando anotacao: ' + anotacao().titulo"
      >
        <div class="flex flex-col gap-3">

          <!-- Título -->
          <div class="flex flex-col gap-1">
            <label for="tituloEdit-{{ anotacao().id }}" class="text-sm font-medium">Titulo</label>
            <input
              pInputText
              [id]="'tituloEdit-' + anotacao().id"
              class="w-full"
              [ngModel]="tituloEdit()"
              (ngModelChange)="tituloEdit.set($event)"
              placeholder="Titulo da anotacao"
              aria-label="Titulo da anotacao"
            />
          </div>

          <!-- Conteúdo Markdown -->
          <div class="flex flex-col gap-1">
            <label [for]="'conteudoEdit-' + anotacao().id" class="text-sm font-medium">
              Conteudo (Markdown)
            </label>
            <textarea
              pTextarea
              [id]="'conteudoEdit-' + anotacao().id"
              class="w-full font-mono text-sm"
              rows="6"
              [ngModel]="conteudoEdit()"
              (ngModelChange)="conteudoEdit.set($event)"
              placeholder="Escreva em Markdown... **negrito**, _italico_, # titulo"
              aria-label="Conteudo da anotacao em Markdown"
            ></textarea>
          </div>

          <!-- Toggle visivelParaJogador: apenas MESTRE em anotações do Mestre -->
          @if (userRole() === 'MESTRE' && anotacao().tipoAnotacao === 'MESTRE') {
            <div class="flex items-center gap-2">
              <p-togglebutton
                [ngModel]="visivelParaJogadorEdit()"
                (ngModelChange)="visivelParaJogadorEdit.set($event)"
                onLabel="Visivel ao Jogador"
                offLabel="Apenas Mestre"
                onIcon="pi pi-eye"
                offIcon="pi pi-eye-slash"
                aria-label="Visibilidade para o jogador"
              />
            </div>
          }

          <!-- Toggle visivelParaTodos: qualquer usuário com permissão de edição -->
          <div class="flex items-center gap-2">
            <p-checkbox
              [inputId]="'visivelParaTodos-' + anotacao().id"
              [ngModel]="visivelParaTodosEdit()"
              (ngModelChange)="visivelParaTodosEdit.set($event)"
              [binary]="true"
            />
            <label [for]="'visivelParaTodos-' + anotacao().id" class="text-sm cursor-pointer">
              Compartilhar com todos
            </label>
          </div>

          <!-- Ações -->
          <div class="flex gap-2 justify-end">
            <p-button
              label="Cancelar"
              text
              size="small"
              (onClick)="cancelarEdicao()"
              aria-label="Cancelar edicao"
            />
            <p-button
              label="Salvar"
              icon="pi pi-check"
              size="small"
              [loading]="salvandoEdicao()"
              [disabled]="!tituloEdit().trim() || !conteudoEdit().trim()"
              (onClick)="confirmarEdicao()"
              aria-label="Salvar edicao"
            />
          </div>
        </div>
      </p-card>
    }
  `,
  styles: [`
    :host ::ng-deep .anotacao-mestre-oculta.p-card {
      background-color: var(--yellow-100);
      border: 1px solid var(--yellow-400);
    }

    :host ::ng-deep .markdown-content {
      h1, h2, h3 { font-weight: 600; margin: 0.5rem 0 0.25rem; }
      h1 { font-size: 1.25rem; }
      h2 { font-size: 1.1rem; }
      h3 { font-size: 1rem; }
      p { margin: 0 0 0.5rem; }
      strong { font-weight: 700; }
      em { font-style: italic; }
      code {
        font-family: monospace;
        background: var(--surface-100);
        padding: 0.1rem 0.3rem;
        border-radius: 3px;
        font-size: 0.875em;
      }
      ul, ol { padding-left: 1.5rem; margin: 0.25rem 0; }
      li { margin-bottom: 0.15rem; }
      del { text-decoration: line-through; }
    }
  `],
})
export class AnotacaoCardComponent {
  // ===== INPUTS =====
  anotacao = input.required<Anotacao>();
  podeDeletar = input<boolean>(false);
  userRole = input<'MESTRE' | 'JOGADOR'>('JOGADOR');
  userId = input<number>(0);

  // ===== OUTPUTS =====
  /** Emite a anotação com os campos editados para o SMART tratar a persistência HTTP */
  editar = output<Anotacao>();
  deletar = output<number>();

  // ===== ESTADO DE EDIÇÃO =====
  protected modoEdicao = signal(false);
  protected tituloEdit = signal('');
  protected conteudoEdit = signal('');
  protected visivelParaJogadorEdit = signal(false);
  protected visivelParaTodosEdit = signal(false);
  protected salvandoEdicao = signal(false);

  // ===== COMPUTED =====
  protected podeEditar = computed(() =>
    this.userRole() === 'MESTRE' || this.anotacao().autorId === this.userId()
  );

  protected cardClass = computed((): string => {
    const base = 'mb-3';
    if (this.anotacao().tipoAnotacao === 'MESTRE' && !this.anotacao().visivelParaJogador) {
      return `${base} anotacao-mestre-oculta`;
    }
    return base;
  });

  // ===== MÉTODOS =====

  protected iniciarEdicao(): void {
    this.tituloEdit.set(this.anotacao().titulo);
    this.conteudoEdit.set(this.anotacao().conteudo);
    this.visivelParaJogadorEdit.set(this.anotacao().visivelParaJogador);
    this.visivelParaTodosEdit.set(this.anotacao().visivelParaTodos ?? false);
    this.modoEdicao.set(true);
  }

  protected cancelarEdicao(): void {
    this.modoEdicao.set(false);
  }

  /**
   * Emite o output `editar` com a anotação atualizada.
   * O SMART (FichaAnotacoesTabComponent) é responsável pela chamada HTTP.
   * O loading é gerenciado externamente: o input `anotacao()` será atualizado
   * quando o SMART receber a resposta do backend.
   */
  protected confirmarEdicao(): void {
    this.editar.emit({
      ...this.anotacao(),
      titulo: this.tituloEdit(),
      conteudo: this.conteudoEdit(),
      visivelParaJogador: this.visivelParaJogadorEdit(),
      visivelParaTodos: this.visivelParaTodosEdit(),
    });
  }

  /**
   * Chamado pelo SMART após salvar com sucesso para fechar o modo de edição.
   * O SMART deve chamar este método indiretamente atualizando o input `anotacao`
   * — o efeito de atualização do input fecha o modo de edição automaticamente via
   * a referência de identidade da anotação. Por design simples, o SMART pode também
   * chamar `modoEdicao` via ViewChild, mas preferimos manter o card 100% DUMB.
   * Solução: o SMART fecha o modo de edição substituindo o objeto anotação na lista.
   */
  fecharModoEdicao(): void {
    this.modoEdicao.set(false);
    this.salvandoEdicao.set(false);
  }

  setSalvando(value: boolean): void {
    this.salvandoEdicao.set(value);
  }
}
