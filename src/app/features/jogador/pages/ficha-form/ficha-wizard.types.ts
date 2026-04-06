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
