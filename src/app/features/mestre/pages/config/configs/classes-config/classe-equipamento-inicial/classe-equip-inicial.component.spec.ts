/**
 * ClasseEquipInicialComponent — Spec
 *
 * NOTA JIT: Usa overrideTemplate + ɵSIGNAL para input.required() em modo JIT.
 * Foco: separação em obrigatórios/grupos, adicionar/remover equipamento.
 */
import { TestBed } from '@angular/core/testing';
import { render, screen } from '@testing-library/angular';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { ɵSIGNAL as SIGNAL_SYM } from '@angular/core';
import { ConfirmationService } from 'primeng/api';

import { ClasseEquipInicialComponent } from './classe-equip-inicial.component';
import { ConfigApiService } from '@core/services/api/config-api.service';
import { ToastService } from '@services/toast.service';
import { ClasseEquipamentoInicial } from '@core/models/classe-equipamento-inicial.model';
import { ItemConfigResumo, PageResponse } from '@core/models/item-config.model';

// ============================================================
// Helpers para input.required() em JIT
// ============================================================

function setSignalInput<T>(component: unknown, inputName: string, value: T): void {
  const signalFn = (component as Record<string, unknown>)[inputName];
  if (signalFn && (signalFn as Record<symbol, unknown>)[SIGNAL_SYM as symbol]) {
    const node = (signalFn as Record<symbol, unknown>)[SIGNAL_SYM as symbol] as {
      applyValueToInputSignal: (node: unknown, v: T) => void;
    };
    node.applyValueToInputSignal(node, value);
  }
}

// ============================================================
// Dados de teste
// ============================================================

const equipObrigatorioMock: ClasseEquipamentoInicial = {
  id: 1, classeId: 10, classeNome: 'Guerreiro',
  itemConfigId: 1, itemConfigNome: 'Espada Longa',
  itemRaridade: 'Comum', itemRaridadeCor: '#9d9d9d',
  itemCategoria: 'ARMA',
  obrigatorio: true, grupoEscolha: null,
  quantidade: 1, dataCriacao: '2024-01-01',
};

const equipGrupo1Mock: ClasseEquipamentoInicial = {
  id: 2, classeId: 10, classeNome: 'Guerreiro',
  itemConfigId: 2, itemConfigNome: 'Machado de Batalha',
  itemRaridade: 'Comum', itemRaridadeCor: '#9d9d9d',
  itemCategoria: 'ARMA',
  obrigatorio: false, grupoEscolha: 1,
  quantidade: 1, dataCriacao: '2024-01-01',
};

const equipGrupo1Mock2: ClasseEquipamentoInicial = {
  id: 3, classeId: 10, classeNome: 'Guerreiro',
  itemConfigId: 3, itemConfigNome: 'Martelo de Guerra',
  itemRaridade: 'Incomum', itemRaridadeCor: '#1eff00',
  itemCategoria: 'ARMA',
  obrigatorio: false, grupoEscolha: 1,
  quantidade: 1, dataCriacao: '2024-01-01',
};

const itemResumoMock: ItemConfigResumo = {
  id: 1, jogoId: 5, nome: 'Espada Longa',
  raridadeId: 1, raridadeNome: 'Comum', raridadeCor: '#9d9d9d',
  tipoId: 1, tipoNome: 'Espada', categoria: 'ARMA',
  peso: 1.5, valor: 50, nivelMinimo: 1,
  propriedades: null, ordemExibicao: 1,
};

const pageItens: PageResponse<ItemConfigResumo> = {
  content: [itemResumoMock],
  totalElements: 1, totalPages: 1, size: 200, number: 0,
};

// ============================================================
// Helpers de mock
// ============================================================

function criarConfigApiMock(equipamentos: ClasseEquipamentoInicial[] = [equipObrigatorioMock, equipGrupo1Mock]) {
  return {
    listClasseEquipamentosIniciais: vi.fn().mockReturnValue(of(equipamentos)),
    addClasseEquipamentoInicial:    vi.fn().mockReturnValue(of(equipObrigatorioMock)),
    removeClasseEquipamentoInicial: vi.fn().mockReturnValue(of(void 0)),
    listItens:                      vi.fn().mockReturnValue(of(pageItens)),
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

// Template stub mínimo — evita NG0950 de input.required() em JIT
const TEMPLATE_STUB = `
  <div id="equip-inicial-stub">
    @if (loading()) {
      <span id="loading">Carregando...</span>
    }
    @for (e of obrigatorios(); track e.id) {
      <span class="obrigatorio-nome">{{ e.itemConfigNome }}</span>
    }
    @for (g of grupos(); track g.numero) {
      <span class="grupo-numero">Grupo {{ g.numero }}</span>
      @for (e of g.itens; track e.id) {
        <span class="grupo-item">{{ e.itemConfigNome }}</span>
      }
    }
    @if (addDialogVisible()) {
      <div id="dialog-add">Dialog aberto</div>
    }
  </div>
`;

async function renderEquipInicial(
  equipamentos: ClasseEquipamentoInicial[] = [equipObrigatorioMock, equipGrupo1Mock],
  classeId = 10,
) {
  const configApiMock  = criarConfigApiMock(equipamentos);
  const toastMock      = criarToastServiceMock();

  const result = await render(ClasseEquipInicialComponent, {
    configureTestBed: (tb) => {
      tb.overrideTemplate(ClasseEquipInicialComponent, TEMPLATE_STUB);
    },
    providers: [
      { provide: ConfigApiService, useValue: configApiMock },
      { provide: ToastService,     useValue: toastMock },
      ConfirmationService,
    ],
    detectChangesOnRender: false,
  });

  setSignalInput(result.fixture.componentInstance, 'classeId', classeId);
  result.fixture.detectChanges();
  await result.fixture.whenStable();

  const confirmationService = result.fixture.componentRef.injector.get(ConfirmationService);
  return { ...result, configApiMock, toastMock, confirmationService };
}

// ============================================================
// Testes
// ============================================================

describe('ClasseEquipInicialComponent', () => {

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  // ----------------------------------------------------------
  // 1. Carregamento
  // ----------------------------------------------------------

  describe('carregamento', () => {
    it('deve chamar listClasseEquipamentosIniciais com o classeId correto', async () => {
      const { configApiMock } = await renderEquipInicial();

      expect(configApiMock.listClasseEquipamentosIniciais).toHaveBeenCalledWith(10);
    });

    it('deve exibir o item obrigatório carregado', async () => {
      await renderEquipInicial();

      expect(screen.getByText('Espada Longa')).toBeTruthy();
    });

    it('deve exibir o item do grupo', async () => {
      await renderEquipInicial();

      expect(screen.getByText('Machado de Batalha')).toBeTruthy();
    });
  });

  // ----------------------------------------------------------
  // 2. Separação obrigatórios / grupos (computed)
  // ----------------------------------------------------------

  describe('obrigatorios e grupos', () => {
    it('obrigatorios deve conter apenas itens com obrigatorio=true', async () => {
      const { fixture } = await renderEquipInicial();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      expect(comp.obrigatorios().length).toBe(1);
      expect(comp.obrigatorios()[0].itemConfigNome).toBe('Espada Longa');
    });

    it('grupos deve agrupar itens por grupoEscolha', async () => {
      const { fixture } = await renderEquipInicial(
        [equipObrigatorioMock, equipGrupo1Mock, equipGrupo1Mock2]
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      expect(comp.grupos().length).toBe(1);
      expect(comp.grupos()[0].numero).toBe(1);
      expect(comp.grupos()[0].itens.length).toBe(2);
    });

    it('deve ter grupos vazios quando não há itens de grupo', async () => {
      const { fixture } = await renderEquipInicial([equipObrigatorioMock]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      expect(comp.grupos().length).toBe(0);
    });

    it('novoNumeroGrupo deve ser 1 quando não há grupos', async () => {
      const { fixture } = await renderEquipInicial([equipObrigatorioMock]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      expect(comp.novoNumeroGrupo()).toBe(1);
    });

    it('novoNumeroGrupo deve ser max+1 quando há grupos', async () => {
      const { fixture } = await renderEquipInicial([equipGrupo1Mock]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      expect(comp.novoNumeroGrupo()).toBe(2);
    });
  });

  // ----------------------------------------------------------
  // 3. openAddDialog
  // ----------------------------------------------------------

  describe('openAddDialog', () => {
    it('deve abrir dialog para item obrigatório', async () => {
      const { fixture } = await renderEquipInicial();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openAddDialog(true);
      fixture.detectChanges();

      expect(comp.addDialogVisible()).toBe(true);
      expect(comp.novoObrigatorio()).toBe(true);
    });

    it('deve abrir dialog com grupo pré-definido', async () => {
      const { fixture } = await renderEquipInicial();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openAddDialog(false, 2);
      fixture.detectChanges();

      expect(comp.addDialogVisible()).toBe(true);
      expect(comp.novoObrigatorio()).toBe(false);
      expect(comp.novoGrupoEscolha()).toBe(2);
    });

    it('deve fechar dialog ao chamar closeAddDialog', async () => {
      const { fixture } = await renderEquipInicial();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openAddDialog(true);
      comp.closeAddDialog();
      fixture.detectChanges();

      expect(comp.addDialogVisible()).toBe(false);
    });
  });

  // ----------------------------------------------------------
  // 4. podeAdicionar
  // ----------------------------------------------------------

  describe('podeAdicionar', () => {
    it('deve ser false quando itemId não selecionado', async () => {
      const { fixture } = await renderEquipInicial();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      expect(comp.podeAdicionar()).toBe(false);
    });

    it('deve ser true quando obrigatório com item e quantidade', async () => {
      const { fixture } = await renderEquipInicial();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.novoItemId.set(1);
      comp.novaQuantidade.set(2);
      comp.novoObrigatorio.set(true);
      fixture.detectChanges();

      expect(comp.podeAdicionar()).toBe(true);
    });

    it('deve ser false quando grupo sem número de grupo', async () => {
      const { fixture } = await renderEquipInicial();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.novoItemId.set(1);
      comp.novaQuantidade.set(1);
      comp.novoObrigatorio.set(false);
      comp.novoGrupoEscolha.set(null);
      fixture.detectChanges();

      expect(comp.podeAdicionar()).toBe(false);
    });
  });

  // ----------------------------------------------------------
  // 5. adicionarEquipamento
  // ----------------------------------------------------------

  describe('adicionarEquipamento', () => {
    it('deve chamar addClasseEquipamentoInicial com dados corretos', async () => {
      const { fixture, configApiMock } = await renderEquipInicial();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.novoItemId.set(1);
      comp.novaQuantidade.set(2);
      comp.novoObrigatorio.set(true);
      comp.adicionarEquipamento();

      expect(configApiMock.addClasseEquipamentoInicial).toHaveBeenCalledWith(
        10,
        expect.objectContaining({
          itemConfigId: 1,
          quantidade: 2,
          obrigatorio: true,
          grupoEscolha: null,
        })
      );
    });

    it('deve passar o grupoEscolha correto quando não obrigatório', async () => {
      const { fixture, configApiMock } = await renderEquipInicial();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.novoItemId.set(1);
      comp.novaQuantidade.set(1);
      comp.novoObrigatorio.set(false);
      comp.novoGrupoEscolha.set(3);
      comp.adicionarEquipamento();

      expect(configApiMock.addClasseEquipamentoInicial).toHaveBeenCalledWith(
        10,
        expect.objectContaining({
          obrigatorio: false,
          grupoEscolha: 3,
        })
      );
    });
  });

  // ----------------------------------------------------------
  // 6. confirmRemove
  // ----------------------------------------------------------

  describe('confirmRemove', () => {
    it('deve chamar removeClasseEquipamentoInicial ao confirmar remoção', async () => {
      const { fixture, configApiMock, confirmationService } = await renderEquipInicial();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      vi.spyOn(confirmationService, 'confirm').mockImplementation(({ accept }: { accept?: () => void }) => {
        accept?.();
      });

      comp.confirmRemove(equipObrigatorioMock);

      expect(configApiMock.removeClasseEquipamentoInicial).toHaveBeenCalledWith(10, 1);
    });
  });

  // ----------------------------------------------------------
  // 7. carregarItensParaJogo (método público)
  // ----------------------------------------------------------

  describe('carregarItensParaJogo', () => {
    it('deve carregar catálogo de itens quando chamado com jogoId', async () => {
      const { fixture, configApiMock } = await renderEquipInicial();
      const comp = fixture.componentInstance;

      comp.carregarItensParaJogo(5);

      expect(configApiMock.listItens).toHaveBeenCalledWith(5, 0, 200);
    });

    it('deve preencher itensCatalogo após carregamento', async () => {
      const { fixture } = await renderEquipInicial();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.carregarItensParaJogo(5);
      await fixture.whenStable();
      fixture.detectChanges();

      expect(comp.itensCatalogo().length).toBe(1);
      expect(comp.itensCatalogo()[0].nome).toBe('Espada Longa');
    });
  });
});
