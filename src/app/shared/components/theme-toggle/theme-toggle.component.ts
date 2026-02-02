import { Component, inject, computed } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { ThemeService } from '../../../services/theme.service';

/**
 * Componente de toggle para alternar entre light e dark mode
 *
 * Features:
 * - Ícone dinâmico (sol/lua) baseado no tema atual
 * - Tooltip descritivo
 * - Animação suave de transição (via global styles)
 * - ZERO CSS customizado - apenas PrimeFlex
 */
@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [ButtonModule, Tooltip],
  template: `
    <p-button
      [icon]="themeIcon()"
      [pTooltip]="themeTooltip()"
      tooltipPosition="bottom"
      (onClick)="toggleTheme()"
      [text]="true"
      [rounded]="true"
      aria-label="Toggle theme"
    />
  `
})
export class ThemeToggleComponent {
  private themeService = inject(ThemeService);

  // Computed signals para ícone e tooltip
  themeIcon = computed(() =>
    this.themeService.isDarkMode() ? 'pi pi-sun' : 'pi pi-moon'
  );

  themeTooltip = computed(() =>
    this.themeService.isDarkMode() ? 'Mudar para modo claro' : 'Mudar para modo escuro'
  );

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
