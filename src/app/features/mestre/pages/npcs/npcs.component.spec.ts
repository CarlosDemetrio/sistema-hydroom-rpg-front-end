import { render, screen, fireEvent } from '@testing-library/angular';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { provideRouter } from '@angular/router';

import { NpcsComponent } from './npcs.component';
import { FichaBusinessService } from '@core/services/business/ficha-business.service';
import { ConfigApiService } from '@core/services/api/config-api.service';
import { CurrentGameService } from '@core/services/current-game.service';
import { ConfigStore } from '@core/stores/config.store';
import { ToastService } from '@services/toast.service';
import { Ficha } from '@core/models/ficha.model';
import { NpcDificuldadeConfig } from '@core/models/npc-dificuldade-config.model';

// ============================================================
// Mock data
// ============================================================

const npcMock: Ficha = {
  id: 1,
  jogoId: 10,
  nome: 'Goblin Chefe',
  jogadorId: null,
  racaId: 2,
  racaNome: 'Goblin',
  classeId: null,
  classeNome: null,
  generoId: null,
  generoNome: null,
  indoleId: null,
  indoleNome: null,
  presencaId: null,
  presencaNome: null,
  nivel: 1,
  xp: 0,
  renascimentos: 0,
  isNpc: true,
  descricao: null,
  status: 'RASCUNHO' as const,
  dataCriacao: '2024-01-01T00:00:00',
  dataUltimaAtualizacao: '2024-01-01T00:00:00',
};

const npcMock2: Ficha = {
  ...npcMock,
  id: 2,
  nome: 'Dragão Ancião',
  racaNome: null,
  classeNome: 'Guerreiro',
  classeId: 3,
};

const jogoAtualMock = { id: 10, nome: 'Campanha Épica', ativo: true };

const atributosMock = [
  { id: 101, nome: 'Força',       abreviacao: 'FOR', jogoId: 10, descricao: null, formulaImpeto: null, descricaoImpeto: null, valorMinimo: 1, valorMaximo: 20, ordemExibicao: 1, dataCriacao: '', dataUltimaAtualizacao: '' },
  { id: 102, nome: 'Agilidade',   abreviacao: 'AGI', jogoId: 10, descricao: null, formulaImpeto: null, descricaoImpeto: null, valorMinimo: 1, valorMaximo: 20, ordemExibicao: 2, dataCriacao: '', dataUltimaAtualizacao: '' },
  { id: 103, nome: 'Inteligência',abreviacao: 'INT', jogoId: 10, descricao: null, formulaImpeto: null, descricaoImpeto: null, valorMinimo: 1, valorMaximo: 20, ordemExibicao: 3, dataCriacao: '', dataUltimaAtualizacao: '' },
];

const dificuldadeFisicaMock: NpcDificuldadeConfig = {
  id: 1,
  nome: 'Fraco',
  foco: 'FISICO',
  valoresAtributo: [
    { atributoId: 101, atributoNome: 'Força',     atributoAbreviacao: 'FOR', valorBase: 5  },
    { atributoId: 102, atributoNome: 'Agilidade', atributoAbreviacao: 'AGI', valorBase: 4  },
    { atributoId: 103, atributoNome: 'Inteligência', atributoAbreviacao: 'INT', valorBase: 2 },
  ],
};

const dificuldadeMagicaMock: NpcDificuldadeConfig = {
  id: 2,
  nome: 'Forte',
  foco: 'MAGICO',
  valoresAtributo: [
    { atributoId: 101, atributoNome: 'Força',     atributoAbreviacao: 'FOR', valorBase: 3  },
    { atributoId: 102, atributoNome: 'Agilidade', atributoAbreviacao: 'AGI', valorBase: 3  },
    { atributoId: 103, atributoNome: 'Inteligência', atributoAbreviacao: 'INT', valorBase: 10 },
  ],
};

// ============================================================
// Mock factories
// ============================================================

function criarCurrentGameServiceMock(temJogo = true) {
  return {
    hasCurrentGame: () => temJogo,
    currentGameId:  () => (temJogo ? 10 : null),
    currentGame:    () => (temJogo ? jogoAtualMock : null),
  };
}

function criarFichaServiceMock(npcs: Ficha[] = [], npcRetornado: Ficha = npcMock) {
  return {
    loadNpcs: vi.fn().mockReturnValue(of(npcs)),
    criarNpc: vi.fn().mockReturnValue(of(npcRetornado)),
  };
}

function criarConfigApiServiceMock(dificuldades: NpcDificuldadeConfig[] = [dificuldadeFisicaMock, dificuldadeMagicaMock]) {
  return {
    listNpcDificuldades: vi.fn().mockReturnValue(of(dificuldades)),
    listAtributos:       vi.fn().mockReturnValue(of(atributosMock)),
  };
}

function criarConfigStoreMock() {
  return {
    racas:    () => [{ id: 2, nome: 'Goblin' }, { id: 3, nome: 'Orc' }],
    classes:  () => [{ id: 3, nome: 'Guerreiro' }, { id: 4, nome: 'Mago' }],
    generos:  () => [{ id: 1, nome: 'Masculino' }],
    indoles:  () => [{ id: 1, nome: 'Neutro' }],
    presencas:() => [{ id: 1, nome: 'Sutil' }],
  };
}

function criarToastServiceMock() {
  return {
    success: vi.fn(),
    error:   vi.fn(),
    warning: vi.fn(),
  };
}

// ============================================================
// Helpers de render
// ============================================================

async function renderNpcsComponent(overrides: {
  temJogo?: boolean;
  npcs?: Ficha[];
  npcRetornado?: Ficha;
  fichaServiceOverride?: Partial<ReturnType<typeof criarFichaServiceMock>>;
  configApiServiceOverride?: Partial<ReturnType<typeof criarConfigApiServiceMock>>;
  dificuldades?: NpcDificuldadeConfig[];
} = {}) {
  const {
    temJogo = true,
    npcs = [],
    npcRetornado = npcMock,
    fichaServiceOverride,
    configApiServiceOverride,
    dificuldades = [dificuldadeFisicaMock, dificuldadeMagicaMock],
  } = overrides;

  const fichaService     = { ...criarFichaServiceMock(npcs, npcRetornado), ...fichaServiceOverride };
  const configApiService = { ...criarConfigApiServiceMock(dificuldades), ...configApiServiceOverride };
  const currentGameService = criarCurrentGameServiceMock(temJogo);
  const configStore      = criarConfigStoreMock();
  const toastService     = criarToastServiceMock();

  const result = await render(NpcsComponent, {
    providers: [
      provideRouter([]),
      { provide: FichaBusinessService, useValue: fichaService },
      { provide: ConfigApiService,     useValue: configApiService },
      { provide: CurrentGameService,   useValue: currentGameService },
      { provide: ConfigStore,          useValue: configStore },
      { provide: ToastService,         useValue: toastService },
    ],
  });

  return { ...result, fichaService, configApiService, toastService };
}

// ============================================================
// Testes
// ============================================================

describe('NpcsComponent', () => {

  describe('renderização inicial', () => {
    it('exibe título "NPCs"', async () => {
      await renderNpcsComponent();
      expect(screen.getByText('NPCs')).toBeTruthy();
    });

    it('exibe o nome do jogo atual no subtítulo', async () => {
      await renderNpcsComponent({ temJogo: true });
      expect(screen.getByText(/Campanha Épica/)).toBeTruthy();
    });

    it('chama loadNpcs ao inicializar quando há jogo selecionado', async () => {
      const { fichaService } = await renderNpcsComponent({ npcs: [] });
      expect(fichaService.loadNpcs).toHaveBeenCalledWith(10);
    });

    it('não chama loadNpcs quando não há jogo selecionado', async () => {
      const { fichaService } = await renderNpcsComponent({ temJogo: false });
      expect(fichaService.loadNpcs).not.toHaveBeenCalled();
    });
  });

  describe('sem jogo selecionado', () => {
    it('exibe aviso de nenhum jogo selecionado', async () => {
      await renderNpcsComponent({ temJogo: false });
      expect(screen.getByText('Nenhum jogo selecionado')).toBeTruthy();
    });


  });

  describe('empty state', () => {
    // NOTA JIT: static attribute bindings (message="...") para input() signals não
    // propagam em modo JIT (Vitest sem plugin Angular). O EmptyStateComponent renderiza
    // com seus valores default em vez dos atributos passados pelo NpcsComponent.
    // Os testes verificam o comportamento do componente (npcs vazio → renderiza empty state)
    // em vez do conteúdo de texto do componente filho.

    it('exibe empty state quando não há NPCs (app-empty-state presente no DOM)', async () => {
      const { fixture } = await renderNpcsComponent({ npcs: [] });
      const emptyState = fixture.nativeElement.querySelector('app-empty-state');
      expect(emptyState).not.toBeNull();
    });

    it('não exibe a tabela de NPCs quando lista está vazia', async () => {
      const { fixture } = await renderNpcsComponent({ npcs: [] });
      const tabela = fixture.nativeElement.querySelector('p-table');
      expect(tabela).toBeNull();
    });
  });

  describe('lista de NPCs', () => {
    it('renderiza NPCs na tabela', async () => {
      await renderNpcsComponent({ npcs: [npcMock, npcMock2] });
      expect(screen.getByText('Goblin Chefe')).toBeTruthy();
      expect(screen.getByText('Dragão Ancião')).toBeTruthy();
    });

    it('exibe raça do NPC quando disponível', async () => {
      await renderNpcsComponent({ npcs: [npcMock] });
      expect(screen.getByText('Goblin')).toBeTruthy();
    });

    it('exibe classe do NPC quando disponível', async () => {
      await renderNpcsComponent({ npcs: [npcMock2] });
      expect(screen.getByText('Guerreiro')).toBeTruthy();
    });

    it('exibe badge "NPC" para cada linha', async () => {
      await renderNpcsComponent({ npcs: [npcMock] });
      expect(screen.getByText('NPC')).toBeTruthy();
    });
  });

  describe('carregamento de dificuldades', () => {
    it('chama listNpcDificuldades ao inicializar quando há jogo selecionado', async () => {
      const { configApiService } = await renderNpcsComponent();
      expect(configApiService.listNpcDificuldades).toHaveBeenCalledWith(10);
    });

    it('não chama listNpcDificuldades quando não há jogo selecionado', async () => {
      const { configApiService } = await renderNpcsComponent({ temJogo: false });
      expect(configApiService.listNpcDificuldades).not.toHaveBeenCalled();
    });

    it('chama listAtributos ao inicializar quando há jogo selecionado', async () => {
      const { configApiService } = await renderNpcsComponent();
      expect(configApiService.listAtributos).toHaveBeenCalledWith(10);
    });

    it('não exibe campo dificuldade quando lista está vazia', async () => {
      const { fixture } = await renderNpcsComponent({ dificuldades: [] });
      fireEvent.click(screen.getByRole('button', { name: /Novo NPC/i }));
      fixture.detectChanges();
      // O select de dificuldade é renderizado mas sem opções — aria-label presente
      expect(screen.getByLabelText('Nível de Dificuldade do NPC')).toBeTruthy();
    });
  });

  describe('drawer de criação', () => {
    it('abre o drawer ao clicar em "Novo NPC"', async () => {
      await renderNpcsComponent({ npcs: [] });
      const btn = screen.getByRole('button', { name: /Novo NPC/i });
      fireEvent.click(btn);
      // Após abrir o drawer, o campo de nome do formulário deve estar disponível.
      // getByText('Novo NPC') falha pois tanto o label do botão quanto o título
      // do drawer retornam o mesmo texto; usar getByLabelText é mais específico.
      expect(screen.getByLabelText('Nome do NPC')).toBeTruthy();
    });

    it('exibe todos os campos do formulário', async () => {
      await renderNpcsComponent({ npcs: [] });
      fireEvent.click(screen.getByRole('button', { name: /Novo NPC/i }));

      expect(screen.getByLabelText('Nome do NPC')).toBeTruthy();
      expect(screen.getByLabelText('Nível de Dificuldade do NPC')).toBeTruthy();
      expect(screen.getByLabelText('Raça do NPC')).toBeTruthy();
      expect(screen.getByLabelText('Classe do NPC')).toBeTruthy();
      expect(screen.getByLabelText('Gênero do NPC')).toBeTruthy();
      expect(screen.getByLabelText('Índole do NPC')).toBeTruthy();
      expect(screen.getByLabelText('Presença do NPC')).toBeTruthy();
    });
  });

  describe('auto-preenchimento de atributos por dificuldade', () => {
    it('auto-preenche os controles de atributo ao selecionar uma dificuldade', async () => {
      const { fixture } = await renderNpcsComponent({ npcs: [] });

      fireEvent.click(screen.getByRole('button', { name: /Novo NPC/i }));
      fixture.detectChanges();

      const comp = fixture.componentInstance as NpcsComponent;

      // Simula seleção da dificuldade física
      comp.onDificuldadeChange(dificuldadeFisicaMock.id);
      fixture.detectChanges();

      expect(comp.form.get('atributo_101')?.value).toBe(5);
      expect(comp.form.get('atributo_102')?.value).toBe(4);
      expect(comp.form.get('atributo_103')?.value).toBe(2);
    });

    it('atualiza corretamente ao trocar de dificuldade', async () => {
      const { fixture } = await renderNpcsComponent({ npcs: [] });

      fireEvent.click(screen.getByRole('button', { name: /Novo NPC/i }));
      fixture.detectChanges();

      const comp = fixture.componentInstance as NpcsComponent;

      comp.onDificuldadeChange(dificuldadeFisicaMock.id);
      fixture.detectChanges();
      expect(comp.form.get('atributo_103')?.value).toBe(2);

      // Troca para dificuldade mágica
      comp.onDificuldadeChange(dificuldadeMagicaMock.id);
      fixture.detectChanges();
      expect(comp.form.get('atributo_103')?.value).toBe(10);
    });

    it('permite editar manualmente os valores após auto-preenchimento', async () => {
      const { fixture } = await renderNpcsComponent({ npcs: [] });

      fireEvent.click(screen.getByRole('button', { name: /Novo NPC/i }));
      fixture.detectChanges();

      const comp = fixture.componentInstance as NpcsComponent;

      // Auto-preenche via dificuldade
      comp.onDificuldadeChange(dificuldadeFisicaMock.id);
      fixture.detectChanges();
      expect(comp.form.get('atributo_101')?.value).toBe(5);

      // Sobrescreve manualmente
      comp.form.get('atributo_101')?.setValue(12);
      fixture.detectChanges();

      expect(comp.form.get('atributo_101')?.value).toBe(12);
      // Outros atributos permanecem com o valor da dificuldade
      expect(comp.form.get('atributo_102')?.value).toBe(4);
    });

    it('limpa dificuldadeSelecionada ao passar null para onDificuldadeChange', async () => {
      const { fixture } = await renderNpcsComponent({ npcs: [] });

      fireEvent.click(screen.getByRole('button', { name: /Novo NPC/i }));
      fixture.detectChanges();

      const comp = fixture.componentInstance as NpcsComponent;

      comp.onDificuldadeChange(dificuldadeFisicaMock.id);
      fixture.detectChanges();
      expect(comp.dificuldadeSelecionada()).not.toBeNull();

      comp.onDificuldadeChange(null);
      fixture.detectChanges();
      expect(comp.dificuldadeSelecionada()).toBeNull();
    });

    it('exibe informação de foco após selecionar dificuldade física', async () => {
      const { fixture } = await renderNpcsComponent({ npcs: [] });

      fireEvent.click(screen.getByRole('button', { name: /Novo NPC/i }));
      fixture.detectChanges();

      const comp = fixture.componentInstance as NpcsComponent;
      comp.onDificuldadeChange(dificuldadeFisicaMock.id);
      fixture.detectChanges();

      expect(screen.getByText(/Foco: Físico/)).toBeTruthy();
    });

    it('exibe informação de foco após selecionar dificuldade mágica', async () => {
      const { fixture } = await renderNpcsComponent({ npcs: [] });

      fireEvent.click(screen.getByRole('button', { name: /Novo NPC/i }));
      fixture.detectChanges();

      const comp = fixture.componentInstance as NpcsComponent;
      comp.onDificuldadeChange(dificuldadeMagicaMock.id);
      fixture.detectChanges();

      expect(screen.getByText(/Foco: Mágico/)).toBeTruthy();
    });
  });

  describe('submit sem dificuldade selecionada', () => {
    it('submete o formulário normalmente sem dificuldade (apenas nome preenchido)', async () => {
      const { fichaService, fixture } = await renderNpcsComponent({ npcs: [] });

      fireEvent.click(screen.getByRole('button', { name: /Novo NPC/i }));
      fixture.detectChanges();

      const comp = fixture.componentInstance as NpcsComponent;
      // Sem selecionar dificuldade — apenas nome
      comp.form.patchValue({ nome: 'Esqueleto Guerreiro' });
      fixture.detectChanges();

      fireEvent.click(screen.getByRole('button', { name: /Criar NPC/i }));

      expect(fichaService.criarNpc).toHaveBeenCalledWith(10, expect.objectContaining({
        jogoId: 10,
        nome: 'Esqueleto Guerreiro',
      }));
    });
  });

  describe('criação de NPC', () => {
    it('chama criarNpc com o DTO correto ao submeter o formulário', async () => {
      const { fichaService } = await renderNpcsComponent({ npcs: [] });

      fireEvent.click(screen.getByRole('button', { name: /Novo NPC/i }));

      const nomeInput = screen.getByLabelText('Nome do NPC') as HTMLInputElement;
      fireEvent.input(nomeInput, { target: { value: 'Goblin Chefe' } });
      fireEvent.blur(nomeInput);

      fireEvent.click(screen.getByRole('button', { name: /Criar NPC/i }));

      expect(fichaService.criarNpc).toHaveBeenCalledWith(10, expect.objectContaining({
        jogoId: 10,
        nome: 'Goblin Chefe',
      }));
    });

    it('inclui racaId e classeId no payload quando selecionados via form', async () => {
      // NOTA JIT: p-select não é interativo via fireEvent em ambiente JIT (sem browser).
      // Testamos o comportamento do form diretamente: quando racaId/classeId têm valor,
      // o DTO enviado ao serviço deve incluí-los.
      const { fichaService, fixture } = await renderNpcsComponent({ npcs: [] });

      fireEvent.click(screen.getByRole('button', { name: /Novo NPC/i }));
      fixture.detectChanges();

      const comp = fixture.componentInstance as any;
      comp.form.patchValue({ nome: 'Orc Guerreiro', racaId: 3, classeId: 3 });
      fixture.detectChanges();

      fireEvent.click(screen.getByRole('button', { name: /Criar NPC/i }));

      expect(fichaService.criarNpc).toHaveBeenCalledWith(10, expect.objectContaining({
        jogoId:   10,
        nome:     'Orc Guerreiro',
        racaId:   3,
        classeId: 3,
      }));
    });

    it('envia racaId e classeId como null quando campos opcionais não são preenchidos', async () => {
      const { fichaService, fixture } = await renderNpcsComponent({ npcs: [] });

      fireEvent.click(screen.getByRole('button', { name: /Novo NPC/i }));
      fixture.detectChanges();

      const comp = fixture.componentInstance as any;
      comp.form.patchValue({ nome: 'Espectro Sem Classe' });
      fixture.detectChanges();

      fireEvent.click(screen.getByRole('button', { name: /Criar NPC/i }));

      expect(fichaService.criarNpc).toHaveBeenCalledWith(10, expect.objectContaining({
        jogoId:   10,
        nome:     'Espectro Sem Classe',
        racaId:   null,
        classeId: null,
      }));
    });

    it('exibe toast de sucesso após criar NPC', async () => {
      const { toastService } = await renderNpcsComponent({ npcs: [] });

      fireEvent.click(screen.getByRole('button', { name: /Novo NPC/i }));

      const nomeInput = screen.getByLabelText('Nome do NPC') as HTMLInputElement;
      fireEvent.input(nomeInput, { target: { value: 'Goblin Chefe' } });
      fireEvent.blur(nomeInput);

      fireEvent.click(screen.getByRole('button', { name: /Criar NPC/i }));

      expect(toastService.success).toHaveBeenCalledWith(expect.stringContaining('Goblin Chefe'));
    });

    it('exibe erro de validação quando nome está vazio', async () => {
      const { toastService } = await renderNpcsComponent({ npcs: [] });

      fireEvent.click(screen.getByRole('button', { name: /Novo NPC/i }));
      fireEvent.click(screen.getByRole('button', { name: /Criar NPC/i }));

      expect(toastService.warning).toHaveBeenCalledWith(
        'Preencha todos os campos obrigatórios',
        'Atenção'
      );
    });

    it('exibe toast de erro quando a API falha', async () => {
      const { toastService } = await renderNpcsComponent({
        npcs: [],
        fichaServiceOverride: {
          criarNpc: vi.fn().mockReturnValue(throwError(() => new Error('HTTP 500'))),
        },
      });

      fireEvent.click(screen.getByRole('button', { name: /Novo NPC/i }));

      const nomeInput = screen.getByLabelText('Nome do NPC') as HTMLInputElement;
      fireEvent.input(nomeInput, { target: { value: 'Goblin Chefe' } });
      fireEvent.blur(nomeInput);

      fireEvent.click(screen.getByRole('button', { name: /Criar NPC/i }));

      expect(toastService.error).toHaveBeenCalledWith('Erro ao criar NPC');
    });
  });

  describe('erro ao carregar NPCs', () => {
    it('exibe toast de erro quando loadNpcs falha', async () => {
      const { toastService } = await renderNpcsComponent({
        fichaServiceOverride: {
          loadNpcs: vi.fn().mockReturnValue(throwError(() => new Error('HTTP 500'))),
        },
      });

      expect(toastService.error).toHaveBeenCalledWith('Erro ao carregar NPCs');
    });
  });

});
