import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { BadgeModule } from 'primeng/badge';
import { ConfigStore } from '@core/stores/config.store';

/**
 * Config Sidebar Component
 *
 * Menu lateral com itens de configuração e badges de contagem.
 *
 * Features:
 * - Navegação via routerLink
 * - Ícones para cada tipo de config
 * - Highlight no item ativo (routerLinkActive)
 * - Badges de contagem vindos do ConfigStore
 * - Ordem lógica de dependência entre configs
 */
@Component({
  selector: 'app-config-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    BadgeModule,
  ],
  template: `
    <div class="surface-card h-full">
      <div class="p-3 border-bottom-1 surface-border">
        <h3 class="m-0 text-lg font-semibold">Configurações</h3>
      </div>

      <nav class="p-2">
        @for (item of menuItems(); track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive="active-menu-item"
            class="flex align-items-center gap-3 p-3 border-round cursor-pointer text-color no-underline hover:surface-hover transition-colors transition-duration-150"
          >
            <i [class]="item.icon + ' text-xl'"></i>
            <div class="flex-1">
              <span class="flex align-items-center justify-content-between w-full">
                <span class="font-semibold">{{ item.label }}</span>
                @if (item.count > 0) {
                  <p-badge [value]="item.count.toString()" severity="secondary" />
                }
              </span>
              <div class="text-sm text-color-secondary">{{ item.description }}</div>
            </div>
            <i class="pi pi-chevron-right text-color-secondary"></i>
          </a>
        }

        <div class="p-3 mt-2 border-top-1 surface-border">
          <span class="text-xs font-semibold text-color-secondary uppercase tracking-wide">
            Configuração de Equipamentos
          </span>
        </div>

        @for (item of equipMenuItems; track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive="active-menu-item"
            class="flex align-items-center gap-3 p-3 border-round cursor-pointer text-color no-underline hover:surface-hover transition-colors transition-duration-150"
          >
            <i [class]="item.icon + ' text-xl'"></i>
            <div class="flex-1">
              <span class="flex align-items-center justify-content-between w-full">
                <span class="font-semibold">{{ item.label }}</span>
              </span>
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
  private readonly configStore = inject(ConfigStore);

  protected readonly equipMenuItems = [
    {
      label: 'Raridades de Item',
      description: 'Comum, Raro, Épico, etc.',
      icon: 'pi pi-star',
      route: '/mestre/config/raridades-item',
    },
    {
      label: 'Tipos de Item',
      description: 'Espada, Armadura, Poção, etc.',
      icon: 'pi pi-tag',
      route: '/mestre/config/tipos-item',
    },
    {
      label: 'Catálogo de Itens',
      description: 'Todos os itens disponíveis no jogo',
      icon: 'pi pi-box',
      route: '/mestre/config/itens',
    },
  ];

  protected readonly menuItems = computed(() => [
    {
      label: 'Tipos de Aptidão',
      description: 'Física, Mental, etc.',
      icon: 'pi pi-tags',
      route: '/mestre/config/tipos-aptidao',
      count: this.configStore.tiposAptidao().length,
    },
    {
      label: 'Atributos',
      description: 'FOR, DES, CON, INT, SAB, CAR',
      icon: 'pi pi-chart-bar',
      route: '/mestre/config/atributos',
      count: this.configStore.atributos().length,
    },
    {
      label: 'Aptidões',
      description: 'Perícias e habilidades',
      icon: 'pi pi-star',
      route: '/mestre/config/aptidoes',
      count: this.configStore.aptidoes().length,
    },
    {
      label: 'Bônus',
      description: 'Modificadores de atributos',
      icon: 'pi pi-plus-circle',
      route: '/mestre/config/bonus',
      count: this.configStore.bonus().length,
    },
    {
      label: 'Classes',
      description: 'Guerreiro, Mago, etc.',
      icon: 'pi pi-shield',
      route: '/mestre/config/classes',
      count: this.configStore.classes().length,
    },
    {
      label: 'Raças',
      description: 'Humano, Elfo, etc.',
      icon: 'pi pi-users',
      route: '/mestre/config/racas',
      count: this.configStore.racas().length,
    },
    {
      label: 'Vantagens',
      description: 'Vantagens e desvantagens',
      icon: 'pi pi-star-fill',
      route: '/mestre/config/vantagens',
      count: this.configStore.vantagens().length,
    },
    {
      label: 'Categorias de Vantagem',
      description: 'Combate, Magia, Social, etc.',
      icon: 'pi pi-tag',
      route: '/mestre/config/categorias-vantagem',
      count: this.configStore.categoriasVantagem().length,
    },
    {
      label: 'Pontos de Vantagem',
      description: 'Pontos ganhos por nível',
      icon: 'pi pi-star',
      route: '/mestre/config/pontos-vantagem',
      count: this.configStore.pontosVantagem().length,
    },
    {
      label: 'Níveis',
      description: 'Progressão de XP',
      icon: 'pi pi-arrow-up',
      route: '/mestre/config/niveis',
      count: this.configStore.niveis().length,
    },
    {
      label: 'Gêneros',
      description: 'Masculino, Feminino, etc.',
      icon: 'pi pi-user',
      route: '/mestre/config/generos',
      count: this.configStore.generos().length,
    },
    {
      label: 'Índoles',
      description: 'Alinhamentos de personagem',
      icon: 'pi pi-heart',
      route: '/mestre/config/indoles',
      count: this.configStore.indoles().length,
    },
    {
      label: 'Presenças',
      description: 'Habilidades especiais',
      icon: 'pi pi-sparkles',
      route: '/mestre/config/presencas',
      count: this.configStore.presencas().length,
    },
    {
      label: 'Prospecção',
      description: 'Sistema de dados',
      icon: 'pi pi-box',
      route: '/mestre/config/prospeccao',
      count: this.configStore.dadosProspeccao().length,
    },
    {
      label: 'Membros do Corpo',
      description: 'Cabeça, Braços, Pernas, etc.',
      icon: 'pi pi-android',
      route: '/mestre/config/membros-corpo',
      count: this.configStore.membrosCorpo().length,
    },
  ]);
}
