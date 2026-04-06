import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { JogoDetailComponent } from './jogo-detail.component';
import { ParticipanteBusinessService } from '@core/services/business/participante-business.service';
import { FichaBusinessService } from '@core/services/business/ficha-business.service';
import { JogoManagementFacadeService } from '@features/mestre/services/jogo-management-facade.service';
import { JogosStore } from '@core/stores/jogos.store';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Participante } from '@core/models/participante.model';

// ============================================================
// Stubs
// ============================================================

const participanteAprovado: Participante = {
  id: 10,
  jogoId: 1,
  usuarioId: 42,
  nomeUsuario: 'Jogador Alpha',
  role: 'JOGADOR',
  status: 'APROVADO',
  dataCriacao: '2024-01-01T00:00:00',
  dataUltimaAtualizacao: '2024-01-01T00:00:00',
};

const participantePendente: Participante = {
  id: 11,
  jogoId: 1,
  usuarioId: 55,
  nomeUsuario: 'Jogador Beta',
  role: 'JOGADOR',
  status: 'PENDENTE',
  dataCriacao: '2024-01-01T00:00:00',
  dataUltimaAtualizacao: '2024-01-01T00:00:00',
};

const participanteBanido: Participante = {
  id: 12,
  jogoId: 1,
  usuarioId: 66,
  nomeUsuario: 'Jogador Gamma',
  role: 'JOGADOR',
  status: 'BANIDO',
  dataCriacao: '2024-01-01T00:00:00',
  dataUltimaAtualizacao: '2024-01-01T00:00:00',
};

const participanteRejeitado: Participante = {
  id: 13,
  jogoId: 1,
  usuarioId: 77,
  nomeUsuario: 'Jogador Delta',
  role: 'JOGADOR',
  status: 'REJEITADO',
  dataCriacao: '2024-01-01T00:00:00',
  dataUltimaAtualizacao: '2024-01-01T00:00:00',
};

const todosParticipantes = [
  participanteAprovado,
  participantePendente,
  participanteBanido,
  participanteRejeitado,
];

// ============================================================
// Mock factories
// ============================================================

function criarParticipanteServiceMock(participantes: Participante[] = []) {
  return {
    loadParticipantes: vi.fn().mockReturnValue(of(participantes)),
    aprovarParticipante: vi.fn().mockReturnValue(of({ ...participantePendente, status: 'APROVADO' })),
    rejeitarParticipante: vi.fn().mockReturnValue(of({ ...participantePendente, status: 'REJEITADO' })),
    banirParticipante: vi.fn().mockReturnValue(of({ ...participanteAprovado, status: 'BANIDO' })),
    desbanirParticipante: vi.fn().mockReturnValue(of({ ...participanteBanido, status: 'APROVADO' })),
    removerParticipante: vi.fn().mockReturnValue(of(undefined)),
  };
}

function criarJogosStoreMock(participantes: Participante[] = []) {
  return {
    getParticipantes: vi.fn().mockReturnValue(participantes),
  };
}

function criarJogoFacadeMock() {
  return {
    loading: signal(false).asReadonly(),
    error: signal<string | null>(null).asReadonly(),
    jogos: signal([{ id: 1, nome: 'Campanha Épica', ativo: true, totalParticipantes: 4 }]).asReadonly(),
    loadJogos: vi.fn().mockReturnValue(of([])),
    deleteJogo: vi.fn().mockReturnValue(of(undefined)),
  };
}

function criarFichaServiceMock() {
  return {
    fichas: signal([]).asReadonly(),
    loadFichas: vi.fn().mockReturnValue(of([])),
  };
}

// ============================================================
// Helpers de configuração do TestBed
// ============================================================

function configurarTestBed(participantes: Participante[] = todosParticipantes) {
  const participanteServiceMock = criarParticipanteServiceMock(participantes);
  const jogosStoreMock = criarJogosStoreMock(participantes);
  const jogoFacadeMock = criarJogoFacadeMock();
  const fichaServiceMock = criarFichaServiceMock();
  const confirmationServiceMock = { confirm: vi.fn() };
  const messageServiceMock = { add: vi.fn() };

  TestBed.configureTestingModule({
    imports: [JogoDetailComponent],
    providers: [
      { provide: ParticipanteBusinessService, useValue: participanteServiceMock },
      { provide: JogosStore, useValue: jogosStoreMock },
      { provide: JogoManagementFacadeService, useValue: jogoFacadeMock },
      { provide: FichaBusinessService, useValue: fichaServiceMock },
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { paramMap: { get: () => '1' } } },
      },
    ],
  });

  // ConfirmationService e MessageService são providers DO COMPONENTE (component-level DI).
  // Precisam ser sobrescritos via overrideComponent, não via configureTestingModule.
  TestBed.overrideComponent(JogoDetailComponent, {
    set: {
      providers: [
        { provide: ConfirmationService, useValue: confirmationServiceMock },
        { provide: MessageService, useValue: messageServiceMock },
      ],
    },
  });

  TestBed.overrideTemplate(JogoDetailComponent, '<div></div>');

  const fixture = TestBed.createComponent(JogoDetailComponent);
  const component = fixture.componentInstance;

  // Inicializa como se tivesse lido a rota
  component.jogoId.set(1);

  return {
    component,
    fixture,
    participanteServiceMock,
    confirmationServiceMock,
    messageServiceMock,
  };
}

// ============================================================
// Testes
// ============================================================

describe('JogoDetailComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  // ----------------------------------------------------------
  // removerParticipante — deve chamar removerParticipante() (não banir)
  // ----------------------------------------------------------

  describe('removerParticipante()', () => {
    it('deve chamar participanteService.removerParticipante() (não banirParticipante)', () => {
      const { component, participanteServiceMock, confirmationServiceMock } = configurarTestBed();

      // Simula o usuário confirmando o dialog
      confirmationServiceMock.confirm.mockImplementation(({ accept }: { accept: () => void }) => accept());

      component.removerParticipante(10);

      expect(participanteServiceMock.removerParticipante).toHaveBeenCalledWith(1, 10);
      expect(participanteServiceMock.banirParticipante).not.toHaveBeenCalled();
    });

    it('não chama removerParticipante() quando o usuário cancela o dialog', () => {
      const { component, participanteServiceMock, confirmationServiceMock } = configurarTestBed();

      // Não invoca accept
      confirmationServiceMock.confirm.mockImplementation(() => {});

      component.removerParticipante(10);

      expect(participanteServiceMock.removerParticipante).not.toHaveBeenCalled();
    });
  });

  // ----------------------------------------------------------
  // banirParticipante — deve chamar banirParticipante()
  // ----------------------------------------------------------

  describe('banirParticipante()', () => {
    it('deve chamar participanteService.banirParticipante() após confirmação', () => {
      const { component, participanteServiceMock, confirmationServiceMock } = configurarTestBed();

      confirmationServiceMock.confirm.mockImplementation(({ accept }: { accept: () => void }) => accept());

      component.banirParticipante(10);

      expect(participanteServiceMock.banirParticipante).toHaveBeenCalledWith(1, 10);
    });

    it('não chama banirParticipante() quando o usuário cancela', () => {
      const { component, participanteServiceMock, confirmationServiceMock } = configurarTestBed();

      confirmationServiceMock.confirm.mockImplementation(() => {});

      component.banirParticipante(10);

      expect(participanteServiceMock.banirParticipante).not.toHaveBeenCalled();
    });
  });

  // ----------------------------------------------------------
  // desbanirParticipante — deve chamar desbanirParticipante() sem dialog
  // ----------------------------------------------------------

  describe('desbanirParticipante()', () => {
    it('deve chamar participanteService.desbanirParticipante() diretamente (sem dialog)', () => {
      const { component, participanteServiceMock, confirmationServiceMock } = configurarTestBed();

      component.desbanirParticipante(12);

      expect(participanteServiceMock.desbanirParticipante).toHaveBeenCalledWith(1, 12);
      expect(confirmationServiceMock.confirm).not.toHaveBeenCalled();
    });
  });

  // ----------------------------------------------------------
  // participantesFiltrados — filtro por status
  // ----------------------------------------------------------

  describe('participantesFiltrados()', () => {
    it('retorna todos os participantes quando filtro é TODOS', () => {
      const { component } = configurarTestBed(todosParticipantes);

      component.filtroStatus.set('TODOS');

      expect(component.participantesFiltrados().length).toBe(4);
    });

    it('filtra por APROVADO corretamente', () => {
      const { component } = configurarTestBed(todosParticipantes);

      component.filtroStatus.set('APROVADO');

      const filtrados = component.participantesFiltrados();
      expect(filtrados.length).toBe(1);
      expect(filtrados[0].status).toBe('APROVADO');
    });

    it('filtra por PENDENTE corretamente', () => {
      const { component } = configurarTestBed(todosParticipantes);

      component.filtroStatus.set('PENDENTE');

      const filtrados = component.participantesFiltrados();
      expect(filtrados.length).toBe(1);
      expect(filtrados[0].status).toBe('PENDENTE');
    });

    it('filtra por BANIDO corretamente', () => {
      const { component } = configurarTestBed(todosParticipantes);

      component.filtroStatus.set('BANIDO');

      const filtrados = component.participantesFiltrados();
      expect(filtrados.length).toBe(1);
      expect(filtrados[0].status).toBe('BANIDO');
    });

    it('retorna lista vazia quando nenhum participante corresponde ao filtro', () => {
      const { component } = configurarTestBed([participanteAprovado]);

      component.filtroStatus.set('BANIDO');

      expect(component.participantesFiltrados().length).toBe(0);
    });

    it('filtroStatus inicia com TODOS por padrão', () => {
      const { component } = configurarTestBed();

      expect(component.filtroStatus()).toBe('TODOS');
    });
  });
});
