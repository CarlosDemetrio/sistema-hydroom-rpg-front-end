import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

/**
 * Fichas List Component (Jogador)
 *
 * Lista todas as fichas do jogador
 * TODO: Implementar listagem, filtros, criar nova ficha
 */
@Component({
  selector: 'app-fichas-list',
  standalone: true,
  imports: [CardModule, ButtonModule],
  template: `
    <div class="p-4">
      <div class="flex justify-content-between align-items-center mb-4">
        <h1 class="text-3xl font-bold m-0">Minhas Fichas</h1>
        <p-button label="Nova Ficha" icon="pi pi-plus" routerLink="/jogador/fichas/nova"></p-button>
      </div>

      <p-card>
        <div class="text-center p-5">
          <i class="pi pi-id-card text-6xl text-color-secondary mb-3"></i>
          <h3 class="text-xl font-semibold m-0 mb-2">Em Desenvolvimento</h3>
          <p class="text-color-secondary m-0">
            Lista de fichas será implementada na Phase 2
          </p>
        </div>
      </p-card>
    </div>
  `
})
export class FichasListComponent {}
