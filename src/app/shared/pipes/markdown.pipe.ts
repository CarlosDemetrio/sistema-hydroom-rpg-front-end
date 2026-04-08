import { inject, Pipe, PipeTransform } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { SanitizerService } from '@services/sanitizer.service';

/**
 * Pipe de renderização de Markdown para HTML seguro.
 *
 * Usa SanitizerService.sanitizeHtml() (SecurityContext.HTML) para garantir
 * proteção contra XSS antes de renderizar com [innerHTML].
 *
 * Alternativa à ngx-markdown para Angular 21 sem problemas de peer dependencies.
 * Usa a API marked se disponível (via CDN/script tag), com fallback para
 * implementação básica de Markdown.
 *
 * Uso: <div [innerHTML]="conteudo | markdown"></div>
 */
@Pipe({
  name: 'markdown',
  standalone: true,
})
export class MarkdownPipe implements PipeTransform {
  private sanitizerService = inject(SanitizerService);

  transform(value: string | null | undefined): SafeHtml {
    if (!value) {
      return this.sanitizerService.sanitizeHtml('');
    }

    const rawHtml = this.renderMarkdown(value);
    // sanitizeHtml usa SecurityContext.HTML — remove scripts, on* handlers, etc.
    return this.sanitizerService.sanitizeHtml(rawHtml);
  }

  private renderMarkdown(text: string): string {
    // Tenta usar marked se estiver disponível no ambiente (ex: importado via script)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const global = window as any;
    if (global['marked']?.parse) {
      return global['marked'].parse(text) as string;
    }

    // Fallback: implementação básica de Markdown sem dependência externa
    return text
      // Cabeçalhos
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      // Negrito e itálico combinados
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      // Negrito
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Itálico
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/_(.+?)_/g, '<em>$1</em>')
      // Código inline
      .replace(/`(.+?)`/g, '<code>$1</code>')
      // Strikethrough
      .replace(/~~(.+?)~~/g, '<del>$1</del>')
      // Listas não-ordenadas
      .replace(/^\s*[-*+] (.+)$/gm, '<li>$1</li>')
      // Listas ordenadas
      .replace(/^\s*\d+\. (.+)$/gm, '<li>$1</li>')
      // Parágrafos
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
  }
}
