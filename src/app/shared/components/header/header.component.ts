import {Component, effect, inject, signal} from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { AuthService } from '@services/auth.service';
import {CurrentGameService} from '@core/services';
import {Select} from 'primeng/select';
import {FormsModule} from '@angular/forms';

/**
 * App Header Component (SIMPLIFIED)
 *
 * 🎯 Header básico - aguardando backend para funcionalidades avançadas
 *
 * Features implementadas:
 * - Logo + Nome do app
 * - User menu (avatar + dropdown)
 *
 * TODO (aguardando backend):
 * - Seletor de "Jogo Atual" (precisa GET /api/users/me/jogos)
 * - Badge de notificações
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ButtonModule, AvatarModule, MenuModule, Select, FormsModule],
  template: `
    <header class="surface-card border-bottom-1 surface-border p-3">
      <div class="flex flex-column md:flex-row align-items-center justify-content-between gap-3">

        <!-- Logo + App Name -->
        <div class="flex align-items-center gap-3">
          <i class="pi pi-book text-primary text-3xl"></i>
          <div class="text-center md:text-left">
            <h1 class="text-2xl font-bold m-0 text-primary">Ficha Controlador</h1>
            <p class="text-sm text-color-secondary m-0 hidden md:block">Sistema de Fichas RPG</p>
          </div>
        </div>

        <!-- Seletor de Jogo Atual -->
        <div class="flex align-items-center gap-2 w-full md:w-auto">
          @if (currentGameService.availableGames().length > 0) {
            <div class="flex align-items-center gap-2 w-full md:w-auto">
              <label class="font-semibold text-color-secondary hidden lg:block">Jogo Atual:</label>
              <p-select
                [options]="currentGameService.availableGames()"
                [(ngModel)]="selectedGameId"
                (ngModelChange)="onGameChange($event)"
                optionLabel="nome"
                optionValue="id"
                placeholder="Selecione um jogo"
                class="w-full md:w-20rem"
              >
                <ng-template #item let-jogo>
                  <div class="flex align-items-center gap-2">
                    <i class="pi pi-book text-primary"></i>
                    <div>
                      <div class="font-semibold">{{ jogo.nome }}</div>
                      <div class="text-sm text-color-secondary">
                        {{ jogo.participantes?.length || 0 }} participantes
                      </div>
                    </div>
                  </div>
                </ng-template>
              </p-select>
            </div>
          } @else {
            <div class="text-color-secondary text-sm">
              <i class="pi pi-info-circle mr-2"></i>
              <span class="hidden md:inline">Nenhum jogo ativo</span>
              <span class="md:hidden">Sem jogo</span>
            </div>
          }
        </div>

        <!-- User Menu -->
        <div class="flex align-items-center gap-3">
          <!-- Notifications (futuro) - hidden em mobile -->
          <p-button
            icon="pi pi-bell"
            [text]="true"
            [rounded]="true"
            severity="secondary"
            class="hidden md:inline-flex"
          ></p-button>

          <!-- User Avatar + Menu -->
          <div class="flex align-items-center gap-2 cursor-pointer" (click)="menu.toggle($event)">
            <p-avatar
              [label]="getUserInitials()"
              shape="circle"
              class="surface-600 text-white"
            ></p-avatar>
            <div class="hidden lg:block">
              <div class="font-semibold">{{ authService.currentUser()?.name }}</div>
              <div class="text-sm text-color-secondary">{{ getUserRole() }}</div>
            </div>
            <i class="pi pi-chevron-down text-sm"></i>
          </div>

          <p-menu #menu [model]="menuItems" [popup]="true"></p-menu>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  currentGameService = inject(CurrentGameService);
  authService = inject(AuthService);
  private router = inject(Router);

  // Signal local para binding do p-select
  selectedGameId = signal<number | null>(null);

  constructor() {
    // Sincroniza selectedGameId com CurrentGameService
    effect(() => {
      const currentId = this.currentGameService.currentGameId();
      if (currentId !== this.selectedGameId()) {
        this.selectedGameId.set(currentId);
      }
    });
  }

  menuItems: MenuItem[] = [
    {
      label: 'Perfil',
      icon: 'pi pi-user',
      command: () => this.router.navigate(['/profile'])
    },
    {
      label: 'Configurações',
      icon: 'pi pi-cog',
      command: () => {
        if (this.currentGameService.hasCurrentGame()) {
          this.router.navigate(['/mestre/config']);
        }
      },
      visible: this.authService.isMestre(),
      disabled: !this.currentGameService.hasCurrentGame(),
      title: !this.currentGameService.hasCurrentGame()
        ? 'Selecione ou crie um jogo para acessar as configurações'
        : undefined
    },
    { separator: true },
    {
      label: 'Sair',
      icon: 'pi pi-sign-out',
      command: () => this.authService.logout().subscribe(() => {
        console.log('ProfileComponent: Logout concluído, redirecionando para /login');
        this.router.navigate(['/login']);
      })
    }
  ];

  goHome() {
    this.router.navigate(['/dashboard']);
  }

  onGameChange(gameId: number | null) {
    if (gameId) {
      this.currentGameService.selectGame(gameId);
    }
  }

  getUserInitials(): string {
    const name = this.authService.currentUser()?.name || 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  getUserRole(): string {
    return this.authService.isMestre() ? 'Mestre' : 'Jogador';
  }
}
