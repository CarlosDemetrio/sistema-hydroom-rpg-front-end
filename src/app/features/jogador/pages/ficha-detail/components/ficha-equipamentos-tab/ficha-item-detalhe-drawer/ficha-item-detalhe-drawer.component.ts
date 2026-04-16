import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { InputNumberModule } from 'primeng/inputnumber';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { FichaItemViewModel, AlterarDurabilidadeRequest } from '@core/models/ficha-item.model';

/**
 * FichaItemDetalheDrawerComponent — Componente DUMB.
 *
 * Drawer lateral com informacoes completas do item selecionado.
 * Exibe nome, raridade, durabilidade, peso, notas e acoes.
 * O botao "Editar Durabilidade" e visivel apenas para o Mestre.
 */
@Component({
  selector: 'app-ficha-item-detalhe-drawer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    FormsModule,
    ButtonModule,
    DrawerModule,
    InputNumberModule,
    ProgressBarModule,
    TagModule,
    DividerModule,
    TooltipModule,
  ],
  template: `
    <p-drawer
      [visible]="visivel()"
      (visibleChange)="visivel.set($event)"
      position="right"
      [style]="{ width: 'min(480px, 100vw)' }"
      [header]="item()?.nome ?? 'Detalhes do Item'"
      aria-label="Detalhes do item"
    >
      @if (item()) {
        @let i = item()!;
        <div class="flex flex-col gap-4 p-1">

          <!-- Raridade chip -->
          <div class="flex align-items-center gap-2">
            @if (i.raridadeNome) {
              <p-tag
                [value]="i.raridadeNome"
                [style]="{
                  'background-color': i.raridadeCorEfetiva + '22',
                  'color': i.raridadeCorEfetiva,
                  'border': '1px solid ' + i.raridadeCorEfetiva
                }"
              />
            }
            @if (i.isCustomizado) {
              <p-tag value="Customizado" severity="secondary" />
            }
            @if (i.estaQuebrado) {
              <p-tag value="QUEBRADO" severity="danger" />
            }
          </div>

          <!-- Propriedades basicas -->
          <div class="flex flex-col gap-2">
            <span class="text-xs font-semibold text-color-secondary uppercase tracking-wide">
              Propriedades
            </span>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span class="text-color-secondary">Peso:</span>
                <span class="ml-1 font-medium">{{ i.pesoEfetivo | number: '1.1-2' }} kg</span>
              </div>
              <div>
                <span class="text-color-secondary">Quantidade:</span>
                <span class="ml-1 font-medium">{{ i.quantidade }}</span>
              </div>
              @if (i.duracaoPadrao !== null && i.duracaoPadrao !== undefined) {
                <div class="col-span-2">
                  <span class="text-color-secondary">Durabilidade:</span>
                  <span class="ml-1 font-medium">
                    {{ i.duracaoAtual }} / {{ i.duracaoPadrao }}
                  </span>
                </div>
              }
            </div>

            <!-- Barra de durabilidade -->
            @if (i.duracaoPadrao !== null && i.duracaoPadrao !== undefined) {
              @let percDur =
                i.duracaoPadrao > 0
                  ? ((i.duracaoAtual ?? 0) / i.duracaoPadrao) * 100
                  : 0;
              <p-progressBar
                [value]="percDur"
                [style]="{ height: '8px' }"
                [color]="
                  percDur < 25
                    ? 'var(--p-red-500)'
                    : percDur < 50
                      ? 'var(--p-orange-500)'
                      : 'var(--p-green-500)'
                "
                [attr.aria-label]="
                  'Durabilidade: ' + i.duracaoAtual + ' de ' + i.duracaoPadrao
                "
              />
            }
          </div>

          <!-- Notas -->
          @if (i.notas) {
            <p-divider />
            <div class="flex flex-col gap-1">
              <span class="text-xs font-semibold text-color-secondary uppercase tracking-wide">
                Notas
              </span>
              <p class="text-sm m-0">{{ i.notas }}</p>
            </div>
          }

          <!-- Adicionado por -->
          <p-divider />
          <div class="text-xs text-color-secondary">
            Adicionado por: <span class="font-medium">{{ i.adicionadoPor }}</span>
          </div>

          <!-- Edicao de durabilidade (apenas Mestre) -->
          @if (isMestre() && i.duracaoPadrao !== null && i.duracaoPadrao !== undefined) {
            <p-divider />
            <div class="flex flex-col gap-2">
              <span class="text-sm font-semibold">Editar Durabilidade</span>
              <div class="flex gap-2 align-items-center">
                <p-inputnumber
                  [ngModel]="decrementoValue()"
                  (ngModelChange)="decrementoValue.set($event ?? 1)"
                  [min]="1"
                  [max]="i.duracaoAtual ?? 1"
                  placeholder="Decremento"
                  styleClass="flex-1"
                  aria-label="Valor do decremento de durabilidade"
                />
                <p-button
                  label="Decrementar"
                  icon="pi pi-minus"
                  size="small"
                  severity="danger"
                  outlined
                  [disabled]="(i.duracaoAtual ?? 0) <= 0"
                  [attr.aria-label]="'Decrementar durabilidade de ' + i.nome"
                  (onClick)="onDecrementar(i.id)"
                />
              </div>
              <p-button
                label="Restaurar Durabilidade"
                icon="pi pi-refresh"
                size="small"
                severity="success"
                outlined
                class="w-full"
                [attr.aria-label]="'Restaurar durabilidade de ' + i.nome"
                (onClick)="onRestaurar(i.id)"
              />
            </div>
          }

        </div>
      } @else {
        <div class="flex align-items-center justify-content-center p-8">
          <span class="text-color-secondary">Nenhum item selecionado.</span>
        </div>
      }

      <ng-template #footer>
        <div class="flex justify-content-between gap-2">
          <p-button
            label="Fechar"
            icon="pi pi-times"
            severity="secondary"
            outlined
            (onClick)="visivel.set(false)"
            aria-label="Fechar drawer de detalhes"
          />
          @if (podeEditar() && item()) {
            @if (item()!.equipado) {
              <p-button
                label="Desequipar"
                icon="pi pi-arrow-down"
                severity="secondary"
                (onClick)="onDesequipar(item()!.id)"
                [attr.aria-label]="'Desequipar ' + item()!.nome"
              />
            } @else {
              <p-button
                label="Equipar"
                icon="pi pi-arrow-up"
                [disabled]="item()!.estaQuebrado"
                [pTooltip]="item()!.estaQuebrado ? 'Item quebrado' : ''"
                (onClick)="onEquipar(item()!.id)"
                [attr.aria-label]="'Equipar ' + item()!.nome"
              />
            }
          }
        </div>
      </ng-template>
    </p-drawer>
  `,
})
export class FichaItemDetalheDrawerComponent {
  visivel = model.required<boolean>();
  item = input<FichaItemViewModel | null>(null);
  podeEditar = input.required<boolean>();
  isMestre = input.required<boolean>();

  equipar = output<number>();
  desequipar = output<number>();
  alterarDurabilidade = output<{ itemId: number; request: AlterarDurabilidadeRequest }>();

  protected decrementoValue = signal<number>(1);

  protected onEquipar(itemId: number): void {
    this.equipar.emit(itemId);
    this.visivel.set(false);
  }

  protected onDesequipar(itemId: number): void {
    this.desequipar.emit(itemId);
    this.visivel.set(false);
  }

  protected onDecrementar(itemId: number): void {
    const decremento = this.decrementoValue();
    if (decremento < 1) return;
    this.alterarDurabilidade.emit({
      itemId,
      request: { decremento, restaurar: false },
    });
  }

  protected onRestaurar(itemId: number): void {
    this.alterarDurabilidade.emit({
      itemId,
      request: { decremento: 1, restaurar: true },
    });
  }
}
