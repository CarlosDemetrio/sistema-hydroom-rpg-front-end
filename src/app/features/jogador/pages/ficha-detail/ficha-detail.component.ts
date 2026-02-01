import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-ficha-detail',
  standalone: true,
  imports: [CardModule],
  template: `
    <div class="p-4">
      <h1 class="text-3xl font-bold mb-4">Detalhes da Ficha</h1>

      <p-card>
        <div class="text-center p-5">
          <i class="pi pi-info-circle text-6xl text-color-secondary mb-3"></i>
          <h3 class="text-xl font-semibold m-0 mb-2">Em Desenvolvimento</h3>
          <p class="text-color-secondary m-0">Detalhes da ficha serão implementados na Phase 2</p>
        </div>
      </p-card>
    </div>
  `
})
export class FichaDetailComponent {}
