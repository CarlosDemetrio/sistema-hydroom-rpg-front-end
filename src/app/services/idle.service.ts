import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Service para detectar inatividade do usuário e fazer logout automático.
 * Proteção adicional de segurança - sessão expira após 30 minutos de inatividade.
 */
@Injectable({
  providedIn: 'root'
})
export class IdleService {
  private authService = inject(AuthService);
  private router = inject(Router);

  private idleTimeout = 30 * 60 * 1000; // 30 minutos (igual ao backend)
  private warningTimeout = 28 * 60 * 1000; // Aviso 2 minutos antes
  private idleTimer: any;
  private warningTimer: any;

  // Signal para mostrar modal de aviso
  public showIdleWarning = signal(false);

  // Eventos que resetam o timer de inatividade
  private events = ['click', 'keypress', 'mousemove', 'scroll', 'touchstart'];

  /**
   * Inicia o monitoramento de inatividade.
   * Chamar no AppComponent após login.
   */
  startWatching() {
    this.stopWatching(); // Limpar timers anteriores
    this.resetTimer();

    // Adicionar listeners de atividade
    this.events.forEach(event => {
      window.addEventListener(event, () => this.onActivity(), { passive: true });
    });
  }

  /**
   * Para o monitoramento de inatividade.
   * Chamar no logout.
   */
  stopWatching() {
    clearTimeout(this.idleTimer);
    clearTimeout(this.warningTimer);
    this.showIdleWarning.set(false);

    // Remover listeners
    this.events.forEach(event => {
      window.removeEventListener(event, () => this.onActivity());
    });
  }

  /**
   * Chamado quando há atividade do usuário.
   */
  private onActivity() {
    // Se estava mostrando aviso, esconder
    if (this.showIdleWarning()) {
      this.showIdleWarning.set(false);
    }

    this.resetTimer();
  }

  /**
   * Reseta os timers de inatividade.
   */
  private resetTimer() {
    clearTimeout(this.idleTimer);
    clearTimeout(this.warningTimer);

    // Timer de aviso (2 minutos antes)
    this.warningTimer = setTimeout(() => {
      this.showWarning();
    }, this.warningTimeout);

    // Timer de logout automático
    this.idleTimer = setTimeout(() => {
      this.autoLogout();
    }, this.idleTimeout);
  }

  /**
   * Mostra aviso de inatividade.
   */
  private showWarning() {
    this.showIdleWarning.set(true);
    console.warn('⚠️ Sessão expirará em 2 minutos por inatividade');
  }

  /**
   * Realiza logout automático por inatividade.
   */
  private autoLogout() {
    console.log('🔒 Logout automático por inatividade');
    this.stopWatching();
    this.showIdleWarning.set(false);

    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login'], {
          queryParams: { reason: 'idle' }
        });
      },
      error: (err) => {
        console.error('Erro ao fazer logout:', err);
        // Mesmo com erro, limpar estado local
        this.authService.setCurrentUser(null);
        this.router.navigate(['/login'], {
          queryParams: { reason: 'idle' }
        });
      }
    });
  }

  /**
   * Estender sessão (usuário clicou em "Continuar conectado").
   */
  extendSession() {
    this.showIdleWarning.set(false);
    this.resetTimer();
  }
}
