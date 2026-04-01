import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { FichaVantagemResponse } from '../../../../../../core/models/ficha.model';

interface GrupoVantagem {
  categoria: string;
  vantagens: FichaVantagemResponse[];
}

@Component({
  selector: 'app-ficha-vantagens-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BadgeModule, ButtonModule, CardModule, ProgressBarModule, TagModule],
  template: `
    <div class="p-3 flex flex-col gap-4">

      <!-- Pontos disponiveis -->
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium">Pontos de vantagem disponiveis:</span>
        <p-badge [value]="pontosVantagemRestantes().toString()" severity="info" />
      </div>

      @if (vantagens().length === 0) {
        <div class="flex flex-col items-center py-10 gap-3 text-center">
          <i class="pi pi-star" style="font-size: 3rem; color: var(--text-color-secondary)"></i>
          <h3 class="text-lg font-semibold m-0">Nenhuma vantagem comprada ainda</h3>
          <p class="text-color-secondary m-0">As vantagens serao exibidas aqui apos a compra.</p>
        </div>
      } @else {
        @for (grupo of vantagensAgrupadas(); track grupo.categoria) {
          <section>
            <p-tag [value]="grupo.categoria" styleClass="mb-3" />

            @for (vantagem of grupo.vantagens; track vantagem.id) {
              <p-card styleClass="vantagem-card mb-3">
                <!-- Header: nome, nivel, progressbar -->
                <div class="flex items-start justify-between gap-3 flex-wrap">
                  <div class="flex flex-col gap-1 flex-1 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="font-semibold">{{ vantagem.nomeVantagem }}</span>
                    </div>
                    <p-progressBar
                      [value]="nivelPercent(vantagem)"
                      [showValue]="false"
                      styleClass="vantagem-nivel-bar"
                      [attr.aria-label]="'Nivel ' + vantagem.nivelAtual + ' de ' + vantagem.nivelMaximo"
                    />
                    <span class="text-sm text-color-secondary">
                      Nivel {{ vantagem.nivelAtual }} / {{ vantagem.nivelMaximo }}
                    </span>
                  </div>
                </div>

                <p-divider />

                <div class="flex items-center justify-between gap-2">
                  <span class="text-sm text-color-secondary">
                    Custo pago: {{ vantagem.custoPago }} pontos
                  </span>

                  @if (podeAumentarNivel() && vantagem.nivelAtual < vantagem.nivelMaximo) {
                    <p-button
                      label="Subir Nivel"
                      icon="pi pi-arrow-up"
                      text
                      size="small"
                      [attr.aria-label]="'Subir nivel da vantagem ' + vantagem.nomeVantagem"
                      (onClick)="aumentarNivelVantagem.emit(vantagem.id)"
                    />
                  }
                </div>
              </p-card>
            }
          </section>
        }
      }
    </div>
  `,
  styles: [`
    :host ::ng-deep .vantagem-nivel-bar .p-progressbar {
      height: 6px;
    }

    :host ::ng-deep .vantagem-nivel-bar .p-progressbar-value {
      background: var(--primary-color);
    }

    :host ::ng-deep .vantagem-card .p-card-body {
      padding: 0.75rem 1rem;
    }
  `],
})
export class FichaVantagensTabComponent {
  vantagens = input.required<FichaVantagemResponse[]>();
  pontosVantagemRestantes = input<number>(0);
  podeAumentarNivel = input<boolean>(false);

  aumentarNivelVantagem = output<number>();

  protected vantagensAgrupadas = computed<GrupoVantagem[]>(() => {
    const grupos = new Map<string, FichaVantagemResponse[]>();
    for (const v of this.vantagens()) {
      // FichaVantagemResponse does not include categoriaNome yet — group as "Vantagens" in Phase 1
      const cat = (v as FichaVantagemResponse & { categoriaNome?: string }).categoriaNome ?? 'Vantagens';
      if (!grupos.has(cat)) grupos.set(cat, []);
      grupos.get(cat)!.push(v);
    }
    return Array.from(grupos.entries()).map(([categoria, vantagens]) => ({ categoria, vantagens }));
  });

  protected nivelPercent(v: FichaVantagemResponse): number {
    if (v.nivelMaximo === 0) return 0;
    return Math.round((v.nivelAtual / v.nivelMaximo) * 100);
  }
}
