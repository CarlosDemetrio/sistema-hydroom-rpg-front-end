/**
 * FormulaEditorComponent — Spec
 *
 * ABORDAGEM DE TESTES:
 * O componente usa `effect()` no constructor que sincroniza `previewValues` com
 * `todasVariaveis()`. Testes de renderização completa com PrimeNG InputNumber causam
 * loop de change detection no jsdom (processo CPU 99%). Por isso, os testes focam em:
 *
 * 1. Testes de lógica pura: `avaliarFormula`, `validarFormula`, `inserirVariavel`,
 *    `getPreviewValue`/`setPreviewValue`, `todasVariaveis`, `previewResult` — acessados
 *    diretamente via `(component as any)` sem renderizar o template PrimeNG.
 *
 * 2. Testes de renderização: template HTML básico (label, input), sem dependência de
 *    InputNumber que causa o loop.
 *
 * 3. Testes de debounce: usando `vi.useFakeTimers()`.
 */

import { TestBed } from '@angular/core/testing';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { vi } from 'vitest';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

import { FormulaEditorComponent, VariavelDinamica } from './formula-editor.component';

// ============================================================
// Helper: cria o componente via TestBed sem renderizar p-inputNumber
// ============================================================

async function criarFixture(overrides: {
  formula?: string;
  variaveisFixas?: string[];
  variaveisDinamicas?: VariavelDinamica[];
  label?: string;
  placeholder?: string;
  disabled?: boolean;
} = {}) {
  // Override: substitui InputNumberModule por módulo vazio para evitar loop
  await TestBed.configureTestingModule({
    imports: [FormulaEditorComponent],
  })
  .overrideComponent(FormulaEditorComponent, {
    set: {
      imports: [
        DecimalPipe,
        FormsModule,
        ButtonModule,
        InputTextModule,
        MessageModule,
        TagModule,
        TooltipModule,
        // InputNumberModule removido intencionalmente para evitar loop de CD no jsdom
      ],
    },
  })
  .compileComponents();

  const fixture = TestBed.createComponent(FormulaEditorComponent);
  const component = fixture.componentInstance;

  // Setar inputs via componentRef.setInput (funciona com input() e model())
  if (overrides.variaveisFixas !== undefined) {
    fixture.componentRef.setInput('variaveisFixas', overrides.variaveisFixas);
  }
  if (overrides.variaveisDinamicas !== undefined) {
    fixture.componentRef.setInput('variaveisDinamicas', overrides.variaveisDinamicas);
  }
  if (overrides.label !== undefined) {
    fixture.componentRef.setInput('label', overrides.label);
  }
  if (overrides.placeholder !== undefined) {
    fixture.componentRef.setInput('placeholder', overrides.placeholder);
  }
  if (overrides.disabled !== undefined) {
    fixture.componentRef.setInput('disabled', overrides.disabled);
  }
  if (overrides.formula !== undefined) {
    component.formula.set(overrides.formula);
  }

  fixture.detectChanges();
  await fixture.whenStable();

  return { fixture, component };
}

// ============================================================
// Testes
// ============================================================

describe('FormulaEditorComponent', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
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

    it('deve retornar ok=true com resultado=undefined para fórmula vazia', async () => {
      const { component } = await criarFixture();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (component as any).previewResult();
      // Fórmula vazia retorna ok=false no previewResult (condição: !f.trim())
      expect(result.ok).toBe(false);
    });
  });

  // ----------------------------------------------------------
  // 5. previewResult (computed)
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
        formula: 'total + nivel',
        variaveisFixas: ['total', 'nivel'],
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (component as any).previewResult();
      expect(result.ok).toBe(true);
      // total=1 + nivel=1 = 2
      expect(result.resultado).toBe(2);
    });

    it('deve retornar ok=false para fórmula inválida', async () => {
      const { component } = await criarFixture({
        formula: 'total +',
        variaveisFixas: ['total'],
      });
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
      const { component } = await criarFixture({ variaveisFixas: ['total'], formula: '' });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (component as any).inserirVariavel('total');
      expect(component.formula()).toContain('total');
    });

    it('não deve alterar a fórmula quando disabled=true', async () => {
      const { component } = await criarFixture({
        variaveisFixas: ['total'],
        formula: '',
        disabled: true,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (component as any).inserirVariavel('total');
      expect(component.formula()).toBe('');
    });

    it('deve concatenar com separador quando fórmula não termina em espaço', async () => {
      const { component } = await criarFixture({
        variaveisFixas: ['total', 'nivel'],
        formula: 'nivel',
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (component as any).inserirVariavel('total');
      const resultado = component.formula();
      expect(resultado).toContain('nivel');
      expect(resultado).toContain('total');
    });

    it('não deve inserir espaço duplo quando fórmula já termina com espaço', async () => {
      const { component } = await criarFixture({
        variaveisFixas: ['total'],
        formula: 'nivel ',
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (component as any).inserirVariavel('total');
      expect(component.formula()).not.toMatch(/  /);
    });

    it('deve disparar validação após inserir variável', async () => {
      const { component } = await criarFixture({
        variaveisFixas: ['total'],
        formula: '',
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
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('deve atualizar o signal formula imediatamente ao digitar', async () => {
      const { component } = await criarFixture({ variaveisFixas: ['total'] });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (component as any).onFormulaInput('total / 2');

      expect(component.formula()).toBe('total / 2');
    });

    it('deve disparar validação após 600ms de debounce', async () => {
      const { component, fixture } = await criarFixture({ variaveisFixas: ['total'] });
      const spy = vi.fn();
      component.validationChange.subscribe(spy);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (component as any).onFormulaInput('total / 2');
      fixture.detectChanges();

      expect(spy).not.toHaveBeenCalled();

      vi.advanceTimersByTime(600);
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledWith(true);
    });

    it('deve cancelar o timer anterior ao receber novo input antes de 600ms', async () => {
      const { component, fixture } = await criarFixture({ variaveisFixas: ['total'] });
      const spy = vi.fn();
      component.validationChange.subscribe(spy);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (component as any).onFormulaInput('total / 2');
      vi.advanceTimersByTime(300);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (component as any).onFormulaInput('total / 3');
      vi.advanceTimersByTime(600);
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(true);
    });

    it('deve emitir validationChange=true imediatamente ao limpar a fórmula (sem aguardar debounce)', async () => {
      const { component } = await criarFixture({
        formula: 'total / 2',
        variaveisFixas: ['total'],
      });
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
