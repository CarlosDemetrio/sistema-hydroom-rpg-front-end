import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { Ficha, FichaResumo } from '../../../../../../core/models/ficha.model';

@Component({
  selector: 'app-ficha-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AvatarModule,
    BadgeModule,
    ButtonModule,
    ProgressBarModule,
    TagModule,
    TooltipModule,
  ],
  template: `
    <div class="ficha-header-wrapper">
      <!-- Identity row -->
      <div class="flex items-start gap-4">
        <!-- Avatar -->
        <p-avatar
          [label]="ficha().nome.charAt(0).toUpperCase()"
          size="xlarge"
          shape="circle"
          styleClass="ficha-avatar flex-shrink-0"
          [attr.aria-label]="'Avatar de ' + ficha().nome"
        />

        <!-- Name + meta -->
        <div class="flex flex-col gap-1 flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <h1 class="ficha-nome m-0">{{ ficha().nome }}</h1>
            <p-tag
              [value]="'Nv. ' + ficha().nivel"
              severity="info"
              [attr.aria-label]="'Nível ' + ficha().nivel"
            />
            @if (ficha().isNpc) {
              <p-tag value="NPC" severity="warn" />
            }
          </div>

          <p class="ficha-meta m-0">
            @if (ficha().racaNome) { {{ ficha().racaNome }} }
            @if (ficha().racaNome && ficha().classeNome) { &bull; }
            @if (ficha().classeNome) { {{ ficha().classeNome }} }
            @if ((ficha().racaNome || ficha().classeNome) && ficha().indoleNome) { &bull; }
            @if (ficha().indoleNome) { {{ ficha().indoleNome }} }
            @if (ficha().presencaNome) {
              &bull; {{ ficha().presencaNome }}
            }
          </p>

          <!-- XP bar -->
          <div class="flex items-center gap-2 mt-1">
            <span class="text-sm text-color-secondary">XP: {{ resumo().xp }}</span>
          </div>
        </div>
      </div>

      <!-- Stats row: Vida, Essencia, Ameaca -->
      <div class="ficha-stats-grid mt-3">
        <!-- Vida -->
        <div class="flex flex-col gap-1">
          <div class="flex justify-between text-sm">
            <span class="font-medium">Vida</span>
            <span class="text-color-secondary">{{ resumo().vidaTotal }}</span>
          </div>
          <p-progressBar
            [value]="100"
            styleClass="vida-bar"
            [showValue]="false"
            [attr.aria-label]="'Vida total: ' + resumo().vidaTotal"
          />
        </div>

        <!-- Essencia -->
        <div class="flex flex-col gap-1">
          <div class="flex justify-between text-sm">
            <span class="font-medium">Essencia</span>
            <span class="text-color-secondary">{{ resumo().essenciaTotal }}</span>
          </div>
          <p-progressBar
            [value]="100"
            styleClass="essencia-bar"
            [showValue]="false"
            [attr.aria-label]="'Essencia total: ' + resumo().essenciaTotal"
          />
        </div>

        <!-- Ameaca -->
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium">Ameaca:</span>
          <p-badge
            [value]="resumo().ameacaTotal.toString()"
            severity="danger"
          />
        </div>
      </div>

      <!-- Action buttons -->
      @if (podeEditar() || podeDeletar() || podeDuplicar()) {
        <div class="flex gap-2 mt-3 flex-wrap">
          @if (podeEditar()) {
            <p-button
              label="Editar"
              icon="pi pi-pencil"
              outlined
              size="small"
              [attr.aria-label]="'Editar ficha de ' + ficha().nome"
              (onClick)="editarClick.emit()"
            />
          }
          @if (podeDuplicar()) {
            <p-button
              label="Duplicar"
              icon="pi pi-copy"
              text
              size="small"
              [attr.aria-label]="'Duplicar ficha ' + ficha().nome"
              (onClick)="duplicarClick.emit()"
            />
          }
          @if (podeDeletar()) {
            <p-button
              label="Deletar"
              icon="pi pi-trash"
              text
              severity="danger"
              size="small"
              [attr.aria-label]="'Deletar ficha de ' + ficha().nome"
              (onClick)="deletarClick.emit()"
            />
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .ficha-header-wrapper {
      padding: 1.25rem;
      background: var(--surface-card);
      border-bottom: 1px solid var(--surface-border);
    }

    :host ::ng-deep .ficha-avatar .p-avatar {
      background: var(--primary-color);
      color: var(--primary-color-text);
    }

    .ficha-nome {
      font-family: Georgia, serif;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-color);
    }

    .ficha-meta {
      font-size: 0.875rem;
      color: var(--text-color-secondary);
    }

    .ficha-stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr auto;
      gap: 0.75rem 1.5rem;
      align-items: end;
    }

    :host ::ng-deep .vida-bar .p-progressbar-value {
      background: var(--green-500);
    }

    :host ::ng-deep .essencia-bar .p-progressbar-value {
      background: var(--blue-400);
    }

    @media (max-width: 768px) {
      .ficha-nome {
        font-size: 1.25rem;
      }

      .ficha-stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class FichaHeaderComponent {
  ficha = input.required<Ficha>();
  resumo = input.required<FichaResumo>();
  podeEditar = input<boolean>(false);
  podeDeletar = input<boolean>(false);
  podeDuplicar = input<boolean>(false);

  editarClick = output<void>();
  deletarClick = output<void>();
  duplicarClick = output<void>();
}
