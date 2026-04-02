import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { JogosApiService } from './jogos-api.service';
import { Jogo, JogoResumo, MeuJogo } from '@core/models/jogo.model';
import { Participante } from '@core/models/participante.model';
import { CreateJogoDto, UpdateJogoDto } from '@core/models/dtos/jogo.dto';

const BASE_URL = '/api/v1';

// ============================================================
// Stubs
// ============================================================

const jogoStub: Jogo = {
  id: 1,
  nome: 'Campanha dos Heróis',
  descricao: 'Uma aventura épica',
  dataInicio: '2024-01-01',
  dataFim: null,
  ativo: true,
  totalParticipantes: 5,
  meuRole: 'MESTRE',
};

const jogoResumoStub: JogoResumo = {
  id: 1,
  nome: 'Campanha dos Heróis',
  descricao: 'Uma aventura épica',
  totalParticipantes: 5,
  ativo: true,
  meuRole: 'MESTRE',
};

const meuJogoStub: MeuJogo = {
  id: 1,
  nome: 'Campanha dos Heróis',
  isMestre: true,
  meusPersonagens: 0,
};

const participanteStub: Participante = {
  id: 10,
  jogoId: 1,
  usuarioId: 42,
  nomeUsuario: 'Jogador Teste',
  role: 'JOGADOR',
  status: 'APROVADO',
  dataCriacao: '2024-01-01T00:00:00',
  dataUltimaAtualizacao: '2024-06-01T00:00:00',
};

// ============================================================
// Testes
// ============================================================

describe('JogosApiService', () => {
  let service: JogosApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        JogosApiService,
      ],
    });

    service = TestBed.inject(JogosApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ============================================================
  // listJogos
  // ============================================================

  describe('listJogos', () => {
    it('deve fazer GET em /api/v1/jogos', () => {
      service.listJogos().subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/jogos`);
      expect(req.request.method).toBe('GET');
      req.flush([jogoResumoStub]);
    });

    it('deve retornar lista de JogoResumo', () => {
      let resultado: JogoResumo[] = [];
      service.listJogos().subscribe(jogos => (resultado = jogos));

      httpMock.expectOne(`${BASE_URL}/jogos`).flush([jogoResumoStub]);

      expect(resultado).toHaveLength(1);
      expect(resultado[0].nome).toBe('Campanha dos Heróis');
    });
  });

  // ============================================================
  // listMeusJogos
  // ============================================================

  describe('listMeusJogos', () => {
    it('deve fazer GET em /api/v1/jogos/meus', () => {
      service.listMeusJogos().subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/jogos/meus`);
      expect(req.request.method).toBe('GET');
      req.flush([meuJogoStub]);
    });
  });

  // ============================================================
  // getJogoAtivo
  // ============================================================

  describe('getJogoAtivo', () => {
    it('deve fazer GET em /api/v1/jogos/ativo', () => {
      service.getJogoAtivo().subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/jogos/ativo`);
      expect(req.request.method).toBe('GET');
      req.flush(jogoStub);
    });
  });

  // ============================================================
  // getJogo
  // ============================================================

  describe('getJogo', () => {
    it('deve fazer GET em /api/v1/jogos/{id}', () => {
      service.getJogo(1).subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/jogos/1`);
      expect(req.request.method).toBe('GET');
      req.flush(jogoStub);
    });

    it('deve retornar os dados do jogo correto', () => {
      let resultado: Jogo | undefined;
      service.getJogo(1).subscribe(j => (resultado = j));

      httpMock.expectOne(`${BASE_URL}/jogos/1`).flush(jogoStub);

      expect(resultado?.id).toBe(1);
      expect(resultado?.nome).toBe('Campanha dos Heróis');
    });
  });

  // ============================================================
  // createJogo
  // ============================================================

  describe('createJogo', () => {
    it('deve fazer POST em /api/v1/jogos com o DTO correto', () => {
      const dto: CreateJogoDto = { nome: 'Nova Campanha' };
      service.createJogo(dto).subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/jogos`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush(jogoStub);
    });

    it('deve retornar o jogo criado', () => {
      let resultado: Jogo | undefined;
      const dto: CreateJogoDto = { nome: 'Nova Campanha' };
      service.createJogo(dto).subscribe(j => (resultado = j));

      httpMock.expectOne(`${BASE_URL}/jogos`).flush(jogoStub);

      expect(resultado?.id).toBe(1);
    });
  });

  // ============================================================
  // updateJogo
  // ============================================================

  describe('updateJogo', () => {
    it('deve fazer PUT em /api/v1/jogos/{id} com o DTO correto', () => {
      const dto: UpdateJogoDto = { nome: 'Nome Atualizado' };
      service.updateJogo(1, dto).subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/jogos/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(dto);
      req.flush({ ...jogoStub, nome: 'Nome Atualizado' });
    });
  });

  // ============================================================
  // deleteJogo
  // ============================================================

  describe('deleteJogo', () => {
    it('deve fazer DELETE em /api/v1/jogos/{id}', () => {
      service.deleteJogo(1).subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/jogos/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  // ============================================================
  // ativarJogo
  // ============================================================

  describe('ativarJogo', () => {
    it('deve fazer POST em /api/v1/jogos/{id}/ativar com body vazio', () => {
      service.ativarJogo(1).subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/jogos/1/ativar`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(jogoStub);
    });
  });

  // ============================================================
  // duplicarJogo
  // ============================================================

  describe('duplicarJogo', () => {
    it('deve fazer POST em /api/v1/jogos/{id}/duplicar com o DTO correto', () => {
      const dto = { novoNome: 'Cópia da Campanha' };
      service.duplicarJogo(1, dto).subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/jogos/1/duplicar`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush({ id: 2, nome: 'Cópia da Campanha' });
    });
  });

  // ============================================================
  // getDashboard
  // ============================================================

  describe('getDashboard', () => {
    it('deve fazer GET em /api/v1/jogos/{id}/dashboard', () => {
      service.getDashboard(1).subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/jogos/1/dashboard`);
      expect(req.request.method).toBe('GET');
      req.flush({
        totalFichas: 10,
        totalParticipantes: 5,
        fichasPorNivel: { 1: 3, 2: 7 },
        ultimasAlteracoes: [],
      });
    });
  });

  // ============================================================
  // listParticipantes
  // ============================================================

  describe('listParticipantes', () => {
    it('deve fazer GET em /api/v1/jogos/{jogoId}/participantes', () => {
      service.listParticipantes(1).subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/jogos/1/participantes`);
      expect(req.request.method).toBe('GET');
      req.flush([participanteStub]);
    });

    it('deve retornar lista de participantes', () => {
      let resultado: Participante[] = [];
      service.listParticipantes(1).subscribe(p => (resultado = p));

      httpMock.expectOne(`${BASE_URL}/jogos/1/participantes`).flush([participanteStub]);

      expect(resultado).toHaveLength(1);
      expect(resultado[0].nomeUsuario).toBe('Jogador Teste');
    });
  });

  // ============================================================
  // solicitarParticipacao
  // ============================================================

  describe('solicitarParticipacao', () => {
    it('deve fazer POST em /api/v1/jogos/{jogoId}/participantes/solicitar com body vazio', () => {
      service.solicitarParticipacao(1).subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/jogos/1/participantes/solicitar`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(participanteStub);
    });
  });

  // ============================================================
  // aprovarParticipante
  // ============================================================

  describe('aprovarParticipante', () => {
    it('deve fazer PUT em /api/v1/jogos/{jogoId}/participantes/{id}/aprovar', () => {
      service.aprovarParticipante(1, 10).subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/jogos/1/participantes/10/aprovar`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({});
      req.flush({ ...participanteStub, status: 'APROVADO' });
    });
  });

  // ============================================================
  // rejeitarParticipante
  // ============================================================

  describe('rejeitarParticipante', () => {
    it('deve fazer PUT em /api/v1/jogos/{jogoId}/participantes/{id}/rejeitar', () => {
      service.rejeitarParticipante(1, 10).subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/jogos/1/participantes/10/rejeitar`);
      expect(req.request.method).toBe('PUT');
      req.flush({ ...participanteStub, status: 'REJEITADO' });
    });
  });

  // ============================================================
  // banirParticipante
  // ============================================================

  describe('banirParticipante', () => {
    it('deve fazer DELETE em /api/v1/jogos/{jogoId}/participantes/{id}', () => {
      service.banirParticipante(1, 10).subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/jogos/1/participantes/10`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ ...participanteStub, status: 'BANIDO' });
    });
  });
});
