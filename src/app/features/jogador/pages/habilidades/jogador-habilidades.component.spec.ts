/**
 * JogadorHabilidadesComponent — Spec
 *
 * NOTA JIT: Usa overrideTemplate para evitar NG0950 em modo JIT no Vitest.
 * Foco: CRUD, tratamento de 409, estado sem jogo, permissões simétricas.
 */
import { TestBed } from '@angular/core/testing';
import { render, screen } from '@testing-library/angular';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { ConfirmationService } from 'primeng/api';

import { JogadorHabilidadesComponent } from './jogador-habilidades.component';
import { ConfigApiService } from '@core/services/api/config-api.service';
import { CurrentGameService } from '@core/services/current-game.service';
import { ToastService } from '@services/toast.service';
import { HabilidadeConfig } from '@core/models/habilidade-config.model';

// ============================================================
// Dados de teste
// ============================================================

const esquivaMock: HabilidadeConfig = {
  id: 1,
  jogoId: 20,
  nome: 'Esquiva Relâmpago',
  danoEfeito: null,
  descricao: 'Evita completamente o próximo ataque',
  ordemExibicao: 1,
  dataCriacao: '2024-02-01',
  dataUltimaAtualizacao: '2024-02-01',
};

const tiroPresisoMock: HabilidadeConfig = {
  id: 2,
  jogoId: 20,
  nome: 'Tiro Preciso',
  danoEfeito: '1D8+DES de dano perfurante',
  descricao: null,
  ordemExibicao: 2,
  dataCriacao: '2024-02-01',
  dataUltimaAtualizacao: '2024-02-01',
};

// ============================================================
// Helpers de mock
// ============================================================

function criarConfigApiMock(
  habilidades: HabilidadeConfig[] = [esquivaMock, tiroPresisoMock],
) {
  return {
    listHabilidades:   vi.fn().mockReturnValue(of(habilidades)),
    createHabilidade:  vi.fn().mockReturnValue(of(esquivaMock)),
    updateHabilidade:  vi.fn().mockReturnValue(of(esquivaMock)),
    deleteHabilidade:  vi.fn().mockReturnValue(of(void 0)),
  };
}

function criarCurrentGameServiceMock(temJogo = true) {
  const jogoAtual = temJogo ? { id: 20, nome: 'Aventura Épica', ativo: true } : null;
  return {
    currentGameId:  () => (temJogo ? 20 : null),
    hasCurrentGame: () => temJogo,
    currentGame:    () => jogoAtual,
    availableGames: signal([]).asReadonly(),
    selectGame:     vi.fn(),
    clearGame:      vi.fn(),
  };
}

function criarToastServiceMock() {
  return {
    success: vi.fn(),
    error:   vi.fn(),
    warning: vi.fn(),
    info:    vi.fn(),
    clear:   vi.fn(),
  };
}

// Template stub mínimo — evita NG0950 em JIT
const TEMPLATE_STUB = `
  <div id="jogador-habilidades-stub">
    @if (hasGame()) {
      <span id="jogo-ativo">{{ currentGameName() }}</span>
    }
    @if (!hasGame()) {
      <p id="sem-jogo">Nenhum jogo selecionado</p>
    }
    @for (h of habilidades(); track h.id) {
      <span class="habilidade-nome">{{ h.nome }}</span>
    }
    @if (dialogVisible()) {
      <div id="dialog-visible">Dialog aberto</div>
    }
    @if (editMode()) {
      <div id="edit-mode">Modo edição</div>
    }
    @if (erroConflito()) {
      <div id="erro-conflito">Nome duplicado</div>
    }
    @if (saving()) {
      <div id="saving">Salvando...</div>
    }
  </div>
`;

async function renderJogadorHabilidades(
  habilidades: HabilidadeConfig[] = [esquivaMock, tiroPresisoMock],
  temJogo = true,
) {
  const configApiMock          = criarConfigApiMock(habilidades);
  const currentGameServiceMock = criarCurrentGameServiceMock(temJogo);
  const toastServiceMock       = criarToastServiceMock();

  const result = await render(JogadorHabilidadesComponent, {
    configureTestBed: (tb) => {
      tb.overrideTemplate(JogadorHabilidadesComponent, TEMPLATE_STUB);
    },
    providers: [
      { provide: ConfigApiService,   useValue: configApiMock },
      { provide: CurrentGameService, useValue: currentGameServiceMock },
      { provide: ToastService,       useValue: toastServiceMock },
      ConfirmationService,
    ],
  });

  const confirmationService = result.fixture.componentRef.injector.get(ConfirmationService);
  return { ...result, configApiMock, toastServiceMock, confirmationService };
}

// ============================================================
// Testes
// ============================================================

describe('JogadorHabilidadesComponent', () => {

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  // ----------------------------------------------------------
  // 1. Carregamento de dados
  // ----------------------------------------------------------

  describe('carregamento de dados', () => {
    it('deve carregar habilidades ao inicializar quando há jogo selecionado', async () => {
      const { configApiMock } = await renderJogadorHabilidades();

      expect(configApiMock.listHabilidades).toHaveBeenCalledWith(20);
    });

    it('deve exibir habilidades carregadas', async () => {
      await renderJogadorHabilidades();

      expect(screen.getByText('Esquiva Relâmpago')).toBeTruthy();
      expect(screen.getByText('Tiro Preciso')).toBeTruthy();
    });

    it('não deve carregar quando não há jogo selecionado', async () => {
      const { configApiMock } = await renderJogadorHabilidades([], false);

      expect(configApiMock.listHabilidades).not.toHaveBeenCalled();
    });

    it('deve exibir mensagem de sem jogo quando hasGame é false', async () => {
      await renderJogadorHabilidades([], false);

      expect(screen.getByText('Nenhum jogo selecionado')).toBeTruthy();
    });
  });

  // ----------------------------------------------------------
  // 2. Sinais de estado
  // ----------------------------------------------------------

  describe('sinais de estado', () => {
    it('habilidades deve ter 2 itens após carregamento', async () => {
      const { fixture } = await renderJogadorHabilidades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      expect(comp.habilidades().length).toBe(2);
    });

    it('loading deve ser false após carregamento', async () => {
      const { fixture } = await renderJogadorHabilidades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      expect(comp.loading()).toBe(false);
    });

    it('dialogVisible deve inicializar como false', async () => {
      const { fixture } = await renderJogadorHabilidades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      expect(comp.dialogVisible()).toBe(false);
    });

    it('saving deve inicializar como false', async () => {
      const { fixture } = await renderJogadorHabilidades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      expect(comp.saving()).toBe(false);
    });
  });

  // ----------------------------------------------------------
  // 3. openDialog
  // ----------------------------------------------------------

  describe('openDialog', () => {
    it('deve abrir dialog em modo criação quando chamado sem argumento', async () => {
      const { fixture } = await renderJogadorHabilidades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDialog();
      fixture.detectChanges();

      expect(comp.dialogVisible()).toBe(true);
      expect(comp.editMode()).toBe(false);
    });

    it('deve abrir dialog em modo edição com dados da habilidade', async () => {
      const { fixture } = await renderJogadorHabilidades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDialog(tiroPresisoMock);
      fixture.detectChanges();

      expect(comp.dialogVisible()).toBe(true);
      expect(comp.editMode()).toBe(true);
      expect(comp.currentEditId()).toBe(2);
      expect(comp.form.get('nome')?.value).toBe('Tiro Preciso');
      expect(comp.form.get('danoEfeito')?.value).toBe('1D8+DES de dano perfurante');
    });

    it('deve resetar erroConflito ao abrir dialog', async () => {
      const { fixture } = await renderJogadorHabilidades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      // Simular erro prévio
      comp['erroConflito'].set(true);
      comp.openDialog();
      fixture.detectChanges();

      expect(comp.erroConflito()).toBe(false);
    });
  });

  // ----------------------------------------------------------
  // 4. save — JOGADOR tem as mesmas permissões que MESTRE
  // ----------------------------------------------------------

  describe('save (permissões simétricas do Jogador)', () => {
    it('deve chamar createHabilidade quando JOGADOR cria uma habilidade', async () => {
      const { fixture, configApiMock } = await renderJogadorHabilidades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDialog();
      comp.form.patchValue({
        nome: 'Voo das Sombras',
        danoEfeito: null,
        ordemExibicao: 3,
      });
      comp.save();

      expect(configApiMock.createHabilidade).toHaveBeenCalledWith(
        20,
        expect.objectContaining({ nome: 'Voo das Sombras' }),
        expect.anything(),
      );
    });

    it('deve chamar updateHabilidade quando JOGADOR edita uma habilidade', async () => {
      const { fixture, configApiMock } = await renderJogadorHabilidades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDialog(esquivaMock);
      comp.form.patchValue({ nome: 'Esquiva Perfeita' });
      comp.save();

      expect(configApiMock.updateHabilidade).toHaveBeenCalledWith(
        20,
        1,
        expect.objectContaining({ nome: 'Esquiva Perfeita' }),
        expect.anything(),
      );
    });

    it('deve exibir warning quando nome está vazio', async () => {
      const { fixture, toastServiceMock } = await renderJogadorHabilidades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDialog();
      comp.form.patchValue({ nome: '' });
      comp.save();

      expect(toastServiceMock.warning).toHaveBeenCalled();
    });

    it('deve definir erroConflito=true em erro 409 (nome duplicado)', async () => {
      const configApiMock409 = {
        listHabilidades:  vi.fn().mockReturnValue(of([esquivaMock])),
        createHabilidade: vi.fn().mockReturnValue(throwError(() => ({ status: 409 }))),
        updateHabilidade: vi.fn(),
        deleteHabilidade: vi.fn(),
      };

      const result = await render(JogadorHabilidadesComponent, {
        configureTestBed: (tb) => {
          tb.overrideTemplate(JogadorHabilidadesComponent, TEMPLATE_STUB);
        },
        providers: [
          { provide: ConfigApiService,   useValue: configApiMock409 },
          { provide: CurrentGameService, useValue: criarCurrentGameServiceMock() },
          { provide: ToastService,       useValue: criarToastServiceMock() },
          ConfirmationService,
        ],
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = result.fixture.componentInstance as any;
      comp.openDialog();
      comp.form.patchValue({ nome: 'Esquiva Relâmpago', ordemExibicao: 3 });
      comp.save();
      result.fixture.detectChanges();

      expect(comp.erroConflito()).toBe(true);
    });

    it('deve exibir toast de erro para erros não-409', async () => {
      const toastMock = criarToastServiceMock();
      const configApiMock500 = {
        listHabilidades:  vi.fn().mockReturnValue(of([esquivaMock])),
        createHabilidade: vi.fn().mockReturnValue(throwError(() => ({ status: 500, error: { message: 'Erro interno' } }))),
        updateHabilidade: vi.fn(),
        deleteHabilidade: vi.fn(),
      };

      const result = await render(JogadorHabilidadesComponent, {
        configureTestBed: (tb) => {
          tb.overrideTemplate(JogadorHabilidadesComponent, TEMPLATE_STUB);
        },
        providers: [
          { provide: ConfigApiService,   useValue: configApiMock500 },
          { provide: CurrentGameService, useValue: criarCurrentGameServiceMock() },
          { provide: ToastService,       useValue: toastMock },
          ConfirmationService,
        ],
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = result.fixture.componentInstance as any;
      comp.openDialog();
      comp.form.patchValue({ nome: 'Nova Habilidade', ordemExibicao: 3 });
      comp.save();
      result.fixture.detectChanges();

      expect(toastMock.error).toHaveBeenCalledWith('Erro interno', 'Erro');
    });
  });

  // ----------------------------------------------------------
  // 5. Exclusão — JOGADOR pode deletar (permissão simétrica)
  // ----------------------------------------------------------

  describe('exclusão', () => {
    it('deve chamar deleteHabilidade quando JOGADOR confirma exclusão', async () => {
      const { fixture, configApiMock, confirmationService } = await renderJogadorHabilidades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      vi.spyOn(confirmationService, 'confirm').mockImplementation(({ accept }: { accept?: () => void }) => {
        accept?.();
      });

      comp.confirmDelete(1);

      expect(configApiMock.deleteHabilidade).toHaveBeenCalledWith(20, 1);
    });
  });

  // ----------------------------------------------------------
  // 6. truncar helper
  // ----------------------------------------------------------

  describe('truncar', () => {
    it('deve retornar texto intacto quando menor que o limite', async () => {
      const { fixture } = await renderJogadorHabilidades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      expect(comp.truncar('Texto curto', 60)).toBe('Texto curto');
    });

    it('deve truncar com reticências quando excede o limite', async () => {
      const { fixture } = await renderJogadorHabilidades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      const textoLongo = 'X'.repeat(80);
      const resultado = comp.truncar(textoLongo, 60);

      expect(resultado.endsWith('...')).toBe(true);
      expect(resultado.length).toBe(63);
    });
  });
});
