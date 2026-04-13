/**
 * FichaItemService — Spec
 *
 * Cenarios cobertos:
 * 1. listarInventario: GET /api/v1/fichas/{fichaId}/itens
 * 2. adicionar: POST /api/v1/fichas/{fichaId}/itens
 * 3. adicionarCustomizado: POST /api/v1/fichas/{fichaId}/itens/customizado
 * 4. equipar: PATCH /api/v1/fichas/{fichaId}/itens/{itemId}/equipar
 * 5. desequipar: PATCH /api/v1/fichas/{fichaId}/itens/{itemId}/desequipar
 * 6. alterarDurabilidade: POST /api/v1/fichas/{fichaId}/itens/{itemId}/durabilidade
 * 7. remover: DELETE /api/v1/fichas/{fichaId}/itens/{itemId}
 */

import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FichaItemService } from './ficha-item.service';
import {
  FichaInventarioResponse,
  FichaItemResponse,
  AdicionarFichaItemRequest,
  AdicionarFichaItemCustomizadoRequest,
  AlterarDurabilidadeRequest,
} from '@core/models/ficha-item.model';

// ---------------------------------------------------------------------------
// Dados de teste
// ---------------------------------------------------------------------------

const itemMock: FichaItemResponse = {
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
  raridadeCor: '#9d9d9d',
  dataCriacao: '2024-01-01T00:00:00',
};

const inventarioMock: FichaInventarioResponse = {
  equipados: [],
  inventario: [itemMock],
  pesoTotal: 2.0,
  capacidadeCarga: 18.0,
  sobrecarregado: false,
};

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('FichaItemService', () => {
  let service: FichaItemService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FichaItemService],
    });
    service = TestBed.inject(FichaItemService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // --- 1. listarInventario ---
  it('deve chamar GET /api/v1/fichas/10/itens e retornar inventario', () => {
    let resultado: FichaInventarioResponse | undefined;
    service.listarInventario(10).subscribe((r) => (resultado = r));

    const req = httpMock.expectOne('/api/v1/fichas/10/itens');
    expect(req.request.method).toBe('GET');
    req.flush(inventarioMock);

    expect(resultado).toEqual(inventarioMock);
  });

  // --- 2. adicionar ---
  it('deve chamar POST /api/v1/fichas/10/itens com payload correto', () => {
    const request: AdicionarFichaItemRequest = {
      itemConfigId: 5,
      quantidade: 1,
      notas: undefined,
      forcarAdicao: false,
    };
    let resultado: FichaItemResponse | undefined;
    service.adicionar(10, request).subscribe((r) => (resultado = r));

    const req = httpMock.expectOne('/api/v1/fichas/10/itens');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(itemMock);

    expect(resultado).toEqual(itemMock);
  });

  // --- 3. adicionarCustomizado ---
  it('deve chamar POST /api/v1/fichas/10/itens/customizado', () => {
    const request: AdicionarFichaItemCustomizadoRequest = {
      nome: 'Faca Artesanal',
      raridadeId: 1,
      peso: 0.5,
      quantidade: 1,
    };
    service.adicionarCustomizado(10, request).subscribe();

    const req = httpMock.expectOne('/api/v1/fichas/10/itens/customizado');
    expect(req.request.method).toBe('POST');
    req.flush(itemMock);
  });

  // --- 4. equipar ---
  it('deve chamar PATCH /api/v1/fichas/10/itens/1/equipar', () => {
    let resultado: FichaItemResponse | undefined;
    service.equipar(10, 1).subscribe((r) => (resultado = r));

    const req = httpMock.expectOne('/api/v1/fichas/10/itens/1/equipar');
    expect(req.request.method).toBe('PATCH');
    req.flush({ ...itemMock, equipado: true });

    expect(resultado?.equipado).toBe(true);
  });

  // --- 5. desequipar ---
  it('deve chamar PATCH /api/v1/fichas/10/itens/1/desequipar', () => {
    service.desequipar(10, 1).subscribe();

    const req = httpMock.expectOne('/api/v1/fichas/10/itens/1/desequipar');
    expect(req.request.method).toBe('PATCH');
    req.flush(itemMock);
  });

  // --- 6. alterarDurabilidade ---
  it('deve chamar POST /api/v1/fichas/10/itens/1/durabilidade com payload correto', () => {
    const request: AlterarDurabilidadeRequest = { decremento: 10, restaurar: false };
    service.alterarDurabilidade(10, 1, request).subscribe();

    const req = httpMock.expectOne('/api/v1/fichas/10/itens/1/durabilidade');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush({ ...itemMock, duracaoAtual: 70 });
  });

  // --- 7. remover ---
  it('deve chamar DELETE /api/v1/fichas/10/itens/1', () => {
    service.remover(10, 1).subscribe();

    const req = httpMock.expectOne('/api/v1/fichas/10/itens/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
