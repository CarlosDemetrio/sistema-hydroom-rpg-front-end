/**
 * FichaVantagensTabComponent — Spec
 *
 * Componente dumb: recebe dados via input() e emite eventos via output().
 *
 * NOTA JIT (Armadilha 1): O componente tem input.required() (vantagens).
 * Em JIT, Zone.js dispara CD antes do valor ser atribuido, causando NG0950.
 * Solucao: detectChangesOnRender: false + setSignalInput() antes de detectChanges().
 *
 * Cenarios cobertos:
 * 1.  Mestre ve botao "Conceder Insolitus"
 * 2.  Jogador NAO ve botao "Conceder Insolitus"
 * 3.  Estado vazio exibe mensagem adequada
 * 4.  Vantagens normais exibem custo pago
 * 5.  Vantagens INSOLITUS exibem "Concedida pelo Mestre" (sem custo)
 * 6.  Tag "Insolitus" exibida para vantagens do tipo INSOLITUS
 * 7.  Botao revogar visivel apenas para Mestre
 * 8.  Ao clicar revogar, emite revogarVantagem com id correto
 * 9.  Dialog abre ao clicar em Conceder Insolitus
 * 10. Dialog filtra vantagens por busca (via computed signal)
 * 11. Confirmar emite concederInsolitusConfirmado com vantagemConfigId
 * 12. insoliusSelecionadoId inicia null (botao desabilitado)
 * 13. resetarConcedendo(true) fecha o dialog e limpa selecao
 */

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { render, screen, fireEvent } from '@testing-library/angular';
import { ɵSIGNAL as SIGNAL_SYM } from '@angular/core';
import { vi } from 'vitest';

import { FichaVantagensTabComponent } from './ficha-vantagens-tab.component';
import { FichaVantagemResponse } from '@core/models/ficha.model';
import { VantagemConfig } from '@core/models/vantagem-config.model';

// ============================================================
// Helper JIT (Armadilha 1): atribuir valor a input.required() signal
// antes do primeiro detectChanges().
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

const vantagemNormalMock: FichaVantagemResponse = {
  id: 1,
  vantagemConfigId: 10,
  nomeVantagem: 'Furia Berserker',
  nivelAtual: 2,
  nivelMaximo: 3,
  custoPago: 4,
  tipoVantagem: 'VANTAGEM',
};

const vantagemInsolutusMock: FichaVantagemResponse = {
  id: 2,
  vantagemConfigId: 20,
  nomeVantagem: 'Visao Arcana',
  nivelAtual: 1,
  nivelMaximo: 1,
  custoPago: 0,
  tipoVantagem: 'INSOLITUS',
};

const insoliusConfigMock: VantagemConfig = {
  id: 20,
  jogoId: 10,
  nome: 'Visao Arcana',
  sigla: 'VA',
  descricao: 'Ver o invisivel.',
  categoriaVantagemId: 3,
  categoriaNome: 'Magico',
  nivelMaximo: 1,
  formulaCusto: null,
  descricaoEfeito: 'Permite ver criaturas e objetos invisiveis.',
  ordemExibicao: 1,
  tipoVantagem: 'INSOLITUS',
  preRequisitos: [],
  efeitos: [],
  dataCriacao: '2024-01-01T00:00:00',
  dataUltimaAtualizacao: '2024-01-01T00:00:00',
};

const insoliusConfig2Mock: VantagemConfig = {
  ...insoliusConfigMock,
  id: 21,
  nome: 'Bencao Divina',
  sigla: 'BD',
  descricaoEfeito: 'Recebe bencao dos deuses.',
};

// ============================================================
// Helper de render
// Usa detectChangesOnRender: false + setSignalInput para evitar NG0950
// em JIT antes de alimentar o input.required().
// ============================================================

type RenderOptions = {
  vantagens?: FichaVantagemResponse[];
  pontosVantagemRestantes?: number;
  podeAumentarNivel?: boolean;
  isMestre?: boolean;
  vantagensInsolitusConfig?: VantagemConfig[];
};

async function renderComponent(opts: RenderOptions = {}) {
  const result = await render(FichaVantagensTabComponent, {
    schemas: [NO_ERRORS_SCHEMA],
    detectChangesOnRender: false,
  });

  const component = result.fixture.componentInstance;

  // Alimentar signals ANTES do primeiro detectChanges
  setSignalInput(component, 'vantagens', opts.vantagens ?? []);
  setSignalInput(component, 'pontosVantagemRestantes', opts.pontosVantagemRestantes ?? 0);
  setSignalInput(component, 'podeAumentarNivel', opts.podeAumentarNivel ?? false);
  setSignalInput(component, 'isMestre', opts.isMestre ?? false);
  setSignalInput(component, 'vantagensInsolitusConfig', opts.vantagensInsolitusConfig ?? []);

  result.fixture.detectChanges();

  return result;
}

// ============================================================
// Testes
// ============================================================

describe('FichaVantagensTabComponent', () => {

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  // ----------------------------------------------------------
  // 1 & 2. Visibilidade botao "Conceder Insolitus"
  // ----------------------------------------------------------

  describe('botao Conceder Insolitus', () => {
    it('deve exibir botao "Conceder Insolitus" quando isMestre=true', async () => {
      await renderComponent({ isMestre: true });

      expect(screen.getByRole('button', { name: /Conceder Insolitus/i })).toBeTruthy();
    });

    it('NAO deve exibir botao "Conceder Insolitus" quando isMestre=false', async () => {
      await renderComponent({ isMestre: false });

      expect(screen.queryByRole('button', { name: /Conceder Insolitus/i })).toBeNull();
    });
  });

  // ----------------------------------------------------------
  // 3. Estado vazio
  // ----------------------------------------------------------

  describe('estado vazio', () => {
    it('deve exibir mensagem de estado vazio quando nao ha vantagens', async () => {
      await renderComponent({ vantagens: [] });

      expect(screen.getByText(/Nenhuma vantagem concedida ainda/i)).toBeTruthy();
    });
  });

  // ----------------------------------------------------------
  // 4, 5, 6. Exibicao de vantagens
  // ----------------------------------------------------------

  describe('exibicao de vantagens', () => {
    it('deve exibir custo pago para vantagem normal', async () => {
      await renderComponent({ vantagens: [vantagemNormalMock] });

      expect(screen.getByText(/Custo pago: 4 pontos/i)).toBeTruthy();
    });

    it('deve exibir "Concedida pelo Mestre" para vantagem INSOLITUS', async () => {
      await renderComponent({ vantagens: [vantagemInsolutusMock] });

      expect(screen.getByText(/Concedida pelo Mestre \(sem custo\)/i)).toBeTruthy();
    });

    it('deve exibir texto "Insolitus" para vantagem do tipo INSOLITUS', async () => {
      await renderComponent({ vantagens: [vantagemInsolutusMock] });

      expect(screen.getByText('Insolitus')).toBeTruthy();
    });
  });

  // ----------------------------------------------------------
  // 7 & 8. Botao revogar
  // ----------------------------------------------------------

  describe('botao revogar', () => {
    it('deve exibir p-button de revogar para cada vantagem quando isMestre=true', async () => {
      const { fixture } = await renderComponent({
        isMestre: true,
        vantagens: [vantagemNormalMock, vantagemInsolutusMock],
      });

      // p-button nao propaga aria-label para o <button> interno no JSDOM.
      // Verificamos via querySelector no host element da p-button.
      const botoes = fixture.nativeElement.querySelectorAll(
        'p-button[aria-label^="Revogar vantagem"]'
      ) as NodeListOf<Element>;
      expect(botoes.length).toBe(2);
    });

    it('NAO deve exibir p-button de revogar quando isMestre=false', async () => {
      const { fixture } = await renderComponent({
        isMestre: false,
        vantagens: [vantagemNormalMock],
      });

      const botoes = fixture.nativeElement.querySelectorAll(
        'p-button[aria-label^="Revogar vantagem"]'
      ) as NodeListOf<Element>;
      expect(botoes.length).toBe(0);
    });

    it('deve emitir revogarVantagem com id correto ao clicar no botao revogar', async () => {
      const { fixture } = await renderComponent({
        isMestre: true,
        vantagens: [vantagemNormalMock],
      });

      const component = fixture.componentInstance;
      const revogarSpy = vi.fn();
      component.revogarVantagem.subscribe(revogarSpy);

      // Clicar no <button> interno do p-button de revogar
      const pButton = fixture.nativeElement.querySelector(
        `p-button[aria-label="Revogar vantagem ${vantagemNormalMock.nomeVantagem}"]`
      ) as HTMLElement;
      const botaoNativo = pButton.querySelector('button') as HTMLButtonElement;
      fireEvent.click(botaoNativo);

      expect(revogarSpy).toHaveBeenCalledWith(vantagemNormalMock.id);
    });
  });

  // ----------------------------------------------------------
  // 9. Dialog Conceder Insolitus abre
  // ----------------------------------------------------------

  describe('dialog Conceder Insolitus', () => {
    it('deve abrir dialog (dialogInsoliusAberto=true) ao clicar em Conceder Insolitus', async () => {
      const { fixture } = await renderComponent({
        isMestre: true,
        vantagensInsolitusConfig: [insoliusConfigMock],
      });

      const component = fixture.componentInstance;
      const getAberto = () =>
        (component as unknown as { dialogInsoliusAberto: { (): boolean } }).dialogInsoliusAberto();

      expect(getAberto()).toBe(false);

      const botao = screen.getByRole('button', { name: /Conceder Insolitus/i });
      fireEvent.click(botao);
      fixture.detectChanges();

      expect(getAberto()).toBe(true);
    });
  });

  // ----------------------------------------------------------
  // 10. Filtro por busca no dialog (signal computed)
  // ----------------------------------------------------------

  describe('filtro de busca no dialog', () => {
    it('deve filtrar vantagens pelo texto de busca via computed', async () => {
      const { fixture } = await renderComponent({
        isMestre: true,
        vantagensInsolitusConfig: [insoliusConfigMock, insoliusConfig2Mock],
      });

      const component = fixture.componentInstance;

      (component as unknown as { buscaInsolitus: { set: (v: string) => void } }).buscaInsolitus.set('visao');
      fixture.detectChanges();

      const disponiveis = (component as unknown as {
        vantagensInsolitusDisponiveis: { (): VantagemConfig[] };
      }).vantagensInsolitusDisponiveis();

      expect(disponiveis).toHaveLength(1);
      expect(disponiveis[0].nome).toBe('Visao Arcana');
    });

    it('deve retornar todas as vantagens quando busca esta vazia', async () => {
      const { fixture } = await renderComponent({
        isMestre: true,
        vantagensInsolitusConfig: [insoliusConfigMock, insoliusConfig2Mock],
      });

      const component = fixture.componentInstance;
      const disponiveis = (component as unknown as {
        vantagensInsolitusDisponiveis: { (): VantagemConfig[] };
      }).vantagensInsolitusDisponiveis();

      expect(disponiveis).toHaveLength(2);
    });
  });

  // ----------------------------------------------------------
  // 11. Emissao de concederInsolitusConfirmado
  // ----------------------------------------------------------

  describe('confirmar concessao de Insolitus', () => {
    it('deve emitir concederInsolitusConfirmado com id quando insoliusSelecionadoId definido', async () => {
      const { fixture } = await renderComponent({
        isMestre: true,
        vantagensInsolitusConfig: [insoliusConfigMock],
      });

      const component = fixture.componentInstance;
      const confirmadoSpy = vi.fn();
      component.concederInsolitusConfirmado.subscribe(confirmadoSpy);

      // Selecionar e confirmar diretamente
      (component as unknown as { insoliusSelecionadoId: { set: (v: number) => void } })
        .insoliusSelecionadoId.set(insoliusConfigMock.id);

      (component as unknown as { confirmarConcederInsolitus: () => void })
        .confirmarConcederInsolitus();

      expect(confirmadoSpy).toHaveBeenCalledWith(insoliusConfigMock.id);
    });

    it('NAO deve emitir quando insoliusSelecionadoId e null', async () => {
      const { fixture } = await renderComponent({ isMestre: true });

      const component = fixture.componentInstance;
      const confirmadoSpy = vi.fn();
      component.concederInsolitusConfirmado.subscribe(confirmadoSpy);

      (component as unknown as { confirmarConcederInsolitus: () => void })
        .confirmarConcederInsolitus();

      expect(confirmadoSpy).not.toHaveBeenCalled();
    });
  });

  // ----------------------------------------------------------
  // 12. insoliusSelecionadoId inicia null
  // ----------------------------------------------------------

  describe('estado inicial do dialog', () => {
    it('deve iniciar sem selecao — insoliusSelecionadoId null', async () => {
      const { fixture } = await renderComponent({ isMestre: true });

      const component = fixture.componentInstance;
      const idSelecionado = (component as unknown as { insoliusSelecionadoId: { (): number | null } })
        .insoliusSelecionadoId();
      expect(idSelecionado).toBeNull();
    });
  });

  // ----------------------------------------------------------
  // 13. resetarConcedendo fecha dialog e limpa selecao
  // ----------------------------------------------------------

  describe('resetarConcedendo', () => {
    it('deve fechar o dialog e limpar selecao quando resetarConcedendo(true) e chamado', async () => {
      const { fixture } = await renderComponent({
        isMestre: true,
        vantagensInsolitusConfig: [insoliusConfigMock],
      });

      const component = fixture.componentInstance;

      // Abrir dialog e selecionar uma vantagem
      (component as unknown as { dialogInsoliusAberto: { set: (v: boolean) => void } })
        .dialogInsoliusAberto.set(true);
      (component as unknown as { insoliusSelecionadoId: { set: (v: number) => void } })
        .insoliusSelecionadoId.set(insoliusConfigMock.id);
      fixture.detectChanges();

      // Verificar que esta aberto e com selecao
      expect(
        (component as unknown as { dialogInsoliusAberto: { (): boolean } }).dialogInsoliusAberto()
      ).toBe(true);

      // Chamar resetarConcedendo(true)
      component.resetarConcedendo(true);
      fixture.detectChanges();

      const aberto = (component as unknown as { dialogInsoliusAberto: { (): boolean } })
        .dialogInsoliusAberto();
      const selecionado = (component as unknown as { insoliusSelecionadoId: { (): number | null } })
        .insoliusSelecionadoId();

      expect(aberto).toBe(false);
      expect(selecionado).toBeNull();
    });

    it('deve manter o dialog aberto quando resetarConcedendo(false) e chamado', async () => {
      const { fixture } = await renderComponent({ isMestre: true });

      const component = fixture.componentInstance;
      (component as unknown as { dialogInsoliusAberto: { set: (v: boolean) => void } })
        .dialogInsoliusAberto.set(true);

      component.resetarConcedendo(false);
      fixture.detectChanges();

      const aberto = (component as unknown as { dialogInsoliusAberto: { (): boolean } })
        .dialogInsoliusAberto();
      expect(aberto).toBe(true);
    });
  });
});
