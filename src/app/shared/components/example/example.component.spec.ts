import { render, screen, fireEvent } from '@testing-library/angular';
import { ExampleComponent } from './example.component';

describe('ExampleComponent', () => {
  it('deve renderizar o título via signal input', async () => {
    await render(ExampleComponent, {
      componentInputs: { title: 'Título de Teste' }
    });

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
