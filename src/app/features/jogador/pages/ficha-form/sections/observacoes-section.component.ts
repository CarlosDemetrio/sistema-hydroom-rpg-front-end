import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { Textarea } from 'primeng/textarea';

/**
 * Observacoes Section Component (DUMB)
 *
 * Seção: Observações Gerais
 * - Campo de texto livre para anotações do jogador
 * - Histórico, notas de sessão, lembretes, etc.
 */
@Component({
  selector: 'app-observacoes-section',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CardModule,
    Textarea
  ],
  template: `
    <p-card>
      <ng-template #header>
        <div class="flex align-items-center gap-2 p-3">
          <i class="pi pi-book text-primary text-xl"></i>
          <h3 class="text-xl font-bold m-0">Observações e Anotações</h3>
        </div>
      </ng-template>

      <div [formGroup]="form()" class="grid">
        <div class="col-12">
          <label for="observacoes" class="block font-semibold mb-2">
            Anotações Gerais
          </label>
          <textarea
            id="observacoes"
            pTextarea
            formControlName="observacoes"
            rows="10"
            placeholder="Use este espaço para anotações sobre o personagem, histórico, objetivos, aliados, inimigos, itens importantes, notas de sessões, etc."
            class="w-full"
          ></textarea>
          <small class="text-color-secondary">
            Este campo é livre. Use para organizar suas informações como preferir.
          </small>
        </div>
      </div>
    </p-card>
  `
})
export class ObservacoesSectionComponent {
  form = input.required<FormGroup>();
}
