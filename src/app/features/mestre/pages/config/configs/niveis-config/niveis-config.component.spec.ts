import { TestBed } from '@angular/core/testing';
import { render, screen, fireEvent } from '@testing-library/angular';
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

/**
 * temJogo controla hasCurrentGame/currentGameId — o componente usa
 * this.service.hasCurrentGame() para verificar se há jogo selecionado.
 */
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
// ============================================================

async function renderNiveis(
  niveis: NivelConfig[] = [nivel1Mock, nivel5Mock, nivel10Mock],
  temJogo = true,
) {
  const nivelServiceMock        = criarNivelServiceMock(niveis, temJogo);
  const currentGameServiceMock  = criarCurrentGameServiceMock(temJogo);
  const toastServiceMock        = criarToastServiceMock();

  const result = await render(NiveisConfigComponent, {
    providers: [
      { provide: NivelConfigService,  useValue: nivelServiceMock },
      { provide: CurrentGameService,  useValue: currentGameServiceMock },
      { provide: ToastService,        useValue: toastServiceMock },
      // ConfirmationService real — necessário para o ConfirmDialog do PrimeNG funcionar
      ConfirmationService,
    ],
  });

  // Acessa o ConfirmationService do injector do componente (providers: [ConfirmationService])
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
      await renderNiveis();

      // Verifica que os números de nível aparecem na tabela
      // Usa getAllByText pois valores numéricos podem aparecer em múltiplas células
      expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('5').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('10').length).toBeGreaterThanOrEqual(1);
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
  // 2. Colunas da tabela
  // ----------------------------------------------------------

  describe('colunas da tabela', () => {
    it('deve exibir coluna "Nível"', async () => {
      await renderNiveis();

      expect(screen.getByText('Nível')).toBeTruthy();
    });

    it('deve exibir coluna "XP"', async () => {
      await renderNiveis();

      expect(screen.getByText('XP')).toBeTruthy();
    });

    it('deve exibir coluna "Pts Attr."', async () => {
      await renderNiveis();

      expect(screen.getByText('Pts Attr.')).toBeTruthy();
    });

    it('deve exibir coluna "Pts Apt."', async () => {
      await renderNiveis();

      expect(screen.getByText('Pts Apt.')).toBeTruthy();
    });

    it('deve exibir coluna "Limitador"', async () => {
      await renderNiveis();

      expect(screen.getByText('Limitador')).toBeTruthy();
    });

    it('deve exibir coluna de "Ações"', async () => {
      await renderNiveis();

      expect(screen.getByText('Ações')).toBeTruthy();
    });
  });

  // ----------------------------------------------------------
  // 3. Abertura do drawer
  // ----------------------------------------------------------

  describe('abertura do drawer', () => {
    it('deve abrir o drawer ao clicar em "+ Novo Nível"', async () => {
      const { fixture } = await renderNiveis();

      const botaoNovo = screen.getAllByText(/\+ Novo Nível/i)[0];
      fireEvent.click(botaoNovo.closest('button') ?? botaoNovo);
      fixture.detectChanges();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((fixture.componentInstance as any).drawerVisible()).toBe(true);
    });

    it('deve abrir em modo criação (editMode = false) ao clicar em "+ Novo Nível"', async () => {
      const { fixture } = await renderNiveis();

      const botaoNovo = screen.getAllByText(/\+ Novo Nível/i)[0];
      fireEvent.click(botaoNovo.closest('button') ?? botaoNovo);
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

      // O filteredItems ordena por nivel
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

      // "5" vai casar com nivel=5 e nivel=10 não (String('5').includes('5') = true, String('10').includes('5') = false)
      // nivel=1: String('1').includes('5') = false
      // nivel=5: String('5').includes('5') = true
      // nivel=10: String('10').includes('5') = false
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
  // 8. Fechar drawer
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
      // Form deve ser resetado
      expect(fixture.componentInstance.form.pristine).toBe(true);
    });
  });
});
