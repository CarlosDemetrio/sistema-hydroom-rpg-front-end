import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { ParticipanteBusinessService } from './participante-business.service';
import { JogosStore } from '@core/stores/jogos.store';
import { JogosApiService } from '@core/services/api/jogos-api.service';
import { Participante, StatusParticipante } from '@core/models/participante.model';

// ============================================================
// Stubs
// ============================================================

const participantePendenteStub: Participante = {
  id: 10,
  jogoId: 1,
  usuarioId: 42,
  nomeUsuario: 'Jogador Alpha',
  role: 'JOGADOR',
  status: 'PENDENTE',
  dataCriacao: '2024-01-01T00:00:00',
  dataUltimaAtualizacao: '2024-06-01T00:00:00',
};

const participanteAprovadoStub: Participante = {
  id: 11,
  jogoId: 1,
  usuarioId: 55,
  nomeUsuario: 'Jogador Beta',
  role: 'JOGADOR',
  status: 'APROVADO',
  dataCriacao: '2024-01-01T00:00:00',
  dataUltimaAtualizacao: '2024-06-01T00:00:00',
};

const participanteBanidoStub: Participante = {
  id: 12,
  jogoId: 1,
  usuarioId: 66,
  nomeUsuario: 'Jogador Gamma',
  role: 'JOGADOR',
  status: 'BANIDO',
  dataCriacao: '2024-01-01T00:00:00',
  dataUltimaAtualizacao: '2024-06-01T00:00:00',
};

// ============================================================
// Helpers
// ============================================================

function criarJogosStoreMock(participantesIniciais: Participante[] = []) {
  const participantesMap = signal<Map<number, Participante[]>>(
    new Map([[1, participantesIniciais]])
  );

  return {
    jogos: signal([]).asReadonly(),
    loading: signal(false).asReadonly(),
    error: signal<string | null>(null).asReadonly(),
    setParticipantes: vi.fn((jogoId: number, p: Participante[]) => {
      const newMap = new Map(participantesMap());
      newMap.set(jogoId, p);
      participantesMap.set(newMap);
    }),
    addParticipante: vi.fn((jogoId: number, p: Participante) => {
      const newMap = new Map(participantesMap());
      newMap.set(jogoId, [...(newMap.get(jogoId) || []), p]);
      participantesMap.set(newMap);
    }),
    updateParticipanteInState: vi.fn(),
    removeParticipante: vi.fn(),
    getParticipantes: vi.fn((jogoId: number): Participante[] =>
      participantesMap().get(jogoId) || []
    ),
    participantes: participantesMap.asReadonly(),
    setJogos: vi.fn(),
    addJogo: vi.fn(),
    updateJogoInState: vi.fn(),
    removeJogo: vi.fn(),
    setLoading: vi.fn(),
    setError: vi.fn(),
    jogosAtivos: () => [],
  };
}

// ============================================================
// Testes
// ============================================================

describe('ParticipanteBusinessService', () => {
  let service: ParticipanteBusinessService;
  let jogosStoreMock: ReturnType<typeof criarJogosStoreMock>;
  let jogosApiMock: { [key: string]: ReturnType<typeof vi.fn> };

  function configurarTestBed(participantesIniciais: Participante[] = []) {
    jogosStoreMock = criarJogosStoreMock(participantesIniciais);
    jogosApiMock = {
      listJogos: vi.fn(),
      listMeusJogos: vi.fn(),
      getJogo: vi.fn(),
      createJogo: vi.fn(),
      updateJogo: vi.fn(),
      deleteJogo: vi.fn(),
      listParticipantes: vi.fn(),
      solicitarParticipacao: vi.fn(),
      aprovarParticipante: vi.fn(),
      rejeitarParticipante: vi.fn(),
      banirParticipante: vi.fn(),
      desbanirParticipante: vi.fn(),
      removerParticipante: vi.fn(),
      meuStatusParticipacao: vi.fn(),
      cancelarSolicitacao: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        ParticipanteBusinessService,
        { provide: JogosStore, useValue: jogosStoreMock },
        { provide: JogosApiService, useValue: jogosApiMock },
      ],
    });

    service = TestBed.inject(ParticipanteBusinessService);
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  // ============================================================
  // loadParticipantes
  // ============================================================

  describe('loadParticipantes', () => {
    it('deve chamar a API com o jogoId correto', () => {
      configurarTestBed();
      jogosApiMock['listParticipantes'].mockReturnValue(of([participanteAprovadoStub]));

      service.loadParticipantes(1).subscribe();

      expect(jogosApiMock['listParticipantes']).toHaveBeenCalledWith(1, undefined);
    });

    it('deve passar o filtro de status quando fornecido', () => {
      configurarTestBed();
      jogosApiMock['listParticipantes'].mockReturnValue(of([participantePendenteStub]));

      service.loadParticipantes(1, 'PENDENTE').subscribe();

      expect(jogosApiMock['listParticipantes']).toHaveBeenCalledWith(1, 'PENDENTE');
    });

    it('deve atualizar o store com os participantes retornados', () => {
      configurarTestBed();
      jogosApiMock['listParticipantes'].mockReturnValue(
        of([participantePendenteStub, participanteAprovadoStub])
      );

      service.loadParticipantes(1).subscribe();

      expect(jogosStoreMock.setParticipantes).toHaveBeenCalledWith(
        1,
        [participantePendenteStub, participanteAprovadoStub]
      );
    });
  });

  // ============================================================
  // solicitarParticipacao
  // ============================================================

  describe('solicitarParticipacao', () => {
    it('deve chamar a API com o jogoId correto', () => {
      configurarTestBed();
      jogosApiMock['solicitarParticipacao'].mockReturnValue(of(participantePendenteStub));

      service.solicitarParticipacao(1).subscribe();

      expect(jogosApiMock['solicitarParticipacao']).toHaveBeenCalledWith(1);
    });

    it('deve adicionar o participante ao store após solicitar', () => {
      configurarTestBed();
      jogosApiMock['solicitarParticipacao'].mockReturnValue(of(participantePendenteStub));

      service.solicitarParticipacao(1).subscribe();

      expect(jogosStoreMock.addParticipante).toHaveBeenCalledWith(1, participantePendenteStub);
    });

    it('deve retornar o participante criado', () => {
      configurarTestBed();
      jogosApiMock['solicitarParticipacao'].mockReturnValue(of(participantePendenteStub));

      let resultado: Participante | undefined;
      service.solicitarParticipacao(1).subscribe(p => (resultado = p));

      expect(resultado?.status).toBe('PENDENTE');
    });
  });

  // ============================================================
  // aprovarParticipante
  // ============================================================

  describe('aprovarParticipante', () => {
    it('deve chamar a API com jogoId e participanteId corretos', () => {
      configurarTestBed([participantePendenteStub]);
      const aprovado = { ...participantePendenteStub, status: 'APROVADO' as StatusParticipante };
      jogosApiMock['aprovarParticipante'].mockReturnValue(of(aprovado));

      service.aprovarParticipante(1, 10).subscribe();

      expect(jogosApiMock['aprovarParticipante']).toHaveBeenCalledWith(1, 10);
    });

    it('deve atualizar o participante no store após aprovar', () => {
      configurarTestBed([participantePendenteStub]);
      const aprovado = { ...participantePendenteStub, status: 'APROVADO' as StatusParticipante };
      jogosApiMock['aprovarParticipante'].mockReturnValue(of(aprovado));

      service.aprovarParticipante(1, 10).subscribe();

      expect(jogosStoreMock.updateParticipanteInState).toHaveBeenCalledWith(1, 10, aprovado);
    });
  });

  // ============================================================
  // rejeitarParticipante
  // ============================================================

  describe('rejeitarParticipante', () => {
    it('deve chamar a API com jogoId e participanteId corretos', () => {
      configurarTestBed([participantePendenteStub]);
      const rejeitado = { ...participantePendenteStub, status: 'REJEITADO' as StatusParticipante };
      jogosApiMock['rejeitarParticipante'].mockReturnValue(of(rejeitado));

      service.rejeitarParticipante(1, 10).subscribe();

      expect(jogosApiMock['rejeitarParticipante']).toHaveBeenCalledWith(1, 10);
    });

    it('deve atualizar o participante no store após rejeitar', () => {
      configurarTestBed([participantePendenteStub]);
      const rejeitado = { ...participantePendenteStub, status: 'REJEITADO' as StatusParticipante };
      jogosApiMock['rejeitarParticipante'].mockReturnValue(of(rejeitado));

      service.rejeitarParticipante(1, 10).subscribe();

      expect(jogosStoreMock.updateParticipanteInState).toHaveBeenCalledWith(1, 10, rejeitado);
    });
  });

  // ============================================================
  // banirParticipante — agora usa PUT /{pid}/banir
  // ============================================================

  describe('banirParticipante', () => {
    it('deve chamar a API com jogoId e participanteId corretos', () => {
      configurarTestBed([participanteAprovadoStub]);
      const banido = { ...participanteAprovadoStub, status: 'BANIDO' as StatusParticipante };
      jogosApiMock['banirParticipante'].mockReturnValue(of(banido));

      service.banirParticipante(1, 11).subscribe();

      expect(jogosApiMock['banirParticipante']).toHaveBeenCalledWith(1, 11);
    });

    it('deve atualizar o participante no store após banir', () => {
      configurarTestBed([participanteAprovadoStub]);
      const banido = { ...participanteAprovadoStub, status: 'BANIDO' as StatusParticipante };
      jogosApiMock['banirParticipante'].mockReturnValue(of(banido));

      service.banirParticipante(1, 11).subscribe();

      expect(jogosStoreMock.updateParticipanteInState).toHaveBeenCalledWith(1, 11, banido);
    });
  });

  // ============================================================
  // desbanirParticipante
  // ============================================================

  describe('desbanirParticipante', () => {
    it('deve chamar a API com jogoId e participanteId corretos', () => {
      configurarTestBed([participanteBanidoStub]);
      const desbanido = { ...participanteBanidoStub, status: 'APROVADO' as StatusParticipante };
      jogosApiMock['desbanirParticipante'].mockReturnValue(of(desbanido));

      service.desbanirParticipante(1, 12).subscribe();

      expect(jogosApiMock['desbanirParticipante']).toHaveBeenCalledWith(1, 12);
    });

    it('deve atualizar o participante no store após desbanir', () => {
      configurarTestBed([participanteBanidoStub]);
      const desbanido = { ...participanteBanidoStub, status: 'APROVADO' as StatusParticipante };
      jogosApiMock['desbanirParticipante'].mockReturnValue(of(desbanido));

      service.desbanirParticipante(1, 12).subscribe();

      expect(jogosStoreMock.updateParticipanteInState).toHaveBeenCalledWith(1, 12, desbanido);
    });
  });

  // ============================================================
  // removerParticipante — DELETE /{pid} (remoção provisória)
  // ============================================================

  describe('removerParticipante', () => {
    it('deve chamar a API com jogoId e participanteId corretos', () => {
      configurarTestBed([participanteAprovadoStub]);
      jogosApiMock['removerParticipante'].mockReturnValue(of(undefined));

      service.removerParticipante(1, 11).subscribe();

      expect(jogosApiMock['removerParticipante']).toHaveBeenCalledWith(1, 11);
    });

    it('deve remover o participante do store após remoção', () => {
      configurarTestBed([participanteAprovadoStub]);
      jogosApiMock['removerParticipante'].mockReturnValue(of(undefined));

      service.removerParticipante(1, 11).subscribe();

      expect(jogosStoreMock.removeParticipante).toHaveBeenCalledWith(1, 11);
    });
  });

  // ============================================================
  // meuStatus
  // ============================================================

  describe('meuStatus', () => {
    it('deve delegar para meuStatusParticipacao da API', () => {
      configurarTestBed();
      jogosApiMock['meuStatusParticipacao'].mockReturnValue(of(participantePendenteStub));

      service.meuStatus(1).subscribe();

      expect(jogosApiMock['meuStatusParticipacao']).toHaveBeenCalledWith(1);
    });

    it('deve retornar o participante quando existe participação', () => {
      configurarTestBed();
      jogosApiMock['meuStatusParticipacao'].mockReturnValue(of(participanteAprovadoStub));

      let resultado: Participante | null | undefined;
      service.meuStatus(1).subscribe(p => (resultado = p));

      expect(resultado?.status).toBe('APROVADO');
    });

    it('deve retornar null quando API retorna null (usuário sem participação)', () => {
      configurarTestBed();
      jogosApiMock['meuStatusParticipacao'].mockReturnValue(of(null));

      let resultado: Participante | null | undefined;
      service.meuStatus(1).subscribe(p => (resultado = p));

      expect(resultado).toBeNull();
    });
  });

  // ============================================================
  // getParticipantesByStatus (business logic)
  // ============================================================

  describe('getParticipantesByStatus', () => {
    it('deve retornar apenas participantes com o status especificado', () => {
      configurarTestBed([
        participantePendenteStub,
        participanteAprovadoStub,
        participanteBanidoStub,
      ]);

      const pendentes = service.getParticipantesByStatus(1, 'PENDENTE');

      expect(pendentes).toHaveLength(1);
      expect(pendentes[0].id).toBe(10);
    });

    it('deve retornar lista vazia quando não há participantes com o status', () => {
      configurarTestBed([participanteAprovadoStub]);

      const pendentes = service.getParticipantesByStatus(1, 'PENDENTE');

      expect(pendentes).toHaveLength(0);
    });
  });

  // ============================================================
  // countAprovados
  // ============================================================

  describe('countAprovados', () => {
    it('deve retornar a quantidade de participantes aprovados', () => {
      configurarTestBed([
        participantePendenteStub,
        participanteAprovadoStub,
      ]);

      expect(service.countAprovados(1)).toBe(1);
    });

    it('deve retornar 0 quando não há aprovados', () => {
      configurarTestBed([participantePendenteStub]);

      expect(service.countAprovados(1)).toBe(0);
    });
  });

  // ============================================================
  // countPendentes
  // ============================================================

  describe('countPendentes', () => {
    it('deve retornar a quantidade de participantes pendentes', () => {
      configurarTestBed([
        participantePendenteStub,
        participanteAprovadoStub,
        { ...participantePendenteStub, id: 20, usuarioId: 77 },
      ]);

      expect(service.countPendentes(1)).toBe(2);
    });

    it('deve retornar 0 quando não há pendentes', () => {
      configurarTestBed([participanteAprovadoStub]);

      expect(service.countPendentes(1)).toBe(0);
    });
  });
});
