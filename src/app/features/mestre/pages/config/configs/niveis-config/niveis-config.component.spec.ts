/**
 * NiveisConfigComponent — Spec
 *
 * NOTA JIT: Em JIT (Vitest sem plugin Angular), componentes filhos standalone
 * com input.required() causam NG0950. Usamos configureTestBed + overrideTemplate
 * para substituir o template por um stub mínimo que evita renderizar
 * BaseConfigTableComponent.
 *
 * Os testes focam na lógica do Smart Component: service calls, drawer,
 * form validation, filtros — não na renderização dos filhos.
 */
import { TestBed } from '@angular/core/testing';
import { render, screen } from '@testing-library/angular';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { ConfirmationService } from 'primeng/api';

import { NiveisConfigComponent } from './niveis-config.component';
import { NivelConfigService } from '@core/services/business/config';
import { NivelConfig } from '@core/models';
import { ToastService } from '@services/toast.service';
import { CurrentGameService } from '@core/services/current-game.service';

// ============================================================
// Dados de teste
// ============================================================

const nivel1Mock: NivelConfig = {
  id: 1,
  jogoId: 10,
  nivel: 1,
  xpNecessaria: 0,
  pontosAtributo: 3,
  pontosAptidao: 3,
  limitadorAtributo: 10,
  permitirRenascimento: false,
  dataCriacao: '2024-01-01T00:00:00',
  dataUltimaAtualizacao: '2024-06-01T00:00:00',
};

const nivel5Mock: NivelConfig = {
  id: 2,
  jogoId: 10,
  nivel: 5,
  xpNecessaria: 1000,
  pontosAtributo: 4,
  pontosAptidao: 4,
  limitadorAtributo: 15,
  permitirRenascimento: false,
  dataCriacao: '2024-01-01T00:00:00',
  dataUltimaAtualizacao: '2024-06-01T00:00:00',
};

const nivel10Mock: NivelConfig = {
  id: 3,
  jogoId: 10,
  nivel: 10,
  xpNecessaria: 5000,
  pontosAtributo: 5,
  pontosAptidao: 5,
  limitadorAtributo: 20,
  permitirRenascimento: true,
  dataCriacao: '2024-01-01T00:00:00',
  dataUltimaAtualizacao: '2024-06-01T00:00:00',
};

// ============================================================
// Helpers para criar mocks
// ============================================================

function criarNivelServiceMock(niveis: NivelConfig[] = [], temJogo = true) {
  const jogoAtual = temJogo ? { id: 10, nome: 'Campanha Teste', ativo: true } : null;
  return {
    loadItems:       vi.fn().mockReturnValue(of(niveis)),
    createItem:      vi.fn().mockReturnValue(of(nivel1Mock)),
    updateItem:      vi.fn().mockReturnValue(of(nivel1Mock)),
    deleteItem:      vi.fn().mockReturnValue(of(void 0)),
    currentGameId:   () => (temJogo ? 10 : null),
    hasCurrentGame:  () => temJogo,
    currentGame:     () => jogoAtual,
  };
}

function criarCurrentGameServiceMock(temJogo = true) {
  const jogoAtual = temJogo ? { id: 10, nome: 'Campanha Teste', ativo: true } : null;
  return {
    currentGameId:   () => (temJogo ? 10 : null),
    hasCurrentGame:  () => temJogo,
    currentGame:     () => jogoAtual,
    availableGames:  signal([]).asReadonly(),
    selectGame:      vi.fn(),
    clearGame:       vi.fn(),
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
// Helper de render
//
// Usa configureTestBed + overrideTemplate para substituir o template
// por um stub mínimo, evitando NG0950 dos componentes filhos com
// input.required() em modo JIT.
// ============================================================

const TEMPLATE_STUB = `
  <div id="niveis-config-stub">
    @if (hasGame()) {
      <span id="jogo-ativo">{{ currentGameName() }}</span>
    }
    @if (!hasGame()) {
      <p id="sem-jogo">Nenhum jogo selecionado</p>
    }
  </div>
`;

async function renderNiveis(
  niveis: NivelConfig[] = [nivel1Mock, nivel5Mock, nivel10Mock],
  temJogo = true,
) {
  const nivelServiceMock        = criarNivelServiceMock(niveis, temJogo);
  const currentGameServiceMock  = criarCurrentGameServiceMock(temJogo);
  const toastServiceMock        = criarToastServiceMock();

  const result = await render(NiveisConfigComponent, {
    // Substitui o template por um stub mínimo para evitar NG0950 em JIT
    configureTestBed: (tb) => {
      tb.overrideTemplate(NiveisConfigComponent, TEMPLATE_STUB);
    },
    providers: [
      { provide: NivelConfigService,  useValue: nivelServiceMock },
      { provide: CurrentGameService,  useValue: currentGameServiceMock },
      { provide: ToastService,        useValue: toastServiceMock },
      ConfirmationService,
    ],
  });

  // ConfirmationService do injector do componente (providers: [ConfirmationService])
  const confirmationService = result.fixture.componentRef.injector.get(ConfirmationService);

  return { ...result, nivelServiceMock, toastServiceMock, confirmationService };
}

// ============================================================
// Testes
// ============================================================

describe('NiveisConfigComponent', () => {

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  // ----------------------------------------------------------
  // 1. Carregamento de dados
  // ----------------------------------------------------------

  describe('carregamento de dados', () => {
    it('deve chamar loadItems ao inicializar com jogo selecionado', async () => {
      const { nivelServiceMock } = await renderNiveis();

      expect(nivelServiceMock.loadItems).toHaveBeenCalledTimes(1);
    });

    it('deve exibir os níveis carregados na tabela', async () => {
      const { fixture } = await renderNiveis();
      const comp = fixture.componentInstance;

      // Verifica via signal que os itens foram carregados
      expect(comp.items().length).toBe(3);
      expect(comp.items().some(n => n.nivel === 1)).toBe(true);
      expect(comp.items().some(n => n.nivel === 5)).toBe(true);
      expect(comp.items().some(n => n.nivel === 10)).toBe(true);
    });

    it('não deve chamar loadItems quando não há jogo selecionado', async () => {
      const { nivelServiceMock } = await renderNiveis([], false);

      expect(nivelServiceMock.loadItems).not.toHaveBeenCalled();
    });

    it('deve exibir aviso de jogo não selecionado quando hasGame é false', async () => {
      await renderNiveis([], false);

      expect(screen.getByText('Nenhum jogo selecionado')).toBeTruthy();
    });
  });

  // ----------------------------------------------------------
  // 2. Colunas da tabela (via columns array do componente)
  // ----------------------------------------------------------

  describe('colunas da tabela', () => {
    it('deve exibir coluna "Nível"', async () => {
      const { fixture } = await renderNiveis();
      const comp = fixture.componentInstance;

      const colunas = comp.columns.map(c => c.header);
      expect(colunas).toContain('Nível');
    });

    it('deve exibir coluna "XP"', async () => {
      const { fixture } = await renderNiveis();
      const comp = fixture.componentInstance;

      const colunas = comp.columns.map(c => c.header);
      expect(colunas).toContain('XP');
    });

    it('deve exibir coluna "Pts Attr."', async () => {
      const { fixture } = await renderNiveis();
      const comp = fixture.componentInstance;

      const colunas = comp.columns.map(c => c.header);
      expect(colunas).toContain('Pts Attr.');
    });

    it('deve exibir coluna "Pts Apt."', async () => {
      const { fixture } = await renderNiveis();
      const comp = fixture.componentInstance;

      const colunas = comp.columns.map(c => c.header);
      expect(colunas).toContain('Pts Apt.');
    });

    it('deve exibir coluna "Limitador"', async () => {
      const { fixture } = await renderNiveis();
      const comp = fixture.componentInstance;

      const colunas = comp.columns.map(c => c.header);
      expect(colunas).toContain('Limitador');
    });

    it('deve exibir coluna "Renascer"', async () => {
      const { fixture } = await renderNiveis();
      const comp = fixture.componentInstance;

      const colunas = comp.columns.map(c => c.header);
      expect(colunas).toContain('Renascer');
    });

    it('deve ter 6 colunas definidas (incluindo Renascer)', async () => {
      const { fixture } = await renderNiveis();
      const comp = fixture.componentInstance;

      expect(comp.columns.length).toBe(6);
    });
  });

  // ----------------------------------------------------------
  // 3. Abertura do drawer
  // ----------------------------------------------------------

  describe('abertura do drawer', () => {
    it('deve abrir o drawer ao chamar openDrawer()', async () => {
      const { fixture } = await renderNiveis();

      fixture.componentInstance.openDrawer();
      fixture.detectChanges();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((fixture.componentInstance as any).drawerVisible()).toBe(true);
    });

    it('deve abrir em modo criação (editMode = false) ao clicar em "+ Novo Nível"', async () => {
      const { fixture } = await renderNiveis();

      fixture.componentInstance.openDrawer();
      fixture.detectChanges();

      expect(fixture.componentInstance.editMode()).toBe(false);
    });

    it('deve abrir em modo edição (editMode = true) ao chamar openDrawer com item', async () => {
      const { fixture } = await renderNiveis();

      fixture.componentInstance.openDrawer(nivel5Mock);
      fixture.detectChanges();

      expect(fixture.componentInstance.editMode()).toBe(true);
    });

    it('deve pré-preencher o formulário com dados do nível ao editar', async () => {
      const { fixture } = await renderNiveis();

      fixture.componentInstance.openDrawer(nivel5Mock);
      fixture.detectChanges();

      expect(fixture.componentInstance.form.get('nivel')?.value).toBe(5);
      expect(fixture.componentInstance.form.get('xpNecessaria')?.value).toBe(1000);
      expect(fixture.componentInstance.form.get('pontosAtributo')?.value).toBe(4);
      expect(fixture.componentInstance.form.get('pontosAptidao')?.value).toBe(4);
    });
  });

  // ----------------------------------------------------------
  // 4. Validações do formulário
  // ----------------------------------------------------------

  describe('validações do formulário', () => {
    it('nivel e xpNecessaria devem ser obrigatórios', async () => {
      const { fixture } = await renderNiveis();

      fixture.componentInstance.openDrawer();
      fixture.componentInstance.form.get('nivel')?.setValue(null);
      fixture.componentInstance.form.get('xpNecessaria')?.setValue(null);
      fixture.detectChanges();

      expect(fixture.componentInstance.form.get('nivel')?.invalid).toBe(true);
      expect(fixture.componentInstance.form.get('xpNecessaria')?.invalid).toBe(true);
    });

    it('pontosAtributo e pontosAptidao devem ser obrigatórios', async () => {
      const { fixture } = await renderNiveis();

      fixture.componentInstance.openDrawer();
      fixture.componentInstance.form.get('pontosAtributo')?.setValue(null);
      fixture.componentInstance.form.get('pontosAptidao')?.setValue(null);
      fixture.detectChanges();

      expect(fixture.componentInstance.form.get('pontosAtributo')?.invalid).toBe(true);
      expect(fixture.componentInstance.form.get('pontosAptidao')?.invalid).toBe(true);
    });

    it('nivel acima de 35 deve ser inválido', async () => {
      const { fixture } = await renderNiveis();

      fixture.componentInstance.openDrawer();
      fixture.componentInstance.form.get('nivel')?.setValue(36);
      fixture.detectChanges();

      expect(fixture.componentInstance.form.get('nivel')?.errors?.['max']).toBeTruthy();
    });

    it('nivel negativo deve ser inválido', async () => {
      const { fixture } = await renderNiveis();

      fixture.componentInstance.openDrawer();
      fixture.componentInstance.form.get('nivel')?.setValue(-1);
      fixture.detectChanges();

      expect(fixture.componentInstance.form.get('nivel')?.errors?.['min']).toBeTruthy();
    });

    it('formulário com todos os campos válidos deve ser válido', async () => {
      const { fixture } = await renderNiveis();

      fixture.componentInstance.openDrawer();
      fixture.componentInstance.form.patchValue({
        nivel: 2,
        xpNecessaria: 100,
        pontosAtributo: 3,
        pontosAptidao: 3,
        limitadorAtributo: 12,
        permitirRenascimento: false,
      });
      fixture.detectChanges();

      expect(fixture.componentInstance.form.valid).toBe(true);
    });
  });

  // ----------------------------------------------------------
  // 5. Submit (save)
  // ----------------------------------------------------------

  describe('submit do formulário (save)', () => {
    it('deve chamar service.createItem ao salvar formulário válido no modo criação', async () => {
      const { fixture, nivelServiceMock } = await renderNiveis();

      fixture.componentInstance.openDrawer(); // modo criação
      fixture.componentInstance.form.patchValue({
        nivel: 2,
        xpNecessaria: 100,
        pontosAtributo: 3,
        pontosAptidao: 3,
        limitadorAtributo: 12,
        permitirRenascimento: false,
      });
      fixture.detectChanges();

      fixture.componentInstance.save();

      expect(nivelServiceMock.createItem).toHaveBeenCalledTimes(1);
    });

    it('deve chamar service.updateItem ao salvar no modo edição', async () => {
      const { fixture, nivelServiceMock } = await renderNiveis();

      fixture.componentInstance.openDrawer(nivel5Mock); // modo edição
      fixture.componentInstance.form.get('xpNecessaria')?.setValue(1500);
      fixture.detectChanges();

      fixture.componentInstance.save();

      expect(nivelServiceMock.updateItem).toHaveBeenCalledWith(
        nivel5Mock.id,
        expect.objectContaining({ xpNecessaria: 1500 }),
      );
    });

    it('não deve chamar service.createItem quando formulário é inválido', async () => {
      const { fixture, nivelServiceMock, toastServiceMock } = await renderNiveis();

      fixture.componentInstance.openDrawer();
      fixture.componentInstance.form.get('nivel')?.setValue(null); // inválido
      fixture.detectChanges();

      fixture.componentInstance.save();

      expect(nivelServiceMock.createItem).not.toHaveBeenCalled();
      expect(toastServiceMock.warning).toHaveBeenCalled();
    });

    it('deve fechar drawer após salvar com sucesso', async () => {
      const { fixture } = await renderNiveis();

      fixture.componentInstance.openDrawer();
      fixture.componentInstance.form.patchValue({
        nivel: 3,
        xpNecessaria: 300,
        pontosAtributo: 3,
        pontosAptidao: 3,
        limitadorAtributo: 12,
        permitirRenascimento: false,
      });
      fixture.detectChanges();

      fixture.componentInstance.save();
      fixture.detectChanges();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((fixture.componentInstance as any).drawerVisible()).toBe(false);
    });
  });

  // ----------------------------------------------------------
  // 6. Exclusão com confirmação
  // ----------------------------------------------------------

  describe('confirmDelete', () => {
    it('deve chamar confirmationService.confirm ao tentar excluir', async () => {
      const { fixture, confirmationService } = await renderNiveis();
      const confirmSpy = vi.spyOn(confirmationService, 'confirm');

      fixture.componentInstance.confirmDelete(nivel1Mock.id);

      expect(confirmSpy).toHaveBeenCalledTimes(1);
    });

    it('não deve chamar service.deleteItem antes da confirmação', async () => {
      const { fixture, nivelServiceMock, confirmationService } = await renderNiveis();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.spyOn(confirmationService, 'confirm').mockImplementation((() => {}) as any);

      fixture.componentInstance.confirmDelete(nivel1Mock.id);

      expect(nivelServiceMock.deleteItem).not.toHaveBeenCalled();
    });

    it('deve chamar service.deleteItem quando usuário confirma a exclusão', async () => {
      const { fixture, nivelServiceMock, confirmationService } = await renderNiveis();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.spyOn(confirmationService, 'confirm').mockImplementation(((config: any) => { config.accept?.(); }) as any);

      fixture.componentInstance.confirmDelete(nivel1Mock.id);

      expect(nivelServiceMock.deleteItem).toHaveBeenCalledWith(nivel1Mock.id);
    });
  });

  // ----------------------------------------------------------
  // 7. Filtro de busca
  // ----------------------------------------------------------

  describe('filtro de busca (filteredItems)', () => {
    it('deve retornar todos os itens ordenados por nível quando busca está vazia', async () => {
      // Injetamos em ordem invertida para verificar a ordenação
      const { fixture } = await renderNiveis([nivel10Mock, nivel1Mock, nivel5Mock]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;
      comp.searchQuery.set('');
      fixture.detectChanges();

      const filtrados = comp.filteredItems();
      expect(filtrados[0].nivel).toBe(1);
      expect(filtrados[1].nivel).toBe(5);
      expect(filtrados[2].nivel).toBe(10);
    });

    it('deve filtrar por número de nível ao buscar', async () => {
      const { fixture } = await renderNiveis();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;
      comp.searchQuery.set('5');
      fixture.detectChanges();

      const filtrados = comp.filteredItems();
      expect(filtrados.length).toBe(1);
      expect(filtrados[0].nivel).toBe(5);
    });

    it('deve retornar lista vazia quando busca não encontra resultados', async () => {
      const { fixture } = await renderNiveis([nivel1Mock, nivel5Mock]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;
      comp.searchQuery.set('99');
      fixture.detectChanges();

      expect(comp.filteredItems().length).toBe(0);
    });
  });

  // ----------------------------------------------------------
  // 8. Computed signals de consistência (T4)
  // ----------------------------------------------------------

  describe('consistência de dados (niveisComXpInvalida / lacunasNaSequencia)', () => {
    it('deve detectar nível com XP menor que o nível anterior', async () => {
      // nivel5 (XP=1000) depois de nivel10 (XP=5000) — inconsistente no índice 5
      const nivelInvalido: NivelConfig = {
        ...nivel5Mock,
        id: 99,
        nivel: 12,
        xpNecessaria: 100, // menor que nivel10 (5000) — inválido
      };
      const { fixture } = await renderNiveis([nivel1Mock, nivel5Mock, nivel10Mock, nivelInvalido]);
      const comp = fixture.componentInstance as any;

      expect(comp.niveisComXpInvalida().has(12)).toBe(true);
    });

    it('deve retornar conjunto vazio quando XP está em ordem crescente', async () => {
      const { fixture } = await renderNiveis([nivel1Mock, nivel5Mock, nivel10Mock]);
      const comp = fixture.componentInstance as any;

      expect(comp.niveisComXpInvalida().size).toBe(0);
    });

    it('deve detectar lacunas na sequência de níveis', async () => {
      // Tem nível 1, 5 e 10 — faltam 2, 3, 4, 6, 7, 8, 9
      const { fixture } = await renderNiveis([nivel1Mock, nivel5Mock, nivel10Mock]);
      const comp = fixture.componentInstance as any;

      const lacunas = comp.lacunasNaSequencia();
      expect(lacunas).toContain(2);
      expect(lacunas).toContain(6);
    });

    it('deve retornar lista vazia quando não há lacunas', async () => {
      const nivel2: NivelConfig = { ...nivel1Mock, id: 10, nivel: 2, xpNecessaria: 100 };
      const nivel3: NivelConfig = { ...nivel1Mock, id: 11, nivel: 3, xpNecessaria: 200 };
      const { fixture } = await renderNiveis([nivel1Mock, nivel2, nivel3]);
      const comp = fixture.componentInstance as any;

      expect(comp.lacunasNaSequencia().length).toBe(0);
    });
  });

  // ----------------------------------------------------------
  // 9. Fechar drawer
  // ----------------------------------------------------------

  describe('closeDrawer', () => {
    it('deve fechar o drawer e resetar o formulário ao cancelar', async () => {
      const { fixture } = await renderNiveis();

      fixture.componentInstance.openDrawer();
      fixture.componentInstance.form.get('nivel')?.setValue(7);
      fixture.detectChanges();

      fixture.componentInstance.closeDrawer();
      fixture.detectChanges();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((fixture.componentInstance as any).drawerVisible()).toBe(false);
      expect(fixture.componentInstance.form.pristine).toBe(true);
    });
  });
});
