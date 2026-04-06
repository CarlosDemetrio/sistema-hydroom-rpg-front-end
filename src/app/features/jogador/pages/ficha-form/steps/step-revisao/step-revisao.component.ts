import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { FichaVantagemResponse } from '@core/models/ficha.model';
import {
  FichaAtributoEditavel,
  TipoAptidaoComAptidoes,
} from '../../ficha-wizard.types';

/**
 * Versao de FormPasso1 usada na revisao — inclui os nomes resolvidos
 * para exibicao sem precisar de lookup adicional.
 */
export interface FormPasso1Revisao {
  nome: string;
  generoNome: string | null;
  racaNome: string | null;
  classeNome: string | null;
  indoleNome: string | null;
  presencaNome: string | null;
  isNpc: boolean;
}

/**
 * StepRevisaoComponent (DUMB)
 *
 * Passo 6 do Wizard de Ficha: revisao de todos os dados antes da criacao.
 *
 * Exibe um resumo de cada passo com botao "Editar" que navega de volta
 * para o passo correspondente.
 *
 * Inputs:
 * - formPasso1: dados de identificacao com nomes resolvidos
 * - formPasso2: dados de descricao fisica
 * - atributos: lista de atributos editaveis
 * - aptidoesAgrupadas: aptidoes agrupadas por tipo
 * - vantagensCompradas: vantagens compradas na ficha
 * - pontosAtributoNaoUsados: pontos de atributo restantes
 * - pontosAptidaoNaoUsados: pontos de aptidao restantes
 * - pontosVantagemNaoUsados: pontos de vantagem restantes
 * - criando: se a request de criacao esta em andamento
 *
 * Outputs:
 * - editarPasso: numero do passo para editar (1-5)
 * - confirmar: emitido ao confirmar criacao (usado pelo rodape via wizard)
 */
@Component({
  selector: 'app-step-revisao',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonModule, TagModule],
  template: `
    <div class="flex flex-column gap-4">

      <!-- Titulo -->
      <div class="text-center mb-2">
        <h2 class="text-2xl font-bold m-0 mb-1">Revisao do Personagem</h2>
        <p class="text-color-secondary m-0">Confira os dados antes de criar seu personagem.</p>
      </div>

      <!-- Secao 1: Identificacao -->
      <div class="surface-card border-round-lg p-4 border-1 border-200">
        <div class="flex justify-content-between align-items-center mb-3">
          <h3 class="text-lg font-semibold m-0">
            <i class="pi pi-user mr-2 text-primary"></i>Identificacao
          </h3>
          <p-button
            label="Editar"
            icon="pi pi-pencil"
            [text]="true"
            size="small"
            severity="secondary"
            (onClick)="editarPasso.emit(1)"
            aria-label="Editar identificacao"
          ></p-button>
        </div>
        <div class="grid">
          <div class="col-12 md:col-6">
            <div class="mb-2">
              <span class="text-color-secondary text-sm">Nome: </span>
              <span class="font-semibold">{{ formPasso1().nome }}</span>
            </div>
            <div class="mb-2">
              <span class="text-color-secondary text-sm">Genero: </span>
              <span class="font-semibold">{{ formPasso1().generoNome ?? '—' }}</span>
            </div>
            <div class="mb-2">
              <span class="text-color-secondary text-sm">Raca: </span>
              <span class="font-semibold">{{ formPasso1().racaNome ?? '—' }}</span>
            </div>
          </div>
          <div class="col-12 md:col-6">
            <div class="mb-2">
              <span class="text-color-secondary text-sm">Classe: </span>
              <span class="font-semibold">{{ formPasso1().classeNome ?? '—' }}</span>
            </div>
            <div class="mb-2">
              <span class="text-color-secondary text-sm">Indole: </span>
              <span class="font-semibold">{{ formPasso1().indoleNome ?? '—' }}</span>
            </div>
            <div class="mb-2">
              <span class="text-color-secondary text-sm">Presenca: </span>
              <span class="font-semibold">{{ formPasso1().presencaNome ?? '—' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Secao 2: Descricao Fisica (opcional) -->
      @if (formPasso2().descricao) {
        <div class="surface-card border-round-lg p-4 border-1 border-200">
          <div class="flex justify-content-between align-items-center mb-3">
            <h3 class="text-lg font-semibold m-0">
              <i class="pi pi-align-left mr-2 text-primary"></i>Descricao Fisica
            </h3>
            <p-button
              label="Editar"
              icon="pi pi-pencil"
              [text]="true"
              size="small"
              severity="secondary"
              (onClick)="editarPasso.emit(2)"
              aria-label="Editar descricao"
            ></p-button>
          </div>
          <p class="m-0 text-color-secondary line-height-3">{{ formPasso2().descricao }}</p>
        </div>
      }

      <!-- Secao 3: Atributos -->
      <div class="surface-card border-round-lg p-4 border-1 border-200">
        <div class="flex justify-content-between align-items-center mb-3">
          <h3 class="text-lg font-semibold m-0">
            <i class="pi pi-sliders-h mr-2 text-primary"></i>Atributos
          </h3>
          <p-button
            label="Editar"
            icon="pi pi-pencil"
            [text]="true"
            size="small"
            severity="secondary"
            (onClick)="editarPasso.emit(3)"
            aria-label="Editar atributos"
          ></p-button>
        </div>

        @if (pontosAtributoNaoUsados() > 0) {
          <div class="mb-3">
            <p-tag
              severity="warn"
              [value]="pontosAtributoNaoUsados() + ' ponto(s) de atributo nao distribuidos'"
            ></p-tag>
          </div>
        }

        <div class="grid">
          @for (atributo of atributos(); track atributo.atributoConfigId) {
            <div class="col-6 md:col-4 lg:col-3 mb-2">
              <div class="flex align-items-center justify-content-between surface-100 border-round p-2">
                <span class="text-sm font-medium">{{ atributo.atributoAbreviacao }}</span>
                <span class="font-bold text-primary">{{ atributo.base }}</span>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Secao 4: Aptidoes -->
      <div class="surface-card border-round-lg p-4 border-1 border-200">
        <div class="flex justify-content-between align-items-center mb-3">
          <h3 class="text-lg font-semibold m-0">
            <i class="pi pi-star mr-2 text-primary"></i>Aptidoes
          </h3>
          <p-button
            label="Editar"
            icon="pi pi-pencil"
            [text]="true"
            size="small"
            severity="secondary"
            (onClick)="editarPasso.emit(4)"
            aria-label="Editar aptidoes"
          ></p-button>
        </div>

        @if (pontosAptidaoNaoUsados() > 0) {
          <div class="mb-3">
            <p-tag
              severity="warn"
              [value]="pontosAptidaoNaoUsados() + ' ponto(s) de aptidao nao distribuidos'"
            ></p-tag>
          </div>
        }

        @for (grupo of aptidoesAgrupadas(); track grupo.tipoNome) {
          <div class="mb-3">
            <p class="text-sm font-semibold text-color-secondary mb-2 m-0">{{ grupo.tipoNome }}</p>
            <div class="grid">
              @for (aptidao of grupo.aptidoes; track aptidao.aptidaoConfigId) {
                <div class="col-6 md:col-4 lg:col-3 mb-1">
                  <div class="flex align-items-center justify-content-between surface-100 border-round p-2">
                    <span class="text-sm">{{ aptidao.aptidaoNome }}</span>
                    <span class="font-bold text-sm text-primary">{{ aptidao.base }}</span>
                  </div>
                </div>
              }
            </div>
          </div>
        }
      </div>

      <!-- Secao 5: Vantagens -->
      <div class="surface-card border-round-lg p-4 border-1 border-200">
        <div class="flex justify-content-between align-items-center mb-3">
          <h3 class="text-lg font-semibold m-0">
            <i class="pi pi-trophy mr-2 text-primary"></i>Vantagens
          </h3>
          <p-button
            label="Editar"
            icon="pi pi-pencil"
            [text]="true"
            size="small"
            severity="secondary"
            (onClick)="editarPasso.emit(5)"
            aria-label="Editar vantagens"
          ></p-button>
        </div>

        @if (pontosVantagemNaoUsados() > 0) {
          <div class="mb-3">
            <p-tag
              severity="info"
              [value]="pontosVantagemNaoUsados() + ' ponto(s) de vantagem restantes'"
            ></p-tag>
          </div>
        }

        @if (vantagensCompradas().length === 0) {
          <p class="text-color-secondary m-0 text-sm">Nenhuma vantagem comprada</p>
        } @else {
          <div class="flex flex-wrap gap-2">
            @for (vantagem of vantagensCompradas(); track vantagem.id) {
              <div class="flex align-items-center gap-2 surface-100 border-round px-3 py-2">
                <span class="text-sm font-medium">{{ vantagem.nomeVantagem }}</span>
                <p-tag [value]="'Nv. ' + vantagem.nivelAtual" severity="secondary"></p-tag>
              </div>
            }
          </div>
        }
      </div>

    </div>
  `,
})
export class StepRevisaoComponent {
  readonly formPasso1 = input.required<FormPasso1Revisao>();
  readonly formPasso2 = input.required<{ descricao: string | null }>();
  readonly atributos = input.required<FichaAtributoEditavel[]>();
  readonly aptidoesAgrupadas = input.required<TipoAptidaoComAptidoes[]>();
  readonly vantagensCompradas = input.required<FichaVantagemResponse[]>();
  readonly pontosAtributoNaoUsados = input.required<number>();
  readonly pontosAptidaoNaoUsados = input.required<number>();
  readonly pontosVantagemNaoUsados = input.required<number>();
  readonly criando = input.required<boolean>();

  readonly editarPasso = output<number>();
  readonly confirmar = output<void>();
}
