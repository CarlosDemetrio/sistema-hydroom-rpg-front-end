import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

/**
 * LevelUpVantagensStepComponent — Dumb Component (Step 3)
 *
 * Exibe o saldo de pontos de vantagem disponíveis e oferece atalho
 * para navegar diretamente à aba de Vantagens da ficha ou fechar o dialog.
 *
 * Spec 012 T10.
 */
@Component({
  selector: 'app-level-up-vantagens-step',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BadgeModule, ButtonModule, MessageModule],
  template: `
    <div class="flex flex-column gap-4 p-4">
      <div class="flex flex-column gap-2">
        <h3 class="text-lg font-semibold m-0">Pontos de Vantagem</h3>
        <div class="flex justify-content-between py-2">
          <span class="font-semibold">Disponíveis:</span>
          <p-badge
            [value]="pontosVantagemDisponiveis().toString()"
            [severity]="pontosVantagemDisponiveis() > 0 ? 'success' : 'secondary'" />
        </div>
      </div>

      <p-message severity="info">
        Acesse a aba "Vantagens" para comprar ou evoluir vantagens.
        Os pontos ficam disponíveis até serem gastos.
      </p-message>

      <div class="flex justify-content-end gap-2">
        <p-button
          label="Fechar e fazer depois"
          severity="secondary"
          [outlined]="true"
          (onClick)="fechar.emit()" />
        <p-button
          label="Ir para Vantagens"
          icon="pi pi-star-fill"
          (onClick)="irParaVantagens.emit()" />
      </div>
    </div>
  `,
})
export class LevelUpVantagensStepComponent {
  pontosVantagemDisponiveis = input.required<number>();

  irParaVantagens = output<void>();
  fechar = output<void>();
}
