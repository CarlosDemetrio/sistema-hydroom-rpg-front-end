/**
 * HabilidadesConfigComponent — Spec (Mestre)
 *
 * NOTA JIT: Usa overrideTemplate para evitar NG0950 em modo JIT no Vitest.
 * Foco: sinais, CRUD, tratamento de 409, truncamento, estado sem jogo.
 */
import { TestBed } from '@angular/core/testing';
import { render, screen } from '@testing-library/angular';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { ConfirmationService } from 'primeng/api';

import { HabilidadesConfigComponent } from './habilidades-config.component';
import { ConfigApiService } from '@core/services/api/config-api.service';
import { CurrentGameService } from '@core/services/current-game.service';
import { ToastService } from '@services/toast.service';
import { HabilidadeConfig } from '@core/models/habilidade-config.model';

// ============================================================
// Dados de teste
// ============================================================

const golpeBrutalMock: HabilidadeConfig = {
  id: 1,
  jogoId: 10,
  nome: 'Golpe Brutal',
  danoEfeito: '2D6+FOR de dano físico',
  descricao: 'Um golpe poderoso que derruba oponentes',
  ordemExibicao: 1,
  dataCriacao: '2024-01-01',
  dataUltimaAtualizacao: '2024-01-01',
};

const chamaSagradaMock: HabilidadeConfig = {
  id: 2,
  jogoId: 10,
  nome: 'Chama Sagrada',
  danoEfeito: '3D8 de dano sagrado',
  descricao: null,
  ordemExibicao: 2,
  dataCriacao: '2024-01-01',
  dataUltimaAtualizacao: '2024-01-01',
};

const habilidadeSemEfeitoMock: HabilidadeConfig = {
  id: 3,
  jogoId: 10,
  nome: 'Esquiva Perfeita',
  danoEfeito: null,
  descricao: 'Evita o próximo ataque',
  ordemExibicao: 3,
  dataCriacao: '2024-01-01',
  dataUltimaAtualizacao: '2024-01-01',
};

// ============================================================
// Helpers de mock
// ============================================================

function criarConfigApiMock(
  habilidades: HabilidadeConfig[] = [golpeBrutalMock, chamaSagradaMock],
) {
  return {
    listHabilidades:   vi.fn().mockReturnValue(of(habilidades)),
    createHabilidade:  vi.fn().mockReturnValue(of(golpeBrutalMock)),
    updateHabilidade:  vi.fn().mockReturnValue(of(golpeBrutalMock)),
    deleteHabilidade:  vi.fn().mockReturnValue(of(void 0)),
  };
}

function criarCurrentGameServiceMock(temJogo = true) {
  const jogoAtual = temJogo ? { id: 10, nome: 'Campanha Teste', ativo: true } : null;
  return {
    currentGameId:  () => (temJogo ? 10 : null),
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
  <div id="habilidades-config-stub">
    @if (hasGame()) {
      <span id="jogo-ativo">{{ currentGameName() }}</span>
    }
    @if (!hasGame()) {
      <p id="sem-jogo">Nenhum jogo selecionado</p>
    }
    @for (h of habilidades(); track h.id) {
      <span class="habilidade-nome">{{ h.nome }}</span>
      <span class="habilidade-efeito">{{ h.danoEfeito }}</span>
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
  </div>
`;

async function renderHabilidades(
  habilidades: HabilidadeConfig[] = [golpeBrutalMock, chamaSagradaMock],
  temJogo = true,
) {
  const configApiMock          = criarConfigApiMock(habilidades);
  const currentGameServiceMock = criarCurrentGameServiceMock(temJogo);
  const toastServiceMock       = criarToastServiceMock();

  const result = await render(HabilidadesConfigComponent, {
    configureTestBed: (tb) => {
      tb.overrideTemplate(HabilidadesConfigComponent, TEMPLATE_STUB);
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

describe('HabilidadesConfigComponent', () => {

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  // ----------------------------------------------------------
  // 1. Carregamento de dados
  // ----------------------------------------------------------

  describe('carregamento de dados', () => {
    it('deve carregar habilidades ao inicializar quando há jogo selecionado', async () => {
      const { configApiMock } = await renderHabilidades();

      expect(configApiMock.listHabilidades).toHaveBeenCalledWith(10);
    });

    it('deve exibir habilidades carregadas', async () => {
      await renderHabilidades();

      expect(screen.getByText('Golpe Brutal')).toBeTruthy();
      expect(screen.getByText('Chama Sagrada')).toBeTruthy();
    });

    it('não deve carregar quando não há jogo selecionado', async () => {
      const { configApiMock } = await renderHabilidades([], false);

      expect(configApiMock.listHabilidades).not.toHaveBeenCalled();
    });

    it('deve exibir aviso de sem jogo quando hasGame é false', async () => {
      await renderHabilidades([], false);

      expect(screen.getByText('Nenhum jogo selecionado')).toBeTruthy();
    });
  });

  // ----------------------------------------------------------
  // 2. Sinais de estado
  // ----------------------------------------------------------

  describe('sinais de estado', () => {
    it('habilidades deve ter 2 itens após carregamento', async () => {
      const { fixture } = await renderHabilidades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      expect(comp.habilidades().length).toBe(2);
    });

    it('loading deve ser false após carregar', async () => {
      const { fixture } = await renderHabilidades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      expect(comp.loading()).toBe(false);
    });

    it('dialogVisible deve inicializar como false', async () => {
      const { fixture } = await renderHabilidades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      expect(comp.dialogVisible()).toBe(false);
    });

    it('editMode deve inicializar como false', async () => {
      const { fixture } = await renderHabilidades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      expect(comp.editMode()).toBe(false);
    });

    it('erroConflito deve inicializar como false', async () => {
      const { fixture } = await renderHabilidades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      expect(comp.erroConflito()).toBe(false);
    });
  });

  // ----------------------------------------------------------
  // 3. openDialog e editMode
  // ----------------------------------------------------------

  describe('openDialog', () => {
    it('deve abrir dialog em modo criação quando chamado sem argumento', async () => {
      const { fixture } = await renderHabilidades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDialog();
      fixture.detectChanges();

      expect(comp.dialogVisible()).toBe(true);
      expect(comp.editMode()).toBe(false);
    });

    it('deve abrir dialog em modo edição com dados da habilidade', async () => {
      const { fixture } = await renderHabilidades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDialog(golpeBrutalMock);
      fixture.detectChanges();

      expect(comp.dialogVisible()).toBe(true);
      expect(comp.editMode()).toBe(true);
      expect(comp.currentEditId()).toBe(1);
      expect(comp.form.get('nome')?.value).toBe('Golpe Brutal');
      expect(comp.form.get('danoEfeito')?.value).toBe('2D6+FOR de dano físico');
    });

    it('deve fechar dialog e resetar erroConflito ao chamar closeDialog', async () => {
      const { fixture } = await renderHabilidades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDialog();
      comp.closeDialog();
      fixture.detectChanges();

      expect(comp.dialogVisible()).toBe(false);
      expect(comp.erroConflito()).toBe(false);
    });

    it('deve preencher danoEfeito como string vazia quando null no modo edição', async () => {
      const { fixture } = await renderHabilidades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDialog(habilidadeSemEfeitoMock);
      fixture.detectChanges();

      expect(comp.form.get('danoEfeito')?.value).toBe('');
    });
  });

  // ----------------------------------------------------------
  // 4. save — criação e edição
  // ----------------------------------------------------------

  describe('save', () => {
    it('deve chamar createHabilidade ao salvar nova habilidade', async () => {
      const { fixture, configApiMock } = await renderHabilidades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDialog();
      comp.form.patchValue({
        nome: 'Ataque Relâmpago',
        danoEfeito: '1D10+AGI',
        ordemExibicao: 3,
      });
      comp.save();

      expect(configApiMock.createHabilidade).toHaveBeenCalledWith(
        10,
        expect.objectContaining({ nome: 'Ataque Relâmpago', danoEfeito: '1D10+AGI' }),
        expect.anything(),
      );
    });

    it('deve chamar updateHabilidade ao salvar habilidade existente', async () => {
      const { fixture, configApiMock } = await renderHabilidades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDialog(golpeBrutalMock);
      comp.form.patchValue({ nome: 'Golpe Devastador' });
      comp.save();

      expect(configApiMock.updateHabilidade).toHaveBeenCalledWith(
        10,
        1,
        expect.objectContaining({ nome: 'Golpe Devastador' }),
        expect.anything(),
      );
    });

    it('deve exibir warning ao salvar formulário inválido', async () => {
      const { fixture, toastServiceMock } = await renderHabilidades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDialog();
      comp.form.patchValue({ nome: '' });
      comp.save();

      expect(toastServiceMock.warning).toHaveBeenCalled();
    });

    it('deve definir erroConflito como true em erro 409', async () => {
      const configApiMock = {
        listHabilidades:  vi.fn().mockReturnValue(of([golpeBrutalMock])),
        createHabilidade: vi.fn().mockReturnValue(throwError(() => ({ status: 409 }))),
        updateHabilidade: vi.fn(),
        deleteHabilidade: vi.fn(),
      };

      const result = await render(HabilidadesConfigComponent, {
        configureTestBed: (tb) => {
          tb.overrideTemplate(HabilidadesConfigComponent, TEMPLATE_STUB);
        },
        providers: [
          { provide: ConfigApiService,   useValue: configApiMock },
          { provide: CurrentGameService, useValue: criarCurrentGameServiceMock() },
          { provide: ToastService,       useValue: criarToastServiceMock() },
          ConfirmationService,
        ],
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = result.fixture.componentInstance as any;
      comp.openDialog();
      comp.form.patchValue({ nome: 'Golpe Brutal', ordemExibicao: 1 });
      comp.save();
      result.fixture.detectChanges();

      expect(comp.erroConflito()).toBe(true);
    });
  });

  // ----------------------------------------------------------
  // 5. Exclusão
  // ----------------------------------------------------------

  describe('exclusão', () => {
    it('deve chamar deleteHabilidade ao confirmar exclusão', async () => {
      const { fixture, configApiMock, confirmationService } = await renderHabilidades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      vi.spyOn(confirmationService, 'confirm').mockImplementation(({ accept }: { accept?: () => void }) => {
        accept?.();
      });

      comp.confirmDelete(1);

      expect(configApiMock.deleteHabilidade).toHaveBeenCalledWith(10, 1);
    });
  });

  // ----------------------------------------------------------
  // 6. truncar helper
  // ----------------------------------------------------------

  describe('truncar', () => {
    it('deve retornar texto original quando menor que o limite', async () => {
      const { fixture } = await renderHabilidades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      expect(comp.truncar('Texto curto', 60)).toBe('Texto curto');
    });

    it('deve truncar texto longo e adicionar reticências', async () => {
      const { fixture } = await renderHabilidades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      const textoLongo = 'A'.repeat(70);
      const resultado = comp.truncar(textoLongo, 60);

      expect(resultado.length).toBe(63); // 60 + '...'
      expect(resultado.endsWith('...')).toBe(true);
    });

    it('deve retornar texto intacto quando exatamente no limite', async () => {
      const { fixture } = await renderHabilidades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      const texto60 = 'A'.repeat(60);
      expect(comp.truncar(texto60, 60)).toBe(texto60);
    });
  });
});
