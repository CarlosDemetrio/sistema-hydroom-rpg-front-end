/**
 * StepAptidoesComponent — Spec
 *
 * Dumb component com input.required() signals.
 * Padrao JIT: render com NO_ERRORS_SCHEMA + setSignalInput + detectChanges.
 *
 * Notas sobre PrimeNG p-button em testes:
 * - O [disabled] no p-button propaga para o <button> interno como .disabled = true
 * - Para clicar, usar fixture.nativeElement.querySelectorAll para pegar os <button> internos
 * - Outputs testados via subscribe() no signal de output
 */

import { render, screen } from '@testing-library/angular';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ɵSIGNAL as SIGNAL_SYM } from '@angular/core';
import { vi } from 'vitest';

import { StepAptidoesComponent } from './step-aptidoes.component';
import { FichaAptidaoEditavel, TipoAptidaoComAptidoes } from '../../ficha-wizard.types';

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

const aptidaoCombateMock: FichaAptidaoEditavel = {
  aptidaoConfigId: 1,
  aptidaoNome: 'Espada',
  tipoAptidaoNome: 'Combate',
  base: 2,
  sorte: 1,
  classe: 0,
};

const aptidaoCombate2Mock: FichaAptidaoEditavel = {
  aptidaoConfigId: 2,
  aptidaoNome: 'Arco',
  tipoAptidaoNome: 'Combate',
  base: 0,
  sorte: 0,
  classe: 0,
};

const aptidaoSocialMock: FichaAptidaoEditavel = {
  aptidaoConfigId: 3,
  aptidaoNome: 'Persuasao',
  tipoAptidaoNome: 'Social',
  base: 1,
  sorte: 0,
  classe: 2,
};

const aptidoesAgrupadasMock: TipoAptidaoComAptidoes[] = [
  {
    tipoNome: 'Combate',
    aptidoes: [aptidaoCombateMock, aptidaoCombate2Mock],
  },
  {
    tipoNome: 'Social',
    aptidoes: [aptidaoSocialMock],
  },
];

// ============================================================
// Helper de render
// ============================================================

async function renderStep(options: {
  aptidoesAgrupadas?: TipoAptidaoComAptidoes[];
  pontosDisponiveis?: number;
} = {}) {
  const result = await render(StepAptidoesComponent, {
    schemas: [NO_ERRORS_SCHEMA],
    detectChangesOnRender: false,
  });

  const comp = result.fixture.componentInstance;

  setSignalInput(comp, 'aptidoesAgrupadas', options.aptidoesAgrupadas ?? aptidoesAgrupadasMock);
  setSignalInput(comp, 'pontosDisponiveis', options.pontosDisponiveis ?? 10);

  result.fixture.detectChanges();
  await result.fixture.whenStable();

  return result;
}

/**
 * Retorna todos os botoes <button> internos dos p-button renderizados.
 */
function getBotoesNativos(nativeEl: HTMLElement): HTMLButtonElement[] {
  return Array.from(nativeEl.querySelectorAll('p-button button'));
}

// ============================================================
// Testes
// ============================================================

describe('StepAptidoesComponent', () => {

  // ----------------------------------------------------------
  // 1. Renderizacao e agrupamento
  // ----------------------------------------------------------

  describe('renderizacao e agrupamento', () => {
    it('renderiza aptidoes agrupadas por tipo', async () => {
      await renderStep();

      expect(screen.getByText('Combate')).toBeTruthy();
      expect(screen.getByText('Social')).toBeTruthy();
    });

    it('exibe o nome de cada aptidao', async () => {
      await renderStep();

      expect(screen.getByText('Espada')).toBeTruthy();
      expect(screen.getByText('Arco')).toBeTruthy();
      expect(screen.getByText('Persuasao')).toBeTruthy();
    });

    it('exibe a base de cada aptidao', async () => {
      const { fixture } = await renderStep();
      const texto = fixture.nativeElement.textContent as string;

      // Espada base=2, Arco base=0, Persuasao base=1
      expect(texto).toContain('2');
      expect(texto).toContain('1');
    });

    it('exibe sorte quando diferente de 0', async () => {
      const { fixture } = await renderStep();
      const texto = fixture.nativeElement.textContent as string;

      // aptidaoCombateMock.sorte = 1 → deve aparecer
      expect(texto).toContain('Sorte');
      expect(texto).toContain('+1');
    });

    it('exibe classe quando diferente de 0', async () => {
      const { fixture } = await renderStep();
      const texto = fixture.nativeElement.textContent as string;

      // aptidaoSocialMock.classe = 2 → deve aparecer
      expect(texto).toContain('Classe');
      expect(texto).toContain('+2');
    });
  });

  // ----------------------------------------------------------
  // 2. Computed signals
  // ----------------------------------------------------------

  describe('computed signals', () => {
    it('pontosUtilizados e a soma de todos os base', async () => {
      // base: Espada=2, Arco=0, Persuasao=1 → total=3
      const { fixture } = await renderStep({ pontosDisponiveis: 10 });
      expect(fixture.componentInstance.pontosUtilizados()).toBe(3);
    });

    it('pontosRestantes e disponivel menos utilizado', async () => {
      const { fixture } = await renderStep({ pontosDisponiveis: 10 });
      // utilizados=3, restantes=10-3=7
      expect(fixture.componentInstance.pontosRestantes()).toBe(7);
    });

    it('pontosRestantes nao vai abaixo de 0', async () => {
      const { fixture } = await renderStep({ pontosDisponiveis: 2 });
      // utilizados=3 > disponivel=2 → max(0, -1) = 0
      expect(fixture.componentInstance.pontosRestantes()).toBe(0);
    });

    it('mensagemInfo contem a quantidade de pontos restantes', async () => {
      const { fixture } = await renderStep({ pontosDisponiveis: 10 });
      const mensagem = fixture.componentInstance.mensagemInfo();
      expect(mensagem).toContain('7');
    });

    it('pontosUtilizados e 0 quando nao ha aptidoes', async () => {
      const { fixture } = await renderStep({ aptidoesAgrupadas: [], pontosDisponiveis: 10 });
      expect(fixture.componentInstance.pontosUtilizados()).toBe(0);
    });

    it('pontosRestantes igual a pontosDisponiveis quando nao ha aptidoes', async () => {
      const { fixture } = await renderStep({ aptidoesAgrupadas: [], pontosDisponiveis: 10 });
      expect(fixture.componentInstance.pontosRestantes()).toBe(10);
    });
  });

  // ----------------------------------------------------------
  // 3. Incrementar aptidao
  // ----------------------------------------------------------

  describe('incrementar aptidao', () => {
    it('emite aptidoesChanged com base incrementado ao clicar em [+]', async () => {
      const { fixture } = await renderStep({ pontosDisponiveis: 10 });
      const comp = fixture.componentInstance;

      const emitSpy = vi.fn();
      comp.aptidoesChanged.subscribe(emitSpy);

      // Botoes por aptidao: [dim-Espada, aum-Espada, dim-Arco, aum-Arco, dim-Persuasao, aum-Persuasao]
      const botoes = getBotoesNativos(fixture.nativeElement);
      const aumentarArco = botoes[3]; // indice 3 = [+] de Arco (base=0)
      aumentarArco.click();
      fixture.detectChanges();

      expect(emitSpy).toHaveBeenCalledOnce();
      const emitido = emitSpy.mock.calls[0][0] as FichaAptidaoEditavel[];
      const arcoAtualizado = emitido.find((a) => a.aptidaoConfigId === 2);
      expect(arcoAtualizado?.base).toBe(1);
    });

    it('botao [+] esta desabilitado quando pontosRestantes === 0', async () => {
      // pontosDisponiveis=3, utilizados=3 → restantes=0
      const { fixture } = await renderStep({ pontosDisponiveis: 3 });
      const botoes = getBotoesNativos(fixture.nativeElement);
      // Botoes aumento: indices impares [1, 3, 5]
      const aumentarEspada = botoes[1];
      const aumentarArco = botoes[3];
      const aumentarPersuasao = botoes[5];
      expect(aumentarEspada.disabled).toBe(true);
      expect(aumentarArco.disabled).toBe(true);
      expect(aumentarPersuasao.disabled).toBe(true);
    });

    it('nao emite quando pontosRestantes === 0', async () => {
      const { fixture } = await renderStep({ pontosDisponiveis: 3 });
      const comp = fixture.componentInstance;

      const emitSpy = vi.fn();
      comp.aptidoesChanged.subscribe(emitSpy);

      const botoes = getBotoesNativos(fixture.nativeElement);
      const aumentarEspada = botoes[1]; // desabilitado, clique nao deve propagar
      aumentarEspada.click();
      fixture.detectChanges();

      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('emite lista achatada com todas as aptidoes ao incrementar', async () => {
      const { fixture } = await renderStep({ pontosDisponiveis: 10 });
      const comp = fixture.componentInstance;

      const emitSpy = vi.fn();
      comp.aptidoesChanged.subscribe(emitSpy);

      const botoes = getBotoesNativos(fixture.nativeElement);
      const aumentarArco = botoes[3];
      aumentarArco.click();
      fixture.detectChanges();

      const emitido = emitSpy.mock.calls[0][0] as FichaAptidaoEditavel[];
      // Deve conter todas as 3 aptidoes achatadas
      expect(emitido.length).toBe(3);
      expect(emitido.find((a) => a.aptidaoConfigId === 1)?.base).toBe(2); // Espada: inalterada
      expect(emitido.find((a) => a.aptidaoConfigId === 2)?.base).toBe(1); // Arco: incrementado
      expect(emitido.find((a) => a.aptidaoConfigId === 3)?.base).toBe(1); // Persuasao: inalterada
    });
  });

  // ----------------------------------------------------------
  // 4. Decrementar aptidao
  // ----------------------------------------------------------

  describe('decrementar aptidao', () => {
    it('emite aptidoesChanged com base decrementado ao clicar em [-]', async () => {
      const { fixture } = await renderStep({ pontosDisponiveis: 10 });
      const comp = fixture.componentInstance;

      const emitSpy = vi.fn();
      comp.aptidoesChanged.subscribe(emitSpy);

      // [dim-Espada(0), aum-Espada(1), ...]
      const botoes = getBotoesNativos(fixture.nativeElement);
      const diminuirEspada = botoes[0]; // base=2, pode decrementar
      diminuirEspada.click();
      fixture.detectChanges();

      expect(emitSpy).toHaveBeenCalledOnce();
      const emitido = emitSpy.mock.calls[0][0] as FichaAptidaoEditavel[];
      const espadaAtualizada = emitido.find((a) => a.aptidaoConfigId === 1);
      expect(espadaAtualizada?.base).toBe(1);
    });

    it('botao [-] esta desabilitado quando base === 0', async () => {
      const { fixture } = await renderStep({ pontosDisponiveis: 10 });
      const botoes = getBotoesNativos(fixture.nativeElement);
      // Arco tem base=0, seu [-] e o indice 2
      const diminuirArco = botoes[2];
      expect(diminuirArco.disabled).toBe(true);
    });

    it('nao emite quando base ja e 0', async () => {
      const { fixture } = await renderStep({ pontosDisponiveis: 10 });
      const comp = fixture.componentInstance;

      const emitSpy = vi.fn();
      comp.aptidoesChanged.subscribe(emitSpy);

      const botoes = getBotoesNativos(fixture.nativeElement);
      const diminuirArco = botoes[2]; // base=0, desabilitado
      diminuirArco.click();
      fixture.detectChanges();

      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('emite lista achatada com todas as aptidoes ao decrementar', async () => {
      const { fixture } = await renderStep({ pontosDisponiveis: 10 });
      const comp = fixture.componentInstance;

      const emitSpy = vi.fn();
      comp.aptidoesChanged.subscribe(emitSpy);

      const botoes = getBotoesNativos(fixture.nativeElement);
      const diminuirPersuasao = botoes[4]; // Persuasao tem base=1
      diminuirPersuasao.click();
      fixture.detectChanges();

      const emitido = emitSpy.mock.calls[0][0] as FichaAptidaoEditavel[];
      expect(emitido.length).toBe(3);
      expect(emitido.find((a) => a.aptidaoConfigId === 3)?.base).toBe(0); // Persuasao: decrementada
    });
  });

  // ----------------------------------------------------------
  // 5. Sorte e classe sao somente leitura
  // ----------------------------------------------------------

  describe('sorte e classe somente leitura', () => {
    it('nao ha botoes de edicao para sorte — apenas 2 botoes por aptidao (base only)', async () => {
      const { fixture } = await renderStep();
      const botoes = getBotoesNativos(fixture.nativeElement);
      // 3 aptidoes × 2 botoes (- e +) = 6 botoes total
      // Se houvesse edicao de sorte/classe, haveria mais botoes
      expect(botoes.length).toBe(6);
    });
  });

  // ----------------------------------------------------------
  // 6. Estado vazio
  // ----------------------------------------------------------

  describe('estado vazio', () => {
    it('renderiza sem erros quando aptidoesAgrupadas esta vazia', async () => {
      const { fixture } = await renderStep({ aptidoesAgrupadas: [], pontosDisponiveis: 10 });
      expect(fixture.componentInstance).toBeTruthy();
    });

    it('exibe mensagem informativa mesmo sem aptidoes', async () => {
      const { fixture } = await renderStep({ aptidoesAgrupadas: [], pontosDisponiveis: 10 });
      const mensagem = fixture.componentInstance.mensagemInfo();
      expect(mensagem).toContain('10'); // pontosRestantes = 10
    });
  });

});
