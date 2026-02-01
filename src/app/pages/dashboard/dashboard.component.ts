import { Component, inject, computed } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { MestreDashboardComponent } from '../../features/dashboard/mestre-dashboard/mestre-dashboard.component';
import { JogadorDashboardComponent } from '../../features/dashboard/jogador-dashboard/jogador-dashboard.component';

/**
 * Dashboard Component - Main Router
 *
 * Routes to appropriate dashboard based on user role
 * SMART COMPONENT - injects AuthService
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MestreDashboardComponent, JogadorDashboardComponent],
  template: `
    <div class="min-h-screen surface-ground p-4">
      @if (isMestre()) {
        <app-mestre-dashboard></app-mestre-dashboard>
      } @else if (isJogador()) {
        <app-jogador-dashboard></app-jogador-dashboard>
      } @else {
        <div class="text-center p-5">
          <p class="text-xl text-color-secondary">Nenhuma role atribuída</p>
        </div>
      }
    </div>
  `
})
export class DashboardComponent {
  private authService = inject(AuthService);

  isMestre = computed(() => this.authService.isMestre());
  isJogador = computed(() => this.authService.isJogador());
}
