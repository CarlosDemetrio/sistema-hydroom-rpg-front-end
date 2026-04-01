import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { BaseConfig, NamedConfig } from '@core/models/config-base.model';

/**
 * Validador que garante que a ordem de exibição é única
 *
 * @param existingItems - Lista de itens existentes
 * @param currentItemId - ID do item atual (null se criando)
 */
export function uniqueOrderValidator<T extends BaseConfig>(
  existingItems: T[],
  currentItemId: number | null = null
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const ordem = control.value;
    if (!ordem) return null;

    const duplicate = existingItems.find(
      item => item.ordemExibicao === ordem && item.id !== currentItemId
    );

    return duplicate ? { uniqueOrder: 'Esta ordem já está em uso' } : null;
  };
}

/**
 * Validador que garante que o nome é único no jogo
 *
 * @param existingItems - Lista de itens existentes
 * @param currentItemId - ID do item atual (null se criando)
 */
export function uniqueNameValidator<T extends NamedConfig>(
  existingItems: T[],
  currentItemId: number | null = null
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const nome = control.value;
    if (!nome) return null;

    const duplicate = existingItems.find(
      item => item.nome.toLowerCase() === nome.toLowerCase() && item.id !== currentItemId
    );

    return duplicate ? { uniqueName: 'Este nome já está em uso' } : null;
  };
}

/**
 * Validador que garante que o texto está em maiúsculas
 */
export function uppercaseValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    return value === value.toUpperCase()
      ? null
      : { uppercase: 'Deve estar em maiúsculas' };
  };
}

/**
 * Validador para garantir que valores são progressivos (ex: XP de níveis)
 *
 * @param items - Lista ordenada de itens
 * @param field - Campo a validar
 * @param currentIndex - Índice atual
 */
export function progressiveValueValidator<T>(
  items: T[],
  field: keyof T,
  currentIndex: number
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value || currentIndex === 0) return null;

    const previousItem = items[currentIndex - 1];
    if (!previousItem) return null;

    const previousValue = previousItem[field] as number;

    return value > previousValue
      ? null
      : { progressive: `Deve ser maior que ${previousValue}` };
  };
}
