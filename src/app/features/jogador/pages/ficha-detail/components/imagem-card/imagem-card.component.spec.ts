import { render, screen, fireEvent } from '@testing-library/angular';
import { ɵSIGNAL as SIGNAL_SYM } from '@angular/core';
import { vi, describe, it, expect } from 'vitest';
import { ImagemCardComponent } from './imagem-card.component';
import { FichaImagem } from '@core/models/ficha-imagem.model';

// ============================================================
// Helper JIT: atribuir valor a input.required() signal
// antes do primeiro detectChanges (evita NG0950/NG0303 em JIT)
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
// Mocks
// ============================================================

const imagemAvatarMock: FichaImagem = {
  id: 1,
  fichaId: 42,
  urlCloudinary: 'https://res.cloudinary.com/test/image/upload/avatar.jpg',
  publicId: 'rpg-fichas/1/fichas/42/avatar',
  titulo: 'Aldric, o Guardiao',
  tipoImagem: 'AVATAR',
  ordemExibicao: 0,
  dataCriacao: '2026-04-03T10:00:00',
  dataUltimaAtualizacao: '2026-04-03T10:00:00',
};

const imagemGaleriaMock: FichaImagem = {
  ...imagemAvatarMock,
  id: 2,
  urlCloudinary: 'https://res.cloudinary.com/test/image/upload/galeria.jpg',
  publicId: 'rpg-fichas/1/fichas/42/galeria',
  titulo: null,
  tipoImagem: 'GALERIA',
};

// ============================================================
// Helper de render
// ============================================================

type RenderImagemCardOpts = {
  imagem?: FichaImagem;
  podeEditar?: boolean;
  podeDeletar?: boolean;
};

async function renderImagemCard(opts: RenderImagemCardOpts = {}) {
  const result = await render(ImagemCardComponent, {
    detectChangesOnRender: false,
  });

  const component = result.fixture.componentInstance;
  setSignalInput(component, 'imagem', opts.imagem ?? imagemAvatarMock);
  setSignalInput(component, 'podeEditar', opts.podeEditar ?? false);
  setSignalInput(component, 'podeDeletar', opts.podeDeletar ?? false);

  result.fixture.detectChanges();
  return result;
}

// ============================================================
// Testes
// ============================================================

describe('ImagemCardComponent', () => {
  describe('exibicao de imagem', () => {
    it('deve renderizar a imagem com src igual a urlCloudinary', async () => {
      await renderImagemCard({ imagem: imagemAvatarMock });

      const img = screen.getByAltText('Aldric, o Guardiao') as HTMLImageElement;
      expect(img).toBeTruthy();
      expect(img.src).toBe(imagemAvatarMock.urlCloudinary);
    });

    it('deve exibir o titulo quando disponivel', async () => {
      await renderImagemCard({ imagem: imagemAvatarMock });

      expect(screen.getByText('Aldric, o Guardiao')).toBeTruthy();
    });

    it('NAO deve exibir titulo quando titulo e null', async () => {
      await renderImagemCard({ imagem: imagemGaleriaMock });

      // imagemGaleriaMock.titulo === null — não deve haver texto de título
      expect(screen.queryByText('Aldric, o Guardiao')).toBeNull();
    });
  });

  describe('badge de tipo', () => {
    it('deve exibir badge "Avatar" quando tipoImagem e AVATAR', async () => {
      await renderImagemCard({ imagem: imagemAvatarMock });

      expect(screen.getByText('Avatar')).toBeTruthy();
    });

    it('NAO deve exibir badge "Avatar" quando tipoImagem e GALERIA', async () => {
      await renderImagemCard({ imagem: imagemGaleriaMock });

      expect(screen.queryByText('Avatar')).toBeNull();
    });
  });

  describe('botao de deletar', () => {
    it('deve exibir botao de deletar quando podeDeletar=true', async () => {
      await renderImagemCard({ imagem: imagemAvatarMock, podeDeletar: true });

      expect(screen.getByLabelText('Remover imagem Aldric, o Guardiao')).toBeTruthy();
    });

    it('NAO deve exibir botao de deletar quando podeDeletar=false', async () => {
      await renderImagemCard({ imagem: imagemAvatarMock, podeDeletar: false });

      expect(screen.queryByLabelText('Remover imagem Aldric, o Guardiao')).toBeNull();
    });
  });

  describe('eventos de output', () => {
    it('deve emitir o id da imagem ao clicar no botao de deletar', async () => {
      const deletarSpy = vi.fn();

      const { fixture } = await renderImagemCard({ imagem: imagemAvatarMock, podeDeletar: true });

      fixture.componentInstance.deletar.subscribe(deletarSpy);

      // PrimeNG p-button renders an inner <button> element — click directly on it
      const innerButton = fixture.nativeElement.querySelector(
        'p-button[aria-label="Remover imagem Aldric, o Guardiao"] button'
      ) as HTMLButtonElement | null;

      if (innerButton) {
        fireEvent.click(innerButton);
      } else {
        // Fallback: click the host element (might be caught by bubbling in some environments)
        const hostBtn = screen.getByLabelText('Remover imagem Aldric, o Guardiao');
        fireEvent.click(hostBtn);
      }

      expect(deletarSpy).toHaveBeenCalledWith(imagemAvatarMock.id);
    });

    it('deve emitir a imagem ao clicar no elemento com role button (container da imagem)', async () => {
      const expandirSpy = vi.fn();

      const { fixture } = await renderImagemCard({ imagem: imagemAvatarMock });

      fixture.componentInstance.expandir.subscribe(expandirSpy);

      // O container da imagem tem role="button" e aria-label "Expandir imagem..."
      const btnExpandir = screen.getByRole('button', { name: /Expandir imagem/i });
      fireEvent.click(btnExpandir);

      expect(expandirSpy).toHaveBeenCalledWith(imagemAvatarMock);
    });
  });
});
