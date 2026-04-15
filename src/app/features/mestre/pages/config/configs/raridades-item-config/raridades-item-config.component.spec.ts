/**
 * RaridadesItemConfigComponent — Spec
 *
 * Migrado para BaseConfigComponent + RaridadeItemConfigService.
 * NOTA JIT: Usa overrideTemplate para evitar NG0950 em modo JIT no Vitest.
 * Foco: sinais, CRUD, color picker preview, toggle podeJogadorAdicionar.
 */
import { TestBed } from '@angular/core/testing';
import { render, screen } from '@testing-library/angular';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { ConfirmationService } from 'primeng/api';

import { RaridadesItemConfigComponent } from './raridades-item-config.component';
import { RaridadeItemConfigService } from '@core/services/business/config/raridade-item-config.service';
import { CurrentGameService } from '@core/services/current-game.service';
import { ToastService } from '@services/toast.service';
import { RaridadeItemConfig } from '@core/models/raridade-item-config.model';

// ============================================================
// Dados de teste
// ============================================================

const raridadeComumMock: RaridadeItemConfig = {
  id: 1,
  jogoId: 10,
  nome: 'Comum',
  cor: '#9d9d9d',
  ordemExibicao: 1,
  podeJogadorAdicionar: true,
  bonusAtributoMin: null,
  bonusAtributoMax: null,
  bonusDerivadoMin: null,
  bonusDerivadoMax: null,
  descricao: null,
  dataCriacao: '2024-01-01',
  dataUltimaAtualizacao: '2024-01-01',
};

const raridadeRaroMock: RaridadeItemConfig = {
  id: 2,
  jogoId: 10,
  nome: 'Raro',
  cor: '#0070dd',
  ordemExibicao: 2,
  podeJogadorAdicionar: false,
  bonusAtributoMin: 1,
  bonusAtributoMax: 3,
  bonusDerivadoMin: null,
  bonusDerivadoMax: null,
  descricao: 'Itens raros com propriedades mágicas',
  dataCriacao: '2024-01-01',
  dataUltimaAtualizacao: '2024-01-01',
};

// ============================================================
// Helpers de mock
// ============================================================

function criarRaridadeServiceMock(
  raridades: RaridadeItemConfig[] = [raridadeComumMock, raridadeRaroMock],
  temJogo = true,
) {
  const jogoAtual = temJogo ? { id: 10, nome: 'Campanha Teste', ativo: true } : null;
  return {
    loadItems:    vi.fn().mockReturnValue(of(raridades)),
    createItem:   vi.fn().mockReturnValue(of(raridadeComumMock)),
    updateItem:   vi.fn().mockReturnValue(of(raridadeComumMock)),
    deleteItem:   vi.fn().mockReturnValue(of(void 0)),
    currentGameId:  () => (temJogo ? 10 : null),
    hasCurrentGame: () => temJogo,
    currentGame:    () => jogoAtual,
  };
}

function criarCurrentGameServiceMock(temJogo = true) {
  const jogoAtual = temJogo ? { id: 10, nome: 'Campanha Teste', ativo: true } : null;
  return {
    currentGameId:  () => (temJogo ? 10 : null),
    hasCurrentGame: () => temJogo,
    currentGame:    () => jogoAtual,
    availableGames: signal([]).asReadonly(),
    selectGame:     vi.fn(),
    clearGame:      vi.fn(),
  };
}

function criarToastServiceMock() {
  return {
    success: vi.fn(),
    error:   vi.fn(),
    warning: vi.fn(),
    info:    vi.fn(),
    clear:   vi.fn(),
  };
}

// Template stub mínimo — evita NG0950
const TEMPLATE_STUB = `
  <div id="raridades-config-stub">
    @if (hasGame()) {
      <span id="jogo-ativo">{{ currentGameName() }}</span>
    }
    @if (!hasGame()) {
      <p id="sem-jogo">Nenhum jogo selecionado</p>
    }
    @for (r of items(); track r.id) {
      <span class="raridade-nome">{{ r.nome }}</span>
      <span class="raridade-cor">{{ r.cor }}</span>
    }
    @if (dialogVisible()) {
      <div id="dialog-visible">Dialog aberto</div>
    }
    @if (editMode()) {
      <div id="edit-mode">Modo edição</div>
    }
    <span id="cor-preview">{{ corPreview() }}</span>
    <span id="cor-picker-value">{{ corPickerValue() }}</span>
  </div>
`;

async function renderRaridades(
  raridades: RaridadeItemConfig[] = [raridadeComumMock, raridadeRaroMock],
  temJogo = true,
) {
  const raridadeServiceMock    = criarRaridadeServiceMock(raridades, temJogo);
  const currentGameServiceMock = criarCurrentGameServiceMock(temJogo);
  const toastServiceMock       = criarToastServiceMock();

  const result = await render(RaridadesItemConfigComponent, {
    configureTestBed: (tb) => {
      tb.overrideTemplate(RaridadesItemConfigComponent, TEMPLATE_STUB);
    },
    providers: [
      { provide: RaridadeItemConfigService, useValue: raridadeServiceMock },
      { provide: CurrentGameService,        useValue: currentGameServiceMock },
      { provide: ToastService,              useValue: toastServiceMock },
      ConfirmationService,
    ],
  });

  const confirmationService = result.fixture.componentRef.injector.get(ConfirmationService);
  return { ...result, raridadeServiceMock, toastServiceMock, confirmationService };
}

// ============================================================
// Testes
// ============================================================

describe('RaridadesItemConfigComponent', () => {

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  // ----------------------------------------------------------
  // 1. Carregamento de dados
  // ----------------------------------------------------------

  describe('carregamento de dados', () => {
    it('deve carregar raridades ao inicializar quando há jogo selecionado', async () => {
      const { raridadeServiceMock } = await renderRaridades();

      expect(raridadeServiceMock.loadItems).toHaveBeenCalled();
    });

    it('deve exibir raridades carregadas', async () => {
      await renderRaridades();

      expect(screen.getByText('Comum')).toBeTruthy();
      expect(screen.getByText('Raro')).toBeTruthy();
    });

    it('não deve carregar quando não há jogo selecionado', async () => {
      const { raridadeServiceMock } = await renderRaridades([], false);

      expect(raridadeServiceMock.loadItems).not.toHaveBeenCalled();
    });

    it('deve exibir aviso de sem jogo quando hasGame é false', async () => {
      await renderRaridades([], false);

      expect(screen.getByText('Nenhum jogo selecionado')).toBeTruthy();
    });
  });

  // ----------------------------------------------------------
  // 2. Sinais de estado
  // ----------------------------------------------------------

  describe('sinais de estado', () => {
    it('items deve ter 2 raridades após carregamento', async () => {
      const { fixture } = await renderRaridades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      expect(comp.items().length).toBe(2);
    });

    it('loadingTable deve ser false após carregar', async () => {
      const { fixture } = await renderRaridades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      expect(comp.loadingTable()).toBe(false);
    });

    it('dialogVisible deve inicializar como false', async () => {
      const { fixture } = await renderRaridades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      expect(comp.dialogVisible()).toBe(false);
    });

    it('editMode deve inicializar como false', async () => {
      const { fixture } = await renderRaridades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      expect(comp.editMode()).toBe(false);
    });
  });

  // ----------------------------------------------------------
  // 3. Color picker — corPreview, corPickerValue e corTextoContraste
  // ----------------------------------------------------------

  describe('color picker — PrimeNG p-colorpicker', () => {
    it('corPreview deve retornar fallback para cor inválida', async () => {
      const { fixture } = await renderRaridades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDialog();
      comp.corFormValue.set('invalido');
      fixture.detectChanges();

      expect(comp.corPreview()).toBe('#9d9d9d');
    });

    it('corTextoContraste deve ser definido após abrir dialog', async () => {
      const { fixture } = await renderRaridades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDialog();
      fixture.detectChanges();

      const contraste = comp.corTextoContraste();
      expect(contraste === '#000000' || contraste === '#ffffff').toBe(true);
    });

    it('onColorPickerNgModelChange deve atualizar o campo cor com prefixo #', async () => {
      const { fixture } = await renderRaridades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDialog();
      comp.onColorPickerNgModelChange('ff0000');
      fixture.detectChanges();

      expect(comp.form.get('cor')?.value).toBe('#FF0000');
    });

    it('onColorPickerNgModelChange deve atualizar corFormValue reativamente', async () => {
      const { fixture } = await renderRaridades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDialog();
      comp.onColorPickerNgModelChange('ff0000');
      fixture.detectChanges();

      expect(comp.corPreview()).toBe('#FF0000');
    });

    it('corPickerValue deve retornar a cor sem # para o p-colorpicker', async () => {
      const { fixture } = await renderRaridades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDialog();
      comp.corFormValue.set('#0070DD');
      fixture.detectChanges();

      expect(comp.corPickerValue()).toBe('0070DD');
    });

    it('corTextoContraste deve retornar preto para cor clara', async () => {
      const { fixture } = await renderRaridades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDialog();
      comp.onColorPickerNgModelChange('ffffff');
      fixture.detectChanges();

      expect(comp.corTextoContraste()).toBe('#000000');
    });

    it('corTextoContraste deve retornar branco para cor escura', async () => {
      const { fixture } = await renderRaridades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDialog();
      comp.onColorPickerNgModelChange('000000');
      fixture.detectChanges();

      expect(comp.corTextoContraste()).toBe('#ffffff');
    });

    it('openDialog em modo edição deve sincronizar corFormValue com a cor do item', async () => {
      const { fixture } = await renderRaridades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDialog(raridadeRaroMock);
      fixture.detectChanges();

      expect(comp.corFormValue()).toBe('#0070dd');
      expect(comp.corPickerValue()).toBe('0070dd');
    });

    it('openDialog em modo criação deve inicializar corFormValue com fallback', async () => {
      const { fixture } = await renderRaridades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDialog();
      fixture.detectChanges();

      expect(comp.corFormValue()).toBe('#9d9d9d');
    });

    it('onColorPickerNgModelChange não deve falhar com valor vazio', async () => {
      const { fixture } = await renderRaridades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDialog();
      expect(() => comp.onColorPickerNgModelChange('')).not.toThrow();
    });
  });

  // ----------------------------------------------------------
  // 4. openDialog e editMode
  // ----------------------------------------------------------

  describe('openDialog', () => {
    it('deve abrir dialog em modo criação quando chamado sem argumento', async () => {
      const { fixture } = await renderRaridades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDialog();
      fixture.detectChanges();

      expect(comp.dialogVisible()).toBe(true);
      expect(comp.editMode()).toBe(false);
    });

    it('deve abrir dialog em modo edição com dados da raridade', async () => {
      const { fixture } = await renderRaridades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDialog(raridadeRaroMock);
      fixture.detectChanges();

      expect(comp.editMode()).toBe(true);
      expect(comp.currentEditId()).toBe(2);
      expect(comp.form.get('nome')?.value).toBe('Raro');
      expect(comp.form.get('cor')?.value).toBe('#0070dd');
      expect(comp.form.get('podeJogadorAdicionar')?.value).toBe(false);
    });

    it('deve fechar dialog ao chamar closeDialog', async () => {
      const { fixture } = await renderRaridades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDialog();
      comp.closeDialog();
      fixture.detectChanges();

      expect(comp.dialogVisible()).toBe(false);
    });
  });

  // ----------------------------------------------------------
  // 5. save — criação e edição
  // ----------------------------------------------------------

  describe('save', () => {
    it('deve chamar service.createItem ao salvar nova raridade', async () => {
      const { fixture, raridadeServiceMock } = await renderRaridades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDialog();
      comp.form.patchValue({
        nome: 'Incomum',
        cor: '#1eff00',
        ordemExibicao: 3,
        podeJogadorAdicionar: false,
      });
      comp.save();

      expect(raridadeServiceMock.createItem).toHaveBeenCalledWith(
        expect.objectContaining({ nome: 'Incomum', cor: '#1eff00' })
      );
    });

    it('deve chamar service.updateItem ao salvar raridade existente', async () => {
      const { fixture, raridadeServiceMock } = await renderRaridades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDialog(raridadeComumMock);
      comp.form.patchValue({ nome: 'Comum+' });
      comp.save();

      expect(raridadeServiceMock.updateItem).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ nome: 'Comum+' })
      );
    });

    it('deve exibir warning ao salvar formulário inválido', async () => {
      const { fixture, toastServiceMock } = await renderRaridades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDialog();
      comp.form.patchValue({ nome: '' });
      comp.save();

      expect(toastServiceMock.warning).toHaveBeenCalled();
    });

    it('deve exibir toast de sucesso após criar raridade', async () => {
      const { fixture, toastServiceMock } = await renderRaridades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDialog();
      comp.form.patchValue({ nome: 'Épico', cor: '#a335ee', ordemExibicao: 4 });
      comp.save();

      expect(toastServiceMock.success).toHaveBeenCalledWith(
        expect.stringContaining('criada'),
        'Sucesso'
      );
    });
  });

  // ----------------------------------------------------------
  // 6. Exclusão
  // ----------------------------------------------------------

  describe('exclusão', () => {
    it('deve chamar service.deleteItem ao confirmar exclusão', async () => {
      const { fixture, raridadeServiceMock, confirmationService } = await renderRaridades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      vi.spyOn(confirmationService, 'confirm').mockImplementation(({ accept }: { accept?: () => void }) => {
        accept?.();
      });

      comp.confirmDelete(1);

      expect(raridadeServiceMock.deleteItem).toHaveBeenCalledWith(1);
    });

    it('deve recarregar lista após exclusão', async () => {
      const { fixture, raridadeServiceMock, confirmationService } = await renderRaridades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;
      const callCountBefore = raridadeServiceMock.loadItems.mock.calls.length;

      vi.spyOn(confirmationService, 'confirm').mockImplementation(({ accept }: { accept?: () => void }) => {
        accept?.();
      });

      comp.confirmDelete(1);

      expect(raridadeServiceMock.loadItems.mock.calls.length).toBeGreaterThan(callCountBefore);
    });
  });
});
