import { Component, inject, computed, signal, DestroyRef, effect } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { FichaBusinessService } from '../../../../core/services/business/ficha-business.service';
import { CurrentGameService } from '../../../../core/services/current-game.service';
import { AuthService } from '../../../../services/auth.service';
import { Ficha } from '../../../../core/models';
import { EmptyStateComponent, LoadingSpinnerComponent } from '../../../../shared';

/**
 * Fichas List Component (Jogador)
 *
 * 🎯 CORE - Lista de fichas do jogo atual
 *
 * Features:
 * - Mostra apenas fichas do jogo selecionado
 * - Busca por nome
 * - Ver/Editar/Excluir fichas
 * - Empty state se não houver fichas
 */
@Component({
  selector: 'app-fichas-list',
  standalone: true,
  imports: [
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    ConfirmDialogModule,
    ToastModule,
    EmptyStateComponent,
    LoadingSpinnerComponent
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <div class="p-4">
      <!-- Header -->
      <div class="flex flex-column md:flex-row justify-content-between align-items-start md:align-items-center mb-4 gap-3">
        <div>
          <h1 class="text-3xl font-bold m-0 mb-2">Minhas Fichas</h1>
          @if (currentGame()) {
            <p class="text-color-secondary m-0">
              Jogo: <span class="font-semibold">{{ currentGame()!.nome }}</span>
            </p>
          }
        </div>
        <p-button
          label="Nova Ficha"
          icon="pi pi-plus"
          (onClick)="criarFicha()"
        ></p-button>
      </div>

      <!-- Search Bar -->
      <div class="mb-4">
        <span class="p-input-icon-left w-full md:w-20rem">
          <i class="pi pi-search"></i>
          <input
            type="text"
            pInputText
            [(ngModel)]="searchTerm"
            placeholder="Buscar por nome..."
            class="w-full"
          />
        </span>
      </div>

      <!-- Loading State -->
      @if (fichaService.loading()) {
        <app-loading-spinner message="Carregando fichas..."></app-loading-spinner>
      } @else if (!hasGame()) {
        <!-- No Game Selected -->
        <app-empty-state
          icon="pi-info-circle"
          message="Nenhum jogo selecionado"
          description="Selecione um jogo no menu superior para ver suas fichas"
        ></app-empty-state>
      } @else if (fichasFiltradas().length === 0 && !searchTerm()) {
        <!-- No Fichas -->
        <app-empty-state
          icon="pi-inbox"
          message="Nenhuma ficha neste jogo"
          description="Crie sua primeira ficha para começar a jogar!"
        >
          <p-button
            label="Criar Primeira Ficha"
            icon="pi pi-plus"
            (onClick)="criarFicha()"
          ></p-button>
        </app-empty-state>
      } @else if (fichasFiltradas().length === 0 && searchTerm()) {
        <!-- No Search Results -->
        <app-empty-state
          icon="pi-search"
          message="Nenhuma ficha encontrada"
          [description]="'Nenhuma ficha com nome contendo: ' + searchTerm()"
        >
          <p-button
            label="Limpar Busca"
            icon="pi pi-times"
            [text]="true"
            (onClick)="limparBusca()"
          ></p-button>
        </app-empty-state>
      } @else {
        <!-- Fichas Grid -->
        <div class="grid">
          @for (ficha of fichasFiltradas(); track ficha.id) {
            <div class="col-12 md:col-6 lg:col-4">
              <p-card>
                <div class="flex flex-column gap-3">
                  <!-- Header -->
                  <div class="flex justify-content-between align-items-start">
                    <div class="flex-1">
                      <h3 class="font-bold text-xl m-0 mb-1">{{ ficha.nome }}</h3>
                      @if (ficha.identificacao) {
                        <p class="text-sm text-color-secondary m-0">
                          {{ ficha.identificacao.origem || 'Origem não definida' }}
                        </p>
                      }
                    </div>
                    @if (ficha.progressao) {
                      <p-tag
                        [value]="'Nível ' + ficha.progressao.nivel"
                        severity="info"
                      ></p-tag>
                    }
                  </div>

                  <!-- Stats Preview -->
                  @if (ficha.progressao || ficha.calculados) {
                    <div class="flex gap-3 text-sm">
                      @if (ficha.progressao) {
                        <div>
                          <i class="pi pi-star text-yellow-500 mr-1"></i>
                          <span>XP: {{ ficha.progressao.experiencia || 0 }}</span>
                        </div>
                      }
                      @if (ficha.calculados) {
                        <div>
                          <i class="pi pi-bolt text-orange-500 mr-1"></i>
                          <span>Ímpeto {{ ficha.calculados.impeto || 0 }}</span>
                        </div>
                      }
                    </div>
                  }

                  <!-- Actions -->
                  <div class="flex gap-2">
                    <p-button
                      label="Ver"
                      icon="pi pi-eye"
                      [text]="true"
                      class="flex-1"
                      (onClick)="verFicha(ficha.id!)"
                    ></p-button>
                    <p-button
                      label="Editar"
                      icon="pi pi-pencil"
                      [text]="true"
                      severity="secondary"
                      class="flex-1"
                      (onClick)="editarFicha(ficha.id!)"
                    ></p-button>
                    <p-button
                      icon="pi pi-trash"
                      [text]="true"
                      severity="danger"
                      (onClick)="confirmarExclusao(ficha)"
                    ></p-button>
                  </div>
                </div>
              </p-card>
            </div>
          }
        </div>
      }
    </div>

    <p-confirmDialog></p-confirmDialog>
    <p-toast></p-toast>
  `
})
export class FichasListComponent {
  fichaService = inject(FichaBusinessService);
  private currentGameService = inject(CurrentGameService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private destroyRef = inject(DestroyRef);

  // Search
  searchTerm = signal('');

  // Current game
  currentGame = this.currentGameService.currentGame;
  hasGame = this.currentGameService.hasCurrentGame;

  // Fichas do jogo atual
  fichasDoJogo = computed(() => {
    const gameId = this.currentGameService.currentGameId();
    if (!gameId) return [];

    const userId = this.authService.currentUser()?.id;
    if (!userId) return [];

    return this.fichaService.fichas().filter(f =>
      f.jogoId === gameId &&
      f.jogadorId === Number(userId)
    );
  });

  // Fichas filtradas por busca
  fichasFiltradas = computed(() => {
    const fichas = this.fichasDoJogo();
    const search = this.searchTerm().toLowerCase();

    if (!search) return fichas;

    return fichas.filter(f =>
      f.nome.toLowerCase().includes(search)
    );
  });

  constructor() {
    effect(() => {
      this.fichaService.loadFichas().pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe();
    });
  }

  // Navigation
  criarFicha() {
    this.router.navigate(['/jogador/fichas/nova']);
  }

  verFicha(id: number) {
    this.router.navigate(['/jogador/fichas', id]);
  }

  editarFicha(id: number) {
    this.router.navigate(['/jogador/fichas', id, 'edit']);
  }

  // Search
  limparBusca() {
    this.searchTerm.set('');
  }

  // Delete
  confirmarExclusao(ficha: Ficha) {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir a ficha "${ficha.nome}"? Esta ação não pode ser desfeita.`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.excluirFicha(ficha.id!);
      }
    });
  }

  excluirFicha(id: number) {
    this.fichaService.deleteFicha(id).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Ficha excluída com sucesso'
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao excluir ficha'
        });
      }
    });
  }
}

