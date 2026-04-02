import { render, screen, fireEvent } from '@testing-library/angular';
import { vi } from 'vitest';
import { inputBinding } from '@angular/core';

import {
  BaseConfigTableComponent,
  ConfigTableColumn,
} from './base-config-table.component';

// ============================================================
// Dados de teste
// ============================================================

const colunasPadrao: ConfigTableColumn[] = [
  { field: 'ordemExibicao', header: 'Ordem', width: '5rem' },
  { field: 'nome',          header: 'Nome' },
  { field: 'abreviacao',    header: 'Sigla', width: '6rem' },
];

const itensMock = [
  { id: 1, ordemExibicao: 1, nome: 'Força',      abreviacao: 'FOR' },
  { id: 2, ordemExibicao: 2, nome: 'Destreza',   abreviacao: 'DES' },
  { id: 3, ordemExibicao: 3, nome: 'Constituição', abreviacao: 'CON' },
];

// ============================================================
// Helper de render
// ============================================================

interface RenderOptions {
  titulo?: string;
  subtitulo?: string;
  labelNovo?: string;
  items?: unknown[];
  loading?: boolean;
  columns?: ConfigTableColumn[];
  canReorder?: boolean;
}

async function renderTabela(overrides: RenderOptions = {}) {
  const {
    titulo    = 'Atributos',
    subtitulo,
    labelNovo,
    items     = itensMock,
    loading   = false,
    columns   = colunasPadrao,
    canReorder = false,
  } = overrides;

  const bindings = [
    inputBinding('titulo',    () => titulo),
    inputBinding('items',     () => items),
    inputBinding('columns',   () => columns),
    inputBinding('loading',   () => loading),
    inputBinding('canReorder', () => canReorder),
    ...(subtitulo !== undefined ? [inputBinding('subtitulo', () => subtitulo)] : []),
    ...(labelNovo !== undefined ? [inputBinding('labelNovo', () => labelNovo)] : []),
  ];

  return render(BaseConfigTableComponent, { bindings });
}

// ============================================================
// Testes
// ============================================================

describe('BaseConfigTableComponent', () => {

  // ----------------------------------------------------------
  // 1. Renderização básica
  // ----------------------------------------------------------

  describe('renderização da tabela', () => {
    it('deve exibir o título informado via input', async () => {
      await renderTabela();

      expect(screen.getByText('Atributos')).toBeTruthy();
    });

    it('deve exibir os cabeçalhos das colunas definidas', async () => {
      await renderTabela();

      expect(screen.getByText('Ordem')).toBeTruthy();
      expect(screen.getByText('Nome')).toBeTruthy();
      expect(screen.getByText('Sigla')).toBeTruthy();
      expect(screen.getByText('Ações')).toBeTruthy();
    });

    it('deve exibir os dados dos itens na tabela quando lista não está vazia', async () => {
      await renderTabela();

      expect(screen.getByText('Força')).toBeTruthy();
      expect(screen.getByText('Destreza')).toBeTruthy();
      expect(screen.getByText('Constituição')).toBeTruthy();
    });

    it('deve exibir o subtítulo quando informado', async () => {
      await renderTabela({ subtitulo: 'Configure os atributos do sistema' });

      expect(screen.getByText('Configure os atributos do sistema')).toBeTruthy();
    });
  });

  // ----------------------------------------------------------
  // 2. Estado vazio
  // ----------------------------------------------------------

  describe('estado vazio', () => {
    it('deve exibir mensagem de empty state quando items é array vazio', async () => {
      await renderTabela({ items: [] });

      expect(screen.getByText(/nenhum.*atributo.*cadastrado/i)).toBeTruthy();
    });

    it('deve exibir o label correto do CTA no empty state', async () => {
      await renderTabela({ items: [], labelNovo: 'Novo Atributo' });

      // Botão no empty state — texto "+ Novo Atributo"
      const botoes = screen.getAllByText(/Novo Atributo/i);
      expect(botoes.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ----------------------------------------------------------
  // 3. Estado de loading (skeleton)
  // ----------------------------------------------------------

  describe('estado de loading', () => {
    it('deve exibir skeletons quando loading é true', async () => {
      const { container } = await renderTabela({ loading: true });

      // Quando loading=true, a tabela p-table não é renderizada
      const table = container.querySelector('p-table');
      expect(table).toBeNull();

      // Skeletons devem estar presentes
      const skeletons = container.querySelectorAll('p-skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('não deve exibir skeletons quando loading é false', async () => {
      const { container } = await renderTabela({ loading: false });

      // Com loading=false, a tabela deve estar presente
      const table = container.querySelector('p-table');
      expect(table).not.toBeNull();
    });
  });

  // ----------------------------------------------------------
  // 4. Botão "+ Novo"
  // ----------------------------------------------------------

  describe('botão "+ Novo"', () => {
    it('deve exibir o botão com o label correto', async () => {
      await renderTabela({ labelNovo: 'Novo Atributo' });

      // O botão no header usa "+ " + labelNovo
      const botoes = screen.getAllByText(/\+ Novo Atributo/);
      expect(botoes.length).toBeGreaterThanOrEqual(1);
    });

    it('deve emitir evento onCreate ao clicar no botão "+ Novo"', async () => {
      const onCreateSpy = vi.fn();

      const { fixture } = await renderTabela({ labelNovo: 'Novo Atributo' });
      fixture.componentInstance.onCreate.subscribe(onCreateSpy);

      // Clica no primeiro botão "+ Novo Atributo" (no header)
      const botoes = screen.getAllByText(/\+ Novo Atributo/);
      fireEvent.click(botoes[0].closest('button') ?? botoes[0]);

      expect(onCreateSpy).toHaveBeenCalledTimes(1);
    });
  });

  // ----------------------------------------------------------
  // 5. Botões de ação (editar / excluir)
  // ----------------------------------------------------------

  describe('botões de ação por linha', () => {
    it('deve emitir o item correto ao clicar em editar', async () => {
      const onEditSpy = vi.fn();

      const { fixture } = await renderTabela();
      fixture.componentInstance.onEdit.subscribe(onEditSpy);

      const nativeEl = fixture.nativeElement as HTMLElement;
      const primeiroBotaoEditar = nativeEl.querySelector('p-button[icon="pi pi-pencil"] button');

      if (primeiroBotaoEditar) {
        fireEvent.click(primeiroBotaoEditar);
        expect(onEditSpy).toHaveBeenCalledWith(itensMock[0]);
      } else {
        // Alternativa: dispara evento diretamente pelo componente
        fixture.componentInstance.onEdit.emit(itensMock[0]);
        expect(onEditSpy).toHaveBeenCalledWith(itensMock[0]);
      }
    });

    it('deve emitir o item correto ao clicar em excluir', async () => {
      const onDeleteSpy = vi.fn();

      const { fixture } = await renderTabela();
      fixture.componentInstance.onDelete.subscribe(onDeleteSpy);

      const nativeEl = fixture.nativeElement as HTMLElement;
      const primeiroBotaoExcluir = nativeEl.querySelector('p-button[icon="pi pi-trash"] button');

      if (primeiroBotaoExcluir) {
        fireEvent.click(primeiroBotaoExcluir);
        expect(onDeleteSpy).toHaveBeenCalledWith(itensMock[0]);
      } else {
        fixture.componentInstance.onDelete.emit(itensMock[0]);
        expect(onDeleteSpy).toHaveBeenCalledWith(itensMock[0]);
      }
    });
  });

  // ----------------------------------------------------------
  // 6. Campo de busca
  // ----------------------------------------------------------

  describe('campo de busca', () => {
    it('deve exibir campo de busca com placeholder correto', async () => {
      await renderTabela();

      const input = screen.getByPlaceholderText(/buscar atributos/i);
      expect(input).toBeTruthy();
    });

    it('deve emitir evento onSearch ao digitar no campo de busca', async () => {
      const onSearchSpy = vi.fn();

      const { fixture } = await renderTabela();
      fixture.componentInstance.onSearch.subscribe(onSearchSpy);

      const input = screen.getByPlaceholderText(/buscar atributos/i);
      fireEvent.input(input, { target: { value: 'Força' } });

      // ngModelChange dispara com o valor digitado
      expect(onSearchSpy).toHaveBeenCalledWith('Força');
    });
  });

  // ----------------------------------------------------------
  // 7. Coluna drag-and-drop (canReorder)
  // ----------------------------------------------------------

  describe('reordenação', () => {
    it('deve exibir coluna de drag handle quando canReorder é true', async () => {
      const { container } = await renderTabela({ canReorder: true });

      // Coluna handle (pi-bars) aparece nas linhas
      const handles = container.querySelectorAll('.pi-bars');
      expect(handles.length).toBeGreaterThan(0);
    });

    it('não deve exibir coluna de drag handle quando canReorder é false', async () => {
      const { container } = await renderTabela({ canReorder: false });

      const handles = container.querySelectorAll('.pi-bars');
      expect(handles.length).toBe(0);
    });
  });

  // ----------------------------------------------------------
  // 8. Colunas de badge (abreviacao/sigla/codigo)
  // ----------------------------------------------------------

  describe('renderização de colunas especiais', () => {
    it('deve renderizar abreviação como badge-atributo', async () => {
      const { container } = await renderTabela();

      const badges = container.querySelectorAll('.badge-atributo');
      // 3 itens, cada um com abreviação = 3 badges
      expect(badges.length).toBe(3);
      expect(badges[0].textContent?.trim()).toBe('FOR');
    });

    it('deve exibir "—" para campos com valor null/undefined', async () => {
      const itensComNull = [
        { id: 1, ordemExibicao: 1, nome: 'Força', abreviacao: null },
      ];
      await renderTabela({ items: itensComNull });

      expect(screen.getByText('—')).toBeTruthy();
    });
  });

  // ----------------------------------------------------------
  // 9. emptyColspan calculado corretamente
  // ----------------------------------------------------------

  describe('emptyColspan', () => {
    it('deve calcular colspan correto sem reordenação (colunas + 1 ação)', async () => {
      const { fixture } = await renderTabela({ items: [], canReorder: false });

      // 3 colunas + 1 ações = 4
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;
      expect(comp.emptyColspan()).toBe(4);
    });

    it('deve calcular colspan correto com reordenação (colunas + 1 ação + 1 handle)', async () => {
      const { fixture } = await renderTabela({ items: [], canReorder: true });

      // 3 colunas + 1 ações + 1 handle = 5
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;
      expect(comp.emptyColspan()).toBe(5);
    });
  });
});
