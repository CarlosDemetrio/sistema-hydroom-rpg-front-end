import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../shared/layout/header.component';
import { SidebarComponent } from '../../shared/layout/sidebar.component';

/**
 * Home Component - Main Layout
 *
 * Wrapper component with Header, Sidebar and RouterOutlet
 * Used as the main authenticated layout
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],
  template: `
    <div class="flex flex-column h-screen">
      <app-header></app-header>

      <div class="flex flex-1 overflow-hidden">
        <app-sidebar class="hidden lg:block"></app-sidebar>

        <main class="flex-1 overflow-y-auto surface-ground">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class HomeComponent {}
