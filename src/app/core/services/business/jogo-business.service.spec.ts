import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { JogoBusinessService } from './jogo-business.service';
import { JogosStore } from '@core/stores/jogos.store';
import { JogosApiService } from '@core/services/api/jogos-api.service';
import { JogoResumo, Jogo } from '@core/models/jogo.model';
import { CreateJogoDto, UpdateJogoDto } from '@core/models/dtos/jogo.dto';

// ============================================================
// Stubs
// ============================================================

const jogoResumoStub: JogoResumo = {
  id: 1,
  nome: 'Campanha dos Heróis',
  descricao: 'Uma aventura épica',
  totalParticipantes: 5,
  ativo: true,
  meuRole: 'MESTRE',
};

const jogoResumo2Stub: JogoResumo = {
  id: 2,
  nome: 'Segunda Campanha',
  descricao: null,
  totalParticipantes: 2,
  ativo: true,
  meuRole: 'JOGADOR',
};

const jogoDetalheStub: Jogo = {
  id: 1,
  nome: 'Campanha dos Heróis',
  descricao: 'Uma aventura épica',
  dataInicio: '2024-01-01',
  dataFim: null,
  ativo: true,
  totalParticipantes: 5,
  meuRole: 'MESTRE',
};

// ============================================================
// Helpers
// ============================================================

function criarJogosStoreMock(jogosIniciais: JogoResumo[] = []) {
  const jogosSignal = signal<JogoResumo[]>(jogosIniciais);
  const loadingSignal = signal(false);
  const errorSignal = signal<string | null>(null);

  return {
    jogos: jogosSignal.asReadonly(),
    loading: loadingSignal.asReadonly(),
    error: errorSignal.asReadonly(),
    setJogos: vi.fn((jogos: JogoResumo[]) => jogosSignal.set(jogos)),
    addJogo: vi.fn(),
    updateJogoInState: vi.fn(),
    removeJogo: vi.fn((id: number) => jogosSignal.set(jogosSignal().filter(j => j.id !== id))),
    setLoading: vi.fn(),
    setError: vi.fn(),
    jogosAtivos: () => jogosSignal().filter(j => j.ativo),
    setParticipantes: vi.fn(),
    addParticipante: vi.fn(),
    updateParticipanteInState: vi.fn(),
    removeParticipante: vi.fn(),
    getParticipantes: vi.fn(() => []),
    participantes: signal(new Map()),
  };
}

// ============================================================
// Testes
// ============================================================

describe('JogoBusinessService', () => {
  let service: JogoBusinessService;
  let jogosStoreMock: ReturnType<typeof criarJogosStoreMock>;
  let jogosApiMock: { [key: string]: ReturnType<typeof vi.fn> };

  function configurarTestBed(jogosIniciais: JogoResumo[] = []) {
    jogosStoreMock = criarJogosStoreMock(jogosIniciais);
    jogosApiMock = {
      listJogos: vi.fn(),
      listMeusJogos: vi.fn(),
      getJogo: vi.fn(),
      createJogo: vi.fn(),
      updateJogo: vi.fn(),
      deleteJogo: vi.fn(),
      ativarJogo: vi.fn(),
      duplicarJogo: vi.fn(),
      exportarConfig: vi.fn(),
      importarConfig: vi.fn(),
      getDashboard: vi.fn(),
      listParticipantes: vi.fn(),
      solicitarParticipacao: vi.fn(),
      aprovarParticipante: vi.fn(),
      rejeitarParticipante: vi.fn(),
      banirParticipante: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        JogoBusinessService,
        { provide: JogosStore, useValue: jogosStoreMock },
        { provide: JogosApiService, useValue: jogosApiMock },
      ],
    });

    service = TestBed.inject(JogoBusinessService);
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  // ============================================================
  // Estado exposto
  // ============================================================

  describe('estado exposto', () => {
    it('deve expor o signal de jogos do store', () => {
      configurarTestBed([jogoResumoStub]);

      expect(service.jogos()).toHaveLength(1);
    });

    it('deve expor o signal de loading do store', () => {
      configurarTestBed();

      expect(service.loading()).toBe(false);
    });

    it('deve expor o signal de error do store', () => {
      configurarTestBed();

      expect(service.error()).toBeNull();
    });
  });

  // ============================================================
  // loadJogos
  // ============================================================

  describe('loadJogos', () => {
    it('deve chamar a API e atualizar o store com os jogos retornados', () => {
      configurarTestBed();
      jogosApiMock['listJogos'].mockReturnValue(of([jogoResumoStub, jogoResumo2Stub]));

      service.loadJogos().subscribe();

      expect(jogosApiMock['listJogos']).toHaveBeenCalledTimes(1);
      expect(jogosStoreMock.setJogos).toHaveBeenCalledWith([jogoResumoStub, jogoResumo2Stub]);
    });

    it('deve retornar a lista de jogos via Observable', () => {
      configurarTestBed();
      jogosApiMock['listJogos'].mockReturnValue(of([jogoResumoStub]));

      let resultado: JogoResumo[] = [];
      service.loadJogos().subscribe(jogos => (resultado = jogos));

      expect(resultado).toHaveLength(1);
      expect(resultado[0].nome).toBe('Campanha dos Heróis');
    });
  });

  // ============================================================
  // loadMeusJogos
  // ============================================================

  describe('loadMeusJogos', () => {
    it('deve chamar listMeusJogos na API', () => {
      configurarTestBed();
      jogosApiMock['listMeusJogos'].mockReturnValue(of([]));

      service.loadMeusJogos().subscribe();

      expect(jogosApiMock['listMeusJogos']).toHaveBeenCalledTimes(1);
    });

    it('NÃO deve atualizar o store (apenas delega à API)', () => {
      configurarTestBed();
      jogosApiMock['listMeusJogos'].mockReturnValue(of([]));

      service.loadMeusJogos().subscribe();

      expect(jogosStoreMock.setJogos).not.toHaveBeenCalled();
    });
  });

  // ============================================================
  // getJogo
  // ============================================================

  describe('getJogo', () => {
    it('deve chamar a API com o ID correto', () => {
      configurarTestBed();
      jogosApiMock['getJogo'].mockReturnValue(of(jogoDetalheStub));

      service.getJogo(1).subscribe();

      expect(jogosApiMock['getJogo']).toHaveBeenCalledWith(1);
    });

    it('deve retornar o detalhe do jogo', () => {
      configurarTestBed();
      jogosApiMock['getJogo'].mockReturnValue(of(jogoDetalheStub));

      let resultado: Jogo | undefined;
      service.getJogo(1).subscribe(j => (resultado = j));

      expect(resultado?.id).toBe(1);
      expect(resultado?.nome).toBe('Campanha dos Heróis');
    });
  });

  // ============================================================
  // createJogo
  // ============================================================

  describe('createJogo', () => {
    it('deve chamar a API com o DTO correto', () => {
      configurarTestBed();
      const dto: CreateJogoDto = { nome: 'Nova Campanha' };
      jogosApiMock['createJogo'].mockReturnValue(of(jogoDetalheStub));

      service.createJogo(dto).subscribe();

      expect(jogosApiMock['createJogo']).toHaveBeenCalledWith(dto);
    });

    it('deve retornar o jogo criado', () => {
      configurarTestBed();
      jogosApiMock['createJogo'].mockReturnValue(of(jogoDetalheStub));

      let resultado: Jogo | undefined;
      service.createJogo({ nome: 'Nova Campanha' }).subscribe(j => (resultado = j));

      expect(resultado?.id).toBe(1);
    });
  });

  // ============================================================
  // updateJogo
  // ============================================================

  describe('updateJogo', () => {
    it('deve chamar a API com o ID e DTO corretos', () => {
      configurarTestBed();
      const dto: UpdateJogoDto = { nome: 'Nome Atualizado' };
      jogosApiMock['updateJogo'].mockReturnValue(of({ ...jogoDetalheStub, nome: 'Nome Atualizado' }));

      service.updateJogo(1, dto).subscribe();

      expect(jogosApiMock['updateJogo']).toHaveBeenCalledWith(1, dto);
    });
  });

  // ============================================================
  // deleteJogo
  // ============================================================

  describe('deleteJogo', () => {
    it('deve chamar a API com o ID correto', () => {
      configurarTestBed([jogoResumoStub]);
      jogosApiMock['deleteJogo'].mockReturnValue(of(undefined));

      service.deleteJogo(1).subscribe();

      expect(jogosApiMock['deleteJogo']).toHaveBeenCalledWith(1);
    });

    it('deve remover o jogo do store após deletar', () => {
      configurarTestBed([jogoResumoStub]);
      jogosApiMock['deleteJogo'].mockReturnValue(of(undefined));

      service.deleteJogo(1).subscribe();

      expect(jogosStoreMock.removeJogo).toHaveBeenCalledWith(1);
    });
  });
});
