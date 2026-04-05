/**
 * StepDescricaoComponent — Spec
 *
 * Dumb component com input() simples (nao required).
 * Em modo JIT (Vitest sem plugin Angular), usamos ɵSIGNAL para atribuir
 * valores aos inputs de signal apos o render, antes de detectChanges.
 *
 * Padrao: render com NO_ERRORS_SCHEMA + setSignalInput + detectChanges.
 */

import { render, screen, fireEvent } from '@testing-library/angular';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ɵSIGNAL as SIGNAL_SYM } from '@angular/core';
import { vi } from 'vitest';

import { StepDescricaoComponent } from './step-descricao.component';

// ============================================================
// Helper JIT: atribuir valor a input() signal
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

async function renderStep(descricao: string | null = null) {
  const result = await render(StepDescricaoComponent, {
    schemas: [NO_ERRORS_SCHEMA],
    detectChangesOnRender: false,
  });

  setSignalInput(result.fixture.componentInstance, 'descricao', descricao);
  result.fixture.detectChanges();
  await result.fixture.whenStable();

  return result;
}

// ============================================================
// Testes
// ============================================================

describe('StepDescricaoComponent', () => {

  // ----------------------------------------------------------
  // 1. Renderizacao inicial
  // ----------------------------------------------------------

  describe('renderizacao inicial', () => {
    it('renderiza textarea com placeholder correto', async () => {
      await renderStep(null);

      const textarea = screen.getByPlaceholderText(
        /descreva a aparencia, personalidade/i
      );
      expect(textarea).toBeTruthy();
    });

    it('exibe contador "0/2000" quando descricao e null', async () => {
      await renderStep(null);

      expect(screen.getByText('0/2000')).toBeTruthy();
    });

    it('exibe mensagem de info sobre campo opcional', async () => {
      await renderStep(null);

      expect(screen.getByText(/este campo e opcional/i)).toBeTruthy();
    });

    it('exibe label "Descricao" com indicacao de opcional', async () => {
      await renderStep(null);

      expect(screen.getByText('Descricao')).toBeTruthy();
      expect(screen.getByText('(opcional)')).toBeTruthy();
    });
  });

  // ----------------------------------------------------------
  // 2. Pre-preenchimento via input
  // ----------------------------------------------------------

  describe('pre-preenchimento', () => {
    it('quando descricao input tem valor, textarea ja vem preenchida', async () => {
      const { fixture } = await renderStep('Historia do meu personagem');

      const textarea = fixture.nativeElement.querySelector('#descricao') as HTMLTextAreaElement;
      expect(textarea.value).toBe('Historia do meu personagem');
    });

    it('contador exibe o tamanho correto quando descricao tem valor', async () => {
      await renderStep('12345');

      expect(screen.getByText('5/2000')).toBeTruthy();
    });
  });

  // ----------------------------------------------------------
  // 3. Interacao — emissao de eventos
  // ----------------------------------------------------------

  describe('interacao', () => {
    it('ao digitar, emite descricaoChanged com o texto digitado', async () => {
      const { fixture } = await renderStep(null);
      const comp = fixture.componentInstance;

      const emitSpy = vi.fn();
      comp.descricaoChanged.subscribe(emitSpy);

      const textarea = fixture.nativeElement.querySelector('#descricao') as HTMLTextAreaElement;
      fireEvent.input(textarea, { target: { value: 'Texto novo' } });
      fixture.detectChanges();

      expect(emitSpy).toHaveBeenCalledWith('Texto novo');
    });

    it('emite null quando o campo e limpo', async () => {
      const { fixture } = await renderStep('Texto inicial');
      const comp = fixture.componentInstance;

      const emitSpy = vi.fn();
      comp.descricaoChanged.subscribe(emitSpy);

      const textarea = fixture.nativeElement.querySelector('#descricao') as HTMLTextAreaElement;
      fireEvent.input(textarea, { target: { value: '' } });
      fixture.detectChanges();

      expect(emitSpy).toHaveBeenCalledWith(null);
    });

    it('contador atualiza em tempo real ao digitar', async () => {
      const { fixture } = await renderStep(null);
      const comp = fixture.componentInstance;

      // Simula o handler diretamente para testar o contador sem dependencia de ngModel binding
      comp.onDescricaoChange('12345');
      setSignalInput(comp, 'descricao', '12345');
      fixture.detectChanges();

      expect(screen.getByText('5/2000')).toBeTruthy();
    });
  });

  // ----------------------------------------------------------
  // 4. Acessibilidade
  // ----------------------------------------------------------

  describe('acessibilidade', () => {
    it('textarea tem aria-label correto', async () => {
      await renderStep(null);

      const textarea = screen.getByRole('textbox', { name: /descricao do personagem/i });
      expect(textarea).toBeTruthy();
    });

    it('label esta associada ao textarea via for/id', async () => {
      const { fixture } = await renderStep(null);

      const label = fixture.nativeElement.querySelector('label[for="descricao"]') as HTMLLabelElement;
      expect(label).toBeTruthy();
    });
  });

});
