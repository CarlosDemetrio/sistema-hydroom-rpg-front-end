import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';

interface MestreNavItem {
  label: string;
  route: string;
  icon: string;
}

/**
 * MestreLayoutComponent — Layout contextual para a área do Mestre.
 *
 * Estrutura:
 * ┌──────────────────────────────────────────────┐
 * │  Sidebar (nav Mestre)  │  Content Area         │
 * │  (desktop: fixo)       │  (router-outlet)      │
 * │  (mobile: p-drawer)    │                       │
 * └────────────────────────┴───────────────────────┘
 *
 * O p-drawer mobile é controlado pelo próprio layout.
 * As rotas /mestre/config/** continuam usando ConfigLayoutComponent.
 */
@Component({
  selector: 'app-mestre-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, RouterOutlet, RouterLink, RouterLinkActive, DrawerModule, ButtonModule],
  template: `
    <!-- Drawer mobile -->
    <p-drawer
      [visible]="drawerOpen()"
      (visibleChange)="drawerOpen.set($event)"
      position="left"
      [style]="{'width': '18rem'}"
      header="Área do Mestre"
    >
      <ng-container *ngTemplateOutlet="navTemplate"></ng-container>
    </p-drawer>

    <div class="flex" style="min-height: calc(100vh - 4rem)">
      <!-- Sidebar desktop -->
      <aside class="hidden lg:block surface-card border-right-1 surface-border flex-shrink-0" style="width: 18rem">
        <div class="p-3 border-bottom-1 surface-border">
          <div class="flex align-items-center gap-2">
            <i class="pi pi-crown text-xl text-primary"></i>
            <h3 class="m-0 text-lg font-semibold">Área do Mestre</h3>
          </div>
        </div>
        <nav class="p-2">
          <ng-container *ngTemplateOutlet="navTemplate"></ng-container>
        </nav>
      </aside>

      <!-- Botão hamburger contextual — visível apenas em mobile -->
      <div class="lg:hidden fixed z-5" style="bottom: 1rem; right: 1rem">
        <p-button
          icon="pi pi-bars"
          [rounded]="true"
          [raised]="true"
          severity="primary"
          (onClick)="drawerOpen.set(true)"
          aria-label="Abrir menu do Mestre"
        ></p-button>
      </div>

      <!-- Conteúdo -->
      <main class="flex-1 overflow-y-auto">
        <router-outlet></router-outlet>
      </main>
    </div>

    <!-- Template de navegação reutilizado no aside e no drawer -->
    <ng-template #navTemplate>
      @for (item of navItems; track item.route) {
        <a
          [routerLink]="item.route"
          routerLinkActive="active-nav-item"
          class="flex align-items-center gap-3 p-3 border-round cursor-pointer text-color no-underline hover:surface-hover transition-colors transition-duration-150"
          (click)="drawerOpen.set(false)"
        >
          <i [class]="item.icon + ' text-xl'"></i>
          <span class="font-medium">{{ item.label }}</span>
        </a>
      }
    </ng-template>
  `,
  styles: [`
    .active-nav-item {
      background: var(--primary-color);
      color: var(--primary-color-text) !important;
    }

    .active-nav-item i {
      color: var(--primary-color-text) !important;
    }
  `]
})
export class MestreLayoutComponent {
  drawerOpen = signal(false);

  protected readonly navItems: MestreNavItem[] = [
    { label: 'Dashboard',             route: '/mestre/dashboard',             icon: 'pi pi-chart-bar' },
    { label: 'Meus Jogos',            route: '/mestre/jogos',                 icon: 'pi pi-book'      },
    { label: 'NPCs',                  route: '/mestre/npcs',                  icon: 'pi pi-users'     },
    { label: 'Configurações',         route: '/mestre/config',                icon: 'pi pi-cog'       },
    { label: 'Prospecção Pendentes',  route: '/mestre/prospeccao-pendentes',  icon: 'pi pi-clock'     },
  ];
}
