import { User } from './user.model';
import { Jogo } from './jogo.model';
import { FichaIdentificacao } from './ficha-identificacao.model';
import { FichaProgressao } from './ficha-progressao.model';
import { FichaDescricaoFisica } from './ficha-descricao-fisica.model';
import { FichaAtributo } from './ficha-atributo.model';
import { FichaVida } from './ficha-vida.model';
import { FichaAptidao } from './ficha-aptidao.model';
import { FichaEquipamento } from './ficha-equipamento.model';
import { FichaVantagem } from './ficha-vantagem.model';
import { FichaTitulo } from './ficha-titulo.model';
import { FichaRuna } from './ficha-runa.model';

/**
 * Calculated stats returned by backend
 * These are computed server-side based on formulas in config
 */
export interface FichaCalculados {
  bba: number;      // Base Bonus Attack
  bbm: number;      // Base Bonus Magic
  impeto: number;   // Impetus
  reflexo: number;  // Reflex
  bloqueio: number; // Block
  percepcao: number; // Perception
  raciocinio: number; // Reasoning
  essencia: number;  // Essence
}

/**
 * Character Sheet (Ficha) model
 * Main entity representing a player's character
 *
 * IMPORTANT: Calculated values (calculados) are ALWAYS from backend
 * Frontend can calculate temporarily for preview, but must replace with backend values after save
 */
export interface Ficha {
  id: number;
  nome: string;
  jogadorId: number;
  jogoId?: number;
  dataCriacao: Date;
  dataAtualizacao: Date;

  // Section 1: Identification
  identificacao?: FichaIdentificacao;

  // Section 2: Progression
  progressao?: FichaProgressao;

  // Section 3: Physical Description
  descricaoFisica?: FichaDescricaoFisica;

  // Section 4: Attributes
  atributos: FichaAtributo[];

  // Section 5: Calculated Stats (from backend)
  calculados?: FichaCalculados;

  // Section 6: Health
  vida?: FichaVida;

  // Section 7: Skills/Aptitudes
  aptidoes: FichaAptidao[];

  // Section 8: Equipment
  equipamentos: FichaEquipamento[];

  // Section 9: Advantages
  vantagens: FichaVantagem[];

  // Section 10: Titles
  titulos: FichaTitulo[];

  // Section 11: Runes
  runas: FichaRuna[];

  // Section 12: Notes
  anotacoes?: string;

  // Nested objects (populated by backend)
  jogador?: User;
  jogo?: Jogo;
}
