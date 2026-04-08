import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SkeletonModule } from 'primeng/skeleton';
import { FichaImagem, TipoImagem, UploadImagemDto } from '@core/models/ficha-imagem.model';
import { FichaBusinessService } from '@core/services/business/ficha-business.service';
import { ToastService } from '@services/toast.service';
import { ImagemCardComponent } from '../imagem-card/imagem-card.component';

interface TipoOption {
  label: string;
  value: TipoImagem;
}

/**
 * FichaGaleriaTabComponent — SMART (Container)
 *
 * Responsabilidades:
 * - Carrega imagens da ficha via FichaBusinessService
 * - Exibe avatar em destaque e grade de galeria
 * - Gerencia upload de novas imagens via FormData (Cloudinary)
 * - Exibe lightbox ao clicar em qualquer imagem
 * - Controla permissoes de adicionar/remover imagens por role e dono da ficha
 */
@Component({
  selector: 'app-ficha-galeria-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    ButtonModule,
    CardModule,
    DialogModule,
    FileUploadModule,
    InputTextModule,
    SelectButtonModule,
    SkeletonModule,
    ImagemCardComponent,
  ],
  template: `
    <div class="p-3 flex flex-col gap-4">

      <!-- Cabecalho: contador + botao adicionar -->
      <div class="flex justify-between items-center">
        <span class="text-sm text-color-secondary">{{ totalImagens() }}/20 imagens</span>
        @if (podeAdicionarImagem()) {
          <p-button
            label="Adicionar imagem"
            icon="pi pi-upload"
            outlined
            size="small"
            [disabled]="totalImagens() >= 20"
            [attr.aria-label]="showAddForm() ? 'Fechar formulario de upload' : 'Abrir formulario de upload'"
            (onClick)="showAddForm.set(!showAddForm())"
          />
        }
      </div>

      <!-- Formulario de upload -->
      @if (showAddForm()) {
        <p-card styleClass="border border-primary-200">
          <div class="flex flex-col gap-3">
            <p-fileupload
              mode="basic"
              accept="image/jpeg,image/png,image/webp,image/gif"
              [maxFileSize]="10485760"
              chooseLabel="Selecionar imagem (max 10MB)"
              [auto]="false"
              aria-label="Selecionar arquivo de imagem"
              (onSelect)="onArquivoSelecionado($event)"
            />
            <input
              pInputText
              type="text"
              placeholder="Titulo (opcional)"
              class="w-full"
              aria-label="Titulo da imagem"
              [ngModel]="novoTitulo()"
              (ngModelChange)="novoTitulo.set($event)"
            />
            <p-selectbutton
              [options]="tipoOptions"
              [ngModel]="novoTipo()"
              (ngModelChange)="novoTipo.set($event)"
              optionLabel="label"
              optionValue="value"
              aria-label="Tipo de imagem"
            />
            <div class="flex gap-2 justify-end">
              <p-button label="Cancelar" text (onClick)="cancelarUpload()" />
              <p-button
                label="Fazer Upload"
                icon="pi pi-cloud-upload"
                [loading]="uploading()"
                [disabled]="arquivoSelecionado() === null"
                (onClick)="salvarImagem()"
              />
            </div>
          </div>
        </p-card>
      }

      <!-- Loading skeleton -->
      @if (loading()) {
        <div class="grid grid-cols-3 gap-3" aria-busy="true" aria-label="Carregando imagens">
          @for (_ of [1, 2, 3, 4, 5, 6]; track $index) {
            <p-skeleton height="8rem" />
          }
        </div>
      }

      <!-- Empty state -->
      @else if (imagens().length === 0) {
        <div class="flex flex-col items-center py-10 gap-3 text-center">
          <i class="pi pi-images" style="font-size: 3rem; color: var(--text-color-secondary)" aria-hidden="true"></i>
          <p class="text-color-secondary m-0">Nenhuma imagem adicionada ainda.</p>
          @if (podeAdicionarImagem()) {
            <p-button
              label="Adicionar primeira imagem"
              icon="pi pi-upload"
              outlined
              (onClick)="showAddForm.set(true)"
            />
          }
        </div>
      }

      <!-- Galeria com imagens -->
      @else {
        <!-- Avatar em destaque -->
        @if (avatar()) {
          <div>
            <p class="text-sm font-semibold text-color-secondary mb-2 m-0">Avatar</p>
            <div style="max-width: 280px;">
              <app-imagem-card
                [imagem]="avatar()!"
                [podeEditar]="podeAdicionarImagem()"
                [podeDeletar]="podeAdicionarImagem()"
                (deletar)="deletarImagem($event)"
                (expandir)="imagemExpandida.set($event)"
              />
            </div>
          </div>
        }

        <!-- Grade de galeria -->
        @if (galeria().length > 0) {
          <div>
            <p class="text-sm font-semibold text-color-secondary mb-2 m-0">Galeria</p>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
              @for (imagem of galeria(); track imagem.id) {
                <app-imagem-card
                  [imagem]="imagem"
                  [podeEditar]="podeAdicionarImagem()"
                  [podeDeletar]="podeAdicionarImagem()"
                  (deletar)="deletarImagem($event)"
                  (expandir)="imagemExpandida.set($event)"
                />
              }
            </div>
          </div>
        }
      }
    </div>

    <!-- Lightbox -->
    <p-dialog
      [visible]="imagemExpandida() !== null"
      (onHide)="imagemExpandida.set(null)"
      [modal]="true"
      [maximizable]="true"
      [draggable]="false"
      [resizable]="false"
      [header]="imagemExpandida()?.titulo ?? 'Imagem'"
      [style]="{ maxWidth: '90vw' }"
    >
      @if (imagemExpandida()) {
        <div class="flex justify-center">
          <img
            [src]="imagemExpandida()!.urlCloudinary"
            [alt]="imagemExpandida()!.titulo ?? 'Imagem do personagem'"
            class="max-w-full"
            style="max-height: 80vh; object-fit: contain;"
          />
        </div>
      }
    </p-dialog>
  `,
  styles: [],
})
export class FichaGaleriaTabComponent implements OnInit {
  private fichaBusinessService = inject(FichaBusinessService);
  private toastService = inject(ToastService);

  // Inputs
  fichaId = input.required<number>();
  userRole = input.required<'MESTRE' | 'JOGADOR'>();
  userId = input.required<number>();
  fichaJogadorId = input.required<number | null>();

  // Estado interno
  imagens = signal<FichaImagem[]>([]);
  loading = signal(false);
  uploading = signal(false);
  showAddForm = signal(false);
  imagemExpandida = signal<FichaImagem | null>(null);

  // Form de upload
  arquivoSelecionado = signal<File | null>(null);
  novoTipo = signal<TipoImagem>('GALERIA');
  novoTitulo = signal('');

  // Computed
  avatar = computed(() => this.imagens().find(i => i.tipoImagem === 'AVATAR') ?? null);
  galeria = computed(() => this.imagens().filter(i => i.tipoImagem === 'GALERIA'));
  totalImagens = computed(() => this.imagens().length);
  podeAdicionarImagem = computed(() =>
    this.userRole() === 'MESTRE' ||
    (this.userId() !== null && this.userId() === this.fichaJogadorId())
  );

  tipoOptions: TipoOption[] = [
    { label: 'Imagem de Galeria', value: 'GALERIA' },
    { label: 'Avatar (imagem principal)', value: 'AVATAR' },
  ];

  ngOnInit(): void {
    this.carregarImagens();
  }

  carregarImagens(): void {
    this.loading.set(true);
    this.fichaBusinessService.loadImagens(this.fichaId()).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: imagens => this.imagens.set(imagens),
      error: () => this.toastService.error('Nao foi possivel carregar as imagens da ficha.', 'Erro ao carregar imagens'),
    });
  }

  onArquivoSelecionado(event: { files?: File[] }): void {
    const file = event.files?.[0] ?? null;
    this.arquivoSelecionado.set(file);
  }

  cancelarUpload(): void {
    this.showAddForm.set(false);
    this.arquivoSelecionado.set(null);
    this.novoTitulo.set('');
    this.novoTipo.set('GALERIA');
  }

  salvarImagem(): void {
    const arquivo = this.arquivoSelecionado();
    if (!arquivo) return;

    const dto: UploadImagemDto = {
      arquivo,
      tipoImagem: this.novoTipo(),
      titulo: this.novoTitulo().trim() || undefined,
    };

    this.uploading.set(true);
    this.fichaBusinessService.adicionarImagem(this.fichaId(), dto).pipe(
      finalize(() => this.uploading.set(false))
    ).subscribe({
      next: novaImagem => {
        // Se o novo upload for AVATAR, marcar o avatar anterior como GALERIA localmente
        if (novaImagem.tipoImagem === 'AVATAR') {
          this.imagens.update(list =>
            list.map(i => i.tipoImagem === 'AVATAR' ? { ...i, tipoImagem: 'GALERIA' as TipoImagem } : i)
          );
        }
        this.imagens.update(list => [...list, novaImagem]);
        this.cancelarUpload();
        this.toastService.success('Imagem adicionada com sucesso!', 'Imagem adicionada');
      },
      error: (err: { status?: number }) => {
        const msg = err.status === 422
          ? 'Limite de 20 imagens atingido'
          : 'Nao foi possivel fazer o upload da imagem';
        this.toastService.error(msg, 'Erro no upload');
      },
    });
  }

  deletarImagem(imagemId: number): void {
    this.fichaBusinessService.deletarImagem(this.fichaId(), imagemId).subscribe({
      next: () => {
        this.imagens.update(list => list.filter(i => i.id !== imagemId));
        this.toastService.success('Imagem removida com sucesso.', 'Imagem removida');
      },
      error: () => this.toastService.error('Nao foi possivel remover a imagem.', 'Erro ao remover'),
    });
  }
}
