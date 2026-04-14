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
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { ɵSIGNAL as SIGNAL_SYM } from '@angular/core';
import { vi } from 'vitest';

import { EfeitoFormComponent, CampoAlvoOption } from './efeito-form.component';
import { DadoUpPreviewComponent } from './dado-up-preview/dado-up-preview.component';
import { AtributoConfig } from '@core/models/atributo-config.model';
import { AptidaoConfig } from '@core/models/aptidao-config.model';
import { BonusConfig, DadoProspeccaoConfig, MembroCorpoConfig } from '@core/models/config.models';
import { TipoEfeito } from '@core/models/vantagem-efeito.model';

// ============================================================
// Stub para DadoUpPreviewComponent — evita NG0950 em testes JIT
// O componente real usa input.required() que lança NG0950 quando
// instanciado dentro de outro componente via JIT sem binding.
// ============================================================

@Component({
  selector: 'app-dado-up-preview',
  standalone: true,
  template: '<div data-testid="dado-up-preview-stub"></div>',
})
class DadoUpPreviewStubComponent {}

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
    configureTestBed: (tb) => {
      // Substitui DadoUpPreviewComponent por stub para evitar NG0950 (input.required() em JIT)
      tb.overrideComponent(EfeitoFormComponent, {
        remove: { imports: [DadoUpPreviewComponent] },
        add:    { imports: [DadoUpPreviewStubComponent] },
      });
    },
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

    it('deve ser false para FORMULA_CUSTOMIZADA sem campoAlvoFormula', async () => {
      const { fixture } = await renderEfeitoForm();
      const comp = fixture.componentInstance;

      selecionarTipo(comp, 'FORMULA_CUSTOMIZADA');
      comp.form.campoAlvoFormula   = null;
      comp.form.formulaCustomizada = 'nivel * 2';
      fixture.detectChanges();

      expect(comp.podeSubmeter()).toBe(false);
    });

    it('deve ser false para FORMULA_CUSTOMIZADA sem formulaCustomizada', async () => {
      const { fixture } = await renderEfeitoForm();
      const comp = fixture.componentInstance;

      selecionarTipo(comp, 'FORMULA_CUSTOMIZADA');
      comp.form.campoAlvoFormula   = { id: 1, nome: 'Força', tipo: 'atributo', sigla: 'FOR' };
      comp.form.formulaCustomizada = '';
      fixture.detectChanges();

      expect(comp.podeSubmeter()).toBe(false);
    });

    it('deve ser true para FORMULA_CUSTOMIZADA com campoAlvo e formula preenchidos', async () => {
      const { fixture } = await renderEfeitoForm();
      const comp = fixture.componentInstance;

      selecionarTipo(comp, 'FORMULA_CUSTOMIZADA');
      comp.form.campoAlvoFormula   = { id: 1, nome: 'Força', tipo: 'atributo', sigla: 'FOR' };
      comp.form.formulaCustomizada = 'nivel * 2 + FOR';
      fixture.detectChanges();

      expect(comp.podeSubmeter()).toBe(true);
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
  // 7. DADO_UP — integração com DadoUpPreviewComponent
  // ----------------------------------------------------------

  describe('DADO_UP — flags e delegação ao DadoUpPreviewComponent', () => {
    it('deve ativar isDadoUp quando tipo DADO_UP é selecionado', async () => {
      const { fixture } = await renderEfeitoForm({ dados: dadosMock });
      const comp = fixture.componentInstance;

      selecionarTipo(comp, 'DADO_UP');
      fixture.detectChanges();

      expect(comp.isDadoUp()).toBe(true);
    });

    it('deve ter dadosDisponiveis disponíveis para delegação ao DadoUpPreviewComponent', async () => {
      const { fixture } = await renderEfeitoForm({ dados: dadosMock });
      const comp = fixture.componentInstance;

      selecionarTipo(comp, 'DADO_UP');
      fixture.detectChanges();

      // Os dados são passados via input ao DadoUpPreviewComponent
      expect(comp.dadosDisponiveis().length).toBe(5);
    });

    it('não deve mostrar campos numéricos para DADO_UP', async () => {
      const { fixture } = await renderEfeitoForm({ dados: dadosMock });
      const comp = fixture.componentInstance;

      selecionarTipo(comp, 'DADO_UP');
      fixture.detectChanges();

      expect(comp.mostrarValorNumerico()).toBe(false);
      expect(comp.podeMostrarPreview()).toBe(false);
    });

    it('deve desativar isDadoUp ao trocar tipo para BONUS_VIDA', async () => {
      const { fixture } = await renderEfeitoForm({ dados: dadosMock });
      const comp = fixture.componentInstance;

      selecionarTipo(comp, 'DADO_UP');
      fixture.detectChanges();
      expect(comp.isDadoUp()).toBe(true);

      selecionarTipo(comp, 'BONUS_VIDA');
      fixture.detectChanges();
      expect(comp.isDadoUp()).toBe(false);
    });

    it('deve permitir salvar DADO_UP sem campos numéricos', async () => {
      const { fixture } = await renderEfeitoForm({ dados: dadosMock });
      const comp = fixture.componentInstance;

      selecionarTipo(comp, 'DADO_UP');
      fixture.detectChanges();

      expect(comp.podeSubmeter()).toBe(true);
    });
  });

  // ----------------------------------------------------------
  // 8. FORMULA_CUSTOMIZADA — sub-formulário de campo alvo
  // ----------------------------------------------------------

  describe('FORMULA_CUSTOMIZADA — sub-formulário', () => {

    // ---- camposAlvoFormula ----

    it('deve construir camposAlvoFormula combinando atributos e bônus', async () => {
      const { fixture } = await renderEfeitoForm({
        atributos: [atributoMock],
        bonus: [bonusMock],
      });
      const comp = fixture.componentInstance;

      const campos = comp.camposAlvoFormula();

      expect(campos.length).toBe(2);
      expect(campos[0]).toEqual<CampoAlvoOption>({
        id: 1, nome: 'Força', tipo: 'atributo', sigla: 'FOR',
      });
      expect(campos[1]).toEqual<CampoAlvoOption>({
        id: 3, nome: 'BBA', tipo: 'bonus', sigla: 'BBA',
      });
    });

    it('deve retornar camposAlvoFormula vazio quando não há atributos nem bônus', async () => {
      const { fixture } = await renderEfeitoForm({ atributos: [], bonus: [] });
      const comp = fixture.componentInstance;

      expect(comp.camposAlvoFormula()).toEqual([]);
    });

    it('deve listar apenas atributos quando bônus está vazio', async () => {
      const { fixture } = await renderEfeitoForm({ atributos: [atributoMock], bonus: [] });
      const comp = fixture.componentInstance;

      const campos = comp.camposAlvoFormula();
      expect(campos.length).toBe(1);
      expect(campos[0].tipo).toBe('atributo');
    });

    it('deve listar apenas bônus quando atributos está vazio', async () => {
      const { fixture } = await renderEfeitoForm({ atributos: [], bonus: [bonusMock] });
      const comp = fixture.componentInstance;

      const campos = comp.camposAlvoFormula();
      expect(campos.length).toBe(1);
      expect(campos[0].tipo).toBe('bonus');
    });

    // ---- siglasDisponiveis ----

    it('deve expor siglas dos atributos para o hint da fórmula', async () => {
      const atributo2: AtributoConfig = { ...atributoMock, id: 99, nome: 'Agilidade', abreviacao: 'AGI' };
      const { fixture } = await renderEfeitoForm({ atributos: [atributoMock, atributo2] });
      const comp = fixture.componentInstance;

      expect(comp.siglasDisponiveis()).toEqual(['FOR', 'AGI']);
    });

    // ---- mostrarFormula ----

    it('deve ativar mostrarFormula somente para FORMULA_CUSTOMIZADA', async () => {
      const { fixture } = await renderEfeitoForm();
      const comp = fixture.componentInstance;

      selecionarTipo(comp, 'FORMULA_CUSTOMIZADA');
      fixture.detectChanges();

      expect(comp.mostrarFormula()).toBe(true);
      expect(comp.mostrarValorNumerico()).toBe(false);
      expect(comp.mostrarAlvoAtributo()).toBe(false);
    });

    // ---- reset ao mudar tipo ----

    it('deve limpar campoAlvoFormula e formulaCustomizada ao mudar de tipo', async () => {
      const { fixture } = await renderEfeitoForm();
      const comp = fixture.componentInstance;

      selecionarTipo(comp, 'FORMULA_CUSTOMIZADA');
      comp.form.campoAlvoFormula   = { id: 1, nome: 'Força', tipo: 'atributo', sigla: 'FOR' };
      comp.form.formulaCustomizada = 'nivel * 2';
      fixture.detectChanges();

      selecionarTipo(comp, 'BONUS_VIDA');
      fixture.detectChanges();

      expect(comp.form.campoAlvoFormula).toBeNull();
      expect(comp.form.formulaCustomizada).toBe('');
    });

    it('deve resetar tentouSubmeter ao mudar de tipo', async () => {
      const { fixture } = await renderEfeitoForm();
      const comp = fixture.componentInstance;

      selecionarTipo(comp, 'FORMULA_CUSTOMIZADA');
      comp.salvar(); // dispara tentouSubmeter
      expect(comp.tentouSubmeter()).toBe(true);

      selecionarTipo(comp, 'BONUS_VIDA');
      fixture.detectChanges();

      expect(comp.tentouSubmeter()).toBe(false);
    });

    // ---- formulaInvalida ----

    it('formulaInvalida deve ser false antes de tentar submeter', async () => {
      const { fixture } = await renderEfeitoForm();
      const comp = fixture.componentInstance;

      selecionarTipo(comp, 'FORMULA_CUSTOMIZADA');
      comp.form.formulaCustomizada = '';
      fixture.detectChanges();

      expect(comp.formulaInvalida()).toBe(false);
    });

    it('formulaInvalida deve ser true após tentativa de submit com fórmula vazia', async () => {
      const { fixture } = await renderEfeitoForm();
      const comp = fixture.componentInstance;

      selecionarTipo(comp, 'FORMULA_CUSTOMIZADA');
      comp.form.campoAlvoFormula   = { id: 1, nome: 'Força', tipo: 'atributo', sigla: 'FOR' };
      comp.form.formulaCustomizada = '';
      fixture.detectChanges();

      comp.salvar();
      fixture.detectChanges();

      expect(comp.formulaInvalida()).toBe(true);
    });

    it('formulaInvalida deve ser false quando tipo não é FORMULA_CUSTOMIZADA', async () => {
      const { fixture } = await renderEfeitoForm();
      const comp = fixture.componentInstance;

      selecionarTipo(comp, 'BONUS_VIDA');
      comp.tentouSubmeter.set(true);
      fixture.detectChanges();

      expect(comp.formulaInvalida()).toBe(false);
    });

    // ---- emissão de DTO com campo atributo ----

    it('deve emitir DTO com atributoAlvoId ao salvar FORMULA_CUSTOMIZADA com alvo atributo', async () => {
      const { fixture } = await renderEfeitoForm({
        atributos: [atributoMock],
        bonus: [bonusMock],
      });
      const comp = fixture.componentInstance;

      const efeitoSalvoSpy = vi.fn();
      comp.efeitoSalvo.subscribe(efeitoSalvoSpy);

      selecionarTipo(comp, 'FORMULA_CUSTOMIZADA');
      comp.form.campoAlvoFormula   = { id: 1, nome: 'Força', tipo: 'atributo', sigla: 'FOR' };
      comp.form.formulaCustomizada = 'nivel * 2 + FOR';
      comp.form.descricaoEfeito    = 'Bônus por nível';
      fixture.detectChanges();

      comp.salvar();

      expect(efeitoSalvoSpy).toHaveBeenCalledTimes(1);
      const dto = efeitoSalvoSpy.mock.calls[0][0];
      expect(dto.tipoEfeito).toBe('FORMULA_CUSTOMIZADA');
      expect(dto.atributoAlvoId).toBe(1);
      expect(dto.bonusAlvoId).toBeUndefined();
      expect(dto.formula).toBe('nivel * 2 + FOR');
      expect(dto.descricaoEfeito).toBe('Bônus por nível');
    });

    // ---- emissão de DTO com campo bônus ----

    it('deve emitir DTO com bonusAlvoId ao salvar FORMULA_CUSTOMIZADA com alvo bônus', async () => {
      const { fixture } = await renderEfeitoForm({
        atributos: [atributoMock],
        bonus: [bonusMock],
      });
      const comp = fixture.componentInstance;

      const efeitoSalvoSpy = vi.fn();
      comp.efeitoSalvo.subscribe(efeitoSalvoSpy);

      selecionarTipo(comp, 'FORMULA_CUSTOMIZADA');
      comp.form.campoAlvoFormula   = { id: 3, nome: 'BBA', tipo: 'bonus', sigla: 'BBA' };
      comp.form.formulaCustomizada = 'base + nivel';
      fixture.detectChanges();

      comp.salvar();

      expect(efeitoSalvoSpy).toHaveBeenCalledTimes(1);
      const dto = efeitoSalvoSpy.mock.calls[0][0];
      expect(dto.tipoEfeito).toBe('FORMULA_CUSTOMIZADA');
      expect(dto.bonusAlvoId).toBe(3);
      expect(dto.atributoAlvoId).toBeUndefined();
      expect(dto.formula).toBe('base + nivel');
    });

    // ---- não emite quando inválido ----

    it('não deve emitir efeitoSalvo quando FORMULA_CUSTOMIZADA sem campoAlvo', async () => {
      const { fixture } = await renderEfeitoForm();
      const comp = fixture.componentInstance;

      const efeitoSalvoSpy = vi.fn();
      comp.efeitoSalvo.subscribe(efeitoSalvoSpy);

      selecionarTipo(comp, 'FORMULA_CUSTOMIZADA');
      comp.form.campoAlvoFormula   = null;
      comp.form.formulaCustomizada = 'nivel * 2';
      fixture.detectChanges();

      comp.salvar();

      expect(efeitoSalvoSpy).not.toHaveBeenCalled();
    });

    it('não deve emitir efeitoSalvo quando FORMULA_CUSTOMIZADA com fórmula vazia', async () => {
      const { fixture } = await renderEfeitoForm();
      const comp = fixture.componentInstance;

      const efeitoSalvoSpy = vi.fn();
      comp.efeitoSalvo.subscribe(efeitoSalvoSpy);

      selecionarTipo(comp, 'FORMULA_CUSTOMIZADA');
      comp.form.campoAlvoFormula   = { id: 1, nome: 'Força', tipo: 'atributo', sigla: 'FOR' };
      comp.form.formulaCustomizada = '   '; // só espaços
      fixture.detectChanges();

      comp.salvar();

      expect(efeitoSalvoSpy).not.toHaveBeenCalled();
    });

    // ---- fórmula com trim ----

    it('deve enviar fórmula com trim aplicado', async () => {
      const { fixture } = await renderEfeitoForm({ atributos: [atributoMock] });
      const comp = fixture.componentInstance;

      const efeitoSalvoSpy = vi.fn();
      comp.efeitoSalvo.subscribe(efeitoSalvoSpy);

      selecionarTipo(comp, 'FORMULA_CUSTOMIZADA');
      comp.form.campoAlvoFormula   = { id: 1, nome: 'Força', tipo: 'atributo', sigla: 'FOR' };
      comp.form.formulaCustomizada = '  total + 1  ';
      fixture.detectChanges();

      comp.salvar();

      const dto = efeitoSalvoSpy.mock.calls[0][0];
      expect(dto.formula).toBe('total + 1');
    });
  });
});
