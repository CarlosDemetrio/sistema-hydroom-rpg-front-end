import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { MenuItem } from 'primeng/api';
import { AuthService } from '@services/auth.service';
import { CurrentGameService } from '@core/services/current-game.service';
import { JogoBusinessService } from '@core/services/business/jogo-business.service';
import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle.component';

/**
 * Header Component (SMART)
 *
 * Uses PrimeNG 21 Menu with [popup]="true" for user menu
 * Uses ONLY PrimeFlex classes (NEVER styleClass, NEVER custom CSS)
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    FormsModule,
    ToolbarModule,
    ButtonModule,
    AvatarModule,
    MenuModule,
    SelectModule,
    TooltipModule,
    ThemeToggleComponent
  ],
  template: `
    <p-toolbar class="border-none border-bottom-1 surface-border shadow-1">
      <div class="flex align-items-center gap-3">
        <p-button
          icon="pi pi-bars"
          [text]="true"
          [rounded]="true"
          (onClick)="onMenuToggle()"
          class="lg:hidden"
        ></p-button>

        <div class="flex align-items-center gap-2 cursor-pointer" (click)="navigateHome()">
          <div class="flex align-items-center justify-content-center border-circle bg-primary w-3rem h-3rem">
            <i class="pi pi-book text-xl text-white"></i>
          </div>
          <h2 class="text-2xl font-bold m-0 text-primary hidden md:block">
            RPG Ficha Controlador
          </h2>
        </div>
      </div>

      <div class="flex align-items-center gap-3">
        <!-- Theme Toggle - Visível sempre -->
        <app-theme-toggle />

        @if (authService.isAuthenticated()) {
          @if (shouldShowGameSelector()) {
            <div class="hidden xl:flex align-items-center gap-3 px-3 py-2 border-round-lg surface-100 border-1 surface-border min-w-18rem">
              <div class="flex flex-column gap-1 flex-1">
                <span class="text-xs font-semibold uppercase text-color-secondary">
                  Jogo atual
                </span>
                <span class="text-sm font-semibold">
                  {{ currentGameName() }}
                </span>
                <p-select
                  [options]="availableGames()"
                  optionLabel="nome"
                  optionValue="id"
                  [ngModel]="selectedGameId()"
                  (ngModelChange)="onGameChange($event)"
                  [placeholder]="availableGames().length ? 'Selecione um jogo' : 'Nenhum jogo disponível'"
                  class="w-full"
                  appendTo="body"
                ></p-select>
              </div>

              @if (hasCurrentGame()) {
                <p-button
                  icon="pi pi-cog"
                  [text]="true"
                  [rounded]="true"
                  pTooltip="Abrir configurações do jogo atual"
                  tooltipPosition="bottom"
                  (onClick)="goToCurrentGameConfig()"
                ></p-button>
              }
            </div>
          }

          @if (hasBothRoles()) {
            <div class="hidden md:flex align-items-center gap-2 p-2 border-round-lg surface-100 border-1 surface-border">
              <span class="text-sm font-semibold text-color-secondary px-2">Visualizar como:</span>
              <p-button
                [label]="'Mestre'"
                [text]="currentRole() !== 'MESTRE'"
                [size]="'small'"
                [raised]="currentRole() === 'MESTRE'"
                (onClick)="switchRole('MESTRE')"
                icon="pi pi-crown"
              ></p-button>
              <p-button
                [label]="'Jogador'"
                [text]="currentRole() !== 'JOGADOR'"
                [size]="'small'"
                [raised]="currentRole() === 'JOGADOR'"
                (onClick)="switchRole('JOGADOR')"
                icon="pi pi-user"
              ></p-button>
            </div>
          }

          <div class="flex align-items-center gap-3 p-2 border-round-lg surface-100">
            <span class="hidden md:inline text-color font-semibold">
              {{ authService.currentUser()?.name }}
            </span>

            <!-- Avatar com imagem do Google -->
            <p-avatar
              [label]="getInitials()"
              [image]="authService.currentUser()?.picture || undefined"
              [shape]="'circle'"
              [size]="'large'"
              (click)="userMenu.toggle($event)"
              class="cursor-pointer"
              [style]="{ 'background-color': authService.currentUser()?.picture ? 'transparent' : '#0ea5e9' }"
            ></p-avatar>

            <p-menu #userMenu [model]="userMenuItems()" [popup]="true"></p-menu>
          </div>
        } @else {
          <p-button
            [label]="'Entrar'"
            icon="pi pi-sign-in"
            (onClick)="login()"
            [raised]="true"
          ></p-button>
        }
      </div>
    </p-toolbar>
  `
})
export class HeaderComponent implements OnInit {
  authService = inject(AuthService);
  private currentGameService = inject(CurrentGameService);
  private jogoService = inject(JogoBusinessService);
  private router = inject(Router);

  currentRole = signal<'MESTRE' | 'JOGADOR'>('JOGADOR');
  userMenuItems = signal<MenuItem[]>([]);
  availableGames = this.currentGameService.availableGames;
  hasCurrentGame = this.currentGameService.hasCurrentGame;
  currentGameName = computed(() => this.currentGameService.currentGame()?.nome ?? 'Nenhum jogo selecionado');
  selectedGameId = computed(() =>
    this.hasCurrentGame() ? this.currentGameService.currentGameId() : null
  );

  ngOnInit() {
    if (this.authService.isAuthenticated() && this.authService.isMestre()) {
      this.jogoService.loadJogos().subscribe({
        next: () => this.currentGameService.reconcileSelection(),
      });
    }

    this.userMenuItems.set([
      {
        label: 'Perfil',
        icon: 'pi pi-user',
        command: () => {
          this.navigateToProfile();
        }
      },
      {
        separator: true
      },
      {
        label: 'Sair',
        icon: 'pi pi-sign-out',
        command: () => {
          this.logout();
        }
      }
    ]);
  }

  hasBothRoles(): boolean {
    // MVP: UserInfo.role é string única — usuário não pode ter ambas as roles simultaneamente
    // O seletor "Visualizar como" fica desabilitado até suporte a multi-role (Spec 010)
    return false;
  }

  getInitials(): string {
    const name = this.authService.currentUser()?.name || '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  shouldShowGameSelector(): boolean {
    return this.authService.isMestre();
  }

  onGameChange(gameId: number | null) {
    if (gameId === null) {
      this.currentGameService.clearGame();
      return;
    }

    this.currentGameService.selectGame(gameId);
  }

  goToCurrentGameConfig() {
    if (!this.hasCurrentGame()) {
      return;
    }

    this.router.navigate(['/mestre/config']);
  }

  switchRole(role: 'MESTRE' | 'JOGADOR') {
    this.currentRole.set(role);
    this.router.navigate(role === 'MESTRE' ? ['/mestre'] : ['/jogador']);
  }

  onMenuToggle() {
  }

  navigateHome() {
    this.router.navigate(['/']);
  }

  navigateToProfile() {
    this.router.navigate(['/profile']);
  }

  login() {
    this.authService.login();
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}
