import { Component, inject, computed, signal, DestroyRef, effect } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmationService } from 'primeng/api';
import { FichaBusinessService } from '@core/services/business/ficha-business.service';
import { CurrentGameService } from '@core/services/current-game.service';
import { AuthService } from '@services/auth.service';
import { ToastService } from '@services/toast.service';
import { Ficha } from '@core/models';

@Component({
  selector: 'app-fichas-list',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    TagModule,
    SkeletonModule,
    TooltipModule,
    ConfirmDialogModule,
    IconFieldModule,
    InputIconModule,
  ],
  providers: [ConfirmationService],
  template: `
    <div class="p-4">

      <!-- =========================================
           HEADER
      ========================================= -->
      <div class="flex flex-column md:flex-row justify-content-between align-items-start md:align-items-center mb-5 gap-3">
        <div>
          <h1 class="text-3xl font-bold m-0 mb-1" style="font-family: var(--rpg-font-display)">
            <i class="pi pi-id-card text-primary mr-2"></i>
            Minhas Fichas
          </h1>
          @if (currentGame()) {
            <p class="text-color-secondary m-0">
              Campanha: <span class="font-semibold text-primary">{{ currentGame()!.nome }}</span>
            </p>
          }
        </div>

        <div class="flex align-items-center gap-2">
          <p-icon-field iconPosition="left">
            <p-inputicon class="pi pi-search" />
            <input
              pInputText
              type="text"
              [(ngModel)]="searchTerm"
              placeholder="Buscar fichas..."
              class="w-14rem"
            />
          </p-icon-field>

          <p-button
            label="Nova Ficha"
            icon="pi pi-plus"
            (onClick)="criarFicha()"
            [disabled]="!hasGame()"
          />
        </div>
      </div>

      <!-- =========================================
           SEM JOGO SELECIONADO
      ========================================= -->
      @if (!hasGame()) {
        <div class="flex flex-column align-items-center text-center gap-4 py-6">
          <div class="flex align-items-center justify-content-center border-circle w-8rem h-8rem"
               style="background: rgba(251,191,36,0.1); border: 2px dashed var(--rpg-amber-400);">
            <i class="pi pi-info-circle text-5xl" style="color: var(--rpg-amber-400)"></i>
          </div>
          <div>
            <h3 class="text-xl font-bold m-0 mb-2">Nenhum jogo selecionado</h3>
            <p class="text-color-secondary m-0 max-w-20rem">
              Selecione um jogo no menu superior para acessar suas fichas de personagem.
            </p>
          </div>
        </div>
      }

      <!-- =========================================
           LOADING SKELETON
      ========================================= -->
      @else if (fichaService.loading()) {
        <div class="grid">
          @for (sk of skeletonItems; track sk) {
            <div class="col-12 md:col-6 lg:col-4">
              <p-card class="card-rpg">
                <div class="flex flex-column gap-3">
                  <div class="flex justify-content-between align-items-start">
                    <p-skeleton height="1.5rem" width="70%" />
                    <p-skeleton height="1.5rem" width="5rem" borderRadius="1rem" />
                  </div>
                  <p-skeleton height="1rem" width="50%" />
                  <div class="flex gap-2">
                    <p-skeleton height="1rem" width="4rem" />
                    <p-skeleton height="1rem" width="4rem" />
                    <p-skeleton height="1rem" width="4rem" />
                  </div>
                  <div class="flex gap-2 pt-2">
                    <p-skeleton height="2.5rem" class="flex-1" />
                    <p-skeleton height="2.5rem" class="flex-1" />
                    <p-skeleton height="2.5rem" width="2.5rem" borderRadius="50%" />
                  </div>
                </div>
              </p-card>
            </div>
          }
        </div>
      }

      <!-- =========================================
           EMPTY STATE — sem fichas
      ========================================= -->
      @else if (fichasFiltradas().length === 0 && !searchTerm()) {
        <div class="flex flex-column align-items-center text-center gap-5 py-6">
          <div class="flex align-items-center justify-content-center border-circle w-10rem h-10rem"
               style="background: var(--app-surface-100); border: 2px dashed var(--app-surface-border);">
            <i class="pi pi-id-card text-6xl text-color-secondary"></i>
          </div>
          <div>
            <h3 class="text-2xl font-bold m-0 mb-2" style="font-family: var(--rpg-font-display)">
              Sua aventura começa aqui
            </h3>
            <p class="text-color-secondary m-0 max-w-25rem text-lg">
              Você ainda não tem fichas de personagem neste jogo.
              Crie sua primeira para começar a jogar!
            </p>
          </div>
          <p-button
            label="Criar meu primeiro personagem"
            icon="pi pi-plus"
            size="large"
            (onClick)="criarFicha()"
          />
          <small class="text-color-secondary">
            <i class="pi pi-shield mr-1"></i>
            Personagens são únicos por jogo — você pode ter vários!
          </small>
        </div>
      }

      <!-- =========================================
           EMPTY STATE — busca sem resultado
      ========================================= -->
      @else if (fichasFiltradas().length === 0 && searchTerm()) {
        <div class="flex flex-column align-items-center text-center gap-4 py-5">
          <i class="pi pi-search text-5xl text-color-secondary"></i>
          <div>
            <h3 class="font-bold m-0 mb-1">Nenhuma ficha encontrada</h3>
            <p class="text-color-secondary m-0">Não há fichas com nome contendo "{{ searchTerm() }}"</p>
          </div>
          <p-button
            label="Limpar busca"
            icon="pi pi-times"
            [text]="true"
            (onClick)="searchTerm.set('')"
          />
        </div>
      }

      <!-- =========================================
           GRID DE FICHAS
      ========================================= -->
      @else {
        <div class="grid">
          @for (ficha of fichasFiltradas(); track ficha.id) {
            <div class="col-12 md:col-6 lg:col-4">
              <div class="card-rpg p-4 h-full flex flex-column gap-3 cursor-pointer hover-lift"
                   (click)="verFicha(ficha.id!)">

                <!-- Header da ficha -->
                <div class="flex justify-content-between align-items-start">
                  <div class="flex-1 mr-2">
                    <h3 class="font-bold text-xl m-0 mb-1" style="font-family: var(--rpg-font-display)">
                      {{ ficha.nome }}
                    </h3>
                    @if (ficha.status === 'RASCUNHO') {
                      <p-tag
                        value="Incompleta"
                        severity="warn"
                        [rounded]="true"
                        styleClass="cursor-pointer"
                        pTooltip="Clique para continuar criando este personagem"
                        tooltipPosition="top"
                        (click)="$event.stopPropagation(); retomar(ficha)"
                        role="button"
                        [attr.aria-label]="'Continuar criando ' + ficha.nome"
                      />
                    }
                    <!-- Badge NPC: Aliado (acesso granular concedido) -->
                    @if (ficha.isNpc && ficha.jogadorTemAcessoStats === true) {
                      <p-tag
                        value="Aliado"
                        severity="success"
                        icon="pi pi-check-circle"
                        [rounded]="true"
                        pTooltip="Voce tem acesso aos stats deste NPC"
                        tooltipPosition="top"
                        [attr.aria-label]="'NPC aliado: ' + ficha.nome + ' — voce pode ver os stats'"
                      />
                    }
                    <!-- Badge NPC: stats ocultados (sem acesso granular) -->
                    @if (ficha.isNpc && ficha.jogadorTemAcessoStats === false) {
                      <span
                        class="flex align-items-center gap-1 text-sm text-color-secondary"
                        [attr.aria-label]="'Estatisticas de ' + ficha.nome + ' ocultadas pelo Mestre'"
                        pTooltip="O Mestre nao revelou os stats deste NPC"
                        tooltipPosition="top"
                      >
                        <i class="pi pi-lock" aria-hidden="true"></i>
                        Estatisticas ocultadas
                      </span>
                    }
                  </div>
                  @if (ficha.isNpc) {
                    <p-tag value="NPC" severity="warn" />
                  } @else if (ficha.nivel != null) {
                    <p-tag
                      [value]="'Nv. ' + ficha.nivel"
                      severity="info"
                    />
                  } @else {
                    <p-tag value="Novo" severity="secondary" />
                  }
                </div>

                <!-- Raça / Classe -->
                <div class="flex gap-2 flex-wrap">
                  @if (ficha.racaNome) {
                    <span class="badge-atributo">
                      <i class="pi pi-users mr-1"></i>{{ ficha.racaNome }}
                    </span>
                  }
                  @if (ficha.classeNome) {
                    <span class="badge-atributo">
                      <i class="pi pi-shield mr-1"></i>{{ ficha.classeNome }}
                    </span>
                  }
                </div>

                <!-- Stats resumidos -->
                <div class="flex gap-3 text-sm">
                  <div class="flex align-items-center gap-1">
                    <i class="pi pi-star" style="color: var(--rpg-amber-400)"></i>
                    <span class="valor-numerico--sm">{{ ficha.xp }}</span>
                    <span class="text-color-secondary">XP</span>
                  </div>
                </div>

                <!-- Divisor -->
                <div class="border-top-1 surface-border mt-auto pt-3">
                  <div class="flex gap-2" (click)="$event.stopPropagation()">
                    <!-- NPC com stats revelados: "Ver Ficha Completa" -->
                    @if (ficha.isNpc && ficha.jogadorTemAcessoStats === true) {
                      <p-button
                        label="Ver Ficha Completa"
                        icon="pi pi-eye"
                        [outlined]="true"
                        size="small"
                        class="flex-1"
                        [attr.aria-label]="'Ver ficha completa de ' + ficha.nome"
                        (onClick)="verFicha(ficha.id!)"
                      />
                    }
                    <!-- NPC sem acesso: apenas nome/info básica visível -->
                    @else if (!ficha.isNpc) {
                      <p-button
                        label="Ver Ficha"
                        icon="pi pi-eye"
                        [outlined]="true"
                        size="small"
                        class="flex-1"
                        (onClick)="verFicha(ficha.id!)"
                      />
                    }
                    <p-button
                      label="Editar"
                      icon="pi pi-pencil"
                      severity="secondary"
                      [outlined]="true"
                      size="small"
                      class="flex-1"
                      (onClick)="editarFicha(ficha.id!)"
                    />
                    <p-button
                      icon="pi pi-trash"
                      severity="danger"
                      [text]="true"
                      [rounded]="true"
                      pTooltip="Excluir ficha"
                      (onClick)="confirmarExclusao(ficha)"
                    />
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      }

    </div>

    <p-confirmDialog />
  `,
})
export class FichasListComponent {
  fichaService = inject(FichaBusinessService);
  private currentGameService = inject(CurrentGameService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private toastService = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  searchTerm = signal('');
  readonly skeletonItems = Array.from({ length: 6 }, (_, i) => i);

  currentGame = this.currentGameService.currentGame;
  hasGame = this.currentGameService.hasCurrentGame;

  fichasDoJogo = computed(() => {
    const gameId = this.currentGameService.currentGameId();
    if (!gameId) return [];
    const userId = this.authService.currentUser()?.id;
    if (!userId) return [];
    return this.fichaService.fichas().filter(
      (f) => f.jogoId === gameId && f.jogadorId === Number(userId),
    );
  });

  fichasFiltradas = computed(() => {
    const fichas = this.fichasDoJogo();
    const search = this.searchTerm().toLowerCase().trim();
    if (!search) return fichas;
    return fichas.filter((f) => f.nome.toLowerCase().includes(search));
  });

  constructor() {
    effect(() => {
      const gameId = this.currentGameService.currentGameId();
      if (gameId) {
        this.fichaService.loadFichas(gameId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
      }
    });
  }

  criarFicha(): void {
    this.router.navigate(['/jogador/fichas/nova']);
  }

  retomar(ficha: Ficha): void {
    this.router.navigate(
      ['/jogador/fichas/criar'],
      { queryParams: { fichaId: ficha.id } },
    );
  }

  verFicha(id: number): void {
    this.router.navigate(['/jogador/fichas', id]);
  }

  editarFicha(id: number): void {
    this.router.navigate(['/jogador/fichas', id, 'edit']);
  }

  confirmarExclusao(ficha: Ficha): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir a ficha "${ficha.nome}"? Esta ação não pode ser desfeita.`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.excluirFicha(ficha.id!),
    });
  }

  excluirFicha(id: number): void {
    this.fichaService.deleteFicha(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.toastService.success('Ficha excluída com sucesso');
      },
      error: () => {
        this.toastService.error('Erro ao excluir ficha');
      },
    });
  }
}
