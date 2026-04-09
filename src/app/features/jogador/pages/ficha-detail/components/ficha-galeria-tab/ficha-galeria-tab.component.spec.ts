import { render, screen, fireEvent } from '@testing-library/angular';
import { ɵSIGNAL as SIGNAL_SYM } from '@angular/core';
import { Subject, of, throwError } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { FichaGaleriaTabComponent } from './ficha-galeria-tab.component';
import { FichaBusinessService } from '@core/services/business/ficha-business.service';
import { ToastService } from '@services/toast.service';
import { FichaImagem } from '@core/models/ficha-imagem.model';
import { ImagemCardComponent } from '../imagem-card/imagem-card.component';

// ============================================================
// Helper JIT: atribuir valor a input.required() signal
// antes do primeiro detectChanges (evita NG0950 em JIT)
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
// TEMPLATE STUB
//
// FichaGaleriaTabComponent usa ImagemCardComponent com input.required().
// Ao renderizar o template real em JIT, causa NG0950.
// Substituímos por template stub que não instancia os filhos com input.required().
// ============================================================
const TEMPLATE_STUB = `
  <div>
    @if (loading()) {
      <span data-testid="loading">Carregando...</span>
    }
    @if (!loading() && imagens().length === 0) {
      <span data-testid="empty">Nenhuma imagem adicionada ainda.</span>
      @if (podeAdicionarImagem()) {
        <button (click)="showAddForm.set(true)" aria-label="Adicionar primeira imagem">
          Adicionar primeira imagem
        </button>
      }
    }
    @for (imagem of imagens(); track imagem.id) {
      <div data-testid="imagem-item">{{ imagem.titulo ?? imagem.id }}</div>
    }
    <span data-testid="contador">{{ totalImagens() }}/20</span>
    @if (podeAdicionarImagem()) {
      <button
        (click)="showAddForm.set(!showAddForm())"
        [disabled]="totalImagens() >= 20"
        aria-label="Adicionar imagem"
      >Adicionar imagem</button>
    }
    @if (showAddForm()) {
      <span data-testid="form-upload">Formulario de upload</span>
      <button (click)="cancelarUpload()" aria-label="Cancelar upload">Cancelar</button>
      <button
        (click)="salvarImagem()"
        [disabled]="arquivoSelecionado() === null"
        aria-label="Fazer Upload"
      >Fazer Upload</button>
    }
    @if (avatar()) {
      <div data-testid="avatar-section">{{ avatar()?.titulo }}</div>
    }
    @if (galeria().length > 0) {
      <div data-testid="galeria-section">{{ galeria().length }}</div>
    }
    @if (imagemExpandida()) {
      <div data-testid="lightbox">lightbox</div>
    }
  </div>
`;

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
  urlCloudinary: 'https://res.cloudinary.com/test/image/upload/galeria1.jpg',
  publicId: 'rpg-fichas/1/fichas/42/galeria1',
  titulo: null,
  tipoImagem: 'GALERIA',
};

const imagemGaleria2Mock: FichaImagem = {
  ...imagemAvatarMock,
  id: 3,
  urlCloudinary: 'https://res.cloudinary.com/test/image/upload/galeria2.jpg',
  publicId: 'rpg-fichas/1/fichas/42/galeria2',
  titulo: null,
  tipoImagem: 'GALERIA',
};

// ============================================================
// Testes
// ============================================================

describe('FichaGaleriaTabComponent', () => {
  let fichaBusinessServiceMock: Record<string, ReturnType<typeof vi.fn>>;
  let toastServiceMock: Record<string, ReturnType<typeof vi.fn>>;
  let imagensSubject: Subject<FichaImagem[]>;

  beforeEach(() => {
    imagensSubject = new Subject<FichaImagem[]>();

    fichaBusinessServiceMock = {
      loadImagens: vi.fn().mockReturnValue(imagensSubject.asObservable()),
      adicionarImagem: vi.fn(),
      atualizarImagem: vi.fn(),
      deletarImagem: vi.fn(),
    };

    toastServiceMock = {
      success: vi.fn(),
      error: vi.fn(),
    };
  });

  async function renderComponent(overrides: { userId?: number; fichaJogadorId?: number; userRole?: 'MESTRE' | 'JOGADOR' } = {}) {
    const result = await render(FichaGaleriaTabComponent, {
      providers: [
        { provide: FichaBusinessService, useValue: fichaBusinessServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
      ],
      detectChangesOnRender: false,
      configureTestBed: (tb) => {
        tb.overrideTemplate(FichaGaleriaTabComponent, TEMPLATE_STUB);
        tb.overrideComponent(FichaGaleriaTabComponent, {
          remove: { imports: [ImagemCardComponent] },
          add: { imports: [] },
        });
      },
    });

    const component = result.fixture.componentInstance;
    setSignalInput(component, 'fichaId', 42);
    setSignalInput(component, 'userRole', overrides.userRole ?? 'MESTRE');
    setSignalInput(component, 'userId', overrides.userId ?? 10);
    setSignalInput(component, 'fichaJogadorId', overrides.fichaJogadorId ?? 10);

    result.fixture.detectChanges();
    return result;
  }

  // ============================================================
  // Estado de carregamento
  // ============================================================

  describe('estado de carregamento', () => {
    it('deve exibir skeleton de loading enquanto loadImagens nao emitiu', async () => {
      await renderComponent();
      // Subject não emitiu ainda → loading ativo
      expect(screen.getByTestId('loading')).toBeTruthy();
    });

    it('deve exibir lista de imagens apos loadImagens resolver com 3 imagens', async () => {
      const { fixture } = await renderComponent();

      imagensSubject.next([imagemAvatarMock, imagemGaleriaMock, imagemGaleria2Mock]);
      imagensSubject.complete();
      fixture.detectChanges();

      const items = screen.getAllByTestId('imagem-item');
      expect(items).toHaveLength(3);
    });

    it('deve exibir estado vazio quando loadImagens resolve com array vazio', async () => {
      const { fixture } = await renderComponent();

      imagensSubject.next([]);
      imagensSubject.complete();
      fixture.detectChanges();

      expect(screen.getByTestId('empty')).toBeTruthy();
    });
  });

  // ============================================================
  // Secoes de avatar e galeria
  // ============================================================

  describe('secoes de avatar e galeria', () => {
    it('deve exibir secao de avatar quando ha imagem AVATAR', async () => {
      const { fixture } = await renderComponent();

      imagensSubject.next([imagemAvatarMock]);
      imagensSubject.complete();
      fixture.detectChanges();

      expect(screen.getByTestId('avatar-section')).toBeTruthy();
    });

    it('deve exibir secao de galeria quando ha imagens GALERIA', async () => {
      const { fixture } = await renderComponent();

      imagensSubject.next([imagemAvatarMock, imagemGaleriaMock]);
      imagensSubject.complete();
      fixture.detectChanges();

      expect(screen.getByTestId('galeria-section')).toBeTruthy();
    });

    it('NAO deve exibir secao de galeria quando nao ha imagens GALERIA', async () => {
      const { fixture } = await renderComponent();

      imagensSubject.next([imagemAvatarMock]);
      imagensSubject.complete();
      fixture.detectChanges();

      expect(screen.queryByTestId('galeria-section')).toBeNull();
    });
  });

  // ============================================================
  // Contador
  // ============================================================

  describe('contador de imagens', () => {
    it('deve exibir "3/20" com 3 imagens carregadas', async () => {
      const { fixture } = await renderComponent();

      imagensSubject.next([imagemAvatarMock, imagemGaleriaMock, imagemGaleria2Mock]);
      imagensSubject.complete();
      fixture.detectChanges();

      expect(screen.getByTestId('contador').textContent).toContain('3/20');
    });

    it('deve desabilitar botao adicionar quando ha 20 imagens', async () => {
      const { fixture } = await renderComponent();

      const vinteImagens: FichaImagem[] = Array.from({ length: 20 }, (_, i) => ({
        ...imagemGaleriaMock,
        id: i + 1,
        ordemExibicao: i,
      }));

      imagensSubject.next(vinteImagens);
      imagensSubject.complete();
      fixture.detectChanges();

      const btnAdicionar = screen.getByLabelText('Adicionar imagem') as HTMLButtonElement;
      expect(btnAdicionar.disabled).toBe(true);
    });
  });

  // ============================================================
  // Permissoes — podeAdicionarImagem
  // ============================================================

  describe('permissoes de adicionar imagem', () => {
    it('deve exibir botao CTA para dono da ficha (userId === fichaJogadorId)', async () => {
      const { fixture } = await renderComponent({ userId: 10, fichaJogadorId: 10, userRole: 'JOGADOR' });

      imagensSubject.next([]);
      imagensSubject.complete();
      fixture.detectChanges();

      // CTA "Adicionar primeira imagem" deve ser visível para dono
      expect(screen.getByLabelText('Adicionar primeira imagem')).toBeTruthy();
    });

    it('NAO deve exibir botao CTA para JOGADOR que nao e dono (userId !== fichaJogadorId)', async () => {
      const { fixture } = await renderComponent({ userId: 99, fichaJogadorId: 10, userRole: 'JOGADOR' });

      imagensSubject.next([]);
      imagensSubject.complete();
      fixture.detectChanges();

      expect(screen.queryByLabelText('Adicionar primeira imagem')).toBeNull();
    });

    it('deve exibir botao adicionar para MESTRE mesmo que nao seja dono', async () => {
      const { fixture } = await renderComponent({ userId: 99, fichaJogadorId: 10, userRole: 'MESTRE' });

      imagensSubject.next([]);
      imagensSubject.complete();
      fixture.detectChanges();

      expect(screen.getByLabelText('Adicionar primeira imagem')).toBeTruthy();
    });
  });

  // ============================================================
  // Formulario de upload
  // ============================================================

  describe('formulario de upload', () => {
    it('deve abrir formulario ao clicar em "Adicionar imagem"', async () => {
      await renderComponent();

      imagensSubject.next([]);
      imagensSubject.complete();

      expect(screen.queryByTestId('form-upload')).toBeNull();

      fireEvent.click(screen.getByLabelText('Adicionar imagem'));

      expect(screen.getByTestId('form-upload')).toBeTruthy();
    });

    it('deve fechar formulario ao clicar em "Cancelar"', async () => {
      await renderComponent();

      imagensSubject.next([]);
      imagensSubject.complete();

      // Abre o formulário
      fireEvent.click(screen.getByLabelText('Adicionar imagem'));
      expect(screen.getByTestId('form-upload')).toBeTruthy();

      // Fecha via cancelar
      fireEvent.click(screen.getByLabelText('Cancelar upload'));
      expect(screen.queryByTestId('form-upload')).toBeNull();
    });

    it('deve manter botao Upload desabilitado quando nenhum arquivo foi selecionado', async () => {
      await renderComponent();

      imagensSubject.next([]);
      imagensSubject.complete();

      fireEvent.click(screen.getByLabelText('Adicionar imagem'));

      const btnUpload = screen.getByLabelText('Fazer Upload') as HTMLButtonElement;
      expect(btnUpload.disabled).toBe(true);
    });
  });

  // ============================================================
  // Upload — adicionarImagem
  // ============================================================

  describe('upload de imagem', () => {
    it('deve chamar adicionarImagem ao fazer upload', async () => {
      const uploadSubject = new Subject<FichaImagem>();
      fichaBusinessServiceMock['adicionarImagem'].mockReturnValue(uploadSubject.asObservable());

      const { fixture } = await renderComponent();

      imagensSubject.next([]);
      imagensSubject.complete();

      // Simula arquivo selecionado via sinal interno
      fixture.componentInstance['arquivoSelecionado'].set(new File([''], 'test.jpg', { type: 'image/jpeg' }));
      fixture.detectChanges();

      fireEvent.click(screen.getByLabelText('Adicionar imagem'));
      fireEvent.click(screen.getByLabelText('Fazer Upload'));

      uploadSubject.next(imagemGaleriaMock);
      uploadSubject.complete();
      fixture.detectChanges();

      expect(fichaBusinessServiceMock['adicionarImagem']).toHaveBeenCalledWith(
        42,
        expect.objectContaining({ tipoImagem: expect.any(String) })
      );
    });

    it('deve adicionar nova imagem GALERIA a lista apos upload bem-sucedido', async () => {
      const novaImagem: FichaImagem = { ...imagemGaleriaMock, id: 99 };
      fichaBusinessServiceMock['adicionarImagem'].mockReturnValue(of(novaImagem));

      const { fixture } = await renderComponent();

      imagensSubject.next([imagemAvatarMock]);
      imagensSubject.complete();

      fixture.componentInstance['arquivoSelecionado'].set(new File([''], 'nova.jpg', { type: 'image/jpeg' }));
      fixture.detectChanges();

      fireEvent.click(screen.getByLabelText('Adicionar imagem'));
      fireEvent.click(screen.getByLabelText('Fazer Upload'));
      fixture.detectChanges();

      const items = screen.getAllByTestId('imagem-item');
      expect(items.length).toBeGreaterThan(1);
    });

    it('deve marcar avatar anterior como GALERIA ao fazer upload de novo AVATAR', async () => {
      const novoAvatar: FichaImagem = { ...imagemAvatarMock, id: 99, titulo: 'Novo Avatar' };
      fichaBusinessServiceMock['adicionarImagem'].mockReturnValue(of(novoAvatar));

      const { fixture } = await renderComponent();

      imagensSubject.next([imagemAvatarMock]);
      imagensSubject.complete();

      fixture.componentInstance['novoTipo'].set('AVATAR');
      fixture.componentInstance['arquivoSelecionado'].set(new File([''], 'avatar2.jpg', { type: 'image/jpeg' }));
      fixture.detectChanges();

      fireEvent.click(screen.getByLabelText('Adicionar imagem'));
      fireEvent.click(screen.getByLabelText('Fazer Upload'));
      fixture.detectChanges();

      // O avatar antigo (id=1) deve ter sido convertido para GALERIA
      const imagensAtuais = fixture.componentInstance['imagens']();
      const antigoAvatar = imagensAtuais.find(i => i.id === imagemAvatarMock.id);
      expect(antigoAvatar?.tipoImagem).toBe('GALERIA');
    });

    it('deve exibir toast de erro com "Limite de 20 imagens atingido" em erro 422', async () => {
      fichaBusinessServiceMock['adicionarImagem'].mockReturnValue(
        throwError(() => ({ status: 422 }))
      );

      const { fixture } = await renderComponent();

      imagensSubject.next([]);
      imagensSubject.complete();

      fixture.componentInstance['arquivoSelecionado'].set(new File([''], 'test.jpg', { type: 'image/jpeg' }));
      fixture.detectChanges();

      fireEvent.click(screen.getByLabelText('Adicionar imagem'));
      fireEvent.click(screen.getByLabelText('Fazer Upload'));

      expect(toastServiceMock['error']).toHaveBeenCalledWith(
        'Limite de 20 imagens atingido',
        'Erro no upload'
      );
    });
  });

  // ============================================================
  // Lightbox
  // ============================================================

  describe('lightbox', () => {
    it('deve exibir lightbox quando imagemExpandida e definida', async () => {
      const { fixture } = await renderComponent();

      imagensSubject.next([imagemAvatarMock]);
      imagensSubject.complete();

      expect(screen.queryByTestId('lightbox')).toBeNull();

      fixture.componentInstance['imagemExpandida'].set(imagemAvatarMock);
      fixture.detectChanges();

      expect(screen.getByTestId('lightbox')).toBeTruthy();
    });
  });

  // ============================================================
  // Deletar imagem
  // ============================================================

  describe('deletar imagem', () => {
    it('deve remover imagem da lista apos deletarImagem bem-sucedido', async () => {
      fichaBusinessServiceMock['deletarImagem'].mockReturnValue(of(undefined));

      const { fixture } = await renderComponent();

      imagensSubject.next([imagemAvatarMock, imagemGaleriaMock]);
      imagensSubject.complete();
      fixture.detectChanges();

      expect(screen.getAllByTestId('imagem-item')).toHaveLength(2);

      fixture.componentInstance['deletarImagem'](imagemAvatarMock.id);
      fixture.detectChanges();

      expect(screen.getAllByTestId('imagem-item')).toHaveLength(1);
    });
  });
});
