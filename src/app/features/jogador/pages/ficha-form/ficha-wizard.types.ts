/**
 * Tipos usados pelo FichaWizardComponent e seus steps.
 */

export type EstadoSalvamento = 'idle' | 'salvando' | 'salvo' | 'erro';

export interface FormPasso1 {
  nome: string;
  generoId: number | null;
  racaId: number | null;
  classeId: number | null;
  indoleId: number | null;
  presencaId: number | null;
  isNpc: boolean;
  descricao: string | null;
}

export interface FormPasso2 {
  descricao: string | null;
}

/**
 * Representa um atributo da ficha no estado editavel do Passo 3.
 * Mapeado a partir de FichaAtributoResponse para uso no wizard.
 */
export interface FichaAtributoEditavel {
  /** ID do registro FichaAtributo no backend (para atualizacao em lote). */
  atributoConfigId: number;
  atributoNome: string;
  atributoAbreviacao: string;
  /** Pontos base distribuidos pelo jogador. Editavel. */
  base: number;
  /** Bonus de raca (somente leitura). */
  outros: number;
}

/**
 * Representa uma aptidao da ficha no estado editavel do Passo 4.
 * Mapeado a partir de FichaAptidaoResponse + AptidaoConfig para uso no wizard.
 * Apenas `base` e editavel — `sorte` e `classe` sao somente leitura.
 */
export interface FichaAptidaoEditavel {
  aptidaoConfigId: number;
  aptidaoNome: string;
  /** Nome do tipo de aptidao para agrupamento visual. Vem do AptidaoConfig (join no frontend). */
  tipoAptidaoNome: string;
  /** Pontos base distribuidos pelo jogador. Editavel. */
  base: number;
  /** Pontos de sorte (somente leitura). */
  sorte: number;
  /** Pontos de classe (somente leitura). */
  classe: number;
}

/**
 * Agrupamento de aptidoes por tipo para exibicao no StepAptidoesComponent.
 */
export interface TipoAptidaoComAptidoes {
  tipoNome: string;
  aptidoes: FichaAptidaoEditavel[];
}
