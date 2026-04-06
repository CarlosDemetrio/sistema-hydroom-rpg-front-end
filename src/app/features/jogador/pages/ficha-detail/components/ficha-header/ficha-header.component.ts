import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { Ficha, FichaResumo } from '@models/ficha.model';

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
          class="ficha-avatar flex-shrink-0"
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
            <span class="text-color-secondary">
              {{ resumo().vidaAtual }} / {{ resumo().vidaTotal }}
            </span>
          </div>
          <p-progressBar
            [value]="vidaPercent()"
            class="vida-bar"
            [showValue]="false"
            [attr.aria-label]="'Vida: ' + resumo().vidaAtual + ' de ' + resumo().vidaTotal"
          />
        </div>

        <!-- Essencia -->
        <div class="flex flex-col gap-1">
          <div class="flex justify-between text-sm">
            <span class="font-medium">Essencia</span>
            <span class="text-color-secondary">
              {{ resumo().essenciaAtual }} / {{ resumo().essenciaTotal }}
            </span>
          </div>
          <p-progressBar
            [value]="essenciaPercent()"
            class="essencia-bar"
            [showValue]="false"
            [attr.aria-label]="'Essencia: ' + resumo().essenciaAtual + ' de ' + resumo().essenciaTotal"
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
      @if (podeEditar() || podeDeletar() || podeDuplicar() || mostrarBotaoVisibilidade()) {
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
          <!-- Botao visibilidade NPC (mobile only, lg+ usa painel lateral) -->
          @if (mostrarBotaoVisibilidade()) {
            <p-button
              label="Visibilidade"
              icon="pi pi-eye"
              text
              size="small"
              styleClass="lg:hidden"
              [attr.aria-label]="'Configurar visibilidade do NPC ' + ficha().nome"
              (onClick)="visibilidadeClick.emit()"
            />
            <!-- Badge visibilidade (desktop) -->
            <div class="hidden lg:flex items-center gap-1" aria-label="Status de visibilidade do NPC">
              @if (ficha().visivelGlobalmente) {
                <p-tag
                  value="Visivel para todos"
                  severity="success"
                  icon="pi pi-eye"
                />
              } @else {
                <p-tag
                  value="Acesso restrito"
                  severity="warn"
                  icon="pi pi-eye-slash"
                />
              }
            </div>
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
  /** Quando true, exibe badge de visibilidade NPC (desktop) e botao para abrir drawer (mobile). */
  mostrarBotaoVisibilidade = input<boolean>(false);

  editarClick = output<void>();
  deletarClick = output<void>();
  duplicarClick = output<void>();
  /** Emitido ao clicar no botao visibilidade (mobile only). */
  visibilidadeClick = output<void>();

  /** Percentual de vida atual em relação ao total. Retorna 0 quando vidaTotal é zero (evita divisão por zero). */
  protected vidaPercent = computed<number>(() => {
    const r = this.resumo();
    if (r.vidaTotal <= 0) return 0;
    return Math.round(Math.max(0, Math.min(100, (r.vidaAtual / r.vidaTotal) * 100)));
  });

  /** Percentual de essência atual em relação ao total. Retorna 0 quando essenciaTotal é zero (evita divisão por zero). */
  protected essenciaPercent = computed<number>(() => {
    const r = this.resumo();
    if (r.essenciaTotal <= 0) return 0;
    return Math.round(Math.max(0, Math.min(100, (r.essenciaAtual / r.essenciaTotal) * 100)));
  });
}
