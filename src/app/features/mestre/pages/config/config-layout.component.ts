import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ConfigSidebarComponent } from './config-sidebar.component';

/**
 * Config Layout Component (SMART Container)
 *
 * Layout principal do módulo de configurações (MESTRE ONLY)
 *
 * Estrutura:
 * ┌─────────────┬──────────────────────┐
 * │  Sidebar    │  Content Area        │
 * │  (Menu)     │  (router-outlet)     │
 * └─────────────┴──────────────────────┘
 *
 * Features:
 * - Sidebar com 10 itens de configuração
 * - Área de conteúdo dinâmica (router-outlet)
 * - Import/Export sempre acessível
 * - Responsive (sidebar collapse em mobile)
 */
@Component({
  selector: 'app-config-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    ButtonModule,
    ConfigSidebarComponent
  ],
  template: `
    <div class="min-h-screen surface-ground">
      <!-- Header -->
      <div class="surface-card shadow-2 p-4 mb-4">
        <div class="flex align-items-center justify-content-between">
          <div>
            <h1 class="text-3xl font-bold m-0 mb-2">
              <i class="pi pi-cog text-primary mr-2"></i>
              Configurações do Sistema
            </h1>
            <p class="text-color-secondary m-0">
              Configure as regras e mecânicas do seu jogo
            </p>
          </div>

          <!-- Action Buttons (sempre visíveis) -->
          <div class="flex gap-2">
            <p-button
              icon="pi pi-download"
              label="Exportar"
              [outlined]="true"
            ></p-button>
            <p-button
              icon="pi pi-upload"
              label="Importar"
              [outlined]="true"
            ></p-button>
          </div>
        </div>
      </div>

      <!-- Layout Grid -->
      <div class="grid m-0">
        <!-- Sidebar (col-12 em mobile, col-3 em desktop) -->
        <div class="col-12 lg:col-3 xl:col-2 p-0">
          <app-config-sidebar></app-config-sidebar>
        </div>

        <!-- Content Area -->
        <div class="col-12 lg:col-9 xl:col-10 p-4">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `
})
export class ConfigLayoutComponent {}
