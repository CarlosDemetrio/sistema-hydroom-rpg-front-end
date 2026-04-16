import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { FichaItemViewModel } from '@core/models/ficha-item.model';

/**
 * FichaItemCardComponent — Componente DUMB.
 *
 * Exibe as informacoes resumidas de um item do inventario:
 * nome, raridade (chip colorido), durabilidade, peso e acoes.
 *
 * Permissoes:
 * - podeEditar: true se o usuario pode equipar/desequipar
 * - isMestre: true permite remover qualquer item
 * - Jogador pode remover apenas itens comuns (podeJogadorAdicionar === true)
 *   e que nao sejam customizados de classe
 */
@Component({
  selector: 'app-ficha-item-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, ButtonModule, ProgressBarModule, TagModule, TooltipModule],
  template: `
    <div
      class="border-1 surface-border border-round-lg p-3 flex flex-col gap-2 surface-card
             transition-shadow transition-duration-200 hover:shadow-2"
      [class.opacity-50]="item().estaQuebrado"
      [style.border-left]="'3px solid ' + item().raridadeCorEfetiva"
      [attr.aria-label]="
        'Item: ' + item().nome + (item().equipado ? ', equipado' : ', no inventario')
      "
    >
      <!-- Header: icone + nome + chip raridade -->
      <div class="flex align-items-start justify-content-between gap-2">
        <div class="flex align-items-center gap-2 flex-1 min-w-0">
          <i class="pi pi-box text-color-secondary flex-shrink-0 text-lg"></i>
          <div class="flex flex-col min-w-0">
            <span
              class="font-semibold text-sm leading-tight"
              style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap"
              [title]="item().nome"
            >
              {{ item().nome }}
            </span>
            <span class="text-xs text-color-secondary">
              {{ item().isCustomizado ? 'Item customizado' : 'Do catalogo' }}
            </span>
          </div>
        </div>

        <div class="flex flex-col align-items-end gap-1 flex-shrink-0">
          @if (item().raridadeNome) {
            <p-tag
              [value]="item().raridadeNome!"
              [style]="{
                'background-color': item().raridadeCorEfetiva + '22',
                'color': item().raridadeCorEfetiva,
                'border': '1px solid ' + item().raridadeCorEfetiva
              }"
              styleClass="text-xs"
            />
          } @else {
            <p-tag
              value="Customizado"
              severity="secondary"
              styleClass="text-xs"
            />
          }
          @if (item().estaQuebrado) {
            <span class="text-xs font-bold text-red-500">QUEBRADO</span>
          }
        </div>
      </div>

      <!-- Barra de durabilidade (apenas se duracaoPadrao definido) -->
      @if (item().duracaoPadrao !== null && item().duracaoPadrao !== undefined) {
        @let percDur =
          item().duracaoPadrao! > 0
            ? ((item().duracaoAtual ?? 0) / item().duracaoPadrao!) * 100
            : 0;
        <div>
          <div class="flex justify-content-between text-xs text-color-secondary mb-1">
            <span>Durabilidade</span>
            @if (item().estaQuebrado) {
              <span class="text-red-500 font-semibold">
                0 / {{ item().duracaoPadrao }}
              </span>
            } @else {
              <span class="font-mono">
                {{ item().duracaoAtual }} / {{ item().duracaoPadrao }}
              </span>
            }
          </div>
          <p-progressBar
            [value]="percDur"
            [style]="{ height: '5px' }"
            [color]="
              percDur < 25
                ? 'var(--p-red-500)'
                : percDur < 50
                  ? 'var(--p-orange-500)'
                  : 'var(--p-green-500)'
            "
            [attr.aria-label]="
              'Durabilidade: ' +
              item().duracaoAtual +
              ' de ' +
              item().duracaoPadrao
            "
          />
        </div>
      }

      <!-- Peso e quantidade -->
      <div
        class="flex justify-content-between align-items-center text-xs text-color-secondary"
      >
        <span>
          <i class="pi pi-database mr-1"></i>
          {{ item().pesoEfetivo | number: '1.1-2' }} kg
          @if (item().quantidade > 1) {
            <span class="ml-1">(x{{ item().quantidade }})</span>
          }
        </span>
        @if (item().adicionadoPor) {
          <span class="text-xs text-color-secondary">
            por {{ item().adicionadoPor }}
          </span>
        }
      </div>

      <!-- Acoes -->
      <div class="flex gap-1 justify-content-end mt-1 flex-wrap">
        @if (item().equipado) {
          <p-button
            label="Desequipar"
            icon="pi pi-arrow-down"
            size="small"
            outlined
            severity="secondary"
            [disabled]="!podeEditar()"
            [attr.aria-label]="'Desequipar ' + item().nome"
            (onClick)="desequipar.emit(item().id)"
          />
        } @else {
          <p-button
            label="Equipar"
            icon="pi pi-arrow-up"
            size="small"
            outlined
            [disabled]="!podeEditar() || item().estaQuebrado"
            [pTooltip]="
              item().estaQuebrado
                ? 'Item quebrado — conserte antes de equipar'
                : ''
            "
            tooltipPosition="top"
            [attr.aria-label]="'Equipar ' + item().nome"
            (onClick)="equipar.emit(item().id)"
          />
        }

        <p-button
          icon="pi pi-info-circle"
          size="small"
          text
          [attr.aria-label]="'Ver detalhes de ' + item().nome"
          (onClick)="verDetalhes.emit(item())"
        />

        @if (podeRemoverItem()) {
          <p-button
            icon="pi pi-trash"
            size="small"
            text
            severity="danger"
            [attr.aria-label]="'Remover ' + item().nome + ' do inventario'"
            (onClick)="remover.emit(item().id)"
          />
        }
      </div>
    </div>
  `,
})
export class FichaItemCardComponent {
  item = input.required<FichaItemViewModel>();
  podeEditar = input.required<boolean>();
  isMestre = input.required<boolean>();

  equipar = output<number>();
  desequipar = output<number>();
  verDetalhes = output<FichaItemViewModel>();
  remover = output<number>();

  protected podeRemoverItem(): boolean {
    // Mestre pode remover qualquer item
    if (this.isMestre()) return true;
    // Jogador nao pode remover itens customizados de classe ou sem raridade que permita
    // O backend lanca 403 se o jogador tentar remover item proibido,
    // mas para UX: mostrar o botao apenas se a raridade permite ou e customizado com raridadeId nulo
    // (sem info de podeJogadorAdicionar na resposta simplificada — mostrar sempre para Jogador dono)
    return this.podeEditar();
  }
}
