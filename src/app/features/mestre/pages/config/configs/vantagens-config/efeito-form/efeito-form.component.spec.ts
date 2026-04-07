/**
 * EfeitoFormComponent — Spec
 *
 * Dumb component com input.required() e input() simples.
 * Em modo JIT (Vitest sem plugin Angular), usamos ɵSIGNAL para atribuir
 * valores aos inputs de signal após o render, antes de detectChanges.
 *
 * Padrão: render com NO_ERRORS_SCHEMA + detectChangesOnRender:false,
 * depois setSignalInput + detectChanges + whenStable.
 */

import { TestBed } from '@angular/core/testing';
import { render } from '@testing-library/angular';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ɵSIGNAL as SIGNAL_SYM } from '@angular/core';
import { vi } from 'vitest';

import { EfeitoFormComponent } from './efeito-form.component';
import { AtributoConfig } from '@core/models/atributo-config.model';
import { AptidaoConfig } from '@core/models/aptidao-config.model';
import { BonusConfig, DadoProspeccaoConfig, MembroCorpoConfig } from '@core/models/config.models';
import { TipoEfeito } from '@core/models/vantagem-efeito.model';

// ============================================================
// Helper JIT: atribuir valor a input() / input.required() signal
// ============================================================

function setSignalInput<T>(component: unknown, inputName: string, value: T): void {
  const signalFn = (component as Record<string, unknown>)[inputName];
  if (signalFn && (signalFn as Record<symbol, unknown>)[SIGNAL_SYM as symbol]) {
    const node = (signalFn as Record<symbol, unknown>)[SIGNAL_SYM as symbol] as {
      applyValueToInputSignal: (node: unknown, v: T) => void;
    };
    node.applyValueToInputSignal(node, value);
  }
}

// ============================================================
// Dados de teste
// ============================================================

const atributoMock: AtributoConfig = {
  id: 1,
  jogoId: 10,
  nome: 'Força',
  abreviacao: 'FOR',
  descricao: null,
  formulaImpeto: null,
  descricaoImpeto: null,
  valorMinimo: 1,
  valorMaximo: 20,
  ordemExibicao: 1,
  dataCriacao: '2024-01-01T00:00:00',
  dataUltimaAtualizacao: '2024-06-01T00:00:00',
};

const aptidaoMock: AptidaoConfig = {
  id: 2,
  jogoId: 10,
  tipoAptidaoId: 1,
  tipoAptidaoNome: 'Combate',
  nome: 'Atletismo',
  descricao: null,
  ordemExibicao: 1,
  dataCriacao: '2024-01-01T00:00:00',
  dataUltimaAtualizacao: '2024-06-01T00:00:00',
};

const bonusMock: BonusConfig = {
  id: 3,
  jogoId: 10,
  nome: 'BBA',
  sigla: 'BBA',
  descricao: null,
  formulaBase: null,
  ordemExibicao: 1,
  dataCriacao: '2024-01-01T00:00:00',
  dataUltimaAtualizacao: '2024-06-01T00:00:00',
};

const membroMock: MembroCorpoConfig = {
  id: 4,
  jogoId: 10,
  nome: 'Cabeça',
  porcentagemVida: 0.1,
  ordemExibicao: 1,
  dataCriacao: '2024-01-01T00:00:00',
  dataUltimaAtualizacao: '2024-06-01T00:00:00',
};

const dadosMock: DadoProspeccaoConfig[] = [
  { id: 10, jogoId: 10, nome: 'd4',  descricao: null, numeroFaces: 4,  ordemExibicao: 1, dataCriacao: '2024-01-01T00:00:00', dataUltimaAtualizacao: '2024-06-01T00:00:00' },
  { id: 11, jogoId: 10, nome: 'd6',  descricao: null, numeroFaces: 6,  ordemExibicao: 2, dataCriacao: '2024-01-01T00:00:00', dataUltimaAtualizacao: '2024-06-01T00:00:00' },
  { id: 12, jogoId: 10, nome: 'd8',  descricao: null, numeroFaces: 8,  ordemExibicao: 3, dataCriacao: '2024-01-01T00:00:00', dataUltimaAtualizacao: '2024-06-01T00:00:00' },
  { id: 13, jogoId: 10, nome: 'd10', descricao: null, numeroFaces: 10, ordemExibicao: 4, dataCriacao: '2024-01-01T00:00:00', dataUltimaAtualizacao: '2024-06-01T00:00:00' },
  { id: 14, jogoId: 10, nome: 'd12', descricao: null, numeroFaces: 12, ordemExibicao: 5, dataCriacao: '2024-01-01T00:00:00', dataUltimaAtualizacao: '2024-06-01T00:00:00' },
];

// ============================================================
// Helper de render
// ============================================================

async function renderEfeitoForm(opcoes: {
  nivelMaximo?: number;
  atributos?: AtributoConfig[];
  aptidoes?: AptidaoConfig[];
  bonus?: BonusConfig[];
  membros?: MembroCorpoConfig[];
  dados?: DadoProspeccaoConfig[];
} = {}) {
  const result = await render(EfeitoFormComponent, {
    detectChangesOnRender: false,
    schemas: [NO_ERRORS_SCHEMA],
  });

  const comp = result.fixture.componentInstance;

  setSignalInput(comp, 'vantagemId', 1);
  setSignalInput(comp, 'nivelMaximoVantagem', opcoes.nivelMaximo ?? 3);
  setSignalInput(comp, 'atributosDisponiveis', opcoes.atributos ?? [atributoMock]);
  setSignalInput(comp, 'aptidoesDisponiveis', opcoes.aptidoes ?? [aptidaoMock]);
  setSignalInput(comp, 'bonusDisponiveis', opcoes.bonus ?? [bonusMock]);
  setSignalInput(comp, 'membrosDisponiveis', opcoes.membros ?? [membroMock]);
  setSignalInput(comp, 'dadosDisponiveis', opcoes.dados ?? []);

  result.fixture.detectChanges();
  await result.fixture.whenStable();

  return result;
}

// ============================================================
// Helpers: simular seleção de tipo
// ============================================================

function selecionarTipo(comp: EfeitoFormComponent, tipo: TipoEfeito): void {
  comp.tipoSelecionadoModel = tipo;
  comp.onTipoChange(tipo);
}

// ============================================================
// Testes
// ============================================================

describe('EfeitoFormComponent', () => {

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.useRealTimers();
  });

  // ----------------------------------------------------------
  // 1. Flags computed por tipo
  // ----------------------------------------------------------

  describe('flags computed por tipo de efeito', () => {
    it('deve exibir alvo de atributo apenas para BONUS_ATRIBUTO', async () => {
      const { fixture } = await renderEfeitoForm();
      const comp = fixture.componentInstance;

      selecionarTipo(comp, 'BONUS_ATRIBUTO');
      fixture.detectChanges();

      expect(comp.mostrarAlvoAtributo()).toBe(true);
      expect(comp.mostrarAlvoAptidao()).toBe(false);
      expect(comp.mostrarAlvoBonus()).toBe(false);
      expect(comp.mostrarAlvoMembro()).toBe(false);
    });

    it('deve exibir alvo de aptidão apenas para BONUS_APTIDAO', async () => {
      const { fixture } = await renderEfeitoForm();
      const comp = fixture.componentInstance;

      selecionarTipo(comp, 'BONUS_APTIDAO');
      fixture.detectChanges();

      expect(comp.mostrarAlvoAptidao()).toBe(true);
      expect(comp.mostrarAlvoAtributo()).toBe(false);
    });

    it('deve exibir alvo de bônus apenas para BONUS_DERIVADO', async () => {
      const { fixture } = await renderEfeitoForm();
      const comp = fixture.componentInstance;

      selecionarTipo(comp, 'BONUS_DERIVADO');
      fixture.detectChanges();

      expect(comp.mostrarAlvoBonus()).toBe(true);
      expect(comp.mostrarAlvoAtributo()).toBe(false);
    });

    it('deve exibir alvo de membro apenas para BONUS_VIDA_MEMBRO', async () => {
      const { fixture } = await renderEfeitoForm();
      const comp = fixture.componentInstance;

      selecionarTipo(comp, 'BONUS_VIDA_MEMBRO');
      fixture.detectChanges();

      expect(comp.mostrarAlvoMembro()).toBe(true);
      expect(comp.mostrarAlvoAtributo()).toBe(false);
    });

    it('deve mostrar campos numéricos para todos os tipos exceto DADO_UP e FORMULA_CUSTOMIZADA', async () => {
      const { fixture } = await renderEfeitoForm();
      const comp = fixture.componentInstance;
      const tiposNumericos: TipoEfeito[] = [
        'BONUS_ATRIBUTO', 'BONUS_APTIDAO', 'BONUS_DERIVADO',
        'BONUS_VIDA', 'BONUS_VIDA_MEMBRO', 'BONUS_ESSENCIA',
      ];

      for (const tipo of tiposNumericos) {
        selecionarTipo(comp, tipo);
        fixture.detectChanges();
        expect(comp.mostrarValorNumerico()).toBe(true);
      }
    });

    it('deve ocultar todos os campos numéricos e dropdowns de alvo para DADO_UP', async () => {
      const { fixture } = await renderEfeitoForm();
      const comp = fixture.componentInstance;

      selecionarTipo(comp, 'DADO_UP');
      fixture.detectChanges();

      expect(comp.mostrarValorNumerico()).toBe(false);
      expect(comp.mostrarAlvoAtributo()).toBe(false);
      expect(comp.mostrarAlvoAptidao()).toBe(false);
      expect(comp.mostrarAlvoBonus()).toBe(false);
      expect(comp.mostrarAlvoMembro()).toBe(false);
      expect(comp.isDadoUp()).toBe(true);
    });

    it('deve mostrar flag de fórmula para FORMULA_CUSTOMIZADA', async () => {
      const { fixture } = await renderEfeitoForm();
      const comp = fixture.componentInstance;

      selecionarTipo(comp, 'FORMULA_CUSTOMIZADA');
      fixture.detectChanges();

      expect(comp.mostrarFormula()).toBe(true);
      expect(comp.mostrarValorNumerico()).toBe(false);
    });
  });

  // ----------------------------------------------------------
  // 2. Preview calculado
  // ----------------------------------------------------------

  describe('preview calculado', () => {
    it('deve calcular preview corretamente: fixo=2 + porNivel=3 * nivel=4 = 14', async () => {
      const { fixture } = await renderEfeitoForm({ nivelMaximo: 5 });
      const comp = fixture.componentInstance;

      selecionarTipo(comp, 'BONUS_ATRIBUTO');
      comp.form.valorFixo      = 2;
      comp.form.valorPorNivel  = 3;
      comp.nivelPreview.set(4);
      fixture.detectChanges();

      expect(comp.calcularPreview()).toBe(14);
    });

    it('deve calcular preview com apenas valorFixo: fixo=5, nivel=3 = 5', async () => {
      const { fixture } = await renderEfeitoForm();
      const comp = fixture.componentInstance;

      selecionarTipo(comp, 'BONUS_VIDA');
      comp.form.valorFixo     = 5;
      comp.form.valorPorNivel = null;
      comp.nivelPreview.set(3);
      fixture.detectChanges();

      expect(comp.calcularPreview()).toBe(5);
    });

    it('deve calcular preview com apenas valorPorNivel: porNivel=2, nivel=3 = 6', async () => {
      const { fixture } = await renderEfeitoForm();
      const comp = fixture.componentInstance;

      selecionarTipo(comp, 'BONUS_ESSENCIA');
      comp.form.valorFixo     = null;
      comp.form.valorPorNivel = 2;
      comp.nivelPreview.set(3);
      fixture.detectChanges();

      expect(comp.calcularPreview()).toBe(6);
    });

    it('deve retornar 0 quando ambos valorFixo e valorPorNivel são null/0', async () => {
      const { fixture } = await renderEfeitoForm();
      const comp = fixture.componentInstance;

      selecionarTipo(comp, 'BONUS_ATRIBUTO');
      comp.form.valorFixo     = null;
      comp.form.valorPorNivel = null;
      comp.nivelPreview.set(1);
      fixture.detectChanges();

      expect(comp.calcularPreview()).toBe(0);
    });

    it('não deve mostrar preview quando DADO_UP', async () => {
      const { fixture } = await renderEfeitoForm();
      const comp = fixture.componentInstance;

      selecionarTipo(comp, 'DADO_UP');
      fixture.detectChanges();

      expect(comp.podeMostrarPreview()).toBe(false);
    });
  });

  // ----------------------------------------------------------
  // 3. Validação podeSubmeter
  // ----------------------------------------------------------

  describe('podeSubmeter (validação client-side)', () => {
    it('deve ser false quando nenhum tipo selecionado', async () => {
      const { fixture } = await renderEfeitoForm();
      const comp = fixture.componentInstance;

      expect(comp.podeSubmeter()).toBe(false);
    });

    it('deve ser false para BONUS_ATRIBUTO sem atributoAlvoId', async () => {
      const { fixture } = await renderEfeitoForm();
      const comp = fixture.componentInstance;

      selecionarTipo(comp, 'BONUS_ATRIBUTO');
      comp.form.atributoAlvoId = null;
      comp.form.valorFixo      = 2;
      fixture.detectChanges();

      expect(comp.podeSubmeter()).toBe(false);
    });

    it('deve ser false para BONUS_ATRIBUTO sem valorFixo nem valorPorNivel', async () => {
      const { fixture } = await renderEfeitoForm();
      const comp = fixture.componentInstance;

      selecionarTipo(comp, 'BONUS_ATRIBUTO');
      comp.form.atributoAlvoId = 1;
      comp.form.valorFixo      = null;
      comp.form.valorPorNivel  = null;
      fixture.detectChanges();

      expect(comp.podeSubmeter()).toBe(false);
    });

    it('deve ser true para BONUS_ATRIBUTO com alvo e valorFixo preenchidos', async () => {
      const { fixture } = await renderEfeitoForm();
      const comp = fixture.componentInstance;

      selecionarTipo(comp, 'BONUS_ATRIBUTO');
      comp.form.atributoAlvoId = 1;
      comp.form.valorFixo      = 2;
      fixture.detectChanges();

      expect(comp.podeSubmeter()).toBe(true);
    });

    it('deve ser false para BONUS_APTIDAO sem aptidaoAlvoId', async () => {
      const { fixture } = await renderEfeitoForm();
      const comp = fixture.componentInstance;

      selecionarTipo(comp, 'BONUS_APTIDAO');
      comp.form.aptidaoAlvoId = null;
      comp.form.valorFixo     = 1;
      fixture.detectChanges();

      expect(comp.podeSubmeter()).toBe(false);
    });

    it('deve ser false para BONUS_DERIVADO sem bonusAlvoId', async () => {
      const { fixture } = await renderEfeitoForm();
      const comp = fixture.componentInstance;

      selecionarTipo(comp, 'BONUS_DERIVADO');
      comp.form.bonusAlvoId = null;
      comp.form.valorFixo   = 1;
      fixture.detectChanges();

      expect(comp.podeSubmeter()).toBe(false);
    });

    it('deve ser false para BONUS_VIDA_MEMBRO sem membroAlvoId', async () => {
      const { fixture } = await renderEfeitoForm();
      const comp = fixture.componentInstance;

      selecionarTipo(comp, 'BONUS_VIDA_MEMBRO');
      comp.form.membroAlvoId = null;
      comp.form.valorFixo    = 1;
      fixture.detectChanges();

      expect(comp.podeSubmeter()).toBe(false);
    });

    it('deve ser true para DADO_UP sem valores numéricos', async () => {
      const { fixture } = await renderEfeitoForm();
      const comp = fixture.componentInstance;

      selecionarTipo(comp, 'DADO_UP');
      fixture.detectChanges();

      expect(comp.podeSubmeter()).toBe(true);
    });

    it('deve ser false para FORMULA_CUSTOMIZADA (indisponível)', async () => {
      const { fixture } = await renderEfeitoForm();
      const comp = fixture.componentInstance;

      selecionarTipo(comp, 'FORMULA_CUSTOMIZADA');
      comp.form.formula = 'nivel * 2';
      fixture.detectChanges();

      expect(comp.podeSubmeter()).toBe(false);
    });

    it('deve ser true para BONUS_VIDA com valorPorNivel preenchido', async () => {
      const { fixture } = await renderEfeitoForm();
      const comp = fixture.componentInstance;

      selecionarTipo(comp, 'BONUS_VIDA');
      comp.form.valorPorNivel = 5;
      fixture.detectChanges();

      expect(comp.podeSubmeter()).toBe(true);
    });
  });

  // ----------------------------------------------------------
  // 4. Emissão de eventos
  // ----------------------------------------------------------

  describe('emissão de eventos', () => {
    it('deve emitir efeitoSalvo com DTO correto ao salvar BONUS_ATRIBUTO', async () => {
      const { fixture } = await renderEfeitoForm();
      const comp = fixture.componentInstance;

      const efeitoSalvoSpy = vi.fn();
      comp.efeitoSalvo.subscribe(efeitoSalvoSpy);

      selecionarTipo(comp, 'BONUS_ATRIBUTO');
      comp.form.atributoAlvoId = 1;
      comp.form.valorFixo      = 3;
      comp.form.valorPorNivel  = 1;
      comp.form.descricaoEfeito = 'Bônus de força';
      fixture.detectChanges();

      comp.salvar();

      expect(efeitoSalvoSpy).toHaveBeenCalledTimes(1);
      const dto = efeitoSalvoSpy.mock.calls[0][0];
      expect(dto.tipoEfeito).toBe('BONUS_ATRIBUTO');
      expect(dto.atributoAlvoId).toBe(1);
      expect(dto.valorFixo).toBe(3);
      expect(dto.valorPorNivel).toBe(1);
      expect(dto.descricaoEfeito).toBe('Bônus de força');
    });

    it('deve emitir efeitoSalvo com DTO correto ao salvar DADO_UP', async () => {
      const { fixture } = await renderEfeitoForm();
      const comp = fixture.componentInstance;

      const efeitoSalvoSpy = vi.fn();
      comp.efeitoSalvo.subscribe(efeitoSalvoSpy);

      selecionarTipo(comp, 'DADO_UP');
      fixture.detectChanges();

      comp.salvar();

      expect(efeitoSalvoSpy).toHaveBeenCalledTimes(1);
      const dto = efeitoSalvoSpy.mock.calls[0][0];
      expect(dto.tipoEfeito).toBe('DADO_UP');
      expect(dto.valorFixo).toBeUndefined();
      expect(dto.valorPorNivel).toBeUndefined();
      expect(dto.atributoAlvoId).toBeUndefined();
    });

    it('não deve emitir efeitoSalvo quando podeSubmeter é false', async () => {
      const { fixture } = await renderEfeitoForm();
      const comp = fixture.componentInstance;

      const efeitoSalvoSpy = vi.fn();
      comp.efeitoSalvo.subscribe(efeitoSalvoSpy);

      // Sem tipo selecionado
      comp.salvar();

      expect(efeitoSalvoSpy).not.toHaveBeenCalled();
    });

    it('deve emitir cancelar ao chamar cancelar.emit()', async () => {
      const { fixture } = await renderEfeitoForm();
      const comp = fixture.componentInstance;

      const cancelarSpy = vi.fn();
      comp.cancelar.subscribe(cancelarSpy);

      comp.cancelar.emit();

      expect(cancelarSpy).toHaveBeenCalledTimes(1);
    });

    it('deve incluir apenas campos não-nulos no DTO emitido', async () => {
      const { fixture } = await renderEfeitoForm();
      const comp = fixture.componentInstance;

      const efeitoSalvoSpy = vi.fn();
      comp.efeitoSalvo.subscribe(efeitoSalvoSpy);

      selecionarTipo(comp, 'BONUS_VIDA');
      comp.form.valorFixo     = 10;
      comp.form.valorPorNivel = null;
      comp.form.descricaoEfeito = '';
      fixture.detectChanges();

      comp.salvar();

      const dto = efeitoSalvoSpy.mock.calls[0][0];
      expect(dto.valorFixo).toBe(10);
      expect('valorPorNivel' in dto).toBe(false);
      expect('descricaoEfeito' in dto).toBe(false);
      expect('atributoAlvoId' in dto).toBe(false);
    });
  });

  // ----------------------------------------------------------
  // 5. Reset ao mudar tipo
  // ----------------------------------------------------------

  describe('reset ao mudar tipo', () => {
    it('deve limpar atributoAlvoId ao mudar de BONUS_ATRIBUTO para outro tipo', async () => {
      const { fixture } = await renderEfeitoForm();
      const comp = fixture.componentInstance;

      selecionarTipo(comp, 'BONUS_ATRIBUTO');
      comp.form.atributoAlvoId = 1;
      fixture.detectChanges();

      selecionarTipo(comp, 'BONUS_VIDA');
      fixture.detectChanges();

      expect(comp.form.atributoAlvoId).toBeNull();
    });

    it('deve limpar aptidaoAlvoId ao mudar de BONUS_APTIDAO para outro tipo', async () => {
      const { fixture } = await renderEfeitoForm();
      const comp = fixture.componentInstance;

      selecionarTipo(comp, 'BONUS_APTIDAO');
      comp.form.aptidaoAlvoId = 2;
      fixture.detectChanges();

      selecionarTipo(comp, 'BONUS_ATRIBUTO');
      fixture.detectChanges();

      expect(comp.form.aptidaoAlvoId).toBeNull();
    });
  });

  // ----------------------------------------------------------
  // 6. descricaoTipoAtual computed
  // ----------------------------------------------------------

  describe('descricaoTipoAtual', () => {
    it('deve retornar descrição correta para BONUS_ATRIBUTO', async () => {
      const { fixture } = await renderEfeitoForm();
      const comp = fixture.componentInstance;

      selecionarTipo(comp, 'BONUS_ATRIBUTO');
      fixture.detectChanges();

      expect(comp.descricaoTipoAtual()).toContain('atributo');
    });

    it('deve retornar string vazia quando nenhum tipo selecionado', async () => {
      const { fixture } = await renderEfeitoForm();
      const comp = fixture.componentInstance;

      expect(comp.descricaoTipoAtual()).toBe('');
    });
  });

  // ----------------------------------------------------------
  // 7. DADO_UP — preview visual de progressão de dado
  // ----------------------------------------------------------

  describe('DADO_UP — preview de progressão de dado', () => {
    it('deve ativar isDadoUp e ter dadosDisponiveis quando dados são fornecidos', async () => {
      const { fixture } = await renderEfeitoForm({ dados: dadosMock });
      const comp = fixture.componentInstance;

      selecionarTipo(comp, 'DADO_UP');
      fixture.detectChanges();

      expect(comp.isDadoUp()).toBe(true);
      expect(comp.dadosDisponiveis().length).toBe(5);
    });

    it('deve retornar null para dadoResultantePreview quando nenhum dado base está selecionado', async () => {
      const { fixture } = await renderEfeitoForm({ dados: dadosMock });
      const comp = fixture.componentInstance;

      selecionarTipo(comp, 'DADO_UP');
      comp.dadoBasePreviewId.set(null);
      fixture.detectChanges();

      expect(comp.dadoResultantePreview()).toBeNull();
    });

    it('deve calcular dadoResultantePreview: d4 (idx=0) + nível 2 → d8 (idx=2)', async () => {
      const { fixture } = await renderEfeitoForm({ dados: dadosMock, nivelMaximo: 5 });
      const comp = fixture.componentInstance;

      selecionarTipo(comp, 'DADO_UP');
      comp.dadoBasePreviewId.set(10); // d4, idx=0
      comp.nivelPreview.set(2);
      fixture.detectChanges();

      const resultado = comp.dadoResultantePreview();
      expect(resultado).not.toBeNull();
      expect(resultado!.id).toBe(12);   // d8
      expect(resultado!.nome).toBe('d8');
    });

    it('deve retornar o último dado quando nível ultrapassa o máximo disponível', async () => {
      const { fixture } = await renderEfeitoForm({ dados: dadosMock, nivelMaximo: 10 });
      const comp = fixture.componentInstance;

      selecionarTipo(comp, 'DADO_UP');
      comp.dadoBasePreviewId.set(13); // d10, idx=3
      comp.nivelPreview.set(10);      // idx = min(3+10, 4) = 4 → d12
      fixture.detectChanges();

      const resultado = comp.dadoResultantePreview();
      expect(resultado).not.toBeNull();
      expect(resultado!.nome).toBe('d12'); // último da lista
    });

    it('deve retornar null para dadoResultantePreview quando dadosDisponiveis está vazio', async () => {
      const { fixture } = await renderEfeitoForm({ dados: [] });
      const comp = fixture.componentInstance;

      selecionarTipo(comp, 'DADO_UP');
      comp.dadoBasePreviewId.set(10);
      comp.nivelPreview.set(1);
      fixture.detectChanges();

      expect(comp.dadoResultantePreview()).toBeNull();
    });
  });
});
