import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MarkdownPipe } from './markdown.pipe';
import { SanitizerService } from '@services/sanitizer.service';

describe('MarkdownPipe', () => {
  let pipe: MarkdownPipe;
  let sanitizerService: SanitizerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MarkdownPipe,
        SanitizerService,
        provideHttpClient(),
      ],
    });
    pipe = TestBed.inject(MarkdownPipe);
    sanitizerService = TestBed.inject(SanitizerService);
  });

  it('deve retornar valor sanitizado para string vazia', () => {
    expect(() => pipe.transform('')).not.toThrow();
  });

  it('deve retornar valor sanitizado para null', () => {
    expect(() => pipe.transform(null)).not.toThrow();
  });

  it('deve retornar valor sanitizado para undefined', () => {
    expect(() => pipe.transform(undefined)).not.toThrow();
  });

  it('deve chamar sanitizerService.sanitizeHtml com o HTML renderizado', () => {
    const sanitizeSpy = vi.spyOn(sanitizerService, 'sanitizeHtml');

    pipe.transform('Texto simples');

    expect(sanitizeSpy).toHaveBeenCalledWith(expect.stringContaining('Texto simples'));
  });

  it('deve converter negrito Markdown para tag strong', () => {
    const sanitizeSpy = vi.spyOn(sanitizerService, 'sanitizeHtml');

    pipe.transform('**negrito**');

    expect(sanitizeSpy).toHaveBeenCalledWith(expect.stringContaining('<strong>negrito</strong>'));
  });

  it('deve converter italico Markdown para tag em', () => {
    const sanitizeSpy = vi.spyOn(sanitizerService, 'sanitizeHtml');

    pipe.transform('_italico_');

    expect(sanitizeSpy).toHaveBeenCalledWith(expect.stringContaining('<em>italico</em>'));
  });

  it('deve converter cabecalho H1 Markdown', () => {
    const sanitizeSpy = vi.spyOn(sanitizerService, 'sanitizeHtml');

    pipe.transform('# Titulo Principal');

    expect(sanitizeSpy).toHaveBeenCalledWith(expect.stringContaining('<h1>Titulo Principal</h1>'));
  });

  it('deve converter cabecalho H2 Markdown', () => {
    const sanitizeSpy = vi.spyOn(sanitizerService, 'sanitizeHtml');

    pipe.transform('## Subtitulo');

    expect(sanitizeSpy).toHaveBeenCalledWith(expect.stringContaining('<h2>Subtitulo</h2>'));
  });

  it('deve converter codigo inline Markdown', () => {
    const sanitizeSpy = vi.spyOn(sanitizerService, 'sanitizeHtml');

    pipe.transform('`codigo`');

    expect(sanitizeSpy).toHaveBeenCalledWith(expect.stringContaining('<code>codigo</code>'));
  });

  it('deve renderizar Markdown complexo sem lancar erro', () => {
    const markdown = `# Titulo\n\n**negrito** e _italico_\n\n- Item 1\n- Item 2\n\n\`codigo inline\``;
    expect(() => pipe.transform(markdown)).not.toThrow();
  });
});
