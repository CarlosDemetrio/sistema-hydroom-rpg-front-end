import { render, screen, fireEvent } from '@testing-library/angular';
import { signal } from '@angular/core';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AnotacaoCardComponent } from './anotacao-card.component';
import { Anotacao } from '@models/anotacao.model';

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

describe('AnotacaoCardComponent', () => {
  describe('modo visualizacao', () => {
    it('deve renderizar o titulo da anotacao', async () => {
      await render(AnotacaoCardComponent, {
        inputs: {
          anotacao: anotacaoMock,
          podeDeletar: false,
          userRole: 'JOGADOR',
          userId: 42,
        },
      });

      expect(screen.getByText('Anotacao de teste')).toBeTruthy();
    });

    it('deve exibir tag JOGADOR para anotacao do tipo JOGADOR', async () => {
      await render(AnotacaoCardComponent, {
        inputs: {
          anotacao: anotacaoMock,
          podeDeletar: false,
          userRole: 'JOGADOR',
          userId: 42,
        },
      });

      expect(screen.getByText('JOGADOR')).toBeTruthy();
    });

    it('deve exibir tag MESTRE para anotacao do tipo MESTRE', async () => {
      await render(AnotacaoCardComponent, {
        inputs: {
          anotacao: anotacaoMestre,
          podeDeletar: false,
          userRole: 'MESTRE',
          userId: 99,
        },
      });

      expect(screen.getByText('MESTRE')).toBeTruthy();
    });

    it('deve exibir botao Editar para MESTRE em qualquer anotacao', async () => {
      await render(AnotacaoCardComponent, {
        inputs: {
          anotacao: anotacaoMock,
          podeDeletar: false,
          userRole: 'MESTRE',
          userId: 99,
        },
      });

      expect(screen.getByLabelText('Editar anotacao Anotacao de teste')).toBeTruthy();
    });

    it('deve exibir botao Editar para JOGADOR que e autor da anotacao', async () => {
      await render(AnotacaoCardComponent, {
        inputs: {
          anotacao: anotacaoMock,
          podeDeletar: false,
          userRole: 'JOGADOR',
          userId: 42, // autorId === userId
        },
      });

      expect(screen.getByLabelText('Editar anotacao Anotacao de teste')).toBeTruthy();
    });

    it('NAO deve exibir botao Editar para JOGADOR que NAO e autor', async () => {
      await render(AnotacaoCardComponent, {
        inputs: {
          anotacao: anotacaoMock,
          podeDeletar: false,
          userRole: 'JOGADOR',
          userId: 999, // diferente do autorId 42
        },
      });

      expect(screen.queryByLabelText('Editar anotacao Anotacao de teste')).toBeNull();
    });

    it('deve exibir botao Deletar quando podeDeletar=true', async () => {
      await render(AnotacaoCardComponent, {
        inputs: {
          anotacao: anotacaoMock,
          podeDeletar: true,
          userRole: 'MESTRE',
          userId: 99,
        },
      });

      expect(screen.getByLabelText('Deletar anotacao Anotacao de teste')).toBeTruthy();
    });

    it('NAO deve exibir botao Deletar quando podeDeletar=false', async () => {
      await render(AnotacaoCardComponent, {
        inputs: {
          anotacao: anotacaoMock,
          podeDeletar: false,
          userRole: 'JOGADOR',
          userId: 999,
        },
      });

      expect(screen.queryByLabelText('Deletar anotacao Anotacao de teste')).toBeNull();
    });

    it('deve emitir id da anotacao ao clicar em Deletar', async () => {
      const deletarSpy = vi.fn();

      const { fixture } = await render(AnotacaoCardComponent, {
        inputs: {
          anotacao: anotacaoMock,
          podeDeletar: true,
          userRole: 'MESTRE',
          userId: 99,
        },
      });

      fixture.componentInstance.deletar.subscribe(deletarSpy);

      const btnDeletar = screen.getByLabelText('Deletar anotacao Anotacao de teste');
      fireEvent.click(btnDeletar);

      expect(deletarSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('modo edicao', () => {
    it('deve entrar em modo edicao ao clicar em Editar', async () => {
      await render(AnotacaoCardComponent, {
        inputs: {
          anotacao: anotacaoMock,
          podeDeletar: false,
          userRole: 'MESTRE',
          userId: 99,
        },
      });

      const btnEditar = screen.getByLabelText('Editar anotacao Anotacao de teste');
      fireEvent.click(btnEditar);

      expect(screen.getByLabelText('Titulo da anotacao')).toBeTruthy();
      expect(screen.getByLabelText('Conteudo da anotacao em Markdown')).toBeTruthy();
    });

    it('deve preencher campos com valores atuais da anotacao ao entrar em modo edicao', async () => {
      await render(AnotacaoCardComponent, {
        inputs: {
          anotacao: anotacaoMock,
          podeDeletar: false,
          userRole: 'MESTRE',
          userId: 99,
        },
      });

      fireEvent.click(screen.getByLabelText('Editar anotacao Anotacao de teste'));

      const titulo = screen.getByLabelText('Titulo da anotacao') as HTMLInputElement;
      const conteudo = screen.getByLabelText('Conteudo da anotacao em Markdown') as HTMLTextAreaElement;

      expect(titulo.value).toBe('Anotacao de teste');
      expect(conteudo.value).toBe('**Negrito** e _italico_');
    });

    it('deve voltar ao modo visualizacao ao clicar em Cancelar', async () => {
      await render(AnotacaoCardComponent, {
        inputs: {
          anotacao: anotacaoMock,
          podeDeletar: false,
          userRole: 'MESTRE',
          userId: 99,
        },
      });

      fireEvent.click(screen.getByLabelText('Editar anotacao Anotacao de teste'));
      expect(screen.getByLabelText('Cancelar edicao')).toBeTruthy();

      fireEvent.click(screen.getByLabelText('Cancelar edicao'));

      // Deve voltar ao título visível (modo visualização)
      expect(screen.getByText('Anotacao de teste')).toBeTruthy();
      expect(screen.queryByLabelText('Titulo da anotacao')).toBeNull();
    });

    it('deve emitir output editar com dados atualizados ao salvar', async () => {
      const editarSpy = vi.fn();

      const { fixture } = await render(AnotacaoCardComponent, {
        inputs: {
          anotacao: anotacaoMock,
          podeDeletar: false,
          userRole: 'MESTRE',
          userId: 99,
        },
      });

      fixture.componentInstance.editar.subscribe(editarSpy);

      fireEvent.click(screen.getByLabelText('Editar anotacao Anotacao de teste'));

      const titulo = screen.getByLabelText('Titulo da anotacao');
      fireEvent.input(titulo, { target: { value: 'Titulo Editado' } });

      fireEvent.click(screen.getByLabelText('Salvar edicao'));

      expect(editarSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          titulo: 'Titulo Editado',
        })
      );
    });

    it('deve exibir toggle visivelParaJogador apenas para MESTRE em anotacao do tipo MESTRE', async () => {
      await render(AnotacaoCardComponent, {
        inputs: {
          anotacao: anotacaoMestre,
          podeDeletar: false,
          userRole: 'MESTRE',
          userId: 99,
        },
      });

      fireEvent.click(screen.getByLabelText('Editar anotacao ' + anotacaoMestre.titulo));

      // Toggle de visibilidade deve existir para MESTRE em anotação MESTRE
      expect(screen.getByLabelText('Visibilidade para o jogador')).toBeTruthy();
    });

    it('NAO deve exibir toggle visivelParaJogador para anotacao do tipo JOGADOR', async () => {
      await render(AnotacaoCardComponent, {
        inputs: {
          anotacao: anotacaoMock, // tipoAnotacao = JOGADOR
          podeDeletar: false,
          userRole: 'MESTRE',
          userId: 99,
        },
      });

      fireEvent.click(screen.getByLabelText('Editar anotacao Anotacao de teste'));

      expect(screen.queryByLabelText('Visibilidade para o jogador')).toBeNull();
    });

    it('deve desabilitar botao Salvar quando titulo esta vazio', async () => {
      await render(AnotacaoCardComponent, {
        inputs: {
          anotacao: anotacaoMock,
          podeDeletar: false,
          userRole: 'MESTRE',
          userId: 99,
        },
      });

      fireEvent.click(screen.getByLabelText('Editar anotacao Anotacao de teste'));

      const titulo = screen.getByLabelText('Titulo da anotacao');
      fireEvent.input(titulo, { target: { value: '' } });

      const btnSalvar = screen.getByLabelText('Salvar edicao') as HTMLButtonElement;
      expect(btnSalvar.disabled).toBe(true);
    });
  });
});
