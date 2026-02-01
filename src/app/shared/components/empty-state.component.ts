import { Component, input } from '@angular/core';

/**
 * Empty State Component (DUMB)
 *
 * Pure UI component - displays empty state with icon and message
 * NO LOGIC - only receives inputs
 * Uses ONLY PrimeFlex classes (NEVER styleClass, NEVER custom CSS)
 *
 * Usage:
 * ```html
 * <app-empty-state
 *   [icon]="'pi pi-inbox'"
 *   [message]="'Nenhum item encontrado'"
 *   [description]="'Clique no botão para adicionar o primeiro item'"
 * />
 * ```
 */
@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [],
  template: `
    <div class="flex flex-column align-items-center justify-content-center gap-3 p-6 text-center">
      @if (icon()) {
        <i [class]="icon() + ' text-6xl text-color-secondary'"></i>
      }

      <div class="flex flex-column gap-2">
        <h3 class="text-xl font-semibold m-0 text-color">{{ message() }}</h3>

        @if (description()) {
          <p class="text-base text-color-secondary m-0">{{ description() }}</p>
        }
      </div>
    </div>
  `
})
export class EmptyStateComponent {
  icon = input<string>('pi pi-inbox');
  message = input<string>('Nenhum item encontrado');
  description = input<string>('');
}
