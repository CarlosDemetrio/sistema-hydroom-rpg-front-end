/**
 * StepAtributosComponent — Spec
 *
 * Dumb component com input.required() signals.
 * Padrao JIT: render com NO_ERRORS_SCHEMA + setSignalInput + detectChanges.
 *
 * Notas sobre PrimeNG p-button em testes:
 * - O [disabled] no p-button propaga para o <button> interno como .disabled = true
 * - Para clicar, usar fixture.nativeElement.querySelectorAll para pegar os <button> internos
 * - Para verificar disabled, usar element.disabled (propriedade nativa HTMLButtonElement)
 * - Outputs testados via subscribe() no signal de output
 */

import { render, screen } from '@testing-library/angular';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ɵSIGNAL as SIGNAL_SYM } from '@angular/core';
import { vi } from 'vitest';

import { StepAtributosComponent } from './step-atributos.component';
import { FichaAtributoEditavel } from '../../ficha-wizard.types';

// ============================================================
// Helper JIT: atribuir valor a input() / input.required() signal
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
// Dados de teste
// ============================================================

const atributosMock: FichaAtributoEditavel[] = [
  {
    atributoConfigId: 1,
    atributoNome: 'Forca',
    atributoAbreviacao: 'FOR',
    base: 3,
    outros: 0,
  },
  {
    atributoConfigId: 2,
    atributoNome: 'Agilidade',
    atributoAbreviacao: 'AGI',
    base: 2,
    outros: 1,
  },
  {
    atributoConfigId: 3,
    atributoNome: 'Vigor',
    atributoAbreviacao: 'VIG',
    base: 0,
    outros: 0,
  },
];

// ============================================================
// Helper de render
// ============================================================

async function renderStep(options: {
  atributos?: FichaAtributoEditavel[];
  pontosDisponiveis?: number;
  limitadorAtributo?: number;
} = {}) {
  const result = await render(StepAtributosComponent, {
    schemas: [NO_ERRORS_SCHEMA],
    detectChangesOnRender: false,
  });

  const comp = result.fixture.componentInstance;

  setSignalInput(comp, 'atributos', options.atributos ?? atributosMock);
  setSignalInput(comp, 'pontosDisponiveis', options.pontosDisponiveis ?? 20);
  setSignalInput(comp, 'limitadorAtributo', options.limitadorAtributo ?? 10);

  result.fixture.detectChanges();
  await result.fixture.whenStable();

  return result;
}

/**
 * Retorna todos os botoes <button> internos dos p-button renderizados.
 * PrimeNG p-button envolve um <button> nativo interno.
 * @param nativeEl elemento raiz do componente
 */
function getBotoesNativos(nativeEl: HTMLElement): HTMLButtonElement[] {
  return Array.from(nativeEl.querySelectorAll('p-button button'));
}

// ============================================================
// Testes
// ============================================================

describe('StepAtributosComponent', () => {

  // ----------------------------------------------------------
  // 1. Renderizacao
  // ----------------------------------------------------------

  describe('Renderizacao', () => {
    it('deve renderizar um card por atributo passado no input', async () => {
      await renderStep();

      expect(screen.getByText('Forca')).toBeTruthy();
      expect(screen.getByText('Agilidade')).toBeTruthy();
      expect(screen.getByText('Vigor')).toBeTruthy();
    });

    it('deve exibir o contador de pontos utilizados sobre o total disponivel', async () => {
      // atributos mock: base 3 + 2 + 0 = 5 utilizados, pontosDisponiveis = 20
      await renderStep({ pontosDisponiveis: 20 });

      expect(screen.getByText('5 / 20')).toBeTruthy();
    });

    it('deve exibir bonus de raca quando outros !== 0', async () => {
      const { fixture } = await renderStep();

      // atributosMock[1] (AGI) tem outros = 1 — renderiza como "+1"
      const texto = fixture.nativeElement.textContent as string;
      expect(texto).toContain('+1');
    });

    it('nao deve exibir secao de bonus de raca quando todos os outros === 0', async () => {
      const atributosSemBonus: FichaAtributoEditavel[] = [
        {
          atributoConfigId: 1,
          atributoNome: 'Forca',
          atributoAbreviacao: 'FOR',
          base: 0,
          outros: 0,
        },
      ];
      const { fixture } = await renderStep({ atributos: atributosSemBonus });

      const texto = fixture.nativeElement.textContent as string;
      expect(texto).not.toContain('Bonus de raca');
    });
  });

  // ----------------------------------------------------------
  // 2. Incrementar
  // ----------------------------------------------------------

  describe('Incrementar', () => {
    it('deve emitir atributosChanged com base incrementado ao clicar em [+]', async () => {
      const { fixture } = await renderStep({
        atributos: atributosMock,
        pontosDisponiveis: 20,
        limitadorAtributo: 10,
      });
      const comp = fixture.componentInstance;

      const emitSpy = vi.fn();
      comp.atributosChanged.subscribe(emitSpy);

      // Cada atributo tem 2 botoes: [diminuir, aumentar] => pares por atributo
      // Botoes: [dim-FOR, aum-FOR, dim-AGI, aum-AGI, dim-VIG, aum-VIG]
      const botoes = getBotoesNativos(fixture.nativeElement);
      const aumentarForca = botoes[1]; // segundo botao = aumentar da primeira row
      aumentarForca.click();
      fixture.detectChanges();

      expect(emitSpy).toHaveBeenCalledOnce();
      const emitido = emitSpy.mock.calls[0][0] as FichaAtributoEditavel[];
      const forcaAtualizada = emitido.find((a) => a.atributoConfigId === 1);
      expect(forcaAtualizada?.base).toBe(4);
    });

    it('deve ter o botao [+] desabilitado quando base >= limitadorAtributo', async () => {
      const atributosNoLimite: FichaAtributoEditavel[] = [
        {
          atributoConfigId: 1,
          atributoNome: 'Forca',
          atributoAbreviacao: 'FOR',
          base: 10,
          outros: 0,
        },
      ];
      const { fixture } = await renderStep({
        atributos: atributosNoLimite,
        pontosDisponiveis: 20,
        limitadorAtributo: 10,
      });

      const botoes = getBotoesNativos(fixture.nativeElement);
      const aumentarForca = botoes[1]; // [dim-FOR, aum-FOR]
      expect(aumentarForca.disabled).toBe(true);
    });

    it('deve ter o botao [+] de todos desabilitado quando pontosRestantes === 0', async () => {
      const atributosGastando: FichaAtributoEditavel[] = [
        {
          atributoConfigId: 1,
          atributoNome: 'Forca',
          atributoAbreviacao: 'FOR',
          base: 5,
          outros: 0,
        },
        {
          atributoConfigId: 2,
          atributoNome: 'Agilidade',
          atributoAbreviacao: 'AGI',
          base: 5,
          outros: 0,
        },
      ];
      // pontosDisponiveis = 10, utilizados = 10, restantes = 0
      const { fixture } = await renderStep({
        atributos: atributosGastando,
        pontosDisponiveis: 10,
        limitadorAtributo: 10,
      });

      const botoes = getBotoesNativos(fixture.nativeElement);
      // Botoes aumentar: indices impares [1, 3]
      const aumentarForca = botoes[1];
      const aumentarAgi = botoes[3];
      expect(aumentarForca.disabled).toBe(true);
      expect(aumentarAgi.disabled).toBe(true);
    });
  });

  // ----------------------------------------------------------
  // 3. Decrementar
  // ----------------------------------------------------------

  describe('Decrementar', () => {
    it('deve emitir atributosChanged com base decrementado ao clicar em [-]', async () => {
      const { fixture } = await renderStep({
        atributos: atributosMock,
        pontosDisponiveis: 20,
        limitadorAtributo: 10,
      });
      const comp = fixture.componentInstance;

      const emitSpy = vi.fn();
      comp.atributosChanged.subscribe(emitSpy);

      // Botoes: [dim-FOR, aum-FOR, dim-AGI, aum-AGI, dim-VIG, aum-VIG]
      const botoes = getBotoesNativos(fixture.nativeElement);
      const diminuirForca = botoes[0]; // primeiro botao = diminuir da primeira row
      diminuirForca.click();
      fixture.detectChanges();

      expect(emitSpy).toHaveBeenCalledOnce();
      const emitido = emitSpy.mock.calls[0][0] as FichaAtributoEditavel[];
      const forcaAtualizada = emitido.find((a) => a.atributoConfigId === 1);
      expect(forcaAtualizada?.base).toBe(2);
    });

    it('deve ter o botao [-] desabilitado quando base === 0', async () => {
      const { fixture } = await renderStep();

      // atributosMock[2] (VIG) tem base = 0 — terceiro atributo, botao diminuir = indice 4
      // Botoes: [dim-FOR(0), aum-FOR(1), dim-AGI(2), aum-AGI(3), dim-VIG(4), aum-VIG(5)]
      const botoes = getBotoesNativos(fixture.nativeElement);
      const diminuirVigor = botoes[4];
      expect(diminuirVigor.disabled).toBe(true);
    });
  });

});
