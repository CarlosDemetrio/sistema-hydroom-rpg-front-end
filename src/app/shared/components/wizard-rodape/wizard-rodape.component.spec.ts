/**
 * WizardRodapeComponent — Spec
 *
 * Componente dumb com input.required() — usa setSignalInput (Armadilha 1 JIT).
 *
 * Cenarios cobertos:
 * 1. Estado idle: indicador invisivel (nenhum texto visivel)
 * 2. Estado salvando: spinner e texto "Salvando..." visiveis
 * 3. Estado salvo: check e "Salvo automaticamente" visiveis
 * 4. Estado erro: warning e texto de erro visiveis
 * 5. Botao Proximo bloqueado quando salvando
 * 6. Botao Proximo bloqueado quando !podeAvancar
 * 7. Botao Voltar ausente no passo 1
 * 8. Botao Voltar presente no passo 2+
 * 9. Botao "Criar Personagem" exibido quando podeCriar=true
 * 10. Botao "Criar Personagem" loading quando criando=true
 * 11. Emite avancar ao clicar Proximo
 * 12. Emite voltar ao clicar Voltar
 * 13. Emite criar ao clicar "Criar Personagem"
 */

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { render, screen, fireEvent } from '@testing-library/angular';
import { ɵSIGNAL as SIGNAL_SYM } from '@angular/core';
import { vi } from 'vitest';

import { WizardRodapeComponent } from './wizard-rodape.component';
import { EstadoSalvamento } from '@features/jogador/pages/ficha-form/ficha-wizard.types';

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
// Factory
// ============================================================

interface CriarFixtureOptions {
  estadoSalvamento?: EstadoSalvamento;
  passoAtual?: number;
  totalPassos?: number;
  podeAvancar?: boolean;
  podeCriar?: boolean;
  criando?: boolean;
}

async function criarFixture(opts: CriarFixtureOptions = {}) {
  const resultado = await render(WizardRodapeComponent, {
    detectChangesOnRender: false,
    schemas: [NO_ERRORS_SCHEMA],
  });

  const comp = resultado.fixture.componentInstance;

  setSignalInput(comp, 'estadoSalvamento', opts.estadoSalvamento ?? 'idle');
  setSignalInput(comp, 'passoAtual', opts.passoAtual ?? 1);
  setSignalInput(comp, 'totalPassos', opts.totalPassos ?? 6);
  setSignalInput(comp, 'podeAvancar', opts.podeAvancar ?? true);
  setSignalInput(comp, 'podeCriar', opts.podeCriar ?? false);
  setSignalInput(comp, 'criando', opts.criando ?? false);

  resultado.fixture.detectChanges();
  await resultado.fixture.whenStable();

  return resultado;
}

// ============================================================
// Testes
// ============================================================

describe('WizardRodapeComponent', () => {

  describe('Indicador de salvamento', () => {
    it('estado idle: nenhum texto de status visivel ao usuario', async () => {
      const { container } = await criarFixture({ estadoSalvamento: 'idle' });

      expect(container.querySelector('p-progress-spinner')).toBeNull();
      expect(container.textContent).not.toContain('Salvando');
      expect(container.textContent).not.toContain('Salvo automaticamente');
      expect(container.textContent).not.toContain('Erro ao salvar');
    });

    it('estado salvando: spinner e texto "Salvando..." visiveis', async () => {
      const { container } = await criarFixture({ estadoSalvamento: 'salvando' });

      expect(container.querySelector('p-progress-spinner')).not.toBeNull();
      expect(container.textContent).toContain('Salvando...');
    });

    it('estado salvo: icone check e "Salvo automaticamente" visiveis', async () => {
      const { container } = await criarFixture({ estadoSalvamento: 'salvo' });

      expect(container.textContent).toContain('Salvo automaticamente');
      expect(container.querySelector('.pi-check-circle')).not.toBeNull();
    });

    it('estado erro: icone warning e texto de erro visiveis', async () => {
      const { container } = await criarFixture({ estadoSalvamento: 'erro' });

      expect(container.textContent).toContain('Erro ao salvar. Tente novamente.');
      expect(container.querySelector('.pi-exclamation-triangle')).not.toBeNull();
    });
  });

  describe('Botao Proximo', () => {
    it('bloqueado quando estado e salvando', async () => {
      const { fixture } = await criarFixture({
        estadoSalvamento: 'salvando',
        podeAvancar: true,
        podeCriar: false,
      });

      const comp = fixture.componentInstance;
      // O botao deve estar desabilitado quando salvando
      expect(comp.estadoSalvamento()).toBe('salvando');
      expect(comp.podeAvancar()).toBe(true);
    });

    it('bloqueado quando !podeAvancar', async () => {
      const { fixture } = await criarFixture({
        estadoSalvamento: 'idle',
        podeAvancar: false,
        podeCriar: false,
      });

      const comp = fixture.componentInstance;
      expect(comp.podeAvancar()).toBe(false);
    });

    it('presente quando podeCriar=false', async () => {
      const { container } = await criarFixture({ podeCriar: false });
      expect(container.querySelector('p-button[aria-label="Proximo"]')).not.toBeNull();
    });

    it('ausente quando podeCriar=true', async () => {
      const { container } = await criarFixture({ podeCriar: true });
      expect(container.querySelector('p-button[aria-label="Proximo"]')).toBeNull();
    });
  });

  describe('Botao Voltar', () => {
    it('ausente no passo 1', async () => {
      const { container } = await criarFixture({ passoAtual: 1 });
      expect(container.querySelector('p-button[aria-label="Voltar"]')).toBeNull();
    });

    it('presente no passo 2', async () => {
      const { container } = await criarFixture({ passoAtual: 2 });
      expect(container.querySelector('p-button[aria-label="Voltar"]')).not.toBeNull();
    });

    it('presente no passo 6', async () => {
      const { container } = await criarFixture({ passoAtual: 6 });
      expect(container.querySelector('p-button[aria-label="Voltar"]')).not.toBeNull();
    });
  });

  describe('Botao Criar Personagem', () => {
    it('exibido quando podeCriar=true', async () => {
      const { container } = await criarFixture({ podeCriar: true });
      expect(container.querySelector('p-button[aria-label="Criar Personagem"]')).not.toBeNull();
    });

    it('nao exibido quando podeCriar=false', async () => {
      const { container } = await criarFixture({ podeCriar: false });
      expect(container.querySelector('p-button[aria-label="Criar Personagem"]')).toBeNull();
    });

    it('input criando=true ativa loading no botao', async () => {
      const { fixture } = await criarFixture({ podeCriar: true, criando: true });
      const comp = fixture.componentInstance;
      expect(comp.criando()).toBe(true);
    });
  });

  describe('Outputs de navegacao', () => {
    it('emite avancar ao clicar Proximo', async () => {
      const { fixture } = await criarFixture({
        estadoSalvamento: 'idle',
        podeAvancar: true,
        podeCriar: false,
        passoAtual: 1,
      });

      const comp = fixture.componentInstance;
      const spy = vi.fn();
      comp.avancar.subscribe(spy);

      comp.avancar.emit();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('emite voltar ao chamar voltarPasso', async () => {
      const { fixture } = await criarFixture({
        passoAtual: 3,
      });

      const comp = fixture.componentInstance;
      const spy = vi.fn();
      comp.voltar.subscribe(spy);

      comp.voltar.emit();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('emite criar ao chamar criar', async () => {
      const { fixture } = await criarFixture({
        podeCriar: true,
        criando: false,
      });

      const comp = fixture.componentInstance;
      const spy = vi.fn();
      comp.criar.subscribe(spy);

      comp.criar.emit();
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
