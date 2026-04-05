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
