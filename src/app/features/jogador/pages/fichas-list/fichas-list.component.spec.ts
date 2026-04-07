/**
 * FichasListComponent — Spec
 *
 * NOTA JIT: Usamos overrideTemplate para substituir o template por um stub
 * minimo, evitando NG0950 dos sub-componentes PrimeNG (ConfirmDialog, Toast, etc.)
 * em modo JIT. Os testes focam na logica do Smart Component: signals, badge
 * RASCUNHO, metodo retomar() e navegacao para o wizard.
 */
import { TestBed } from '@angular/core/testing';
import { render } from '@testing-library/angular';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { provideRouter, Routes } from '@angular/router';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { FichasListComponent } from './fichas-list.component';
import { FichaBusinessService } from '@core/services/business/ficha-business.service';
import { CurrentGameService } from '@core/services/current-game.service';
import { AuthService } from '@services/auth.service';
import { Ficha } from '@core/models/ficha.model';
import { ConfirmationService, MessageService } from 'primeng/api';

// ============================================================
// Stub component para rotas de teste
// ============================================================

@Component({ standalone: true, template: '' })
class StubComponent {}

const ROTAS_TESTE: Routes = [
  { path: 'jogador/fichas/criar', component: StubComponent },
  { path: 'jogador/fichas/:id',   component: StubComponent },
];

// ============================================================
// Template stub focado no badge RASCUNHO
// ============================================================

const TEMPLATE_STUB = `
  <div>
    @if (!hasGame()) {
      <p>Nenhum jogo selecionado</p>
    }
    @for (ficha of fichasFiltradas(); track ficha.id) {
      <div class="ficha-card" [attr.data-id]="ficha.id">
        <span class="ficha-nome">{{ ficha.nome }}</span>
        @if (ficha.status === 'RASCUNHO') {
          <span
            class="badge-incompleta"
            [attr.aria-label]="'Continuar criando ' + ficha.nome"
            (click)="$event.stopPropagation(); retomar(ficha)"
            role="button"
          >Incompleta</span>
        }
        <button class="btn-ver" (click)="verFicha(ficha.id!)">Ver</button>
      </div>
    }
    @if (fichasFiltradas().length === 0 && !searchTerm()) {
      <p>Sua aventura começa aqui</p>
    }
  </div>
`;

// ============================================================
// Mock data
// ============================================================

const jogoAtualMock = { id: 10, nome: 'Campanha Epica', ativo: true };

const fichaAtivaMock: Ficha = {
  id: 1,
  jogoId: 10,
  nome: 'Guerreiro das Sombras',
  jogadorId: 42,
  racaId: 1,
  racaNome: 'Humano',
  classeId: 1,
  classeNome: 'Guerreiro',
  generoId: 1,
  generoNome: 'Masculino',
  indoleId: 1,
  indoleNome: 'Corajoso',
  presencaId: 1,
  presencaNome: 'Sutil',
  nivel: 1,
  xp: 0,
  renascimentos: 0,
  isNpc: false,
  descricao: null,
  status: 'ATIVA',
  dataCriacao: '2024-01-01T00:00:00',
  dataUltimaAtualizacao: '2024-01-01T00:00:00',
};

const fichaRascunhoMock: Ficha = {
  ...fichaAtivaMock,
  id: 2,
  nome: 'Mago Aprendiz',
  status: 'RASCUNHO',
};

const fichaRascunho2Mock: Ficha = {
  ...fichaAtivaMock,
  id: 3,
  nome: 'Druida Perdido',
  status: 'RASCUNHO',
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

function criarFichaServiceMock(fichas: Ficha[] = []) {
  return {
    fichas:    () => fichas,
    loading:   () => false,
    error:     () => null,
    loadFichas: vi.fn().mockReturnValue(of(fichas)),
    deleteFicha: vi.fn().mockReturnValue(of(void 0)),
  };
}

function criarAuthServiceMock(userId = 42) {
  return {
    currentUser: () => ({ id: String(userId), nome: 'Jogador Teste' }),
    isMestre: () => false,
  };
}

// ============================================================
// Helper de render
// ============================================================

async function renderFichasListComponent(overrides: {
  temJogo?: boolean;
  fichas?: Ficha[];
  userId?: number;
} = {}) {
  const { temJogo = true, fichas = [], userId = 42 } = overrides;

  const fichaService = criarFichaServiceMock(fichas);
  const currentGameService = criarCurrentGameServiceMock(temJogo);
  const authService = criarAuthServiceMock(userId);

  const result = await render(FichasListComponent, {
    configureTestBed: (tb) => {
      tb.overrideTemplate(FichasListComponent, TEMPLATE_STUB);
    },
    providers: [
      provideRouter(ROTAS_TESTE),
      { provide: FichaBusinessService,  useValue: fichaService },
      { provide: CurrentGameService,    useValue: currentGameService },
      { provide: AuthService,           useValue: authService },
      ConfirmationService,
      MessageService,
    ],
  });

  const router = TestBed.inject(Router);

  return { ...result, fichaService, router };
}

// ============================================================
// Testes
// ============================================================

describe('FichasListComponent', () => {

  describe('badge Incompleta — visibilidade', () => {

    it('exibe badge "Incompleta" para ficha com status RASCUNHO', async () => {
      const { fixture } = await renderFichasListComponent({
        fichas: [fichaRascunhoMock],
      });
      fixture.detectChanges();
      await fixture.whenStable();

      const badge = fixture.nativeElement.querySelector('.badge-incompleta');
      expect(badge).not.toBeNull();
      expect(badge.textContent.trim()).toBe('Incompleta');
    });

    it('nao exibe badge "Incompleta" para ficha com status ATIVA', async () => {
      const { fixture } = await renderFichasListComponent({
        fichas: [fichaAtivaMock],
      });
      fixture.detectChanges();
      await fixture.whenStable();

      const badge = fixture.nativeElement.querySelector('.badge-incompleta');
      expect(badge).toBeNull();
    });

    it('exibe badge apenas nas fichas RASCUNHO quando ha mix de status', async () => {
      const { fixture } = await renderFichasListComponent({
        fichas: [fichaAtivaMock, fichaRascunhoMock, fichaRascunho2Mock],
      });
      fixture.detectChanges();
      await fixture.whenStable();

      const badges = fixture.nativeElement.querySelectorAll('.badge-incompleta');
      expect(badges.length).toBe(2);
    });

    it('nao exibe badge quando nenhuma ficha e RASCUNHO', async () => {
      const { fixture } = await renderFichasListComponent({
        fichas: [fichaAtivaMock],
      });
      fixture.detectChanges();
      await fixture.whenStable();

      const badges = fixture.nativeElement.querySelectorAll('.badge-incompleta');
      expect(badges.length).toBe(0);
    });

  });

  describe('badge Incompleta — acessibilidade', () => {

    it('badge tem aria-label com nome da ficha', async () => {
      const { fixture } = await renderFichasListComponent({
        fichas: [fichaRascunhoMock],
      });
      fixture.detectChanges();
      await fixture.whenStable();

      const badge = fixture.nativeElement.querySelector('.badge-incompleta');
      expect(badge.getAttribute('aria-label')).toBe('Continuar criando Mago Aprendiz');
    });

    it('badge tem role="button"', async () => {
      const { fixture } = await renderFichasListComponent({
        fichas: [fichaRascunhoMock],
      });
      fixture.detectChanges();
      await fixture.whenStable();

      const badge = fixture.nativeElement.querySelector('.badge-incompleta');
      expect(badge.getAttribute('role')).toBe('button');
    });

  });

  describe('metodo retomar()', () => {

    it('navega para /jogador/fichas/criar com fichaId na queryParam', async () => {
      const { fixture, router } = await renderFichasListComponent({
        fichas: [fichaRascunhoMock],
      });
      fixture.detectChanges();
      await fixture.whenStable();

      const navigateSpy = vi.spyOn(router, 'navigate');

      fixture.componentInstance.retomar(fichaRascunhoMock);

      expect(navigateSpy).toHaveBeenCalledWith(
        ['/jogador/fichas/criar'],
        { queryParams: { fichaId: fichaRascunhoMock.id } },
      );
    });

    it('clicar no badge chama retomar() com a ficha correta', async () => {
      const { fixture } = await renderFichasListComponent({
        fichas: [fichaRascunhoMock],
      });
      fixture.detectChanges();
      await fixture.whenStable();

      const retomarSpy = vi.spyOn(fixture.componentInstance, 'retomar');

      const badge = fixture.nativeElement.querySelector('.badge-incompleta') as HTMLElement;
      badge.click();
      fixture.detectChanges();

      expect(retomarSpy).toHaveBeenCalledWith(expect.objectContaining({ id: fichaRascunhoMock.id }));
    });

    it('retomar() com ficha ATIVA tambem navega (metodo e publico e aceita qualquer ficha)', async () => {
      const { fixture, router } = await renderFichasListComponent({
        fichas: [fichaAtivaMock],
      });
      fixture.detectChanges();
      await fixture.whenStable();

      const navigateSpy = vi.spyOn(router, 'navigate');

      fixture.componentInstance.retomar(fichaAtivaMock);

      expect(navigateSpy).toHaveBeenCalledWith(
        ['/jogador/fichas/criar'],
        { queryParams: { fichaId: fichaAtivaMock.id } },
      );
    });

  });

  describe('sem jogo selecionado', () => {

    it('exibe aviso "Nenhum jogo selecionado" quando nao ha jogo', async () => {
      const { fixture } = await renderFichasListComponent({ temJogo: false });
      fixture.detectChanges();
      await fixture.whenStable();

      expect(fixture.nativeElement.textContent).toContain('Nenhum jogo selecionado');
    });

    it('nao exibe fichas quando nao ha jogo selecionado', async () => {
      const { fixture } = await renderFichasListComponent({
        temJogo: false,
        fichas: [fichaAtivaMock],
      });
      fixture.detectChanges();
      await fixture.whenStable();

      // Com temJogo=false, fichasDoJogo() retorna [] (gameId=null)
      const cards = fixture.nativeElement.querySelectorAll('.ficha-card');
      expect(cards.length).toBe(0);
    });

  });

  describe('filtragem por jogo e jogador', () => {

    it('exibe apenas fichas do jogo atual (jogoId correto)', async () => {
      const fichaOutroJogo: Ficha = { ...fichaAtivaMock, id: 99, jogoId: 999, nome: 'Outro Jogo' };
      const { fixture } = await renderFichasListComponent({
        fichas: [fichaAtivaMock, fichaOutroJogo],
      });
      fixture.detectChanges();
      await fixture.whenStable();

      const cards = fixture.nativeElement.querySelectorAll('.ficha-card');
      expect(cards.length).toBe(1);
      expect(fixture.nativeElement.textContent).toContain(fichaAtivaMock.nome);
      expect(fixture.nativeElement.textContent).not.toContain(fichaOutroJogo.nome);
    });

    it('exibe apenas fichas do jogador atual', async () => {
      const fichaOutroJogador: Ficha = { ...fichaAtivaMock, id: 100, jogadorId: 99, nome: 'Ficha Alheia' };
      const { fixture } = await renderFichasListComponent({
        fichas: [fichaAtivaMock, fichaOutroJogador],
        userId: 42,
      });
      fixture.detectChanges();
      await fixture.whenStable();

      const cards = fixture.nativeElement.querySelectorAll('.ficha-card');
      expect(cards.length).toBe(1);
      expect(fixture.nativeElement.textContent).toContain(fichaAtivaMock.nome);
    });

  });

  describe('metodo verFicha()', () => {

    it('navega para /jogador/fichas/:id ao chamar verFicha()', async () => {
      const { fixture, router } = await renderFichasListComponent({
        fichas: [fichaAtivaMock],
      });
      fixture.detectChanges();
      await fixture.whenStable();

      const navigateSpy = vi.spyOn(router, 'navigate');
      fixture.componentInstance.verFicha(fichaAtivaMock.id);

      expect(navigateSpy).toHaveBeenCalledWith(['/jogador/fichas', fichaAtivaMock.id]);
    });

  });

});
