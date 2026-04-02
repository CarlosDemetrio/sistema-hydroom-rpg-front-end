import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

export interface VariavelDinamica {
  sigla: string;
  label: string;
}

interface AvaliacaoResult {
  ok: boolean;
  resultado?: number;
  erro?: string;
}

/**
 * FormulaEditorComponent — Editor visual de fórmulas matemáticas (DUMB)
 *
 * Permite ao usuário digitar fórmulas com chips clicáveis de variáveis disponíveis,
 * preview em tempo real com valores ajustáveis e validação sintática local.
 *
 * Usage:
 * ```html
 * <app-formula-editor
 *   [(formula)]="valorFormula"
 *   [variaveisFixas]="['total', 'nivel']"
 *   [variaveisDinamicas]="atributosDoJogo"
 *   label="Fórmula de Ímpeto"
 *   placeholder="Ex: total / 10"
 *   (validationChange)="onValidationChange($event)"
 * />
 * ```
 */
@Component({
  selector: 'app-formula-editor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    FormsModule,
    ButtonModule,
    InputNumberModule,
    InputTextModule,
    MessageModule,
    TagModule,
    TooltipModule,
  ],
  template: `
    <div class="flex flex-column gap-3">

      <!-- Label -->
      <label class="font-semibold text-sm">{{ label() }}</label>

      <!-- Campo de texto da fórmula -->
      <div class="flex flex-column gap-1">
        <input
          #formulaInput
          pInputText
          [ngModel]="formula()"
          (ngModelChange)="onFormulaInput($event)"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          style="font-family: var(--rpg-font-mono, monospace);"
          class="w-full"
          aria-label="Campo de fórmula matemática"
        />
      </div>

      <!-- Chips de variáveis disponíveis -->
      @if (todasVariaveis().length > 0) {
        <div class="flex flex-column gap-1">
          <span class="text-xs text-color-secondary font-semibold uppercase">
            Variáveis disponíveis:
          </span>
          <div class="flex flex-wrap gap-1">
            @for (variavel of todasVariaveis(); track variavel.sigla) {
              <p-tag
                [value]="variavel.sigla"
                severity="secondary"
                [rounded]="true"
                [pTooltip]="variavel.label"
                tooltipPosition="top"
                (click)="inserirVariavel(variavel.sigla)"
                class="cursor-pointer"
                style="cursor: pointer;"
                role="button"
                [attr.aria-label]="'Inserir variável ' + variavel.label"
              />
            }
          </div>
        </div>
      }

      <!-- Seção de Preview -->
      @if (formula() && todasVariaveis().length > 0) {
        <div class="border-1 surface-border border-round p-3 surface-50">
          <div class="flex align-items-center gap-2 mb-2">
            <i class="pi pi-eye text-xs text-color-secondary"></i>
            <span class="text-xs font-semibold text-color-secondary uppercase">Preview</span>
          </div>

          <div class="flex flex-wrap align-items-center gap-2">
            @for (variavel of todasVariaveis(); track variavel.sigla) {
              <div class="flex align-items-center gap-1">
                <span
                  class="text-xs font-mono font-semibold"
                  style="font-family: var(--rpg-font-mono, monospace);"
                >{{ variavel.sigla }}</span>
                <p-inputNumber
                  [ngModel]="getPreviewValue(variavel.sigla)"
                  (ngModelChange)="setPreviewValue(variavel.sigla, $event)"
                  [showButtons]="true"
                  buttonLayout="horizontal"
                  incrementButtonIcon="pi pi-plus"
                  decrementButtonIcon="pi pi-minus"
                  inputStyleClass="w-4rem text-center text-xs"
                  [inputStyle]="{ 'font-size': '0.75rem', 'padding': '0.25rem' }"
                  [disabled]="disabled()"
                  [attr.aria-label]="'Valor de ' + variavel.label + ' para preview'"
                />
              </div>
            }

            <div class="flex align-items-center gap-2 ml-auto">
              <i class="pi pi-arrow-right text-color-secondary text-xs"></i>
              <span class="font-semibold">Resultado:</span>
              @if (previewResult().ok) {
                <code
                  class="font-mono text-primary font-bold"
                  style="font-family: var(--rpg-font-mono, monospace);"
                >
                  {{ previewResult().resultado | number:'1.0-4' }}
                </code>
              } @else {
                <span class="text-red-400 text-xs">—</span>
              }
            </div>
          </div>
        </div>
      }

      <!-- Mensagem de erro de validação -->
      @if (validationError()) {
        <p-message
          severity="error"
          [text]="validationError()!"
        />
      }

    </div>
  `,
})
export class FormulaEditorComponent {
  // ---- Inputs / Outputs ----

  formula = model<string>('');
  variaveisFixas = input<string[]>([]);
  variaveisDinamicas = input<VariavelDinamica[]>([]);
  placeholder = input<string>('Ex: FOR + AGI / 2');
  label = input<string>('Fórmula');
  disabled = input<boolean>(false);
  validationChange = output<boolean>();

  // ---- Referência ao input nativo para cursor ----
  private formulaInputRef = viewChild<ElementRef<HTMLInputElement>>('formulaInput');

  // ---- Estado interno ----
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  protected validationError = signal<string | null>(null);
  private previewValues = signal<Record<string, number>>({});

  // ---- Computed: todas as variáveis unificadas ----
  protected todasVariaveis = computed<VariavelDinamica[]>(() => {
    const fixas = this.variaveisFixas().map((s) => ({ sigla: s, label: s }));
    const dinamicas = this.variaveisDinamicas();
    return [...fixas, ...dinamicas];
  });

  // ---- Computed: resultado do preview ----
  protected previewResult = computed<AvaliacaoResult>(() => {
    const f = this.formula();
    if (!f.trim()) return { ok: false };

    const valores: Record<string, number> = {};
    for (const v of this.todasVariaveis()) {
      valores[v.sigla] = this.previewValues()[v.sigla] ?? 1;
    }
    return this.avaliarFormula(f, valores);
  });

  // ---- Effect: sincroniza previewValues ao mudar variáveis ----
  constructor() {
    effect(() => {
      const variaveis = this.todasVariaveis();
      const current = this.previewValues();
      const updated: Record<string, number> = {};
      for (const v of variaveis) {
        updated[v.sigla] = current[v.sigla] ?? 1;
      }
      this.previewValues.set(updated);
    });
  }

  // ---- Handlers ----

  protected onFormulaInput(value: string): void {
    this.formula.set(value);

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    if (!value.trim()) {
      this.validationError.set(null);
      this.validationChange.emit(true);
      return;
    }

    this.debounceTimer = setTimeout(() => {
      this.validarFormula(value);
    }, 600);
  }

  protected inserirVariavel(sigla: string): void {
    if (this.disabled()) return;

    const inputEl = this.formulaInputRef()?.nativeElement;
    const formulaAtual = this.formula();

    if (inputEl) {
      const start = inputEl.selectionStart ?? formulaAtual.length;
      const end = inputEl.selectionEnd ?? formulaAtual.length;
      const prefix = formulaAtual.substring(0, start);
      const suffix = formulaAtual.substring(end);
      const inserido = prefix + sigla + suffix;
      this.formula.set(inserido);

      // Reposicionar cursor após a variável inserida
      requestAnimationFrame(() => {
        inputEl.focus();
        const novaPosicao = start + sigla.length;
        inputEl.setSelectionRange(novaPosicao, novaPosicao);
      });
    } else {
      const separador = formulaAtual && !formulaAtual.endsWith(' ') ? ' ' : '';
      this.formula.set(formulaAtual + separador + sigla);
    }

    this.validarFormula(this.formula());
  }

  protected getPreviewValue(sigla: string): number {
    return this.previewValues()[sigla] ?? 1;
  }

  protected setPreviewValue(sigla: string, valor: number): void {
    this.previewValues.update((prev) => ({ ...prev, [sigla]: valor ?? 1 }));
  }

  // ---- Validação ----

  private validarFormula(formula: string): void {
    if (!formula.trim()) {
      this.validationError.set(null);
      this.validationChange.emit(true);
      return;
    }

    const variaveisConhecidas = new Set(this.todasVariaveis().map((v) => v.sigla));
    const valores: Record<string, number> = {};
    for (const v of this.todasVariaveis()) {
      valores[v.sigla] = 1;
    }

    // Checar variáveis desconhecidas
    const tokens = formula.match(/[A-Za-z_][A-Za-z0-9_]*/g) ?? [];
    for (const token of tokens) {
      if (!variaveisConhecidas.has(token)) {
        const erro = `Variável '${token}' não reconhecida`;
        this.validationError.set(erro);
        this.validationChange.emit(false);
        return;
      }
    }

    const resultado = this.avaliarFormula(formula, valores);
    if (resultado.ok) {
      this.validationError.set(null);
      this.validationChange.emit(true);
    } else {
      this.validationError.set(resultado.erro ?? 'Erro de sintaxe na fórmula');
      this.validationChange.emit(false);
    }
  }

  private avaliarFormula(formula: string, variaveis: Record<string, number>): AvaliacaoResult {
    try {
      let expr = formula;
      // Substituir variáveis do mais longo para o mais curto (evita substituição parcial)
      const chaves = Object.keys(variaveis).sort((a, b) => b.length - a.length);
      for (const key of chaves) {
        const regex = new RegExp(`\\b${key}\\b`, 'g');
        expr = expr.replace(regex, variaveis[key].toString());
      }
      // Validação: só permite chars seguros após substituição
      if (!/^[0-9+\-*/().\s]+$/.test(expr)) {
        return { ok: false, erro: 'Fórmula contém caracteres inválidos após substituição das variáveis' };
      }
      // eslint-disable-next-line no-new-func
      const resultado = Function(`"use strict"; return (${expr})`)() as number;
      if (!isFinite(resultado)) {
        return { ok: false, erro: 'Resultado inválido (divisão por zero ou overflow)' };
      }
      return { ok: true, resultado };
    } catch {
      return { ok: false, erro: 'Erro de sintaxe na fórmula' };
    }
  }
}
