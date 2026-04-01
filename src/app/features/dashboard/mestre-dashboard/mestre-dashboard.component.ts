import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { JogoManagementFacadeService } from '@features/mestre/services/jogo-management-facade.service';
import { FichasStore } from '@core/stores/fichas.store';
import { AuthService } from '@services/auth.service';

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
    <div class="grid p-4">
      <!-- Welcome Header with gradient -->
      <div class="col-12 mb-3">
        <div class="p-5 border-round-xl bg-primary-reverse">
          <h1 class="text-4xl font-bold mb-2 text-primary">
            <i class="pi pi-crown mr-2"></i>
            Bem-vindo, Mestre {{ authService.currentUser()?.name }}!
          </h1>
          <p class="text-xl text-color-secondary m-0">
            Gerencie suas campanhas e acompanhe seus jogadores
          </p>
        </div>
      </div>

      <!-- Stats Cards with Sky colors -->
      <div class="col-12 md:col-4">
        <p-card class="hover-lift">
          <div class="flex align-items-center gap-3">
            <div class="flex align-items-center justify-content-center border-circle bg-primary w-4rem h-4rem">
              <i class="pi pi-book text-2xl text-white"></i>
            </div>
            <div>
              <div class="text-3xl font-bold text-primary">{{ jogoFacade.totalJogos() }}</div>
              <div class="text-sm text-color-secondary font-semibold">Jogos Criados</div>
            </div>
          </div>
        </p-card>
      </div>

      <div class="col-12 md:col-4">
        <p-card class="hover-lift">
          <div class="flex align-items-center gap-3">
            <div class="flex align-items-center justify-content-center border-circle bg-green-500 w-4rem h-4rem">
              <i class="pi pi-users text-2xl text-white"></i>
            </div>
            <div>
              <div class="text-3xl font-bold text-green-600">{{ jogoFacade.totalJogadores() }}</div>
              <div class="text-sm text-color-secondary font-semibold">Jogadores Ativos</div>
            </div>
          </div>
        </p-card>
      </div>

      <div class="col-12 md:col-4">
        <p-card class="hover-lift">
          <div class="flex align-items-center gap-3">
            <div class="flex align-items-center justify-content-center border-circle bg-orange-500 w-4rem h-4rem">
              <i class="pi pi-id-card text-2xl text-white"></i>
            </div>
            <div>
              <div class="text-3xl font-bold text-orange-600">{{ totalFichas() }}</div>
              <div class="text-sm text-color-secondary font-semibold">Fichas Criadas</div>
            </div>
          </div>
        </p-card>
      </div>

      <!-- Quick Actions - SEMPRE VISÍVEL -->
      <div class="col-12 mt-4">
        <h2 class="text-2xl font-bold mb-4 flex align-items-center gap-2">
          <i class="pi pi-bolt text-primary"></i>
          Ações Rápidas
        </h2>
        <div class="grid">
          <div class="col-12 md:col-4">
            <p-card class="hover-lift cursor-pointer h-full" (click)="criarJogo()">
              <div class="flex flex-column align-items-center text-center gap-3 py-3">
                <div class="flex align-items-center justify-content-center border-circle bg-primary w-5rem h-5rem">
                  <i class="pi pi-plus text-3xl text-white"></i>
                </div>
                <h3 class="text-xl font-bold m-0 text-primary">Criar Novo Jogo</h3>
                <p class="text-color-secondary m-0">Comece uma nova campanha</p>
              </div>
            </p-card>
          </div>

          <div class="col-12 md:col-4">
            <p-card class="hover-lift cursor-pointer h-full" (click)="verJogos()">
              <div class="flex flex-column align-items-center text-center gap-3 py-3">
                <div class="flex align-items-center justify-content-center border-circle bg-primary w-5rem h-5rem">
                  <i class="pi pi-list text-3xl text-white"></i>
                </div>
                <h3 class="text-xl font-bold m-0 text-primary">Ver Todos os Jogos</h3>
                <p class="text-color-secondary m-0">Gerencie suas campanhas</p>
              </div>
            </p-card>
          </div>

          <div class="col-12 md:col-4">
            <p-card class="hover-lift cursor-pointer h-full" (click)="verConfig()">
              <div class="flex flex-column align-items-center text-center gap-3 py-3">
                <div class="flex align-items-center justify-content-center border-circle bg-primary w-5rem h-5rem">
                  <i class="pi pi-cog text-3xl text-white"></i>
                </div>
                <h3 class="text-xl font-bold m-0 text-primary">Configurações</h3>
                <p class="text-color-secondary m-0">Customize seu sistema</p>
              </div>
            </p-card>
          </div>
        </div>
      </div>

      <!-- Recent Games - APENAS SE HOUVER JOGOS -->
      @if (jogoFacade.jogosRecentes().length > 0) {
        <div class="col-12 mt-4">
          <h2 class="text-2xl font-bold mb-4 flex align-items-center gap-2">
            <i class="pi pi-clock text-primary"></i>
            Jogos Recentes
          </h2>
          <p-card>
            <div class="flex flex-column gap-3">
              @for (jogo of jogoFacade.jogosRecentes(); track jogo.id) {
                <div class="flex justify-content-between align-items-center p-4 surface-100 border-round-lg hover-lift smooth-transition">
                  <div class="flex align-items-center gap-3">
                    <div class="flex align-items-center justify-content-center border-circle bg-primary w-3rem h-3rem">
                      <i class="pi pi-book text-white"></i>
                    </div>
                    <div>
                      <div class="font-bold text-xl text-primary">{{ jogo.nome }}</div>
                      <div class="text-sm text-color-secondary flex align-items-center gap-2">
                        <i class="pi pi-users"></i>
                        {{ jogo.participantes?.length || 0 }} jogadores
                      </div>
                    </div>
                  </div>
                  <p-button
                    label="Ver Detalhes"
                    icon="pi pi-arrow-right"
                    iconPos="right"
                    [outlined]="true"
                    (onClick)="verJogo(jogo.id!)"
                  ></p-button>
                </div>
              }
            </div>
          </p-card>
        </div>
      } @else {
        <!-- Empty State quando não há jogos -->
        <div class="col-12 mt-4">
          <p-card>
            <div class="flex flex-column align-items-center text-center gap-4 py-5">
              <div class="flex align-items-center justify-content-center border-circle bg-primary-50 w-8rem h-8rem">
                <i class="pi pi-book text-6xl text-primary"></i>
              </div>
              <h3 class="text-2xl font-bold m-0 text-primary">Nenhum Jogo Criado Ainda</h3>
              <p class="text-xl text-color-secondary m-0 max-w-30rem">
                Comece criando seu primeiro jogo! Após criar, você poderá configurar atributos, classes, raças e muito mais.
              </p>
              <div class="flex flex-column gap-2 align-items-center">
                <p-button
                  label="Criar Primeiro Jogo"
                  icon="pi pi-plus"
                  size="large"
                  (onClick)="criarJogo()"
                ></p-button>
                <p class="text-sm text-color-secondary m-0">
                  <i class="pi pi-info-circle mr-1"></i>
                  Após criar um jogo, ele será automaticamente selecionado como o jogo atual
                </p>
              </div>
            </div>
          </p-card>
        </div>
      }
    </div>
  `
})
export class MestreDashboardComponent implements OnInit {
  authService = inject(AuthService);
  jogoFacade = inject(JogoManagementFacadeService);
  private fichasStore = inject(FichasStore);
  private router = inject(Router);

  totalFichas = this.fichasStore.fichas;

  ngOnInit() {
    // Carrega jogos ao inicializar
    this.jogoFacade.loadJogos().subscribe();
  }

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
