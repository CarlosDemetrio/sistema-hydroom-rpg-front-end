import { Component, inject, computed, effect, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../../services/auth.service';
import { FichaBusinessService } from '../../../core/services/business/ficha-business.service';
import { CurrentGameService } from '../../../core/services/current-game.service';

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
      <!-- Welcome Header -->
      <div class="col-12">
        <h1 class="text-4xl font-bold mb-2">
          Bem-vindo, {{ authService.currentUser()?.name }}!
        </h1>
        @if (hasGame()) {
          <p class="text-xl text-color-secondary mb-4">
            Jogo: <span class="font-semibold">{{ currentGame()?.nome }}</span>
          </p>
        } @else {
          <p class="text-xl text-color-secondary mb-4">
            Selecione um jogo no topo da página para começar
          </p>
        }
      </div>

      @if (hasGame()) {
        <!-- Stats Card -->
        <div class="col-12 md:col-6">
          <p-card>
            <div class="flex align-items-center gap-3">
              <div class="flex align-items-center justify-content-center bg-primary border-round w-4rem h-4rem">
                <i class="pi pi-id-card text-2xl text-primary-contrast"></i>
              </div>
              <div>
                <div class="text-2xl font-bold">{{ totalFichasNoJogo() }}</div>
                <div class="text-sm text-color-secondary">Minhas Fichas neste Jogo</div>
              </div>
            </div>
          </p-card>
        </div>

        <!-- Quick Actions -->
        <div class="col-12">
          <div class="flex justify-content-between align-items-center mb-3">
            <h2 class="text-2xl font-bold m-0">Minhas Fichas</h2>
            <p-button
              label="Nova Ficha"
              icon="pi pi-plus"
              (onClick)="criarFicha()"
            ></p-button>
          </div>

          @if (fichasDoJogoAtual().length === 0) {
            <p-card>
              <div class="text-center py-4">
                <i class="pi pi-inbox text-6xl text-color-secondary mb-3"></i>
                <p class="text-xl font-semibold mb-2">Nenhuma ficha neste jogo</p>
                <p class="text-color-secondary mb-3">Crie sua primeira ficha para começar a jogar!</p>
                <p-button
                  label="Criar Primeira Ficha"
                  icon="pi pi-plus"
                  (onClick)="criarFicha()"
                ></p-button>
              </div>
            </p-card>
          } @else {
            <div class="grid">
              @for (ficha of fichasRecentes(); track ficha.id) {
                <div class="col-12 md:col-6 lg:col-4">
                  <p-card>
                    <div class="flex flex-column gap-2">
                      <div class="flex justify-content-between align-items-center">
                        <h3 class="font-bold text-xl m-0">{{ ficha.nome }}</h3>
                        @if (ficha.progressao) {
                          <span class="text-sm bg-primary-reverse text-primary border-round px-2 py-1">
                            Nível {{ ficha.progressao.nivel }}
                          </span>
                        }
                      </div>

                      @if (ficha.identificacao) {
                        <p class="text-sm text-color-secondary m-0">
                          {{ ficha.identificacao.origem || 'Origem não definida' }}
                        </p>
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
                          severity="secondary"
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
      .sort((a, b) => new Date(b.dataAtualizacao || 0).getTime() - new Date(a.dataAtualizacao || 0).getTime())
      .slice(0, 5);
  });

  // Load data on init
  constructor() {
    effect(() => {
      this.fichaService.loadFichas().pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe();
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

  verFicha(id: number) {
    this.router.navigate(['/jogador/fichas', id]);
  }

  editarFicha(id: number) {
    this.router.navigate(['/jogador/fichas', id, 'edit']);
  }
}
