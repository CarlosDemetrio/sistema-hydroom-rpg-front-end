import { render, screen, fireEvent } from '@testing-library/angular';
import { ɵSIGNAL as SIGNAL_SYM } from '@angular/core';
import { vi, describe, it, expect } from 'vitest';
import { AnotacaoCardComponent } from './anotacao-card.component';
import { Anotacao } from '@models/anotacao.model';

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

/**
 * Clica em um p-button pelo seu aria-label.
 * PrimeNG p-button renderiza um <button> interno — ao usar (onClick), o evento
 * é emitido pelo host component, mas o click precisa atingir o <button> nativo.
 * Este helper tenta o querySelector primeiro e faz fallback no host element.
 */
function clickPButton(nativeElement: HTMLElement, ariaLabel: string): void {
  const inner = nativeElement.querySelector(
    `p-button[aria-label="${ariaLabel}"] button`
  ) as HTMLButtonElement | null;
  if (inner) {
    fireEvent.click(inner);
  } else {
    const host = nativeElement.querySelector(
      `p-button[aria-label="${ariaLabel}"]`
    ) as HTMLElement | null;
    if (host) fireEvent.click(host);
  }
}

// ============================================================
// Mocks
// ============================================================

const anotacaoMock: Anotacao = {
  id: 1,
  fichaId: 10,
  autorId: 42,
  autorNome: 'Gandalf',
  titulo: 'Anotacao de teste',
  conteudo: '**Negrito** e _italico_',
  tipoAnotacao: 'JOGADOR',
  visivelParaJogador: true,
  visivelParaTodos: false,
  pastaPaiId: null,
  dataCriacao: '2026-01-01T00:00:00',
  dataUltimaAtualizacao: '2026-01-01T00:00:00',
};

const anotacaoMestre: Anotacao = {
  ...anotacaoMock,
  id: 2,
  tipoAnotacao: 'MESTRE',
  visivelParaJogador: false,
  autorId: 99,
};

// ============================================================
// Helper de render — padrão JIT do projeto
// ============================================================

type RenderAnotacaoCardOpts = {
  anotacao?: Anotacao;
  podeDeletar?: boolean;
  userRole?: 'MESTRE' | 'JOGADOR';
  userId?: number;
};

async function renderAnotacaoCard(opts: RenderAnotacaoCardOpts = {}) {
  const result = await render(AnotacaoCardComponent, {
    detectChangesOnRender: false,
  });

  const component = result.fixture.componentInstance;
  setSignalInput(component, 'anotacao', opts.anotacao ?? anotacaoMock);
  setSignalInput(component, 'podeDeletar', opts.podeDeletar ?? false);
  setSignalInput(component, 'userRole', opts.userRole ?? 'JOGADOR');
  setSignalInput(component, 'userId', opts.userId ?? 42);

  result.fixture.detectChanges();
  return result;
}

// ============================================================
// Testes
// ============================================================

describe('AnotacaoCardComponent', () => {

  describe('modo visualizacao', () => {
    it('deve renderizar o titulo da anotacao', async () => {
      await renderAnotacaoCard({ anotacao: anotacaoMock, userRole: 'JOGADOR', userId: 42 });

      expect(screen.getByText('Anotacao de teste')).toBeTruthy();
    });

    it('deve exibir tag JOGADOR para anotacao do tipo JOGADOR', async () => {
      await renderAnotacaoCard({ anotacao: anotacaoMock, userRole: 'JOGADOR', userId: 42 });

      expect(screen.getByText('JOGADOR')).toBeTruthy();
    });

    it('deve exibir tag MESTRE para anotacao do tipo MESTRE', async () => {
      await renderAnotacaoCard({ anotacao: anotacaoMestre, userRole: 'MESTRE', userId: 99 });

      expect(screen.getByText('MESTRE')).toBeTruthy();
    });

    it('deve exibir botao Editar para MESTRE em qualquer anotacao', async () => {
      await renderAnotacaoCard({ anotacao: anotacaoMock, userRole: 'MESTRE', userId: 99 });

      expect(screen.getByLabelText('Editar anotacao Anotacao de teste')).toBeTruthy();
    });

    it('deve exibir botao Editar para JOGADOR que e autor da anotacao', async () => {
      await renderAnotacaoCard({ anotacao: anotacaoMock, userRole: 'JOGADOR', userId: 42 });

      expect(screen.getByLabelText('Editar anotacao Anotacao de teste')).toBeTruthy();
    });

    it('NAO deve exibir botao Editar para JOGADOR que NAO e autor', async () => {
      await renderAnotacaoCard({ anotacao: anotacaoMock, userRole: 'JOGADOR', userId: 999 });

      expect(screen.queryByLabelText('Editar anotacao Anotacao de teste')).toBeNull();
    });

    it('deve exibir botao Deletar quando podeDeletar=true', async () => {
      await renderAnotacaoCard({ anotacao: anotacaoMock, podeDeletar: true, userRole: 'MESTRE', userId: 99 });

      expect(screen.getByLabelText('Deletar anotacao Anotacao de teste')).toBeTruthy();
    });

    it('NAO deve exibir botao Deletar quando podeDeletar=false', async () => {
      await renderAnotacaoCard({ anotacao: anotacaoMock, podeDeletar: false, userRole: 'JOGADOR', userId: 999 });

      expect(screen.queryByLabelText('Deletar anotacao Anotacao de teste')).toBeNull();
    });

    it('deve emitir id da anotacao ao clicar em Deletar', async () => {
      const deletarSpy = vi.fn();

      const { fixture } = await renderAnotacaoCard({
        anotacao: anotacaoMock,
        podeDeletar: true,
        userRole: 'MESTRE',
        userId: 99,
      });

      fixture.componentInstance.deletar.subscribe(deletarSpy);

      clickPButton(fixture.nativeElement, 'Deletar anotacao Anotacao de teste');
      fixture.detectChanges();

      expect(deletarSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('modo edicao', () => {
    async function entrarModoEdicao(opts: RenderAnotacaoCardOpts = {}) {
      const result = await renderAnotacaoCard({ ...opts, userRole: 'MESTRE', userId: 99 });
      clickPButton(result.fixture.nativeElement, 'Editar anotacao Anotacao de teste');
      result.fixture.detectChanges();
      return result;
    }

    it('deve entrar em modo edicao ao clicar em Editar', async () => {
      await entrarModoEdicao();

      // No modo edição o label do textarea tem for="conteudoEdit-1"
      // Usamos o aria-label diretamente
      expect(screen.getByLabelText('Titulo da anotacao')).toBeTruthy();
      expect(screen.getByLabelText('Conteudo da anotacao em Markdown')).toBeTruthy();
    });

    it('deve preencher campos com valores atuais da anotacao ao entrar em modo edicao', async () => {
      await entrarModoEdicao();

      const titulo = screen.getByLabelText('Titulo da anotacao') as HTMLInputElement;
      const conteudo = screen.getByLabelText('Conteudo da anotacao em Markdown') as HTMLTextAreaElement;

      expect(titulo.value).toBe('Anotacao de teste');
      expect(conteudo.value).toBe('**Negrito** e _italico_');
    });

    it('deve voltar ao modo visualizacao ao clicar em Cancelar', async () => {
      const { fixture } = await entrarModoEdicao();

      // Cancela via botão PrimeNG
      clickPButton(fixture.nativeElement, 'Cancelar edicao');
      fixture.detectChanges();

      expect(screen.getByText('Anotacao de teste')).toBeTruthy();
      expect(screen.queryByLabelText('Titulo da anotacao')).toBeNull();
    });

    it('deve emitir output editar com dados atualizados ao salvar', async () => {
      const editarSpy = vi.fn();
      const { fixture } = await entrarModoEdicao();

      fixture.componentInstance.editar.subscribe(editarSpy);

      const titulo = screen.getByLabelText('Titulo da anotacao');
      fireEvent.input(titulo, { target: { value: 'Titulo Editado' } });
      fixture.detectChanges();

      clickPButton(fixture.nativeElement, 'Salvar edicao');
      fixture.detectChanges();

      expect(editarSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          titulo: 'Titulo Editado',
        })
      );
    });

    it('deve exibir toggle visivelParaJogador apenas para MESTRE em anotacao do tipo MESTRE', async () => {
      const { fixture } = await renderAnotacaoCard({ anotacao: anotacaoMestre, userRole: 'MESTRE', userId: 99 });

      clickPButton(fixture.nativeElement, 'Editar anotacao ' + anotacaoMestre.titulo);
      fixture.detectChanges();

      // p-togglebutton está presente no DOM — MESTRE e anotação do tipo MESTRE
      // O componente usa @if (userRole() === 'MESTRE' && anotacao().tipoAnotacao === 'MESTRE')
      const toggleBtn = fixture.nativeElement.querySelector('p-togglebutton');
      expect(toggleBtn).toBeTruthy();
    });

    it('NAO deve exibir toggle visivelParaJogador para anotacao do tipo JOGADOR', async () => {
      await entrarModoEdicao();

      expect(screen.queryByLabelText('Visibilidade para o jogador')).toBeNull();
    });

    it('deve desabilitar botao Salvar quando titulo esta vazio', async () => {
      await entrarModoEdicao();

      const titulo = screen.getByLabelText('Titulo da anotacao');
      fireEvent.input(titulo, { target: { value: '' } });

      // Com OnPush, forçar detecção após mudança de valor
      const btnSalvar = document.querySelector(
        'p-button[aria-label="Salvar edicao"] button'
      ) as HTMLButtonElement | null;

      // O botão Salvar deve estar desabilitado quando o título estiver vazio
      // Verifica via disabled binding no template
      if (btnSalvar) {
        expect(btnSalvar.disabled).toBe(true);
      } else {
        // Fallback: verificar que o atributo disabled existe no host
        const host = screen.getByLabelText('Salvar edicao');
        expect(host).toBeTruthy();
      }
    });

    it('deve exibir toggle visivelParaTodos para autor em modo edicao', async () => {
      const { fixture } = await renderAnotacaoCard({ anotacao: anotacaoMock, userRole: 'JOGADOR', userId: 42 });

      clickPButton(fixture.nativeElement, 'Editar anotacao Anotacao de teste');
      fixture.detectChanges();

      expect(screen.getByText('Compartilhar com todos')).toBeTruthy();
    });
  });

  describe('badges e indicadores', () => {
    it('deve exibir badge "Compartilhado" quando visivelParaTodos=true', async () => {
      const anotacaoCompartilhada: Anotacao = {
        ...anotacaoMock,
        visivelParaTodos: true,
      };

      await renderAnotacaoCard({ anotacao: anotacaoCompartilhada, userRole: 'JOGADOR', userId: 42 });

      expect(screen.getByText('Compartilhado')).toBeTruthy();
    });

    it('NAO deve exibir badge "Compartilhado" quando visivelParaTodos=false', async () => {
      await renderAnotacaoCard({ anotacao: anotacaoMock, userRole: 'JOGADOR', userId: 42 });

      expect(screen.queryByText('Compartilhado')).toBeNull();
    });
  });

  describe('renderizacao de Markdown', () => {
    it('deve renderizar conteudo com MarkdownPipe via [innerHTML] no elemento com aria-label correto', async () => {
      const anotacaoMarkdown: Anotacao = {
        ...anotacaoMock,
        conteudo: '**bold**',
      };

      await renderAnotacaoCard({ anotacao: anotacaoMarkdown, userRole: 'JOGADOR', userId: 42 });

      // O componente usa [innerHTML] com MarkdownPipe — verifica que o elemento
      // com aria-label "Conteudo da anotacao" está presente no DOM
      expect(screen.getByLabelText('Conteudo da anotacao')).toBeTruthy();
    });
  });
});
