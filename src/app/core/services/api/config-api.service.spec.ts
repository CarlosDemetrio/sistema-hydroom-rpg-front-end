import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ConfigApiService } from './config-api.service';
import { AtributoConfig, CreateAtributoDto, UpdateAtributoDto } from '@core/models/atributo-config.model';
import { AptidaoConfig } from '@core/models/aptidao-config.model';
import { NivelConfig, ClassePersonagem, Raca, ReordenarRequest } from '@core/models/config.models';

const CONFIG_URL = '/api/v1/configuracoes';

// ============================================================
// Stubs
// ============================================================

const atributoStub: AtributoConfig = {
  id: 1,
  jogoId: 10,
  nome: 'Força',
  abreviacao: 'FOR',
  descricao: null,
  formulaImpeto: 'FOR * 5',
  descricaoImpeto: null,
  valorMinimo: 1,
  valorMaximo: 20,
  ordemExibicao: 1,
  dataCriacao: '2024-01-01',
  dataUltimaAtualizacao: '2024-01-01',
};

const aptidaoStub: AptidaoConfig = {
  id: 1,
  jogoId: 10,
  nome: 'Acrobacia',
  descricao: null,
  tipoAptidaoId: 5,
  tipoAptidaoNome: 'Físico',
  ordemExibicao: 1,
  dataCriacao: '2024-01-01',
  dataUltimaAtualizacao: '2024-01-01',
};

const nivelStub: NivelConfig = {
  id: 1,
  jogoId: 10,
  nivel: 1,
  xpNecessaria: 0,
  pontosAtributo: 5,
  pontosAptidao: 3,
  limitadorAtributo: 10,
  permitirRenascimento: false,
  dataCriacao: '2024-01-01',
  dataUltimaAtualizacao: '2024-01-01',
};

const classeStub: ClassePersonagem = {
  id: 1,
  jogoId: 10,
  nome: 'Guerreiro',
  descricao: null,
  ordemExibicao: 1,
  bonusConfig: [],
  aptidaoBonus: [],
  dataCriacao: '2024-01-01',
  dataUltimaAtualizacao: '2024-01-01',
};

const racaStub: Raca = {
  id: 1,
  jogoId: 10,
  nome: 'Humano',
  descricao: null,
  ordemExibicao: 1,
  bonusAtributos: [],
  classesPermitidas: [],
  dataCriacao: '2024-01-01',
  dataUltimaAtualizacao: '2024-01-01',
};

// ============================================================
// Testes
// ============================================================

describe('ConfigApiService', () => {
  let service: ConfigApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ConfigApiService,
      ],
    });

    service = TestBed.inject(ConfigApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ============================================================
  // Atributos
  // ============================================================

  describe('Atributos', () => {
    it('listAtributos — deve fazer GET com jogoId como query param', () => {
      service.listAtributos(10).subscribe();

      const req = httpMock.expectOne(r =>
        r.url === `${CONFIG_URL}/atributos` && r.params.get('jogoId') === '10'
      );
      expect(req.request.method).toBe('GET');
      req.flush([atributoStub]);
    });

    it('listAtributos — deve incluir parâmetro "nome" quando fornecido', () => {
      service.listAtributos(10, 'Força').subscribe();

      const req = httpMock.expectOne(r =>
        r.url === `${CONFIG_URL}/atributos` &&
        r.params.get('jogoId') === '10' &&
        r.params.get('nome') === 'Força'
      );
      expect(req.request.method).toBe('GET');
      req.flush([atributoStub]);
    });

    it('getAtributo — deve fazer GET em /atributos/{id}', () => {
      service.getAtributo(1).subscribe();

      const req = httpMock.expectOne(`${CONFIG_URL}/atributos/1`);
      expect(req.request.method).toBe('GET');
      req.flush(atributoStub);
    });

    it('createAtributo — deve fazer POST com DTO correto', () => {
      const dto: CreateAtributoDto = {
        jogoId: 10,
        nome: 'Força',
        abreviacao: 'FOR',
      };
      service.createAtributo(dto).subscribe();

      const req = httpMock.expectOne(`${CONFIG_URL}/atributos`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush(atributoStub);
    });

    it('updateAtributo — deve fazer PUT em /atributos/{id}', () => {
      const dto: UpdateAtributoDto = { nome: 'Força Bruta' };
      service.updateAtributo(1, dto).subscribe();

      const req = httpMock.expectOne(`${CONFIG_URL}/atributos/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(dto);
      req.flush({ ...atributoStub, nome: 'Força Bruta' });
    });

    it('deleteAtributo — deve fazer DELETE em /atributos/{id}', () => {
      service.deleteAtributo(1).subscribe();

      const req = httpMock.expectOne(`${CONFIG_URL}/atributos/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('reordenarAtributos — deve fazer PUT em /atributos/reordenar com jogoId e request', () => {
      const reordenarRequest: ReordenarRequest = { itens: [{ id: 1, ordemExibicao: 2 }] };
      service.reordenarAtributos(10, reordenarRequest).subscribe();

      const req = httpMock.expectOne(`${CONFIG_URL}/atributos/reordenar?jogoId=10`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(reordenarRequest);
      req.flush(null);
    });
  });

  // ============================================================
  // Aptidões
  // ============================================================

  describe('Aptidões', () => {
    it('listAptidoes — deve fazer GET com jogoId', () => {
      service.listAptidoes(10).subscribe();

      const req = httpMock.expectOne(r =>
        r.url === `${CONFIG_URL}/aptidoes` && r.params.get('jogoId') === '10'
      );
      expect(req.request.method).toBe('GET');
      req.flush([aptidaoStub]);
    });

    it('createAptidao — deve fazer POST com DTO correto', () => {
      const dto = { jogoId: 10, nome: 'Acrobacia', tipoAptidaoId: 5 };
      service.createAptidao(dto).subscribe();

      const req = httpMock.expectOne(`${CONFIG_URL}/aptidoes`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush(aptidaoStub);
    });

    it('updateAptidao — deve fazer PUT em /aptidoes/{id}', () => {
      const dto = { nome: 'Salto' };
      service.updateAptidao(1, dto).subscribe();

      const req = httpMock.expectOne(`${CONFIG_URL}/aptidoes/1`);
      expect(req.request.method).toBe('PUT');
      req.flush({ ...aptidaoStub, nome: 'Salto' });
    });

    it('deleteAptidao — deve fazer DELETE em /aptidoes/{id}', () => {
      service.deleteAptidao(1).subscribe();

      const req = httpMock.expectOne(`${CONFIG_URL}/aptidoes/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  // ============================================================
  // Níveis
  // ============================================================

  describe('Níveis', () => {
    it('listNiveis — deve fazer GET com jogoId', () => {
      service.listNiveis(10).subscribe();

      const req = httpMock.expectOne(r =>
        r.url === `${CONFIG_URL}/niveis` && r.params.get('jogoId') === '10'
      );
      expect(req.request.method).toBe('GET');
      req.flush([nivelStub]);
    });

    it('createNivel — deve fazer POST com DTO correto', () => {
      const dto = {
        jogoId: 10,
        nivel: 1,
        xpNecessaria: 0,
        pontosAtributo: 5,
        pontosAptidao: 3,
        limitadorAtributo: 10,
      };
      service.createNivel(dto).subscribe();

      const req = httpMock.expectOne(`${CONFIG_URL}/niveis`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush(nivelStub);
    });

    it('updateNivel — deve fazer PUT em /niveis/{id}', () => {
      const dto = { xpNecessaria: 500 };
      service.updateNivel(1, dto).subscribe();

      const req = httpMock.expectOne(`${CONFIG_URL}/niveis/1`);
      expect(req.request.method).toBe('PUT');
      req.flush({ ...nivelStub, xpNecessaria: 500 });
    });

    it('deleteNivel — deve fazer DELETE em /niveis/{id}', () => {
      service.deleteNivel(1).subscribe();

      const req = httpMock.expectOne(`${CONFIG_URL}/niveis/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  // ============================================================
  // Classes
  // ============================================================

  describe('Classes', () => {
    it('listClasses — deve fazer GET com jogoId', () => {
      service.listClasses(10).subscribe();

      const req = httpMock.expectOne(r =>
        r.url === `${CONFIG_URL}/classes` && r.params.get('jogoId') === '10'
      );
      expect(req.request.method).toBe('GET');
      req.flush([classeStub]);
    });

    it('createClasse — deve fazer POST com DTO correto', () => {
      const dto = { jogoId: 10, nome: 'Guerreiro' };
      service.createClasse(dto).subscribe();

      const req = httpMock.expectOne(`${CONFIG_URL}/classes`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush(classeStub);
    });

    it('deleteClasse — deve fazer DELETE em /classes/{id}', () => {
      service.deleteClasse(1).subscribe();

      const req = httpMock.expectOne(`${CONFIG_URL}/classes/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  // ============================================================
  // Raças
  // ============================================================

  describe('Raças', () => {
    it('listRacas — deve fazer GET com jogoId', () => {
      service.listRacas(10).subscribe();

      const req = httpMock.expectOne(r =>
        r.url === `${CONFIG_URL}/racas` && r.params.get('jogoId') === '10'
      );
      expect(req.request.method).toBe('GET');
      req.flush([racaStub]);
    });

    it('createRaca — deve fazer POST com DTO correto', () => {
      const dto = { jogoId: 10, nome: 'Elfo' };
      service.createRaca(dto).subscribe();

      const req = httpMock.expectOne(`${CONFIG_URL}/racas`);
      expect(req.request.method).toBe('POST');
      req.flush(racaStub);
    });

    it('deleteRaca — deve fazer DELETE em /racas/{id}', () => {
      service.deleteRaca(1).subscribe();

      const req = httpMock.expectOne(`${CONFIG_URL}/racas/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  // ============================================================
  // Categorias de Vantagem (URL diferente: sem /v1/)
  // ============================================================

  describe('Categorias de Vantagem', () => {
    it('listCategoriasVantagem — deve usar URL /api/jogos/{jogoId}/config/categorias-vantagem', () => {
      service.listCategoriasVantagem(10).subscribe();

      const req = httpMock.expectOne('/api/jogos/10/config/categorias-vantagem');
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('createCategoriaVantagem — deve fazer POST com DTO correto', () => {
      const dto = { nome: 'Combate', descricao: 'Vantagens de combate' };
      service.createCategoriaVantagem(10, dto).subscribe();

      const req = httpMock.expectOne('/api/jogos/10/config/categorias-vantagem');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush({ id: 1, jogoId: 10, ...dto, cor: null, ordemExibicao: 1, dataCriacao: '', dataUltimaAtualizacao: '' });
    });

    it('deleteCategoriaVantagem — deve fazer DELETE na URL correta', () => {
      service.deleteCategoriaVantagem(10, 1).subscribe();

      const req = httpMock.expectOne('/api/jogos/10/config/categorias-vantagem/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  // ============================================================
  // Tipos de Aptidão
  // ============================================================

  describe('Tipos de Aptidão', () => {
    it('listTiposAptidao — deve fazer GET com jogoId', () => {
      service.listTiposAptidao(10).subscribe();

      const req = httpMock.expectOne(r =>
        r.url === `${CONFIG_URL}/tipos-aptidao` && r.params.get('jogoId') === '10'
      );
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('createTipoAptidao — deve fazer POST com DTO correto', () => {
      const dto = { jogoId: 10, nome: 'Físico' };
      service.createTipoAptidao(dto).subscribe();

      const req = httpMock.expectOne(`${CONFIG_URL}/tipos-aptidao`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush({ id: 1, jogoId: 10, nome: 'Físico', descricao: null, ordemExibicao: 1, dataCriacao: '', dataUltimaAtualizacao: '' });
    });
  });
});
