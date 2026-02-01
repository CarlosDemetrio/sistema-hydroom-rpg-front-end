import { Injectable, SecurityContext, inject } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeUrl, SafeResourceUrl } from '@angular/platform-browser';

/**
 * Service para sanitização segura de conteúdo HTML.
 * Use sempre que precisar exibir conteúdo dinâmico com [innerHTML] ou similar.
 *
 * Proteção contra XSS (Cross-Site Scripting).
 */
@Injectable({
  providedIn: 'root'
})
export class SanitizerService {
  private sanitizer = inject(DomSanitizer);

  /**
   * Sanitiza HTML removendo scripts e conteúdo perigoso.
   * @param html HTML a ser sanitizado
   * @returns HTML seguro ou string vazia
   */
  sanitizeHtml(html: string | null | undefined): string {
    if (!html) {
      return '';
    }

    const sanitized = this.sanitizer.sanitize(SecurityContext.HTML, html);
    return sanitized || '';
  }

  /**
   * Sanitiza URL para uso em links.
   * @param url URL a ser sanitizada
   * @returns URL segura
   */
  sanitizeUrl(url: string): SafeUrl {
    return this.sanitizer.sanitize(SecurityContext.URL, url) || '';
  }

  /**
   * Sanitiza URL de recursos (iframes, etc).
   * @param url URL do recurso
   * @returns URL segura de recurso
   */
  sanitizeResourceUrl(url: string): SafeResourceUrl {
    return this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, url) || '';
  }

  /**
   * Bypass security apenas para conteúdo CONFIÁVEL.
   * ⚠️ USE COM MUITO CUIDADO - apenas para HTML que você controla 100%
   * @param html HTML confiável
   * @returns SafeHtml sem sanitização
   */
  bypassSecurityTrustHtml(html: string): SafeHtml {
    console.warn('⚠️ Usando bypassSecurityTrustHtml - certifique-se que o conteúdo é 100% confiável!');
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
