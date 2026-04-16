import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DrawerModule } from 'primeng/drawer';
import { HeaderComponent } from '@shared/layout/header.component';
import { SidebarComponent } from '@shared/layout/sidebar.component';

/**
 * Main Layout Component
 *
 * Layout wrapper para rotas autenticadas
 * Inclui Header com seletor de jogo + RouterOutlet para conteúdo
 * Em mobile: hamburger abre um p-drawer lateral com o menu de navegação
 */
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent, DrawerModule],
  template: `
    <div class="min-h-screen surface-ground">
      <app-header (menuToggle)="mobileMenuOpen.set(true)"></app-header>

      <p-drawer
        [visible]="mobileMenuOpen()"
        (visibleChange)="mobileMenuOpen.set($event)"
        position="left"
        [style]="{'width': '18rem'}"
        header="Menu"
        styleClass="lg:hidden"
      >
        <app-sidebar></app-sidebar>
      </p-drawer>

      <main>
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class MainLayoutComponent {
  mobileMenuOpen = signal(false);
}
