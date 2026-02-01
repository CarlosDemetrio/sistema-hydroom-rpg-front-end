import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../services/auth.service';

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
    MenuModule
  ],
  template: `
    <p-toolbar class="border-none border-bottom-1 surface-border">
      <div class="flex align-items-center gap-3">
        <p-button
          icon="pi pi-bars"
          [text]="true"
          [rounded]="true"
          (onClick)="onMenuToggle()"
          class="lg:hidden"
        ></p-button>

        <h2 class="text-2xl font-bold m-0 cursor-pointer text-primary" (click)="navigateHome()">
          RPG Ficha Controlador
        </h2>
      </div>

      <div class="flex align-items-center gap-3">
        @if (authService.isAuthenticated()) {
          @if (hasBothRoles()) {
            <div class="hidden md:flex align-items-center gap-2 p-2 border-round surface-100">
              <span class="text-sm font-semibold text-color-secondary">Modo:</span>
              <p-button
                [label]="'Mestre'"
                [text]="currentRole() !== 'MESTRE'"
                [severity]="currentRole() === 'MESTRE' ? 'primary' : 'secondary'"
                [size]="'small'"
                (onClick)="switchRole('MESTRE')"
              ></p-button>
              <p-button
                [label]="'Jogador'"
                [text]="currentRole() !== 'JOGADOR'"
                [severity]="currentRole() === 'JOGADOR' ? 'primary' : 'secondary'"
                [size]="'small'"
                (onClick)="switchRole('JOGADOR')"
              ></p-button>
            </div>
          }

          <div class="flex align-items-center gap-2">
            <span class="hidden md:inline text-color font-semibold">
              {{ authService.currentUser()?.name }}
            </span>

            <p-avatar
              [label]="getInitials()"
              [image]="authService.currentUser()?.picture"
              [shape]="'circle'"
              (click)="userMenu.toggle($event)"
              class="cursor-pointer"
            ></p-avatar>

            <p-menu #userMenu [model]="userMenuItems()" [popup]="true"></p-menu>
          </div>
        } @else {
          <p-button [label]="'Entrar'" icon="pi pi-sign-in" (onClick)="login()"></p-button>
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
        command: () => this.navigateToProfile()
      },
      {
        separator: true
      },
      {
        label: 'Sair',
        icon: 'pi pi-sign-out',
        command: () => this.logout()
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
    this.authService.logout();
  }
}
