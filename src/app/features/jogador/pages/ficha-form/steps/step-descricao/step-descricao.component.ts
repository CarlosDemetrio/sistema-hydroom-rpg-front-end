import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TextareaModule } from 'primeng/textarea';
import { MessageModule } from 'primeng/message';

/**
 * StepDescricaoComponent (DUMB)
 *
 * Passo 2 do Wizard de Ficha: descricao livre do personagem.
 *
 * Inputs:
 * - descricao: texto atual da descricao (null = vazio)
 *
 * Outputs:
 * - descricaoChanged: emite o novo valor a cada mudanca (null quando vazio)
 *
 * Campo opcional com limite de 2000 caracteres.
 * Sempre valido — nao bloqueia o avanco do wizard.
 */
@Component({
  selector: 'app-step-descricao',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    CardModule,
    TextareaModule,
    MessageModule,
  ],
  template: `
    <p-card>
      <ng-template #header>
        <div class="flex align-items-center gap-2 p-3 pb-0">
          <i class="pi pi-align-left text-primary text-xl"></i>
          <h3 class="text-xl font-bold m-0">Descricao do Personagem</h3>
        </div>
      </ng-template>

      <div class="flex flex-column gap-4">
        <div class="flex flex-column gap-1">
          <label for="descricao" class="font-medium text-sm">
            Descricao
            <span class="text-color-secondary font-normal">(opcional)</span>
          </label>
          <textarea
            id="descricao"
            pTextarea
            [ngModel]="descricao()"
            (ngModelChange)="onDescricaoChange($event)"
            placeholder="Descreva a aparencia, personalidade, historia ou qualquer detalhe do personagem..."
            [autoResize]="true"
            rows="6"
            maxlength="2000"
            class="w-full"
            aria-label="Descricao do personagem"
          ></textarea>
          <small class="text-right text-color-secondary">{{ (descricao()?.length ?? 0) }}/2000</small>
        </div>

        <p-message
          severity="info"
          text="Este campo e opcional. Voce pode preencher agora ou editar depois na tela do personagem."
        ></p-message>
      </div>
    </p-card>
  `,
})
export class StepDescricaoComponent {
  descricao = input<string | null>(null);

  descricaoChanged = output<string | null>();

  onDescricaoChange(valor: string): void {
    this.descricaoChanged.emit(valor || null);
  }
}
