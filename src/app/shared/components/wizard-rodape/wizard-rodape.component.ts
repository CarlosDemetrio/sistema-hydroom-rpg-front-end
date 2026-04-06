import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { EstadoSalvamento } from '@features/jogador/pages/ficha-form/ficha-wizard.types';

/**
 * WizardRodapeComponent (DUMB)
 *
 * Rodape de navegacao reutilizavel para o wizard de criacao de ficha.
 * Exibe o indicador de auto-save e os botoes de navegacao.
 *
 * Inputs:
 * - estadoSalvamento: estado atual do salvamento automatico
 * - passoAtual: numero do passo atual (1-based)
 * - totalPassos: total de passos do wizard
 * - podeAvancar: se o passo atual esta valido para avancar
 * - podeCriar: se deve exibir o botao "Criar Personagem" em vez de "Proximo"
 * - criando: se a request de criacao esta em andamento
 *
 * Outputs:
 * - avancar: emitido ao clicar "Proximo"
 * - voltar: emitido ao clicar "Voltar"
 * - criar: emitido ao clicar "Criar Personagem"
 */
@Component({
  selector: 'app-wizard-rodape',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonModule, ProgressSpinnerModule],
  template: `
    <div class="flex justify-content-between align-items-center mt-5 pt-4 border-top-1 border-200">

      <!-- Botao Voltar -->
      <div>
        @if (passoAtual() > 1) {
          <p-button
            label="Voltar"
            icon="pi pi-arrow-left"
            [text]="true"
            severity="secondary"
            (onClick)="voltar.emit()"
            [disabled]="estadoSalvamento() === 'salvando'"
            aria-label="Voltar"
          ></p-button>
        } @else {
          <span></span>
        }
      </div>

      <!-- Indicador de salvamento + Botao de acao -->
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
            <span class="text-sm">Salvo automaticamente</span>
          </div>
        }

        <!-- Estado: erro -->
        @if (estadoSalvamento() === 'erro') {
          <div class="flex align-items-center gap-2 text-yellow-500">
            <i class="pi pi-exclamation-triangle"></i>
            <span class="text-sm">Erro ao salvar. Tente novamente.</span>
          </div>
        }

        <!-- Estado: idle — espaco reservado para nao pular o layout -->
        @if (estadoSalvamento() === 'idle') {
          <span class="text-sm" style="visibility: hidden;">idle</span>
        }

        <!-- Botao Proximo ou Criar Personagem -->
        @if (!podeCriar()) {
          <p-button
            label="Proximo"
            icon="pi pi-arrow-right"
            iconPos="right"
            (onClick)="avancar.emit()"
            [disabled]="!podeAvancar() || estadoSalvamento() === 'salvando'"
            [loading]="estadoSalvamento() === 'salvando'"
            aria-label="Proximo"
          ></p-button>
        } @else {
          <p-button
            label="Criar Personagem"
            icon="pi pi-check"
            severity="success"
            (onClick)="criar.emit()"
            [disabled]="criando()"
            [loading]="criando()"
            aria-label="Criar Personagem"
          ></p-button>
        }

      </div>
    </div>
  `,
})
export class WizardRodapeComponent {
  readonly estadoSalvamento = input.required<EstadoSalvamento>();
  readonly passoAtual = input.required<number>();
  readonly totalPassos = input.required<number>();
  readonly podeAvancar = input.required<boolean>();
  readonly podeCriar = input<boolean>(false);
  readonly criando = input<boolean>(false);

  readonly avancar = output<void>();
  readonly voltar = output<void>();
  readonly criar = output<void>();
}
