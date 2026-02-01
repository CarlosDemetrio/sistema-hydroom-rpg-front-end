import { Injectable, signal } from '@angular/core';

/**
 * Loading Service
 *
 * Serviço global para gerenciar estado de loading
 * Usado pelo LoadingInterceptor automaticamente
 */
@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingCount = signal(0);

  /**
   * Signal indicando se há requisições em andamento
   */
  isLoading = signal(false);

  /**
   * Incrementa contador de loading
   */
  show() {
    this.loadingCount.update(count => count + 1);
    this.isLoading.set(true);
  }

  /**
   * Decrementa contador de loading
   * Só esconde quando todas as requisições terminarem
   */
  hide() {
    this.loadingCount.update(count => {
      const newCount = Math.max(0, count - 1);
      if (newCount === 0) {
        this.isLoading.set(false);
      }
      return newCount;
    });
  }

  /**
   * Força esconder loading (caso de erro crítico)
   */
  forceHide() {
    this.loadingCount.set(0);
    this.isLoading.set(false);
  }
}
