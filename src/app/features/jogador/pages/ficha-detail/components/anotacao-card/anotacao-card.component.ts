import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { Anotacao } from '../../../../../../core/models/anotacao.model';

@Component({
  selector: 'app-anotacao-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, ButtonModule, CardModule, DividerModule, TagModule],
  template: `
    <p-card
      [styleClass]="cardClass()"
      [attr.aria-label]="'Anotacao: ' + anotacao().titulo"
    >
      <!-- Header -->
      <div class="flex items-start justify-between gap-2">
        <div class="flex flex-col gap-1 flex-1 min-w-0">
          <h4 class="m-0 font-semibold">{{ anotacao().titulo }}</h4>
          <div class="flex items-center gap-2 flex-wrap">
            @if (anotacao().tipoAnotacao === 'MESTRE') {
              <p-tag value="MESTRE" severity="warn" />
            } @else {
              <p-tag value="JOGADOR" severity="success" />
            }
            @if (anotacao().visivelParaJogador) {
              <p-tag value="Visivel" severity="info" />
            }
          </div>
        </div>

        @if (podeDeletar()) {
          <p-button
            icon="pi pi-trash"
            text
            severity="danger"
            size="small"
            [attr.aria-label]="'Deletar anotacao ' + anotacao().titulo"
            (onClick)="deletar.emit(anotacao().id)"
          />
        }
      </div>

      <p-divider />

      <!-- Conteudo -->
      <p class="m-0 text-sm whitespace-pre-wrap">{{ anotacao().conteudo }}</p>

      <!-- Rodape -->
      <div class="flex items-center justify-between mt-2 text-xs text-color-secondary">
        <span>Por {{ anotacao().autorNome }}</span>
        <span>{{ anotacao().dataCriacao | date:'dd/MM/yyyy' }}</span>
      </div>
    </p-card>
  `,
  styles: [`
    :host ::ng-deep .anotacao-mestre-oculta.p-card {
      background-color: var(--yellow-100);
      border: 1px solid var(--yellow-400);
    }
  `],
})
export class AnotacaoCardComponent {
  anotacao = input.required<Anotacao>();
  podeDeletar = input<boolean>(false);

  deletar = output<number>();

  protected cardClass(): string {
    const base = 'mb-3';
    if (this.anotacao().tipoAnotacao === 'MESTRE' && !this.anotacao().visivelParaJogador) {
      return `${base} anotacao-mestre-oculta`;
    }
    return base;
  }
}
