import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { FichaVisibilidadeApiService } from './ficha-visibilidade.api.service';
import {
  FichaVisibilidadeResponse,
  AtualizarVisibilidadeDto,
  JogadorAcessoItem,
} from '@core/models/ficha.model';

const BASE_URL = '/api/v1';

const jogadorAcesso1: JogadorAcessoItem = {
  jogadorId: 10,
  jogadorNome: 'Alice',
  nomePersonagem: 'Elara',
};

const jogadorAcesso2: JogadorAcessoItem = {
  jogadorId: 20,
  jogadorNome: 'Bob',
  nomePersonagem: 'Thorin',
};

const visibilidadeStub: FichaVisibilidadeResponse = {
  fichaId: 5,
  visivelGlobalmente: false,
  jogadoresComAcesso: [jogadorAcesso1],
};

describe('FichaVisibilidadeApiService', () => {
  let service: FichaVisibilidadeApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        FichaVisibilidadeApiService,
      ],
    });

    service = TestBed.inject(FichaVisibilidadeApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ============================================
  // listarVisibilidade
  // ============================================

  describe('listarVisibilidade', () => {
    it('deve fazer GET na URL correta para o fichaId fornecido', () => {
      service.listarVisibilidade(5).subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/fichas/5/visibilidade`);
      expect(req.request.method).toBe('GET');
      req.flush(visibilidadeStub);
    });

    it('deve retornar o FichaVisibilidadeResponse da resposta', () => {
      let resultado: FichaVisibilidadeResponse | undefined;
      service.listarVisibilidade(5).subscribe(v => (resultado = v));

      const req = httpMock.expectOne(`${BASE_URL}/fichas/5/visibilidade`);
      req.flush(visibilidadeStub);

      expect(resultado).toBeDefined();
      expect(resultado!.fichaId).toBe(5);
      expect(resultado!.visivelGlobalmente).toBe(false);
      expect(resultado!.jogadoresComAcesso).toHaveLength(1);
      expect(resultado!.jogadoresComAcesso[0].jogadorNome).toBe('Alice');
    });

    it('deve usar o fichaId correto na URL para diferentes fichas', () => {
      service.listarVisibilidade(99).subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/fichas/99/visibilidade`);
      expect(req.request.method).toBe('GET');
      req.flush({ ...visibilidadeStub, fichaId: 99 });
    });
  });

  // ============================================
  // atualizarVisibilidade
  // ============================================

  describe('atualizarVisibilidade', () => {
    it('deve fazer POST na URL correta com o DTO no corpo', () => {
      const dto: AtualizarVisibilidadeDto = { jogadorId: 10, temAcesso: true };
      service.atualizarVisibilidade(5, dto).subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/fichas/5/visibilidade`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush(visibilidadeStub);
    });

    it('deve retornar o FichaVisibilidadeResponse atualizado', () => {
      const dto: AtualizarVisibilidadeDto = { jogadorId: 20, temAcesso: true };
      let resultado: FichaVisibilidadeResponse | undefined;
      service.atualizarVisibilidade(5, dto).subscribe(v => (resultado = v));

      const resposta: FichaVisibilidadeResponse = {
        ...visibilidadeStub,
        jogadoresComAcesso: [jogadorAcesso1, jogadorAcesso2],
      };
      const req = httpMock.expectOne(`${BASE_URL}/fichas/5/visibilidade`);
      req.flush(resposta);

      expect(resultado!.jogadoresComAcesso).toHaveLength(2);
    });

    it('deve enviar temAcesso=false para revogar acesso via POST', () => {
      const dto: AtualizarVisibilidadeDto = { jogadorId: 10, temAcesso: false };
      service.atualizarVisibilidade(5, dto).subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/fichas/5/visibilidade`);
      expect(req.request.body.temAcesso).toBe(false);
      req.flush({ ...visibilidadeStub, jogadoresComAcesso: [] });
    });
  });

  // ============================================
  // revogarAcesso
  // ============================================

  describe('revogarAcesso', () => {
    it('deve fazer DELETE na URL correta com fichaId e jogadorId', () => {
      service.revogarAcesso(5, 10).subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/fichas/5/visibilidade/10`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('deve usar os IDs corretos na URL', () => {
      service.revogarAcesso(7, 42).subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/fichas/7/visibilidade/42`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  // ============================================
  // atualizarGlobal
  // ============================================

  describe('atualizarGlobal', () => {
    it('deve fazer PATCH na URL correta com visivelGlobalmente=true', () => {
      service.atualizarGlobal(5, true).subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/fichas/5/visibilidade/global`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ visivelGlobalmente: true });
      req.flush({ id: 5, isNpc: true, visivelGlobalmente: true });
    });

    it('deve fazer PATCH com visivelGlobalmente=false para desativar visibilidade global', () => {
      service.atualizarGlobal(5, false).subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/fichas/5/visibilidade/global`);
      expect(req.request.body).toEqual({ visivelGlobalmente: false });
      req.flush({ id: 5, isNpc: true, visivelGlobalmente: false });
    });

    it('deve retornar a ficha atualizada', () => {
      let resultado: unknown;
      service.atualizarGlobal(5, true).subscribe(f => (resultado = f));

      const req = httpMock.expectOne(`${BASE_URL}/fichas/5/visibilidade/global`);
      const fichaAtualizada = { id: 5, isNpc: true, visivelGlobalmente: true, nome: 'Goblin' };
      req.flush(fichaAtualizada);

      expect(resultado).toMatchObject({ visivelGlobalmente: true });
    });
  });
});
