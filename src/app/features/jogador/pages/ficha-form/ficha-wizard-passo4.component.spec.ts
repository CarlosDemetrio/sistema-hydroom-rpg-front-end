// /**
//  * FichaWizardComponent — Spec do Passo 4 (Aptidoes)
//  *
//  * Separado do spec principal para evitar OOM no processo de teste JIT.
//  * O spec principal (ficha-wizard.component.spec.ts) cobre passos 1-3.
//  * Este arquivo cobre apenas a logica do passo 4: carregamento de aptidoes,
//  * auto-save, agrupamento computed e validacao (sem bloqueio).
//  *
//  * Padrao JIT: overrideTemplate para evitar NG0950 dos sub-componentes.
//  */
// import { TestBed } from '@angular/core/testing';
// import { render } from '@testing-library/angular';
// import { signal, provideZonelessChangeDetection } from '@angular/core';
// import { of, throwError } from 'rxjs';
// import { vi } from 'vitest';
// import { provideRouter, Routes } from '@angular/router';
// import { ActivatedRoute, convertToParamMap } from '@angular/router';
// import { Component } from '@angular/core';
//
// // Componente stub para rotas de teste
// @Component({ standalone: true, template: '' })
// class StubComponent {}
//
// const ROTAS_TESTE: Routes = [
//   { path: 'jogador/fichas', component: StubComponent },
//   { path: 'mestre/jogos',   component: StubComponent },
//   { path: 'mestre/npcs',    component: StubComponent },
// ];
//
// import { MessageService } from 'primeng/api';
//
// import { FichaWizardComponent } from './ficha-wizard.component';
// import { FichasApiService } from '@core/services/api/fichas-api.service';
// import { ConfigApiService } from '@core/services/api/config-api.service';
// import { CurrentGameService } from '@core/services/current-game.service';
// import { AuthService } from '@services/auth.service';
// import { Ficha, FichaAptidaoResponse } from '@core/models/ficha.model';
// import { AptidaoConfig } from '@core/models/aptidao-config.model';
// import { FichaAptidaoEditavel } from './ficha-wizard.types';
//
// // ============================================================
// // Dados de teste
// // ============================================================
//
// const jogoAtualMock = { id: 10, nome: 'Campanha Epica', ativo: true };
//
// const fichaRascunhoMock: Ficha = {
//   id: 42,
//   jogoId: 10,
//   nome: 'Aragorn',
//   jogadorId: 1,
//   racaId: 1,
//   racaNome: 'Humano',
//   classeId: 1,
//   classeNome: 'Guerreiro',
//   generoId: 1,
//   generoNome: 'Masculino',
//   indoleId: 1,
//   indoleNome: 'Corajoso',
//   presencaId: 1,
//   presencaNome: 'Imponente',
//   nivel: 1,
//   xp: 0,
//   renascimentos: 0,
//   isNpc: false,
//   descricao: null,
//   status: 'RASCUNHO' as const,
//   dataCriacao: '2024-01-01T00:00:00',
//   dataUltimaAtualizacao: '2024-01-01T00:00:00',
// };
//
// const fichaAptidaoResponseMock: FichaAptidaoResponse = {
//   id: 1,
//   aptidaoConfigId: 1,
//   aptidaoNome: 'Espada',
//   base: 0,
//   sorte: 0,
//   classe: 0,
//   total: 0,
// };
//
// const aptidaoConfigMock: AptidaoConfig = {
//   id: 1,
//   jogoId: 10,
//   tipoAptidaoId: 1,
//   tipoAptidaoNome: 'Combate',
//   nome: 'Espada',
//   descricao: null,
//   ordemExibicao: 1,
//   dataCriacao: '2024-01-01T00:00:00',
//   dataUltimaAtualizacao: '2024-01-01T00:00:00',
// };
//
// const aptidaoEditavelMock: FichaAptidaoEditavel = {
//   aptidaoConfigId: 1,
//   aptidaoNome: 'Espada',
//   tipoAptidaoNome: 'Combate',
//   base: 2,
//   sorte: 0,
//   classe: 0,
// };
//
// // ============================================================
// // Factories de mocks
// // ============================================================
//
// function criarFichasApiMock() {
//   return {
//     getFicha:           vi.fn().mockReturnValue(of(fichaRascunhoMock)),
//     createFicha:        vi.fn().mockReturnValue(of(fichaRascunhoMock)),
//     updateFicha:        vi.fn().mockReturnValue(of(fichaRascunhoMock)),
//     getAtributos:       vi.fn().mockReturnValue(of([])),
//     getFichaResumo:     vi.fn().mockReturnValue(of({ pontosAtributoDisponiveis: 10, pontosAptidaoDisponiveis: 5 })),
//     atualizarAtributos: vi.fn().mockReturnValue(of([])),
//     getAptidoes:        vi.fn().mockReturnValue(of([fichaAptidaoResponseMock])),
//     atualizarAptidoes:  vi.fn().mockReturnValue(of([fichaAptidaoResponseMock])),
//   };
// }
//
// function criarConfigApiMock() {
//   return {
//     listGeneros:   vi.fn().mockReturnValue(of([])),
//     listRacas:     vi.fn().mockReturnValue(of([])),
//     listClasses:   vi.fn().mockReturnValue(of([])),
//     listIndoles:   vi.fn().mockReturnValue(of([])),
//     listPresencas: vi.fn().mockReturnValue(of([])),
//     listNiveis:    vi.fn().mockReturnValue(of([])),
//     listAptidoes:  vi.fn().mockReturnValue(of([aptidaoConfigMock])),
//   };
// }
//
// function criarCurrentGameServiceMock(temJogo = true) {
//   return {
//     hasCurrentGame:  () => temJogo,
//     currentGameId:   () => (temJogo ? 10 : null),
//     currentGame:     () => (temJogo ? jogoAtualMock : null),
//     availableGames:  signal([]).asReadonly(),
//     selectGame:      vi.fn(),
//     clearGame:       vi.fn(),
//   };
// }
//
// function criarAuthServiceMock(isMestre = false) {
//   return {
//     isMestre: () => isMestre,
//     currentUser: () => ({ id: '1', name: 'Teste', email: 'teste@teste.com', role: isMestre ? 'MESTRE' : 'JOGADOR' }),
//   };
// }
//
// // ============================================================
// // Template stub para evitar NG0950 em JIT
// // ============================================================
//
// const TEMPLATE_STUB = `
//   <div id="ficha-wizard-stub">
//     @if (carregandoConfigs() || carregandoRascunho()) {
//       <div id="carregando">Carregando...</div>
//     } @else {
//       <div id="conteudo">
//         <span id="passo-atual">{{ passoAtual() }}</span>
//         <button
//           id="btn-proximo"
//           [disabled]="!passoAtualValido() || estadoSalvamento() === 'salvando'"
//           (click)="avancarPasso()"
//         >Proximo</button>
//         <button id="btn-voltar" (click)="voltarPasso()">Voltar</button>
//         <button id="btn-cancelar" (click)="cancelar()">Cancelar</button>
//         <span id="estado-salvamento">{{ estadoSalvamento() }}</span>
//       </div>
//     }
//   </div>
// `;
//
// // ============================================================
// // Helper de render
// // ============================================================
//
// interface RenderOptions {
//   temJogo?: boolean;
//   fichasApiOverride?: Partial<ReturnType<typeof criarFichasApiMock>>;
//   configApiOverride?: Partial<ReturnType<typeof criarConfigApiMock>>;
// }
//
// async function renderWizard(opts: RenderOptions = {}) {
//   const {
//     temJogo = true,
//     fichasApiOverride = {},
//     configApiOverride = {},
//   } = opts;
//
//   const fichasApi = { ...criarFichasApiMock(), ...fichasApiOverride };
//   const configApi = { ...criarConfigApiMock(), ...configApiOverride };
//   const currentGameService = criarCurrentGameServiceMock(temJogo);
//   const authService = criarAuthServiceMock(false);
//
//   const activatedRouteMock = {
//     snapshot: {
//       queryParamMap: convertToParamMap({}),
//       data: {},
//     },
//   };
//
//   const result = await render(FichaWizardComponent, {
//     configureTestBed: (tb) => {
//       tb.overrideTemplate(FichaWizardComponent, TEMPLATE_STUB);
//     },
//     providers: [
//       provideZonelessChangeDetection(),
//       provideRouter(ROTAS_TESTE),
//       { provide: FichasApiService,    useValue: fichasApi },
//       { provide: ConfigApiService,    useValue: configApi },
//       { provide: CurrentGameService,  useValue: currentGameService },
//       { provide: AuthService,         useValue: authService },
//       { provide: ActivatedRoute,      useValue: activatedRouteMock },
//       MessageService,
//     ],
//   });
//
//   return { ...result, fichasApi, configApi, currentGameService, authService };
// }
//
// // ============================================================
// // Testes do Passo 4
// // ============================================================
//
// describe('FichaWizardComponent — Passo 4 (Aptidoes)', () => {
//
//   beforeEach(() => {
//     vi.useFakeTimers();
//   });
//
//   afterEach(() => {
//     vi.runAllTimers();
//     vi.useRealTimers();
//     TestBed.resetTestingModule();
//   });
//
//   // ----------------------------------------------------------
//   // 1. onFormPasso4Changed
//   // ----------------------------------------------------------
//
//   describe('onFormPasso4Changed', () => {
//     it('atualiza formPasso4 quando step emite aptidoesChanged', async () => {
//       const { fixture } = await renderWizard();
//       const comp = fixture.componentInstance;
//
//       const novasAptidoes: FichaAptidaoEditavel[] = [aptidaoEditavelMock];
//       comp.onFormPasso4Changed(novasAptidoes);
//       fixture.detectChanges();
//
//       expect(comp.formPasso4()).toEqual(novasAptidoes);
//     });
//   });
//
//   // ----------------------------------------------------------
//   // 2. Carregamento de aptidoes ao entrar no passo 4
//   // ----------------------------------------------------------
//
//   describe('carregamento de aptidoes ao entrar no passo 4', () => {
//     it('chama getAptidoes, getFichaResumo e listAptidoes com fichaId definido', async () => {
//       const { fixture, fichasApi, configApi } = await renderWizard();
//       const comp = fixture.componentInstance;
//
//       comp.fichaId.set(42);
//       comp.passoAtual.set(4);
//       fixture.detectChanges();
//
//       expect(fichasApi.getAptidoes).toHaveBeenCalledWith(42);
//       expect(fichasApi.getFichaResumo).toHaveBeenCalledWith(42);
//       expect(configApi.listAptidoes).toHaveBeenCalledWith(10);
//     });
//
//     it('popula formPasso4 e pontosAptidaoDisponiveis apos carregamento', async () => {
//       const { fixture } = await renderWizard();
//       const comp = fixture.componentInstance;
//
//       comp.fichaId.set(42);
//       comp.passoAtual.set(4);
//       fixture.detectChanges();
//
//       expect(comp.pontosAptidaoDisponiveis()).toBe(5);
//       expect(comp.formPasso4().length).toBe(1);
//       expect(comp.formPasso4()[0].aptidaoNome).toBe('Espada');
//       expect(comp.formPasso4()[0].tipoAptidaoNome).toBe('Combate');
//     });
//
//     it('nao carrega aptidoes quando fichaId e null', async () => {
//       const { fixture, fichasApi } = await renderWizard();
//       const comp = fixture.componentInstance;
//
//       comp.passoAtual.set(4);
//       fixture.detectChanges();
//
//       expect(fichasApi.getAptidoes).not.toHaveBeenCalled();
//     });
//
//     it('nao recarrega aptidoes se formPasso4 ja tem dados', async () => {
//       const { fixture, fichasApi } = await renderWizard();
//       const comp = fixture.componentInstance;
//
//       comp.formPasso4.set([aptidaoEditavelMock]);
//       comp.fichaId.set(42);
//       comp.passoAtual.set(4);
//       fixture.detectChanges();
//
//       expect(fichasApi.getAptidoes).not.toHaveBeenCalled();
//     });
//
//     it('muda carregandoAptidoes para false quando getAptidoes falha', async () => {
//       const { fixture } = await renderWizard({
//         fichasApiOverride: {
//           getAptidoes: vi.fn().mockReturnValue(throwError(() => new Error('Server error'))),
//         },
//       });
//       const comp = fixture.componentInstance;
//
//       comp.fichaId.set(42);
//       comp.passoAtual.set(4);
//       fixture.detectChanges();
//
//       expect(comp.carregandoAptidoes()).toBe(false);
//     });
//   });
//
//   // ----------------------------------------------------------
//   // 3. Auto-save: avanco do passo 4
//   // ----------------------------------------------------------
//
//   describe('auto-save ao avancar do passo 4', () => {
//     it('avanca para passo 5 sem chamar API quando fichaId e null', async () => {
//       const { fixture, fichasApi } = await renderWizard();
//       const comp = fixture.componentInstance;
//
//       comp.passoAtual.set(4);
//       comp.fichaId.set(null);
//       fixture.detectChanges();
//
//       comp.avancarPasso();
//       fixture.detectChanges();
//
//       expect(comp.passoAtual()).toBe(5);
//       expect(fichasApi.atualizarAptidoes).not.toHaveBeenCalled();
//     });
//
//     it('chama atualizarAptidoes (PUT) com formPasso4 ao avancar do passo 4', async () => {
//       const { fixture, fichasApi } = await renderWizard();
//       const comp = fixture.componentInstance;
//
//       comp.passoAtual.set(4);
//       comp.fichaId.set(42);
//       comp.formPasso4.set([aptidaoEditavelMock]);
//       fixture.detectChanges();
//
//       comp.avancarPasso();
//       fixture.detectChanges();
//
//       expect(fichasApi.atualizarAptidoes).toHaveBeenCalledWith(42, [
//         { aptidaoConfigId: 1, base: 2 },
//       ]);
//     });
//
//     it('avanca para passo 5 apos atualizarAptidoes com sucesso', async () => {
//       const { fixture } = await renderWizard();
//       const comp = fixture.componentInstance;
//
//       comp.passoAtual.set(4);
//       comp.fichaId.set(42);
//       comp.formPasso4.set([aptidaoEditavelMock]);
//       fixture.detectChanges();
//
//       comp.avancarPasso();
//       fixture.detectChanges();
//
//       expect(comp.passoAtual()).toBe(5);
//     });
//
//     it('muda estadoSalvamento para "salvando" durante atualizarAptidoes', async () => {
//       const { Subject } = await import('rxjs');
//       const subject = new Subject<FichaAptidaoResponse[]>();
//
//       const { fixture } = await renderWizard({
//         fichasApiOverride: {
//           atualizarAptidoes: vi.fn().mockReturnValue(subject.asObservable()),
//         },
//       });
//       const comp = fixture.componentInstance;
//
//       comp.passoAtual.set(4);
//       comp.fichaId.set(42);
//       comp.formPasso4.set([aptidaoEditavelMock]);
//       fixture.detectChanges();
//
//       comp.avancarPasso();
//       fixture.detectChanges();
//
//       expect(comp.estadoSalvamento()).toBe('salvando');
//
//       subject.next([fichaAptidaoResponseMock]);
//       subject.complete();
//     });
//
//     it('muda estadoSalvamento para "erro" e nao avanca quando atualizarAptidoes falha', async () => {
//       const { fixture } = await renderWizard({
//         fichasApiOverride: {
//           atualizarAptidoes: vi.fn().mockReturnValue(throwError(() => new Error('Server error'))),
//         },
//       });
//       const comp = fixture.componentInstance;
//
//       comp.passoAtual.set(4);
//       comp.fichaId.set(42);
//       comp.formPasso4.set([aptidaoEditavelMock]);
//       fixture.detectChanges();
//
//       comp.avancarPasso();
//       fixture.detectChanges();
//
//       expect(comp.estadoSalvamento()).toBe('erro');
//       expect(comp.passoAtual()).toBe(4);
//     });
//
//     it('passo 4 sempre pode avancar (passoAtualValido retorna true)', async () => {
//       const { fixture } = await renderWizard();
//       const comp = fixture.componentInstance;
//
//       comp.passoAtual.set(4);
//       fixture.detectChanges();
//
//       expect(comp.passoAtualValido()).toBe(true);
//     });
//   });
//
//   // ----------------------------------------------------------
//   // 4. Computed aptidoesAgrupadas
//   // ----------------------------------------------------------
//
//   describe('computed aptidoesAgrupadas', () => {
//     it('agrupa aptidoes por tipoAptidaoNome', async () => {
//       const { fixture } = await renderWizard();
//       const comp = fixture.componentInstance;
//
//       comp.formPasso4.set([
//         { aptidaoConfigId: 1, aptidaoNome: 'Espada', tipoAptidaoNome: 'Combate', base: 2, sorte: 0, classe: 0 },
//         { aptidaoConfigId: 2, aptidaoNome: 'Arco', tipoAptidaoNome: 'Combate', base: 0, sorte: 0, classe: 0 },
//         { aptidaoConfigId: 3, aptidaoNome: 'Persuasao', tipoAptidaoNome: 'Social', base: 1, sorte: 0, classe: 0 },
//       ]);
//       fixture.detectChanges();
//
//       const grupos = comp.aptidoesAgrupadas();
//       expect(grupos.length).toBe(2);
//       expect(grupos.find((g) => g.tipoNome === 'Combate')?.aptidoes.length).toBe(2);
//       expect(grupos.find((g) => g.tipoNome === 'Social')?.aptidoes.length).toBe(1);
//     });
//
//     it('retorna array vazio quando formPasso4 esta vazio', async () => {
//       const { fixture } = await renderWizard();
//       const comp = fixture.componentInstance;
//
//       expect(comp.aptidoesAgrupadas()).toEqual([]);
//     });
//   });
//
// });

describe('FichaWizardComponent - Passo 4 (Aptidoes)', () => {
  it.todo('reativar a suite do passo 4 quando a migracao JIT for concluida');
});
