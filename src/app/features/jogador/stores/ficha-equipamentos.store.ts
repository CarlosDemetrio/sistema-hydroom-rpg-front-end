import { computed, inject } from '@angular/core';
import {
  signalStore,
  withState,
  withComputed,
  withMethods,
  patchState,
} from '@ngrx/signals';
import { FichaItemService } from '@core/services/api/ficha-item.service';
import {
  FichaItemResponse,
  FichaItemViewModel,
  AdicionarFichaItemRequest,
  AdicionarFichaItemCustomizadoRequest,
  AlterarDurabilidadeRequest,
} from '@core/models/ficha-item.model';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface FichaEquipamentosState {
  equipados: FichaItemResponse[];
  inventario: FichaItemResponse[];
  pesoTotal: number;
  capacidadeCarga: number;
  sobrecarregado: boolean;
  loading: boolean;
  erro: string | null;
  itemDetalhado: FichaItemResponse | null;
  drawerDetalheAberto: boolean;
  dialogAdicionarAberto: boolean;
}

const initialState: FichaEquipamentosState = {
  equipados: [],
  inventario: [],
  pesoTotal: 0,
  capacidadeCarga: 0,
  sobrecarregado: false,
  loading: false,
  erro: null,
  itemDetalhado: null,
  drawerDetalheAberto: false,
  dialogAdicionarAberto: false,
};

// ---------------------------------------------------------------------------
// Utilitario: transforma FichaItemResponse em FichaItemViewModel
// ---------------------------------------------------------------------------

export function toViewModel(item: FichaItemResponse): FichaItemViewModel {
  return {
    ...item,
    raridadeCorEfetiva: item.raridadeCor ?? '#9d9d9d',
    estaQuebrado: item.duracaoPadrao != null && item.duracaoAtual === 0,
    isCustomizado: item.itemConfigId == null,
  };
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const FichaEquipamentosStore = signalStore(
  withState(initialState),

  withComputed((store) => ({
    equipadosViewModel: computed(() => store.equipados().map(toViewModel)),
    inventarioViewModel: computed(() => store.inventario().map(toViewModel)),
    totalItens: computed(
      () => store.equipados().length + store.inventario().length,
    ),
  })),

  withMethods((store, service = inject(FichaItemService)) => ({
    /**
     * Carrega o inventario completo da ficha.
     */
    carregar(fichaId: number): void {
      patchState(store, { loading: true, erro: null });
      service.listarInventario(fichaId).subscribe({
        next: (resp) =>
          patchState(store, {
            equipados: resp.equipados,
            inventario: resp.inventario,
            pesoTotal: Number(resp.pesoTotal),
            capacidadeCarga: Number(resp.capacidadeCarga),
            sobrecarregado: resp.sobrecarregado,
            loading: false,
          }),
        error: () =>
          patchState(store, {
            loading: false,
            erro: 'Erro ao carregar inventario.',
          }),
      });
    },

    /**
     * Equipa um item — atualiza localmente sem recarregar.
     */
    equipar(fichaId: number, itemId: number): void {
      service.equipar(fichaId, itemId).subscribe({
        next: (itemAtualizado) => {
          patchState(store, {
            inventario: store
              .inventario()
              .filter((i) => i.id !== itemId),
            equipados: [...store.equipados(), itemAtualizado],
          });
        },
      });
    },

    /**
     * Desequipa um item — atualiza localmente sem recarregar.
     */
    desequipar(fichaId: number, itemId: number): void {
      service.desequipar(fichaId, itemId).subscribe({
        next: (itemAtualizado) => {
          patchState(store, {
            equipados: store
              .equipados()
              .filter((i) => i.id !== itemId),
            inventario: [...store.inventario(), itemAtualizado],
          });
        },
      });
    },

    /**
     * Remove um item do inventario (soft delete).
     */
    remover(fichaId: number, itemId: number): void {
      service.remover(fichaId, itemId).subscribe({
        next: () => {
          patchState(store, {
            equipados: store
              .equipados()
              .filter((i) => i.id !== itemId),
            inventario: store
              .inventario()
              .filter((i) => i.id !== itemId),
            // Fecha drawer se estava visualizando o item removido
            drawerDetalheAberto:
              store.itemDetalhado()?.id === itemId
                ? false
                : store.drawerDetalheAberto(),
            itemDetalhado:
              store.itemDetalhado()?.id === itemId
                ? null
                : store.itemDetalhado(),
          });
        },
      });
    },

    /**
     * Adiciona item do catalogo; recarrega apos sucesso.
     */
    adicionar(
      fichaId: number,
      request: AdicionarFichaItemRequest,
      onSuccess: () => void,
    ): void {
      service.adicionar(fichaId, request).subscribe({
        next: (novoItem) => {
          patchState(store, {
            inventario: [...store.inventario(), novoItem],
            dialogAdicionarAberto: false,
          });
          onSuccess();
        },
      });
    },

    /**
     * Adiciona item customizado (Mestre); recarrega apos sucesso.
     */
    adicionarCustomizado(
      fichaId: number,
      request: AdicionarFichaItemCustomizadoRequest,
      onSuccess: () => void,
    ): void {
      service.adicionarCustomizado(fichaId, request).subscribe({
        next: (novoItem) => {
          patchState(store, {
            inventario: [...store.inventario(), novoItem],
            dialogAdicionarAberto: false,
          });
          onSuccess();
        },
      });
    },

    /**
     * Altera durabilidade de um item (Mestre).
     */
    alterarDurabilidade(
      fichaId: number,
      itemId: number,
      request: AlterarDurabilidadeRequest,
    ): void {
      service.alterarDurabilidade(fichaId, itemId, request).subscribe({
        next: (itemAtualizado) => {
          // Atualiza nas duas listas
          patchState(store, {
            equipados: store
              .equipados()
              .map((i) => (i.id === itemId ? itemAtualizado : i)),
            inventario: store
              .inventario()
              .map((i) => (i.id === itemId ? itemAtualizado : i)),
            itemDetalhado:
              store.itemDetalhado()?.id === itemId
                ? itemAtualizado
                : store.itemDetalhado(),
          });
        },
      });
    },

    /**
     * Abre drawer de detalhes para o item informado.
     */
    abrirDetalhe(item: FichaItemResponse): void {
      patchState(store, { itemDetalhado: item, drawerDetalheAberto: true });
    },

    /**
     * Fecha o drawer de detalhes.
     */
    fecharDetalhe(): void {
      patchState(store, { drawerDetalheAberto: false, itemDetalhado: null });
    },

    /**
     * Abre o dialog de adicionar item.
     */
    abrirDialogAdicionar(): void {
      patchState(store, { dialogAdicionarAberto: true });
    },

    /**
     * Fecha o dialog de adicionar item.
     */
    fecharDialogAdicionar(): void {
      patchState(store, { dialogAdicionarAberto: false });
    },
  })),
);
