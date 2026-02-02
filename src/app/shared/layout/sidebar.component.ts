import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../services/auth.service';

/**
 * Sidebar Component (SMART)
 *
 * Navigation sidebar with role-based menu items
 * SMART COMPONENT - injects services and manages navigation
 * Uses ONLY PrimeFlex classes
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [MenuModule],
  template: `
    <div class="flex flex-column h-full surface-card border-right-1 surface-border shadow-1" [style]="{ width: '18rem' }">
      <div class="p-4 border-bottom-1 surface-border bg-primary-reverse">
        <div class="flex align-items-center gap-2">
          <i class="pi pi-bars text-2xl text-primary"></i>
          <h3 class="m-0 text-xl font-bold text-primary">Menu de Navegação</h3>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-2">
        <p-menu [model]="menuItems()" class="border-none w-full"></p-menu>
      </div>

      <div class="p-3 border-top-1 surface-border">
        <div class="text-center text-sm text-color-secondary">
          <p class="m-0">RPG Ficha Controlador</p>
          <p class="m-0 text-xs">v1.0.0</p>
        </div>
      </div>
    </div>
  `
})
export class SidebarComponent implements OnInit {
  authService = inject(AuthService);
  private router = inject(Router);

  menuItems = signal<MenuItem[]>([]);

  ngOnInit() {
    this.updateMenuItems();
  }

  private updateMenuItems() {
    const isMestre = this.authService.isMestre();
    const isJogador = this.authService.isJogador();

    const items: MenuItem[] = [
      {
        label: 'Home',
        icon: 'pi pi-home',
        command: () => this.router.navigate(['/'])
      },
      {
        separator: true
      }
    ];

    // Mestre Menu Items
    if (isMestre) {
      items.push({
        label: 'Mestre',
        items: [
          {
            label: 'Meus Jogos',
            icon: 'pi pi-book',
            command: () => this.router.navigate(['/mestre/jogos'])
          },
          {
            label: 'Criar Jogo',
            icon: 'pi pi-plus',
            command: () => this.router.navigate(['/mestre/jogos/novo'])
          },
          {
            label: 'Configurações',
            icon: 'pi pi-cog',
            command: () => this.router.navigate(['/mestre/config'])
          }
        ]
      });
    }

    // Jogador Menu Items
    if (isJogador) {
      items.push({
        label: 'Jogador',
        items: [
          {
            label: 'Minhas Fichas',
            icon: 'pi pi-id-card',
            command: () => this.router.navigate(['/jogador/fichas'])
          },
          {
            label: 'Criar Ficha',
            icon: 'pi pi-plus',
            command: () => this.router.navigate(['/jogador/fichas/nova'])
          },
          {
            label: 'Jogos Disponíveis',
            icon: 'pi pi-search',
            command: () => this.router.navigate(['/jogador/jogos'])
          }
        ]
      });
    }

    this.menuItems.set(items);
  }
}
