import { Component, inject, computed, effect } from '@angular/core';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { JogosStore } from '../../../core/stores/jogos.store';
import { FichasStore } from '../../../core/stores/fichas.store';
import { AuthService } from '../../../services/auth.service';

/**
 * Mestre Dashboard Component
 *
 * Dashboard for Mestre role with stats and quick actions
 * SMART COMPONENT - uses stores and business logic
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
              <div class="text-2xl font-bold">{{ totalJogos() }}</div>
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
              <div class="text-2xl font-bold">{{ totalJogadores() }}</div>
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
          <div class="col-12 md:col-6 lg:col-3">
            <p-card>
              <div class="flex flex-column align-items-center text-center gap-3 p-2">
                <i class="pi pi-plus-circle text-5xl text-primary"></i>
                <h3 class="text-xl font-semibold m-0">Novo Jogo</h3>
                <p class="text-sm text-color-secondary m-0">
                  Crie uma nova campanha
                </p>
                <p-button
                  label="Criar"
                  icon="pi pi-arrow-right"
                  class="w-full"
                  (onClick)="criarJogo()"
                ></p-button>
              </div>
            </p-card>
          </div>

          <div class="col-12 md:col-6 lg:col-3">
            <p-card>
              <div class="flex flex-column align-items-center text-center gap-3 p-2">
                <i class="pi pi-list text-5xl text-primary"></i>
                <h3 class="text-xl font-semibold m-0">Meus Jogos</h3>
                <p class="text-sm text-color-secondary m-0">
                  Gerencie suas campanhas
                </p>
                <p-button
                  label="Ver Todos"
                  icon="pi pi-arrow-right"
                  class="w-full"
                  [outlined]="true"
                  (onClick)="verJogos()"
                ></p-button>
              </div>
            </p-card>
          </div>

          <div class="col-12 md:col-6 lg:col-3">
            <p-card>
              <div class="flex flex-column align-items-center text-center gap-3 p-2">
                <i class="pi pi-cog text-5xl text-primary"></i>
                <h3 class="text-xl font-semibold m-0">Configurações</h3>
                <p class="text-sm text-color-secondary m-0">
                  Configure o sistema
                </p>
                <p-button
                  label="Configurar"
                  icon="pi pi-arrow-right"
                  class="w-full"
                  [outlined]="true"
                  (onClick)="verConfig()"
                ></p-button>
              </div>
            </p-card>
          </div>

          <div class="col-12 md:col-6 lg:col-3">
            <p-card>
              <div class="flex flex-column align-items-center text-center gap-3 p-2">
                <i class="pi pi-chart-line text-5xl text-primary"></i>
                <h3 class="text-xl font-semibold m-0">Relatórios</h3>
                <p class="text-sm text-color-secondary m-0">
                  Em desenvolvimento
                </p>
                <p-button
                  label="Em breve"
                  class="w-full"
                  [outlined]="true"
                  [disabled]="true"
                ></p-button>
              </div>
            </p-card>
          </div>
        </div>
      </div>

      <!-- Recent Games -->
      @if (jogosRecentes().length > 0) {
        <div class="col-12">
          <h2 class="text-2xl font-bold mb-3">Jogos Recentes</h2>
          <p-card>
            <div class="flex flex-column gap-3">
              @for (jogo of jogosRecentes(); track jogo.id) {
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
  private jogosStore = inject(JogosStore);
  private fichasStore = inject(FichasStore);
  private router = inject(Router);

  // Load data on init
  constructor() {
    effect(() => {
      this.jogosStore.loadJogos();
      this.fichasStore.loadFichas();
    });
  }

  // Computed stats
  totalJogos = computed(() => this.jogosStore.jogos().length);

  totalJogadores = computed(() => {
    const jogos = this.jogosStore.jogos();
    const uniqueJogadores = new Set<number>();
    jogos.forEach(jogo => {
      jogo.participantes?.forEach(p => {
        if (p.jogadorId) uniqueJogadores.add(p.jogadorId);
      });
    });
    return uniqueJogadores.size;
  });

  totalFichas = computed(() => this.fichasStore.fichas().length);

  jogosRecentes = computed(() => {
    return this.jogosStore.jogos()
      .slice()
      .sort((a, b) => new Date(b.dataCriacao || 0).getTime() - new Date(a.dataCriacao || 0).getTime())
      .slice(0, 5);
  });

  // Navigation methods
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
