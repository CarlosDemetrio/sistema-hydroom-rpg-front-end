import { Injectable, signal, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

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
  private messageService = inject(MessageService, { optional: true });

  lastError = signal<string | null>(null);

  handleError(errorMessage: string) {
    this.lastError.set(errorMessage);

    console.error('Error:', errorMessage);

    // Mostra toast se MessageService disponível
    this.messageService?.add({
      severity: 'error',
      summary: 'Erro',
      detail: errorMessage,
      life: 5000
    });
  }

  clearError() {
    this.lastError.set(null);
  }
}
