import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../services/auth.service';
import { ThemeToggleComponent } from '../components/theme-toggle/theme-toggle.component';

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
    ToolbarModule,
    ButtonModule,
    AvatarModule,
    MenuModule,
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
  private router = inject(Router);

  currentRole = signal<'MESTRE' | 'JOGADOR'>('JOGADOR');
  userMenuItems = signal<MenuItem[]>([]);

  ngOnInit() {
    this.userMenuItems.set([
      {
        label: 'Perfil',
        icon: 'pi pi-user',
        command: () => {
          console.log('Menu: Navegando para perfil');
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
          console.log('Menu: Executando logout');
          this.logout();
        }
      }
    ]);
  }

  hasBothRoles(): boolean {
    const user = this.authService.currentUser();
    return user?.role === 'MESTRE' || user?.role === 'JOGADOR';
  }

  getInitials(): string {
    const name = this.authService.currentUser()?.name || '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  switchRole(role: 'MESTRE' | 'JOGADOR') {
    this.currentRole.set(role);
    this.router.navigate(role === 'MESTRE' ? ['/mestre'] : ['/jogador']);
  }

  onMenuToggle() {
    console.log('Toggle sidebar');
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
