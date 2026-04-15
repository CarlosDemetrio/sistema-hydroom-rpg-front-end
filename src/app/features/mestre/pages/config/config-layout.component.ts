import { Component, ChangeDetectionStrategy, computed, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfigSidebarComponent } from './config-sidebar.component';
import { CurrentGameService } from '@core/services/current-game.service';
import { JogoBusinessService } from '@core/services/business/jogo-business.service';

/**
 * Config Layout Component (SMART Container)
 *
 * Layout principal do módulo de configurações (MESTRE ONLY)
 *
 * Estrutura:
 * ┌──────────────────────────────────────────────┐
 * │  Header (título + seletor de jogo)            │
 * ├─────────────┬──────────────────────────────────┤
 * │  Sidebar    │  Content Area                    │
 * │  (Menu)     │  (router-outlet)                 │
 * └─────────────┴──────────────────────────────────┘
 *
 * Features:
 * - Seletor de jogo proeminente no header — Mestre troca o jogo editado aqui
 * - Sidebar com itens de configuração
 * - Área de conteúdo dinâmica (router-outlet)
 * - Responsive (sidebar collapse em mobile)
 */
@Component({
  selector: 'app-config-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    FormsModule,
    SelectModule,
    TagModule,
    TooltipModule,
    ConfigSidebarComponent,
  ],
  template: `
    <div class="min-h-screen surface-ground">
      <!-- Header com seletor de jogo -->
      <div class="surface-card shadow-2 p-4 mb-4">
        <div class="flex flex-column gap-3">

          <!-- Título -->
          <div>
            <h1 class="text-3xl font-bold m-0 mb-1">
              <i class="pi pi-cog text-primary mr-2"></i>
              Configurações do Sistema
            </h1>
            <p class="text-color-secondary m-0 text-sm">
              Configure as regras e mecânicas do seu jogo
            </p>
          </div>

          <!-- Linha 2: Seletor de jogo — sempre visível -->
          <div class="flex align-items-center gap-3 p-3 border-round-lg border-1 surface-border surface-50">
            <i class="pi pi-book text-primary text-xl flex-shrink-0"></i>

            <div class="flex flex-column gap-1 flex-1">
              <label
                for="config-jogo-select"
                class="text-xs font-semibold uppercase text-color-secondary"
              >
                Jogo sendo configurado
              </label>

              @if (availableGames().length === 0) {
                <span class="text-sm text-color-secondary">
                  Nenhum jogo ativo disponível. Crie um jogo primeiro.
                </span>
              } @else {
                <p-select
                  inputId="config-jogo-select"
                  [options]="availableGames()"
                  optionLabel="nome"
                  optionValue="id"
                  [ngModel]="selectedGameId()"
                  (ngModelChange)="onGameChange($event)"
                  placeholder="Selecione o jogo a configurar"
                  appendTo="body"
                  styleClass="w-full"
                  aria-label="Selecionar jogo para configurar"
                ></p-select>
              }
            </div>

            <!-- Badge de status do jogo selecionado -->
            @if (hasCurrentGame()) {
              <p-tag
                value="Ativo"
                severity="success"
                icon="pi pi-check-circle"
                [rounded]="true"
                pTooltip="Este jogo está ativo e pode ser configurado"
                tooltipPosition="left"
              ></p-tag>
            } @else {
              <p-tag
                value="Sem jogo"
                severity="warn"
                icon="pi pi-exclamation-triangle"
                [rounded]="true"
                pTooltip="Selecione um jogo para habilitar as configurações"
                tooltipPosition="left"
              ></p-tag>
            }
          </div>

        </div>
      </div>

      <!-- Layout Grid -->
      <div class="grid m-0">
        <!-- Sidebar (col-12 em mobile, col-3 em desktop) -->
        <div class="col-12 lg:col-3 xl:col-2 p-0">
          <app-config-sidebar></app-config-sidebar>
        </div>

        <!-- Content Area -->
        <div class="col-12 lg:col-9 xl:col-10 p-4">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
})
export class ConfigLayoutComponent implements OnInit {
  private readonly currentGameService = inject(CurrentGameService);
  private readonly jogoService = inject(JogoBusinessService);

  protected readonly availableGames = this.currentGameService.availableGames;
  protected readonly hasCurrentGame = this.currentGameService.hasCurrentGame;
  protected readonly selectedGameId = computed(() =>
    this.currentGameService.currentGameId()
  );

  ngOnInit(): void {
    // Garante que a lista de jogos está carregada ao entrar nas configs.
    // O header global também carrega, mas este layout é acessado diretamente
    // e precisa ser autossuficiente.
    if (this.availableGames().length === 0) {
      this.jogoService.loadJogos().subscribe({
        next: () => this.currentGameService.reconcileSelection(),
      });
    }
  }

  protected onGameChange(gameId: number | null): void {
    if (gameId === null) {
      this.currentGameService.clearGame();
    } else {
      this.currentGameService.selectGame(gameId);
    }
  }
}
