import { Component, signal, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule, ButtonModule, TableModule],
  template: `
    <div class="card">
      <h2>{{ title() }}</h2>
      <p-table [value]="data()">
        <ng-template pTemplate="header">
          <tr>
            <th>Nome</th>
            <th>Valor</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-item>
          <tr>
            <td>{{ item.name }}</td>
            <td>{{ item.value }}</td>
          </tr>
        </ng-template>
      </p-table>
      <p-button label="Adicionar" (onClick)="addItem()" icon="pi pi-plus" class="mt-2" />
    </div>
  `
})
export class ExampleComponent {
  // Inputs como Signals
  title = input<string>('Lista Padrão');

  // Estado local com Signals
  private _items = signal([{ name: 'Item 1', value: 100 }]);

  // Computed (read-only)
  data = computed(() => this._items());

  addItem() {
    this._items.update(prev => [...prev, { name: 'Novo Item', value: Math.random() * 100 }]);
  }
}
