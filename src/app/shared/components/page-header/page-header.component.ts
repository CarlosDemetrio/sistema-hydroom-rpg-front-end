import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

/**
 * PageHeaderComponent (DUMB)
 *
 * Cabeçalho de página reutilizável com botão voltar e título.
 *
 * Usage:
 * ```html
 * <app-page-header title="Meus Jogos" />
 * <app-page-header title="Detalhes" backRoute="/mestre/jogos" />
 * ```
 *
 * - Se backRoute for null ou omitido: usa location.back()
 * - Se backRoute for string: navega para a rota fornecida
 */
@Component({
  selector: 'app-page-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonModule],
  template: `
    <div class="flex align-items-center gap-3 mb-4">
      <p-button
        icon="pi pi-arrow-left"
        [text]="true"
        severity="secondary"
        [rounded]="true"
        (onClick)="voltar()"
        [attr.aria-label]="'Voltar'"
        pTooltip="Voltar"
        tooltipPosition="right"
      />
      <h1 class="text-3xl font-bold m-0">{{ title() }}</h1>
    </div>
  `,
})
export class PageHeaderComponent {
  title = input.required<string>();
  backRoute = input<string | null>(null);

  private location = inject(Location);
  private router = inject(Router);

  voltar(): void {
    const route = this.backRoute();
    if (route) {
      this.router.navigate([route]);
    } else {
      this.location.back();
    }
  }
}
