import { Injectable, inject } from '@angular/core';
import { Ficha, FichaAtributo, AtributoConfig } from '../../models';
import { ConfigStore } from '../../stores/config.store';

/**
 * Business Service for Character Sheet Calculations
 *
 * ⚠️ IMPORTANT: All calculations here are TEMPORARY (client-side preview only)
 *
 * Purpose:
 * - Provide immediate visual feedback while user edits (before save)
 * - Calculate derived stats for display purposes
 * - Enable responsive UX without server roundtrip
 *
 * Rules:
 * - Frontend can calculate for PREVIEW only
 * - Backend ALWAYS recalculates on save (source of truth)
 * - Frontend MUST replace temporary values with backend response after save
 * - These calculations are NOT persisted directly
 *
 * @providedIn 'root'
 */
@Injectable({
  providedIn: 'root'
})
export class FichaCalculationService {
  private configStore = inject(ConfigStore);

  /**
   * Calculate attribute total (TEMPORARY - for preview)
   * Formula: base + nivel + outros
   */
  calcularAtributoTotal(base: number, nivel: number, outros: number): number {
    return base + nivel + outros;
  }

  /**
   * Calculate BBA (Base Bonus Attack) - TEMPORARY preview
   * Default formula: (FOR + AGI) / 3
   * Can be customized via AtributoConfig.formulaCalculo
   */
  calcularBBA(ficha: Ficha): number {
    const atributos = this.buildAtributosMap(ficha.atributos);
    const formula = this.getFormulaFromConfig('BBA') || '(FOR + AGI) / 3';
    return this.parseFormula(formula, atributos);
  }

  /**
   * Calculate BBM (Base Bonus Magic) - TEMPORARY preview
   * Default formula: (SAB + INT) / 3
   */
  calcularBBM(ficha: Ficha): number {
    const atributos = this.buildAtributosMap(ficha.atributos);
    const formula = this.getFormulaFromConfig('BBM') || '(SAB + INT) / 3';
    return this.parseFormula(formula, atributos);
  }

  /**
   * Calculate Ímpeto (Impetus) - TEMPORARY preview
   * Default formula: FOR * 5
   */
  calcularImpeto(ficha: Ficha): number {
    const atributos = this.buildAtributosMap(ficha.atributos);
    const formula = this.getFormulaFromConfig('Ímpeto') || 'FOR * 5';
    return this.parseFormula(formula, atributos);
  }

  /**
   * Calculate Reflexo (Reflex) - TEMPORARY preview
   * Default formula: (AGI + AST) / 3
   */
  calcularReflexo(ficha: Ficha): number {
    const atributos = this.buildAtributosMap(ficha.atributos);
    const formula = this.getFormulaFromConfig('Reflexo') || '(AGI + AST) / 3';
    return this.parseFormula(formula, atributos);
  }

  /**
   * Calculate Bloqueio (Block) - TEMPORARY preview
   * Default formula: (FOR + VIG) / 3
   */
  calcularBloqueio(ficha: Ficha): number {
    const atributos = this.buildAtributosMap(ficha.atributos);
    const formula = this.getFormulaFromConfig('Bloqueio') || '(FOR + VIG) / 3';
    return this.parseFormula(formula, atributos);
  }

  /**
   * Calculate Percepção (Perception) - TEMPORARY preview
   * Default formula: (INT + INTU) / 3
   */
  calcularPercepcao(ficha: Ficha): number {
    const atributos = this.buildAtributosMap(ficha.atributos);
    const formula = this.getFormulaFromConfig('Percepção') || '(INT + INTU) / 3';
    return this.parseFormula(formula, atributos);
  }

  /**
   * Calculate Raciocínio (Reasoning) - TEMPORARY preview
   * Default formula: (INT + AST) / 3
   */
  calcularRaciocinio(ficha: Ficha): number {
    const atributos = this.buildAtributosMap(ficha.atributos);
    const formula = this.getFormulaFromConfig('Raciocínio') || '(INT + AST) / 3';
    return this.parseFormula(formula, atributos);
  }

  /**
   * Calculate Essência (Essence) - TEMPORARY preview
   * Default formula: (VIG + SAB) / 2
   */
  calcularEssencia(ficha: Ficha): number {
    const atributos = this.buildAtributosMap(ficha.atributos);
    const formula = this.getFormulaFromConfig('Essência') || '(VIG + SAB) / 2';
    return this.parseFormula(formula, atributos);
  }

  /**
   * Calculate Vida Total (Total Health) - TEMPORARY preview
   * Formula: vidaVigor + vidaOutros + vidaNivel
   */
  calcularVidaTotal(ficha: Ficha): number {
    if (!ficha.vida) return 0;
    return (ficha.vida.vidaVigor || 0) +
           (ficha.vida.vidaOutros || 0) +
           (ficha.vida.vidaNivel || 0);
  }

  /**
   * Calculate all derived stats at once - TEMPORARY preview
   * Returns object with all calculated values
   */
  calcularTodosDerivados(ficha: Ficha) {
    return {
      bba: this.calcularBBA(ficha),
      bbm: this.calcularBBM(ficha),
      impeto: this.calcularImpeto(ficha),
      reflexo: this.calcularReflexo(ficha),
      bloqueio: this.calcularBloqueio(ficha),
      percepcao: this.calcularPercepcao(ficha),
      raciocinio: this.calcularRaciocinio(ficha),
      essencia: this.calcularEssencia(ficha),
      vidaTotal: this.calcularVidaTotal(ficha)
    };
  }

  // ===== Private Helper Methods =====

  /**
   * Build a map of attribute abbreviations to their total values
   */
  private buildAtributosMap(atributos: FichaAtributo[]): Map<string, number> {
    const map = new Map<string, number>();

    atributos.forEach(attr => {
      if (attr.atributoConfig?.abreviacao) {
        map.set(attr.atributoConfig.abreviacao, attr.total || 0);
      }
    });

    return map;
  }

  /**
   * Get formula from config by attribute name
   */
  private getFormulaFromConfig(nomeAtributo: string): string | null {
    const atributos = this.configStore.atributos();
    const atributoConfig = atributos.find(
      (a: AtributoConfig) => a.nome === nomeAtributo
    );
    return atributoConfig?.formulaCalculo || null;
  }

  /**
   * Parse and evaluate a formula string
   * Supports basic arithmetic: +, -, *, /, (, )
   *
   * Example: "(FOR + AGI) / 3" with FOR=12, AGI=10 → 7.33
   */
  parseFormula(formula: string, atributos: Map<string, number>): number {
    try {
      // Replace attribute abbreviations with their values
      let processedFormula = formula;

      atributos.forEach((value, abbrev) => {
        const regex = new RegExp(`\\b${abbrev}\\b`, 'g');
        processedFormula = processedFormula.replace(regex, value.toString());
      });

      // Evaluate the mathematical expression
      // Note: Using Function() is safe here as formula comes from trusted config
      // In production, consider using a proper math expression parser
      const result = Function(`'use strict'; return (${processedFormula})`)();

      // Round to 2 decimal places
      return Math.round(result * 100) / 100;
    } catch (error) {
      console.error('Error parsing formula:', formula, error);
      return 0;
    }
  }
}
