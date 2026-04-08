/**
 * Tipo de anotação em uma ficha.
 * Alinhado com backend TipoAnotacao enum.
 *
 * JOGADOR → anotação pessoal do jogador
 * MESTRE  → anotação do Mestre (pode ser marcada como visível para o jogador)
 */
export type TipoAnotacao = 'JOGADOR' | 'MESTRE';

/**
 * Anotação de ficha de personagem.
 * Alinhado com backend AnotacaoResponse record.
 *
 * Regras de visibilidade:
 * - Mestre vê todas as anotações da ficha.
 * - Jogador vê apenas as próprias e as do Mestre com visivelParaJogador=true.
 * - visivelParaTodos: qualquer usuário com permissão de edição pode marcar.
 * - pastaPaiId: null = anotação na raiz (sem pasta).
 */
export interface Anotacao {
  id: number;
  fichaId: number;
  autorId: number;
  autorNome: string;
  titulo: string;
  conteudo: string;
  tipoAnotacao: TipoAnotacao;
  visivelParaJogador: boolean;
  visivelParaTodos: boolean;
  pastaPaiId: number | null;
  dataCriacao: string;
  dataUltimaAtualizacao: string;
}

/**
 * DTO para criação de anotação.
 * Alinhado com backend CriarAnotacaoRequest record.
 */
export interface CriarAnotacaoDto {
  titulo: string;
  conteudo: string;
  tipoAnotacao: TipoAnotacao;
  visivelParaJogador?: boolean;
}

/**
 * DTO para atualização parcial de anotação.
 * Alinhado com backend AtualizarAnotacaoRequest record.
 *
 * tipoAnotacao é imutável — não incluso no DTO de atualização.
 * pastaPaiId null = mover anotação para a raiz (sem pasta).
 */
export interface AtualizarAnotacaoDto {
  titulo?: string;
  conteudo?: string;
  visivelParaJogador?: boolean;
  visivelParaTodos?: boolean;
  pastaPaiId?: number | null;
}
