/**
 * RaridadesItemConfigComponent — Spec
 *
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
import { ConfigApiService } from '@core/services/api/config-api.service';
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

function criarConfigApiMock(raridades: RaridadeItemConfig[] = [raridadeComumMock, raridadeRaroMock]) {
  return {
    listRaridadesItem:  vi.fn().mockReturnValue(of(raridades)),
    createRaridadeItem: vi.fn().mockReturnValue(of(raridadeComumMock)),
    updateRaridadeItem: vi.fn().mockReturnValue(of(raridadeComumMock)),
    deleteRaridadeItem: vi.fn().mockReturnValue(of(void 0)),
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

// Template stub mínimo
const TEMPLATE_STUB = `
  <div id="raridades-config-stub">
    @if (hasGame()) {
      <span id="jogo-ativo">{{ currentGameName() }}</span>
    }
    @if (!hasGame()) {
      <p id="sem-jogo">Nenhum jogo selecionado</p>
    }
    @for (r of raridades(); track r.id) {
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
  </div>
`;

async function renderRaridades(raridades: RaridadeItemConfig[] = [raridadeComumMock, raridadeRaroMock], temJogo = true) {
  const configApiMock          = criarConfigApiMock(raridades);
  const currentGameServiceMock = criarCurrentGameServiceMock(temJogo);
  const toastServiceMock       = criarToastServiceMock();

  const result = await render(RaridadesItemConfigComponent, {
    configureTestBed: (tb) => {
      tb.overrideTemplate(RaridadesItemConfigComponent, TEMPLATE_STUB);
    },
    providers: [
      { provide: ConfigApiService,  useValue: configApiMock },
      { provide: CurrentGameService, useValue: currentGameServiceMock },
      { provide: ToastService,       useValue: toastServiceMock },
      ConfirmationService,
    ],
  });

  const confirmationService = result.fixture.componentRef.injector.get(ConfirmationService);
  return { ...result, configApiMock, toastServiceMock, confirmationService };
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
      const { configApiMock } = await renderRaridades();

      expect(configApiMock.listRaridadesItem).toHaveBeenCalledWith(10);
    });

    it('deve exibir raridades carregadas', async () => {
      await renderRaridades();

      expect(screen.getByText('Comum')).toBeTruthy();
      expect(screen.getByText('Raro')).toBeTruthy();
    });

    it('não deve carregar quando não há jogo selecionado', async () => {
      const { configApiMock } = await renderRaridades([], false);

      expect(configApiMock.listRaridadesItem).not.toHaveBeenCalled();
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
    it('raridades deve ter 2 itens após carregamento', async () => {
      const { fixture } = await renderRaridades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      expect(comp.raridades().length).toBe(2);
    });

    it('loading deve ser false após carregar', async () => {
      const { fixture } = await renderRaridades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      expect(comp.loading()).toBe(false);
    });

    it('dialogVisible deve inicializar como false', async () => {
      const { fixture } = await renderRaridades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      expect(comp.dialogVisible()).toBe(false);
    });
  });

  // ----------------------------------------------------------
  // 3. Color picker — corPreview e corTextoContraste
  // ----------------------------------------------------------

  describe('color picker', () => {
    it('corPreview deve retornar fallback para cor inválida no formulário', async () => {
      const { fixture } = await renderRaridades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      // Sem abrir dialog, form tem cor padrão '#9d9d9d'
      // corPreview lê this.form?.get('cor')?.value que é uma leitura direta (não reativa via signal)
      // O fallback (#9d9d9d) é retornado quando a cor não é hex válida ou é o default
      comp.openDialog();
      comp.form.patchValue({ cor: 'invalido' });
      fixture.detectChanges();

      // Cor inválida -> retorna fallback #9d9d9d
      expect(comp.corPreview()).toBe('#9d9d9d');
    });

    it('corTextoContraste deve ser definido após abrir dialog', async () => {
      const { fixture } = await renderRaridades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDialog();
      fixture.detectChanges();

      // Deve retornar string '#000000' ou '#ffffff'
      const contraste = comp.corTextoContraste();
      expect(contraste === '#000000' || contraste === '#ffffff').toBe(true);
    });

    it('onColorPickerChange deve atualizar o campo cor do formulário', async () => {
      const { fixture } = await renderRaridades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDialog();

      const fakeEvent = { target: { value: '#ff0000' } } as unknown as Event;
      comp.onColorPickerChange(fakeEvent);
      fixture.detectChanges();

      expect(comp.form.get('cor')?.value).toBe('#FF0000');
    });

    it('corTextoContraste deve retornar preto para cor branca (#FFFFFF)', async () => {
      const { fixture } = await renderRaridades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDialog();
      // Simular cor clara via onColorPickerChange
      comp.onColorPickerChange({ target: { value: '#ffffff' } } as unknown as Event);
      fixture.detectChanges();

      expect(comp.corTextoContraste()).toBe('#000000');
    });
  });

  // ----------------------------------------------------------
  // 4. openDialog e editMode
  // ----------------------------------------------------------

  describe('openDialog', () => {
    it('deve abrir dialog em modo criação', async () => {
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
  });

  // ----------------------------------------------------------
  // 5. save
  // ----------------------------------------------------------

  describe('save', () => {
    it('deve chamar createRaridadeItem ao salvar nova raridade', async () => {
      const { fixture, configApiMock } = await renderRaridades();
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

      expect(configApiMock.createRaridadeItem).toHaveBeenCalledWith(
        expect.objectContaining({ nome: 'Incomum', cor: '#1eff00', jogoId: 10 })
      );
    });

    it('deve chamar updateRaridadeItem ao salvar raridade existente', async () => {
      const { fixture, configApiMock } = await renderRaridades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDialog(raridadeComumMock);
      comp.form.patchValue({ nome: 'Comum+' });
      comp.save();

      expect(configApiMock.updateRaridadeItem).toHaveBeenCalledWith(
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
  });

  // ----------------------------------------------------------
  // 6. Exclusão
  // ----------------------------------------------------------

  describe('exclusão', () => {
    it('deve chamar deleteRaridadeItem ao confirmar exclusão', async () => {
      const { fixture, configApiMock, confirmationService } = await renderRaridades();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      vi.spyOn(confirmationService, 'confirm').mockImplementation(({ accept }: { accept?: () => void }) => {
        accept?.();
      });

      comp.confirmDelete(1);

      expect(configApiMock.deleteRaridadeItem).toHaveBeenCalledWith(1);
    });
  });
});
