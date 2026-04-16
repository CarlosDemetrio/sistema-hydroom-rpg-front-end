/**
 * BonusConfigComponent — Spec
 *
 * BUG-008: PUT /api/v1/configuracoes/bonus/{id} disparado indevidamente
 * ao navegar para outra rota sem ação explícita do usuário.
 *
 * Foco: verificar que service.updateItem NÃO é chamado durante:
 * - inicialização do componente (ngOnInit)
 * - destruição do componente (ngOnDestroy)
 * - abertura do drawer sem submit
 * - fechamento do drawer sem submit
 *
 * Padrão JIT: overrideTemplate para evitar NG0950.
 */

import { TestBed } from '@angular/core/testing';
import { render, screen } from '@testing-library/angular';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { ConfirmationService } from 'primeng/api';

import { BonusConfigComponent } from './bonus-config.component';
import { BonusConfigService } from '@core/services/business/config/bonus-config.service';
import { ConfigApiService } from '@core/services/api/config-api.service';
import { CurrentGameService } from '@core/services/current-game.service';
import { ToastService } from '@services/toast.service';
import { BonusConfig } from '@core/models';

// ============================================================
// Dados de teste
// ============================================================

const bbaMock: BonusConfig = {
  id: 6,
  jogoId: 10,
  nome: 'Bônus Base de Ataque',
  sigla: 'BBA',
  formulaBase: '(FOR + AGI) / 3',
  descricao: null,
  ordemExibicao: 1,
  dataCriacao: '2024-01-01T00:00:00',
  dataUltimaAtualizacao: '2024-01-01T00:00:00',
};

const bbmMock: BonusConfig = {
  id: 7,
  jogoId: 10,
  nome: 'Bônus Base de Magia',
  sigla: 'BBM',
  formulaBase: '(INT + SAB) / 3',
  descricao: null,
  ordemExibicao: 2,
  dataCriacao: '2024-01-01T00:00:00',
  dataUltimaAtualizacao: '2024-01-01T00:00:00',
};

// ============================================================
// Helpers de mock
// ============================================================

function criarBonusServiceMock(bonus: BonusConfig[] = [bbaMock, bbmMock], temJogo = true) {
  const jogoAtual = temJogo ? { id: 10, nome: 'Campanha Teste', ativo: true } : null;
  return {
    loadItems:    vi.fn().mockReturnValue(of(bonus)),
    createItem:   vi.fn().mockReturnValue(of(bbaMock)),
    updateItem:   vi.fn().mockReturnValue(of(bbaMock)),
    deleteItem:   vi.fn().mockReturnValue(of(void 0)),
    currentGameId:  () => (temJogo ? 10 : null),
    hasCurrentGame: () => temJogo,
    currentGame:    () => jogoAtual,
  };
}

function criarConfigApiMock() {
  return {
    reordenarBonus: vi.fn().mockReturnValue(of(undefined)),
    listBonus:      vi.fn().mockReturnValue(of([bbaMock, bbmMock])),
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

// Template stub mínimo para evitar NG0950
const TEMPLATE_STUB = `
  <div id="bonus-config-stub">
    @if (hasGame()) {
      <span id="jogo-ativo">{{ currentGameName() }}</span>
    } @else {
      <span id="sem-jogo">Nenhum jogo selecionado</span>
    }
    @for (b of filteredItems(); track b.id) {
      <span class="bonus-nome">{{ b.nome }}</span>
    }
    @if (drawerVisible()) {
      <div id="drawer-aberto">Drawer</div>
    }
    @if (editMode()) {
      <div id="edit-mode">Modo edição</div>
    }
  </div>
`;

async function renderBonus(
  bonus: BonusConfig[] = [bbaMock, bbmMock],
  temJogo = true,
) {
  const bonusServiceMock       = criarBonusServiceMock(bonus, temJogo);
  const configApiMock          = criarConfigApiMock();
  const currentGameServiceMock = criarCurrentGameServiceMock(temJogo);
  const toastServiceMock       = criarToastServiceMock();

  const result = await render(BonusConfigComponent, {
    configureTestBed: (tb) => {
      tb.overrideTemplate(BonusConfigComponent, TEMPLATE_STUB);
    },
    providers: [
      { provide: BonusConfigService, useValue: bonusServiceMock },
      { provide: ConfigApiService,   useValue: configApiMock },
      { provide: CurrentGameService, useValue: currentGameServiceMock },
      { provide: ToastService,       useValue: toastServiceMock },
      ConfirmationService,
    ],
  });

  return { ...result, bonusServiceMock, configApiMock, toastServiceMock };
}

// ============================================================
// Testes
// ============================================================

describe('BonusConfigComponent', () => {

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  // ----------------------------------------------------------
  // 1. Carregamento de dados
  // ----------------------------------------------------------

  describe('carregamento de dados', () => {
    it('deve carregar bônus ao inicializar quando há jogo selecionado', async () => {
      const { bonusServiceMock } = await renderBonus();
      expect(bonusServiceMock.loadItems).toHaveBeenCalled();
    });

    it('deve exibir bônus carregados', async () => {
      await renderBonus();
      expect(screen.getByText('Bônus Base de Ataque')).toBeTruthy();
      expect(screen.getByText('Bônus Base de Magia')).toBeTruthy();
    });

    it('não deve carregar quando não há jogo selecionado', async () => {
      const { bonusServiceMock } = await renderBonus([], false);
      expect(bonusServiceMock.loadItems).not.toHaveBeenCalled();
    });
  });

  // ----------------------------------------------------------
  // 2. BUG-008 — updateItem NÃO deve ser chamado sem ação explícita
  // ----------------------------------------------------------

  describe('BUG-008 — sem auto-save indevido', () => {
    it('NÃO deve chamar service.updateItem durante ngOnInit', async () => {
      const { bonusServiceMock } = await renderBonus();
      expect(bonusServiceMock.updateItem).not.toHaveBeenCalled();
    });

    it('NÃO deve chamar service.updateItem ao abrir o drawer', async () => {
      const { fixture, bonusServiceMock } = await renderBonus();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDrawer(bbaMock);
      fixture.detectChanges();

      expect(bonusServiceMock.updateItem).not.toHaveBeenCalled();
    });

    it('NÃO deve chamar service.updateItem ao fechar o drawer sem submit', async () => {
      const { fixture, bonusServiceMock } = await renderBonus();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDrawer(bbaMock);
      fixture.detectChanges();

      // Fecha sem salvar
      comp.closeDrawer();
      fixture.detectChanges();

      expect(bonusServiceMock.updateItem).not.toHaveBeenCalled();
    });

    it('NÃO deve chamar service.updateItem quando o componente é destruído', async () => {
      const { fixture, bonusServiceMock } = await renderBonus();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      // Abre drawer e preenche form (dirty)
      comp.openDrawer(bbaMock);
      comp.form.patchValue({ nome: 'BBA modificado' });
      fixture.detectChanges();

      // Destrói o componente (simula navegação para outra rota)
      fixture.destroy();

      // NUNCA deve ter disparado updateItem automaticamente
      expect(bonusServiceMock.updateItem).not.toHaveBeenCalled();
    });

    it('NÃO deve chamar reordenarBonus durante a inicialização', async () => {
      const { configApiMock } = await renderBonus();
      expect(configApiMock.reordenarBonus).not.toHaveBeenCalled();
    });

    it('SÓ deve chamar service.updateItem após submit explícito do formulário', async () => {
      const { fixture, bonusServiceMock } = await renderBonus();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDrawer(bbaMock);
      comp.form.patchValue({
        nome: 'BBA',
        sigla: 'BBA',
        formulaBase: '(FOR + AGI) / 3',
        descricao: '',
        ordemExibicao: 1,
      });
      fixture.detectChanges();

      // Ação explícita: submit
      comp.save();
      fixture.detectChanges();

      expect(bonusServiceMock.updateItem).toHaveBeenCalledWith(
        6,
        expect.objectContaining({ nome: 'BBA' })
      );
    });
  });

  // ----------------------------------------------------------
  // 3. openDrawer e estado
  // ----------------------------------------------------------

  describe('openDrawer', () => {
    it('deve abrir o drawer em modo criação quando chamado sem argumento', async () => {
      const { fixture } = await renderBonus();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDrawer();
      fixture.detectChanges();

      expect(comp.drawerVisible()).toBe(true);
      expect(comp.editMode()).toBe(false);
    });

    it('deve abrir o drawer em modo edição com dados do bônus', async () => {
      const { fixture } = await renderBonus();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDrawer(bbaMock);
      fixture.detectChanges();

      expect(comp.drawerVisible()).toBe(true);
      expect(comp.editMode()).toBe(true);
      expect(comp.form.get('nome')?.value).toBe('Bônus Base de Ataque');
      expect(comp.form.get('sigla')?.value).toBe('BBA');
    });

    it('closeDrawer deve fechar o drawer', async () => {
      const { fixture } = await renderBonus();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDrawer(bbaMock);
      comp.closeDrawer();
      fixture.detectChanges();

      expect(comp.drawerVisible()).toBe(false);
      expect(comp.dialogVisible()).toBe(false);
    });
  });

  // ----------------------------------------------------------
  // 4. save — criação e edição
  // ----------------------------------------------------------

  describe('save', () => {
    it('deve chamar service.createItem ao criar novo bônus', async () => {
      const { fixture, bonusServiceMock } = await renderBonus();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDrawer();
      comp.form.patchValue({
        nome: 'Bloqueio',
        sigla: 'BLQ',
        formulaBase: 'VIG / 2',
        ordemExibicao: 3,
      });
      comp.save();

      expect(bonusServiceMock.createItem).toHaveBeenCalledWith(
        expect.objectContaining({ nome: 'Bloqueio', sigla: 'BLQ' })
      );
    });

    it('deve exibir warning ao salvar formulário inválido', async () => {
      const { fixture, bonusServiceMock, toastServiceMock } = await renderBonus();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDrawer();
      comp.form.patchValue({ nome: '', sigla: '' });
      comp.save();

      expect(toastServiceMock.warning).toHaveBeenCalled();
      expect(bonusServiceMock.updateItem).not.toHaveBeenCalled();
    });
  });
});
