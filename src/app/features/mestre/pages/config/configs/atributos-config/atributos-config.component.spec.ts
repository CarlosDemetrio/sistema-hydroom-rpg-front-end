import { TestBed } from '@angular/core/testing';
import { render, screen, fireEvent } from '@testing-library/angular';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { ConfirmationService } from 'primeng/api';

import { AtributosConfigComponent } from './atributos-config.component';
import { AtributoConfigService } from '@core/services/business/config';
import { ConfigApiService } from '@core/services/api/config-api.service';
import { AtributoConfig } from '@core/models';
import { ToastService } from '@services/toast.service';
import { CurrentGameService } from '@core/services/current-game.service';

// ============================================================
// Dados de teste
// ============================================================

const atributoMock: AtributoConfig = {
  id: 1,
  jogoId: 10,
  nome: 'Força',
  abreviacao: 'FOR',
  descricao: 'Atributo de força física',
  formulaImpeto: null,
  descricaoImpeto: null,
  valorMinimo: 1,
  valorMaximo: 20,
  ordemExibicao: 1,
  dataCriacao: '2024-01-01T00:00:00',
  dataUltimaAtualizacao: '2024-06-01T00:00:00',
};

const atributoDestreza: AtributoConfig = {
  ...atributoMock,
  id: 2,
  nome: 'Destreza',
  abreviacao: 'DES',
  ordemExibicao: 2,
};

// ============================================================
// Helpers para criar mocks
// ============================================================

/**
 * Cria mock do AtributoConfigService.
 * temJogo controla se hasCurrentGame/currentGameId retornam valores válidos —
 * o componente usa this.service.hasCurrentGame() para verificar o jogo atual.
 */
function criarAtributoServiceMock(atributos: AtributoConfig[] = [], temJogo = true) {
  const jogoAtual = temJogo ? { id: 10, nome: 'Campanha Teste', ativo: true } : null;
  return {
    loadItems:       vi.fn().mockReturnValue(of(atributos)),
    createItem:      vi.fn().mockReturnValue(of(atributoMock)),
    updateItem:      vi.fn().mockReturnValue(of(atributoMock)),
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

async function renderAtributos(
  atributos: AtributoConfig[] = [atributoMock, atributoDestreza],
  temJogo = true,
) {
  const atributoServiceMock    = criarAtributoServiceMock(atributos, temJogo);
  const currentGameServiceMock = criarCurrentGameServiceMock(temJogo);
  const toastServiceMock       = criarToastServiceMock();

  const configApiMock = { reordenarAtributos: vi.fn().mockReturnValue(of(void 0)) };

  const result = await render(AtributosConfigComponent, {
    providers: [
      { provide: AtributoConfigService,  useValue: atributoServiceMock },
      { provide: CurrentGameService,     useValue: currentGameServiceMock },
      { provide: ToastService,           useValue: toastServiceMock },
      { provide: ConfigApiService,       useValue: configApiMock },
      // ConfirmationService real necessário para o ConfirmDialog do PrimeNG funcionar
      ConfirmationService,
    ],
  });

  // O ConfirmationService do componente é provido pelo próprio componente (providers: [ConfirmationService])
  // Acessamos via o injector do próprio componente
  const confirmationService = result.fixture.componentRef.injector.get(ConfirmationService);

  return { ...result, atributoServiceMock, toastServiceMock, confirmationService };
}

// ============================================================
// Testes
// ============================================================

describe('AtributosConfigComponent', () => {

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  // ----------------------------------------------------------
  // 1. Carregamento de dados
  // ----------------------------------------------------------

  describe('carregamento de dados', () => {
    it('deve chamar loadItems ao inicializar quando há jogo selecionado', async () => {
      const { atributoServiceMock } = await renderAtributos();

      expect(atributoServiceMock.loadItems).toHaveBeenCalledTimes(1);
    });

    it('deve exibir os atributos carregados na tabela', async () => {
      await renderAtributos();

      expect(screen.getByText('Força')).toBeTruthy();
      expect(screen.getByText('Destreza')).toBeTruthy();
    });

    it('não deve chamar loadItems quando não há jogo selecionado', async () => {
      const { atributoServiceMock } = await renderAtributos([], false);

      expect(atributoServiceMock.loadItems).not.toHaveBeenCalled();
    });

    it('deve exibir aviso de "Nenhum jogo selecionado" quando hasGame é false', async () => {
      await renderAtributos([], false);

      // O componente exibe "Nenhum jogo selecionado" dentro de um parágrafo
      expect(screen.getByText('Nenhum jogo selecionado')).toBeTruthy();
    });
  });

  // ----------------------------------------------------------
  // 2. Abertura do drawer (formulário)
  // ----------------------------------------------------------

  describe('abertura do drawer', () => {
    it('deve abrir o drawer ao clicar no botão "+ Novo Atributo"', async () => {
      const { fixture } = await renderAtributos();

      const botaoNovo = screen.getAllByText(/\+ Novo Atributo/i)[0];
      fireEvent.click(botaoNovo.closest('button') ?? botaoNovo);
      fixture.detectChanges();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((fixture.componentInstance as any).drawerVisible()).toBe(true);
    });

    it('deve colocar o drawer em modo de criação (editMode = false) ao abrir para novo', async () => {
      const { fixture } = await renderAtributos();

      const botaoNovo = screen.getAllByText(/\+ Novo Atributo/i)[0];
      fireEvent.click(botaoNovo.closest('button') ?? botaoNovo);
      fixture.detectChanges();

      expect(fixture.componentInstance.editMode()).toBe(false);
    });

    it('deve colocar o drawer em modo de edição (editMode = true) ao chamar openDrawer com item', async () => {
      const { fixture } = await renderAtributos();

      fixture.componentInstance.openDrawer(atributoMock);
      fixture.detectChanges();

      expect(fixture.componentInstance.editMode()).toBe(true);
    });

    it('deve pré-preencher o formulário com dados do item ao editar', async () => {
      const { fixture } = await renderAtributos();

      fixture.componentInstance.openDrawer(atributoMock);
      fixture.detectChanges();

      expect(fixture.componentInstance.form.get('nome')?.value).toBe('Força');
      expect(fixture.componentInstance.form.get('abreviacao')?.value).toBe('FOR');
    });
  });

  // ----------------------------------------------------------
  // 3. Validações do formulário
  // ----------------------------------------------------------

  describe('validações do formulário', () => {
    it('formulário deve ser inválido quando nome está vazio', async () => {
      const { fixture } = await renderAtributos();

      fixture.componentInstance.openDrawer();
      fixture.componentInstance.form.get('nome')?.setValue('');
      fixture.componentInstance.form.get('abreviacao')?.setValue('FOR');
      fixture.detectChanges();

      expect(fixture.componentInstance.form.get('nome')?.invalid).toBe(true);
    });

    it('formulário deve ser inválido quando abreviação está vazia', async () => {
      const { fixture } = await renderAtributos();

      fixture.componentInstance.openDrawer();
      fixture.componentInstance.form.get('nome')?.setValue('Força');
      fixture.componentInstance.form.get('abreviacao')?.setValue('');
      fixture.detectChanges();

      expect(fixture.componentInstance.form.get('abreviacao')?.invalid).toBe(true);
    });

    it('abreviação com 1 caractere deve ser inválida (mínimo 2)', async () => {
      const { fixture } = await renderAtributos();

      fixture.componentInstance.openDrawer();
      fixture.componentInstance.form.get('abreviacao')?.setValue('F');
      fixture.detectChanges();

      expect(fixture.componentInstance.form.get('abreviacao')?.errors?.['minlength']).toBeTruthy();
    });

    it('abreviação com 6 caracteres deve ser inválida (máximo 5)', async () => {
      const { fixture } = await renderAtributos();

      fixture.componentInstance.openDrawer();
      fixture.componentInstance.form.get('abreviacao')?.setValue('FORCA1');
      fixture.detectChanges();

      expect(fixture.componentInstance.form.get('abreviacao')?.errors?.['maxlength']).toBeTruthy();
    });

    it('abreviação em minúsculas deve ser inválida (deve ser uppercase)', async () => {
      const { fixture } = await renderAtributos();

      fixture.componentInstance.openDrawer();
      fixture.componentInstance.form.get('abreviacao')?.setValue('for');
      fixture.detectChanges();

      expect(fixture.componentInstance.form.get('abreviacao')?.errors?.['uppercase']).toBeTruthy();
    });

    it('formulário válido com nome e abreviação corretos', async () => {
      const { fixture } = await renderAtributos();

      fixture.componentInstance.openDrawer();
      fixture.componentInstance.form.get('nome')?.setValue('Sabedoria');
      fixture.componentInstance.form.get('abreviacao')?.setValue('SAB');
      fixture.detectChanges();

      expect(fixture.componentInstance.form.get('nome')?.valid).toBe(true);
      expect(fixture.componentInstance.form.get('abreviacao')?.valid).toBe(true);
    });
  });

  // ----------------------------------------------------------
  // 4. Submit do formulário
  // ----------------------------------------------------------

  describe('submit do formulário (save)', () => {
    it('deve chamar service.createItem ao salvar formulário válido no modo criação', async () => {
      const { fixture, atributoServiceMock } = await renderAtributos();

      fixture.componentInstance.openDrawer(); // modo criação
      fixture.componentInstance.form.get('nome')?.setValue('Sabedoria');
      fixture.componentInstance.form.get('abreviacao')?.setValue('SAB');
      fixture.componentInstance.form.get('ordemExibicao')?.setValue(3);
      fixture.detectChanges();

      fixture.componentInstance.save();

      expect(atributoServiceMock.createItem).toHaveBeenCalledTimes(1);
    });

    it('deve chamar service.updateItem ao salvar formulário válido no modo edição', async () => {
      const { fixture, atributoServiceMock } = await renderAtributos();

      fixture.componentInstance.openDrawer(atributoMock); // modo edição
      fixture.componentInstance.form.get('nome')?.setValue('Força Modificada');
      fixture.detectChanges();

      fixture.componentInstance.save();

      expect(atributoServiceMock.updateItem).toHaveBeenCalledWith(
        atributoMock.id,
        expect.objectContaining({ nome: 'Força Modificada' }),
      );
    });

    it('não deve chamar service.createItem quando formulário é inválido', async () => {
      const { fixture, atributoServiceMock, toastServiceMock } = await renderAtributos();

      fixture.componentInstance.openDrawer(); // nome vazio = inválido
      fixture.componentInstance.form.get('nome')?.setValue('');
      fixture.detectChanges();

      fixture.componentInstance.save();

      expect(atributoServiceMock.createItem).not.toHaveBeenCalled();
      expect(toastServiceMock.warning).toHaveBeenCalled();
    });

    it('deve fechar o drawer após salvar com sucesso', async () => {
      const { fixture } = await renderAtributos();

      fixture.componentInstance.openDrawer();
      fixture.componentInstance.form.get('nome')?.setValue('Sabedoria');
      fixture.componentInstance.form.get('abreviacao')?.setValue('SAB');
      fixture.componentInstance.form.get('ordemExibicao')?.setValue(3);
      fixture.detectChanges();

      fixture.componentInstance.save();
      fixture.detectChanges();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((fixture.componentInstance as any).drawerVisible()).toBe(false);
    });
  });

  // ----------------------------------------------------------
  // 5. Exclusão com confirmação
  // ----------------------------------------------------------

  describe('confirmDelete', () => {
    it('deve chamar confirmationService.confirm ao tentar excluir', async () => {
      // O ConfirmationService é provido pelo próprio componente (providers: [ConfirmationService])
      // Acessamos via o injector do componente para garantir o spy no provider correto
      const { fixture, confirmationService } = await renderAtributos();
      const confirmSpy = vi.spyOn(confirmationService, 'confirm');

      fixture.componentInstance.confirmDelete(atributoMock.id);

      expect(confirmSpy).toHaveBeenCalledTimes(1);
    });

    it('não deve chamar service.deleteItem antes da confirmação', async () => {
      const { fixture, atributoServiceMock, confirmationService } = await renderAtributos();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.spyOn(confirmationService, 'confirm').mockImplementation((() => {}) as any);

      fixture.componentInstance.confirmDelete(atributoMock.id);

      expect(atributoServiceMock.deleteItem).not.toHaveBeenCalled();
    });

    it('deve chamar service.deleteItem quando usuário confirma a exclusão', async () => {
      const { fixture, atributoServiceMock, confirmationService } = await renderAtributos();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.spyOn(confirmationService, 'confirm').mockImplementation(((config: any) => { config.accept?.(); }) as any);

      fixture.componentInstance.confirmDelete(atributoMock.id);

      expect(atributoServiceMock.deleteItem).toHaveBeenCalledWith(atributoMock.id);
    });
  });

  // ----------------------------------------------------------
  // 6. Filtro de busca
  // ----------------------------------------------------------

  describe('filtro de busca (filteredItems)', () => {
    it('deve retornar todos os itens quando busca está vazia', async () => {
      const { fixture } = await renderAtributos();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;
      comp.searchQuery.set('');
      fixture.detectChanges();

      // items foi populado pelo loadItems (mock retorna [atributoMock, atributoDestreza])
      expect(comp.filteredItems().length).toBe(2);
    });

    it('deve filtrar atributos pelo nome (case-insensitive)', async () => {
      // Usa dados sem descrição para evitar match cruzado
      const semDescricao: AtributoConfig[] = [
        { ...atributoMock, descricao: null as unknown as string },
        { ...atributoDestreza, descricao: null as unknown as string },
      ];
      const { fixture } = await renderAtributos(semDescricao);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;
      comp.searchQuery.set('força');
      fixture.detectChanges();

      const filtered = comp.filteredItems();
      expect(filtered.length).toBe(1);
      expect(filtered[0].nome).toBe('Força');
    });

    it('deve filtrar atributos pela abreviação', async () => {
      const { fixture } = await renderAtributos();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;
      comp.searchQuery.set('des');
      fixture.detectChanges();

      const filtered = comp.filteredItems();
      expect(filtered.length).toBe(1);
      expect(filtered[0].abreviacao).toBe('DES');
    });
  });
});
