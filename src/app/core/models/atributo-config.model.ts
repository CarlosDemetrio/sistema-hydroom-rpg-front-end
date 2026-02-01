/**
 * Attribute Configuration
 * Defines an attribute type in the game system (e.g., Força, Agilidade)
 * Configured by Mestre
 */
export interface AtributoConfig {
  id: number;
  nome: string;
  abreviacao: string; // 2-5 chars (e.g., "FOR", "AGI")
  ordem: number;      // Display order
  formulaCalculo?: string; // Optional formula for calculated attributes (e.g., "(FOR + AGI) / 3")
  ativo: boolean;
}
