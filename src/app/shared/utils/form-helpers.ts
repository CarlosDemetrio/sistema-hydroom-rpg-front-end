import { AbstractControl, FormGroup } from '@angular/forms';

/**
 * Marca todos os campos de um FormGroup como touched
 * Útil para exibir erros de validação após submit
 *
 * @param formGroup - FormGroup a ser marcado
 */
export function markFormGroupTouched(formGroup: FormGroup): void {
  Object.keys(formGroup.controls).forEach(key => {
    const control = formGroup.get(key);
    control?.markAsTouched();

    if (control instanceof FormGroup) {
      markFormGroupTouched(control);
    }
  });
}

/**
 * Retorna mensagem de erro formatada para um control
 *
 * @param control - Control do formulário
 * @returns Mensagem de erro ou null
 */
export function getErrorMessage(control: AbstractControl | null): string | null {
  if (!control || !control.errors) return null;

  const errors = control.errors;

  if (errors['required']) return 'Campo obrigatório';
  if (errors['minlength']) return `Mínimo de ${errors['minlength'].requiredLength} caracteres`;
  if (errors['maxlength']) return `Máximo de ${errors['maxlength'].requiredLength} caracteres`;
  if (errors['min']) return `Valor mínimo: ${errors['min'].min}`;
  if (errors['max']) return `Valor máximo: ${errors['max'].max}`;
  if (errors['pattern']) return 'Formato inválido';
  if (errors['email']) return 'Email inválido';
  if (errors['uniqueOrder']) return errors['uniqueOrder'];
  if (errors['uniqueName']) return errors['uniqueName'];
  if (errors['uppercase']) return errors['uppercase'];
  if (errors['progressive']) return errors['progressive'];

  return 'Valor inválido';
}
