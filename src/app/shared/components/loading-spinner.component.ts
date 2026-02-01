import { Component, input } from '@angular/core';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

/**
 * Loading Spinner Component (DUMB)
 *
 * Pure UI component - displays loading state
 * NO LOGIC - only receives inputs
 * Uses ONLY PrimeFlex classes (NEVER styleClass)
 */
@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [ProgressSpinnerModule],
  template: `
    <div class="flex flex-column align-items-center justify-content-center gap-3 p-5">
      <p-progressSpinner
        [style]="{ width: '4rem', height: '4rem' }"
        strokeWidth="4"
        animationDuration="1s"
      />
      @if (message()) {
        <p class="text-lg text-color-secondary m-0">{{ message() }}</p>
      }
    </div>
  `
})
export class LoadingSpinnerComponent {
  /**
   * Optional loading message to display
   */
  message = input<string>('');
}
