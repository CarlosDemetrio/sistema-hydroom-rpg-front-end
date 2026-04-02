import { render, screen, fireEvent } from '@testing-library/angular';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { provideRouter } from '@angular/router';

import { NpcsComponent } from './npcs.component';
import { FichaBusinessService } from '@core/services/business/ficha-business.service';
import { CurrentGameService } from '@core/services/current-game.service';
import { ConfigStore } from '@core/stores/config.store';
import { ToastService } from '@services/toast.service';
import { Ficha } from '@core/models/ficha.model';

// ============================================================
// Mock data
// ============================================================

const npcMock: Ficha = {
  id: 1,
  jogoId: 10,
  nome: 'Goblin Chefe',
  jogadorId: null,
  racaId: 2,
  racaNome: 'Goblin',
  classeId: null,
  classeNome: null,
  generoId: null,
  generoNome: null,
  indoleId: null,
  indoleNome: null,
  presencaId: null,
  presencaNome: null,
  nivel: 1,
  xp: 0,
  renascimentos: 0,
  isNpc: true,
  dataCriacao: '2024-01-01T00:00:00',
  dataUltimaAtualizacao: '2024-01-01T00:00:00',
};

const npcMock2: Ficha = {
  ...npcMock,
  id: 2,
  nome: 'Dragão Ancião',
  racaNome: null,
  classeNome: 'Guerreiro',
  classeId: 3,
};

const jogoAtualMock = { id: 10, nome: 'Campanha Épica', ativo: true };

// ============================================================
// Mock factories
// ============================================================

function criarCurrentGameServiceMock(temJogo = true) {
  return {
    hasCurrentGame: () => temJogo,
    currentGameId:  () => (temJogo ? 10 : null),
    currentGame:    () => (temJogo ? jogoAtualMock : null),
  };
}

function criarFichaServiceMock(npcs: Ficha[] = [], npcRetornado: Ficha = npcMock) {
  return {
    loadNpcs: vi.fn().mockReturnValue(of(npcs)),
    criarNpc: vi.fn().mockReturnValue(of(npcRetornado)),
  };
}

function criarConfigStoreMock() {
  return {
    racas:    () => [{ id: 2, nome: 'Goblin' }, { id: 3, nome: 'Orc' }],
    classes:  () => [{ id: 3, nome: 'Guerreiro' }, { id: 4, nome: 'Mago' }],
    generos:  () => [{ id: 1, nome: 'Masculino' }],
    indoles:  () => [{ id: 1, nome: 'Neutro' }],
    presencas:() => [{ id: 1, nome: 'Sutil' }],
  };
}

function criarToastServiceMock() {
  return {
    success: vi.fn(),
    error:   vi.fn(),
    warning: vi.fn(),
  };
}

// ============================================================
// Helpers de render
// ============================================================

async function renderNpcsComponent(overrides: {
  temJogo?: boolean;
  npcs?: Ficha[];
  npcRetornado?: Ficha;
  fichaServiceOverride?: Partial<ReturnType<typeof criarFichaServiceMock>>;
} = {}) {
  const { temJogo = true, npcs = [], npcRetornado = npcMock, fichaServiceOverride } = overrides;

  const fichaService = { ...criarFichaServiceMock(npcs, npcRetornado), ...fichaServiceOverride };
  const currentGameService = criarCurrentGameServiceMock(temJogo);
  const configStore = criarConfigStoreMock();
  const toastService = criarToastServiceMock();

  const result = await render(NpcsComponent, {
    providers: [
      provideRouter([]),
      { provide: FichaBusinessService, useValue: fichaService },
      { provide: CurrentGameService,   useValue: currentGameService },
      { provide: ConfigStore,          useValue: configStore },
      { provide: ToastService,         useValue: toastService },
    ],
  });

  return { ...result, fichaService, toastService };
}

// ============================================================
// Testes
// ============================================================

describe('NpcsComponent', () => {

  describe('renderização inicial', () => {
    it('exibe título "NPCs"', async () => {
      await renderNpcsComponent();
      expect(screen.getByText('NPCs')).toBeTruthy();
    });

    it('exibe o nome do jogo atual no subtítulo', async () => {
      await renderNpcsComponent({ temJogo: true });
      expect(screen.getByText(/Campanha Épica/)).toBeTruthy();
    });

    it('chama loadNpcs ao inicializar quando há jogo selecionado', async () => {
      const { fichaService } = await renderNpcsComponent({ npcs: [] });
      expect(fichaService.loadNpcs).toHaveBeenCalledWith(10);
    });

    it('não chama loadNpcs quando não há jogo selecionado', async () => {
      const { fichaService } = await renderNpcsComponent({ temJogo: false });
      expect(fichaService.loadNpcs).not.toHaveBeenCalled();
    });
  });

  describe('sem jogo selecionado', () => {
    it('exibe aviso de nenhum jogo selecionado', async () => {
      await renderNpcsComponent({ temJogo: false });
      expect(screen.getByText('Nenhum jogo selecionado')).toBeTruthy();
    });

    it('botão "Novo NPC" fica desabilitado', async () => {
      await renderNpcsComponent({ temJogo: false });
      const btn = screen.getByRole('button', { name: /Novo NPC/i });
      expect(btn).toBeDisabled();
    });
  });

  describe('empty state', () => {
    it('exibe empty state quando não há NPCs', async () => {
      await renderNpcsComponent({ npcs: [] });
      expect(screen.getByText('Nenhum NPC criado')).toBeTruthy();
    });

    it('exibe a descrição do empty state', async () => {
      await renderNpcsComponent({ npcs: [] });
      expect(screen.getByText(/Clique em 'Novo NPC'/)).toBeTruthy();
    });
  });

  describe('lista de NPCs', () => {
    it('renderiza NPCs na tabela', async () => {
      await renderNpcsComponent({ npcs: [npcMock, npcMock2] });
      expect(screen.getByText('Goblin Chefe')).toBeTruthy();
      expect(screen.getByText('Dragão Ancião')).toBeTruthy();
    });

    it('exibe raça do NPC quando disponível', async () => {
      await renderNpcsComponent({ npcs: [npcMock] });
      expect(screen.getByText('Goblin')).toBeTruthy();
    });

    it('exibe classe do NPC quando disponível', async () => {
      await renderNpcsComponent({ npcs: [npcMock2] });
      expect(screen.getByText('Guerreiro')).toBeTruthy();
    });

    it('exibe badge "NPC" para cada linha', async () => {
      await renderNpcsComponent({ npcs: [npcMock] });
      expect(screen.getByText('NPC')).toBeTruthy();
    });
  });

  describe('drawer de criação', () => {
    it('abre o drawer ao clicar em "Novo NPC"', async () => {
      await renderNpcsComponent({ npcs: [] });
      const btn = screen.getByRole('button', { name: /Novo NPC/i });
      fireEvent.click(btn);
      expect(screen.getByText('Novo NPC')).toBeTruthy();
    });

    it('exibe todos os campos do formulário', async () => {
      await renderNpcsComponent({ npcs: [] });
      fireEvent.click(screen.getByRole('button', { name: /Novo NPC/i }));

      expect(screen.getByLabelText('Nome do NPC')).toBeTruthy();
      expect(screen.getByLabelText('Raça do NPC')).toBeTruthy();
      expect(screen.getByLabelText('Classe do NPC')).toBeTruthy();
      expect(screen.getByLabelText('Gênero do NPC')).toBeTruthy();
      expect(screen.getByLabelText('Índole do NPC')).toBeTruthy();
      expect(screen.getByLabelText('Presença do NPC')).toBeTruthy();
    });
  });

  describe('criação de NPC', () => {
    it('chama criarNpc com o DTO correto ao submeter o formulário', async () => {
      const { fichaService } = await renderNpcsComponent({ npcs: [] });

      fireEvent.click(screen.getByRole('button', { name: /Novo NPC/i }));

      const nomeInput = screen.getByLabelText('Nome do NPC') as HTMLInputElement;
      fireEvent.input(nomeInput, { target: { value: 'Goblin Chefe' } });
      fireEvent.blur(nomeInput);

      fireEvent.click(screen.getByRole('button', { name: /Criar NPC/i }));

      expect(fichaService.criarNpc).toHaveBeenCalledWith(10, expect.objectContaining({
        jogoId: 10,
        nome: 'Goblin Chefe',
      }));
    });

    it('exibe toast de sucesso após criar NPC', async () => {
      const { toastService } = await renderNpcsComponent({ npcs: [] });

      fireEvent.click(screen.getByRole('button', { name: /Novo NPC/i }));

      const nomeInput = screen.getByLabelText('Nome do NPC') as HTMLInputElement;
      fireEvent.input(nomeInput, { target: { value: 'Goblin Chefe' } });
      fireEvent.blur(nomeInput);

      fireEvent.click(screen.getByRole('button', { name: /Criar NPC/i }));

      expect(toastService.success).toHaveBeenCalledWith(expect.stringContaining('Goblin Chefe'));
    });

    it('exibe erro de validação quando nome está vazio', async () => {
      const { toastService } = await renderNpcsComponent({ npcs: [] });

      fireEvent.click(screen.getByRole('button', { name: /Novo NPC/i }));
      fireEvent.click(screen.getByRole('button', { name: /Criar NPC/i }));

      expect(toastService.warning).toHaveBeenCalledWith(
        'Preencha todos os campos obrigatórios',
        'Atenção'
      );
    });

    it('exibe toast de erro quando a API falha', async () => {
      const { toastService } = await renderNpcsComponent({
        npcs: [],
        fichaServiceOverride: {
          criarNpc: vi.fn().mockReturnValue(throwError(() => new Error('HTTP 500'))),
        },
      });

      fireEvent.click(screen.getByRole('button', { name: /Novo NPC/i }));

      const nomeInput = screen.getByLabelText('Nome do NPC') as HTMLInputElement;
      fireEvent.input(nomeInput, { target: { value: 'Goblin Chefe' } });
      fireEvent.blur(nomeInput);

      fireEvent.click(screen.getByRole('button', { name: /Criar NPC/i }));

      expect(toastService.error).toHaveBeenCalledWith('Erro ao criar NPC');
    });
  });

  describe('erro ao carregar NPCs', () => {
    it('exibe toast de erro quando loadNpcs falha', async () => {
      const { toastService } = await renderNpcsComponent({
        fichaServiceOverride: {
          loadNpcs: vi.fn().mockReturnValue(throwError(() => new Error('HTTP 500'))),
        },
      });

      expect(toastService.error).toHaveBeenCalledWith('Erro ao carregar NPCs');
    });
  });

});
