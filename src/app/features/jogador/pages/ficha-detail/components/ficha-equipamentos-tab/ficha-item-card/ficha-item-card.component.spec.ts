/**
 * FichaItemCardComponent — Spec
 *
 * Componente dumb: recebe FichaItemViewModel via input() e emite eventos.
 *
 * NOTA JIT (Armadilha 1): input.required() => usar setSignalInput() antes de detectChanges().
 * NOTA JIT (Armadilha 8): p-button (onClick) => clicar no <button> interno.
 *
 * Cenarios cobertos:
 * 1.  Renderiza o nome do item
 * 2.  Exibe chip de raridade com nome correto
 * 3.  Exibe "Customizado" quando raridadeNome e null
 * 4.  Exibe QUEBRADO badge quando estaQuebrado=true
 * 5.  Exibe barra de durabilidade apenas quando duracaoPadrao != null
 * 6.  Barra de durabilidade ausente quando duracaoPadrao = null
 * 7.  Exibe botao "Desequipar" quando item esta equipado
 * 8.  Exibe botao "Equipar" quando item nao esta equipado
 * 9.  Botao "Equipar" desabilitado quando estaQuebrado=true
 * 10. Emite desequipar com id correto ao clicar "Desequipar"
 * 11. Emite equipar com id correto ao clicar "Equipar"
 * 12. Emite verDetalhes com item ao clicar pi-info-circle
 * 13. Botao "Remover" visivel para Mestre
 * 14. Botao "Remover" visivel para Jogador dono (podeEditar=true)
 * 15. Botao "Remover" NAO visivel quando podeEditar=false e nao e Mestre
 * 16. Emite remover com id correto ao clicar "Remover"
 * 17. Opacidade 50% quando estaQuebrado=true
 */

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { render, screen, fireEvent } from '@testing-library/angular';
import { ɵSIGNAL as SIGNAL_SYM } from '@angular/core';
import { describe, it, expect, vi } from 'vitest';
import { FichaItemCardComponent } from './ficha-item-card.component';
import { FichaItemViewModel } from '@core/models/ficha-item.model';

// ---------------------------------------------------------------------------
// Helper JIT — Armadilha 1: atribuir valor a input.required() signal
// ---------------------------------------------------------------------------

function setSignalInput<T>(component: unknown, inputName: string, value: T): void {
  const signalFn = (component as Record<string, unknown>)[inputName];
  if (signalFn && (signalFn as Record<symbol, unknown>)[SIGNAL_SYM as symbol]) {
    const node = (signalFn as Record<symbol, unknown>)[
      SIGNAL_SYM as symbol
    ] as {
      applyValueToInputSignal: (node: unknown, v: T) => void;
    };
    node.applyValueToInputSignal(node, value);
  }
}

// ---------------------------------------------------------------------------
// Dados de teste
// ---------------------------------------------------------------------------

function makeItem(overrides: Partial<FichaItemViewModel> = {}): FichaItemViewModel {
  return {
    id: 1,
    fichaId: 10,
    itemConfigId: 5,
    nome: 'Espada Curta',
    equipado: false,
    duracaoAtual: 80,
    duracaoPadrao: 100,
    quantidade: 1,
    peso: 2.0,
    pesoEfetivo: 2.0,
    notas: null,
    adicionadoPor: 'Mestre',
    raridadeId: 1,
    raridadeNome: 'Comum',
    raridadeCor: '#9d9d9d',
    raridadeCorEfetiva: '#9d9d9d',
    dataCriacao: '2024-01-01T00:00:00',
    estaQuebrado: false,
    isCustomizado: false,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Helper para renderizar com inputs
// ---------------------------------------------------------------------------

async function renderCard(
  item: FichaItemViewModel,
  podeEditar = true,
  isMestre = false,
) {
  const { fixture } = await render(FichaItemCardComponent, {
    schemas: [NO_ERRORS_SCHEMA],
    detectChangesOnRender: false,
  });
  setSignalInput(fixture.componentInstance, 'item', item);
  setSignalInput(fixture.componentInstance, 'podeEditar', podeEditar);
  setSignalInput(fixture.componentInstance, 'isMestre', isMestre);
  fixture.detectChanges();
  return fixture;
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('FichaItemCardComponent', () => {

  // 1. Renderiza o nome do item
  it('renderiza o nome do item', async () => {
    await renderCard(makeItem({ nome: 'Machado de Batalha' }));
    expect(screen.getByText('Machado de Batalha')).toBeTruthy();
  });

  // 2. Exibe chip de raridade com nome correto
  it('exibe chip de raridade quando raridadeNome e definido', async () => {
    await renderCard(makeItem({ raridadeNome: 'Incomum' }));
    expect(screen.getByText('Incomum')).toBeTruthy();
  });

  // 3. Exibe "Customizado" quando raridadeNome e null
  it('exibe "Customizado" quando raridadeNome e null', async () => {
    await renderCard(makeItem({ raridadeNome: null, isCustomizado: true }));
    expect(screen.getByText('Customizado')).toBeTruthy();
  });

  // 4. Exibe QUEBRADO badge quando estaQuebrado=true
  it('exibe "QUEBRADO" quando estaQuebrado=true', async () => {
    await renderCard(makeItem({ estaQuebrado: true, duracaoAtual: 0 }));
    expect(screen.getByText('QUEBRADO')).toBeTruthy();
  });

  // 5. Exibe barra de durabilidade quando duracaoPadrao != null
  it('exibe texto de durabilidade quando duracaoPadrao esta definido', async () => {
    const fixture = await renderCard(
      makeItem({ duracaoPadrao: 100, duracaoAtual: 80 }),
    );
    expect(fixture.nativeElement.querySelector('p-progressBar')).toBeTruthy();
  });

  // 6. Barra de durabilidade ausente quando duracaoPadrao = null
  it('nao exibe barra de durabilidade quando duracaoPadrao e null', async () => {
    const fixture = await renderCard(makeItem({ duracaoPadrao: null }));
    // Sem texto "Durabilidade" quando nao ha duracaoPadrao
    expect(screen.queryByText('Durabilidade')).toBeFalsy();
  });

  // 7. Exibe botao "Desequipar" quando item esta equipado
  it('exibe botao "Desequipar" quando item esta equipado', async () => {
    await renderCard(makeItem({ equipado: true }));
    expect(screen.getByText('Desequipar')).toBeTruthy();
  });

  // 8. Exibe botao "Equipar" quando item nao esta equipado
  it('exibe botao "Equipar" quando item nao esta equipado', async () => {
    await renderCard(makeItem({ equipado: false }));
    expect(screen.getByText('Equipar')).toBeTruthy();
  });

  // 9. Botao "Equipar" desabilitado quando estaQuebrado=true
  it('botao "Equipar" esta desabilitado quando estaQuebrado=true', async () => {
    const fixture = await renderCard(
      makeItem({ equipado: false, estaQuebrado: true, duracaoAtual: 0 }),
    );
    const botaoEquipar = fixture.nativeElement.querySelector(
      'p-button[aria-label="Equipar Espada Curta"] button',
    );
    expect(botaoEquipar?.disabled).toBe(true);
  });

  // 10. Emite desequipar com id correto ao clicar
  it('emite desequipar com o id correto ao clicar', async () => {
    const fixture = await renderCard(makeItem({ equipado: true, id: 42 }));
    const spy = vi.fn();
    fixture.componentInstance.desequipar.subscribe(spy);

    const btn = fixture.nativeElement.querySelector(
      'p-button[aria-label="Desequipar Espada Curta"] button',
    );
    if (btn) {
      fireEvent.click(btn);
      fixture.detectChanges();
    }

    expect(spy).toHaveBeenCalledWith(42);
  });

  // 11. Emite equipar com id correto ao clicar
  it('emite equipar com o id correto ao clicar', async () => {
    const fixture = await renderCard(makeItem({ equipado: false, id: 7 }));
    const spy = vi.fn();
    fixture.componentInstance.equipar.subscribe(spy);

    const btn = fixture.nativeElement.querySelector(
      'p-button[aria-label="Equipar Espada Curta"] button',
    );
    if (btn) {
      fireEvent.click(btn);
      fixture.detectChanges();
    }

    expect(spy).toHaveBeenCalledWith(7);
  });

  // 12. Emite verDetalhes ao clicar pi-info-circle
  it('emite verDetalhes ao clicar no botao de detalhes', async () => {
    const item = makeItem({ id: 99 });
    const fixture = await renderCard(item);
    const spy = vi.fn();
    fixture.componentInstance.verDetalhes.subscribe(spy);

    const btn = fixture.nativeElement.querySelector(
      'p-button[aria-label="Ver detalhes de Espada Curta"] button',
    );
    if (btn) {
      fireEvent.click(btn);
      fixture.detectChanges();
    }

    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ id: 99 }));
  });

  // 13. Botao "Remover" visivel para Mestre
  it('exibe botao remover para Mestre', async () => {
    const fixture = await renderCard(makeItem(), true, true);
    expect(
      fixture.nativeElement.querySelector(
        'p-button[aria-label="Remover Espada Curta do inventario"]',
      ),
    ).toBeTruthy();
  });

  // 14. Botao "Remover" visivel para Jogador dono (podeEditar=true)
  it('exibe botao remover para Jogador dono (podeEditar=true)', async () => {
    const fixture = await renderCard(makeItem(), true, false);
    expect(
      fixture.nativeElement.querySelector(
        'p-button[aria-label="Remover Espada Curta do inventario"]',
      ),
    ).toBeTruthy();
  });

  // 15. Botao "Remover" NAO visivel quando podeEditar=false e nao e Mestre
  it('nao exibe botao remover quando podeEditar=false e nao e Mestre', async () => {
    const fixture = await renderCard(makeItem(), false, false);
    expect(
      fixture.nativeElement.querySelector(
        'p-button[aria-label="Remover Espada Curta do inventario"]',
      ),
    ).toBeFalsy();
  });

  // 16. Emite remover com id correto
  it('emite remover com id correto ao clicar', async () => {
    const fixture = await renderCard(makeItem({ id: 55 }), true, true);
    const spy = vi.fn();
    fixture.componentInstance.remover.subscribe(spy);

    const btn = fixture.nativeElement.querySelector(
      'p-button[aria-label="Remover Espada Curta do inventario"] button',
    );
    if (btn) {
      fireEvent.click(btn);
      fixture.detectChanges();
    }

    expect(spy).toHaveBeenCalledWith(55);
  });

  // 17. Opacidade 50% quando estaQuebrado=true
  it('aplica opacity-50 no container quando estaQuebrado=true', async () => {
    const fixture = await renderCard(
      makeItem({ estaQuebrado: true, duracaoAtual: 0 }),
    );
    const container = fixture.nativeElement.querySelector('div[class*="border-1"]');
    expect(container?.className).toContain('opacity-50');
  });

});
