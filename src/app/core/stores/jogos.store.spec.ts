import { TestBed } from '@angular/core/testing';
import { JogosStore } from './jogos.store';
import { JogoResumo } from '@core/models/jogo.model';
import { Participante } from '@core/models/participante.model';

// ============================================================
// Stubs
// ============================================================

const jogoAtivoStub: JogoResumo = {
  id: 1,
  nome: 'Campanha Alpha',
  descricao: 'Uma grande aventura',
  totalParticipantes: 3,
  ativo: true,
  meuRole: 'MESTRE',
};

const jogoInativoStub: JogoResumo = {
  id: 2,
  nome: 'Campanha Beta',
  descricao: null,
  totalParticipantes: 2,
  ativo: false,
  meuRole: 'JOGADOR',
};

const jogoAtivo2Stub: JogoResumo = {
  id: 3,
  nome: 'Campanha Gamma',
  descricao: null,
  totalParticipantes: 4,
  ativo: true,
  meuRole: 'JOGADOR',
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

const participante2Stub: Participante = {
  ...participanteStub,
  id: 11,
  usuarioId: 55,
  nomeUsuario: 'Outro Jogador',
  status: 'PENDENTE',
};

// ============================================================
// Testes
// ============================================================

describe('JogosStore', () => {
  let store: InstanceType<typeof JogosStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(JogosStore);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  // ============================================================
  // Estado inicial
  // ============================================================

  describe('estado inicial', () => {
    it('deve iniciar com lista de jogos vazia', () => {
      expect(store.jogos()).toHaveLength(0);
    });

    it('deve iniciar com mapa de participantes vazio', () => {
      expect(store.participantes().size).toBe(0);
    });

    it('deve iniciar com loading false', () => {
      expect(store.loading()).toBe(false);
    });

    it('deve iniciar com error null', () => {
      expect(store.error()).toBeNull();
    });
  });

  // ============================================================
  // setLoading e setError
  // ============================================================

  describe('setLoading e setError', () => {
    it('deve atualizar o estado de loading para true', () => {
      store.setLoading(true);

      expect(store.loading()).toBe(true);
    });

    it('deve atualizar o estado de loading para false', () => {
      store.setLoading(true);
      store.setLoading(false);

      expect(store.loading()).toBe(false);
    });

    it('deve definir mensagem de erro ao chamar setError', () => {
      store.setError('Erro de conexão');

      expect(store.error()).toBe('Erro de conexão');
    });

    it('deve zerar loading ao chamar setError', () => {
      store.setLoading(true);
      store.setError('Erro');

      expect(store.loading()).toBe(false);
    });

    it('deve limpar o erro ao passar null para setError', () => {
      store.setError('Algum erro');
      store.setError(null);

      expect(store.error()).toBeNull();
    });
  });

  // ============================================================
  // setJogos
  // ============================================================

  describe('setJogos', () => {
    it('deve substituir a lista de jogos', () => {
      store.setJogos([jogoAtivoStub, jogoInativoStub]);

      expect(store.jogos()).toHaveLength(2);
    });

    it('deve manter os dados corretos dos jogos após setar', () => {
      store.setJogos([jogoAtivoStub]);

      expect(store.jogos()[0].nome).toBe('Campanha Alpha');
    });

    it('deve zerar loading e error ao setar jogos', () => {
      store.setLoading(true);
      store.setError('erro anterior');

      store.setJogos([jogoAtivoStub]);

      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
    });

    it('deve substituir lista anterior ao chamar setJogos novamente', () => {
      store.setJogos([jogoAtivoStub]);
      store.setJogos([jogoInativoStub, jogoAtivo2Stub]);

      expect(store.jogos()).toHaveLength(2);
      expect(store.jogos()[0].id).toBe(2);
    });
  });

  // ============================================================
  // addJogo
  // ============================================================

  describe('addJogo', () => {
    it('deve adicionar um jogo à lista vazia', () => {
      store.addJogo(jogoAtivoStub);

      expect(store.jogos()).toHaveLength(1);
    });

    it('deve adicionar jogo ao final da lista existente', () => {
      store.setJogos([jogoAtivoStub]);
      store.addJogo(jogoAtivo2Stub);

      expect(store.jogos()).toHaveLength(2);
      expect(store.jogos()[1].id).toBe(3);
    });
  });

  // ============================================================
  // updateJogoInState
  // ============================================================

  describe('updateJogoInState', () => {
    it('deve atualizar apenas o jogo com o ID especificado', () => {
      store.setJogos([jogoAtivoStub, jogoInativoStub]);

      store.updateJogoInState(1, { nome: 'Novo Nome' });

      expect(store.jogos()[0].nome).toBe('Novo Nome');
    });

    it('não deve alterar jogos com IDs diferentes', () => {
      store.setJogos([jogoAtivoStub, jogoInativoStub]);

      store.updateJogoInState(1, { nome: 'Novo Nome' });

      expect(store.jogos()[1].nome).toBe('Campanha Beta');
    });

    it('deve mesclar dados parciais sem apagar campos existentes', () => {
      store.setJogos([jogoAtivoStub]);

      store.updateJogoInState(1, { ativo: false });

      expect(store.jogos()[0].nome).toBe('Campanha Alpha');
      expect(store.jogos()[0].ativo).toBe(false);
    });
  });

  // ============================================================
  // removeJogo
  // ============================================================

  describe('removeJogo', () => {
    it('deve remover o jogo com o ID especificado', () => {
      store.setJogos([jogoAtivoStub, jogoInativoStub]);

      store.removeJogo(1);

      expect(store.jogos()).toHaveLength(1);
      expect(store.jogos()[0].id).toBe(2);
    });

    it('não deve alterar a lista ao remover ID inexistente', () => {
      store.setJogos([jogoAtivoStub]);

      store.removeJogo(999);

      expect(store.jogos()).toHaveLength(1);
    });

    it('deve resultar em lista vazia ao remover o único jogo', () => {
      store.setJogos([jogoAtivoStub]);

      store.removeJogo(1);

      expect(store.jogos()).toHaveLength(0);
    });
  });

  // ============================================================
  // jogosAtivos (computed)
  // ============================================================

  describe('jogosAtivos (computed)', () => {
    it('deve retornar apenas os jogos com ativo=true', () => {
      store.setJogos([jogoAtivoStub, jogoInativoStub, jogoAtivo2Stub]);

      expect(store.jogosAtivos()).toHaveLength(2);
      expect(store.jogosAtivos().every(j => j.ativo)).toBe(true);
    });

    it('deve retornar lista vazia quando nenhum jogo está ativo', () => {
      store.setJogos([jogoInativoStub]);

      expect(store.jogosAtivos()).toHaveLength(0);
    });

    it('deve atualizar automaticamente ao chamar removeJogo', () => {
      store.setJogos([jogoAtivoStub, jogoAtivo2Stub]);

      store.removeJogo(1);

      expect(store.jogosAtivos()).toHaveLength(1);
      expect(store.jogosAtivos()[0].id).toBe(3);
    });
  });

  // ============================================================
  // Participantes — setParticipantes
  // ============================================================

  describe('setParticipantes', () => {
    it('deve definir lista de participantes para o jogo especificado', () => {
      store.setParticipantes(1, [participanteStub, participante2Stub]);

      expect(store.getParticipantes(1)).toHaveLength(2);
    });

    it('deve isolar participantes por jogoId', () => {
      store.setParticipantes(1, [participanteStub]);
      store.setParticipantes(2, [participante2Stub]);

      expect(store.getParticipantes(1)).toHaveLength(1);
      expect(store.getParticipantes(2)).toHaveLength(1);
    });

    it('deve substituir participantes existentes ao chamar novamente', () => {
      store.setParticipantes(1, [participanteStub]);
      store.setParticipantes(1, [participante2Stub]);

      expect(store.getParticipantes(1)).toHaveLength(1);
      expect(store.getParticipantes(1)[0].id).toBe(11);
    });
  });

  // ============================================================
  // Participantes — addParticipante
  // ============================================================

  describe('addParticipante', () => {
    it('deve adicionar participante à lista existente', () => {
      store.setParticipantes(1, [participanteStub]);

      store.addParticipante(1, participante2Stub);

      expect(store.getParticipantes(1)).toHaveLength(2);
    });

    it('deve criar lista ao adicionar participante em jogo sem participantes', () => {
      store.addParticipante(1, participanteStub);

      expect(store.getParticipantes(1)).toHaveLength(1);
    });
  });

  // ============================================================
  // Participantes — updateParticipanteInState
  // ============================================================

  describe('updateParticipanteInState', () => {
    it('deve atualizar o status do participante', () => {
      store.setParticipantes(1, [participanteStub, participante2Stub]);

      store.updateParticipanteInState(1, 11, { status: 'APROVADO' });

      const atualizado = store.getParticipantes(1).find(p => p.id === 11);
      expect(atualizado?.status).toBe('APROVADO');
    });

    it('não deve alterar outros participantes ao atualizar um', () => {
      store.setParticipantes(1, [participanteStub, participante2Stub]);

      store.updateParticipanteInState(1, 11, { status: 'BANIDO' });

      expect(store.getParticipantes(1)[0].status).toBe('APROVADO');
    });
  });

  // ============================================================
  // Participantes — removeParticipante
  // ============================================================

  describe('removeParticipante', () => {
    it('deve remover participante pelo ID', () => {
      store.setParticipantes(1, [participanteStub, participante2Stub]);

      store.removeParticipante(1, 10);

      expect(store.getParticipantes(1)).toHaveLength(1);
      expect(store.getParticipantes(1)[0].id).toBe(11);
    });
  });

  // ============================================================
  // getParticipantes
  // ============================================================

  describe('getParticipantes', () => {
    it('deve retornar lista vazia para jogo sem participantes registrados', () => {
      expect(store.getParticipantes(999)).toHaveLength(0);
    });
  });
});
