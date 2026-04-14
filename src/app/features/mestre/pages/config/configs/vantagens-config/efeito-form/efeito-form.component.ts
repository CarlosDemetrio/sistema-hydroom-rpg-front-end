import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { SelectModule } from 'primeng/select';
import { SliderModule } from 'primeng/slider';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';

import { AtributoConfig } from '@core/models/atributo-config.model';
import { AptidaoConfig } from '@core/models/aptidao-config.model';
import { BonusConfig, DadoProspeccaoConfig, MembroCorpoConfig } from '@core/models/config.models';
import { TipoEfeito, CriarVantagemEfeitoDto } from '@core/models/vantagem-efeito.model';
import { DadoUpPreviewComponent } from './dado-up-preview/dado-up-preview.component';

/** Opção unificada para o dropdown de campo alvo da fórmula customizada. */
export interface CampoAlvoOption {
  id: number;
  nome: string;
  /** 'atributo' | 'bonus' — determina qual FK preencher no DTO */
  tipo: 'atributo' | 'bonus';
  /** Sigla exibida no hint de variáveis disponíveis (ex: FOR, BBA) */
  sigla: string | null;
}

export interface TipoEfeitoOption {
  label: string;
  value: TipoEfeito;
  descricao: string;
}

const TIPOS_EFEITO: TipoEfeitoOption[] = [
  {
    value: 'BONUS_ATRIBUTO',
    label: 'Bônus em Atributo',
    descricao: 'Adiciona um valor fixo e/ou por nível a um atributo específico (ex: +2 em Força).',
  },
  {
    value: 'BONUS_APTIDAO',
    label: 'Bônus em Aptidão',
    descricao: 'Adiciona um valor fixo e/ou por nível a uma aptidão específica.',
  },
  {
    value: 'BONUS_DERIVADO',
    label: 'Bônus em Derivado',
    descricao: 'Adiciona um valor a um bônus derivado (BBA, BBM, Defesa, etc.).',
  },
  {
    value: 'BONUS_VIDA',
    label: 'Bônus em Vida Total',
    descricao: 'Aumenta o total de Pontos de Vida do personagem.',
  },
  {
    value: 'BONUS_VIDA_MEMBRO',
    label: 'Bônus em Vida de Membro',
    descricao: 'Aumenta os Pontos de Vida de um membro específico do corpo.',
  },
  {
    value: 'BONUS_ESSENCIA',
    label: 'Bônus em Essência',
    descricao: 'Aumenta a capacidade máxima de Essência do personagem.',
  },
  {
    value: 'DADO_UP',
    label: 'Avanço de Dado (Dado Up)',
    descricao: 'Cada nível desta vantagem avança o dado de prospecção uma posição na sequência.',
  },
  {
    value: 'FORMULA_CUSTOMIZADA',
    label: 'Fórmula Customizada',
    descricao: 'Efeito calculado por expressão matemática customizada. Selecione o campo alvo e defina a fórmula.',
  },
];

interface EfeitoFormState {
  atributoAlvoId: number | null;
  aptidaoAlvoId: number | null;
  bonusAlvoId: number | null;
  membroAlvoId: number | null;
  valorFixo: number | null;
  valorPorNivel: number | null;
  formula: string;
  descricaoEfeito: string;
  /** Campo alvo selecionado para FORMULA_CUSTOMIZADA (atributo ou bônus) */
  campoAlvoFormula: CampoAlvoOption | null;
  /** Texto da fórmula customizada */
  formulaCustomizada: string;
}

@Component({
  selector: 'app-efeito-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    ButtonModule,
    DividerModule,
    InputNumberModule,
    InputTextModule,
    PanelModule,
    SelectModule,
    SliderModule,
    TagModule,
    TextareaModule,
    TooltipModule,
    DadoUpPreviewComponent,
  ],
  template: `
    <div class="flex flex-column gap-3">

      <!-- Tipo de efeito -->
      <div class="flex flex-column gap-2">
        <label class="font-semibold">
          Tipo de Efeito <span class="text-red-400">*</span>
        </label>
        <p-select
          [options]="tiposEfeito"
          optionLabel="label"
          optionValue="value"
          placeholder="Selecione o tipo de efeito..."
          [(ngModel)]="tipoSelecionadoModel"
          (onChange)="onTipoChange($event.value)"
        />
        @if (tipoSelecionado()) {
          <small class="text-color-secondary">{{ descricaoTipoAtual() }}</small>
        }
      </div>

      @if (tipoSelecionado()) {

        <!-- Alvo: Atributo -->
        @if (mostrarAlvoAtributo()) {
          <div class="flex flex-column gap-2">
            <label class="font-semibold">
              Atributo alvo <span class="text-red-400">*</span>
            </label>
            <p-select
              [options]="atributosDisponiveis()"
              optionLabel="nome"
              optionValue="id"
              placeholder="Selecione o atributo..."
              [(ngModel)]="form.atributoAlvoId"
            />
          </div>
        }

        <!-- Alvo: Aptidão -->
        @if (mostrarAlvoAptidao()) {
          <div class="flex flex-column gap-2">
            <label class="font-semibold">
              Aptidão alvo <span class="text-red-400">*</span>
            </label>
            <p-select
              [options]="aptidoesDisponiveis()"
              optionLabel="nome"
              optionValue="id"
              placeholder="Selecione a aptidão..."
              [(ngModel)]="form.aptidaoAlvoId"
            />
          </div>
        }

        <!-- Alvo: Bônus Derivado -->
        @if (mostrarAlvoBonus()) {
          <div class="flex flex-column gap-2">
            <label class="font-semibold">
              Bônus derivado alvo <span class="text-red-400">*</span>
            </label>
            <p-select
              [options]="bonusDisponiveis()"
              optionLabel="nome"
              optionValue="id"
              placeholder="Selecione o bônus..."
              [(ngModel)]="form.bonusAlvoId"
            />
          </div>
        }

        <!-- Alvo: Membro do corpo -->
        @if (mostrarAlvoMembro()) {
          <div class="flex flex-column gap-2">
            <label class="font-semibold">
              Membro do corpo alvo <span class="text-red-400">*</span>
            </label>
            <p-select
              [options]="membrosDisponiveis()"
              optionLabel="nome"
              optionValue="id"
              placeholder="Selecione o membro..."
              [(ngModel)]="form.membroAlvoId"
            />
          </div>
        }

        <!-- Valores numéricos (todos exceto DADO_UP e FORMULA_CUSTOMIZADA) -->
        @if (mostrarValorNumerico()) {
          <p-divider />
          <div class="flex gap-3">
            <div class="flex flex-column gap-2 flex-1">
              <label class="font-semibold">Valor fixo</label>
              <p-input-number
                [(ngModel)]="form.valorFixo"
                placeholder="0"
                [showButtons]="true"
                [min]="-999"
                [max]="999"
                pTooltip="Bônus base, independente do nível da vantagem"
                tooltipPosition="top"
              />
            </div>
            <div class="flex flex-column gap-2 flex-1">
              <label class="font-semibold">Valor por nível</label>
              <p-input-number
                [(ngModel)]="form.valorPorNivel"
                placeholder="0"
                [showButtons]="true"
                [min]="-999"
                [max]="999"
                pTooltip="Bônus adicional por nível comprado da vantagem"
                tooltipPosition="top"
              />
            </div>
          </div>

          <!-- Preview calculado -->
          @if (podeMostrarPreview()) {
            <div class="p-3 border-round surface-100 flex flex-column gap-2">
              <div class="flex align-items-center justify-content-between">
                <span class="font-semibold text-sm">Previsão no nível {{ nivelPreview() }}</span>
                <p-tag
                  [value]="'+' + calcularPreview()"
                  severity="success"
                />
              </div>
              <p-slider
                [(ngModel)]="nivelPreviewModel"
                [min]="1"
                [max]="nivelMaximoVantagem()"
                (onChange)="onNivelPreviewChange($event.value ?? 0)"
              />
              <small class="text-color-secondary">
                Arraste para simular o bônus em diferentes níveis.
              </small>
            </div>
          }
        }

        <!-- DADO_UP: preview visual de progressão de dado -->
        @if (isDadoUp()) {
          <app-dado-up-preview
            [dadosOrdenados]="dadosDisponiveis()"
            [nivelMaximo]="nivelMaximoVantagem()"
          />
        }

        <!-- FORMULA_CUSTOMIZADA: sub-formulário de campo alvo + fórmula -->
        @if (mostrarFormula()) {
          <p-divider />

          <!-- Campo alvo -->
          <div class="flex flex-column gap-2">
            <label class="font-semibold">
              Campo alvo <span class="text-red-400">*</span>
            </label>
            <p-select
              [options]="camposAlvoFormula()"
              optionLabel="nome"
              [(ngModel)]="form.campoAlvoFormula"
              placeholder="Selecione o campo que receberá o resultado..."
              [filter]="true"
              filterPlaceholder="Buscar campo..."
            >
              <ng-template #item let-opt>
                <div class="flex align-items-center gap-2">
                  <p-tag
                    [value]="opt.tipo === 'atributo' ? 'ATR' : 'BÔN'"
                    [severity]="opt.tipo === 'atributo' ? 'info' : 'warn'"
                    styleClass="text-xs"
                  />
                  <span>{{ opt.nome }}</span>
                  @if (opt.sigla) {
                    <span class="text-color-secondary text-sm font-mono">{{ opt.sigla }}</span>
                  }
                </div>
              </ng-template>
              <ng-template #selectedItem let-opt>
                <div class="flex align-items-center gap-2">
                  <p-tag
                    [value]="opt.tipo === 'atributo' ? 'ATR' : 'BÔN'"
                    [severity]="opt.tipo === 'atributo' ? 'info' : 'warn'"
                    styleClass="text-xs"
                  />
                  <span>{{ opt.nome }}</span>
                  @if (opt.sigla) {
                    <span class="text-color-secondary text-sm font-mono">{{ opt.sigla }}</span>
                  }
                </div>
              </ng-template>
            </p-select>
            <small class="text-color-secondary">
              Atributos e bônus derivados do jogo estão disponíveis como alvos.
            </small>
          </div>

          <!-- Fórmula customizada -->
          <div class="flex flex-column gap-2">
            <label class="font-semibold">
              Fórmula <span class="text-red-400">*</span>
            </label>
            <input
              pInputText
              [(ngModel)]="form.formulaCustomizada"
              placeholder="Ex: total * 2 + FOR"
              style="font-family: var(--font-mono, monospace); font-size: 0.95rem;"
              [class.ng-invalid]="formulaInvalida()"
              aria-label="Fórmula customizada"
            />
            @if (formulaInvalida()) {
              <small class="text-red-400">A fórmula não pode estar vazia.</small>
            }
            <small class="text-color-secondary">
              Variáveis disponíveis: <code>total</code>, <code>nivel</code>, <code>base</code>
              @if (siglasDisponiveis().length) {
                , {{ siglasDisponiveis().join(', ') }}
              }
            </small>
          </div>
        }

        <!-- Descrição do efeito (opcional) -->
        <div class="flex flex-column gap-2">
          <label class="font-semibold">Descrição do efeito (opcional)</label>
          <textarea
            pTextarea
            [(ngModel)]="form.descricaoEfeito"
            [rows]="2"
            placeholder="Ex: Aumenta a precisão em combate corpo a corpo."
            [autoResize]="true"
          ></textarea>
        </div>

      }

      <!-- Ações -->
      <div class="flex justify-content-end gap-2 pt-2">
        <p-button
          label="Cancelar"
          severity="secondary"
          [outlined]="true"
          (onClick)="cancelar.emit()"
        />
        <p-button
          label="Salvar efeito"
          icon="pi pi-check"
          [disabled]="!podeSubmeter()"
          (onClick)="salvar()"
        />
      </div>

    </div>
  `,
})
export class EfeitoFormComponent {
  // ============================================================
  // Inputs
  // ============================================================

  vantagemId        = input.required<number>();
  nivelMaximoVantagem = input<number>(1);
  atributosDisponiveis = input<AtributoConfig[]>([]);
  aptidoesDisponiveis  = input<AptidaoConfig[]>([]);
  bonusDisponiveis     = input<BonusConfig[]>([]);
  membrosDisponiveis   = input<MembroCorpoConfig[]>([]);
  dadosDisponiveis     = input<DadoProspeccaoConfig[]>([]);

  // ============================================================
  // Outputs
  // ============================================================

  efeitoSalvo = output<CriarVantagemEfeitoDto>();
  cancelar    = output<void>();

  // ============================================================
  // Estado reativo
  // ============================================================

  readonly tiposEfeito: TipoEfeitoOption[] = TIPOS_EFEITO;

  tipoSelecionado      = signal<TipoEfeito | null>(null);
  tipoSelecionadoModel: TipoEfeito | null = null;
  nivelPreview         = signal<number>(1);
  nivelPreviewModel    = 1;

  form: EfeitoFormState = {
    atributoAlvoId:     null,
    aptidaoAlvoId:      null,
    bonusAlvoId:        null,
    membroAlvoId:       null,
    valorFixo:          null,
    valorPorNivel:      null,
    formula:            '',
    descricaoEfeito:    '',
    campoAlvoFormula:   null,
    formulaCustomizada: '',
  };

  /** Indica se o usuário tentou submeter e a fórmula está vazia (para exibir validação) */
  tentouSubmeter = signal(false);

  // ============================================================
  // Computed: quais campos mostrar
  // ============================================================

  mostrarAlvoAtributo  = computed(() => this.tipoSelecionado() === 'BONUS_ATRIBUTO');
  mostrarAlvoAptidao   = computed(() => this.tipoSelecionado() === 'BONUS_APTIDAO');
  mostrarAlvoBonus     = computed(() => this.tipoSelecionado() === 'BONUS_DERIVADO');
  mostrarAlvoMembro    = computed(() => this.tipoSelecionado() === 'BONUS_VIDA_MEMBRO');

  mostrarValorNumerico = computed(() => {
    const tipo = this.tipoSelecionado();
    if (!tipo) return false;
    return ['BONUS_ATRIBUTO', 'BONUS_APTIDAO', 'BONUS_DERIVADO',
            'BONUS_VIDA', 'BONUS_VIDA_MEMBRO', 'BONUS_ESSENCIA'].includes(tipo);
  });

  mostrarFormula = computed(() => this.tipoSelecionado() === 'FORMULA_CUSTOMIZADA');
  isDadoUp       = computed(() => this.tipoSelecionado() === 'DADO_UP');

  descricaoTipoAtual = computed(() => {
    const tipo = this.tipoSelecionado();
    return TIPOS_EFEITO.find(t => t.value === tipo)?.descricao ?? '';
  });

  // ============================================================
  // Computed: FORMULA_CUSTOMIZADA
  // ============================================================

  /**
   * Lista unificada de campos alvo disponíveis para FORMULA_CUSTOMIZADA:
   * atributos do jogo + bônus derivados do jogo.
   */
  camposAlvoFormula = computed<CampoAlvoOption[]>(() => {
    const atributos: CampoAlvoOption[] = this.atributosDisponiveis().map(a => ({
      id: a.id,
      nome: a.nome,
      tipo: 'atributo',
      sigla: a.abreviacao,
    }));
    const bonus: CampoAlvoOption[] = this.bonusDisponiveis().map(b => ({
      id: b.id,
      nome: b.nome,
      tipo: 'bonus',
      sigla: b.sigla ?? null,
    }));
    return [...atributos, ...bonus];
  });

  /**
   * Siglas disponíveis para uso nas fórmulas (atributos com abreviação).
   * Exibidas no hint do campo fórmula.
   */
  siglasDisponiveis = computed<string[]>(() =>
    this.atributosDisponiveis()
      .map(a => a.abreviacao)
      .filter(s => !!s)
  );

  /** True quando o usuário tentou submeter e a fórmula está vazia. */
  formulaInvalida = computed(
    () => this.tentouSubmeter() && this.mostrarFormula() && !this.form.formulaCustomizada.trim()
  );

  // ============================================================
  // Preview calculado
  // ============================================================

  podeMostrarPreview = computed(() => {
    if (!this.mostrarValorNumerico()) return false;
    return (this.form.valorFixo != null && this.form.valorFixo !== 0) ||
           (this.form.valorPorNivel != null && this.form.valorPorNivel !== 0);
  });

  calcularPreview = computed(() => {
    const fixo      = this.form.valorFixo ?? 0;
    const porNivel  = this.form.valorPorNivel ?? 0;
    return fixo + porNivel * this.nivelPreview();
  });

  // ============================================================
  // Validação client-side
  // ============================================================

  podeSubmeter = computed(() => {
    const tipo = this.tipoSelecionado();
    if (!tipo) return false;
    if (tipo === 'BONUS_ATRIBUTO'    && !this.form.atributoAlvoId) return false;
    if (tipo === 'BONUS_APTIDAO'     && !this.form.aptidaoAlvoId)  return false;
    if (tipo === 'BONUS_DERIVADO'    && !this.form.bonusAlvoId)    return false;
    if (tipo === 'BONUS_VIDA_MEMBRO' && !this.form.membroAlvoId)   return false;
    const ehNumerico = !['DADO_UP', 'FORMULA_CUSTOMIZADA'].includes(tipo);
    if (ehNumerico && !this.form.valorFixo && !this.form.valorPorNivel) return false;
    if (tipo === 'FORMULA_CUSTOMIZADA') {
      if (!this.form.campoAlvoFormula) return false;
      if (!this.form.formulaCustomizada.trim()) return false;
    }
    return true;
  });

  // ============================================================
  // Handlers
  // ============================================================

  onTipoChange(tipo: TipoEfeito | null): void {
    this.tipoSelecionado.set(tipo);
    this.tentouSubmeter.set(false);
    // Reseta todos os campos de alvo ao mudar o tipo
    this.form.atributoAlvoId     = null;
    this.form.aptidaoAlvoId      = null;
    this.form.bonusAlvoId        = null;
    this.form.membroAlvoId       = null;
    this.form.campoAlvoFormula   = null;
    this.form.formulaCustomizada = '';
  }

  onNivelPreviewChange(valor: number): void {
    this.nivelPreview.set(valor);
  }

  salvar(): void {
    this.tentouSubmeter.set(true);
    if (!this.podeSubmeter()) return;
    const tipo = this.tipoSelecionado()!;

    // Para FORMULA_CUSTOMIZADA, mapeia o campo alvo selecionado para a FK correta
    const campoAlvo = this.form.campoAlvoFormula;
    const atributoAlvoFormula = (tipo === 'FORMULA_CUSTOMIZADA' && campoAlvo?.tipo === 'atributo')
      ? campoAlvo.id
      : null;
    const bonusAlvoFormula = (tipo === 'FORMULA_CUSTOMIZADA' && campoAlvo?.tipo === 'bonus')
      ? campoAlvo.id
      : null;

    const dto: CriarVantagemEfeitoDto = {
      tipoEfeito: tipo,
      ...(this.form.atributoAlvoId  != null && { atributoAlvoId:  this.form.atributoAlvoId }),
      ...(atributoAlvoFormula       != null && { atributoAlvoId:  atributoAlvoFormula }),
      ...(this.form.aptidaoAlvoId   != null && { aptidaoAlvoId:   this.form.aptidaoAlvoId }),
      ...(this.form.bonusAlvoId     != null && { bonusAlvoId:     this.form.bonusAlvoId }),
      ...(bonusAlvoFormula          != null && { bonusAlvoId:     bonusAlvoFormula }),
      ...(this.form.membroAlvoId    != null && { membroAlvoId:    this.form.membroAlvoId }),
      ...(this.form.valorFixo       != null && { valorFixo:       this.form.valorFixo }),
      ...(this.form.valorPorNivel   != null && { valorPorNivel:   this.form.valorPorNivel }),
      ...(this.form.formula?.trim() && { formula: this.form.formula.trim() }),
      ...(tipo === 'FORMULA_CUSTOMIZADA' && this.form.formulaCustomizada.trim()
        && { formula: this.form.formulaCustomizada.trim() }),
      ...(this.form.descricaoEfeito?.trim() && { descricaoEfeito: this.form.descricaoEfeito.trim() }),
    };

    this.efeitoSalvo.emit(dto);
  }
}
