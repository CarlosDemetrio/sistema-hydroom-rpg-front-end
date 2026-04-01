import { Component, inject, computed, effect, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '@services/auth.service';
import { FichaBusinessService } from '@core/services/business/ficha-business.service';
import { CurrentGameService } from '@core/services/current-game.service';

/**
 * Jogador Dashboard Component
 *
 * 🎯 FOCO: FICHAS do jogo atual
 *
 * Dashboard focado em:
 * - Minhas fichas do jogo selecionado
 * - Quick actions: Criar ficha, Ver todas
 * - Stats relevantes ao jogo atual
 */
@Component({
  selector: 'app-jogador-dashboard',
  standalone: true,
  imports: [CardModule, ButtonModule],
  template: `
    <div class="grid p-4">
      <!-- Navigation Bar -->
      <div class="col-12 mb-3">
        <p-button
          label="Voltar"
          icon="pi pi-arrow-left"
          [text]="true"
          (onClick)="voltarHome()"
          class="mb-2"
        ></p-button>
      </div>

      <!-- Welcome Header with gradient -->
      <div class="col-12 mb-3">
        <div class="p-5 border-round-xl bg-primary-reverse">
          <h1 class="text-4xl font-bold mb-2 text-primary">
            <i class="pi pi-user mr-2"></i>
            Bem-vindo, {{ authService.currentUser()?.name }}!
          </h1>
          @if (hasGame()) {
            <p class="text-xl m-0 flex align-items-center gap-2">
              <span class="text-color-secondary">Jogo:</span>
              <span class="font-bold text-primary">{{ currentGame()?.nome }}</span>
            </p>
          } @else {
            <p class="text-xl text-color-secondary m-0">
              <i class="pi pi-info-circle mr-2"></i>
              Selecione um jogo no topo da página para começar
            </p>
          }
        </div>
      </div>

      @if (hasGame()) {
        <!-- Stats Card -->
        <div class="col-12 md:col-6 lg:col-4">
          <p-card class="hover-lift">
            <div class="flex align-items-center gap-3">
              <div class="flex align-items-center justify-content-center border-circle bg-primary w-4rem h-4rem">
                <i class="pi pi-id-card text-2xl text-white"></i>
              </div>
              <div>
                <div class="text-3xl font-bold text-primary">{{ totalFichasNoJogo() }}</div>
                <div class="text-sm text-color-secondary font-semibold">Minhas Fichas neste Jogo</div>
              </div>
            </div>
          </p-card>
        </div>

        <!-- Quick Actions -->
        <div class="col-12 mt-4">
          <div class="flex justify-content-between align-items-center mb-4">
            <h2 class="text-2xl font-bold m-0 flex align-items-center gap-2">
              <i class="pi pi-id-card text-primary"></i>
              Minhas Fichas
            </h2>
            <p-button
              label="Nova Ficha"
              icon="pi pi-plus"
              [raised]="true"
              (onClick)="criarFicha()"
            ></p-button>
          </div>

          @if (fichasDoJogoAtual().length === 0) {
            <p-card>
              <div class="flex flex-column align-items-center text-center py-5">
                <div class="flex align-items-center justify-content-center border-circle bg-primary-reverse w-8rem h-8rem mb-4">
                  <i class="pi pi-inbox text-6xl text-primary"></i>
                </div>
                <h3 class="text-2xl font-bold mb-3 text-primary">Nenhuma ficha neste jogo</h3>
                <p class="text-lg text-color-secondary mb-4 max-w-30rem">
                  Crie sua primeira ficha para começar a jogar e embarcar em incríveis aventuras!
                </p>
                <p-button
                  label="Criar Primeira Ficha"
                  icon="pi pi-plus"
                  [raised]="true"
                  (onClick)="criarFicha()"
                ></p-button>
              </div>
            </p-card>
          } @else {
            <div class="grid">
              @for (ficha of fichasRecentes(); track ficha.id) {
                <div class="col-12 md:col-6 lg:col-4">
                  <p-card class="hover-lift h-full">
                    <div class="flex flex-column gap-3">
                      <div class="flex justify-content-between align-items-start">
                        <div class="flex align-items-center gap-3">
                          <div class="flex align-items-center justify-content-center border-circle bg-primary w-3rem h-3rem">
                            <i class="pi pi-user text-white"></i>
                          </div>
                          <h3 class="font-bold text-xl m-0 text-primary">{{ ficha.nome }}</h3>
                        </div>
                        @if (ficha.progressao) {
                          <span class="text-sm bg-primary text-white border-round-lg px-3 py-1 font-semibold">
                            Nível {{ ficha.progressao.nivel }}
                          </span>
                        }
                      </div>

                      @if (ficha.identificacao) {
                        <div class="flex flex-column gap-2">
                          <p class="text-color-secondary m-0 flex align-items-center gap-2">
                            <i class="pi pi-map-marker text-primary"></i>
                            <span>{{ ficha.identificacao.origem || 'Origem não definida' }}</span>
                          </p>
                        </div>
                      }

                      <div class="flex gap-2 mt-2">
                        <p-button
                          label="Ver"
                          icon="pi pi-eye"
                          [text]="true"
                          class="flex-1"
                          (onClick)="verFicha(ficha.id!)"
                        ></p-button>
                        <p-button
                          label="Editar"
                          icon="pi pi-pencil"
                          [text]="true"
                          class="flex-1"
                          (onClick)="editarFicha(ficha.id!)"
                        ></p-button>
                      </div>
                    </div>
                  </p-card>
                </div>
              }
            </div>

            @if (totalFichasNoJogo() > 5) {
              <div class="col-12 text-center mt-3">
                <p-button
                  label="Ver Todas as Fichas"
                  icon="pi pi-arrow-right"
                  [text]="true"
                  (onClick)="verFichas()"
                ></p-button>
              </div>
            }
          }
        </div>
      } @else {
        <!-- No Game Selected -->
        <div class="col-12">
          <p-card>
            <div class="text-center py-6">
              <i class="pi pi-info-circle text-6xl text-color-secondary mb-4"></i>
              <h2 class="text-2xl font-semibold mb-2">Nenhum jogo selecionado</h2>
              <p class="text-color-secondary mb-4">
                Selecione um jogo no menu superior para ver suas fichas e começar a jogar.
              </p>
              <p-button
                label="Buscar Jogos"
                icon="pi pi-search"
                (onClick)="buscarJogos()"
              ></p-button>
            </div>
          </p-card>
        </div>
      }
    </div>
  `
})
export class JogadorDashboardComponent {
  authService = inject(AuthService);
  private fichaService = inject(FichaBusinessService);
  private currentGameService = inject(CurrentGameService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  // Jogo atual
  currentGame = this.currentGameService.currentGame;
  hasGame = this.currentGameService.hasCurrentGame;

  // Fichas do jogo atual
  fichasDoJogoAtual = computed(() => {
    const gameId = this.currentGameService.currentGameId();
    if (!gameId) return [];

    const userId = this.authService.currentUser()?.id;
    if (!userId) return [];

    return this.fichaService.fichas().filter(f =>
      f.jogoId === gameId &&
      f.jogadorId === Number(userId)
    );
  });

  // Stats
  totalFichasNoJogo = computed(() => this.fichasDoJogoAtual().length);

  fichasRecentes = computed(() => {
    return this.fichasDoJogoAtual()
      .slice()
      .sort((a, b) => new Date(b.dataUltimaAtualizacao || 0).getTime() - new Date(a.dataUltimaAtualizacao || 0).getTime())
      .slice(0, 5);
  });

  // Load data on init
  constructor() {
    effect(() => {
      const gameId = this.currentGameService.currentGameId();
      if (gameId) {
        this.fichaService.loadFichas(gameId).pipe(
          takeUntilDestroyed(this.destroyRef)
        ).subscribe();
      }
    });
  }

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

  voltarHome() {
    this.router.navigate(['/']);
  }

  verFicha(id: number) {
    this.router.navigate(['/jogador/fichas', id]);
  }

  editarFicha(id: number) {
    this.router.navigate(['/jogador/fichas', id, 'edit']);
  }
}
