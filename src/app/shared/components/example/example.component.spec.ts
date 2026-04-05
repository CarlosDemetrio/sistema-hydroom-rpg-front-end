import { render, screen, fireEvent } from '@testing-library/angular';
import { ɵSIGNAL as SIGNAL_SYM } from '@angular/core';
import { ExampleComponent } from './example.component';

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

describe('ExampleComponent', () => {
  it('deve renderizar o título via signal input', async () => {
    const { fixture } = await render(ExampleComponent);

    setSignalInput(fixture.componentInstance, 'title', 'Título de Teste');
    fixture.detectChanges();

    expect(screen.getByText('Título de Teste')).toBeTruthy();
  });

  it('deve adicionar item ao clicar no botão', async () => {
    const { fixture } = await render(ExampleComponent);
    const component = fixture.componentInstance;

    const button = screen.getByRole('button', { name: /adicionar/i });
    fireEvent.click(button);

    expect(component.data().length).toBe(2);
  });
});
