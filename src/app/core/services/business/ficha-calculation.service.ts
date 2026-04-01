import { Injectable, inject } from '@angular/core';
import { FichaAtributo } from '@core/models/ficha-atributo.model';
import { AtributoConfig } from '@core/models/atributo-config.model';
import { ConfigStore } from '@core/stores/config.store';

/**
 * Business Service for Character Sheet Calculations (client-side preview only).
 *
 * These calculations are TEMPORARY — backend is always the source of truth.
 * After any save (POST/PUT), replace these values with the backend response.
 */
@Injectable({
  providedIn: 'root'
})
export class FichaCalculationService {
  private configStore = inject(ConfigStore);

  calcularAtributoTotal(base: number, nivel: number, outros: number): number {
    return base + nivel + outros;
  }

  calcularBBA(atributos: FichaAtributo[]): number {
    const map = this.buildAtributosMap(atributos);
    const formula = this.getFormulaFromConfig('BBA') || '(FOR + AGI) / 3';
    return this.parseFormula(formula, map);
  }

  calcularBBM(atributos: FichaAtributo[]): number {
    const map = this.buildAtributosMap(atributos);
    const formula = this.getFormulaFromConfig('BBM') || '(SAB + INT) / 3';
    return this.parseFormula(formula, map);
  }

  calcularImpeto(atributos: FichaAtributo[]): number {
    const map = this.buildAtributosMap(atributos);
    const formula = this.getFormulaFromConfig('Ímpeto') || 'FOR * 5';
    return this.parseFormula(formula, map);
  }

  calcularReflexo(atributos: FichaAtributo[]): number {
    const map = this.buildAtributosMap(atributos);
    const formula = this.getFormulaFromConfig('Reflexo') || '(AGI + AST) / 3';
    return this.parseFormula(formula, map);
  }

  calcularBloqueio(atributos: FichaAtributo[]): number {
    const map = this.buildAtributosMap(atributos);
    const formula = this.getFormulaFromConfig('Bloqueio') || '(FOR + VIG) / 3';
    return this.parseFormula(formula, map);
  }

  calcularPercepcao(atributos: FichaAtributo[]): number {
    const map = this.buildAtributosMap(atributos);
    const formula = this.getFormulaFromConfig('Percepção') || '(INT + INTU) / 3';
    return this.parseFormula(formula, map);
  }

  calcularRaciocinio(atributos: FichaAtributo[]): number {
    const map = this.buildAtributosMap(atributos);
    const formula = this.getFormulaFromConfig('Raciocínio') || '(INT + AST) / 3';
    return this.parseFormula(formula, map);
  }

  calcularEssencia(atributos: FichaAtributo[]): number {
    const map = this.buildAtributosMap(atributos);
    const formula = this.getFormulaFromConfig('Essência') || '(VIG + SAB) / 2';
    return this.parseFormula(formula, map);
  }

  calcularVidaTotal(vidaVigor: number, vidaOutros: number, vidaNivel: number): number {
    return (vidaVigor || 0) + (vidaOutros || 0) + (vidaNivel || 0);
  }

  calcularTodosDerivados(atributos: FichaAtributo[], vidaVigor = 0, vidaOutros = 0, vidaNivel = 0) {
    return {
      bba: this.calcularBBA(atributos),
      bbm: this.calcularBBM(atributos),
      impeto: this.calcularImpeto(atributos),
      reflexo: this.calcularReflexo(atributos),
      bloqueio: this.calcularBloqueio(atributos),
      percepcao: this.calcularPercepcao(atributos),
      raciocinio: this.calcularRaciocinio(atributos),
      essencia: this.calcularEssencia(atributos),
      vidaTotal: this.calcularVidaTotal(vidaVigor, vidaOutros, vidaNivel)
    };
  }

  // ===== Private Helpers =====

  private buildAtributosMap(atributos: FichaAtributo[]): Map<string, number> {
    const map = new Map<string, number>();
    atributos.forEach(attr => {
      if (attr.atributoConfig?.abreviacao) {
        map.set(attr.atributoConfig.abreviacao, attr.total || 0);
      }
    });
    return map;
  }

  private getFormulaFromConfig(nomeAtributo: string): string | null {
    const atributos = this.configStore.atributos();
    const config = atributos.find((a: AtributoConfig) => a.nome === nomeAtributo);
    return config?.formulaImpeto || null;
  }

  parseFormula(formula: string, atributos: Map<string, number>): number {
    try {
      let processedFormula = formula;
      atributos.forEach((value, abbrev) => {
        const regex = new RegExp(`\\b${abbrev}\\b`, 'g');
        processedFormula = processedFormula.replace(regex, value.toString());
      });
      const result = Function(`'use strict'; return (${processedFormula})`)();
      return Math.round(result * 100) / 100;
    } catch (error) {
      console.error('Error parsing formula:', formula, error);
      return 0;
    }
  }
}
