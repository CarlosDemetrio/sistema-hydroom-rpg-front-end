/**
 * TiposItemConfigComponent — Spec
 *
 * Migrado para BaseConfigComponent + TipoItemConfigService.
 * NOTA JIT: Usa overrideTemplate para evitar NG0950 em modo JIT no Vitest.
 * Foco: sinais, CRUD, filtro de subcategoria por categoria.
 */
import { TestBed } from '@angular/core/testing';
import { render, screen } from '@testing-library/angular';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { ConfirmationService } from 'primeng/api';

import { TiposItemConfigComponent } from './tipos-item-config.component';
import { TipoItemConfigService } from '@core/services/business/config/tipo-item-config.service';
import { CurrentGameService } from '@core/services/current-game.service';
import { ToastService } from '@services/toast.service';
import { TipoItemConfig } from '@core/models/tipo-item-config.model';

// ============================================================
// Dados de teste
// ============================================================

const tipoArmaMock: TipoItemConfig = {
  id: 1,
  jogoId: 10,
  nome: 'Espada Longa',
  categoria: 'ARMA',
  subcategoria: 'ESPADA',
  requerDuasMaos: false,
  ordemExibicao: 1,
  descricao: null,
  dataCriacao: '2024-01-01',
  dataUltimaAtualizacao: '2024-01-01',
};

const tipoArmaduraMock: TipoItemConfig = {
  id: 2,
  jogoId: 10,
  nome: 'Armadura de Couro',
  categoria: 'ARMADURA',
  subcategoria: 'ARMADURA_LEVE',
  requerDuasMaos: false,
  ordemExibicao: 2,
  descricao: null,
  dataCriacao: '2024-01-01',
  dataUltimaAtualizacao: '2024-01-01',
};

// ============================================================
// Helpers de mock
// ============================================================

function criarTipoItemServiceMock(
  tipos: TipoItemConfig[] = [tipoArmaMock, tipoArmaduraMock],
  temJogo = true,
) {
  const jogoAtual = temJogo ? { id: 10, nome: 'Campanha Teste', ativo: true } : null;
  return {
    loadItems:      vi.fn().mockReturnValue(of(tipos)),
    createItem:     vi.fn().mockReturnValue(of(tipoArmaMock)),
    updateItem:     vi.fn().mockReturnValue(of(tipoArmaMock)),
    deleteItem:     vi.fn().mockReturnValue(of(void 0)),
    currentGameId:  () => (temJogo ? 10 : null),
    hasCurrentGame: () => temJogo,
    currentGame:    () => jogoAtual,
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

// Template stub mínimo — evita NG0950
const TEMPLATE_STUB = `
  <div id="tipos-item-config-stub">
    @if (hasGame()) {
      <span id="jogo-ativo">{{ currentGameName() }}</span>
    }
    @if (!hasGame()) {
      <p id="sem-jogo">Nenhum jogo selecionado</p>
    }
    @for (tipo of items(); track tipo.id) {
      <span class="tipo-nome">{{ tipo.nome }}</span>
      <span class="tipo-categoria">{{ tipo.categoria }}</span>
    }
    @if (dialogVisible()) {
      <div id="dialog-visible">Dialog aberto</div>
    }
    @if (editMode()) {
      <div id="edit-mode">Modo edição</div>
    }
  </div>
`;

async function renderTipos(tipos: TipoItemConfig[] = [tipoArmaMock, tipoArmaduraMock], temJogo = true) {
  const tipoItemServiceMock    = criarTipoItemServiceMock(tipos, temJogo);
  const currentGameServiceMock = criarCurrentGameServiceMock(temJogo);
  const toastServiceMock       = criarToastServiceMock();

  const result = await render(TiposItemConfigComponent, {
    configureTestBed: (tb) => {
      tb.overrideTemplate(TiposItemConfigComponent, TEMPLATE_STUB);
    },
    providers: [
      { provide: TipoItemConfigService, useValue: tipoItemServiceMock },
      { provide: CurrentGameService,    useValue: currentGameServiceMock },
      { provide: ToastService,          useValue: toastServiceMock },
      ConfirmationService,
    ],
  });

  const confirmationService = result.fixture.componentRef.injector.get(ConfirmationService);
  return { ...result, tipoItemServiceMock, toastServiceMock, confirmationService };
}

// ============================================================
// Testes
// ============================================================

describe('TiposItemConfigComponent', () => {

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  // ----------------------------------------------------------
  // 1. Carregamento de dados
  // ----------------------------------------------------------

  describe('carregamento de dados', () => {
    it('deve carregar tipos ao inicializar quando há jogo selecionado', async () => {
      const { tipoItemServiceMock } = await renderTipos();

      expect(tipoItemServiceMock.loadItems).toHaveBeenCalled();
    });

    it('deve exibir tipos carregados', async () => {
      await renderTipos();

      expect(screen.getByText('Espada Longa')).toBeTruthy();
      expect(screen.getByText('Armadura de Couro')).toBeTruthy();
    });

    it('não deve carregar quando não há jogo selecionado', async () => {
      const { tipoItemServiceMock } = await renderTipos([], false);

      expect(tipoItemServiceMock.loadItems).not.toHaveBeenCalled();
    });

    it('deve exibir aviso de sem jogo quando hasGame é false', async () => {
      await renderTipos([], false);

      expect(screen.getByText('Nenhum jogo selecionado')).toBeTruthy();
    });
  });

  // ----------------------------------------------------------
  // 2. Sinal items e estado inicial
  // ----------------------------------------------------------

  describe('sinais de estado', () => {
    it('items deve inicializar com dados carregados', async () => {
      const { fixture } = await renderTipos();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      expect(comp.items().length).toBe(2);
    });

    it('loading deve ser false após carregar', async () => {
      const { fixture } = await renderTipos();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      expect(comp.loading()).toBe(false);
    });

    it('dialogVisible deve inicializar como false', async () => {
      const { fixture } = await renderTipos();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      expect(comp.dialogVisible()).toBe(false);
    });

    it('editMode deve inicializar como false', async () => {
      const { fixture } = await renderTipos();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      expect(comp.editMode()).toBe(false);
    });
  });

  // ----------------------------------------------------------
  // 3. openDialog e editMode
  // ----------------------------------------------------------

  describe('openDialog', () => {
    it('deve abrir dialog em modo criação quando chamado sem argumento', async () => {
      const { fixture } = await renderTipos();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDialog();
      fixture.detectChanges();

      expect(comp.dialogVisible()).toBe(true);
      expect(comp.editMode()).toBe(false);
    });

    it('deve abrir dialog em modo edição com os dados do tipo', async () => {
      const { fixture } = await renderTipos();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDialog(tipoArmaMock);
      fixture.detectChanges();

      expect(comp.dialogVisible()).toBe(true);
      expect(comp.editMode()).toBe(true);
      expect(comp.currentEditId()).toBe(1);
      expect(comp.form.get('nome')?.value).toBe('Espada Longa');
      expect(comp.form.get('categoria')?.value).toBe('ARMA');
    });

    it('deve fechar dialog ao chamar closeDialog', async () => {
      const { fixture } = await renderTipos();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDialog();
      comp.closeDialog();
      fixture.detectChanges();

      expect(comp.dialogVisible()).toBe(false);
    });
  });

  // ----------------------------------------------------------
  // 4. save — criação e edição
  // ----------------------------------------------------------

  describe('save', () => {
    it('deve chamar service.createItem ao salvar novo tipo', async () => {
      const { fixture, tipoItemServiceMock } = await renderTipos();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDialog();
      comp.form.patchValue({
        nome: 'Espada Curta',
        categoria: 'ARMA',
        requerDuasMaos: false,
        ordemExibicao: 3,
      });
      comp.save();

      expect(tipoItemServiceMock.createItem).toHaveBeenCalledWith(
        expect.objectContaining({ nome: 'Espada Curta', categoria: 'ARMA', jogoId: 10 })
      );
    });

    it('deve chamar service.updateItem ao salvar tipo existente', async () => {
      const { fixture, tipoItemServiceMock } = await renderTipos();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDialog(tipoArmaMock);
      comp.form.patchValue({ nome: 'Espada Bastarda' });
      comp.save();

      expect(tipoItemServiceMock.updateItem).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ nome: 'Espada Bastarda' })
      );
    });

    it('deve exibir warning quando formulário inválido', async () => {
      const { fixture, toastServiceMock } = await renderTipos();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDialog();
      comp.form.patchValue({ nome: '' });
      comp.save();

      expect(toastServiceMock.warning).toHaveBeenCalled();
    });
  });

  // ----------------------------------------------------------
  // 5. Subcategorias filtradas por categoria
  // ----------------------------------------------------------

  describe('subcategoriaOptions', () => {
    it('deve retornar lista vazia quando categoria não selecionada', async () => {
      const { fixture } = await renderTipos();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDialog();
      // categoria=null → subcategoriaOptions deve ser vazio
      expect(comp.subcategoriaOptions().length).toBe(0);
    });

    it('deve retornar subcategorias de ARMA quando categoria=ARMA', async () => {
      const { fixture } = await renderTipos();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDialog();
      comp.form.patchValue({ categoria: 'ARMA' });
      fixture.detectChanges();

      const opts = comp.subcategoriaOptions();
      expect(opts.length).toBeGreaterThan(0);
      expect(opts.some((o: { value: string }) => o.value === 'ESPADA')).toBe(true);
    });

    it('deve limpar subcategoria ao mudar categoria', async () => {
      const { fixture } = await renderTipos();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDialog(tipoArmaMock); // subcategoria = ESPADA
      expect(comp.form.get('subcategoria')?.value).toBe('ESPADA');

      comp.form.patchValue({ categoria: 'ARMADURA' });
      comp.onCategoriaChange();
      fixture.detectChanges();

      expect(comp.form.get('subcategoria')?.value).toBeNull();
    });
  });

  // ----------------------------------------------------------
  // 6. Exclusão
  // ----------------------------------------------------------

  describe('exclusão', () => {
    it('deve chamar service.deleteItem ao confirmar exclusão', async () => {
      const { fixture, tipoItemServiceMock, confirmationService } = await renderTipos();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      vi.spyOn(confirmationService, 'confirm').mockImplementation(({ accept }: { accept?: () => void }) => {
        accept?.();
      });

      comp.confirmDelete(1);

      expect(tipoItemServiceMock.deleteItem).toHaveBeenCalledWith(1);
    });
  });

  // ----------------------------------------------------------
  // 7. Helpers de label
  // ----------------------------------------------------------

  describe('helpers de label', () => {
    it('getCategoriaLabel deve retornar label traduzido', async () => {
      const { fixture } = await renderTipos();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      expect(comp.getCategoriaLabel('ARMA')).toBe('Arma');
      expect(comp.getCategoriaLabel('ARMADURA')).toBe('Armadura');
      expect(comp.getCategoriaLabel('CONSUMIVEL')).toBe('Consumível');
    });

    it('contarPorCategoria deve retornar contagem correta', async () => {
      const { fixture } = await renderTipos();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      expect(comp.contarPorCategoria('ARMA')).toBe(1);
      expect(comp.contarPorCategoria('ARMADURA')).toBe(1);
      expect(comp.contarPorCategoria('CONSUMIVEL')).toBe(0);
    });
  });

  // ----------------------------------------------------------
  // 8. filteredItems (busca)
  // ----------------------------------------------------------

  describe('filteredItems', () => {
    it('deve retornar todos os itens quando searchQuery está vazio', async () => {
      const { fixture } = await renderTipos();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.searchQuery.set('');
      fixture.detectChanges();

      expect(comp.filteredItems().length).toBe(2);
    });

    it('deve filtrar itens pelo nome', async () => {
      const { fixture } = await renderTipos();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.searchQuery.set('espada');
      fixture.detectChanges();

      expect(comp.filteredItems().length).toBe(1);
      expect(comp.filteredItems()[0].nome).toBe('Espada Longa');
    });

    it('deve filtrar por categoria (texto traduzido)', async () => {
      const { fixture } = await renderTipos();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.searchQuery.set('arma');
      fixture.detectChanges();

      // Tanto 'Espada Longa' (Arma) quanto 'Armadura de Couro' (Armadura) contêm 'arma'
      expect(comp.filteredItems().length).toBeGreaterThanOrEqual(1);
    });
  });
});
