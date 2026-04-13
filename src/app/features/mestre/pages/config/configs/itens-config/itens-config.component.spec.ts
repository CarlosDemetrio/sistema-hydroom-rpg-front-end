/**
 * ItensConfigComponent — Spec
 *
 * NOTA JIT: Usa overrideTemplate para evitar NG0950 em modo JIT no Vitest.
 * Foco: carregamento de dados, filtros, CRUD básico, efeitos e requisitos.
 */
import { TestBed } from '@angular/core/testing';
import { render, screen } from '@testing-library/angular';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { ConfirmationService } from 'primeng/api';

import { ItensConfigComponent } from './itens-config.component';
import { ConfigApiService } from '@core/services/api/config-api.service';
import { CurrentGameService } from '@core/services/current-game.service';
import { ToastService } from '@services/toast.service';
import { ItemConfigResumo, ItemConfigResponse, ItemEfeitoResponse, ItemRequisitoResponse, PageResponse } from '@core/models/item-config.model';
import { RaridadeItemConfig } from '@core/models/raridade-item-config.model';
import { TipoItemConfig } from '@core/models/tipo-item-config.model';

// ============================================================
// Dados de teste
// ============================================================

const raridadeMock: RaridadeItemConfig = {
  id: 1, jogoId: 10, nome: 'Comum', cor: '#9d9d9d',
  ordemExibicao: 1, podeJogadorAdicionar: true,
  bonusAtributoMin: null, bonusAtributoMax: null,
  bonusDerivadoMin: null, bonusDerivadoMax: null,
  descricao: null, dataCriacao: '2024-01-01', dataUltimaAtualizacao: '2024-01-01',
};

const tipoMock: TipoItemConfig = {
  id: 1, jogoId: 10, nome: 'Espada', categoria: 'ARMA',
  subcategoria: 'ESPADA', requerDuasMaos: false, ordemExibicao: 1,
  descricao: null, dataCriacao: '2024-01-01', dataUltimaAtualizacao: '2024-01-01',
};

const itemResumoMock: ItemConfigResumo = {
  id: 1, jogoId: 10, nome: 'Espada Longa',
  raridadeId: 1, raridadeNome: 'Comum', raridadeCor: '#9d9d9d',
  tipoId: 1, tipoNome: 'Espada', categoria: 'ARMA',
  peso: 1.5, valor: 50, nivelMinimo: 1,
  propriedades: 'versátil', ordemExibicao: 1,
};

const itemResumoMock2: ItemConfigResumo = {
  id: 2, jogoId: 10, nome: 'Poção de Cura',
  raridadeId: 1, raridadeNome: 'Comum', raridadeCor: '#9d9d9d',
  tipoId: 2, tipoNome: 'Poção', categoria: 'CONSUMIVEL',
  peso: 0.1, valor: 25, nivelMinimo: 1,
  propriedades: null, ordemExibicao: 2,
};

const efeitoMock: ItemEfeitoResponse = {
  id: 1, tipoEfeito: 'BONUS_ATRIBUTO',
  atributoAlvoId: 1, aptidaoAlvoId: null, bonusAlvoId: null,
  valorFixo: 2, formula: null, descricaoEfeito: '+2 de Força',
};

const requisitoMock: ItemRequisitoResponse = {
  id: 1, tipo: 'NIVEL', alvo: null, valorMinimo: 5,
};

const itemFullMock: ItemConfigResponse = {
  id: 1, jogoId: 10, nome: 'Espada Longa',
  raridadeId: 1, raridadeNome: 'Comum', raridadeCor: '#9d9d9d',
  tipoId: 1, tipoNome: 'Espada', categoria: 'ARMA',
  peso: 1.5, valor: 50, duracaoPadrao: null, nivelMinimo: 1,
  propriedades: 'versátil', descricao: 'Uma espada de ferro',
  ordemExibicao: 1,
  efeitos: [efeitoMock],
  requisitos: [requisitoMock],
  dataCriacao: '2024-01-01', dataUltimaAtualizacao: '2024-01-01',
};

const pageMock: PageResponse<ItemConfigResumo> = {
  content: [itemResumoMock, itemResumoMock2],
  totalElements: 2,
  totalPages: 1,
  size: 10,
  number: 0,
};

// ============================================================
// Helpers de mock
// ============================================================

function criarConfigApiMock() {
  return {
    listItens:          vi.fn().mockReturnValue(of(pageMock)),
    getItem:            vi.fn().mockReturnValue(of(itemFullMock)),
    createItem:         vi.fn().mockReturnValue(of(itemFullMock)),
    updateItem:         vi.fn().mockReturnValue(of(itemFullMock)),
    deleteItem:         vi.fn().mockReturnValue(of(void 0)),
    listRaridadesItem:  vi.fn().mockReturnValue(of([raridadeMock])),
    listTiposItem:      vi.fn().mockReturnValue(of([tipoMock])),
    listAtributos:      vi.fn().mockReturnValue(of([])),
    listAptidoes:       vi.fn().mockReturnValue(of([])),
    listBonus:          vi.fn().mockReturnValue(of([])),
    addItemEfeito:      vi.fn().mockReturnValue(of(efeitoMock)),
    removeItemEfeito:   vi.fn().mockReturnValue(of(void 0)),
    addItemRequisito:   vi.fn().mockReturnValue(of(requisitoMock)),
    removeItemRequisito: vi.fn().mockReturnValue(of(void 0)),
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

const TEMPLATE_STUB = `
  <div id="itens-config-stub">
    @if (hasGame()) {
      <span id="jogo-ativo">{{ currentGameName() }}</span>
    }
    @if (!hasGame()) {
      <p id="sem-jogo">Nenhum jogo selecionado</p>
    }
    @for (item of itensFiltrados(); track item.id) {
      <span class="item-nome">{{ item.nome }}</span>
      <span class="item-categoria">{{ item.categoria }}</span>
    }
    @if (dialogVisible()) {
      <div id="dialog-visible">Dialog aberto</div>
    }
    @if (editMode()) {
      <div id="edit-mode">Modo edição</div>
    }
    @for (e of efeitos(); track e.id) {
      <span class="efeito-tipo">{{ e.tipoEfeito }}</span>
    }
    @for (r of requisitos(); track r.id) {
      <span class="requisito-tipo">{{ r.tipo }}</span>
    }
    @if (filtroAtivo()) {
      <span id="filtro-ativo">Filtro ativo</span>
    }
  </div>
`;

async function renderItens(temJogo = true) {
  const configApiMock          = criarConfigApiMock();
  const currentGameServiceMock = criarCurrentGameServiceMock(temJogo);
  const toastServiceMock       = criarToastServiceMock();

  const result = await render(ItensConfigComponent, {
    configureTestBed: (tb) => {
      tb.overrideTemplate(ItensConfigComponent, TEMPLATE_STUB);
    },
    providers: [
      { provide: ConfigApiService,  useValue: configApiMock },
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

describe('ItensConfigComponent', () => {

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  // ----------------------------------------------------------
  // 1. Carregamento de dados
  // ----------------------------------------------------------

  describe('carregamento de dados', () => {
    it('deve carregar itens ao inicializar quando há jogo selecionado', async () => {
      const { configApiMock } = await renderItens();

      expect(configApiMock.listItens).toHaveBeenCalledWith(10, 0, 200);
    });

    it('deve carregar dados de apoio ao inicializar', async () => {
      const { configApiMock } = await renderItens();

      expect(configApiMock.listRaridadesItem).toHaveBeenCalledWith(10);
      expect(configApiMock.listTiposItem).toHaveBeenCalledWith(10);
      expect(configApiMock.listAtributos).toHaveBeenCalledWith(10);
      expect(configApiMock.listAptidoes).toHaveBeenCalledWith(10);
      expect(configApiMock.listBonus).toHaveBeenCalledWith(10);
    });

    it('deve exibir itens carregados', async () => {
      await renderItens();

      expect(screen.getByText('Espada Longa')).toBeTruthy();
      expect(screen.getByText('Poção de Cura')).toBeTruthy();
    });

    it('não deve carregar quando não há jogo selecionado', async () => {
      const { configApiMock } = await renderItens(false);

      expect(configApiMock.listItens).not.toHaveBeenCalled();
    });

    it('deve exibir aviso de sem jogo', async () => {
      await renderItens(false);

      expect(screen.getByText('Nenhum jogo selecionado')).toBeTruthy();
    });
  });

  // ----------------------------------------------------------
  // 2. Sinais de estado
  // ----------------------------------------------------------

  describe('sinais de estado', () => {
    it('itens deve ter 2 itens após carregamento', async () => {
      const { fixture } = await renderItens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      expect(comp.itens().length).toBe(2);
    });

    it('loading deve ser false após carregar', async () => {
      const { fixture } = await renderItens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      expect(comp.loading()).toBe(false);
    });

    it('dialogVisible deve inicializar como false', async () => {
      const { fixture } = await renderItens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      expect(comp.dialogVisible()).toBe(false);
    });

    it('raridades deve ser carregado', async () => {
      const { fixture } = await renderItens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      expect(comp.raridades().length).toBe(1);
    });
  });

  // ----------------------------------------------------------
  // 3. openDialog
  // ----------------------------------------------------------

  describe('openDialog', () => {
    it('deve abrir dialog em modo criação', async () => {
      const { fixture } = await renderItens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDialog();
      fixture.detectChanges();

      expect(comp.dialogVisible()).toBe(true);
      expect(comp.editMode()).toBe(false);
    });

    it('deve resetar efeitos e requisitos ao abrir novo dialog', async () => {
      const { fixture } = await renderItens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDialog();
      fixture.detectChanges();

      expect(comp.efeitos().length).toBe(0);
      expect(comp.requisitos().length).toBe(0);
    });

    it('deve fechar dialog ao chamar closeDialog', async () => {
      const { fixture } = await renderItens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDialog();
      comp.closeDialog();
      fixture.detectChanges();

      expect(comp.dialogVisible()).toBe(false);
    });
  });

  // ----------------------------------------------------------
  // 4. editItem — carrega item completo
  // ----------------------------------------------------------

  describe('editItem', () => {
    it('deve carregar item completo e abrir dialog em modo edição', async () => {
      const { fixture, configApiMock } = await renderItens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.editItem(itemResumoMock);
      await fixture.whenStable();
      fixture.detectChanges();

      expect(configApiMock.getItem).toHaveBeenCalledWith(1);
      expect(comp.editMode()).toBe(true);
      expect(comp.currentEditId()).toBe(1);
      expect(comp.efeitos().length).toBe(1);
      expect(comp.requisitos().length).toBe(1);
    });

    it('deve preencher formulário com dados do item', async () => {
      const { fixture } = await renderItens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.editItem(itemResumoMock);
      await fixture.whenStable();
      fixture.detectChanges();

      expect(comp.form.get('nome')?.value).toBe('Espada Longa');
      expect(comp.form.get('raridadeId')?.value).toBe(1);
      expect(comp.form.get('peso')?.value).toBe(1.5);
    });
  });

  // ----------------------------------------------------------
  // 5. save
  // ----------------------------------------------------------

  describe('save', () => {
    it('deve chamar createItem ao salvar novo item', async () => {
      const { fixture, configApiMock } = await renderItens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDialog();
      comp.form.patchValue({
        nome: 'Adaga', raridadeId: 1, tipoId: 1,
        peso: 0.5, nivelMinimo: 1, ordemExibicao: 1,
      });
      comp.save();

      expect(configApiMock.createItem).toHaveBeenCalledWith(
        expect.objectContaining({ nome: 'Adaga', jogoId: 10 })
      );
    });

    it('deve chamar updateItem ao salvar item existente', async () => {
      const { fixture, configApiMock } = await renderItens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.editItem(itemResumoMock);
      await fixture.whenStable();
      comp.form.patchValue({ nome: 'Espada Bastarda' });
      comp.save();

      expect(configApiMock.updateItem).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ nome: 'Espada Bastarda' })
      );
    });

    it('deve exibir warning ao salvar formulário inválido', async () => {
      const { fixture, toastServiceMock } = await renderItens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDialog();
      comp.form.patchValue({ nome: '' });
      comp.save();

      expect(toastServiceMock.warning).toHaveBeenCalled();
    });
  });

  // ----------------------------------------------------------
  // 6. Filtros
  // ----------------------------------------------------------

  describe('filtros', () => {
    it('itensFiltrados deve retornar todos os itens sem filtros', async () => {
      const { fixture } = await renderItens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      expect(comp.itensFiltrados().length).toBe(2);
    });

    it('deve filtrar por nome', async () => {
      const { fixture } = await renderItens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.filtroBusca = 'espada';
      comp.aplicarFiltros();
      fixture.detectChanges();

      expect(comp.itensFiltrados().length).toBe(1);
      expect(comp.itensFiltrados()[0].nome).toBe('Espada Longa');
    });

    it('deve filtrar por raridade', async () => {
      const { fixture } = await renderItens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.filtroRaridadeId = 1;
      comp.aplicarFiltros();
      fixture.detectChanges();

      expect(comp.itensFiltrados().length).toBe(2); // ambos são raridade 1
    });

    it('deve filtrar por categoria', async () => {
      const { fixture } = await renderItens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.filtroCategoria = 'ARMA';
      comp.aplicarFiltros();
      fixture.detectChanges();

      expect(comp.itensFiltrados().length).toBe(1);
      expect(comp.itensFiltrados()[0].nome).toBe('Espada Longa');
    });

    it('filtroAtivo deve ser true quando há filtro aplicado', async () => {
      const { fixture } = await renderItens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.filtroBusca = 'teste';
      comp.aplicarFiltros();
      fixture.detectChanges();

      expect(comp.filtroAtivo()).toBe(true);
    });

    it('limparFiltros deve resetar todos os filtros', async () => {
      const { fixture } = await renderItens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.filtroBusca = 'teste';
      comp.aplicarFiltros();
      comp.limparFiltros();
      fixture.detectChanges();

      expect(comp.filtroAtivo()).toBe(false);
      expect(comp.itensFiltrados().length).toBe(2);
    });
  });

  // ----------------------------------------------------------
  // 7. Efeitos
  // ----------------------------------------------------------

  describe('efeitos', () => {
    it('deve chamar addItemEfeito ao adicionar efeito', async () => {
      const { fixture, configApiMock } = await renderItens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.editItem(itemResumoMock);
      await fixture.whenStable();

      comp.novoEfeitoTipo.set('BONUS_ATRIBUTO');
      comp.novoEfeitoAtributoId.set(1);
      comp.novoEfeitoValorFixo.set(2);
      comp.adicionarEfeito();

      expect(configApiMock.addItemEfeito).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ tipoEfeito: 'BONUS_ATRIBUTO', atributoAlvoId: 1, valorFixo: 2 })
      );
    });

    it('podeAdicionarEfeito deve ser false sem tipo selecionado', async () => {
      const { fixture } = await renderItens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      expect(comp.podeAdicionarEfeito()).toBe(false);
    });

    it('podeAdicionarEfeito deve ser false para BONUS_ATRIBUTO sem atributo', async () => {
      const { fixture } = await renderItens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.novoEfeitoTipo.set('BONUS_ATRIBUTO');
      comp.novoEfeitoValorFixo.set(2);
      fixture.detectChanges();

      expect(comp.podeAdicionarEfeito()).toBe(false);
    });

    it('deve chamar removeItemEfeito ao remover efeito', async () => {
      const { fixture, configApiMock } = await renderItens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.editItem(itemResumoMock);
      await fixture.whenStable();
      comp.confirmRemoveEfeito(1);

      expect(configApiMock.removeItemEfeito).toHaveBeenCalledWith(1, 1);
    });
  });

  // ----------------------------------------------------------
  // 8. Requisitos
  // ----------------------------------------------------------

  describe('requisitos', () => {
    it('deve chamar addItemRequisito ao adicionar requisito', async () => {
      const { fixture, configApiMock } = await renderItens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.editItem(itemResumoMock);
      await fixture.whenStable();

      comp.novoRequisitoTipo.set('NIVEL');
      comp.novoRequisitoValorMinimo.set(5);
      comp.adicionarRequisito();

      expect(configApiMock.addItemRequisito).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ tipo: 'NIVEL', valorMinimo: 5 })
      );
    });

    it('deve chamar removeItemRequisito ao remover requisito', async () => {
      const { fixture, configApiMock } = await renderItens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.editItem(itemResumoMock);
      await fixture.whenStable();
      comp.confirmRemoveRequisito(1);

      expect(configApiMock.removeItemRequisito).toHaveBeenCalledWith(1, 1);
    });
  });

  // ----------------------------------------------------------
  // 9. Exclusão
  // ----------------------------------------------------------

  describe('exclusão', () => {
    it('deve chamar deleteItem ao confirmar exclusão', async () => {
      const { fixture, configApiMock, confirmationService } = await renderItens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      vi.spyOn(confirmationService, 'confirm').mockImplementation(({ accept }: { accept?: () => void }) => {
        accept?.();
      });

      comp.confirmDelete(1);

      expect(configApiMock.deleteItem).toHaveBeenCalledWith(1);
    });
  });

  // ----------------------------------------------------------
  // 10. Helpers de display
  // ----------------------------------------------------------

  describe('helpers', () => {
    it('getCategoriaLabel deve retornar label correto', async () => {
      const { fixture } = await renderItens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      expect(comp.getCategoriaLabel('ARMA')).toBe('Arma');
      expect(comp.getCategoriaLabel('CONSUMIVEL')).toBe('Consumível');
    });

    it('getTipoEfeitoLabel deve retornar label correto', async () => {
      const { fixture } = await renderItens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      expect(comp.getTipoEfeitoLabel('BONUS_ATRIBUTO')).toBe('Bônus em Atributo');
      expect(comp.getTipoEfeitoLabel('BONUS_VIDA')).toBe('Bônus de Vida');
    });

    it('descreverEfeito deve formatar corretamente', async () => {
      const { fixture } = await renderItens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      const result = comp.descreverEfeito({ tipoEfeito: 'BONUS_ATRIBUTO', valorFixo: 2 });
      expect(result).toContain('+2');
    });
  });
});
