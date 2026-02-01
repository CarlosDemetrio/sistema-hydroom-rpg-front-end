/**
 * Equipment type enum
 */
export type TipoEquipamento = 'ARMA' | 'ARMADURA' | 'OUTRO';

/**
 * Character Sheet Equipment
 * Weapons, armor, and other items
 */
export interface FichaEquipamento {
  id?: number;
  fichaId?: number;
  nome: string;
  tipo: TipoEquipamento;
  dano?: string; // e.g., "1d8+3"
  defesa?: number;
  peso?: number;
  descricao?: string;
}
