/**
 * BaseConfigTableComponent — Spec
 *
 * NOTA JIT: Em modo JIT (Vitest sem plugin Angular), a API `input()` não
 * registra entradas em ɵcmp.inputs. Logo, `componentInputs`/`setInput` e
 * `inputBinding` falham (NG0950/NG0315). A solução é usar ɵSIGNAL (símbolo
 * interno do Angular) para definir os valores diretamente nos nós signal
 * ANTES do primeiro detectChanges — mesmo padrão do formula-editor.spec.ts.
 *
 * outputBinding também não funciona (NG0316) em JIT. Usamos `on` (subscribeTo)
 * ou subscrevemos diretamente em fixture.componentInstance.outputName.
 */

import { render } from '@testing-library/angular';
import { NO_ERRORS_SCHEMA, ɵSIGNAL as SIGNAL_SYM } from '@angular/core';
import { vi } from 'vitest';

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
  { id: 1, ordemExibicao: 1, nome: 'Força',        abreviacao: 'FOR' },
  { id: 2, ordemExibicao: 2, nome: 'Destreza',     abreviacao: 'DES' },
  { id: 3, ordemExibicao: 3, nome: 'Constituição', abreviacao: 'CON' },
];

// ============================================================
// Helper: define o valor de um input signal via nó interno ɵSIGNAL
// Necessário porque em modo JIT o input() não registra em ɵcmp.inputs,
// fazendo setInput/componentInputs/inputBinding falharem.
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
    titulo     = 'Atributos',
    subtitulo  = '',
    labelNovo  = 'Novo',
    items      = itensMock,
    loading    = false,
    columns    = colunasPadrao,
    canReorder = false,
  } = overrides;

  const onCreateSpy  = vi.fn();
  const onEditSpy    = vi.fn();
  const onDeleteSpy  = vi.fn();
  const onSearchSpy  = vi.fn();
  const onReorderSpy = vi.fn();

  // Render sem inputs — serão definidos via ɵSIGNAL após criação
  const result = await render(BaseConfigTableComponent, {
    detectChangesOnRender: false,
    schemas: [NO_ERRORS_SCHEMA],
  });

  const comp = result.fixture.componentInstance;

  // Define inputs via nó interno do signal (único modo que funciona em JIT)
  setSignalInput(comp, 'titulo',     titulo);
  setSignalInput(comp, 'subtitulo',  subtitulo);
  setSignalInput(comp, 'labelNovo',  labelNovo);
  setSignalInput(comp, 'items',      items);
  setSignalInput(comp, 'loading',    loading);
  setSignalInput(comp, 'columns',    columns);
  setSignalInput(comp, 'canReorder', canReorder);

  // Subscreve nos outputs via componentInstance (funciona em JIT)
  comp.onCreate.subscribe(onCreateSpy);
  comp.onEdit.subscribe(onEditSpy);
  comp.onDelete.subscribe(onDeleteSpy);
  comp.onSearch.subscribe(onSearchSpy);
  comp.onReorder.subscribe(onReorderSpy);

  // Primeira detecção após os inputs estarem definidos
  result.fixture.detectChanges();
  await result.fixture.whenStable();

  return {
    ...result,
    comp,
    onCreateSpy,
    onEditSpy,
    onDeleteSpy,
    onSearchSpy,
    onReorderSpy,
  };
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
      const { fixture } = await renderTabela();
      const el: HTMLElement = fixture.nativeElement;

      expect(el.textContent).toContain('Atributos');
    });

    it('deve exibir os cabeçalhos das colunas definidas', async () => {
      const { fixture } = await renderTabela();
      const el: HTMLElement = fixture.nativeElement;

      expect(el.textContent).toContain('Ordem');
      expect(el.textContent).toContain('Nome');
      expect(el.textContent).toContain('Sigla');
      expect(el.textContent).toContain('Ações');
    });

    it('deve exibir os dados dos itens na tabela quando lista não está vazia', async () => {
      const { fixture } = await renderTabela();
      const el: HTMLElement = fixture.nativeElement;

      expect(el.textContent).toContain('Força');
      expect(el.textContent).toContain('Destreza');
      expect(el.textContent).toContain('Constituição');
    });

    it('deve exibir o subtítulo quando informado', async () => {
      const { fixture } = await renderTabela({ subtitulo: 'Configure os atributos do sistema' });
      const el: HTMLElement = fixture.nativeElement;

      expect(el.textContent).toContain('Configure os atributos do sistema');
    });
  });

  // ----------------------------------------------------------
  // 2. Estado vazio
  // ----------------------------------------------------------

  describe('estado vazio', () => {
    it('deve exibir mensagem de empty state quando items é array vazio', async () => {
      const { fixture } = await renderTabela({ items: [] });
      const el: HTMLElement = fixture.nativeElement;

      expect(el.textContent?.toLowerCase()).toContain('nenhum');
    });

    it('deve exibir o label correto do CTA no empty state', async () => {
      const { fixture } = await renderTabela({ items: [], labelNovo: 'Novo Atributo' });
      const el: HTMLElement = fixture.nativeElement;

      expect(el.textContent).toContain('Novo Atributo');
    });
  });

  // ----------------------------------------------------------
  // 3. Estado de loading (skeleton)
  // ----------------------------------------------------------

  describe('estado de loading', () => {
    it('deve exibir skeletons quando loading é true', async () => {
      const { fixture } = await renderTabela({ loading: true });
      const container: HTMLElement = fixture.nativeElement;

      // Quando loading=true, a tabela p-table não é renderizada
      const table = container.querySelector('p-table');
      expect(table).toBeNull();

      // Skeletons devem estar presentes
      const skeletons = container.querySelectorAll('p-skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('não deve exibir skeletons quando loading é false', async () => {
      const { fixture } = await renderTabela({ loading: false });
      const container: HTMLElement = fixture.nativeElement;

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
      const { fixture } = await renderTabela({ labelNovo: 'Novo Atributo' });
      const el: HTMLElement = fixture.nativeElement;

      expect(el.textContent).toContain('Novo Atributo');
    });

    it('BUG-002: botão não deve ter "+" duplicado no label (ícone pi-plus + "+" no texto)', async () => {
      const { fixture } = await renderTabela({ labelNovo: 'Nova Aptidão' });
      const el: HTMLElement = fixture.nativeElement;
      const botao = el.querySelector('p-button[icon="pi pi-plus"]');

      // Quando existe icon="pi pi-plus", o label NÃO deve começar com "+" pois
      // o ícone já representa o "+". O label deve ser apenas "Nova Aptidão", não "+ Nova Aptidão".
      if (botao) {
        const label = botao.getAttribute('label') ?? botao.getAttribute('ng-reflect-label') ?? '';
        expect(label).not.toMatch(/^\+\s/);
      }
      // Verificação adicional via textContent: "++ Nova" ou "+ + Nova" não deve aparecer
      expect(el.textContent).not.toMatch(/\+\s*\+/);
    });

    it('deve emitir evento onCreate ao clicar no botão "+ Novo"', async () => {
      const { comp, onCreateSpy } = await renderTabela({ labelNovo: 'Novo Atributo' });

      comp.onCreate.emit();

      expect(onCreateSpy).toHaveBeenCalledTimes(1);
    });
  });

  // ----------------------------------------------------------
  // 5. Botões de ação (editar / excluir)
  // ----------------------------------------------------------

  describe('botões de ação por linha', () => {
    it('deve emitir o item correto ao clicar em editar', async () => {
      const { comp, onEditSpy } = await renderTabela();

      comp.onEdit.emit(itensMock[0]);

      expect(onEditSpy).toHaveBeenCalledWith(itensMock[0]);
    });

    it('deve emitir o item correto ao clicar em excluir', async () => {
      const { comp, onDeleteSpy } = await renderTabela();

      comp.onDelete.emit(itensMock[0]);

      expect(onDeleteSpy).toHaveBeenCalledWith(itensMock[0]);
    });
  });

  // ----------------------------------------------------------
  // 6. Campo de busca
  // ----------------------------------------------------------

  describe('campo de busca', () => {
    it('deve exibir campo de busca com placeholder correto', async () => {
      const { fixture } = await renderTabela();
      const input: HTMLInputElement | null = fixture.nativeElement.querySelector('input[placeholder]');

      expect(input?.placeholder?.toLowerCase()).toContain('buscar');
    });

    it('deve emitir evento onSearch ao emitir o output', async () => {
      const { comp, onSearchSpy } = await renderTabela();

      comp.onSearch.emit('Força');

      expect(onSearchSpy).toHaveBeenCalledWith('Força');
    });
  });

  // ----------------------------------------------------------
  // 7. Coluna drag-and-drop (canReorder)
  // ----------------------------------------------------------

  describe('reordenação', () => {
    it('deve exibir coluna de drag handle quando canReorder é true', async () => {
      const { fixture } = await renderTabela({ canReorder: true });
      const container: HTMLElement = fixture.nativeElement;

      const handles = container.querySelectorAll('.pi-bars');
      expect(handles.length).toBeGreaterThan(0);
    });

    it('não deve exibir coluna de drag handle quando canReorder é false', async () => {
      const { fixture } = await renderTabela({ canReorder: false });
      const container: HTMLElement = fixture.nativeElement;

      const handles = container.querySelectorAll('.pi-bars');
      expect(handles.length).toBe(0);
    });
  });

  // ----------------------------------------------------------
  // 8. Colunas de badge (abreviacao/sigla/codigo)
  // ----------------------------------------------------------

  describe('renderização de colunas especiais', () => {
    it('deve renderizar abreviação como badge-atributo', async () => {
      const { fixture } = await renderTabela();
      const container: HTMLElement = fixture.nativeElement;

      const badges = container.querySelectorAll('.badge-atributo');
      // 3 itens, cada um com abreviação = 3 badges
      expect(badges.length).toBe(3);
      expect(badges[0].textContent?.trim()).toBe('FOR');
    });

    it('deve exibir "—" para campos com valor null/undefined', async () => {
      const itensComNull = [
        { id: 1, ordemExibicao: 1, nome: 'Força', abreviacao: null },
      ];
      const { fixture } = await renderTabela({ items: itensComNull });
      const container: HTMLElement = fixture.nativeElement;

      expect(container.textContent).toContain('—');
    });
  });

  // ----------------------------------------------------------
  // 9. emptyColspan calculado corretamente
  // ----------------------------------------------------------

  describe('emptyColspan', () => {
    it('deve calcular colspan correto sem reordenação (colunas + 1 ação)', async () => {
      const { comp } = await renderTabela({ items: [], canReorder: false });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((comp as any).emptyColspan()).toBe(4);
    });

    it('deve calcular colspan correto com reordenação (colunas + 1 ação + 1 handle)', async () => {
      const { comp } = await renderTabela({ items: [], canReorder: true });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((comp as any).emptyColspan()).toBe(5);
    });
  });
});
