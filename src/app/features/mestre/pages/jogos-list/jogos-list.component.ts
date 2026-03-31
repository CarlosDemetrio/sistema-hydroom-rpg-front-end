import { Component, inject, computed, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, SlicePipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ToastService } from '../../../../services/toast.service';
import { JogoManagementFacadeService } from '../../services/jogo-management-facade.service';
import { JogoResumo } from '../../../../core/models/jogo.model';
type Jogo = JogoResumo;
import { EmptyStateComponent, LoadingSpinnerComponent } from '../../../../shared';

/**
 * Jogos List Component (Mestre)
 *
 * Lista todos os jogos criados pelo mestre com filtros e busca
 * SMART COMPONENT - usa JogoManagementFacadeService
 */
@Component({
  selector: 'app-jogos-list',
  standalone: true,
  imports: [
    DatePipe,
    SlicePipe,
    FormsModule,
    TableModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TagModule,
    TooltipModule,
    ConfirmDialogModule,
    EmptyStateComponent,
    LoadingSpinnerComponent
  ],
  providers: [ConfirmationService],
  template: `
    <div class="p-4">
      <div class="flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="text-3xl font-bold m-0 mb-2">Meus Jogos</h1>
          <p class="text-color-secondary m-0">Gerencie suas campanhas e jogos</p>
        </div>
        <p-button
          label="Novo Jogo"
          icon="pi pi-plus"
          (onClick)="criarJogo()"
        ></p-button>
      </div>

      <p-card>
        <!-- Filters -->
        <div class="grid mb-4">
          <div class="col-12 md:col-6">
            <span class="p-input-icon-left w-full">
              <i class="pi pi-search"></i>
              <input
                pInputText
                type="text"
                [(ngModel)]="searchTerm"
                placeholder="Buscar por nome ou descrição..."
                class="w-full"
              />
            </span>
          </div>

          <div class="col-12 md:col-3">
            <p-select
              [(ngModel)]="statusFilter"
              [options]="statusOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Todos os Status"
              class="w-full"
            ></p-select>
          </div>

          <div class="col-12 md:col-3">
            <p-button
              label="Limpar Filtros"
              icon="pi pi-filter-slash"
              [outlined]="true"
              (onClick)="limparFiltros()"
              class="w-full"
            ></p-button>
          </div>
        </div>

        <!-- Loading State -->
        @if (loading()) {
          <app-loading-spinner message="Carregando jogos..."></app-loading-spinner>
        } @else if (jogosFiltrados().length === 0 && !searchTerm() && !statusFilter()) {
          <app-empty-state
            icon="pi-book"
            message="Nenhum jogo criado"
            description="Crie seu primeiro jogo para começar a aventura!"
          ></app-empty-state>
        } @else if (jogosFiltrados().length === 0) {
          <app-empty-state
            icon="pi-search"
            message="Nenhum resultado encontrado"
            description="Tente ajustar os filtros de busca"
          ></app-empty-state>
        } @else {
          <p-table
            [value]="jogosFiltrados()"
            [rowHover]="true"
            [paginator]="true"
            [rows]="10"
            [rowsPerPageOptions]="[5, 10, 20]"
          >
            <ng-template #header>
              <tr>
                <th>Nome</th>
                <th>Participantes</th>
                <th>Status</th>
                <th>Data Criação</th>
                <th class="text-center">Ações</th>
              </tr>
            </ng-template>

            <ng-template #body let-jogo>
              <tr>
                <td>
                  <div class="font-bold">{{ jogo.nome }}</div>
                  @if (jogo.descricao) {
                    <div class="text-sm text-color-secondary">
                      {{ jogo.descricao | slice:0:50 }}{{ jogo.descricao.length > 50 ? '...' : '' }}
                    </div>
                  }
                </td>
                <td>
                  <span class="font-semibold">{{ jogo.totalParticipantes || 0 }}</span> jogadores
                </td>
                <td>
                  <p-tag
                    [value]="jogo.ativo ? 'Ativo' : 'Inativo'"
                    [severity]="jogo.ativo ? 'success' : 'secondary'"
                  ></p-tag>
                </td>
                <td>—</td>
                <td class="text-center">
                  <div class="flex gap-2 justify-content-center">
                    <p-button
                      icon="pi pi-eye"
                      [rounded]="true"
                      [text]="true"
                      (onClick)="verJogo(jogo.id!)"
                      pTooltip="Ver Detalhes"
                    ></p-button>
                    <p-button
                      icon="pi pi-pencil"
                      [rounded]="true"
                      [text]="true"
                      [severity]="'secondary'"
                      (onClick)="editarJogo(jogo.id!)"
                      pTooltip="Editar"
                    ></p-button>
                    <p-button
                      icon="pi pi-trash"
                      [rounded]="true"
                      [text]="true"
                      [severity]="'danger'"
                      (onClick)="confirmarExclusao(jogo)"
                      pTooltip="Excluir"
                    ></p-button>
                  </div>
                </td>
              </tr>
            </ng-template>

            <ng-template #emptymessage>
              <tr>
                <td colspan="5" class="text-center p-4">
                  Nenhum jogo encontrado
                </td>
              </tr>
            </ng-template>
          </p-table>
        }
      </p-card>
    </div>

    <p-confirmDialog></p-confirmDialog>
  `
})
export class JogosListComponent {
  private jogoFacade = inject(JogoManagementFacadeService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private toastService = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  // Filters
  searchTerm = signal('');
  statusFilter = signal<string>('');

  statusOptions = [
    { label: 'Todos', value: '' },
    { label: 'Ativo', value: 'ATIVO' },
    { label: 'Inativo', value: 'INATIVO' }
  ];

  // State
  jogos = this.jogoFacade.jogos;
  loading = this.jogoFacade.loading;

  // Computed filtered list
  jogosFiltrados = computed(() => {
    let jogos = this.jogoFacade.jogos();

    // Filter by search term
    const search = this.searchTerm().toLowerCase();
    if (search) {
      jogos = jogos.filter(j =>
        j.nome.toLowerCase().includes(search) ||
        j.descricao?.toLowerCase().includes(search)
      );
    }

    // Filter by status
    const status = this.statusFilter();
    if (status === 'ATIVO') {
      jogos = jogos.filter(j => j.ativo === true);
    } else if (status === 'INATIVO') {
      jogos = jogos.filter(j => j.ativo === false);
    }

    return jogos;
  });

  // Load data on init
  constructor() {
    this.jogoFacade.loadJogos().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  // Navigation methods
  criarJogo() {
    this.router.navigate(['/mestre/jogos/novo']);
  }

  verJogo(id: number) {
    this.router.navigate(['/mestre/jogos', id]);
  }

  editarJogo(id: number) {
    this.router.navigate(['/mestre/jogos', id, 'edit']);
  }

  limparFiltros() {
    this.searchTerm.set('');
    this.statusFilter.set('');
  }

  // Delete confirmation
  confirmarExclusao(jogo: Jogo) {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir o jogo "${jogo.nome}"? Esta ação não pode ser desfeita.`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.excluirJogo(jogo.id!);
      }
    });
  }

  excluirJogo(id: number) {
    this.jogoFacade.deleteJogo(id).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.toastService.success('Jogo excluído com sucesso');
      },
      error: () => {
        this.toastService.error('Erro ao excluir jogo');
      }
    });
  }

}
