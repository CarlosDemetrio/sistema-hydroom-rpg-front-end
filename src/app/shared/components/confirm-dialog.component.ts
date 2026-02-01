import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

/**
 * Confirm Dialog Component (DUMB)
 *
 * Pure UI component - displays confirmation dialog
 * NO LOGIC - only emits events
 * Uses ONLY PrimeFlex classes (NEVER styleClass, NEVER custom CSS)
 *
 * Usage:
 * ```html
 * <app-confirm-dialog
 *   [visible]="showDialog()"
 *   [header]="'Confirmar Exclusão'"
 *   [message]="'Deseja realmente excluir este item?'"
 *   [confirmLabel]="'Excluir'"
 *   [cancelLabel]="'Cancelar'"
 *   (onConfirm)="handleConfirm()"
 *   (onCancel)="handleCancel()"
 * />
 * ```
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [DialogModule, ButtonModule],
  template: `
    <p-dialog
      [visible]="visible()"
      [header]="header()"
      [modal]="true"
      [closable]="false"
      [style]="{ width: '28rem' }"
    >
      <div class="flex flex-column gap-3">
        <p class="m-0 text-color">{{ message() }}</p>

        <div class="flex justify-content-end gap-2 mt-3">
          <p-button
            [label]="cancelLabel()"
            [text]="true"
            severity="secondary"
            (onClick)="onCancel.emit()"
          />
          <p-button
            [label]="confirmLabel()"
            [severity]="severity()"
            (onClick)="onConfirm.emit()"
          />
        </div>
      </div>
    </p-dialog>
  `
})
export class ConfirmDialogComponent {
  visible = input.required<boolean>();
  header = input<string>('Confirmação');
  message = input.required<string>();
  confirmLabel = input<string>('Confirmar');
  cancelLabel = input<string>('Cancelar');
  severity = input<'success' | 'info' | 'warn' | 'danger' | 'help' | 'secondary' | 'contrast'>('danger');

  onConfirm = output<void>();
  onCancel = output<void>();
}
