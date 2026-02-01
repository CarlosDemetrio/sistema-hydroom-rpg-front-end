import { ErrorHandler, Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Global Error Handler para capturar e tratar todos os erros da aplicação.
 * - Não expõe detalhes técnicos ao usuário
 * - Loga erros para monitoramento
 * - Redireciona para páginas de erro quando apropriado
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private router = inject(Router);

  handleError(error: Error | any): void {
    // Log para console (em produção, enviar para serviço de monitoramento)
    const errorMessage = this.getClientMessage(error);
    const stackTrace = this.getClientStack(error);

    console.error('Global Error:', {
      message: errorMessage,
      stack: stackTrace?.substring(0, 500), // Limitar tamanho do stack
      timestamp: new Date().toISOString()
    });

    // Redirecionar para página de erro se for erro crítico
    if (this.isCriticalError(error)) {
      this.router.navigate(['/error'], {
        queryParams: {
          code: 'UNEXPECTED_ERROR',
          message: 'Ocorreu um erro inesperado. Tente novamente.'
        }
      });
    }
  }

  /**
   * Extrai mensagem amigável do erro.
   */
  private getClientMessage(error: any): string {
    if (!error) {
      return 'Erro desconhecido';
    }

    if (error.rejection) {
      return error.rejection.message || error.rejection;
    }

    return error.message || error.toString();
  }

  /**
   * Extrai stack trace do erro.
   */
  private getClientStack(error: any): string | undefined {
    if (!error) {
      return undefined;
    }

    if (error.rejection) {
      return error.rejection.stack;
    }

    return error.stack;
  }

  /**
   * Verifica se é um erro crítico que requer redirecionamento.
   */
  private isCriticalError(error: any): boolean {
    // Não redirecionar para erros de rede (usuário pode tentar novamente)
    if (error?.status === 0 || error?.message?.includes('Http failure')) {
      return false;
    }

    // Não redirecionar para erros 4xx (erro do cliente)
    if (error?.status >= 400 && error?.status < 500) {
      return false;
    }

    // Redirecionar para erros 5xx ou erros não tratados
    return true;
  }
}
