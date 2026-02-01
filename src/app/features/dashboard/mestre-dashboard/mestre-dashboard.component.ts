import { Component, inject, effect } from '@angular/core';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { JogoManagementFacadeService } from '../../mestre/services/jogo-management-facade.service';
import { FichasStore } from '../../../core/stores/fichas.store';
import { AuthService } from '../../../services/auth.service';

/**
 * Mestre Dashboard Component
 *
 * Dashboard for Mestre role with stats and quick actions
 * SMART COMPONENT - usa Facade Service
 */
@Component({
  selector: 'app-mestre-dashboard',
  standalone: true,
  imports: [CardModule, ButtonModule],
  template: `
    <div class="grid">
      <!-- Welcome Header -->
      <div class="col-12">
        <h1 class="text-4xl font-bold mb-2">
          Bem-vindo, Mestre {{ authService.currentUser()?.name }}!
        </h1>
        <p class="text-xl text-color-secondary mb-4">
          Gerencie suas campanhas e acompanhe seus jogadores
        </p>
      </div>

      <!-- Stats Cards -->
      <div class="col-12 md:col-4">
        <p-card>
          <div class="flex align-items-center gap-3">
            <div class="flex align-items-center justify-content-center bg-primary border-round" [style]="{ width: '3rem', height: '3rem' }">
              <i class="pi pi-book text-2xl text-primary-contrast"></i>
            </div>
            <div>
              <div class="text-2xl font-bold">{{ jogoFacade.totalJogos() }}</div>
              <div class="text-sm text-color-secondary">Jogos Criados</div>
            </div>
          </div>
        </p-card>
      </div>

      <div class="col-12 md:col-4">
        <p-card>
          <div class="flex align-items-center gap-3">
            <div class="flex align-items-center justify-content-center bg-green-500 border-round" [style]="{ width: '3rem', height: '3rem' }">
              <i class="pi pi-users text-2xl" [style]="{ color: 'white' }"></i>
            </div>
            <div>
              <div class="text-2xl font-bold">{{ jogoFacade.totalJogadores() }}</div>
              <div class="text-sm text-color-secondary">Jogadores Ativos</div>
            </div>
          </div>
        </p-card>
      </div>

      <div class="col-12 md:col-4">
        <p-card>
          <div class="flex align-items-center gap-3">
            <div class="flex align-items-center justify-content-center bg-orange-500 border-round" [style]="{ width: '3rem', height: '3rem' }">
              <i class="pi pi-id-card text-2xl" [style]="{ color: 'white' }"></i>
            </div>
            <div>
              <div class="text-2xl font-bold">{{ totalFichas() }}</div>
              <div class="text-sm text-color-secondary">Fichas Criadas</div>
            </div>
          </div>
        </p-card>
      </div>

      <!-- Quick Actions -->
      <div class="col-12">
        <h2 class="text-2xl font-bold mb-3">Ações Rápidas</h2>
        <div class="grid">
          <!-- ...existing quick action cards... -->
        </div>
      </div>

      <!-- Recent Games -->
      @if (jogoFacade.jogosRecentes().length > 0) {
        <div class="col-12">
          <h2 class="text-2xl font-bold mb-3">Jogos Recentes</h2>
          <p-card>
            <div class="flex flex-column gap-3">
              @for (jogo of jogoFacade.jogosRecentes(); track jogo.id) {
                <div class="flex justify-content-between align-items-center p-3 surface-100 border-round">
                  <div>
                    <div class="font-bold text-lg">{{ jogo.nome }}</div>
                    <div class="text-sm text-color-secondary">
                      {{ jogo.participantes?.length || 0 }} jogadores
                    </div>
                  </div>
                  <p-button
                    label="Ver Detalhes"
                    icon="pi pi-arrow-right"
                    [text]="true"
                    (onClick)="verJogo(jogo.id!)"
                  ></p-button>
                </div>
              }
            </div>
          </p-card>
        </div>
      }
    </div>
  `
})
export class MestreDashboardComponent {
  authService = inject(AuthService);
  jogoFacade = inject(JogoManagementFacadeService);
  private fichasStore = inject(FichasStore);
  private router = inject(Router);

  totalFichas = this.fichasStore.fichas;

  // Load data on init
  constructor() {
    effect(() => {
      this.jogoFacade.loadJogos();
      this.jogoFacade.loadFichas();
    });
  }

  // ...existing navigation methods...
  criarJogo() {
    this.router.navigate(['/mestre/jogos/novo']);
  }

  verJogos() {
    this.router.navigate(['/mestre/jogos']);
  }

  verConfig() {
    this.router.navigate(['/mestre/config']);
  }

  verJogo(id: number) {
    this.router.navigate(['/mestre/jogos', id]);
  }
}
