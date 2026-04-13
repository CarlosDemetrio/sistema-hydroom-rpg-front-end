/**
 * FichaEquipamentosStore — Spec
 *
 * Cenarios cobertos:
 * 1.  Estado inicial: arrays vazios, loading=false, erro=null
 * 2.  carregar: popula equipados, inventario, pesoTotal, capacidadeCarga
 * 3.  carregar: define erro quando service falha
 * 4.  equipar: move item de inventario para equipados localmente
 * 5.  desequipar: move item de equipados para inventario localmente
 * 6.  remover: remove item das duas listas
 * 7.  remover: fecha drawer se item detalhado era o removido
 * 8.  adicionar: adiciona item ao inventario e fecha dialog
 * 9.  abrirDetalhe: define itemDetalhado e drawerDetalheAberto=true
 * 10. fecharDetalhe: limpa itemDetalhado e drawerDetalheAberto=false
 * 11. abrirDialogAdicionar: define dialogAdicionarAberto=true
 * 12. equipadosViewModel: calcula raridadeCorEfetiva corretamente
 * 13. inventarioViewModel: marca estaQuebrado quando duracaoAtual=0
 */

import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Subject } from 'rxjs';
import { FichaEquipamentosStore, toViewModel } from './ficha-equipamentos.store';
import { FichaItemService } from '@core/services/api/ficha-item.service';
import {
  FichaInventarioResponse,
  FichaItemResponse,
} from '@core/models/ficha-item.model';

// ---------------------------------------------------------------------------
// Dados de teste
// ---------------------------------------------------------------------------

function makeItem(overrides: Partial<FichaItemResponse> = {}): FichaItemResponse {
  return {
    id: 1,
    fichaId: 10,
    itemConfigId: 5,
    nome: 'Espada Curta',
    equipado: false,
    duracaoAtual: 80,
    duracaoPadrao: 100,
    quantidade: 1,
    peso: 2.0,
    pesoEfetivo: 2.0,
    notas: null,
    adicionadoPor: 'Mestre',
    raridadeId: 1,
    raridadeNome: 'Comum',
    raridadeCor: '#ff0000',
    dataCriacao: '2024-01-01T00:00:00',
    ...overrides,
  };
}

const inventarioMock: FichaInventarioResponse = {
  equipados: [makeItem({ id: 2, equipado: true })],
  inventario: [makeItem({ id: 1, equipado: false })],
  pesoTotal: 4.0,
  capacidadeCarga: 18.0,
  sobrecarregado: false,
};

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('FichaEquipamentosStore', () => {
  let store: InstanceType<typeof FichaEquipamentosStore>;
  let mockService: {
    listarInventario: ReturnType<typeof vi.fn>;
    equipar: ReturnType<typeof vi.fn>;
    desequipar: ReturnType<typeof vi.fn>;
    remover: ReturnType<typeof vi.fn>;
    adicionar: ReturnType<typeof vi.fn>;
    adicionarCustomizado: ReturnType<typeof vi.fn>;
    alterarDurabilidade: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockService = {
      listarInventario: vi.fn(),
      equipar: vi.fn(),
      desequipar: vi.fn(),
      remover: vi.fn(),
      adicionar: vi.fn(),
      adicionarCustomizado: vi.fn(),
      alterarDurabilidade: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        FichaEquipamentosStore,
        { provide: FichaItemService, useValue: mockService },
      ],
    });
    store = TestBed.inject(FichaEquipamentosStore);
  });

  // --- 1. Estado inicial ---
  it('inicia com arrays vazios e loading=false', () => {
    expect(store.equipados()).toEqual([]);
    expect(store.inventario()).toEqual([]);
    expect(store.loading()).toBe(false);
    expect(store.erro()).toBeNull();
  });

  // --- 2. carregar: sucesso ---
  it('popula inventario ao carregar com sucesso', () => {
    const subject = new Subject<FichaInventarioResponse>();
    mockService.listarInventario.mockReturnValue(subject.asObservable());

    store.carregar(10);
    expect(store.loading()).toBe(true);

    subject.next(inventarioMock);
    subject.complete();

    expect(store.loading()).toBe(false);
    expect(store.equipados()).toHaveLength(1);
    expect(store.inventario()).toHaveLength(1);
    expect(store.pesoTotal()).toBe(4.0);
    expect(store.capacidadeCarga()).toBe(18.0);
  });

  // --- 3. carregar: erro ---
  it('define erro quando service falha', () => {
    const subject = new Subject<FichaInventarioResponse>();
    mockService.listarInventario.mockReturnValue(subject.asObservable());

    store.carregar(10);
    subject.error(new Error('Network error'));

    expect(store.loading()).toBe(false);
    expect(store.erro()).toBeTruthy();
  });

  // --- 4. equipar: move item ---
  it('move item de inventario para equipados ao equipar', () => {
    const itemInv = makeItem({ id: 1, equipado: false });
    const itemEq = makeItem({ id: 1, equipado: true });
    const subject = new Subject<FichaItemResponse>();
    mockService.equipar.mockReturnValue(subject.asObservable());

    // Setup inicial: item no inventario
    const loadSubject = new Subject<FichaInventarioResponse>();
    mockService.listarInventario.mockReturnValue(loadSubject.asObservable());
    store.carregar(10);
    loadSubject.next({ ...inventarioMock, inventario: [itemInv], equipados: [] });
    loadSubject.complete();

    store.equipar(10, 1);
    subject.next(itemEq);
    subject.complete();

    expect(store.inventario().find((i) => i.id === 1)).toBeUndefined();
    expect(store.equipados().find((i) => i.id === 1)).toBeTruthy();
  });

  // --- 5. desequipar: move item ---
  it('move item de equipados para inventario ao desequipar', () => {
    const itemEq = makeItem({ id: 2, equipado: true });
    const itemInv = makeItem({ id: 2, equipado: false });
    const subject = new Subject<FichaItemResponse>();
    mockService.desequipar.mockReturnValue(subject.asObservable());

    const loadSubject = new Subject<FichaInventarioResponse>();
    mockService.listarInventario.mockReturnValue(loadSubject.asObservable());
    store.carregar(10);
    loadSubject.next({ ...inventarioMock, equipados: [itemEq], inventario: [] });
    loadSubject.complete();

    store.desequipar(10, 2);
    subject.next(itemInv);
    subject.complete();

    expect(store.equipados().find((i) => i.id === 2)).toBeUndefined();
    expect(store.inventario().find((i) => i.id === 2)).toBeTruthy();
  });

  // --- 6. remover: remove das listas ---
  it('remove item das listas ao remover', () => {
    const subject = new Subject<void>();
    mockService.remover.mockReturnValue(subject.asObservable());

    const loadSubject = new Subject<FichaInventarioResponse>();
    mockService.listarInventario.mockReturnValue(loadSubject.asObservable());
    store.carregar(10);
    loadSubject.next(inventarioMock);
    loadSubject.complete();

    store.remover(10, 1);
    subject.next();
    subject.complete();

    expect(store.inventario().find((i) => i.id === 1)).toBeUndefined();
  });

  // --- 7. remover: fecha drawer do item removido ---
  it('fecha drawer quando o item detalhado e removido', () => {
    const item = makeItem({ id: 1 });
    const subject = new Subject<void>();
    mockService.remover.mockReturnValue(subject.asObservable());

    const loadSubject = new Subject<FichaInventarioResponse>();
    mockService.listarInventario.mockReturnValue(loadSubject.asObservable());
    store.carregar(10);
    loadSubject.next({ ...inventarioMock, inventario: [item], equipados: [] });
    loadSubject.complete();

    store.abrirDetalhe(item);
    expect(store.drawerDetalheAberto()).toBe(true);

    store.remover(10, 1);
    subject.next();
    subject.complete();

    expect(store.drawerDetalheAberto()).toBe(false);
    expect(store.itemDetalhado()).toBeNull();
  });

  // --- 8. adicionar: adiciona ao inventario ---
  it('adiciona item ao inventario ao chamar adicionar', () => {
    const novoItem = makeItem({ id: 99, nome: 'Arco Curto' });
    const subject = new Subject<FichaItemResponse>();
    mockService.adicionar.mockReturnValue(subject.asObservable());

    const onSuccess = vi.fn();
    store.adicionar(
      10,
      { itemConfigId: 3, quantidade: 1, forcarAdicao: false },
      onSuccess,
    );
    subject.next(novoItem);
    subject.complete();

    expect(store.inventario().find((i) => i.id === 99)).toBeTruthy();
    expect(store.dialogAdicionarAberto()).toBe(false);
    expect(onSuccess).toHaveBeenCalled();
  });

  // --- 9. abrirDetalhe ---
  it('define itemDetalhado e abre drawer ao abrirDetalhe', () => {
    const item = makeItem({ id: 5 });
    store.abrirDetalhe(item);
    expect(store.itemDetalhado()).toEqual(item);
    expect(store.drawerDetalheAberto()).toBe(true);
  });

  // --- 10. fecharDetalhe ---
  it('limpa itemDetalhado e fecha drawer ao fecharDetalhe', () => {
    const item = makeItem();
    store.abrirDetalhe(item);
    store.fecharDetalhe();
    expect(store.itemDetalhado()).toBeNull();
    expect(store.drawerDetalheAberto()).toBe(false);
  });

  // --- 11. abrirDialogAdicionar ---
  it('define dialogAdicionarAberto=true ao abrirDialogAdicionar', () => {
    store.abrirDialogAdicionar();
    expect(store.dialogAdicionarAberto()).toBe(true);
  });

  // --- 12. equipadosViewModel: raridadeCorEfetiva ---
  it('calcula raridadeCorEfetiva como cor da raridade quando definida', () => {
    const loadSubject = new Subject<FichaInventarioResponse>();
    mockService.listarInventario.mockReturnValue(loadSubject.asObservable());
    store.carregar(10);
    loadSubject.next({
      ...inventarioMock,
      equipados: [makeItem({ id: 2, equipado: true, raridadeCor: '#ff0000' })],
      inventario: [],
    });
    loadSubject.complete();

    const vm = store.equipadosViewModel()[0];
    expect(vm.raridadeCorEfetiva).toBe('#ff0000');
  });

  // --- 13. inventarioViewModel: estaQuebrado quando duracaoAtual=0 ---
  it('marca estaQuebrado=true quando duracaoAtual=0 e duracaoPadrao definido', () => {
    const loadSubject = new Subject<FichaInventarioResponse>();
    mockService.listarInventario.mockReturnValue(loadSubject.asObservable());
    store.carregar(10);
    loadSubject.next({
      ...inventarioMock,
      inventario: [makeItem({ id: 1, duracaoAtual: 0, duracaoPadrao: 100 })],
      equipados: [],
    });
    loadSubject.complete();

    const vm = store.inventarioViewModel()[0];
    expect(vm.estaQuebrado).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// toViewModel unit tests
// ---------------------------------------------------------------------------

describe('toViewModel', () => {
  it('usa cor fallback #9d9d9d quando raridadeCor e null', () => {
    const item = {
      id: 1,
      fichaId: 1,
      itemConfigId: null,
      nome: 'Pedra',
      equipado: false,
      duracaoAtual: null,
      duracaoPadrao: null,
      quantidade: 1,
      peso: 0.1,
      pesoEfetivo: 0.1,
      notas: null,
      adicionadoPor: 'Mestre',
      raridadeId: null,
      raridadeNome: null,
      raridadeCor: null,
      dataCriacao: '2024-01-01T00:00:00',
    };
    const vm = toViewModel(item);
    expect(vm.raridadeCorEfetiva).toBe('#9d9d9d');
  });

  it('marca isCustomizado=true quando itemConfigId e null', () => {
    const item = {
      id: 1,
      fichaId: 1,
      itemConfigId: null,
      nome: 'Item custom',
      equipado: false,
      duracaoAtual: null,
      duracaoPadrao: null,
      quantidade: 1,
      peso: 0.0,
      pesoEfetivo: 0.0,
      notas: null,
      adicionadoPor: 'Mestre',
      raridadeId: null,
      raridadeNome: null,
      raridadeCor: null,
      dataCriacao: '2024-01-01T00:00:00',
    };
    expect(toViewModel(item).isCustomizado).toBe(true);
  });

  it('nao marca estaQuebrado quando duracaoPadrao e null', () => {
    const item = {
      id: 1,
      fichaId: 1,
      itemConfigId: 2,
      nome: 'Anel',
      equipado: false,
      duracaoAtual: null,
      duracaoPadrao: null,
      quantidade: 1,
      peso: 0.0,
      pesoEfetivo: 0.0,
      notas: null,
      adicionadoPor: 'Mestre',
      raridadeId: 1,
      raridadeNome: 'Comum',
      raridadeCor: '#9d9d9d',
      dataCriacao: '2024-01-01T00:00:00',
    };
    expect(toViewModel(item).estaQuebrado).toBe(false);
  });
});
