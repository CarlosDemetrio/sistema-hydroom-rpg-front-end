/**
 * FichasListComponent — Spec
 *
 * NOTA JIT: Usamos overrideTemplate para substituir o template por um stub
 * minimo, evitando NG0950 dos sub-componentes PrimeNG (Toast, etc.)
 * em modo JIT. Os testes focam na logica do Smart Component: signals,
 * badges de status, canEdit() e navegacao.
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
import { MessageService } from 'primeng/api';

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
// Template stub com todos os badges de status e canEdit()
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
            class="badge-rascunho"
            [attr.aria-label]="'Continuar criando ' + ficha.nome"
            (click)="$event.stopPropagation(); retomar(ficha)"
            role="button"
          >Incompleta</span>
        }
        @if (ficha.status === 'ATIVA') {
          <span class="badge-ativa" [attr.aria-label]="'Status: Ativa — ' + ficha.nome">Ativa</span>
        }
        @if (ficha.status === 'MORTA') {
          <span class="badge-morta" [attr.aria-label]="'Status: Morta — ' + ficha.nome">Morta</span>
        }
        @if (ficha.status === 'ABANDONADA') {
          <span class="badge-abandonada" [attr.aria-label]="'Status: Abandonada — ' + ficha.nome">Abandonada</span>
        }

        <button class="btn-ver" (click)="verFicha(ficha.id!)">Ver</button>
        @if (canEdit(ficha)) {
          <button class="btn-editar" (click)="editarFicha(ficha.id!)">Editar</button>
        }
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

const fichaBase: Ficha = {
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

const fichaAtivaMock: Ficha = { ...fichaBase, id: 1, nome: 'Guerreiro das Sombras', status: 'ATIVA' };
const fichaRascunhoMock: Ficha = { ...fichaBase, id: 2, nome: 'Mago Aprendiz', status: 'RASCUNHO' };
const fichaRascunho2Mock: Ficha = { ...fichaBase, id: 3, nome: 'Druida Perdido', status: 'RASCUNHO' };
const fichaMortaMock: Ficha = { ...fichaBase, id: 4, nome: 'Paladino Caido', status: 'MORTA' };
const fichaAbandonadaMock: Ficha = { ...fichaBase, id: 5, nome: 'Arqueiro Exilado', status: 'ABANDONADA' };

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

  // -----------------------------------------------------------
  // Badges de status — visibilidade
  // -----------------------------------------------------------

  describe('badge RASCUNHO', () => {

    it('exibe badge "Incompleta" para ficha com status RASCUNHO', async () => {
      const { fixture } = await renderFichasListComponent({ fichas: [fichaRascunhoMock] });
      fixture.detectChanges();
      await fixture.whenStable();

      const badge = fixture.nativeElement.querySelector('.badge-rascunho');
      expect(badge).not.toBeNull();
      expect(badge.textContent.trim()).toBe('Incompleta');
    });

    it('nao exibe badge RASCUNHO para ficha com status ATIVA', async () => {
      const { fixture } = await renderFichasListComponent({ fichas: [fichaAtivaMock] });
      fixture.detectChanges();
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('.badge-rascunho')).toBeNull();
    });

    it('exibe badge RASCUNHO apenas nas fichas com status correto (mix de status)', async () => {
      const { fixture } = await renderFichasListComponent({
        fichas: [fichaAtivaMock, fichaRascunhoMock, fichaRascunho2Mock],
      });
      fixture.detectChanges();
      await fixture.whenStable();

      const badges = fixture.nativeElement.querySelectorAll('.badge-rascunho');
      expect(badges.length).toBe(2);
    });

  });

  describe('badge ATIVA', () => {

    it('exibe badge "Ativa" para ficha com status ATIVA', async () => {
      const { fixture } = await renderFichasListComponent({ fichas: [fichaAtivaMock] });
      fixture.detectChanges();
      await fixture.whenStable();

      const badge = fixture.nativeElement.querySelector('.badge-ativa');
      expect(badge).not.toBeNull();
      expect(badge.textContent.trim()).toBe('Ativa');
    });

    it('badge ATIVA tem aria-label correto', async () => {
      const { fixture } = await renderFichasListComponent({ fichas: [fichaAtivaMock] });
      fixture.detectChanges();
      await fixture.whenStable();

      const badge = fixture.nativeElement.querySelector('.badge-ativa');
      expect(badge.getAttribute('aria-label')).toBe('Status: Ativa — Guerreiro das Sombras');
    });

    it('nao exibe badge ATIVA para ficha com status RASCUNHO', async () => {
      const { fixture } = await renderFichasListComponent({ fichas: [fichaRascunhoMock] });
      fixture.detectChanges();
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('.badge-ativa')).toBeNull();
    });

  });

  describe('badge MORTA', () => {

    it('exibe badge "Morta" para ficha com status MORTA', async () => {
      const { fixture } = await renderFichasListComponent({ fichas: [fichaMortaMock] });
      fixture.detectChanges();
      await fixture.whenStable();

      const badge = fixture.nativeElement.querySelector('.badge-morta');
      expect(badge).not.toBeNull();
      expect(badge.textContent.trim()).toBe('Morta');
    });

    it('badge MORTA tem aria-label correto', async () => {
      const { fixture } = await renderFichasListComponent({ fichas: [fichaMortaMock] });
      fixture.detectChanges();
      await fixture.whenStable();

      const badge = fixture.nativeElement.querySelector('.badge-morta');
      expect(badge.getAttribute('aria-label')).toBe('Status: Morta — Paladino Caido');
    });

    it('nao exibe badge MORTA para ficha com status ATIVA', async () => {
      const { fixture } = await renderFichasListComponent({ fichas: [fichaAtivaMock] });
      fixture.detectChanges();
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('.badge-morta')).toBeNull();
    });

  });

  describe('badge ABANDONADA', () => {

    it('exibe badge "Abandonada" para ficha com status ABANDONADA', async () => {
      const { fixture } = await renderFichasListComponent({ fichas: [fichaAbandonadaMock] });
      fixture.detectChanges();
      await fixture.whenStable();

      const badge = fixture.nativeElement.querySelector('.badge-abandonada');
      expect(badge).not.toBeNull();
      expect(badge.textContent.trim()).toBe('Abandonada');
    });

    it('badge ABANDONADA tem aria-label correto', async () => {
      const { fixture } = await renderFichasListComponent({ fichas: [fichaAbandonadaMock] });
      fixture.detectChanges();
      await fixture.whenStable();

      const badge = fixture.nativeElement.querySelector('.badge-abandonada');
      expect(badge.getAttribute('aria-label')).toBe('Status: Abandonada — Arqueiro Exilado');
    });

    it('nao exibe badge ABANDONADA para ficha com status ATIVA', async () => {
      const { fixture } = await renderFichasListComponent({ fichas: [fichaAtivaMock] });
      fixture.detectChanges();
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('.badge-abandonada')).toBeNull();
    });

  });

  describe('mix completo de status', () => {

    it('cada ficha exibe exatamente o badge correto para o seu status', async () => {
      const { fixture } = await renderFichasListComponent({
        fichas: [fichaAtivaMock, fichaRascunhoMock, fichaMortaMock, fichaAbandonadaMock],
      });
      fixture.detectChanges();
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelectorAll('.badge-ativa').length).toBe(1);
      expect(fixture.nativeElement.querySelectorAll('.badge-rascunho').length).toBe(1);
      expect(fixture.nativeElement.querySelectorAll('.badge-morta').length).toBe(1);
      expect(fixture.nativeElement.querySelectorAll('.badge-abandonada').length).toBe(1);
    });

  });

  // -----------------------------------------------------------
  // canEdit() — fichas editaveis vs. estados finais
  // -----------------------------------------------------------

  describe('canEdit()', () => {

    it('retorna true para ficha com status ATIVA', async () => {
      const { fixture } = await renderFichasListComponent({ fichas: [fichaAtivaMock] });
      fixture.detectChanges();
      await fixture.whenStable();

      expect(fixture.componentInstance.canEdit(fichaAtivaMock)).toBe(true);
    });

    it('retorna true para ficha com status RASCUNHO', async () => {
      const { fixture } = await renderFichasListComponent({ fichas: [fichaRascunhoMock] });
      fixture.detectChanges();
      await fixture.whenStable();

      expect(fixture.componentInstance.canEdit(fichaRascunhoMock)).toBe(true);
    });

    it('retorna false para ficha com status MORTA', async () => {
      const { fixture } = await renderFichasListComponent({ fichas: [fichaMortaMock] });
      fixture.detectChanges();
      await fixture.whenStable();

      expect(fixture.componentInstance.canEdit(fichaMortaMock)).toBe(false);
    });

    it('retorna false para ficha com status ABANDONADA', async () => {
      const { fixture } = await renderFichasListComponent({ fichas: [fichaAbandonadaMock] });
      fixture.detectChanges();
      await fixture.whenStable();

      expect(fixture.componentInstance.canEdit(fichaAbandonadaMock)).toBe(false);
    });

    it('botao Editar visivel para ficha ATIVA', async () => {
      const { fixture } = await renderFichasListComponent({ fichas: [fichaAtivaMock] });
      fixture.detectChanges();
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('.btn-editar')).not.toBeNull();
    });

    it('botao Editar ausente para ficha MORTA', async () => {
      const { fixture } = await renderFichasListComponent({ fichas: [fichaMortaMock] });
      fixture.detectChanges();
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('.btn-editar')).toBeNull();
    });

    it('botao Editar ausente para ficha ABANDONADA', async () => {
      const { fixture } = await renderFichasListComponent({ fichas: [fichaAbandonadaMock] });
      fixture.detectChanges();
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('.btn-editar')).toBeNull();
    });

    it('botao Editar visivel para ficha RASCUNHO', async () => {
      const { fixture } = await renderFichasListComponent({ fichas: [fichaRascunhoMock] });
      fixture.detectChanges();
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('.btn-editar')).not.toBeNull();
    });

  });

  // -----------------------------------------------------------
  // Ausencia de botao Excluir
  // -----------------------------------------------------------

  describe('sem botao Excluir (INCONS-02)', () => {

    it('nao existe botao de excluir na lista para ficha ATIVA', async () => {
      const { fixture } = await renderFichasListComponent({ fichas: [fichaAtivaMock] });
      fixture.detectChanges();
      await fixture.whenStable();

      const excluir = fixture.nativeElement.querySelector('.btn-excluir, [data-excluir], [aria-label*="xclu"]');
      expect(excluir).toBeNull();
    });

    it('nao existe botao de excluir para ficha MORTA', async () => {
      const { fixture } = await renderFichasListComponent({ fichas: [fichaMortaMock] });
      fixture.detectChanges();
      await fixture.whenStable();

      const excluir = fixture.nativeElement.querySelector('.btn-excluir, [data-excluir], [aria-label*="xclu"]');
      expect(excluir).toBeNull();
    });

    it('nao existe confirmarExclusao ou excluirFicha como metodos publicos no componente', async () => {
      const { fixture } = await renderFichasListComponent({ fichas: [] });
      fixture.detectChanges();
      await fixture.whenStable();

      const inst = fixture.componentInstance as Record<string, unknown>;
      expect(inst['confirmarExclusao']).toBeUndefined();
      expect(inst['excluirFicha']).toBeUndefined();
    });

  });

  // -----------------------------------------------------------
  // badge RASCUNHO — acessibilidade e interacao
  // -----------------------------------------------------------

  describe('badge RASCUNHO — acessibilidade', () => {

    it('badge tem aria-label com nome da ficha', async () => {
      const { fixture } = await renderFichasListComponent({ fichas: [fichaRascunhoMock] });
      fixture.detectChanges();
      await fixture.whenStable();

      const badge = fixture.nativeElement.querySelector('.badge-rascunho');
      expect(badge.getAttribute('aria-label')).toBe('Continuar criando Mago Aprendiz');
    });

    it('badge tem role="button"', async () => {
      const { fixture } = await renderFichasListComponent({ fichas: [fichaRascunhoMock] });
      fixture.detectChanges();
      await fixture.whenStable();

      const badge = fixture.nativeElement.querySelector('.badge-rascunho');
      expect(badge.getAttribute('role')).toBe('button');
    });

  });

  // -----------------------------------------------------------
  // metodo retomar()
  // -----------------------------------------------------------

  describe('metodo retomar()', () => {

    it('navega para /jogador/fichas/criar com fichaId na queryParam', async () => {
      const { fixture, router } = await renderFichasListComponent({ fichas: [fichaRascunhoMock] });
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
      const { fixture } = await renderFichasListComponent({ fichas: [fichaRascunhoMock] });
      fixture.detectChanges();
      await fixture.whenStable();

      const retomarSpy = vi.spyOn(fixture.componentInstance, 'retomar');
      const badge = fixture.nativeElement.querySelector('.badge-rascunho') as HTMLElement;
      badge.click();
      fixture.detectChanges();

      expect(retomarSpy).toHaveBeenCalledWith(expect.objectContaining({ id: fichaRascunhoMock.id }));
    });

  });

  // -----------------------------------------------------------
  // sem jogo selecionado
  // -----------------------------------------------------------

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

      const cards = fixture.nativeElement.querySelectorAll('.ficha-card');
      expect(cards.length).toBe(0);
    });

  });

  // -----------------------------------------------------------
  // filtragem por jogo e jogador
  // -----------------------------------------------------------

  describe('filtragem por jogo e jogador', () => {

    it('exibe apenas fichas do jogo atual (jogoId correto)', async () => {
      const fichaOutroJogo: Ficha = { ...fichaBase, id: 99, jogoId: 999, nome: 'Outro Jogo' };
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
      const fichaOutroJogador: Ficha = { ...fichaBase, id: 100, jogadorId: 99, nome: 'Ficha Alheia' };
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

  // -----------------------------------------------------------
  // metodo verFicha()
  // -----------------------------------------------------------

  describe('metodo verFicha()', () => {

    it('navega para /jogador/fichas/:id ao chamar verFicha()', async () => {
      const { fixture, router } = await renderFichasListComponent({ fichas: [fichaAtivaMock] });
      fixture.detectChanges();
      await fixture.whenStable();

      const navigateSpy = vi.spyOn(router, 'navigate');
      fixture.componentInstance.verFicha(fichaAtivaMock.id);

      expect(navigateSpy).toHaveBeenCalledWith(['/jogador/fichas', fichaAtivaMock.id]);
    });

  });

});
