/**
 * DadoUpPreviewComponent — Spec
 *
 * Componente dumb com inputs de signal. Usa o padrão JIT (Vitest sem plugin Angular):
 * render com NO_ERRORS_SCHEMA + detectChangesOnRender:false,
 * depois setSignalInput + detectChanges + whenStable.
 */

import { TestBed } from '@angular/core/testing';
import { render } from '@testing-library/angular';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ɵSIGNAL as SIGNAL_SYM } from '@angular/core';

import { DadoUpPreviewComponent } from './dado-up-preview.component';
import { DadoProspeccaoConfig } from '@core/models/config.models';

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

const dadosMock: DadoProspeccaoConfig[] = [
  { id: 10, jogoId: 10, nome: 'd4',  descricao: null, numeroFaces: 4,  ordemExibicao: 1, dataCriacao: '2024-01-01T00:00:00', dataUltimaAtualizacao: '2024-06-01T00:00:00' },
  { id: 11, jogoId: 10, nome: 'd6',  descricao: null, numeroFaces: 6,  ordemExibicao: 2, dataCriacao: '2024-01-01T00:00:00', dataUltimaAtualizacao: '2024-06-01T00:00:00' },
  { id: 12, jogoId: 10, nome: 'd8',  descricao: null, numeroFaces: 8,  ordemExibicao: 3, dataCriacao: '2024-01-01T00:00:00', dataUltimaAtualizacao: '2024-06-01T00:00:00' },
  { id: 13, jogoId: 10, nome: 'd10', descricao: null, numeroFaces: 10, ordemExibicao: 4, dataCriacao: '2024-01-01T00:00:00', dataUltimaAtualizacao: '2024-06-01T00:00:00' },
  { id: 14, jogoId: 10, nome: 'd12', descricao: null, numeroFaces: 12, ordemExibicao: 5, dataCriacao: '2024-01-01T00:00:00', dataUltimaAtualizacao: '2024-06-01T00:00:00' },
];

// ============================================================
// Helper de render
// ============================================================

async function renderDadoUpPreview(opcoes: {
  dados?: DadoProspeccaoConfig[];
  nivelMaximo?: number;
} = {}) {
  const result = await render(DadoUpPreviewComponent, {
    detectChangesOnRender: false,
    schemas: [NO_ERRORS_SCHEMA],
  });

  const comp = result.fixture.componentInstance;

  setSignalInput(comp, 'dadosOrdenados', opcoes.dados ?? dadosMock);
  setSignalInput(comp, 'nivelMaximo', opcoes.nivelMaximo ?? 10);

  result.fixture.detectChanges();
  await result.fixture.whenStable();

  return result;
}

// ============================================================
// Testes
// ============================================================

describe('DadoUpPreviewComponent', () => {

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  // ----------------------------------------------------------
  // 1. Renderização básica
  // ----------------------------------------------------------

  describe('renderização', () => {
    it('deve renderizar sem erros com lista de dados preenchida', async () => {
      const { fixture } = await renderDadoUpPreview();
      expect(fixture.componentInstance).toBeTruthy();
    });

    it('deve inicializar nivelPreview em 1', async () => {
      const { fixture } = await renderDadoUpPreview();
      const comp = fixture.componentInstance;
      expect(comp.nivelPreview()).toBe(1);
    });

    it('deve retornar o primeiro dado quando nivelPreview é 1', async () => {
      const { fixture } = await renderDadoUpPreview();
      const comp = fixture.componentInstance;

      expect(comp.dadoAtual()).not.toBeNull();
      expect(comp.dadoAtual()!.nome).toBe('d4');
    });

    it('deve retornar null quando a lista de dados está vazia', async () => {
      const { fixture } = await renderDadoUpPreview({ dados: [] });
      const comp = fixture.componentInstance;

      expect(comp.dadoAtual()).toBeNull();
    });
  });

  // ----------------------------------------------------------
  // 2. isDadoAtivo — destaque do dado no nível correto
  // ----------------------------------------------------------

  describe('isDadoAtivo', () => {
    it('deve ativar o dado na posição 0 quando nivelPreview é 1', async () => {
      const { fixture } = await renderDadoUpPreview();
      const comp = fixture.componentInstance;

      comp.nivelPreview.set(1);
      fixture.detectChanges();

      expect(comp.isDadoAtivo(0)).toBe(true);
      expect(comp.isDadoAtivo(1)).toBe(false);
      expect(comp.isDadoAtivo(2)).toBe(false);
    });

    it('deve ativar o dado correto para nivelPreview = 3 (posição 2)', async () => {
      const { fixture } = await renderDadoUpPreview();
      const comp = fixture.componentInstance;

      comp.nivelPreview.set(3);
      fixture.detectChanges();

      expect(comp.isDadoAtivo(0)).toBe(false);
      expect(comp.isDadoAtivo(1)).toBe(false);
      expect(comp.isDadoAtivo(2)).toBe(true);  // d8, posição 2
      expect(comp.isDadoAtivo(3)).toBe(false);
    });

    it('deve retornar false para qualquer posição quando a lista está vazia', async () => {
      const { fixture } = await renderDadoUpPreview({ dados: [] });
      const comp = fixture.componentInstance;

      expect(comp.isDadoAtivo(0)).toBe(false);
    });
  });

  // ----------------------------------------------------------
  // 3. isDadoCap — teto da progressão quando nível excede sequência
  // ----------------------------------------------------------

  describe('isDadoCap', () => {
    it('deve marcar o último dado como cap quando nivelPreview excede a quantidade de dados', async () => {
      const { fixture } = await renderDadoUpPreview({ nivelMaximo: 10 });
      const comp = fixture.componentInstance;

      comp.nivelPreview.set(10); // 10 > 5 dados disponíveis
      fixture.detectChanges();

      // posição 4 (último d12) deve ser cap
      expect(comp.isDadoCap(4)).toBe(true);
    });

    it('não deve marcar como cap quando nivelPreview está dentro da sequência', async () => {
      const { fixture } = await renderDadoUpPreview();
      const comp = fixture.componentInstance;

      comp.nivelPreview.set(3);
      fixture.detectChanges();

      expect(comp.isDadoCap(4)).toBe(false);
    });

    it('não deve marcar como cap posições que não são a última', async () => {
      const { fixture } = await renderDadoUpPreview({ nivelMaximo: 10 });
      const comp = fixture.componentInstance;

      comp.nivelPreview.set(10);
      fixture.detectChanges();

      expect(comp.isDadoCap(0)).toBe(false);
      expect(comp.isDadoCap(1)).toBe(false);
      expect(comp.isDadoCap(2)).toBe(false);
      expect(comp.isDadoCap(3)).toBe(false);
    });

    it('deve usar o último dado (com cap) quando nível ultrapassa máximo', async () => {
      const { fixture } = await renderDadoUpPreview({ nivelMaximo: 10 });
      const comp = fixture.componentInstance;

      comp.nivelPreview.set(10);
      fixture.detectChanges();

      const dadoResultante = comp.dadoAtual();
      expect(dadoResultante).not.toBeNull();
      expect(dadoResultante!.nome).toBe('d12'); // último da sequência
    });
  });

  // ----------------------------------------------------------
  // 4. dadoAtual computed — cálculo posicional
  // ----------------------------------------------------------

  describe('dadoAtual', () => {
    it('deve retornar d6 para nivelPreview = 2', async () => {
      const { fixture } = await renderDadoUpPreview();
      const comp = fixture.componentInstance;

      comp.nivelPreview.set(2);
      fixture.detectChanges();

      expect(comp.dadoAtual()!.nome).toBe('d6');
    });

    it('deve retornar d8 para nivelPreview = 3', async () => {
      const { fixture } = await renderDadoUpPreview();
      const comp = fixture.componentInstance;

      comp.nivelPreview.set(3);
      fixture.detectChanges();

      expect(comp.dadoAtual()!.nome).toBe('d8');
    });

    it('deve retornar d12 (último) para nivelPreview muito alto', async () => {
      const { fixture } = await renderDadoUpPreview({ nivelMaximo: 20 });
      const comp = fixture.componentInstance;

      comp.nivelPreview.set(20); // idx = min(19, 4) = 4 → d12
      fixture.detectChanges();

      expect(comp.dadoAtual()!.nome).toBe('d12');
    });

    it('deve retornar dado correto para lista com um único elemento', async () => {
      const umDado: DadoProspeccaoConfig[] = [dadosMock[0]]; // só d4
      const { fixture } = await renderDadoUpPreview({ dados: umDado, nivelMaximo: 5 });
      const comp = fixture.componentInstance;

      comp.nivelPreview.set(3);
      fixture.detectChanges();

      expect(comp.dadoAtual()!.nome).toBe('d4');
    });
  });

  // ----------------------------------------------------------
  // 5. onNivelChange — handler de evento do slider
  // ----------------------------------------------------------

  describe('onNivelChange', () => {
    it('deve atualizar nivelPreview ao chamar onNivelChange', async () => {
      const { fixture } = await renderDadoUpPreview();
      const comp = fixture.componentInstance;

      comp.onNivelChange(4);
      fixture.detectChanges();

      expect(comp.nivelPreview()).toBe(4);
    });

    it('deve atualizar dadoAtual ao mudar nível via onNivelChange', async () => {
      const { fixture } = await renderDadoUpPreview();
      const comp = fixture.componentInstance;

      comp.onNivelChange(5);
      fixture.detectChanges();

      expect(comp.dadoAtual()!.nome).toBe('d12'); // posição 4 (idx = min(4, 4))
    });
  });

});
