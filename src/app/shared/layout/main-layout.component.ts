import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../shared';

/**
 * Main Layout Component
 *
 * Layout wrapper para rotas autenticadas
 * Inclui Header com seletor de jogo + RouterOutlet para conteúdo
 */
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  template: `
    <div class="min-h-screen surface-ground">
      <app-header></app-header>
      <main>
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class MainLayoutComponent {}
