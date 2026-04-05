/**
 * FormulaEditorComponent — Spec
 *
 * ABORDAGEM DE TESTES:
 * O componente usa `effect()` no constructor que sincroniza `previewValues` com
 * `todasVariaveis()`. Testes de renderização completa com PrimeNG InputNumber causam
 * loop de change detection no jsdom (processo CPU 99%). Por isso:
 * - InputNumberModule é excluído via componentImports + NO_ERRORS_SCHEMA
 * - Testes de lógica pura acessam métodos via `(component as any)` sem renderizar o template PrimeNG
 *
 * NOTA JIT: Em modo JIT (Vitest sem plugin Angular), `input()` API não registra
 * entradas no ɵcmp.inputs. Logo, componentInputs/setInput falham silenciosamente.
 * Usamos ɵSIGNAL (símbolo interno) para definir o valor nos nós signal diretamente
 * após a criação do componente, antes do primeiro detectChanges.
 */

import { NO_ERRORS_SCHEMA, ɵSIGNAL as SIGNAL_SYM } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { render } from '@testing-library/angular';
import { vi } from 'vitest';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

import { FormulaEditorComponent, VariavelDinamica } from './formula-editor.component';

// ============================================================
// Helper: seta o valor de um signal input diretamente via nó interno
// Necessário em JIT porque input() não é registrado em ɵcmp.inputs
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
// Helper: render sem InputNumberModule (evita loop CD no jsdom)
// ============================================================

async function criarFixture(overrides: {
  formula?: string;
  variaveisFixas?: string[];
  variaveisDinamicas?: VariavelDinamica[];
  label?: string;
  placeholder?: string;
  disabled?: boolean;
} = {}) {
  // Renderiza sem componentInputs — inputs são setados via ɵSIGNAL após criação
  const result = await render(FormulaEditorComponent, {
    // Exclui InputNumberModule para evitar loop de change detection no jsdom
    componentImports: [
      DecimalPipe,
      FormsModule,
      ButtonModule,
      InputTextModule,
      MessageModule,
      TagModule,
      TooltipModule,
    ],
    schemas: [NO_ERRORS_SCHEMA],
    detectChangesOnRender: false,
  });

  const component = result.fixture.componentInstance;

  // Define os valores dos signal inputs diretamente no nó do signal
  setSignalInput(component, 'variaveisFixas',     overrides.variaveisFixas   ?? []);
  setSignalInput(component, 'variaveisDinamicas', overrides.variaveisDinamicas ?? []);
  setSignalInput(component, 'label',              overrides.label            ?? 'Fórmula');
  setSignalInput(component, 'placeholder',        overrides.placeholder      ?? 'Ex: FOR + AGI / 2');
  setSignalInput(component, 'disabled',           overrides.disabled         ?? false);

  // Primeira detecção de mudanças após definir os inputs
  result.fixture.detectChanges();
  await result.fixture.whenStable();

  if (overrides.formula !== undefined) {
    component.formula.set(overrides.formula);
    result.fixture.detectChanges();
    await result.fixture.whenStable();
  }

  return { fixture: result.fixture, component };
}

// ============================================================
// Testes
// ============================================================

describe('FormulaEditorComponent', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  // ----------------------------------------------------------
  // 1. Renderização básica (sem InputNumber no template)
  // ----------------------------------------------------------

  describe('renderização básica', () => {
    it('deve criar o componente sem erros', async () => {
      const { component } = await criarFixture();
      expect(component).toBeTruthy();
    });

    it('deve exibir o label padrão "Fórmula"', async () => {
      const { fixture } = await criarFixture();
      const label = fixture.nativeElement.querySelector('label');
      expect(label?.textContent?.trim()).toBe('Fórmula');
    });

    it('deve exibir o label customizado quando informado', async () => {
      const { fixture } = await criarFixture({ label: 'Fórmula de Ímpeto' });
      const label = fixture.nativeElement.querySelector('label');
      expect(label?.textContent?.trim()).toBe('Fórmula de Ímpeto');
    });

    it('deve renderizar o input com font-family monospace', async () => {
      const { fixture } = await criarFixture();
      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      expect(input).toBeTruthy();
      expect(input?.style.fontFamily).toContain('monospace');
    });

    it('deve exibir o placeholder informado', async () => {
      const { fixture } = await criarFixture({ placeholder: 'Ex: total / 10' });
      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      expect(input?.placeholder).toBe('Ex: total / 10');
    });

    it('deve iniciar com fórmula vazia por padrão', async () => {
      const { component } = await criarFixture();
      expect(component.formula()).toBe('');
    });

    it('deve refletir o valor inicial da fórmula setado via model.set()', async () => {
      const { component } = await criarFixture({ formula: 'total / 10' });
      expect(component.formula()).toBe('total / 10');
    });

    it('deve renderizar o atributo aria-label no input', async () => {
      const { fixture } = await criarFixture();
      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      expect(input?.getAttribute('aria-label')).toContain('fórmula');
    });
  });

  // ----------------------------------------------------------
  // 2. Estado disabled
  // ----------------------------------------------------------

  describe('estado disabled', () => {
    it('deve desabilitar o input quando disabled=true', async () => {
      const { fixture } = await criarFixture({ disabled: true });
      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      expect(input.disabled).toBe(true);
    });

    it('não deve desabilitar o input quando disabled=false', async () => {
      const { fixture } = await criarFixture({ disabled: false });
      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      expect(input.disabled).toBe(false);
    });
  });

  // ----------------------------------------------------------
  // 3. Computed: todasVariaveis
  // ----------------------------------------------------------

  describe('computed todasVariaveis', () => {
    it('deve mapear variáveis fixas com sigla=label', async () => {
      const { component } = await criarFixture({ variaveisFixas: ['nivel', 'base'] });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const todas = (component as any).todasVariaveis() as VariavelDinamica[];
      expect(todas).toHaveLength(2);
      expect(todas[0]).toEqual({ sigla: 'nivel', label: 'nivel' });
      expect(todas[1]).toEqual({ sigla: 'base', label: 'base' });
    });

    it('deve preservar label das variáveis dinâmicas', async () => {
      const { component } = await criarFixture({
        variaveisDinamicas: [{ sigla: 'FOR', label: 'Força' }],
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const todas = (component as any).todasVariaveis() as VariavelDinamica[];
      expect(todas[0]).toEqual({ sigla: 'FOR', label: 'Força' });
    });

    it('deve combinar variáveis fixas e dinâmicas', async () => {
      const { component } = await criarFixture({
        variaveisFixas: ['total'],
        variaveisDinamicas: [{ sigla: 'FOR', label: 'Força' }],
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const todas = (component as any).todasVariaveis() as VariavelDinamica[];
      expect(todas).toHaveLength(2);
      expect(todas.map((v) => v.sigla)).toEqual(['total', 'FOR']);
    });

    it('deve retornar lista vazia quando não há variáveis de nenhum tipo', async () => {
      const { component } = await criarFixture();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const todas = (component as any).todasVariaveis() as VariavelDinamica[];
      expect(todas).toHaveLength(0);
    });
  });

  // ----------------------------------------------------------
  // 4. avaliarFormula (método privado)
  // ----------------------------------------------------------

  describe('avaliarFormula', () => {
    it('deve retornar ok=true com resultado correto para expressão válida', async () => {
      const { component } = await criarFixture();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (component as any).avaliarFormula('total + nivel', { total: 5, nivel: 3 });
      expect(result.ok).toBe(true);
      expect(result.resultado).toBe(8);
    });

    it('deve calcular expressão com parênteses corretamente', async () => {
      const { component } = await criarFixture();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (component as any).avaliarFormula('(total + nivel) / 2', { total: 4, nivel: 2 });
      expect(result.ok).toBe(true);
      expect(result.resultado).toBe(3);
    });

    it('deve retornar ok=false para divisão por zero', async () => {
      const { component } = await criarFixture();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (component as any).avaliarFormula('total / nivel', { total: 10, nivel: 0 });
      expect(result.ok).toBe(false);
      expect(result.erro).toBeTruthy();
    });

    it('deve retornar ok=false para expressão com sintaxe inválida', async () => {
      const { component } = await criarFixture();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (component as any).avaliarFormula('total +', { total: 5 });
      expect(result.ok).toBe(false);
      expect(result.erro).toContain('sintaxe');
    });

    it('deve substituir variáveis corretamente sem substituição parcial (ordem: mais longo primeiro)', async () => {
      const { component } = await criarFixture();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (component as any).avaliarFormula('FOR + nivel', { FOR: 5, nivel: 3 });
      expect(result.ok).toBe(true);
      expect(result.resultado).toBe(8);
    });

    it('deve retornar ok=false para fórmula vazia (previewResult com fórmula vazia)', async () => {
      const { component } = await criarFixture();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (component as any).previewResult();
      // Fórmula vazia retorna ok=false no previewResult (condição: !f.trim())
      expect(result.ok).toBe(false);
    });
  });

  // ----------------------------------------------------------
  // 5. previewResult (computed) — testado via lógica pura
  // ----------------------------------------------------------

  describe('previewResult', () => {
    it('deve retornar ok=false quando fórmula está vazia', async () => {
      const { component } = await criarFixture({ variaveisFixas: ['total'] });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (component as any).previewResult();
      expect(result.ok).toBe(false);
    });

    it('deve calcular resultado correto com valores padrão (1) para cada variável', async () => {
      const { component } = await criarFixture({
        variaveisFixas: ['total', 'nivel'],
      });
      component.formula.set('total + nivel');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (component as any).previewResult();
      expect(result.ok).toBe(true);
      // total=1 + nivel=1 = 2
      expect(result.resultado).toBe(2);
    });

    it('deve retornar ok=false para fórmula inválida', async () => {
      const { component } = await criarFixture({
        variaveisFixas: ['total'],
      });
      component.formula.set('total +');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (component as any).previewResult();
      expect(result.ok).toBe(false);
    });
  });

  // ----------------------------------------------------------
  // 6. getPreviewValue / setPreviewValue
  // ----------------------------------------------------------

  describe('getPreviewValue / setPreviewValue', () => {
    it('deve retornar 1 como valor padrão para qualquer variável', async () => {
      const { component } = await criarFixture({ variaveisFixas: ['total'] });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((component as any).getPreviewValue('total')).toBe(1);
    });

    it('deve atualizar e retornar o novo valor após setPreviewValue', async () => {
      const { component } = await criarFixture({ variaveisFixas: ['total'] });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (component as any).setPreviewValue('total', 42);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((component as any).getPreviewValue('total')).toBe(42);
    });

    it('deve usar 1 como fallback quando valor setado é null/undefined', async () => {
      const { component } = await criarFixture({ variaveisFixas: ['total'] });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (component as any).setPreviewValue('total', null as unknown as number);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((component as any).getPreviewValue('total')).toBe(1);
    });
  });

  // ----------------------------------------------------------
  // 7. inserirVariavel
  // ----------------------------------------------------------

  describe('inserirVariavel', () => {
    it('deve inserir variável ao final da fórmula quando não há input nativo com cursor', async () => {
      const { component } = await criarFixture({ variaveisFixas: ['total'] });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (component as any).inserirVariavel('total');
      expect(component.formula()).toContain('total');
    });

    it('não deve alterar a fórmula quando disabled=true', async () => {
      const { component } = await criarFixture({
        variaveisFixas: ['total'],
        disabled: true,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (component as any).inserirVariavel('total');
      expect(component.formula()).toBe('');
    });

    it('deve concatenar com separador quando fórmula não termina em espaço', async () => {
      const { component } = await criarFixture({
        variaveisFixas: ['total', 'nivel'],
      });
      component.formula.set('nivel');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (component as any).inserirVariavel('total');
      const resultado = component.formula();
      expect(resultado).toContain('nivel');
      expect(resultado).toContain('total');
    });

    it('não deve inserir espaço duplo quando fórmula já termina com espaço', async () => {
      const { component } = await criarFixture({
        variaveisFixas: ['total'],
      });
      component.formula.set('nivel ');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (component as any).inserirVariavel('total');
      expect(component.formula()).not.toMatch(/  /);
    });

    it('deve disparar validação após inserir variável', async () => {
      const { component } = await criarFixture({
        variaveisFixas: ['total'],
      });
      const validationSpy = vi.fn();
      component.validationChange.subscribe(validationSpy);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (component as any).inserirVariavel('total');

      expect(validationSpy).toHaveBeenCalled();
    });
  });

  // ----------------------------------------------------------
  // 8. validarFormula
  // ----------------------------------------------------------

  describe('validarFormula', () => {
    it('deve emitir validationChange=true para fórmula vazia', async () => {
      const { component } = await criarFixture({ variaveisFixas: ['total'] });
      const spy = vi.fn();
      component.validationChange.subscribe(spy);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (component as any).validarFormula('');

      expect(spy).toHaveBeenCalledWith(true);
    });

    it('deve emitir validationChange=true para fórmula válida', async () => {
      const { component } = await criarFixture({ variaveisFixas: ['total', 'nivel'] });
      const spy = vi.fn();
      component.validationChange.subscribe(spy);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (component as any).validarFormula('(total + nivel) / 2');

      expect(spy).toHaveBeenCalledWith(true);
    });

    it('deve emitir validationChange=false para variável desconhecida', async () => {
      const { component } = await criarFixture({ variaveisFixas: ['total'] });
      const spy = vi.fn();
      component.validationChange.subscribe(spy);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (component as any).validarFormula('DESCONHECIDA / 2');

      expect(spy).toHaveBeenCalledWith(false);
    });

    it('deve emitir validationChange=false para sintaxe inválida', async () => {
      const { component } = await criarFixture({ variaveisFixas: ['total'] });
      const spy = vi.fn();
      component.validationChange.subscribe(spy);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (component as any).validarFormula('total ++ 2');

      expect(spy).toHaveBeenCalledWith(false);
    });

    it('deve setar validationError com a sigla desconhecida', async () => {
      const { component, fixture } = await criarFixture({ variaveisFixas: ['total'] });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (component as any).validarFormula('XPTO / 2');
      fixture.detectChanges();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const erro = (component as any).validationError();
      expect(erro).toContain('XPTO');
    });

    it('deve limpar validationError ao corrigir a fórmula', async () => {
      const { component, fixture } = await criarFixture({ variaveisFixas: ['total'] });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (component as any).validarFormula('INVALIDA / 2');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (component as any).validarFormula('total / 2');
      fixture.detectChanges();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((component as any).validationError()).toBeNull();
    });
  });

  // ----------------------------------------------------------
  // 9. onFormulaInput + debounce
  // ----------------------------------------------------------

  describe('onFormulaInput com debounce', () => {
    // NOTA: vi.useFakeTimers() é chamado APÓS criarFixture() em cada teste,
    // porque fixture.whenStable() trava quando os timers já estão falsos
    // (Zone.js aguarda macrotasks que nunca resolvem com fake timers ativos).

    it('deve atualizar o signal formula imediatamente ao digitar', async () => {
      const { component } = await criarFixture({ variaveisFixas: ['total'] });
      vi.useFakeTimers();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (component as any).onFormulaInput('total / 2');

      expect(component.formula()).toBe('total / 2');
    });

    it('deve disparar validação após 600ms de debounce', async () => {
      // Usa fórmula sem nomes de variáveis para que todasVariaveis().length === 0
      // e o bloco @if do preview NÃO renderize p-inputNumber (evita NG0303).
      const { component } = await criarFixture();
      vi.useFakeTimers();
      const spy = vi.fn();
      component.validationChange.subscribe(spy);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (component as any).onFormulaInput('1 + 2');

      expect(spy).not.toHaveBeenCalled();

      vi.advanceTimersByTime(600);

      expect(spy).toHaveBeenCalledWith(true);
    });

    it('deve cancelar o timer anterior ao receber novo input antes de 600ms', async () => {
      // Usa fórmulas sem nomes de variáveis pelo mesmo motivo acima.
      const { component } = await criarFixture();
      vi.useFakeTimers();
      const spy = vi.fn();
      component.validationChange.subscribe(spy);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (component as any).onFormulaInput('1 + 2');
      vi.advanceTimersByTime(300);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (component as any).onFormulaInput('1 + 3');
      vi.advanceTimersByTime(600);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(true);
    });

    it('deve emitir validationChange=true imediatamente ao limpar a fórmula (sem aguardar debounce)', async () => {
      const { component } = await criarFixture({
        variaveisFixas: ['total'],
      });
      component.formula.set('total / 2');
      vi.useFakeTimers();
      const spy = vi.fn();
      component.validationChange.subscribe(spy);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (component as any).onFormulaInput('');

      // Sem avançar timer — deve ter emitido imediatamente
      expect(spy).toHaveBeenCalledWith(true);
    });
  });

  // ----------------------------------------------------------
  // 10. Exibição de erro no template
  // ----------------------------------------------------------

  describe('mensagem de erro no template', () => {
    it('não deve exibir p-message quando não há erro', async () => {
      const { fixture } = await criarFixture({ variaveisFixas: ['total'] });
      const mensagem = fixture.nativeElement.querySelector('p-message');
      expect(mensagem).toBeNull();
    });

    it('deve exibir p-message quando há validationError', async () => {
      const { component, fixture } = await criarFixture({ variaveisFixas: ['total'] });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (component as any).validarFormula('INVALIDA / 2');
      fixture.detectChanges();

      const mensagem = fixture.nativeElement.querySelector('p-message');
      expect(mensagem).not.toBeNull();
    });
  });

  // ----------------------------------------------------------
  // 11. Chips de variáveis no template
  // ----------------------------------------------------------

  describe('chips de variáveis no template', () => {
    it('não deve exibir chips quando não há variáveis', async () => {
      const { fixture } = await criarFixture();
      const chips = fixture.nativeElement.querySelectorAll('p-tag');
      expect(chips.length).toBe(0);
    });

    it('deve exibir um chip por variável fixa', async () => {
      const { fixture } = await criarFixture({ variaveisFixas: ['total', 'nivel', 'base'] });
      const chips = fixture.nativeElement.querySelectorAll('p-tag');
      expect(chips.length).toBe(3);
    });

    it('deve exibir chips para a union de fixas e dinâmicas', async () => {
      const { fixture } = await criarFixture({
        variaveisFixas: ['total'],
        variaveisDinamicas: [{ sigla: 'FOR', label: 'Força' }],
      });
      const chips = fixture.nativeElement.querySelectorAll('p-tag');
      expect(chips.length).toBe(2);
    });
  });
});
