import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

/**
 * Toast Service
 *
 * Serviço centralizado para exibir mensagens toast de forma consistente
 * em toda a aplicação. Todas as mensagens aparecem no centro da tela.
 *
 * @example
 * // Injetar o serviço
 * private toastService = inject(ToastService);
 *
 * // Usar os métodos
 * this.toastService.success('Operação realizada com sucesso!');
 * this.toastService.error('Erro ao processar requisição');
 * this.toastService.warning('Atenção: verifique os dados');
 * this.toastService.info('Informação importante');
 */
@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private messageService = inject(MessageService);

  /**
   * Exibe mensagem de sucesso
   * @param detail Mensagem detalhada
   * @param summary Título (opcional, padrão: 'Sucesso')
   * @param life Duração em ms (opcional, padrão: 5000)
   */
  success(detail: string, summary: string = 'Sucesso', life: number = 5000): void {
    this.messageService.add({
      severity: 'success',
      summary,
      detail,
      life
    });
  }

  /**
   * Exibe mensagem de erro
   * @param detail Mensagem detalhada
   * @param summary Título (opcional, padrão: 'Erro')
   * @param life Duração em ms (opcional, padrão: 7000)
   */
  error(detail: string, summary: string = 'Erro', life: number = 7000): void {
    this.messageService.add({
      severity: 'error',
      summary,
      detail,
      life
    });
  }

  /**
   * Exibe mensagem de aviso/warning
   * @param detail Mensagem detalhada
   * @param summary Título (opcional, padrão: 'Atenção')
   * @param life Duração em ms (opcional, padrão: 6000)
   */
  warning(detail: string, summary: string = 'Atenção', life: number = 6000): void {
    this.messageService.add({
      severity: 'warn',
      summary,
      detail,
      life
    });
  }

  /**
   * Exibe mensagem informativa
   * @param detail Mensagem detalhada
   * @param summary Título (opcional, padrão: 'Informação')
   * @param life Duração em ms (opcional, padrão: 5000)
   */
  info(detail: string, summary: string = 'Informação', life: number = 5000): void {
    this.messageService.add({
      severity: 'info',
      summary,
      detail,
      life
    });
  }

  /**
   * Exibe mensagem de contraste (PrimeNG specific)
   * @param detail Mensagem detalhada
   * @param summary Título (opcional)
   * @param life Duração em ms (opcional, padrão: 5000)
   */
  contrast(detail: string, summary: string = '', life: number = 5000): void {
    this.messageService.add({
      severity: 'contrast',
      summary,
      detail,
      life
    });
  }

  /**
   * Exibe mensagem secundária (PrimeNG specific)
   * @param detail Mensagem detalhada
   * @param summary Título (opcional)
   * @param life Duração em ms (opcional, padrão: 5000)
   */
  secondary(detail: string, summary: string = '', life: number = 5000): void {
    this.messageService.add({
      severity: 'secondary',
      summary,
      detail,
      life
    });
  }

  /**
   * Exibe toast especial de level up com estilo dourado
   */
  levelUp(nivelNovo: number, nomeFicha: string): void {
    this.messageService.add({
      severity: 'success',
      summary: `NÍVEL ${nivelNovo}!`,
      detail: `${nomeFicha} subiu para o Nível ${nivelNovo}! Distribua os pontos ganhos.`,
      life: 8000,
      styleClass: 'level-up-toast',
    });
  }

  /**
   * Limpa todas as mensagens
   */
  clear(): void {
    this.messageService.clear();
  }

  /**
   * Limpa uma mensagem específica por key
   * @param key Chave da mensagem
   */
  clearByKey(key: string): void {
    this.messageService.clear(key);
  }
}
