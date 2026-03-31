import { Injectable, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Service para gerenciar o tema da aplicação (light/dark mode)
 *
 * Features:
 * - Detecta preferência do sistema (prefers-color-scheme)
 * - Persiste preferência do usuário no localStorage
 * - Aplica classe 'app-dark' no elemento html
 * - Signal reativo para componentes
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  private readonly THEME_KEY = 'app-theme';
  private readonly DARK_CLASS = 'app-dark';

  // Signal para o estado do dark mode
  isDarkMode = signal<boolean>(false);

  constructor() {
    // Só executa no browser (não no SSR)
    if (isPlatformBrowser(this.platformId)) {
      this.initializeTheme();

      // Effect para aplicar/remover classe quando o signal mudar
      effect(() => {
        const isDark = this.isDarkMode();
        this.applyTheme(isDark);
      });
    }
  }

  /**
   * Inicializa o tema baseado em:
   * 1. Preferência salva no localStorage
   * 2. Dark mode como padrão do app (identidade Klayrah RPG)
   */
  private initializeTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY);

    if (savedTheme !== null) {
      // Usa preferência salva
      this.isDarkMode.set(savedTheme === 'dark');
    } else {
      // Dark mode é o padrão do app (sem preferência salva)
      this.isDarkMode.set(true);
    }

    // Escuta mudanças na preferência do sistema (respeitado apenas quando há preferência salva como 'system')
    // O padrão do app é dark; usuário pode alternar manualmente via ThemeToggle.
  }

  /**
   * Aplica o tema adicionando/removendo a classe no elemento html
   */
  private applyTheme(isDark: boolean): void {
    const htmlElement = document.documentElement;

    if (isDark) {
      htmlElement.classList.add(this.DARK_CLASS);
    } else {
      htmlElement.classList.remove(this.DARK_CLASS);
    }

    // Salva preferência
    localStorage.setItem(this.THEME_KEY, isDark ? 'dark' : 'light');
  }

  /**
   * Alterna entre light e dark mode
   */
  toggleTheme(): void {
    this.isDarkMode.update(current => !current);
  }

  /**
   * Define o tema explicitamente
   */
  setTheme(isDark: boolean): void {
    this.isDarkMode.set(isDark);
  }

  /**
   * Reseta para o padrão do app (dark mode)
   */
  resetToDefault(): void {
    localStorage.removeItem(this.THEME_KEY);
    this.isDarkMode.set(true);
  }
}
