import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

/**
 * Config Sidebar Component (DUMB)
 *
 * Menu lateral com 10 itens de configuração
 *
 * Features:
 * - Navegação via routerLink
 * - Ícones para cada tipo de config
 * - Highlight no item ativo (routerLinkActive)
 * - Responsive (collapse em mobile)
 */
@Component({
  selector: 'app-config-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  template: `
    <div class="surface-card h-full">
      <div class="p-3 border-bottom-1 surface-border">
        <h3 class="m-0 text-lg font-semibold">Configurações</h3>
      </div>

      <nav class="p-2">
        @for (item of menuItems; track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive="active-menu-item"
            class="flex align-items-center gap-3 p-3 border-round cursor-pointer text-color no-underline hover:surface-hover transition-colors transition-duration-150"
          >
            <i [class]="item.icon + ' text-xl'"></i>
            <div class="flex-1">
              <div class="font-semibold">{{ item.label }}</div>
              <div class="text-sm text-color-secondary">{{ item.description }}</div>
            </div>
            <i class="pi pi-chevron-right text-color-secondary"></i>
          </a>
        }
      </nav>
    </div>
  `,
  styles: [`
    .active-menu-item {
      background: var(--primary-color);
      color: var(--primary-color-text) !important;
    }

    .active-menu-item i,
    .active-menu-item .text-color-secondary {
      color: var(--primary-color-text) !important;
    }
  `]
})
export class ConfigSidebarComponent {
  menuItems = [
    {
      label: 'Atributos',
      description: 'FOR, DES, CON, INT, SAB, CAR',
      icon: 'pi pi-chart-bar',
      route: '/mestre/config/atributos'
    },
    {
      label: 'Aptidões',
      description: 'Perícias e habilidades',
      icon: 'pi pi-star',
      route: '/mestre/config/aptidoes'
    },
    {
      label: 'Níveis',
      description: 'Progressão de XP',
      icon: 'pi pi-arrow-up',
      route: '/mestre/config/niveis'
    },
    {
      label: 'Tipos de Aptidão',
      description: 'Física, Mental, etc.',
      icon: 'pi pi-tags',
      route: '/mestre/config/tipos-aptidao'
    },
    {
      label: 'Classes',
      description: 'Guerreiro, Mago, etc.',
      icon: 'pi pi-shield',
      route: '/mestre/config/classes'
    },
    {
      label: 'Vantagens',
      description: 'Vantagens e desvantagens',
      icon: 'pi pi-plus-circle',
      route: '/mestre/config/vantagens'
    },
    {
      label: 'Raças',
      description: 'Humano, Elfo, etc.',
      icon: 'pi pi-users',
      route: '/mestre/config/racas'
    },
    {
      label: 'Prospecção',
      description: 'Sistema de dados',
      icon: 'pi pi-box',
      route: '/mestre/config/prospeccao'
    },
    {
      label: 'Presenças',
      description: 'Habilidades especiais',
      icon: 'pi pi-sparkles',
      route: '/mestre/config/presencas'
    },
    {
      label: 'Gêneros',
      description: 'Masculino, Feminino, etc.',
      icon: 'pi pi-user',
      route: '/mestre/config/generos'
    },
    {
      label: 'Índoles',
      description: 'Alinhamentos de personagem',
      icon: 'pi pi-heart',
      route: '/mestre/config/indoles'
    },
    {
      label: 'Membros do Corpo',
      description: 'Cabeça, Braços, Pernas, etc.',
      icon: 'pi pi-android',
      route: '/mestre/config/membros-corpo'
    },
    {
      label: 'Bônus',
      description: 'Modificadores de atributos',
      icon: 'pi pi-plus-circle',
      route: '/mestre/config/bonus'
    }
  ];
}
