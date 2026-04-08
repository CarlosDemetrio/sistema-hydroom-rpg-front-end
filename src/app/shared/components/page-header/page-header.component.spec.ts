import { render, screen, fireEvent } from '@testing-library/angular';
import { NO_ERRORS_SCHEMA, ɵSIGNAL as SIGNAL_SYM } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { PageHeaderComponent } from './page-header.component';

// Helper para setar o valor de um signal input em modo JIT
// (input() API não é registrado no ɵcmp.inputs em JIT, então setInput() falha)
function setSignalInput<T>(component: unknown, inputName: string, value: T): void {
  const signalFn = (component as Record<string, unknown>)[inputName];
  if (signalFn && (signalFn as Record<symbol, unknown>)[SIGNAL_SYM as symbol]) {
    const node = (signalFn as Record<symbol, unknown>)[SIGNAL_SYM as symbol] as {
      applyValueToInputSignal: (node: unknown, v: T) => void;
    };
    node.applyValueToInputSignal(node, value);
  }
}

// Mock mínimo de Location para não conflitar com provideRouter
const locationMock = {
  back: vi.fn(),
  subscribe: vi.fn(),
  prepareExternalUrl: vi.fn(() => ''),
  path: vi.fn(() => ''),
  isCurrentPathEqualTo: vi.fn(() => false),
  normalize: vi.fn(() => ''),
  getState: vi.fn(),
  historyGo: vi.fn(),
  onUrlChange: vi.fn(),
  go: vi.fn(),
  replaceState: vi.fn(),
  pushState: vi.fn(),
  forward: vi.fn(),
};

describe('PageHeaderComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar o título via signal input', async () => {
    const { fixture } = await render(PageHeaderComponent, {
      providers: [provideRouter([])],
      schemas: [NO_ERRORS_SCHEMA],
      detectChangesOnRender: false,
    });

    setSignalInput(fixture.componentInstance, 'title', 'Meus Jogos');
    fixture.detectChanges();

    expect(screen.getByText('Meus Jogos')).toBeTruthy();
  });

  it('deve renderizar o botão de voltar com ícone', async () => {
    const { fixture } = await render(PageHeaderComponent, {
      providers: [provideRouter([])],
      schemas: [NO_ERRORS_SCHEMA],
      detectChangesOnRender: false,
    });

    setSignalInput(fixture.componentInstance, 'title', 'Detalhes');
    fixture.detectChanges();

    // O botão existe no DOM (p-button renderizado com text/rounded)
    const buttons = fixture.nativeElement.querySelectorAll('p-button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('deve chamar location.back() quando backRoute é null', async () => {
    const { fixture } = await render(PageHeaderComponent, {
      providers: [
        provideRouter([]),
        { provide: Location, useValue: locationMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      detectChangesOnRender: false,
    });

    setSignalInput(fixture.componentInstance, 'title', 'Página');
    setSignalInput(fixture.componentInstance, 'backRoute', null);
    fixture.detectChanges();

    // Chama diretamente o método público (evita dependência de aria-label no DOM PrimeNG)
    fixture.componentInstance.voltar();

    expect(locationMock.back).toHaveBeenCalledOnce();
  });

  it('deve chamar location.back() quando backRoute não é fornecido (default null)', async () => {
    const { fixture } = await render(PageHeaderComponent, {
      providers: [
        provideRouter([]),
        { provide: Location, useValue: locationMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      detectChangesOnRender: false,
    });

    setSignalInput(fixture.componentInstance, 'title', 'Página');
    // backRoute não é setado — default é null
    fixture.detectChanges();

    fixture.componentInstance.voltar();

    expect(locationMock.back).toHaveBeenCalledOnce();
  });

  it('deve navegar para backRoute quando fornecido como string', async () => {
    const navigateSpy = vi.fn().mockResolvedValue(true);

    const { fixture } = await render(PageHeaderComponent, {
      providers: [
        provideRouter([]),
        { provide: Location, useValue: locationMock },
        {
          provide: Router,
          useValue: {
            navigate: navigateSpy,
            events: { pipe: vi.fn(() => ({ subscribe: vi.fn() })) },
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      detectChangesOnRender: false,
    });

    setSignalInput(fixture.componentInstance, 'title', 'Editar Jogo');
    setSignalInput(fixture.componentInstance, 'backRoute', '/mestre/jogos');
    fixture.detectChanges();

    fixture.componentInstance.voltar();

    expect(navigateSpy).toHaveBeenCalledWith(['/mestre/jogos']);
  });

  it('deve atualizar o título ao alterar o signal input', async () => {
    const { fixture } = await render(PageHeaderComponent, {
      providers: [provideRouter([])],
      schemas: [NO_ERRORS_SCHEMA],
      detectChangesOnRender: false,
    });

    setSignalInput(fixture.componentInstance, 'title', 'Título Inicial');
    fixture.detectChanges();
    expect(screen.getByText('Título Inicial')).toBeTruthy();

    setSignalInput(fixture.componentInstance, 'title', 'Título Atualizado');
    fixture.detectChanges();
    expect(screen.getByText('Título Atualizado')).toBeTruthy();
  });
});
