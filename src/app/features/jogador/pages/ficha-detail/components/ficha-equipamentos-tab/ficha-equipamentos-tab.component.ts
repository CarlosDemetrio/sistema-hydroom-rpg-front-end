import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ConfirmationService } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { SkeletonModule } from 'primeng/skeleton';
import { TabsModule } from 'primeng/tabs';
import { FichaEquipamentosStore } from '@features/jogador/stores/ficha-equipamentos.store';
import {
  AdicionarFichaItemRequest,
  AdicionarFichaItemCustomizadoRequest,
  AlterarDurabilidadeRequest,
  FichaItemViewModel,
} from '@core/models/ficha-item.model';
import { ToastService } from '@services/toast.service';
import { FichaItemCardComponent } from './ficha-item-card/ficha-item-card.component';
import { FichaItemDetalheDrawerComponent } from './ficha-item-detalhe-drawer/ficha-item-detalhe-drawer.component';
import { FichaItemAdicionarDialogComponent } from './ficha-item-adicionar-dialog/ficha-item-adicionar-dialog.component';

/**
 * FichaEquipamentosTabComponent — Componente SMART (Container).
 *
 * Responsabilidades:
 * - Gerencia o FichaEquipamentosStore (carregamento, equipar, desequipar, remover, adicionar)
 * - Exibe barra de capacidade de carga
 * - Orquestra FichaItemCardComponent (dumb), FichaItemDetalheDrawerComponent, FichaItemAdicionarDialogComponent
 * - Trata confirmacoes de remocao via p-confirmDialog
 */
@Component({
  selector: 'app-ficha-equipamentos-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [FichaEquipamentosStore, ConfirmationService],
  imports: [
    DecimalPipe,
    BadgeModule,
    ButtonModule,
    ConfirmDialogModule,
    ProgressBarModule,
    SkeletonModule,
    TabsModule,
    FichaItemCardComponent,
    FichaItemDetalheDrawerComponent,
    FichaItemAdicionarDialogComponent,
  ],
  template: `
    <p-confirmdialog />

    <div class="p-3 flex flex-col gap-4">

      <!-- Barra de capacidade de carga -->
      @let percPeso =
        store.capacidadeCarga() > 0
          ? (store.pesoTotal() / store.capacidadeCarga()) * 100
          : 0;
        @let corPeso =
          percPeso < 50
            ? 'var(--p-green-500)'
            : percPeso < 80
              ? 'var(--p-orange-500)'
              : 'var(--p-red-500)';

      <div class="mb-2">
        <div class="flex justify-content-between align-items-center mb-1">
          <span class="text-sm font-semibold">
            <i class="pi pi-database mr-1"></i>Capacidade de Carga
          </span>
          <span
            class="text-sm font-mono"
            [class.text-red-500]="percPeso >= 80"
            [class.text-yellow-600]="percPeso >= 50 && percPeso < 80"
          >
            {{ store.pesoTotal() | number: '1.1-1' }} /
            {{ store.capacidadeCarga() }} kg
          </span>
        </div>
        <p-progressBar
          [value]="percPeso"
          [color]="corPeso"
          styleClass="h-1rem"
          [attr.aria-label]="
            'Peso: ' + store.pesoTotal() + ' de ' + store.capacidadeCarga() + ' kg'
          "
        />
        @if (percPeso >= 80) {
          <small class="text-red-500 flex align-items-center gap-1 mt-1">
            <i class="pi pi-exclamation-triangle text-xs"></i>
            Sobrecarregado! Verifique o peso do inventario.
          </small>
        }
        @if (store.capacidadeCarga() > 0) {
          <small class="text-xs text-color-secondary mt-1 block">
            Impeto de Forca (FOR x 3): {{ store.capacidadeCarga() }} kg maximos
          </small>
        }
      </div>

      <!-- Acoes principais -->
      <div class="flex gap-2 justify-content-end flex-wrap">
        <p-button
          label="Adicionar Item"
          icon="pi pi-plus"
          size="small"
          [disabled]="!podeEditar() && !isMestre()"
          aria-label="Abrir catalogo para adicionar item"
          (onClick)="store.abrirDialogAdicionar()"
        />
        @if (isMestre()) {
          <span class="text-xs text-color-secondary flex align-items-center">
            Item customizado disponivel no catalogo
          </span>
        }
      </div>

      <!-- Loading state -->
      @if (store.loading()) {
        <div class="flex flex-col gap-3" aria-busy="true" aria-label="Carregando inventario">
          @for (_ of [1, 2, 3]; track $index) {
            <p-skeleton height="100px" borderRadius="8px" />
          }
        </div>
      }

      <!-- Erro -->
      @if (store.erro() && !store.loading()) {
        <div class="flex flex-col align-items-center justify-content-center p-4 gap-2">
          <i class="pi pi-exclamation-circle text-red-500 text-3xl"></i>
          <p class="text-color-secondary m-0">{{ store.erro() }}</p>
          <p-button
            label="Tentar novamente"
            icon="pi pi-refresh"
            size="small"
            outlined
            aria-label="Recarregar inventario"
            (onClick)="store.carregar(fichaId())"
          />
        </div>
      }

      <!-- Conteudo: tabs Equipado / Inventario -->
      @if (!store.loading() && !store.erro()) {
        <p-tabs [value]="0" scrollable>
          <p-tablist>
            <p-tab [value]="0" aria-label="Itens equipados">
              <i class="pi pi-arrow-up mr-2"></i>
              Equipado
              @if (store.equipados().length > 0) {
                <p-badge
                  [value]="store.equipados().length.toString()"
                  severity="success"
                  class="ml-2"
                />
              }
            </p-tab>
            <p-tab [value]="1" aria-label="Itens no inventario">
              <i class="pi pi-inbox mr-2"></i>
              Inventario
              @if (store.inventario().length > 0) {
                <p-badge
                  [value]="store.inventario().length.toString()"
                  severity="secondary"
                  class="ml-2"
                />
              }
            </p-tab>
          </p-tablist>

          <p-tabpanels>
            <!-- Aba: Equipado -->
            <p-tabpanel [value]="0">
              @if (store.equipados().length === 0) {
                <div
                  class="flex flex-col align-items-center justify-content-center p-8 gap-4 text-center"
                >
                  <i
                    class="pi pi-shield text-color-secondary"
                    style="font-size: 3rem"
                    aria-hidden="true"
                  ></i>
                  <h3 class="font-semibold m-0">Nenhum item equipado</h3>
                  <p class="text-color-secondary m-0 max-w-20rem">
                    Equipe itens do inventario clicando em "Equipar".
                  </p>
                </div>
              } @else {
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-2">
                  @for (item of store.equipadosViewModel(); track item.id) {
                    <app-ficha-item-card
                      [item]="item"
                      [podeEditar]="podeEditar()"
                      [isMestre]="isMestre()"
                      (equipar)="onEquipar($event)"
                      (desequipar)="onDesequipar($event)"
                      (verDetalhes)="store.abrirDetalhe($event)"
                      (remover)="confirmarRemocao($event, item.nome)"
                    />
                  }
                </div>
              }
            </p-tabpanel>

            <!-- Aba: Inventario -->
            <p-tabpanel [value]="1">
              @if (store.inventario().length === 0) {
                <div
                  class="flex flex-col align-items-center justify-content-center p-8 gap-4 text-center"
                >
                  <i
                    class="pi pi-shield text-color-secondary"
                    style="font-size: 3rem"
                    aria-hidden="true"
                  ></i>
                  <h3 class="font-semibold m-0">Inventario vazio</h3>
                  <p class="text-color-secondary m-0 max-w-20rem">
                    Nenhum item no inventario. Adicione itens do catalogo do jogo.
                  </p>
                  @if (podeEditar() || isMestre()) {
                    <p-button
                      label="Adicionar primeiro item"
                      icon="pi pi-plus"
                      aria-label="Adicionar primeiro item ao inventario"
                      (onClick)="store.abrirDialogAdicionar()"
                    />
                  }
                </div>
              } @else {
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-2">
                  @for (item of store.inventarioViewModel(); track item.id) {
                    <app-ficha-item-card
                      [item]="item"
                      [podeEditar]="podeEditar()"
                      [isMestre]="isMestre()"
                      (equipar)="onEquipar($event)"
                      (desequipar)="onDesequipar($event)"
                      (verDetalhes)="store.abrirDetalhe($event)"
                      (remover)="confirmarRemocao($event, item.nome)"
                    />
                  }
                </div>
              }
            </p-tabpanel>
          </p-tabpanels>
        </p-tabs>
      }

    </div>

    <!-- Drawer de detalhes -->
    <app-ficha-item-detalhe-drawer
      [visivel]="store.drawerDetalheAberto()"
      (visivelChange)="onDrawerVisivelChange($event)"
      [item]="itemDetalhadoViewModel()"
      [podeEditar]="podeEditar()"
      [isMestre]="isMestre()"
      (equipar)="onEquipar($event)"
      (desequipar)="onDesequipar($event)"
      (alterarDurabilidade)="onAlterarDurabilidade($event)"
    />

    <!-- Dialog de adicionar item -->
    @if (store.dialogAdicionarAberto()) {
      <app-ficha-item-adicionar-dialog
        [visivel]="store.dialogAdicionarAberto()"
        (visivelChange)="onDialogAdicionarVisivelChange($event)"
        [jogoId]="jogoId()"
        [isMestre]="isMestre()"
        (adicionarItem)="onAdicionarItem($event)"
        (adicionarCustomizado)="onAdicionarCustomizado($event)"
      />
    }
  `,
})
export class FichaEquipamentosTabComponent implements OnInit {
  fichaId = input.required<number>();
  jogoId = input.required<number>();
  podeEditar = input.required<boolean>();
  isMestre = input.required<boolean>();

  protected store = inject(FichaEquipamentosStore);
  private toastService = inject(ToastService);
  private confirmationService = inject(ConfirmationService);

  protected itemDetalhadoViewModel = computed(() => {
    const item = this.store.itemDetalhado();
    if (!item) return null;
    return {
      ...item,
      raridadeCorEfetiva: item.raridadeCor ?? '#9d9d9d',
      estaQuebrado: item.duracaoPadrao != null && item.duracaoAtual === 0,
      isCustomizado: item.itemConfigId == null,
    } as FichaItemViewModel;
  });

  ngOnInit(): void {
    this.store.carregar(this.fichaId());
  }

  protected onEquipar(itemId: number): void {
    this.store.equipar(this.fichaId(), itemId);
  }

  protected onDesequipar(itemId: number): void {
    this.store.desequipar(this.fichaId(), itemId);
  }

  protected confirmarRemocao(itemId: number, nome: string): void {
    this.confirmationService.confirm({
      message: `Remover "${nome}" do inventario? Esta acao nao pode ser desfeita.`,
      header: 'Confirmar Remocao',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Remover',
      rejectLabel: 'Cancelar',
      acceptButtonProps: { severity: 'danger' },
      accept: () => {
        this.store.remover(this.fichaId(), itemId);
        this.toastService.success(`"${nome}" removido do inventario.`);
      },
    });
  }

  protected onAdicionarItem(request: AdicionarFichaItemRequest): void {
    this.store.adicionar(this.fichaId(), request, () => {
      this.toastService.success('Item adicionado ao inventario!');
    });
  }

  protected onAdicionarCustomizado(
    request: AdicionarFichaItemCustomizadoRequest,
  ): void {
    this.store.adicionarCustomizado(this.fichaId(), request, () => {
      this.toastService.success('Item customizado adicionado ao inventario!');
    });
  }

  protected onAlterarDurabilidade(event: {
    itemId: number;
    request: AlterarDurabilidadeRequest;
  }): void {
    this.store.alterarDurabilidade(this.fichaId(), event.itemId, event.request);
    this.toastService.success('Durabilidade atualizada.');
  }

  protected onDrawerVisivelChange(visivel: boolean): void {
    if (!visivel) {
      this.store.fecharDetalhe();
    }
  }

  protected onDialogAdicionarVisivelChange(visivel: boolean): void {
    if (!visivel) {
      this.store.fecharDialogAdicionar();
    }
  }
}
