/**
 * Tipos de efeito concreto de uma vantagem.
 * Alinhado com backend TipoEfeito enum.
 */
export type TipoEfeito =
  | 'BONUS_ATRIBUTO'
  | 'BONUS_APTIDAO'
  | 'BONUS_DERIVADO'
  | 'BONUS_VIDA'
  | 'BONUS_VIDA_MEMBRO'
  | 'BONUS_ESSENCIA'
  | 'DADO_UP'
  | 'FORMULA_CUSTOMIZADA';

/**
 * Efeito concreto de uma vantagem.
 * Alinhado com backend VantagemEfeitoResponse record.
 *
 * Regras de preenchimento por tipoEfeito:
 * - BONUS_ATRIBUTO      → atributoAlvoId obrigatório
 * - BONUS_APTIDAO       → aptidaoAlvoId obrigatório
 * - BONUS_DERIVADO      → bonusAlvoId obrigatório
 * - BONUS_VIDA_MEMBRO   → membroAlvoId obrigatório
 * - BONUS_VIDA          → sem FK de alvo
 * - BONUS_ESSENCIA      → sem FK de alvo
 * - DADO_UP             → sem valor numérico
 * - FORMULA_CUSTOMIZADA → formula obrigatório
 */
export interface VantagemEfeito {
  id: number;
  vantagemConfigId: number;
  tipoEfeito: TipoEfeito;
  atributoAlvoId?: number | null;
  atributoAlvoNome?: string | null;
  aptidaoAlvoId?: number | null;
  aptidaoAlvoNome?: string | null;
  bonusAlvoId?: number | null;
  bonusAlvoNome?: string | null;
  membroAlvoId?: number | null;
  membroAlvoNome?: string | null;
  valorFixo?: number | null;
  valorPorNivel?: number | null;
  formula?: string | null;
  descricaoEfeito?: string | null;
  dataCriacao: string;
}

/**
 * DTO para criação de um efeito de vantagem.
 * Alinhado com backend CriarVantagemEfeitoRequest record.
 */
export interface CriarVantagemEfeitoDto {
  tipoEfeito: TipoEfeito;
  atributoAlvoId?: number;
  aptidaoAlvoId?: number;
  bonusAlvoId?: number;
  membroAlvoId?: number;
  valorFixo?: number;
  valorPorNivel?: number;
  formula?: string;
  descricaoEfeito?: string;
}
