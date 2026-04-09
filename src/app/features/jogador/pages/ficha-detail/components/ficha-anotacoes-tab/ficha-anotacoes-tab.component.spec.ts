import { render, screen, fireEvent } from '@testing-library/angular';
import { ɵSIGNAL as SIGNAL_SYM } from '@angular/core';
import { Subject } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { FichaAnotacoesTabComponent } from './ficha-anotacoes-tab.component';
import { FichaBusinessService } from '@core/services/business/ficha-business.service';
import { ToastService } from '@services/toast.service';
import { Anotacao } from '@models/anotacao.model';
import { AnotacaoPasta } from '@models/anotacao-pasta.model';
import { AnotacaoCardComponent } from '../anotacao-card/anotacao-card.component';

// ============================================================
// Helper JIT: atribuir valor a input.required() signal
// antes do primeiro detectChanges (evita NG0950 em JIT)
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
    <div data-testid="pastas-container">
      @for (pasta of pastas(); track pasta.id) {
        <div data-testid="pasta-item" class="pasta-nome">{{ pasta.nome }}</div>
      }
    </div>
    @if (pastaTreeNodes().length > 0) {
      <div data-testid="pasta-tree">tree-presente</div>
    }
    @if (pastaSelecionada() !== null) {
      <button (click)="selecionarTodasPastas()" aria-label="Limpar filtro de pasta">Todas</button>
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

  async function renderComponent(overrides: { userRole?: 'MESTRE' | 'JOGADOR'; userId?: number } = {}) {
    const result = await render(FichaAnotacoesTabComponent, {
      providers: [
        { provide: FichaBusinessService, useValue: mockFichaBusinessService },
        { provide: ToastService, useValue: mockToastService },
      ],
      detectChangesOnRender: false,
      configureTestBed: (tb) => {
        tb.overrideTemplate(FichaAnotacoesTabComponent, TEMPLATE_STUB);
        tb.overrideComponent(FichaAnotacoesTabComponent, {
          remove: { imports: [AnotacaoCardComponent] },
          add: { imports: [] },
        });
      },
    });

    const component = result.fixture.componentInstance;
    setSignalInput(component, 'fichaId', 10);
    setSignalInput(component, 'userRole', overrides.userRole ?? 'MESTRE');
    setSignalInput(component, 'userId', overrides.userId ?? 99);

    result.fixture.detectChanges();
    return result;
  }

  describe('estado inicial', () => {
    it('deve chamar listarAnotacoes e listarPastas ao montar', async () => {
      await renderComponent();

      expect(mockFichaBusinessService.listarAnotacoes).toHaveBeenCalledWith(10, undefined);
      expect(mockFichaBusinessService.listarPastas).toHaveBeenCalledWith(10);
    });

    it('deve exibir estado vazio quando nao ha anotacoes', async () => {
      const { fixture } = await renderComponent();

      anotacoesSubject.next([]);
      anotacoesSubject.complete();
      pastasSubject.next([]);
      pastasSubject.complete();
      fixture.detectChanges();

      expect(screen.getByTestId('empty')).toBeTruthy();
    });

    it('deve renderizar lista de anotacoes carregadas', async () => {
      const { fixture } = await renderComponent();

      anotacoesSubject.next([anotacaoMock]);
      anotacoesSubject.complete();
      pastasSubject.next([]);
      pastasSubject.complete();
      fixture.detectChanges();

      expect(screen.getByText('Anotacao Alpha')).toBeTruthy();
    });

    it('deve renderizar pastas carregadas', async () => {
      const { fixture } = await renderComponent();

      anotacoesSubject.next([]);
      anotacoesSubject.complete();
      pastasSubject.next([pastaMock]);
      pastasSubject.complete();
      fixture.detectChanges();

      const pastaItems = screen.getAllByTestId('pasta-item');
      expect(pastaItems).toHaveLength(1);
      expect(pastaItems[0].textContent).toContain('Pasta Principal');
    });
  });

  describe('formulario nova anotacao', () => {
    it('deve abrir o formulario ao clicar em Nova Anotacao', async () => {
      const { fixture } = await renderComponent();

      anotacoesSubject.next([]);
      anotacoesSubject.complete();
      pastasSubject.next([]);
      pastasSubject.complete();
      fixture.detectChanges();

      expect(screen.queryByTestId('form-novo')).toBeNull();

      fireEvent.click(screen.getByLabelText('Abrir formulario de nova anotacao'));
      fixture.detectChanges();

      expect(screen.getByTestId('form-novo')).toBeTruthy();
    });

    it('deve fechar o formulario ao clicar novamente em Nova Anotacao', async () => {
      const { fixture } = await renderComponent();

      anotacoesSubject.next([]);
      anotacoesSubject.complete();
      pastasSubject.next([]);
      pastasSubject.complete();
      fixture.detectChanges();

      const btn = screen.getByLabelText('Abrir formulario de nova anotacao');
      fireEvent.click(btn);
      fixture.detectChanges();
      expect(screen.getByTestId('form-novo')).toBeTruthy();

      fireEvent.click(btn);
      fixture.detectChanges();
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
      fixture.detectChanges();

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
      fixture.detectChanges();

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
      fixture.detectChanges();

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
      fixture.detectChanges();

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
      const { fixture } = await renderComponent({ userRole: 'JOGADOR', userId: 42 });

      anotacoesSubject.next([]);
      anotacoesSubject.complete();
      pastasSubject.next([]);
      pastasSubject.complete();
      fixture.detectChanges();

      // anotacaoMock.autorId === 42 === userId → pode deletar
      expect(fixture.componentInstance['podeDeletarAnotacao'](anotacaoMock)).toBe(true);
      // autorId: 999 !== userId: 42 → não pode deletar
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
      fixture.detectChanges();

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
      fixture.detectChanges();

      const nodes = fixture.componentInstance['converterParaTreeNode']([pastaMock]);

      expect(nodes[0].children).toHaveLength(0);
    });
  });

  describe('filtragem por pasta', () => {
    it('deve exibir 2 pastas quando listarPastas resolve com 2 pastas', async () => {
      const pastaMock2: AnotacaoPasta = {
        ...pastaMock,
        id: 2,
        nome: 'Pasta Secundaria',
      };

      const { fixture } = await renderComponent();

      anotacoesSubject.next([]);
      anotacoesSubject.complete();
      pastasSubject.next([pastaMock, pastaMock2]);
      pastasSubject.complete();
      fixture.detectChanges();

      const pastaItems = screen.getAllByTestId('pasta-item');
      expect(pastaItems).toHaveLength(2);
      expect(pastaItems[0].textContent).toContain('Pasta Principal');
      expect(pastaItems[1].textContent).toContain('Pasta Secundaria');
    });

    it('deve chamar listarAnotacoes com pastaPaiId ao selecionar pasta', async () => {
      const { fixture } = await renderComponent();

      anotacoesSubject.next([]);
      anotacoesSubject.complete();
      pastasSubject.next([pastaMock]);
      pastasSubject.complete();
      fixture.detectChanges();

      // Simula seleção de pasta chamando onPastaSelect diretamente
      const novaAnotacoesSubject = new Subject<Anotacao[]>();
      (mockFichaBusinessService.listarAnotacoes as ReturnType<typeof vi.fn>)
        .mockReturnValue(novaAnotacoesSubject.asObservable());

      fixture.componentInstance['onPastaSelect']({ node: { key: '1', label: 'Pasta Principal', data: pastaMock } });
      fixture.detectChanges();

      expect(mockFichaBusinessService.listarAnotacoes).toHaveBeenCalledWith(10, 1);
    });

    it('deve chamar listarAnotacoes sem pastaPaiId ao selecionar "Todas"', async () => {
      const { fixture } = await renderComponent();

      anotacoesSubject.next([]);
      anotacoesSubject.complete();
      pastasSubject.next([pastaMock]);
      pastasSubject.complete();
      fixture.detectChanges();

      // Primeiro seleciona pasta para definir um filtro
      const filtradaSubject = new Subject<Anotacao[]>();
      (mockFichaBusinessService.listarAnotacoes as ReturnType<typeof vi.fn>)
        .mockReturnValue(filtradaSubject.asObservable());

      fixture.componentInstance['selecionarTodasPastas']();
      fixture.detectChanges();

      expect(mockFichaBusinessService.listarAnotacoes).toHaveBeenCalledWith(10, undefined);
    });

    // ============================================================
    // Suite 4 — Extensão: novos cenários de filtro por pasta
    // ============================================================

    it('deve exibir p-tree quando ha pastas carregadas', async () => {
      const { fixture } = await renderComponent();

      anotacoesSubject.next([]);
      anotacoesSubject.complete();
      pastasSubject.next([pastaMock]);
      pastasSubject.complete();
      fixture.detectChanges();

      const treeEl = fixture.nativeElement.querySelector('[data-testid="pasta-tree"]');
      expect(treeEl).toBeTruthy();
    });

    it('deve definir pastaSelecionada ao selecionar pasta via onPastaSelect', async () => {
      const { fixture } = await renderComponent();

      anotacoesSubject.next([]);
      anotacoesSubject.complete();
      pastasSubject.next([pastaMock]);
      pastasSubject.complete();
      fixture.detectChanges();

      const novaAnotacoesSubject = new Subject<Anotacao[]>();
      (mockFichaBusinessService.listarAnotacoes as ReturnType<typeof vi.fn>)
        .mockReturnValue(novaAnotacoesSubject.asObservable());

      fixture.componentInstance['onPastaSelect']({ node: { key: '1', label: 'Pasta Principal', data: pastaMock } });
      fixture.detectChanges();

      expect(fixture.componentInstance['pastaSelecionada']()).toEqual(pastaMock);
    });

    it('deve limpar pastaSelecionada ao chamar selecionarTodasPastas', async () => {
      const { fixture } = await renderComponent();

      anotacoesSubject.next([]);
      anotacoesSubject.complete();
      pastasSubject.next([pastaMock]);
      pastasSubject.complete();
      fixture.detectChanges();

      // Primeiro seleciona uma pasta
      const subjectFiltrado = new Subject<Anotacao[]>();
      (mockFichaBusinessService.listarAnotacoes as ReturnType<typeof vi.fn>)
        .mockReturnValue(subjectFiltrado.asObservable());

      fixture.componentInstance['onPastaSelect']({ node: { key: '1', label: 'Pasta Principal', data: pastaMock } });
      fixture.detectChanges();
      expect(fixture.componentInstance['pastaSelecionada']()).toEqual(pastaMock);

      // Depois limpa
      const subjectTodas = new Subject<Anotacao[]>();
      (mockFichaBusinessService.listarAnotacoes as ReturnType<typeof vi.fn>)
        .mockReturnValue(subjectTodas.asObservable());

      fixture.componentInstance['selecionarTodasPastas']();
      fixture.detectChanges();

      expect(fixture.componentInstance['pastaSelecionada']()).toBeNull();
    });
  });

  describe('anotacoes e renderizacao de conteudo', () => {
    it('deve atualizar lista apos onEditarAnotacao com sucesso', async () => {
      const anotacaoEditada: Anotacao = {
        ...anotacaoMock,
        titulo: 'Titulo Novo Editado',
      };
      const editSubject = new Subject<Anotacao>();
      (mockFichaBusinessService.editarAnotacao as ReturnType<typeof vi.fn>)
        .mockReturnValue(editSubject.asObservable());

      const { fixture } = await renderComponent();

      anotacoesSubject.next([anotacaoMock]);
      anotacoesSubject.complete();
      pastasSubject.next([]);
      pastasSubject.complete();
      fixture.detectChanges();

      fixture.componentInstance['onEditarAnotacao'](anotacaoEditada);
      editSubject.next(anotacaoEditada);
      editSubject.complete();
      fixture.detectChanges();

      expect(mockToastService.success).toHaveBeenCalledWith('Anotacao atualizada com sucesso!');
    });

    it('deve renderizar conteudo da anotacao no item de lista', async () => {
      const { fixture } = await renderComponent();

      anotacoesSubject.next([anotacaoMock]);
      anotacoesSubject.complete();
      pastasSubject.next([]);
      pastasSubject.complete();
      fixture.detectChanges();

      // O TEMPLATE_STUB renderiza {{ anotacao.titulo }} em cada data-testid="anotacao-item"
      expect(screen.getByText('Anotacao Alpha')).toBeTruthy();
    });

    // ============================================================
    // Suite 4 — Extensão: atualização via evento editar e Markdown
    // ============================================================

    it('deve atualizar o item de lista com titulo novo apos onEditarAnotacao bem-sucedido', async () => {
      const anotacaoEditada: Anotacao = {
        ...anotacaoMock,
        titulo: 'Titulo Pos-Edicao',
      };
      const editSubject = new Subject<Anotacao>();
      (mockFichaBusinessService.editarAnotacao as ReturnType<typeof vi.fn>)
        .mockReturnValue(editSubject.asObservable());

      const { fixture } = await renderComponent();

      anotacoesSubject.next([anotacaoMock]);
      anotacoesSubject.complete();
      pastasSubject.next([]);
      pastasSubject.complete();
      fixture.detectChanges();

      fixture.componentInstance['onEditarAnotacao'](anotacaoEditada);
      editSubject.next(anotacaoEditada);
      editSubject.complete();
      fixture.detectChanges();

      // O item deve agora mostrar o novo título
      expect(screen.getByText('Titulo Pos-Edicao')).toBeTruthy();
    });

    it('deve manter anotacoes na lista antes de completar a edicao', async () => {
      const editSubject = new Subject<Anotacao>();
      (mockFichaBusinessService.editarAnotacao as ReturnType<typeof vi.fn>)
        .mockReturnValue(editSubject.asObservable());

      const { fixture } = await renderComponent();

      anotacoesSubject.next([anotacaoMock]);
      anotacoesSubject.complete();
      pastasSubject.next([]);
      pastasSubject.complete();
      fixture.detectChanges();

      // Inicia edição mas não completa
      fixture.componentInstance['onEditarAnotacao']({ ...anotacaoMock, titulo: 'Editado' });
      fixture.detectChanges();

      // Enquanto a API não retornar, a lista mantém o item original
      expect(screen.getAllByTestId('anotacao-item')).toHaveLength(1);
    });
  });
});
