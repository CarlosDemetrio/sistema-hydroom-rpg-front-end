import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { FichasApiService } from './fichas-api.service';
import { Ficha, FichaResumo, FichaVantagemResponse, AtualizarAtributoDto, FichaAtributoResponse } from '@core/models/ficha.model';
import { CreateFichaDto, UpdateFichaDto } from '@core/models/dtos/ficha.dto';

const BASE_URL = '/api/v1';

const fichaStub: Ficha = {
  id: 1,
  jogoId: 10,
  nome: 'Zephyra',
  jogadorId: 42,
  racaId: 2,
  racaNome: 'Élfico',
  classeId: 3,
  classeNome: 'Guerreiro',
  generoId: null,
  generoNome: null,
  indoleId: null,
  indoleNome: null,
  presencaId: null,
  presencaNome: null,
  nivel: 5,
  xp: 1200,
  renascimentos: 0,
  isNpc: false,
  dataCriacao: '2024-01-01T00:00:00',
  dataUltimaAtualizacao: '2024-06-01T00:00:00',
};

const fichaResumoStub: FichaResumo = {
  id: 1,
  nome: 'Zephyra',
  nivel: 5,
  xp: 1200,
  racaNome: 'Élfico',
  classeNome: 'Guerreiro',
  atributosTotais: { FOR: 10, AGI: 12 },
  bonusTotais: {},
  vidaTotal: 80,
  vidaAtual: 80,
  essenciaTotal: 50,
  essenciaAtual: 50,
  ameacaTotal: 20,
  pontosVantagemDisponiveis: 0,
  pontosAtributoDisponiveis: 0,
  pontosAptidaoDisponiveis: 0,
};

describe('FichasApiService', () => {
  let service: FichasApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        FichasApiService,
      ],
    });

    service = TestBed.inject(FichasApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ============================================
  // listFichas
  // ============================================

  describe('listFichas', () => {
    it('deve fazer GET na URL correta sem filtros', () => {
      service.listFichas(10).subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/jogos/10/fichas`);
      expect(req.request.method).toBe('GET');
      req.flush([fichaStub]);
    });

    it('deve incluir parâmetro "nome" na query string quando fornecido', () => {
      service.listFichas(10, { nome: 'Zephyra' }).subscribe();

      const req = httpMock.expectOne(r =>
        r.url === `${BASE_URL}/jogos/10/fichas` && r.params.get('nome') === 'Zephyra'
      );
      expect(req.request.method).toBe('GET');
      req.flush([fichaStub]);
    });

    it('deve incluir parâmetros "classeId", "racaId" e "nivel" quando fornecidos', () => {
      service.listFichas(10, { classeId: 3, racaId: 2, nivel: 5 }).subscribe();

      const req = httpMock.expectOne(r =>
        r.url === `${BASE_URL}/jogos/10/fichas` &&
        r.params.get('classeId') === '3' &&
        r.params.get('racaId') === '2' &&
        r.params.get('nivel') === '5'
      );
      expect(req.request.method).toBe('GET');
      req.flush([fichaStub]);
    });

    it('deve retornar array de fichas da resposta', () => {
      let resultado: Ficha[] = [];
      service.listFichas(10).subscribe(fichas => (resultado = fichas));

      const req = httpMock.expectOne(`${BASE_URL}/jogos/10/fichas`);
      req.flush([fichaStub]);

      expect(resultado).toHaveLength(1);
      expect(resultado[0].nome).toBe('Zephyra');
    });
  });

  // ============================================
  // getFicha
  // ============================================

  describe('getFicha', () => {
    it('deve fazer GET na URL correta com o ID da ficha', () => {
      service.getFicha(1).subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/fichas/1`);
      expect(req.request.method).toBe('GET');
      req.flush(fichaStub);
    });

    it('deve retornar a ficha da resposta', () => {
      let resultado: Ficha | undefined;
      service.getFicha(1).subscribe(ficha => (resultado = ficha));

      const req = httpMock.expectOne(`${BASE_URL}/fichas/1`);
      req.flush(fichaStub);

      expect(resultado).toBeDefined();
      expect(resultado!.id).toBe(1);
      expect(resultado!.nome).toBe('Zephyra');
    });

    it('deve usar o ID correto na URL para diferentes fichas', () => {
      service.getFicha(99).subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/fichas/99`);
      expect(req.request.method).toBe('GET');
      req.flush({ ...fichaStub, id: 99 });
    });
  });

  // ============================================
  // createFicha
  // ============================================

  describe('createFicha', () => {
    it('deve fazer POST na URL correta com o DTO no corpo', () => {
      const dto: CreateFichaDto = { jogoId: 10, nome: 'Nova Ficha' };
      service.createFicha(10, dto).subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/jogos/10/fichas`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush(fichaStub);
    });

    it('deve retornar a ficha criada', () => {
      const dto: CreateFichaDto = { jogoId: 10, nome: 'Nova Ficha' };
      let resultado: Ficha | undefined;
      service.createFicha(10, dto).subscribe(ficha => (resultado = ficha));

      const req = httpMock.expectOne(`${BASE_URL}/jogos/10/fichas`);
      req.flush(fichaStub);

      expect(resultado!.nome).toBe('Zephyra');
    });
  });

  // ============================================
  // updateFicha
  // ============================================

  describe('updateFicha', () => {
    it('deve fazer PUT na URL correta com o DTO no corpo', () => {
      const dto: UpdateFichaDto = { nome: 'Nome Atualizado' };
      service.updateFicha(1, dto).subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/fichas/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(dto);
      req.flush({ ...fichaStub, nome: 'Nome Atualizado' });
    });

    it('deve retornar a ficha atualizada', () => {
      const dto: UpdateFichaDto = { nome: 'Nome Atualizado' };
      let resultado: Ficha | undefined;
      service.updateFicha(1, dto).subscribe(ficha => (resultado = ficha));

      const req = httpMock.expectOne(`${BASE_URL}/fichas/1`);
      req.flush({ ...fichaStub, nome: 'Nome Atualizado' });

      expect(resultado!.nome).toBe('Nome Atualizado');
    });
  });

  // ============================================
  // atualizarAtributos
  // ============================================

  describe('atualizarAtributos', () => {
    it('deve fazer PUT na URL correta com o array de atributos', () => {
      const dto: AtualizarAtributoDto[] = [
        { atributoConfigId: 1, base: 10 },
        { atributoConfigId: 2, base: 12 },
      ];
      service.atualizarAtributos(1, dto).subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/fichas/1/atributos`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(dto);
      req.flush([]);
    });

    it('deve retornar os atributos atualizados', () => {
      const dto: AtualizarAtributoDto[] = [{ atributoConfigId: 1, base: 10 }];
      const resposta: FichaAtributoResponse[] = [
        {
          id: 101,
          atributoConfigId: 1,
          atributoNome: 'Força',
          atributoAbreviacao: 'FOR',
          base: 10,
          nivel: 2,
          outros: 0,
          total: 12,
          impeto: 3,
        },
      ];
      let resultado: FichaAtributoResponse[] = [];
      service.atualizarAtributos(1, dto).subscribe(r => (resultado = r));

      const req = httpMock.expectOne(`${BASE_URL}/fichas/1/atributos`);
      req.flush(resposta);

      expect(resultado).toHaveLength(1);
      expect(resultado[0].atributoAbreviacao).toBe('FOR');
      expect(resultado[0].total).toBe(12);
    });
  });

  // ============================================
  // listVantagens
  // ============================================

  describe('listVantagens', () => {
    it('deve fazer GET na URL correta para listar vantagens', () => {
      service.listVantagens(1).subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/fichas/1/vantagens`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('deve retornar a lista de vantagens da ficha', () => {
      const vantagemStub: FichaVantagemResponse = {
        id: 50,
        vantagemConfigId: 5,
        nomeVantagem: 'Força Bruta',
        nivelAtual: 1,
        nivelMaximo: 3,
        custoPago: 10,
      };
      let resultado: FichaVantagemResponse[] = [];
      service.listVantagens(1).subscribe(v => (resultado = v));

      const req = httpMock.expectOne(`${BASE_URL}/fichas/1/vantagens`);
      req.flush([vantagemStub]);

      expect(resultado).toHaveLength(1);
      expect(resultado[0].nomeVantagem).toBe('Força Bruta');
    });
  });

  // ============================================
  // getFichaResumo
  // ============================================

  describe('getFichaResumo', () => {
    it('deve fazer GET na URL /resumo correta', () => {
      service.getFichaResumo(1).subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/fichas/1/resumo`);
      expect(req.request.method).toBe('GET');
      req.flush(fichaResumoStub);
    });

    it('deve retornar o resumo calculado da ficha', () => {
      let resultado: FichaResumo | undefined;
      service.getFichaResumo(1).subscribe(r => (resultado = r));

      const req = httpMock.expectOne(`${BASE_URL}/fichas/1/resumo`);
      req.flush(fichaResumoStub);

      expect(resultado!.vidaTotal).toBe(80);
      expect(resultado!.nivel).toBe(5);
    });
  });

  // ============================================
  // deleteFicha
  // ============================================

  describe('deleteFicha', () => {
    it('deve fazer DELETE na URL correta', () => {
      service.deleteFicha(1).subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/fichas/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  // ============================================
  // listMinhasFichas
  // ============================================

  describe('listMinhasFichas', () => {
    it('deve fazer GET na URL /minhas correta', () => {
      service.listMinhasFichas(10).subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/jogos/10/fichas/minhas`);
      expect(req.request.method).toBe('GET');
      req.flush([fichaStub]);
    });
  });

  // ============================================
  // listNpcs
  // ============================================

  describe('listNpcs', () => {
    it('deve fazer GET na URL /npcs correta', () => {
      service.listNpcs(10).subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/jogos/10/npcs`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });

  // ============================================
  // resetarEstado
  // ============================================

  describe('resetarEstado', () => {
    it('deve fazer POST na URL correta com body vazio', () => {
      service.resetarEstado(1).subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/fichas/1/resetar-estado`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(fichaResumoStub);
    });

    it('deve retornar FichaResumo atualizado apos o reset', () => {
      const resumoReset: FichaResumo = {
        ...fichaResumoStub,
        vidaAtual: fichaResumoStub.vidaTotal,
        essenciaAtual: fichaResumoStub.essenciaTotal,
      };

      let resultado: FichaResumo | undefined;
      service.resetarEstado(1).subscribe(r => (resultado = r));

      const req = httpMock.expectOne(`${BASE_URL}/fichas/1/resetar-estado`);
      req.flush(resumoReset);

      expect(resultado?.vidaAtual).toBe(fichaResumoStub.vidaTotal);
      expect(resultado?.essenciaAtual).toBe(fichaResumoStub.essenciaTotal);
    });

    it('deve usar fichaId corretamente na URL', () => {
      service.resetarEstado(42).subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/fichas/42/resetar-estado`);
      expect(req.request.method).toBe('POST');
      req.flush(fichaResumoStub);
    });
  });
});
