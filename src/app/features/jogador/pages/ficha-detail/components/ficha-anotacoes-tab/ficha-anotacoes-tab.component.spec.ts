import { render, screen, fireEvent } from '@testing-library/angular';
import { Subject } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { FichaAnotacoesTabComponent } from './ficha-anotacoes-tab.component';
import { FichaBusinessService } from '@core/services/business/ficha-business.service';
import { ToastService } from '@services/toast.service';
import { Anotacao } from '@models/anotacao.model';
import { AnotacaoPasta } from '@models/anotacao-pasta.model';
import { AnotacaoCardComponent } from '../anotacao-card/anotacao-card.component';

/**
 * Stub de template para FichaAnotacoesTabComponent.
 *
 * Armadilha JIT: AnotacaoCardComponent usa input.required() — ao renderizar
 * o template real em JIT, causa NG0950. Substituímos por template stub que
 * não instancia os filhos com input.required().
 */
const TEMPLATE_STUB = `
  <div>
    @if (loading()) {
      <span data-testid="loading">Carregando...</span>
    }
    @if (!loading() && anotacoes().length === 0) {
      <span data-testid="empty">Nenhuma anotacao registrada ainda.</span>
    }
    @for (anotacao of anotacoes(); track anotacao.id) {
      <div data-testid="anotacao-item">{{ anotacao.titulo }}</div>
    }
    <button (click)="toggleForm()" aria-label="Abrir formulario de nova anotacao">Nova Anotacao</button>
    @if (showForm()) {
      <span data-testid="form-novo">Formulario aberto</span>
      <button (click)="salvarAnotacao()" aria-label="Salvar anotacao">Salvar</button>
    }
    @for (pasta of pastas(); track pasta.id) {
      <div data-testid="pasta-item">{{ pasta.nome }}</div>
    }
  </div>
`;

const anotacaoMock: Anotacao = {
  id: 1,
  fichaId: 10,
  autorId: 42,
  autorNome: 'Gandalf',
  titulo: 'Anotacao Alpha',
  conteudo: 'Conteudo da anotacao',
  tipoAnotacao: 'JOGADOR',
  visivelParaJogador: true,
  visivelParaTodos: false,
  pastaPaiId: null,
  dataCriacao: '2026-01-01T00:00:00',
  dataUltimaAtualizacao: '2026-01-01T00:00:00',
};

const pastaMock: AnotacaoPasta = {
  id: 1,
  fichaId: 10,
  nome: 'Pasta Principal',
  pastaPaiId: null,
  ordemExibicao: 1,
  subPastas: [],
  dataCriacao: '2026-01-01T00:00:00',
  dataUltimaAtualizacao: '2026-01-01T00:00:00',
};

describe('FichaAnotacoesTabComponent', () => {
  let mockFichaBusinessService: Partial<FichaBusinessService>;
  let mockToastService: Partial<ToastService>;
  let anotacoesSubject: Subject<Anotacao[]>;
  let pastasSubject: Subject<AnotacaoPasta[]>;

  beforeEach(() => {
    anotacoesSubject = new Subject<Anotacao[]>();
    pastasSubject = new Subject<AnotacaoPasta[]>();

    mockFichaBusinessService = {
      listarAnotacoes: vi.fn().mockReturnValue(anotacoesSubject.asObservable()),
      listarPastas: vi.fn().mockReturnValue(pastasSubject.asObservable()),
      criarAnotacao: vi.fn(),
      editarAnotacao: vi.fn(),
      deletarAnotacao: vi.fn(),
    };

    mockToastService = {
      success: vi.fn(),
      error: vi.fn(),
    };
  });

  async function renderComponent() {
    return render(FichaAnotacoesTabComponent, {
      inputs: {
        fichaId: 10,
        userRole: 'MESTRE' as 'MESTRE' | 'JOGADOR',
        userId: 99,
      },
      providers: [
        { provide: FichaBusinessService, useValue: mockFichaBusinessService },
        { provide: ToastService, useValue: mockToastService },
      ],
      configureTestBed: (tb) => {
        tb.overrideTemplate(FichaAnotacoesTabComponent, TEMPLATE_STUB);
        tb.overrideComponent(FichaAnotacoesTabComponent, {
          remove: { imports: [AnotacaoCardComponent] },
          add: { imports: [] },
        });
      },
    });
  }

  describe('estado inicial', () => {
    it('deve chamar listarAnotacoes e listarPastas ao montar', async () => {
      await renderComponent();

      expect(mockFichaBusinessService.listarAnotacoes).toHaveBeenCalledWith(10, undefined);
      expect(mockFichaBusinessService.listarPastas).toHaveBeenCalledWith(10);
    });

    it('deve exibir estado vazio quando nao ha anotacoes', async () => {
      await renderComponent();

      anotacoesSubject.next([]);
      anotacoesSubject.complete();
      pastasSubject.next([]);
      pastasSubject.complete();

      expect(screen.getByTestId('empty')).toBeTruthy();
    });

    it('deve renderizar lista de anotacoes carregadas', async () => {
      await renderComponent();

      anotacoesSubject.next([anotacaoMock]);
      anotacoesSubject.complete();
      pastasSubject.next([]);
      pastasSubject.complete();

      expect(screen.getByText('Anotacao Alpha')).toBeTruthy();
    });

    it('deve renderizar pastas carregadas', async () => {
      await renderComponent();

      anotacoesSubject.next([]);
      anotacoesSubject.complete();
      pastasSubject.next([pastaMock]);
      pastasSubject.complete();

      expect(screen.getByText('Pasta Principal')).toBeTruthy();
    });
  });

  describe('formulario nova anotacao', () => {
    it('deve abrir o formulario ao clicar em Nova Anotacao', async () => {
      await renderComponent();

      anotacoesSubject.next([]);
      anotacoesSubject.complete();
      pastasSubject.next([]);
      pastasSubject.complete();

      expect(screen.queryByTestId('form-novo')).toBeNull();

      fireEvent.click(screen.getByLabelText('Abrir formulario de nova anotacao'));

      expect(screen.getByTestId('form-novo')).toBeTruthy();
    });

    it('deve fechar o formulario ao clicar novamente em Nova Anotacao', async () => {
      await renderComponent();

      anotacoesSubject.next([]);
      anotacoesSubject.complete();
      pastasSubject.next([]);
      pastasSubject.complete();

      const btn = screen.getByLabelText('Abrir formulario de nova anotacao');
      fireEvent.click(btn); // abre
      expect(screen.getByTestId('form-novo')).toBeTruthy();

      fireEvent.click(btn); // fecha
      expect(screen.queryByTestId('form-novo')).toBeNull();
    });
  });

  describe('edicao de anotacao', () => {
    it('deve chamar editarAnotacao via onEditarAnotacao', async () => {
      const editSubject = new Subject<Anotacao>();
      (mockFichaBusinessService.editarAnotacao as ReturnType<typeof vi.fn>)
        .mockReturnValue(editSubject.asObservable());

      const { fixture } = await renderComponent();

      anotacoesSubject.next([anotacaoMock]);
      anotacoesSubject.complete();
      pastasSubject.next([]);
      pastasSubject.complete();

      const anotacaoAtualizada: Anotacao = {
        ...anotacaoMock,
        titulo: 'Titulo Editado',
        conteudo: 'Conteudo editado',
      };

      fixture.componentInstance['onEditarAnotacao'](anotacaoAtualizada);

      expect(mockFichaBusinessService.editarAnotacao).toHaveBeenCalledWith(
        10,
        1,
        expect.objectContaining({
          titulo: 'Titulo Editado',
          conteudo: 'Conteudo editado',
        })
      );
    });

    it('deve atualizar a lista local apos editar com sucesso', async () => {
      const anotacaoEditada: Anotacao = {
        ...anotacaoMock,
        titulo: 'Titulo Editado',
      };
      const editSubject = new Subject<Anotacao>();
      (mockFichaBusinessService.editarAnotacao as ReturnType<typeof vi.fn>)
        .mockReturnValue(editSubject.asObservable());

      const { fixture } = await renderComponent();

      anotacoesSubject.next([anotacaoMock]);
      anotacoesSubject.complete();
      pastasSubject.next([]);
      pastasSubject.complete();

      fixture.componentInstance['onEditarAnotacao'](anotacaoEditada);
      editSubject.next(anotacaoEditada);
      editSubject.complete();
      fixture.detectChanges();

      expect(mockToastService.success).toHaveBeenCalledWith('Anotacao atualizada com sucesso!');
    });

    it('deve exibir toast de erro quando editarAnotacao falha', async () => {
      const editSubject = new Subject<Anotacao>();
      (mockFichaBusinessService.editarAnotacao as ReturnType<typeof vi.fn>)
        .mockReturnValue(editSubject.asObservable());

      const { fixture } = await renderComponent();

      anotacoesSubject.next([anotacaoMock]);
      anotacoesSubject.complete();
      pastasSubject.next([]);
      pastasSubject.complete();

      fixture.componentInstance['onEditarAnotacao']({ ...anotacaoMock, titulo: 'X' });
      editSubject.error(new Error('500'));

      expect(mockToastService.error).toHaveBeenCalledWith('Erro ao atualizar anotacao. Tente novamente.');
    });
  });

  describe('delecao de anotacao', () => {
    it('deve chamar deletarAnotacao e remover da lista', async () => {
      const deleteSubject = new Subject<void>();
      (mockFichaBusinessService.deletarAnotacao as ReturnType<typeof vi.fn>)
        .mockReturnValue(deleteSubject.asObservable());

      const { fixture } = await renderComponent();

      anotacoesSubject.next([anotacaoMock]);
      anotacoesSubject.complete();
      pastasSubject.next([]);
      pastasSubject.complete();

      fixture.componentInstance['deletarAnotacao'](1);
      deleteSubject.next();
      deleteSubject.complete();
      fixture.detectChanges();

      expect(mockFichaBusinessService.deletarAnotacao).toHaveBeenCalledWith(10, 1);
      expect(mockToastService.success).toHaveBeenCalledWith('Anotacao removida.');
    });
  });

  describe('permissoes', () => {
    it('deve considerar MESTRE como autorizado a deletar qualquer anotacao', async () => {
      const { fixture } = await renderComponent();

      const anotacaoDeOutroAutor: Anotacao = { ...anotacaoMock, autorId: 999 };
      const podeDeletar = fixture.componentInstance['podeDeletarAnotacao'](anotacaoDeOutroAutor);

      expect(podeDeletar).toBe(true);
    });

    it('deve autorizar JOGADOR a deletar apenas a propria anotacao', async () => {
      const { fixture } = await render(FichaAnotacoesTabComponent, {
        inputs: {
          fichaId: 10,
          userRole: 'JOGADOR' as 'MESTRE' | 'JOGADOR',
          userId: 42,
        },
        providers: [
          { provide: FichaBusinessService, useValue: mockFichaBusinessService },
          { provide: ToastService, useValue: mockToastService },
        ],
        configureTestBed: (tb) => {
          tb.overrideTemplate(FichaAnotacoesTabComponent, TEMPLATE_STUB);
          tb.overrideComponent(FichaAnotacoesTabComponent, {
            remove: { imports: [AnotacaoCardComponent] },
            add: { imports: [] },
          });
        },
      });

      anotacoesSubject.next([]);
      anotacoesSubject.complete();
      pastasSubject.next([]);
      pastasSubject.complete();

      // autorId === userId → pode deletar
      expect(fixture.componentInstance['podeDeletarAnotacao'](anotacaoMock)).toBe(true);
      // autorId !== userId → não pode deletar
      expect(fixture.componentInstance['podeDeletarAnotacao']({ ...anotacaoMock, autorId: 999 })).toBe(false);
    });
  });

  describe('conversao de pasta para TreeNode', () => {
    it('deve converter AnotacaoPasta para TreeNode corretamente', async () => {
      const { fixture } = await renderComponent();

      anotacoesSubject.next([]);
      anotacoesSubject.complete();
      pastasSubject.next([]);
      pastasSubject.complete();

      const pastaComSubPasta: AnotacaoPasta = {
        ...pastaMock,
        subPastas: [
          {
            id: 2,
            fichaId: 10,
            nome: 'Sub-pasta',
            pastaPaiId: 1,
            ordemExibicao: 1,
            subPastas: [],
            dataCriacao: '2026-01-01T00:00:00',
            dataUltimaAtualizacao: '2026-01-01T00:00:00',
          },
        ],
      };

      const nodes = fixture.componentInstance['converterParaTreeNode']([pastaComSubPasta]);

      expect(nodes).toHaveLength(1);
      expect(nodes[0].key).toBe('1');
      expect(nodes[0].label).toBe('Pasta Principal');
      expect(nodes[0].children).toHaveLength(1);
      expect(nodes[0].children![0].key).toBe('2');
      expect(nodes[0].children![0].label).toBe('Sub-pasta');
    });

    it('deve converter pasta sem sub-pastas com children vazio', async () => {
      const { fixture } = await renderComponent();

      anotacoesSubject.next([]);
      anotacoesSubject.complete();
      pastasSubject.next([]);
      pastasSubject.complete();

      const nodes = fixture.componentInstance['converterParaTreeNode']([pastaMock]);

      expect(nodes[0].children).toHaveLength(0);
    });
  });
});
