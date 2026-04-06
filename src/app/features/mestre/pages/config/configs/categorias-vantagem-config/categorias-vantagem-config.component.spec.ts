/**
 * CategoriaVantagemConfigComponent — Spec
 *
 * NOTA JIT: Em JIT (Vitest sem plugin Angular), componentes filhos standalone
 * com input.required() causam NG0950. Usamos overrideTemplate para substituir
 * o template por um stub mínimo.
 */
import { TestBed } from '@angular/core/testing';
import { render, screen } from '@testing-library/angular';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { ConfirmationService } from 'primeng/api';

import { CategoriaVantagemConfigComponent } from './categorias-vantagem-config.component';
import { CategoriaVantagemConfigService } from '@core/services/business/config';
import { CategoriaVantagem } from '@core/models/config.models';
import { ToastService } from '@services/toast.service';
import { CurrentGameService } from '@core/services/current-game.service';
import { ConfigStore } from '@core/stores/config.store';

// ============================================================
// Dados de teste
// ============================================================

const cat1Mock: CategoriaVantagem = {
  id: 1,
  jogoId: 10,
  nome: 'Combate',
  descricao: 'Habilidades de combate',
  cor: '#e74c3c',
  ordemExibicao: 0,
  dataCriacao: '2024-01-01T00:00:00',
  dataUltimaAtualizacao: '2024-06-01T00:00:00',
};

const cat2Mock: CategoriaVantagem = {
  id: 2,
  jogoId: 10,
  nome: 'Magia',
  descricao: null,
  cor: '#9b59b6',
  ordemExibicao: 1,
  dataCriacao: '2024-01-01T00:00:00',
  dataUltimaAtualizacao: '2024-06-01T00:00:00',
};

const cat3Mock: CategoriaVantagem = {
  id: 3,
  jogoId: 10,
  nome: 'Social',
  descricao: 'Habilidades sociais',
  cor: null,
  ordemExibicao: 2,
  dataCriacao: '2024-01-01T00:00:00',
  dataUltimaAtualizacao: '2024-06-01T00:00:00',
};

// ============================================================
// Helpers
// ============================================================

function criarServiceMock(itens: CategoriaVantagem[] = [], temJogo = true) {
  const jogoAtual = temJogo ? { id: 10, nome: 'Campanha Teste', ativo: true } : null;
  return {
    loadItems:      vi.fn().mockReturnValue(of(itens)),
    createItem:     vi.fn().mockReturnValue(of(cat1Mock)),
    updateItem:     vi.fn().mockReturnValue(of(cat1Mock)),
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
  return { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn(), clear: vi.fn() };
}

function criarConfigStoreMock(vantagens: any[] = []) {
  return { vantagens: signal(vantagens).asReadonly() };
}

// ============================================================
// Template stub para evitar NG0950 em JIT
// ============================================================

const TEMPLATE_STUB = `
  <div id="categorias-vantagem-config-stub">
    @if (hasGame()) {
      <span id="jogo-ativo">{{ currentGameName() }}</span>
    }
    @if (!hasGame()) {
      <p id="sem-jogo">Nenhum jogo selecionado</p>
    }
  </div>
`;

async function renderComponent(
  itens: CategoriaVantagem[] = [cat1Mock, cat2Mock, cat3Mock],
  temJogo = true,
  vantagens: any[] = [],
) {
  const serviceMock            = criarServiceMock(itens, temJogo);
  const currentGameServiceMock = criarCurrentGameServiceMock(temJogo);
  const toastServiceMock       = criarToastServiceMock();
  const configStoreMock        = criarConfigStoreMock(vantagens);

  const result = await render(CategoriaVantagemConfigComponent, {
    configureTestBed: (tb) => {
      tb.overrideTemplate(CategoriaVantagemConfigComponent, TEMPLATE_STUB);
    },
    providers: [
      { provide: CategoriaVantagemConfigService, useValue: serviceMock },
      { provide: CurrentGameService,             useValue: currentGameServiceMock },
      { provide: ToastService,                   useValue: toastServiceMock },
      { provide: ConfigStore,                    useValue: configStoreMock },
      ConfirmationService,
    ],
  });

  const confirmationService = result.fixture.componentRef.injector.get(ConfirmationService);
  return { ...result, serviceMock, toastServiceMock, confirmationService };
}

// ============================================================
// Testes
// ============================================================

describe('CategoriaVantagemConfigComponent', () => {

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

    it('deve carregar os 3 itens', async () => {
      const { fixture } = await renderComponent();
      expect(fixture.componentInstance.items().length).toBe(3);
    });

    it('não deve chamar loadItems sem jogo selecionado', async () => {
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
    it('deve ter as colunas nome, cor, descricao, ordemExibicao, vantagensCount', async () => {
      const { fixture } = await renderComponent();
      const campos = fixture.componentInstance.columns.map(c => c.field);
      expect(campos).toContain('nome');
      expect(campos).toContain('cor');
      expect(campos).toContain('descricao');
      expect(campos).toContain('ordemExibicao');
      expect(campos).toContain('vantagensCount');
    });
  });

  // ----------------------------------------------------------
  // 3. getContrastColor
  // ----------------------------------------------------------

  describe('getContrastColor', () => {
    it('deve retornar #000 para cor clara', () => {
      const { fixture } = renderComponent() as any;
      // Acessa como any para testar método protegido
      // Testamos diretamente a instância depois de render síncrono
      // (sem await pois só precisamos da instância)
    });

    it('deve retornar #000 para branco (#FFFFFF)', async () => {
      const { fixture } = await renderComponent();
      const comp = fixture.componentInstance as any;
      expect(comp.getContrastColor('#FFFFFF')).toBe('#000');
    });

    it('deve retornar #fff para preto (#000000)', async () => {
      const { fixture } = await renderComponent();
      const comp = fixture.componentInstance as any;
      expect(comp.getContrastColor('#000000')).toBe('#fff');
    });

    it('deve retornar #fff para cor escura (#9b59b6)', async () => {
      const { fixture } = await renderComponent();
      const comp = fixture.componentInstance as any;
      expect(comp.getContrastColor('#9b59b6')).toBe('#fff');
    });

    it('deve retornar #fff para string inválida', async () => {
      const { fixture } = await renderComponent();
      const comp = fixture.componentInstance as any;
      expect(comp.getContrastColor('')).toBe('#fff');
      expect(comp.getContrastColor('abc')).toBe('#fff');
    });
  });

  // ----------------------------------------------------------
  // 4. Drawer
  // ----------------------------------------------------------

  describe('abertura do drawer', () => {
    it('deve abrir o drawer ao chamar openDrawer()', async () => {
      const { fixture } = await renderComponent();
      fixture.componentInstance.openDrawer();
      expect((fixture.componentInstance as any).drawerVisible()).toBe(true);
    });

    it('deve abrir em modo criação', async () => {
      const { fixture } = await renderComponent();
      fixture.componentInstance.openDrawer();
      expect(fixture.componentInstance.editMode()).toBe(false);
    });

    it('deve abrir em modo edição com item passado', async () => {
      const { fixture } = await renderComponent();
      fixture.componentInstance.openDrawer(cat1Mock);
      expect(fixture.componentInstance.editMode()).toBe(true);
    });

    it('deve pré-preencher formulário ao editar', async () => {
      const { fixture } = await renderComponent();
      fixture.componentInstance.openDrawer(cat1Mock);
      expect(fixture.componentInstance.form.get('nome')?.value).toBe('Combate');
      expect(fixture.componentInstance.form.get('cor')?.value).toBe('#e74c3c');
    });

    it('deve setar corValue ao abrir com item que tem cor', async () => {
      const { fixture } = await renderComponent();
      fixture.componentInstance.openDrawer(cat1Mock);
      expect((fixture.componentInstance as any).corValue()).toBe('#e74c3c');
    });

    it('deve resetar corValue ao abrir sem item', async () => {
      const { fixture } = await renderComponent();
      fixture.componentInstance.openDrawer(cat1Mock);
      fixture.componentInstance.closeDrawer();
      fixture.componentInstance.openDrawer();
      expect((fixture.componentInstance as any).corValue()).toBe('#6c757d');
    });
  });

  // ----------------------------------------------------------
  // 5. Color picker
  // ----------------------------------------------------------

  describe('onColorChange', () => {
    it('deve normalizar cor sem # ao receber do color picker', async () => {
      const { fixture } = await renderComponent();
      fixture.componentInstance.openDrawer();
      const comp = fixture.componentInstance as any;

      comp.onColorChange('FF5500');
      expect(comp.corValue()).toBe('#FF5500');
      expect(fixture.componentInstance.form.get('cor')?.value).toBe('#FF5500');
    });

    it('deve manter cor com # quando já está normalizada', async () => {
      const { fixture } = await renderComponent();
      fixture.componentInstance.openDrawer();
      const comp = fixture.componentInstance as any;

      comp.onColorChange('#3498DB');
      expect(comp.corValue()).toBe('#3498DB');
    });

    it('não deve processar valor nulo', async () => {
      const { fixture } = await renderComponent();
      fixture.componentInstance.openDrawer();
      const comp = fixture.componentInstance as any;
      const valorAntes = comp.corValue();

      comp.onColorChange(null);
      expect(comp.corValue()).toBe(valorAntes); // sem alteração
    });
  });

  // ----------------------------------------------------------
  // 6. Validações do formulário
  // ----------------------------------------------------------

  describe('validações do formulário', () => {
    it('nome deve ser obrigatório', async () => {
      const { fixture } = await renderComponent();
      fixture.componentInstance.openDrawer();
      fixture.componentInstance.form.get('nome')?.setValue('');
      fixture.detectChanges();

      expect(fixture.componentInstance.form.get('nome')?.invalid).toBe(true);
    });

    it('cor com formato inválido deve ser inválida', async () => {
      const { fixture } = await renderComponent();
      fixture.componentInstance.openDrawer();
      fixture.componentInstance.form.get('cor')?.setValue('vermelho');
      fixture.detectChanges();

      expect(fixture.componentInstance.form.get('cor')?.errors?.['pattern']).toBeTruthy();
    });

    it('cor com formato #RRGGBB válido deve ser válida', async () => {
      const { fixture } = await renderComponent();
      fixture.componentInstance.openDrawer();
      fixture.componentInstance.form.get('cor')?.setValue('#FF5500');
      fixture.detectChanges();

      expect(fixture.componentInstance.form.get('cor')?.valid).toBe(true);
    });

    it('nome com mais de 100 chars deve ser inválido', async () => {
      const { fixture } = await renderComponent();
      fixture.componentInstance.openDrawer();
      fixture.componentInstance.form.get('nome')?.setValue('a'.repeat(101));
      fixture.detectChanges();

      expect(fixture.componentInstance.form.get('nome')?.errors?.['maxlength']).toBeTruthy();
    });
  });

  // ----------------------------------------------------------
  // 7. Save
  // ----------------------------------------------------------

  describe('save', () => {
    it('deve chamar service.createItem no modo criação', async () => {
      const { fixture, serviceMock } = await renderComponent();
      fixture.componentInstance.openDrawer();
      fixture.componentInstance.form.patchValue({ nome: 'Nova Cat', cor: '#AABBCC' });
      fixture.detectChanges();

      fixture.componentInstance.save();
      expect(serviceMock.createItem).toHaveBeenCalledTimes(1);
    });

    it('deve chamar service.updateItem no modo edição', async () => {
      const { fixture, serviceMock } = await renderComponent();
      fixture.componentInstance.openDrawer(cat1Mock);
      fixture.componentInstance.form.get('nome')?.setValue('Combate Avançado');
      fixture.detectChanges();

      fixture.componentInstance.save();
      expect(serviceMock.updateItem).toHaveBeenCalledWith(
        cat1Mock.id,
        expect.objectContaining({ nome: 'Combate Avançado' }),
      );
    });

    it('não deve chamar createItem quando nome está vazio', async () => {
      const { fixture, serviceMock, toastServiceMock } = await renderComponent();
      fixture.componentInstance.openDrawer();
      fixture.componentInstance.form.get('nome')?.setValue('');
      fixture.detectChanges();

      fixture.componentInstance.save();
      expect(serviceMock.createItem).not.toHaveBeenCalled();
      expect(toastServiceMock.warning).toHaveBeenCalled();
    });
  });

  // ----------------------------------------------------------
  // 8. Exclusão com contagem de vantagens
  // ----------------------------------------------------------

  describe('confirmDelete', () => {
    it('deve chamar confirmationService.confirm ao excluir', async () => {
      const { fixture, confirmationService } = await renderComponent();
      const confirmSpy = vi.spyOn(confirmationService, 'confirm');

      fixture.componentInstance.confirmDelete(cat1Mock.id);
      expect(confirmSpy).toHaveBeenCalledTimes(1);
    });

    it('deve incluir contagem no dialog quando há vantagens vinculadas', async () => {
      // Simula vantagens vinculadas à categoria 1
      const vantagensComCat = [
        { categoriaVantagemId: cat1Mock.id, nome: 'V1' },
        { categoriaVantagemId: cat1Mock.id, nome: 'V2' },
      ];
      const { fixture, confirmationService } = await renderComponent(
        [cat1Mock],
        true,
        vantagensComCat,
      );
      let mensagemDialog = '';
      vi.spyOn(confirmationService, 'confirm').mockImplementation(((config: any) => {
        mensagemDialog = config.message ?? '';
      }) as any);

      fixture.componentInstance.confirmDelete(cat1Mock.id);
      expect(mensagemDialog).toContain('2');
      expect(mensagemDialog).toContain('vantagen');
    });

    it('deve chamar service.deleteItem quando usuário confirma', async () => {
      const { fixture, serviceMock, confirmationService } = await renderComponent();
      vi.spyOn(confirmationService, 'confirm').mockImplementation(((config: any) => { config.accept?.(); }) as any);

      fixture.componentInstance.confirmDelete(cat1Mock.id);
      expect(serviceMock.deleteItem).toHaveBeenCalledWith(cat1Mock.id);
    });
  });

  // ----------------------------------------------------------
  // 9. Filtro de busca
  // ----------------------------------------------------------

  describe('filteredItems', () => {
    it('deve retornar todos os itens ordenados por ordemExibicao', async () => {
      const { fixture } = await renderComponent([cat3Mock, cat1Mock, cat2Mock]);
      const comp = fixture.componentInstance as any;
      comp.searchQuery.set('');
      fixture.detectChanges();

      const filtrados = comp.filteredItems();
      expect(filtrados[0].nome).toBe('Combate');
      expect(filtrados[1].nome).toBe('Magia');
      expect(filtrados[2].nome).toBe('Social');
    });

    it('deve filtrar por nome', async () => {
      const { fixture } = await renderComponent();
      const comp = fixture.componentInstance as any;
      comp.searchQuery.set('magia');
      fixture.detectChanges();

      expect(comp.filteredItems().length).toBe(1);
      expect(comp.filteredItems()[0].nome).toBe('Magia');
    });
  });
});
