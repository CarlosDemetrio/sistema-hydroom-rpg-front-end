/**
 * VantagensConfigComponent — Spec (Spec 023)
 *
 * Foco: aba de pré-requisitos polimórficos.
 * Cobre: chips de exibição por tipo, hint OR/AND, campos condicionais por tipo,
 * CTA no estado vazio, submissão de cada tipo, badge INSÓLITUS na listagem.
 *
 * Padrão JIT: overrideTemplate + Subject para Observables.
 */

import { TestBed } from '@angular/core/testing';
import { render, screen } from '@testing-library/angular';
import { signal } from '@angular/core';
import { Subject, of } from 'rxjs';
import { vi } from 'vitest';
import { ConfirmationService } from 'primeng/api';

import { VantagensConfigComponent } from './vantagens-config.component';
import { ConfigApiService } from '@core/services/api/config-api.service';
import { CurrentGameService } from '@core/services/current-game.service';
import { ToastService } from '@services/toast.service';
import {
  VantagemConfig,
  VantagemPreRequisito,
  AddPreRequisitoDto,
} from '@core/models/vantagem-config.model';
import { AtributoConfig } from '@core/models/atributo-config.model';
import { AptidaoConfig } from '@core/models/aptidao-config.model';
import { ClassePersonagem, Raca } from '@core/models/config.models';

// ============================================================
// Dados de teste
// ============================================================

const atributoForcaMock: AtributoConfig = {
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
  dataUltimaAtualizacao: '2024-01-01T00:00:00',
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
  dataUltimaAtualizacao: '2024-01-01T00:00:00',
};

const racaElfoMock: Raca = {
  id: 3,
  jogoId: 10,
  nome: 'Elfo',
  descricao: null,
  ordemExibicao: 1,
  bonusAtributos: [],
  classesPermitidas: [],
  dataCriacao: '2024-01-01T00:00:00',
  dataUltimaAtualizacao: '2024-01-01T00:00:00',
};

const classeMagoMock: ClassePersonagem = {
  id: 4,
  jogoId: 10,
  nome: 'Mago',
  descricao: null,
  ordemExibicao: 1,
  bonusConfig: [],
  aptidaoBonus: [],
  pontosConfig: [],
  vantagensPreDefinidas: [],
  dataCriacao: '2024-01-01T00:00:00',
  dataUltimaAtualizacao: '2024-01-01T00:00:00',
};

const vantagemTCOMock: VantagemConfig = {
  id: 10,
  jogoId: 10,
  nome: 'Treinamento em Combate Ofensivo',
  sigla: 'TCO',
  descricao: null,
  categoriaVantagemId: 1,
  categoriaNome: 'Combate',
  nivelMaximo: 3,
  formulaCusto: 'nivel * 2',
  descricaoEfeito: '+1 BBA',
  ordemExibicao: 1,
  tipoVantagem: 'VANTAGEM',
  preRequisitos: [],
  efeitos: [],
  dataCriacao: '2024-01-01T00:00:00',
  dataUltimaAtualizacao: '2024-01-01T00:00:00',
};

const vantagemInsolitusMock: VantagemConfig = {
  id: 11,
  jogoId: 10,
  nome: 'Chama Sagrada',
  sigla: null,
  descricao: null,
  categoriaVantagemId: 1,
  categoriaNome: 'Divino',
  nivelMaximo: 1,
  formulaCusto: null,
  descricaoEfeito: null,
  ordemExibicao: 2,
  tipoVantagem: 'INSOLITUS',
  preRequisitos: [],
  efeitos: [],
  dataCriacao: '2024-01-01T00:00:00',
  dataUltimaAtualizacao: '2024-01-01T00:00:00',
};

// Pré-requisitos de cada tipo
const prVantagem: VantagemPreRequisito = {
  id: 1, vantagemId: 10, tipo: 'VANTAGEM',
  preRequisitoId: 11, preRequisitoNome: 'Chama Sagrada', nivelMinimo: 2,
};

const prRaca: VantagemPreRequisito = {
  id: 2, vantagemId: 10, tipo: 'RACA',
  racaId: 3, racaNome: 'Elfo',
};

const prClasse: VantagemPreRequisito = {
  id: 3, vantagemId: 10, tipo: 'CLASSE',
  classeId: 4, classeNome: 'Mago',
};

const prAtributo: VantagemPreRequisito = {
  id: 4, vantagemId: 10, tipo: 'ATRIBUTO',
  atributoId: 1, atributoNome: 'Força', atributoAbreviacao: 'FOR', valorMinimo: 14,
};

const prNivel: VantagemPreRequisito = {
  id: 5, vantagemId: 10, tipo: 'NIVEL',
  valorMinimo: 5,
};

const prAptidao: VantagemPreRequisito = {
  id: 6, vantagemId: 10, tipo: 'APTIDAO',
  aptidaoId: 2, aptidaoNome: 'Atletismo', valorMinimo: 3,
};

// ============================================================
// Template stub para testes de lógica de componente
// (Evita NG0950 em modo JIT para componentes filhos com input.required())
// ============================================================

const TEMPLATE_STUB = `
  <div id="vantagens-config-stub">
    <!-- Indicador de jogo -->
    @if (hasGame()) {
      <span id="jogo-ativo">{{ currentGameName() }}</span>
    } @else {
      <span id="sem-jogo">Nenhum jogo selecionado</span>
    }

    <!-- Itens da lista principal -->
    @for (v of filteredItems(); track v.id) {
      <span class="vantagem-nome">{{ v.nome }}</span>
    }

    <!-- Dialog visível -->
    @if (drawerVisible()) {
      <div id="drawer-aberto">Dialog</div>

      <!-- Aba pré-requisitos -->
      <div id="aba-prerequisitos">

        <!-- Hint OR/AND -->
        <div data-testid="hint-or-and">
          Pré-requisitos do <strong>mesmo tipo</strong> são alternativos (OU).
        </div>

        <!-- Lista de pré-requisitos -->
        @if (selectedVantagem()?.preRequisitos?.length) {
          <div data-testid="lista-prerequisitos">
            @for (pr of selectedVantagem()!.preRequisitos; track pr.id) {
              <span class="chip-label">{{ labelPreRequisito(pr) }}</span>
              <button
                class="btn-remover-pr"
                [attr.data-pr-id]="pr.id"
                (click)="removePreRequisito(pr.id)"
              >Remover</button>
            }
          </div>
        } @else {
          <div data-testid="estado-vazio-prerequisitos">
            <button
              data-testid="btn-adicionar-primeiro-prerequisito"
              (click)="mostrarFormAdicionarPreRequisito.set(true)"
            >Adicionar primeiro pré-requisito</button>
          </div>
        }

        <!-- Formulário de adição -->
        @if (mostrarFormAdicionarPreRequisito()) {
          <div data-testid="form-adicionar-prerequisito">
            <select
              data-testid="select-tipo-prerequisito"
              (change)="onTipoPreRequisitoChange()"
            ></select>

            @if (novoPreRequisitoTipo() === 'VANTAGEM') {
              <div data-testid="campos-tipo-VANTAGEM">
                @for (v of vantagensDisponiveis(); track v.id) {
                  @if (v.tipoVantagem === 'INSOLITUS') {
                    <span class="badge-insolitus" [attr.data-vid]="v.id">INSÓLITUS</span>
                  }
                  <span class="opcao-vantagem" [attr.data-vid]="v.id">{{ v.nome }}</span>
                }
              </div>
            }
            @if (novoPreRequisitoTipo() === 'RACA') {
              <div data-testid="campos-tipo-RACA"></div>
            }
            @if (novoPreRequisitoTipo() === 'CLASSE') {
              <div data-testid="campos-tipo-CLASSE"></div>
            }
            @if (novoPreRequisitoTipo() === 'ATRIBUTO') {
              <div data-testid="campos-tipo-ATRIBUTO"></div>
            }
            @if (novoPreRequisitoTipo() === 'NIVEL') {
              <div data-testid="campos-tipo-NIVEL"></div>
            }
            @if (novoPreRequisitoTipo() === 'APTIDAO') {
              <div data-testid="campos-tipo-APTIDAO"></div>
            }

            <button
              data-testid="btn-confirmar-adicionar-prerequisito"
              [disabled]="!preRequisitoFormValido()"
              (click)="addPreRequisito()"
            >Adicionar</button>
          </div>
        }

        @if (!mostrarFormAdicionarPreRequisito() && selectedVantagem()?.preRequisitos?.length) {
          <button
            data-testid="btn-adicionar-prerequisito"
            (click)="mostrarFormAdicionarPreRequisito.set(true)"
          >Adicionar pré-requisito</button>
        }
      </div>

      <!-- Abas -->
      @if (editMode()) {
        <span id="edit-mode">edit</span>
      }
    }
  </div>
`;

// ============================================================
// Helpers de mock
// ============================================================

function criarConfigApiMock(opts: {
  vantagens?: VantagemConfig[];
  vantagemDetalhada?: VantagemConfig;
  addPreRequisitoSubject?: Subject<VantagemPreRequisito>;
} = {}) {
  const vantagens = opts.vantagens ?? [vantagemTCOMock, vantagemInsolitusMock];
  const addSubj   = opts.addPreRequisitoSubject ?? new Subject<VantagemPreRequisito>();

  return {
    listVantagens:            vi.fn().mockReturnValue(of(vantagens)),
    getVantagem:              vi.fn().mockReturnValue(of(opts.vantagemDetalhada ?? vantagemTCOMock)),
    addVantagemPreRequisito:  vi.fn().mockReturnValue(addSubj.asObservable()),
    removeVantagemPreRequisito: vi.fn().mockReturnValue(of(undefined)),
    listCategoriasVantagem:   vi.fn().mockReturnValue(of([])),
    listAtributos:            vi.fn().mockReturnValue(of([atributoForcaMock])),
    listAptidoes:             vi.fn().mockReturnValue(of([aptidaoMock])),
    listBonus:                vi.fn().mockReturnValue(of([])),
    listMembrosCorpo:         vi.fn().mockReturnValue(of([])),
    listDadosProspeccao:      vi.fn().mockReturnValue(of([])),
    listRacas:                vi.fn().mockReturnValue(of([racaElfoMock])),
    listClasses:              vi.fn().mockReturnValue(of([classeMagoMock])),
    listVantagemEfeitos:      vi.fn().mockReturnValue(of([])),
    reordenarVantagens:       vi.fn().mockReturnValue(of(undefined)),
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

// ============================================================
// Helper de render
// ============================================================

async function renderVantagens(opts: {
  vantagens?: VantagemConfig[];
  vantagemDetalhada?: VantagemConfig;
  addPreRequisitoSubject?: Subject<VantagemPreRequisito>;
  temJogo?: boolean;
} = {}) {
  const configApiMock          = criarConfigApiMock(opts);
  const currentGameServiceMock = criarCurrentGameServiceMock(opts.temJogo ?? true);
  const toastServiceMock       = criarToastServiceMock();

  const result = await render(VantagensConfigComponent, {
    configureTestBed: (tb) => {
      tb.overrideTemplate(VantagensConfigComponent, TEMPLATE_STUB);
      tb.overrideProvider(ConfirmationService, { useValue: { confirm: vi.fn() } });
    },
    providers: [
      { provide: ConfigApiService,   useValue: configApiMock },
      { provide: CurrentGameService, useValue: currentGameServiceMock },
      { provide: ToastService,       useValue: toastServiceMock },
    ],
  });

  return { ...result, configApiMock, toastServiceMock };
}

// ============================================================
// Testes
// ============================================================

describe('VantagensConfigComponent — aba pré-requisitos', () => {

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  // ----------------------------------------------------------
  // 1. labelPreRequisito — labels legíveis por tipo
  // ----------------------------------------------------------

  describe('labelPreRequisito()', () => {
    let comp: VantagensConfigComponent;

    beforeEach(async () => {
      const { fixture } = await renderVantagens();
      comp = fixture.componentInstance;
    });

    it('deve retornar label correto para tipo VANTAGEM', () => {
      expect(comp.labelPreRequisito(prVantagem)).toBe('Vantagem: Chama Sagrada (nível 2)');
    });

    it('deve retornar label correto para tipo RACA', () => {
      expect(comp.labelPreRequisito(prRaca)).toBe('Raça: Elfo');
    });

    it('deve retornar label correto para tipo CLASSE', () => {
      expect(comp.labelPreRequisito(prClasse)).toBe('Classe: Mago');
    });

    it('deve retornar label correto para tipo ATRIBUTO usando abreviação', () => {
      expect(comp.labelPreRequisito(prAtributo)).toBe('FOR \u2265 14');
    });

    it('deve retornar label correto para tipo NIVEL', () => {
      expect(comp.labelPreRequisito(prNivel)).toBe('Nível \u2265 5');
    });

    it('deve retornar label correto para tipo APTIDAO', () => {
      expect(comp.labelPreRequisito(prAptidao)).toBe('Aptidão: Atletismo \u2265 3');
    });

    it('deve usar atributoNome quando abreviacao não está disponível', () => {
      const pr: VantagemPreRequisito = {
        id: 99, vantagemId: 10, tipo: 'ATRIBUTO',
        atributoId: 1, atributoNome: 'Força', valorMinimo: 10,
      };
      expect(comp.labelPreRequisito(pr)).toBe('Força \u2265 10');
    });
  });

  // ----------------------------------------------------------
  // 2. Hint de lógica OR/AND — sempre visível na aba
  // ----------------------------------------------------------

  describe('hint OR/AND', () => {
    it('deve exibir hint de lógica OR/AND quando o drawer está aberto', async () => {
      const { fixture } = await renderVantagens({
        vantagemDetalhada: { ...vantagemTCOMock, preRequisitos: [prVantagem] },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDrawer(vantagemTCOMock);
      fixture.detectChanges();

      expect(screen.getByTestId('hint-or-and')).toBeTruthy();
    });
  });

  // ----------------------------------------------------------
  // 3. Estado vazio — exibir CTA
  // ----------------------------------------------------------

  describe('estado vazio', () => {
    it('deve exibir estado vazio quando não há pré-requisitos', async () => {
      const { fixture } = await renderVantagens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDrawer({ ...vantagemTCOMock, preRequisitos: [] });
      fixture.detectChanges();

      expect(screen.getByTestId('estado-vazio-prerequisitos')).toBeTruthy();
    });

    it('deve exibir botão CTA no estado vazio', async () => {
      const { fixture } = await renderVantagens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDrawer({ ...vantagemTCOMock, preRequisitos: [] });
      fixture.detectChanges();

      expect(screen.getByTestId('btn-adicionar-primeiro-prerequisito')).toBeTruthy();
    });

    it('CTA no estado vazio deve abrir formulário de adição ao clicar', async () => {
      const { fixture } = await renderVantagens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDrawer({ ...vantagemTCOMock, preRequisitos: [] });
      fixture.detectChanges();

      const btn = screen.getByTestId('btn-adicionar-primeiro-prerequisito');
      btn.click();
      fixture.detectChanges();

      expect(screen.getByTestId('form-adicionar-prerequisito')).toBeTruthy();
    });
  });

  // ----------------------------------------------------------
  // 4. Lista de chips de pré-requisitos
  // ----------------------------------------------------------

  describe('lista de chips de pré-requisitos', () => {
    it('deve exibir chip com label para tipo VANTAGEM', async () => {
      const { fixture } = await renderVantagens({
        vantagemDetalhada: { ...vantagemTCOMock, preRequisitos: [prVantagem] },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.selectedVantagem.set({ ...vantagemTCOMock, preRequisitos: [prVantagem] });
      comp.drawerVisible.set(true);
      fixture.detectChanges();

      expect(screen.getByText('Vantagem: Chama Sagrada (nível 2)')).toBeTruthy();
    });

    it('deve exibir chip com label para tipo RACA', async () => {
      const { fixture } = await renderVantagens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.selectedVantagem.set({ ...vantagemTCOMock, preRequisitos: [prRaca] });
      comp.drawerVisible.set(true);
      fixture.detectChanges();

      expect(screen.getByText('Raça: Elfo')).toBeTruthy();
    });

    it('deve exibir chip com label para tipo ATRIBUTO com abreviação', async () => {
      const { fixture } = await renderVantagens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.selectedVantagem.set({ ...vantagemTCOMock, preRequisitos: [prAtributo] });
      comp.drawerVisible.set(true);
      fixture.detectChanges();

      expect(screen.getByText('FOR \u2265 14')).toBeTruthy();
    });

    it('deve exibir chip com label para tipo NIVEL', async () => {
      const { fixture } = await renderVantagens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.selectedVantagem.set({ ...vantagemTCOMock, preRequisitos: [prNivel] });
      comp.drawerVisible.set(true);
      fixture.detectChanges();

      expect(screen.getByText('Nível \u2265 5')).toBeTruthy();
    });

    it('deve exibir chip com label para tipo APTIDAO', async () => {
      const { fixture } = await renderVantagens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.selectedVantagem.set({ ...vantagemTCOMock, preRequisitos: [prAptidao] });
      comp.drawerVisible.set(true);
      fixture.detectChanges();

      expect(screen.getByText('Aptidão: Atletismo \u2265 3')).toBeTruthy();
    });

    it('deve exibir múltiplos chips quando há vários pré-requisitos', async () => {
      const { fixture } = await renderVantagens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.selectedVantagem.set({ ...vantagemTCOMock, preRequisitos: [prVantagem, prRaca, prNivel] });
      comp.drawerVisible.set(true);
      fixture.detectChanges();

      expect(screen.getByText('Vantagem: Chama Sagrada (nível 2)')).toBeTruthy();
      expect(screen.getByText('Raça: Elfo')).toBeTruthy();
      expect(screen.getByText('Nível \u2265 5')).toBeTruthy();
    });
  });

  // ----------------------------------------------------------
  // 5. Formulário de adição — campos condicionais por tipo
  // ----------------------------------------------------------

  describe('campos condicionais por tipo', () => {
    it('deve exibir campos de VANTAGEM quando tipo selecionado é VANTAGEM', async () => {
      const { fixture } = await renderVantagens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDrawer(vantagemTCOMock);
      comp.mostrarFormAdicionarPreRequisito.set(true);
      comp.novoPreRequisitoTipo.set('VANTAGEM');
      fixture.detectChanges();

      expect(screen.getByTestId('campos-tipo-VANTAGEM')).toBeTruthy();
    });

    it('deve exibir campos de RACA quando tipo selecionado é RACA', async () => {
      const { fixture } = await renderVantagens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDrawer(vantagemTCOMock);
      comp.mostrarFormAdicionarPreRequisito.set(true);
      comp.novoPreRequisitoTipo.set('RACA');
      fixture.detectChanges();

      expect(screen.getByTestId('campos-tipo-RACA')).toBeTruthy();
    });

    it('deve exibir campos de CLASSE quando tipo selecionado é CLASSE', async () => {
      const { fixture } = await renderVantagens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDrawer(vantagemTCOMock);
      comp.mostrarFormAdicionarPreRequisito.set(true);
      comp.novoPreRequisitoTipo.set('CLASSE');
      fixture.detectChanges();

      expect(screen.getByTestId('campos-tipo-CLASSE')).toBeTruthy();
    });

    it('deve exibir campos de ATRIBUTO quando tipo selecionado é ATRIBUTO', async () => {
      const { fixture } = await renderVantagens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDrawer(vantagemTCOMock);
      comp.mostrarFormAdicionarPreRequisito.set(true);
      comp.novoPreRequisitoTipo.set('ATRIBUTO');
      fixture.detectChanges();

      expect(screen.getByTestId('campos-tipo-ATRIBUTO')).toBeTruthy();
    });

    it('deve exibir campos de NIVEL quando tipo selecionado é NIVEL', async () => {
      const { fixture } = await renderVantagens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDrawer(vantagemTCOMock);
      comp.mostrarFormAdicionarPreRequisito.set(true);
      comp.novoPreRequisitoTipo.set('NIVEL');
      fixture.detectChanges();

      expect(screen.getByTestId('campos-tipo-NIVEL')).toBeTruthy();
    });

    it('deve exibir campos de APTIDAO quando tipo selecionado é APTIDAO', async () => {
      const { fixture } = await renderVantagens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDrawer(vantagemTCOMock);
      comp.mostrarFormAdicionarPreRequisito.set(true);
      comp.novoPreRequisitoTipo.set('APTIDAO');
      fixture.detectChanges();

      expect(screen.getByTestId('campos-tipo-APTIDAO')).toBeTruthy();
    });

    it('deve ocultar campos de outros tipos quando VANTAGEM está selecionado', async () => {
      const { fixture } = await renderVantagens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDrawer(vantagemTCOMock);
      comp.mostrarFormAdicionarPreRequisito.set(true);
      comp.novoPreRequisitoTipo.set('VANTAGEM');
      fixture.detectChanges();

      expect(document.querySelector('[data-testid="campos-tipo-RACA"]')).toBeNull();
      expect(document.querySelector('[data-testid="campos-tipo-CLASSE"]')).toBeNull();
      expect(document.querySelector('[data-testid="campos-tipo-NIVEL"]')).toBeNull();
    });
  });

  // ----------------------------------------------------------
  // 6. preRequisitoFormValido() — computed de validação
  // ----------------------------------------------------------

  describe('preRequisitoFormValido()', () => {
    it('deve ser false quando tipo não está selecionado', async () => {
      const { fixture } = await renderVantagens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.novoPreRequisitoTipo.set(null);

      expect(comp.preRequisitoFormValido()).toBe(false);
    });

    it('deve ser false para VANTAGEM sem vantagem selecionada', async () => {
      const { fixture } = await renderVantagens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.novoPreRequisitoTipo.set('VANTAGEM');
      comp.novoPreRequisitoVantagemId.set(null);

      expect(comp.preRequisitoFormValido()).toBe(false);
    });

    it('deve ser true para VANTAGEM com vantagem selecionada', async () => {
      const { fixture } = await renderVantagens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.novoPreRequisitoTipo.set('VANTAGEM');
      comp.novoPreRequisitoVantagemId.set(11);

      expect(comp.preRequisitoFormValido()).toBe(true);
    });

    it('deve ser true para RACA com raça selecionada', async () => {
      const { fixture } = await renderVantagens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.novoPreRequisitoTipo.set('RACA');
      comp.novoPreRequisitoRacaId.set(3);

      expect(comp.preRequisitoFormValido()).toBe(true);
    });

    it('deve ser true para CLASSE com classe selecionada', async () => {
      const { fixture } = await renderVantagens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.novoPreRequisitoTipo.set('CLASSE');
      comp.novoPreRequisitoClasseId.set(4);

      expect(comp.preRequisitoFormValido()).toBe(true);
    });

    it('deve ser false para ATRIBUTO sem valorMinimo', async () => {
      const { fixture } = await renderVantagens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.novoPreRequisitoTipo.set('ATRIBUTO');
      comp.novoPreRequisitoAtributoId.set(1);
      comp.novoPreRequisitoValorMinimo.set(null);

      expect(comp.preRequisitoFormValido()).toBe(false);
    });

    it('deve ser true para ATRIBUTO com atributo e valorMinimo preenchidos', async () => {
      const { fixture } = await renderVantagens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.novoPreRequisitoTipo.set('ATRIBUTO');
      comp.novoPreRequisitoAtributoId.set(1);
      comp.novoPreRequisitoValorMinimo.set(14);

      expect(comp.preRequisitoFormValido()).toBe(true);
    });

    it('deve ser true para NIVEL com valorMinimo preenchido', async () => {
      const { fixture } = await renderVantagens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.novoPreRequisitoTipo.set('NIVEL');
      comp.novoPreRequisitoValorMinimo.set(5);

      expect(comp.preRequisitoFormValido()).toBe(true);
    });

    it('deve ser false para NIVEL sem valorMinimo', async () => {
      const { fixture } = await renderVantagens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.novoPreRequisitoTipo.set('NIVEL');
      comp.novoPreRequisitoValorMinimo.set(null);

      expect(comp.preRequisitoFormValido()).toBe(false);
    });

    it('deve ser true para APTIDAO com aptidão e valorMinimo preenchidos', async () => {
      const { fixture } = await renderVantagens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.novoPreRequisitoTipo.set('APTIDAO');
      comp.novoPreRequisitoAptidaoId.set(2);
      comp.novoPreRequisitoValorMinimo.set(3);

      expect(comp.preRequisitoFormValido()).toBe(true);
    });
  });

  // ----------------------------------------------------------
  // 7. addPreRequisito() — submissão com cada tipo
  // ----------------------------------------------------------

  describe('addPreRequisito()', () => {

    it('deve chamar addVantagemPreRequisito com dto correto para tipo VANTAGEM', async () => {
      const addSubj = new Subject<VantagemPreRequisito>();
      const { fixture, configApiMock } = await renderVantagens({ addPreRequisitoSubject: addSubj });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.selectedVantagem.set(vantagemTCOMock);
      comp.novoPreRequisitoTipo.set('VANTAGEM');
      comp.novoPreRequisitoVantagemId.set(11);
      comp.novoPreRequisitoNivelMinimo.set(2);

      comp.addPreRequisito();

      const esperado: AddPreRequisitoDto = { tipo: 'VANTAGEM', preRequisitoId: 11, nivelMinimo: 2 };
      expect(configApiMock.addVantagemPreRequisito).toHaveBeenCalledWith(10, esperado);
    });

    it('deve chamar addVantagemPreRequisito com dto correto para tipo RACA', async () => {
      const addSubj = new Subject<VantagemPreRequisito>();
      const { fixture, configApiMock } = await renderVantagens({ addPreRequisitoSubject: addSubj });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.selectedVantagem.set(vantagemTCOMock);
      comp.novoPreRequisitoTipo.set('RACA');
      comp.novoPreRequisitoRacaId.set(3);

      comp.addPreRequisito();

      const esperado: AddPreRequisitoDto = { tipo: 'RACA', racaId: 3 };
      expect(configApiMock.addVantagemPreRequisito).toHaveBeenCalledWith(10, esperado);
    });

    it('deve chamar addVantagemPreRequisito com dto correto para tipo CLASSE', async () => {
      const addSubj = new Subject<VantagemPreRequisito>();
      const { fixture, configApiMock } = await renderVantagens({ addPreRequisitoSubject: addSubj });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.selectedVantagem.set(vantagemTCOMock);
      comp.novoPreRequisitoTipo.set('CLASSE');
      comp.novoPreRequisitoClasseId.set(4);

      comp.addPreRequisito();

      const esperado: AddPreRequisitoDto = { tipo: 'CLASSE', classeId: 4 };
      expect(configApiMock.addVantagemPreRequisito).toHaveBeenCalledWith(10, esperado);
    });

    it('deve chamar addVantagemPreRequisito com dto correto para tipo ATRIBUTO', async () => {
      const addSubj = new Subject<VantagemPreRequisito>();
      const { fixture, configApiMock } = await renderVantagens({ addPreRequisitoSubject: addSubj });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.selectedVantagem.set(vantagemTCOMock);
      comp.novoPreRequisitoTipo.set('ATRIBUTO');
      comp.novoPreRequisitoAtributoId.set(1);
      comp.novoPreRequisitoValorMinimo.set(14);

      comp.addPreRequisito();

      const esperado: AddPreRequisitoDto = { tipo: 'ATRIBUTO', atributoId: 1, valorMinimo: 14 };
      expect(configApiMock.addVantagemPreRequisito).toHaveBeenCalledWith(10, esperado);
    });

    it('deve chamar addVantagemPreRequisito com dto correto para tipo NIVEL', async () => {
      const addSubj = new Subject<VantagemPreRequisito>();
      const { fixture, configApiMock } = await renderVantagens({ addPreRequisitoSubject: addSubj });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.selectedVantagem.set(vantagemTCOMock);
      comp.novoPreRequisitoTipo.set('NIVEL');
      comp.novoPreRequisitoValorMinimo.set(5);

      comp.addPreRequisito();

      const esperado: AddPreRequisitoDto = { tipo: 'NIVEL', valorMinimo: 5 };
      expect(configApiMock.addVantagemPreRequisito).toHaveBeenCalledWith(10, esperado);
    });

    it('deve chamar addVantagemPreRequisito com dto correto para tipo APTIDAO', async () => {
      const addSubj = new Subject<VantagemPreRequisito>();
      const { fixture, configApiMock } = await renderVantagens({ addPreRequisitoSubject: addSubj });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.selectedVantagem.set(vantagemTCOMock);
      comp.novoPreRequisitoTipo.set('APTIDAO');
      comp.novoPreRequisitoAptidaoId.set(2);
      comp.novoPreRequisitoValorMinimo.set(3);

      comp.addPreRequisito();

      const esperado: AddPreRequisitoDto = { tipo: 'APTIDAO', aptidaoId: 2, valorMinimo: 3 };
      expect(configApiMock.addVantagemPreRequisito).toHaveBeenCalledWith(10, esperado);
    });

    it('deve fechar formulário e emitir toast de sucesso após adicionar', async () => {
      const addSubj = new Subject<VantagemPreRequisito>();
      const { fixture, configApiMock, toastServiceMock } = await renderVantagens({ addPreRequisitoSubject: addSubj });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.selectedVantagem.set(vantagemTCOMock);
      comp.mostrarFormAdicionarPreRequisito.set(true);
      comp.novoPreRequisitoTipo.set('NIVEL');
      comp.novoPreRequisitoValorMinimo.set(5);

      comp.addPreRequisito();

      // Resolve o observable
      addSubj.next({ id: 99, vantagemId: 10, tipo: 'NIVEL', valorMinimo: 5 });
      addSubj.complete();
      fixture.detectChanges();

      expect(toastServiceMock.success).toHaveBeenCalledWith('Pré-requisito adicionado', 'Sucesso');
      expect(comp.mostrarFormAdicionarPreRequisito()).toBe(false);
      expect(configApiMock.getVantagem).toHaveBeenCalledWith(10);
    });

    it('não deve chamar API se não há vantagem selecionada', async () => {
      const { fixture, configApiMock } = await renderVantagens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.selectedVantagem.set(null);
      comp.novoPreRequisitoTipo.set('NIVEL');
      comp.novoPreRequisitoValorMinimo.set(5);

      comp.addPreRequisito();

      expect(configApiMock.addVantagemPreRequisito).not.toHaveBeenCalled();
    });
  });

  // ----------------------------------------------------------
  // 8. removePreRequisito()
  // ----------------------------------------------------------

  describe('removePreRequisito()', () => {
    it('deve chamar removeVantagemPreRequisito com ids corretos', async () => {
      const { fixture, configApiMock, toastServiceMock } = await renderVantagens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.selectedVantagem.set({ ...vantagemTCOMock, preRequisitos: [prNivel] });
      comp.drawerVisible.set(true);
      fixture.detectChanges();

      comp.removePreRequisito(prNivel.id);
      fixture.detectChanges();

      expect(configApiMock.removeVantagemPreRequisito).toHaveBeenCalledWith(10, prNivel.id);
      expect(toastServiceMock.success).toHaveBeenCalledWith('Pré-requisito removido', 'Sucesso');
    });
  });

  // ----------------------------------------------------------
  // 9. Badge INSÓLITUS na lista de vantagens disponíveis
  // ----------------------------------------------------------

  describe('badge INSÓLITUS', () => {
    it('deve exibir badge INSÓLITUS para vantagens do tipo INSOLITUS nas opções', async () => {
      const { fixture } = await renderVantagens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDrawer(vantagemTCOMock);
      comp.mostrarFormAdicionarPreRequisito.set(true);
      comp.novoPreRequisitoTipo.set('VANTAGEM');
      fixture.detectChanges();

      // O stub exibe badge para vantagens INSOLITUS em vantagensDisponiveis()
      const badges = document.querySelectorAll('.badge-insolitus');
      expect(badges.length).toBeGreaterThan(0);

      // Verifica que o badge está associado à vantagem INSOLITUS
      const badgeEl = document.querySelector(`.badge-insolitus[data-vid="${vantagemInsolitusMock.id}"]`);
      expect(badgeEl).toBeTruthy();
    });

    it('não deve exibir badge para vantagens do tipo VANTAGEM normal', async () => {
      const { fixture } = await renderVantagens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDrawer(vantagemTCOMock);
      comp.mostrarFormAdicionarPreRequisito.set(true);
      comp.novoPreRequisitoTipo.set('VANTAGEM');
      fixture.detectChanges();

      // TCO tem id=10 e tipoVantagem='VANTAGEM' (não INSOLITUS)
      // Mas TCO é a vantagem sendo editada, então não aparece em vantagensDisponiveis()
      // Apenas vantagemInsolitusMock está disponível — logo somente 1 badge
      const badges = document.querySelectorAll('.badge-insolitus');
      expect(badges.length).toBe(1); // somente Chama Sagrada
    });
  });

  // ----------------------------------------------------------
  // 10. onTipoPreRequisitoChange() — limpa campos ao trocar tipo
  // ----------------------------------------------------------

  describe('onTipoPreRequisitoChange()', () => {
    it('deve limpar campos de outros tipos ao mudar o tipo', async () => {
      const { fixture } = await renderVantagens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      // Preenche campos de ATRIBUTO
      comp.novoPreRequisitoAtributoId.set(1);
      comp.novoPreRequisitoValorMinimo.set(14);

      // Troca para RACA
      comp.novoPreRequisitoTipo.set('RACA');
      comp.onTipoPreRequisitoChange();

      expect(comp.novoPreRequisitoAtributoId()).toBeNull();
      expect(comp.novoPreRequisitoValorMinimo()).toBeNull();
    });
  });

  // ----------------------------------------------------------
  // 11. vantagensDisponiveis() — exclui a própria vantagem e já-requisitos
  // ----------------------------------------------------------

  describe('vantagensDisponiveis()', () => {
    it('deve excluir a vantagem sendo editada das opções', async () => {
      const { fixture } = await renderVantagens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.selectedVantagem.set(vantagemTCOMock);
      fixture.detectChanges();

      const disponiveisIds = comp.vantagensDisponiveis().map((v: VantagemConfig) => v.id);
      expect(disponiveisIds).not.toContain(vantagemTCOMock.id);
    });

    it('deve incluir vantagens INSOLITUS nas opções', async () => {
      const { fixture } = await renderVantagens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.selectedVantagem.set(vantagemTCOMock);
      fixture.detectChanges();

      const disponiveisIds = comp.vantagensDisponiveis().map((v: VantagemConfig) => v.id);
      expect(disponiveisIds).toContain(vantagemInsolitusMock.id);
    });

    it('deve excluir vantagens já adicionadas como pré-requisito VANTAGEM', async () => {
      const { fixture } = await renderVantagens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.selectedVantagem.set({
        ...vantagemTCOMock,
        preRequisitos: [prVantagem], // preRequisitoId=11 (Chama Sagrada)
      });
      fixture.detectChanges();

      const disponiveisIds = comp.vantagensDisponiveis().map((v: VantagemConfig) => v.id);
      expect(disponiveisIds).not.toContain(vantagemInsolitusMock.id); // id=11 já é pré-requisito
    });
  });

  // ----------------------------------------------------------
  // 12. cancelarAdicionarPreRequisito() — reseta estado
  // ----------------------------------------------------------

  describe('cancelarAdicionarPreRequisito()', () => {
    it('deve fechar o formulário e limpar campos ao cancelar', async () => {
      const { fixture } = await renderVantagens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.mostrarFormAdicionarPreRequisito.set(true);
      comp.novoPreRequisitoTipo.set('NIVEL');
      comp.novoPreRequisitoValorMinimo.set(5);

      comp.cancelarAdicionarPreRequisito();
      fixture.detectChanges();

      expect(comp.mostrarFormAdicionarPreRequisito()).toBe(false);
      expect(comp.novoPreRequisitoTipo()).toBeNull();
      expect(comp.novoPreRequisitoValorMinimo()).toBeNull();
    });
  });

  // ----------------------------------------------------------
  // 13. Botão "Adicionar pré-requisito" — quando lista não está vazia
  // ----------------------------------------------------------

  describe('botão adicionar (com pré-requisitos existentes)', () => {
    it('deve exibir botão de adicionar quando há pré-requisitos e form está fechado', async () => {
      const { fixture } = await renderVantagens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.selectedVantagem.set({ ...vantagemTCOMock, preRequisitos: [prNivel] });
      comp.drawerVisible.set(true);
      comp.mostrarFormAdicionarPreRequisito.set(false);
      fixture.detectChanges();

      expect(screen.getByTestId('btn-adicionar-prerequisito')).toBeTruthy();
    });

    it('deve ocultar botão de adicionar quando formulário está aberto', async () => {
      const { fixture } = await renderVantagens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.selectedVantagem.set({ ...vantagemTCOMock, preRequisitos: [prNivel] });
      comp.drawerVisible.set(true);
      comp.mostrarFormAdicionarPreRequisito.set(true);
      fixture.detectChanges();

      expect(document.querySelector('[data-testid="btn-adicionar-prerequisito"]')).toBeNull();
    });
  });

  // ----------------------------------------------------------
  // 14. Carregamento inicial — racas e classes carregadas
  // ----------------------------------------------------------

  describe('carregamento de dados para dropdowns', () => {
    it('deve carregar raças ao inicializar', async () => {
      const { configApiMock } = await renderVantagens();

      expect(configApiMock.listRacas).toHaveBeenCalledWith(10);
    });

    it('deve carregar classes ao inicializar', async () => {
      const { configApiMock } = await renderVantagens();

      expect(configApiMock.listClasses).toHaveBeenCalledWith(10);
    });

    it('deve armazenar raças no signal', async () => {
      const { fixture } = await renderVantagens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      expect(comp.racas().length).toBe(1);
      expect(comp.racas()[0].nome).toBe('Elfo');
    });

    it('deve armazenar classes no signal', async () => {
      const { fixture } = await renderVantagens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      expect(comp.classes().length).toBe(1);
      expect(comp.classes()[0].nome).toBe('Mago');
    });
  });

  // ----------------------------------------------------------
  // 15. tipoVantagem — checkbox Insólitus no formulário
  // ----------------------------------------------------------

  describe('tipoVantagem — isInsolitus e formulário', () => {

    it('deve iniciar isInsolitus como false por padrão (nova vantagem)', async () => {
      const { fixture } = await renderVantagens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDrawer(); // sem item = nova vantagem
      fixture.detectChanges();

      expect(comp.isInsolitus()).toBe(false);
    });

    it('deve setar isInsolitus=true ao abrir edição de item INSOLITUS', async () => {
      const { fixture } = await renderVantagens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDrawer(vantagemInsolitusMock);
      fixture.detectChanges();

      expect(comp.isInsolitus()).toBe(true);
    });

    it('deve setar isInsolitus=false ao abrir edição de item VANTAGEM normal', async () => {
      const { fixture } = await renderVantagens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDrawer(vantagemTCOMock);
      fixture.detectChanges();

      expect(comp.isInsolitus()).toBe(false);
    });

    it('deve atualizar tipoVantagem no form para INSOLITUS ao marcar checkbox', async () => {
      const { fixture } = await renderVantagens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDrawer(vantagemTCOMock);
      fixture.detectChanges();

      comp.isInsolitus.set(true);
      fixture.detectChanges();

      expect(comp.form.get('tipoVantagem').value).toBe('INSOLITUS');
    });

    it('deve atualizar tipoVantagem no form para VANTAGEM ao desmarcar checkbox', async () => {
      const { fixture } = await renderVantagens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDrawer(vantagemInsolitusMock);
      fixture.detectChanges();

      comp.isInsolitus.set(false);
      fixture.detectChanges();

      expect(comp.form.get('tipoVantagem').value).toBe('VANTAGEM');
    });

    it('deve desabilitar formulaCusto ao marcar isInsolitus=true', async () => {
      const { fixture } = await renderVantagens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDrawer(vantagemTCOMock);
      fixture.detectChanges();

      comp.isInsolitus.set(true);
      fixture.detectChanges();

      expect(comp.form.get('formulaCusto').disabled).toBe(true);
    });

    it('deve limpar formulaCusto ao marcar isInsolitus=true', async () => {
      const { fixture } = await renderVantagens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDrawer(vantagemTCOMock);
      comp.form.get('formulaCusto').setValue('nivel * 2');
      fixture.detectChanges();

      comp.isInsolitus.set(true);
      fixture.detectChanges();

      expect(comp.form.get('formulaCusto').value).toBe('');
    });

    it('deve reabilitar formulaCusto ao desmarcar isInsolitus', async () => {
      const { fixture } = await renderVantagens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.openDrawer(vantagemInsolitusMock);
      fixture.detectChanges();

      // Garante que está desabilitado (INSOLITUS)
      expect(comp.form.get('formulaCusto').disabled).toBe(true);

      comp.isInsolitus.set(false);
      fixture.detectChanges();

      expect(comp.form.get('formulaCusto').enabled).toBe(true);
    });

    it('deve ter campo tipoVantagem definido no formulário', async () => {
      const { fixture } = await renderVantagens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      // O form deve ter o controle tipoVantagem
      expect(comp.form.get('tipoVantagem')).not.toBeNull();
    });
  });

  // ----------------------------------------------------------
  // 16. tipoVantagemLabel — campo virtual em filteredItems()
  // ----------------------------------------------------------

  describe('tipoVantagemLabel — campo virtual na tabela', () => {

    it('deve mapear tipoVantagem INSOLITUS para "Insólitus" na coluna', async () => {
      const { fixture } = await renderVantagens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;
      fixture.detectChanges();

      const items = comp.filteredItems();
      const insolitus = items.find((v: { id: number }) => v.id === vantagemInsolitusMock.id);
      expect(insolitus).toBeTruthy();
      expect(insolitus.tipoVantagemLabel).toBe('Insólitus');
    });

    it('deve mapear tipoVantagem VANTAGEM para "—" na coluna', async () => {
      const { fixture } = await renderVantagens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;
      fixture.detectChanges();

      const items = comp.filteredItems();
      const vantagem = items.find((v: { id: number }) => v.id === vantagemTCOMock.id);
      expect(vantagem).toBeTruthy();
      expect(vantagem.tipoVantagemLabel).toBe('—');
    });

    it('deve mapear tipoVantagem undefined como "—" na coluna', async () => {
      const vantagemSemTipo: VantagemConfig = {
        ...vantagemTCOMock,
        id: 99,
        tipoVantagem: undefined,
      };
      const { fixture } = await renderVantagens({ vantagens: [vantagemSemTipo] });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;
      fixture.detectChanges();

      const items = comp.filteredItems();
      expect(items[0].tipoVantagemLabel).toBe('—');
    });

    it('deve incluir tipoVantagemLabel em resultados filtrados por nome', async () => {
      const { fixture } = await renderVantagens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      comp.searchQuery.set('chama');
      fixture.detectChanges();

      const items = comp.filteredItems();
      expect(items.length).toBe(1);
      expect(items[0].tipoVantagemLabel).toBe('Insólitus');
    });

    it('deve conter coluna tipoVantagemLabel no array columns', async () => {
      const { fixture } = await renderVantagens();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comp = fixture.componentInstance as any;

      const colTipo = comp.columns.find((c: { field: string }) => c.field === 'tipoVantagemLabel');
      expect(colTipo).toBeTruthy();
      expect(colTipo.header).toBe('Tipo');
      expect(colTipo.width).toBe('7rem');
    });
  });

});
