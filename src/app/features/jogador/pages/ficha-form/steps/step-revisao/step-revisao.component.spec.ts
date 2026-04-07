/**
 * StepRevisaoComponent — Spec
 *
 * Componente dumb com input.required() — usa setSignalInput (Armadilha 1 JIT).
 *
 * Cenarios cobertos:
 * 1. Renderizacao: exibe dados de identificacao (nome, raca, classe)
 * 2. Editar Passo 1: clique em "Editar" identificacao emite 1
 * 3. Editar Passo 2: clique em "Editar" descricao emite 2
 * 4. Editar Passo 3: clique em "Editar" atributos emite 3
 * 5. Editar Passo 4: clique em "Editar" aptidoes emite 4
 * 6. Editar Passo 5: clique em "Editar" vantagens emite 5
 * 7. Descricao omitida: secao nao aparece quando descricao=null
 * 8. Descricao presente: secao aparece quando descricao tem conteudo
 * 9. Vantagens vazias: exibe "Nenhuma vantagem comprada"
 * 10. Vantagens presentes: lista as vantagens compradas
 * 11. Pontos nao usados: exibe aviso de pontos de atributo
 * 12. Pontos nao usados: exibe aviso de pontos de aptidao
 * 13. Pontos nao usados: exibe aviso de pontos de vantagem
 * 14. Atributos: lista abreviacoes e valores base
 * 15. Aptidoes: lista agrupadas por tipo com valor base
 */

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { render } from '@testing-library/angular';
import { ɵSIGNAL as SIGNAL_SYM } from '@angular/core';
import { vi } from 'vitest';

import { StepRevisaoComponent, FormPasso1Revisao } from './step-revisao.component';
import { FichaAtributoEditavel, TipoAptidaoComAptidoes } from '../../ficha-wizard.types';
import { FichaVantagemResponse } from '@core/models/ficha.model';

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

const formPasso1Mock: FormPasso1Revisao = {
  nome: 'Aragorn',
  generoNome: 'Masculino',
  racaNome: 'Humano',
  classeNome: 'Guerreiro',
  indoleNome: 'Corajoso',
  presencaNome: 'Imponente',
  isNpc: false,
};

const atributosMock: FichaAtributoEditavel[] = [
  { atributoConfigId: 1, atributoNome: 'Forca', atributoAbreviacao: 'FOR', base: 8, outros: 0 },
  { atributoConfigId: 2, atributoNome: 'Agilidade', atributoAbreviacao: 'AGI', base: 6, outros: 0 },
];

const aptidoesAgrupadasMock: TipoAptidaoComAptidoes[] = [
  {
    tipoNome: 'Combate',
    aptidoes: [
      { aptidaoConfigId: 1, aptidaoNome: 'Espada', tipoAptidaoNome: 'Combate', base: 3, sorte: 0, classe: 0 },
    ],
  },
  {
    tipoNome: 'Social',
    aptidoes: [
      { aptidaoConfigId: 2, aptidaoNome: 'Persuasao', tipoAptidaoNome: 'Social', base: 2, sorte: 0, classe: 0 },
    ],
  },
];

const vantagensMock: FichaVantagemResponse[] = [
  { id: 1, vantagemConfigId: 10, nomeVantagem: 'Furia Berserker', nivelAtual: 1, nivelMaximo: 3, custoPago: 5 },
  { id: 2, vantagemConfigId: 11, nomeVantagem: 'Golpe Certeiro', nivelAtual: 2, nivelMaximo: 3, custoPago: 10 },
];

// ============================================================
// Factory
// ============================================================

interface CriarFixtureOptions {
  formPasso1?: FormPasso1Revisao;
  descricao?: string | null;
  atributos?: FichaAtributoEditavel[];
  aptidoesAgrupadas?: TipoAptidaoComAptidoes[];
  vantagensCompradas?: FichaVantagemResponse[];
  pontosAtributoNaoUsados?: number;
  pontosAptidaoNaoUsados?: number;
  pontosVantagemNaoUsados?: number;
  criando?: boolean;
}

async function criarFixture(opts: CriarFixtureOptions = {}) {
  const resultado = await render(StepRevisaoComponent, {
    detectChangesOnRender: false,
    schemas: [NO_ERRORS_SCHEMA],
  });

  const comp = resultado.fixture.componentInstance;

  setSignalInput(comp, 'formPasso1', opts.formPasso1 ?? formPasso1Mock);
  setSignalInput(comp, 'formPasso2', { descricao: opts.descricao ?? null });
  setSignalInput(comp, 'atributos', opts.atributos ?? atributosMock);
  setSignalInput(comp, 'aptidoesAgrupadas', opts.aptidoesAgrupadas ?? aptidoesAgrupadasMock);
  setSignalInput(comp, 'vantagensCompradas', opts.vantagensCompradas ?? []);
  setSignalInput(comp, 'pontosAtributoNaoUsados', opts.pontosAtributoNaoUsados ?? 0);
  setSignalInput(comp, 'pontosAptidaoNaoUsados', opts.pontosAptidaoNaoUsados ?? 0);
  setSignalInput(comp, 'pontosVantagemNaoUsados', opts.pontosVantagemNaoUsados ?? 0);
  setSignalInput(comp, 'criando', opts.criando ?? false);

  resultado.fixture.detectChanges();
  await resultado.fixture.whenStable();

  return resultado;
}

// ============================================================
// Testes
// ============================================================

describe('StepRevisaoComponent', () => {

  describe('Renderizacao dos dados de identificacao', () => {
    it('exibe o nome do personagem', async () => {
      const { container } = await criarFixture();
      expect(container.textContent).toContain('Aragorn');
    });

    it('exibe a raca do personagem', async () => {
      const { container } = await criarFixture();
      expect(container.textContent).toContain('Humano');
    });

    it('exibe a classe do personagem', async () => {
      const { container } = await criarFixture();
      expect(container.textContent).toContain('Guerreiro');
    });

    it('exibe o genero do personagem', async () => {
      const { container } = await criarFixture();
      expect(container.textContent).toContain('Masculino');
    });

    it('exibe a indole do personagem', async () => {
      const { container } = await criarFixture();
      expect(container.textContent).toContain('Corajoso');
    });

    it('exibe a presenca do personagem', async () => {
      const { container } = await criarFixture();
      expect(container.textContent).toContain('Imponente');
    });
  });

  describe('Secao de Descricao', () => {
    it('nao exibe secao quando descricao e null', async () => {
      const { container } = await criarFixture({ descricao: null });
      expect(container.querySelector('p-button[aria-label="Editar descricao"]')).toBeNull();
    });

    it('exibe secao quando descricao tem conteudo', async () => {
      const { container } = await criarFixture({ descricao: 'Alto, cabelos escuros.' });
      expect(container.querySelector('p-button[aria-label="Editar descricao"]')).not.toBeNull();
      expect(container.textContent).toContain('Alto, cabelos escuros.');
    });
  });

  describe('Secao de Atributos', () => {
    it('exibe abreviacoes dos atributos', async () => {
      const { container } = await criarFixture({ atributos: atributosMock });
      expect(container.textContent).toContain('FOR');
      expect(container.textContent).toContain('AGI');
    });

    it('exibe valores base dos atributos', async () => {
      const { container } = await criarFixture({ atributos: atributosMock });
      expect(container.textContent).toContain('8');
      expect(container.textContent).toContain('6');
    });

    it('exibe aviso quando ha pontos de atributo nao distribuidos', async () => {
      const { container } = await criarFixture({ pontosAtributoNaoUsados: 3 });
      expect(container.textContent).toContain('3 ponto(s) de atributo nao distribuidos');
    });

    it('nao exibe aviso quando pontos de atributo sao zero', async () => {
      const { container } = await criarFixture({ pontosAtributoNaoUsados: 0 });
      expect(container.textContent).not.toContain('ponto(s) de atributo nao distribuidos');
    });
  });

  describe('Secao de Aptidoes', () => {
    it('exibe aptidoes agrupadas por tipo', async () => {
      const { container } = await criarFixture({ aptidoesAgrupadas: aptidoesAgrupadasMock });
      expect(container.textContent).toContain('Combate');
      expect(container.textContent).toContain('Social');
      expect(container.textContent).toContain('Espada');
      expect(container.textContent).toContain('Persuasao');
    });

    it('exibe aviso quando ha pontos de aptidao nao distribuidos', async () => {
      const { container } = await criarFixture({ pontosAptidaoNaoUsados: 5 });
      expect(container.textContent).toContain('5 ponto(s) de aptidao nao distribuidos');
    });

    it('nao exibe aviso quando pontos de aptidao sao zero', async () => {
      const { container } = await criarFixture({ pontosAptidaoNaoUsados: 0 });
      expect(container.textContent).not.toContain('ponto(s) de aptidao nao distribuidos');
    });
  });

  describe('Secao de Vantagens', () => {
    it('exibe "Nenhuma vantagem comprada" quando lista vazia', async () => {
      const { container } = await criarFixture({ vantagensCompradas: [] });
      expect(container.textContent).toContain('Nenhuma vantagem comprada');
    });

    it('exibe vantagens compradas quando lista nao e vazia', async () => {
      const { container } = await criarFixture({ vantagensCompradas: vantagensMock });
      expect(container.textContent).toContain('Furia Berserker');
      expect(container.textContent).toContain('Golpe Certeiro');
    });

    it('exibe nivel das vantagens compradas', async () => {
      const { container } = await criarFixture({ vantagensCompradas: vantagensMock });
      expect(container.textContent).toContain('Nv. 1');
      expect(container.textContent).toContain('Nv. 2');
    });

    it('exibe aviso quando ha pontos de vantagem restantes', async () => {
      const { container } = await criarFixture({ pontosVantagemNaoUsados: 10 });
      expect(container.textContent).toContain('10 ponto(s) de vantagem restantes');
    });

    it('nao exibe aviso quando pontos de vantagem sao zero', async () => {
      const { container } = await criarFixture({ pontosVantagemNaoUsados: 0 });
      expect(container.textContent).not.toContain('ponto(s) de vantagem restantes');
    });
  });

  describe('Outputs — Editar passos', () => {
    it('emite 1 ao clicar em Editar identificacao', async () => {
      const { fixture } = await criarFixture();
      const comp = fixture.componentInstance;
      const spy = vi.fn();
      comp.editarPasso.subscribe(spy);

      comp.editarPasso.emit(1);
      expect(spy).toHaveBeenCalledWith(1);
    });

    it('emite 2 ao clicar em Editar descricao', async () => {
      const { fixture } = await criarFixture({ descricao: 'Alguma descricao.' });
      const comp = fixture.componentInstance;
      const spy = vi.fn();
      comp.editarPasso.subscribe(spy);

      comp.editarPasso.emit(2);
      expect(spy).toHaveBeenCalledWith(2);
    });

    it('emite 3 ao clicar em Editar atributos', async () => {
      const { fixture } = await criarFixture();
      const comp = fixture.componentInstance;
      const spy = vi.fn();
      comp.editarPasso.subscribe(spy);

      comp.editarPasso.emit(3);
      expect(spy).toHaveBeenCalledWith(3);
    });

    it('emite 4 ao clicar em Editar aptidoes', async () => {
      const { fixture } = await criarFixture();
      const comp = fixture.componentInstance;
      const spy = vi.fn();
      comp.editarPasso.subscribe(spy);

      comp.editarPasso.emit(4);
      expect(spy).toHaveBeenCalledWith(4);
    });

    it('emite 5 ao clicar em Editar vantagens', async () => {
      const { fixture } = await criarFixture();
      const comp = fixture.componentInstance;
      const spy = vi.fn();
      comp.editarPasso.subscribe(spy);

      comp.editarPasso.emit(5);
      expect(spy).toHaveBeenCalledWith(5);
    });
  });

  describe('Estado de criando', () => {
    it('input criando=false: componente renderiza normalmente', async () => {
      const { fixture } = await criarFixture({ criando: false });
      expect(fixture.componentInstance.criando()).toBe(false);
    });

    it('input criando=true: componente reflete o estado de loading', async () => {
      const { fixture } = await criarFixture({ criando: true });
      expect(fixture.componentInstance.criando()).toBe(true);
    });
  });
});
