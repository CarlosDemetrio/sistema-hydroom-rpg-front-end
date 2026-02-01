import { FichaVidaMembro } from './ficha-vida-membro.model';

/**
 * Character Sheet Health/Life section
 *
 * IMPORTANT: vidaTotal is CALCULATED BY BACKEND
 * Frontend can calculate temporarily: vidaTotal = vidaVigor + vidaOutros + vidaNivel
 */
export interface FichaVida {
  id?: number;
  fichaId?: number;
  vidaVigor: number;
  vidaOutros: number;
  vidaNivel: number;
  vidaTotal: number; // ← CALCULATED BY BACKEND
  sanguePercentual: number; // 0-100

  // Nested array (limb integrity)
  membros: FichaVidaMembro[];
}
