import { Component, inject, computed, effect } from '@angular/core';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { FichasStore } from '../../../core/stores/fichas.store';
import { JogosStore } from '../../../core/stores/jogos.store';
import { AuthService } from '../../../services/auth.service';

/**
 * Jogador Dashboard Component
 *
 * Dashboard for Jogador role with character stats and quick actions
 * SMART COMPONENT - uses stores and business logic
 */
@Component({
  selector: 'app-jogador-dashboard',
  standalone: true,
  imports: [CardModule, ButtonModule],
  template: `
    <div class="grid">
      <!-- Welcome Header -->
      <div class="col-12">
        <h1 class="text-4xl font-bold mb-2">
          Bem-vindo, {{ authService.currentUser()?.name }}!
        </h1>
        <p class="text-xl text-color-secondary mb-4">
          Suas aventuras aguardam!
        </p>
      </div>

      <!-- Stats Cards -->
      <div class="col-12 md:col-4">
        <p-card>
          <div class="flex align-items-center gap-3">
            <div class="flex align-items-center justify-content-center bg-primary border-round" [style]="{ width: '3rem', height: '3rem' }">
              <i class="pi pi-id-card text-2xl text-primary-contrast"></i>
            </div>
            <div>
              <div class="text-2xl font-bold">{{ totalFichas() }}</div>
              <div class="text-sm text-color-secondary">Personagens</div>
            </div>
          </div>
        </p-card>
      </div>

      <div class="col-12 md:col-4">
        <p-card>
          <div class="flex align-items-center gap-3">
            <div class="flex align-items-center justify-content-center bg-green-500 border-round" [style]="{ width: '3rem', height: '3rem' }">
              <i class="pi pi-check-circle text-2xl" [style]="{ color: 'white' }"></i>
            </div>
            <div>
              <div class="text-2xl font-bold">{{ jogosAtivos() }}</div>
              <div class="text-sm text-color-secondary">Jogos Ativos</div>
            </div>
          </div>
        </p-card>
      </div>

      <div class="col-12 md:col-4">
        <p-card>
          <div class="flex align-items-center gap-3">
            <div class="flex align-items-center justify-content-center bg-orange-500 border-round" [style]="{ width: '3rem', height: '3rem' }">
              <i class="pi pi-clock text-2xl" [style]="{ color: 'white' }"></i>
            </div>
            <div>
              <div class="text-2xl font-bold">{{ solicitacoesPendentes() }}</div>
              <div class="text-sm text-color-secondary">Pendentes</div>
            </div>
          </div>
        </p-card>
      </div>

      <!-- Quick Actions -->
      <div class="col-12">
        <h2 class="text-2xl font-bold mb-3">Ações Rápidas</h2>
        <div class="grid">
          <div class="col-12 md:col-6 lg:col-4">
            <p-card>
              <div class="flex flex-column align-items-center text-center gap-3 p-2">
                <i class="pi pi-plus-circle text-5xl text-primary"></i>
                <h3 class="text-xl font-semibold m-0">Nova Ficha</h3>
                <p class="text-sm text-color-secondary m-0">
                  Crie um novo personagem
                </p>
                <p-button
                  label="Criar"
                  icon="pi pi-arrow-right"
                  class="w-full"
                  (onClick)="criarFicha()"
                ></p-button>
              </div>
            </p-card>
          </div>

          <div class="col-12 md:col-6 lg:col-4">
            <p-card>
              <div class="flex flex-column align-items-center text-center gap-3 p-2">
                <i class="pi pi-list text-5xl text-primary"></i>
                <h3 class="text-xl font-semibold m-0">Minhas Fichas</h3>
                <p class="text-sm text-color-secondary m-0">
                  Veja todos os personagens
                </p>
                <p-button
                  label="Ver Fichas"
                  icon="pi pi-arrow-right"
                  class="w-full"
                  [outlined]="true"
                  (onClick)="verFichas()"
                ></p-button>
              </div>
            </p-card>
          </div>

          <div class="col-12 md:col-6 lg:col-4">
            <p-card>
              <div class="flex flex-column align-items-center text-center gap-3 p-2">
                <i class="pi pi-search text-5xl text-primary"></i>
                <h3 class="text-xl font-semibold m-0">Buscar Jogos</h3>
                <p class="text-sm text-color-secondary m-0">
                  Encontre campanhas abertas
                </p>
                <p-button
                  label="Buscar"
                  icon="pi pi-arrow-right"
                  class="w-full"
                  [outlined]="true"
                  (onClick)="buscarJogos()"
                ></p-button>
              </div>
            </p-card>
          </div>
        </div>
      </div>

      <!-- Recent Characters -->
      @if (fichasRecentes().length > 0) {
        <div class="col-12">
          <h2 class="text-2xl font-bold mb-3">Personagens Recentes</h2>
          <p-card>
            <div class="flex flex-column gap-3">
              @for (ficha of fichasRecentes(); track ficha.id) {
                <div class="flex justify-content-between align-items-center p-3 surface-100 border-round">
                  <div>
                    <div class="font-bold text-lg">{{ ficha.nome }}</div>
                    <div class="text-sm text-color-secondary">
                      Nível {{ ficha.progressao?.nivel || 1 }}
                    </div>
                  </div>
                  <p-button
                    label="Ver Ficha"
                    icon="pi pi-arrow-right"
                    [text]="true"
                    (onClick)="verFicha(ficha.id!)"
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
export class JogadorDashboardComponent {
  authService = inject(AuthService);
  private fichasStore = inject(FichasStore);
  private jogosStore = inject(JogosStore);
  private router = inject(Router);

  // Load data on init
  constructor() {
    effect(() => {
      this.fichasStore.loadFichas();
      this.jogosStore.loadJogos();
    });
  }

  // Computed stats
  totalFichas = computed(() => this.fichasStore.fichas().length);

  jogosAtivos = computed(() => {
    const userId = this.authService.currentUser()?.id;
    if (!userId) return 0;

    return this.jogosStore.jogos().filter(jogo =>
      jogo.status === 'ATIVO' &&
      jogo.participantes?.some(p => p.jogadorId === Number(userId) && p.status === 'APROVADO')
    ).length;
  });

  solicitacoesPendentes = computed(() => {
    const userId = this.authService.currentUser()?.id;
    if (!userId) return 0;

    return this.jogosStore.jogos().filter(jogo =>
      jogo.participantes?.some(p => p.jogadorId === Number(userId) && p.status === 'PENDENTE')
    ).length;
  });

  fichasRecentes = computed(() => {
    return this.fichasStore.fichas()
      .slice()
      .sort((a, b) => (b.id || 0) - (a.id || 0))
      .slice(0, 5);
  });

  // Navigation methods
  criarFicha() {
    this.router.navigate(['/jogador/fichas/nova']);
  }

  verFichas() {
    this.router.navigate(['/jogador/fichas']);
  }

  buscarJogos() {
    this.router.navigate(['/jogador/jogos']);
  }

  verFicha(id: number) {
    this.router.navigate(['/jogador/fichas', id]);
  }
}
