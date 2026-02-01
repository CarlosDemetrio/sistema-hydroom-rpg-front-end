/**
 * Character Sheet Physical Description section
 * Physical characteristics of the character
 */
export interface FichaDescricaoFisica {
  id?: number;
  fichaId?: number;
  idade?: number;
  altura?: number; // in cm
  peso?: number;   // in kg
  olhos?: string;
  cabelo?: string;
}
