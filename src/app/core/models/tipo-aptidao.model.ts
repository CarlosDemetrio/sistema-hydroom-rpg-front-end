/**
 * Skill Type enum (FISICO or MENTAL)
 */
export type TipoAptidaoNome = 'FISICO' | 'MENTAL';

/**
 * Skill Type model
 * Categorizes skills as physical or mental
 */
export interface TipoAptidao {
  id: number;
  nome: TipoAptidaoNome;
}
