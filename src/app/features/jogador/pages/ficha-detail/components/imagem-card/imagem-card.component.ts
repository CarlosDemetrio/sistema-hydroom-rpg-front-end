import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { FichaImagem } from '@core/models/ficha-imagem.model';

/**
 * ImagemCardComponent — DUMB (Presentacional)
 *
 * Exibe uma imagem da galeria da ficha com badge de tipo e acoes de deletar/expandir.
 * Nao injeta servicos — apenas recebe dados via input() e emite eventos via output().
 */
@Component({
  selector: 'app-imagem-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonModule],
  template: `
    <div class="imagem-card relative overflow-hidden rounded-md border border-surface-200">
      <div class="relative cursor-pointer" (click)="expandir.emit(imagem())" role="button"
           [attr.aria-label]="'Expandir imagem ' + (imagem().titulo ?? 'do personagem')">
        <img
          [src]="imagem().urlCloudinary"
          [alt]="imagem().titulo ?? 'Imagem do personagem'"
          class="w-full object-cover"
          style="aspect-ratio: 1 / 1;"
          (error)="onImageError($event)"
        />
        @if (imagem().tipoImagem === 'AVATAR') {
          <span class="absolute top-2 left-2 text-xs bg-primary text-primary-contrast px-2 py-0.5 rounded font-medium">
            Avatar
          </span>
        }
      </div>

      @if (imagem().titulo) {
        <p class="text-xs text-center px-1 py-1 truncate m-0">{{ imagem().titulo }}</p>
      }

      @if (podeEditar() || podeDeletar()) {
        <div class="flex gap-1 justify-end px-1 pb-1">
          @if (podeDeletar()) {
            <p-button
              icon="pi pi-trash"
              size="small"
              text
              severity="danger"
              [attr.aria-label]="'Remover imagem ' + (imagem().titulo ?? '')"
              (onClick)="confirmarDelete()"
            />
          }
        </div>
      }
    </div>
  `,
  styles: [],
})
export class ImagemCardComponent {
  imagem = input.required<FichaImagem>();
  podeEditar = input.required<boolean>();
  podeDeletar = input.required<boolean>();

  deletar = output<number>();
  expandir = output<FichaImagem>();

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  confirmarDelete(): void {
    this.deletar.emit(this.imagem().id);
  }
}
