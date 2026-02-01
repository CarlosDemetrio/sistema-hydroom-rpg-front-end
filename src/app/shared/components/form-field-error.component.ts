import { Component, input } from '@angular/core';

/**
 * Form Field Error Component (DUMB)
 *
 * Pure UI component - displays form validation errors
 * NO LOGIC - only receives inputs
 * Uses ONLY PrimeFlex classes (NEVER styleClass, NEVER custom CSS)
 *
 * Usage:
 * ```html
 * <app-form-field-error
 *   [errors]="form.get('nome')?.errors"
 *   [touched]="form.get('nome')?.touched"
 * />
 * ```
 */
@Component({
  selector: 'app-form-field-error',
  standalone: true,
  imports: [],
  template: `
    @if (touched() && errors()) {
      <div class="text-sm text-red-500 mt-1">
        @if (errors()?.['required']) {
          <span>Campo obrigatório</span>
        }
        @if (errors()?.['minlength']) {
          <span>Mínimo de {{ errors()?.['minlength'].requiredLength }} caracteres</span>
        }
        @if (errors()?.['maxlength']) {
          <span>Máximo de {{ errors()?.['maxlength'].requiredLength }} caracteres</span>
        }
        @if (errors()?.['email']) {
          <span>E-mail inválido</span>
        }
        @if (errors()?.['min']) {
          <span>Valor mínimo: {{ errors()?.['min'].min }}</span>
        }
        @if (errors()?.['max']) {
          <span>Valor máximo: {{ errors()?.['max'].max }}</span>
        }
        @if (errors()?.['pattern']) {
          <span>Formato inválido</span>
        }
      </div>
    }
  `
})
export class FormFieldErrorComponent {
  errors = input<Record<string, any> | null>(null);
  touched = input<boolean>(false);
}
