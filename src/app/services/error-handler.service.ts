import { Injectable, signal, inject } from '@angular/core';
import { ToastService } from './toast.service';

/**
 * Error Handler Service
 *
 * Gerencia erros da aplicação de forma centralizada
 * Usado pelo errorInterceptor automaticamente
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  private toastService = inject(ToastService);

  lastError = signal<string | null>(null);

  handleError(errorMessage: string) {
    this.lastError.set(errorMessage);

    console.error('Error:', errorMessage);

    // Mostra toast de erro usando ToastService centralizado
    this.toastService.error(errorMessage);
  }

  clearError() {
    this.lastError.set(null);
  }
}
