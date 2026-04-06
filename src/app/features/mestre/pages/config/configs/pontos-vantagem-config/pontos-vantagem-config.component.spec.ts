/**
 * PontosVantagemConfigComponent — Spec
 *
 * NOTA JIT: Em JIT (Vitest sem plugin Angular), componentes filhos standalone
 * com input.required() causam NG0950. Usamos overrideTemplate para substituir
 * o template por um stub mínimo que evita renderizar BaseConfigTableComponent.
 */
import { TestBed } from '@angular/core/testing';
import { render, screen } from '@testing-library/angular';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { ConfirmationService } from 'primeng/api';

import { PontosVantagemConfigComponent } from './pontos-vantagem-config.component';
import { PontosVantagemConfigService } from '@core/services/business/config';
import { PontosVantagemConfig } from '@core/models/config.models';
import { ToastService } from '@services/toast.service';
import { CurrentGameService } from '@core/services/current-game.service';

// ============================================================
// Dados de teste
// ============================================================

const pv1Mock: PontosVantagemConfig = {
  id: 1,
  jogoId: 10,
  nivel: 1,
  pontosGanhos: 1,
  dataCriacao: '2024-01-01T00:00:00',
  dataUltimaAtualizacao: '2024-06-01T00:00:00',
};

const pv5Mock: PontosVantagemConfig = {
  id: 2,
  jogoId: 10,
  nivel: 5,
  pontosGanhos: 2,
  dataCriacao: '2024-01-01T00:00:00',
  dataUltimaAtualizacao: '2024-06-01T00:00:00',
};

const pv10Mock: PontosVantagemConfig = {
  id: 3,
  jogoId: 10,
  nivel: 10,
  pontosGanhos: 3,
  dataCriacao: '2024-01-01T00:00:00',
  dataUltimaAtualizacao: '2024-06-01T00:00:00',
};

// ============================================================
// Helpers para criar mocks
// ============================================================

function criarServiceMock(itens: PontosVantagemConfig[] = [], temJogo = true) {
  const jogoAtual = temJogo ? { id: 10, nome: 'Campanha Teste', ativo: true } : null;
  return {
    loadItems:      vi.fn().mockReturnValue(of(itens)),
    createItem:     vi.fn().mockReturnValue(of(pv1Mock)),
    updateItem:     vi.fn().mockReturnValue(of(pv1Mock)),
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

// ============================================================
// Template stub para evitar NG0950 em JIT
// ============================================================

const TEMPLATE_STUB = `
  <div id="pontos-vantagem-config-stub">
    @if (hasGame()) {
      <span id="jogo-ativo">{{ currentGameName() }}</span>
    }
    @if (!hasGame()) {
      <p id="sem-jogo">Nenhum jogo selecionado</p>
    }
  </div>
`;

async function renderComponent(
  itens: PontosVantagemConfig[] = [pv1Mock, pv5Mock, pv10Mock],
  temJogo = true,
) {
  const serviceMock            = criarServiceMock(itens, temJogo);
  const currentGameServiceMock = criarCurrentGameServiceMock(temJogo);
  const toastServiceMock       = criarToastServiceMock();

  const result = await render(PontosVantagemConfigComponent, {
    configureTestBed: (tb) => {
      tb.overrideTemplate(PontosVantagemConfigComponent, TEMPLATE_STUB);
    },
    providers: [
      { provide: PontosVantagemConfigService, useValue: serviceMock },
      { provide: CurrentGameService,          useValue: currentGameServiceMock },
      { provide: ToastService,                useValue: toastServiceMock },
      ConfirmationService,
    ],
  });

  const confirmationService = result.fixture.componentRef.injector.get(ConfirmationService);
  return { ...result, serviceMock, toastServiceMock, confirmationService };
}

// ============================================================
// Testes
// ============================================================

describe('PontosVantagemConfigComponent', () => {

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  // ----------------------------------------------------------
  // 1. Carregamento
  // ----------------------------------------------------------

  describe('carregamento de dados', () => {
    it('deve chamar loadItems ao inicializar com jogo selecionado', async () => {
      const { serviceMock } = await renderComponent();
      expect(serviceMock.loadItems).toHaveBeenCalledTimes(1);
    });

    it('deve carregar os 3 itens na lista', async () => {
      const { fixture } = await renderComponent();
      expect(fixture.componentInstance.items().length).toBe(3);
    });

    it('não deve chamar loadItems quando não há jogo selecionado', async () => {
      const { serviceMock } = await renderComponent([], false);
      expect(serviceMock.loadItems).not.toHaveBeenCalled();
    });

    it('deve exibir aviso de jogo não selecionado', async () => {
      await renderComponent([], false);
      expect(screen.getByText('Nenhum jogo selecionado')).toBeTruthy();
    });
  });

  // ----------------------------------------------------------
  // 2. Colunas
  // ----------------------------------------------------------

  describe('colunas da tabela', () => {
    it('deve ter as colunas nivel, pontosGanhos e acumulado', async () => {
      const { fixture } = await renderComponent();
      const campos = fixture.componentInstance.columns.map(c => c.field);
      expect(campos).toContain('nivel');
      expect(campos).toContain('pontosGanhos');
      expect(campos).toContain('acumulado');
    });

    it('deve ter 3 colunas definidas', async () => {
      const { fixture } = await renderComponent();
      expect(fixture.componentInstance.columns.length).toBe(3);
    });
  });

  // ----------------------------------------------------------
  // 3. Computed — acumulado por nível
  // ----------------------------------------------------------

  describe('acumuladoPorNivel', () => {
    it('deve calcular acumulado corretamente para 3 níveis', async () => {
      const { fixture } = await renderComponent([pv1Mock, pv5Mock, pv10Mock]);
      const comp = fixture.componentInstance as any;

      // nível 1: 1, nível 5: 1+2=3, nível 10: 1+2+3=6
      expect(comp.acumuladoPorNivel().get(1)).toBe(1);
      expect(comp.acumuladoPorNivel().get(5)).toBe(3);
      expect(comp.acumuladoPorNivel().get(10)).toBe(6);
    });

    it('deve retornar mapa vazio quando não há itens', async () => {
      const { fixture } = await renderComponent([]);
      const comp = fixture.componentInstance as any;
      expect(comp.acumuladoPorNivel().size).toBe(0);
    });
  });

  // ----------------------------------------------------------
  // 4. Lacunas na sequência
  // ----------------------------------------------------------

  describe('lacunasNaSequencia', () => {
    it('deve detectar lacunas quando há níveis faltando', async () => {
      // Tem nível 1 e 5, mas faltam 2, 3, 4
      const { fixture } = await renderComponent([pv1Mock, pv5Mock]);
      const comp = fixture.componentInstance as any;
      expect(comp.lacunasNaSequencia()).toContain(2);
      expect(comp.lacunasNaSequencia()).toContain(3);
      expect(comp.lacunasNaSequencia()).toContain(4);
    });

    it('deve retornar lista vazia quando não há lacunas', async () => {
      const pv2: PontosVantagemConfig = { ...pv1Mock, id: 10, nivel: 2 };
      const pv3: PontosVantagemConfig = { ...pv1Mock, id: 11, nivel: 3 };
      const { fixture } = await renderComponent([pv1Mock, pv2, pv3]);
      const comp = fixture.componentInstance as any;
      expect(comp.lacunasNaSequencia().length).toBe(0);
    });

    it('deve retornar lista vazia quando há menos de 2 itens', async () => {
      const { fixture } = await renderComponent([pv1Mock]);
      const comp = fixture.componentInstance as any;
      expect(comp.lacunasNaSequencia().length).toBe(0);
    });
  });

  // ----------------------------------------------------------
  // 5. Filtro de busca
  // ----------------------------------------------------------

  describe('filteredItems', () => {
    it('deve retornar todos os itens ordenados por nível', async () => {
      const { fixture } = await renderComponent([pv10Mock, pv1Mock, pv5Mock]);
      const comp = fixture.componentInstance as any;
      comp.searchQuery.set('');
      fixture.detectChanges();

      const filtrados = comp.filteredItems();
      expect(filtrados[0].nivel).toBe(1);
      expect(filtrados[1].nivel).toBe(5);
      expect(filtrados[2].nivel).toBe(10);
    });

    it('deve filtrar por número de nível', async () => {
      const { fixture } = await renderComponent();
      const comp = fixture.componentInstance as any;
      comp.searchQuery.set('5');
      fixture.detectChanges();

      const filtrados = comp.filteredItems();
      expect(filtrados.length).toBe(1);
      expect(filtrados[0].nivel).toBe(5);
    });
  });

  // ----------------------------------------------------------
  // 6. Drawer
  // ----------------------------------------------------------

  describe('abertura do drawer', () => {
    it('deve abrir o drawer ao chamar openDrawer()', async () => {
      const { fixture } = await renderComponent();
      fixture.componentInstance.openDrawer();
      fixture.detectChanges();
      expect((fixture.componentInstance as any).drawerVisible()).toBe(true);
    });

    it('deve abrir em modo criação quando não há item', async () => {
      const { fixture } = await renderComponent();
      fixture.componentInstance.openDrawer();
      expect(fixture.componentInstance.editMode()).toBe(false);
    });

    it('deve abrir em modo edição com item passado', async () => {
      const { fixture } = await renderComponent();
      fixture.componentInstance.openDrawer(pv5Mock);
      expect(fixture.componentInstance.editMode()).toBe(true);
    });

    it('deve pré-preencher formulário ao editar', async () => {
      const { fixture } = await renderComponent();
      fixture.componentInstance.openDrawer(pv5Mock);
      expect(fixture.componentInstance.form.get('nivel')?.value).toBe(5);
      expect(fixture.componentInstance.form.get('pontosGanhos')?.value).toBe(2);
    });
  });

  // ----------------------------------------------------------
  // 7. Validações do formulário
  // ----------------------------------------------------------

  describe('validações do formulário', () => {
    it('nivel e pontosGanhos devem ser obrigatórios', async () => {
      const { fixture } = await renderComponent();
      fixture.componentInstance.openDrawer();
      fixture.componentInstance.form.get('nivel')?.setValue(null);
      fixture.componentInstance.form.get('pontosGanhos')?.setValue(null);
      fixture.detectChanges();

      expect(fixture.componentInstance.form.get('nivel')?.invalid).toBe(true);
      expect(fixture.componentInstance.form.get('pontosGanhos')?.invalid).toBe(true);
    });

    it('nivel acima de 35 deve ser inválido', async () => {
      const { fixture } = await renderComponent();
      fixture.componentInstance.openDrawer();
      fixture.componentInstance.form.get('nivel')?.setValue(36);
      fixture.detectChanges();

      expect(fixture.componentInstance.form.get('nivel')?.errors?.['max']).toBeTruthy();
    });

    it('nivel abaixo de 1 deve ser inválido', async () => {
      const { fixture } = await renderComponent();
      fixture.componentInstance.openDrawer();
      fixture.componentInstance.form.get('nivel')?.setValue(0);
      fixture.detectChanges();

      expect(fixture.componentInstance.form.get('nivel')?.errors?.['min']).toBeTruthy();
    });

    it('pontosGanhos negativo deve ser inválido', async () => {
      const { fixture } = await renderComponent();
      fixture.componentInstance.openDrawer();
      fixture.componentInstance.form.get('pontosGanhos')?.setValue(-1);
      fixture.detectChanges();

      expect(fixture.componentInstance.form.get('pontosGanhos')?.errors?.['min']).toBeTruthy();
    });
  });

  // ----------------------------------------------------------
  // 8. Save
  // ----------------------------------------------------------

  describe('save', () => {
    it('deve chamar service.createItem no modo criação', async () => {
      const { fixture, serviceMock } = await renderComponent();
      fixture.componentInstance.openDrawer();
      fixture.componentInstance.form.patchValue({ nivel: 3, pontosGanhos: 2 });
      fixture.detectChanges();

      fixture.componentInstance.save();
      expect(serviceMock.createItem).toHaveBeenCalledTimes(1);
    });

    it('deve chamar service.updateItem no modo edição', async () => {
      const { fixture, serviceMock } = await renderComponent();
      fixture.componentInstance.openDrawer(pv5Mock);
      fixture.componentInstance.form.get('pontosGanhos')?.setValue(3);
      fixture.detectChanges();

      fixture.componentInstance.save();
      expect(serviceMock.updateItem).toHaveBeenCalledWith(
        pv5Mock.id,
        expect.objectContaining({ pontosGanhos: 3 }),
      );
    });

    it('não deve chamar createItem quando formulário é inválido', async () => {
      const { fixture, serviceMock, toastServiceMock } = await renderComponent();
      fixture.componentInstance.openDrawer();
      fixture.componentInstance.form.get('nivel')?.setValue(null);
      fixture.detectChanges();

      fixture.componentInstance.save();
      expect(serviceMock.createItem).not.toHaveBeenCalled();
      expect(toastServiceMock.warning).toHaveBeenCalled();
    });
  });

  // ----------------------------------------------------------
  // 9. Exclusão
  // ----------------------------------------------------------

  describe('confirmDelete', () => {
    it('deve chamar confirmationService.confirm ao excluir', async () => {
      const { fixture, confirmationService } = await renderComponent();
      const confirmSpy = vi.spyOn(confirmationService, 'confirm');

      fixture.componentInstance.confirmDelete(pv1Mock.id!);
      expect(confirmSpy).toHaveBeenCalledTimes(1);
    });

    it('deve chamar service.deleteItem quando usuário confirma', async () => {
      const { fixture, serviceMock, confirmationService } = await renderComponent();
      vi.spyOn(confirmationService, 'confirm').mockImplementation(((config: any) => { config.accept?.(); }) as any);

      fixture.componentInstance.confirmDelete(pv1Mock.id!);
      expect(serviceMock.deleteItem).toHaveBeenCalledWith(pv1Mock.id);
    });
  });
});
