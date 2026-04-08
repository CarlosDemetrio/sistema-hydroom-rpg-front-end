import { Component, inject, signal, computed, OnInit, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TabsModule } from 'primeng/tabs';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ConfirmationService } from 'primeng/api';
import { JogoManagementFacadeService } from '@features/mestre/services/jogo-management-facade.service';
import { FichaBusinessService } from '@core/services/business/ficha-business.service';
import { ParticipanteBusinessService } from '@core/services/business/participante-business.service';
import { ParticipanteStatus, Participante } from '@core/models';
import { JogosStore } from '@core/stores/jogos.store';
import { EmptyStateComponent } from '@shared/components/empty-state.component';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ToastService } from '@services/toast.service';

type FiltroStatus = 'TODOS' | 'PENDENTE' | 'APROVADO' | 'REJEITADO' | 'BANIDO';

/**
 * Jogo Detail Component
 *
 * Visualização detalhada do jogo com tabs
 * SMART COMPONENT - usa Facades e Business Services
 */
@Component({
  selector: 'app-jogo-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    FormsModule,
    TabsModule,
    CardModule,
    ButtonModule,
    TableModule,
    TagModule,
    TooltipModule,
    ConfirmDialogModule,
    SelectButtonModule,
    EmptyStateComponent,
    LoadingSpinnerComponent,
    PageHeaderComponent,
  ],
  providers: [ConfirmationService],
  template: `
    <div class="p-4">
      @if (jogoFacade.loading()) {
        <app-loading-spinner message="Carregando jogo..."></app-loading-spinner>
      } @else if (!jogo()) {
        <app-empty-state
          icon="pi-exclamation-triangle"
          message="Jogo não encontrado"
          description="O jogo solicitado não existe ou foi removido"
        ></app-empty-state>
      } @else {
        <!-- Header -->
        <div class="flex justify-content-between align-items-center">
          <app-page-header
            [title]="jogo()!.nome"
            backRoute="/mestre/jogos"
          />
          <div class="flex align-items-center gap-3 mb-4">
            <p-tag
              [value]="getStatusLabel(jogo()!.ativo)"
              [severity]="getStatusSeverity(jogo()!.ativo)"
            ></p-tag>
            <span class="text-color-secondary">
              {{ participantes().length }} participantes
            </span>
          </div>
        </div>
        <div class="flex gap-2 mb-4">
          <p-button
            label="Editar"
            icon="pi pi-pencil"
            [outlined]="true"
            (onClick)="editarJogo()"
          ></p-button>
          <p-button
            label="Excluir"
            icon="pi pi-trash"
            [severity]="'danger'"
            [outlined]="true"
            (onClick)="confirmarExclusao()"
          ></p-button>
        </div>

        <!-- Tabs -->
        <p-tabs [value]="activeTabIndex().toString()">
          <p-tablist>
            <p-tab value="0">Informações</p-tab>
            <p-tab value="1">Participantes</p-tab>
            <p-tab value="2">Fichas</p-tab>
          </p-tablist>

          <p-tabpanels>
            <!-- Tab 1: Informações -->
            <p-tabpanel value="0">
              <p-card>
                <div class="grid">
                  <div class="col-12 md:col-6">
                    <h3 class="text-xl font-bold mb-3">Detalhes do Jogo</h3>
                    <div class="flex flex-column gap-3">
                      <div>
                        <span class="font-semibold">Nome:</span>
                        <p class="m-0 mt-1">{{ jogo()!.nome }}</p>
                      </div>

                      @if (jogo()!.descricao) {
                        <div>
                          <span class="font-semibold">Descrição:</span>
                          <p class="m-0 mt-1">{{ jogo()!.descricao }}</p>
                        </div>
                      }

                      <div>
                        <span class="font-semibold">Status:</span>
                        <p class="m-0 mt-1">{{ getStatusLabel(jogo()!.ativo) }}</p>
                      </div>
                    </div>
                  </div>

                  <div class="col-12 md:col-6">
                    <h3 class="text-xl font-bold mb-3">Estatísticas</h3>
                    <div class="flex flex-column gap-3">
                      <div>
                        <span class="font-semibold">Total de Participantes:</span>
                        <p class="m-0 mt-1">{{ participantes().length }}</p>
                      </div>

                      <div>
                        <span class="font-semibold">Aprovados:</span>
                        <p class="m-0 mt-1">{{ participantesAprovados().length }}</p>
                      </div>

                      <div>
                        <span class="font-semibold">Pendentes:</span>
                        <p class="m-0 mt-1">{{ participantesPendentes().length }}</p>
                      </div>

                      <div>
                        <span class="font-semibold">Participantes:</span>
                        <p class="m-0 mt-1">{{ jogo()!.totalParticipantes }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </p-card>
            </p-tabpanel>

            <!-- Tab 2: Participantes -->
            <p-tabpanel value="1">
              <p-card>
                <!-- Filtro por status -->
                <div class="mb-3">
                  <p-selectbutton
                    [options]="opcoesFiltroBotao"
                    [(ngModel)]="filtroStatusModel"
                    optionLabel="label"
                    optionValue="value"
                    aria-label="Filtrar participantes por status"
                  ></p-selectbutton>
                </div>

                @if (participantesFiltrados().length === 0) {
                  <app-empty-state
                    icon="pi-users"
                    message="Nenhum participante"
                    description="Aguarde jogadores solicitarem participação neste jogo"
                  ></app-empty-state>
                } @else {
                  <p-table [value]="participantesFiltrados()" [rowHover]="true">
                    <ng-template #header>
                      <tr>
                        <th>Jogador</th>
                        <th>Status</th>
                        <th>Data</th>
                        <th class="text-center">Ações</th>
                      </tr>
                    </ng-template>

                    <ng-template #body let-participante>
                      <tr>
                        <td>
                          <div class="font-semibold">{{ participante.nomeUsuario || 'Jogador #' + participante.usuarioId }}</div>
                        </td>
                        <td>
                          <p-tag
                            [value]="getParticipanteStatusLabel(participante.status)"
                            [severity]="getParticipanteStatusSeverity(participante.status)"
                          ></p-tag>
                        </td>
                        <td>{{ participante.dataCriacao | date:'dd/MM/yyyy' }}</td>
                        <td class="text-center">
                          <div class="flex gap-2 justify-content-center">
                            @if (participante.status === 'PENDENTE') {
                              <p-button
                                icon="pi pi-check"
                                [rounded]="true"
                                [text]="true"
                                severity="success"
                                pTooltip="Aprovar"
                                (onClick)="aprovarParticipante(participante.id)"
                              ></p-button>
                              <p-button
                                icon="pi pi-times"
                                [rounded]="true"
                                [text]="true"
                                [severity]="'danger'"
                                pTooltip="Rejeitar"
                                (onClick)="rejeitarParticipante(participante.id)"
                              ></p-button>
                            }
                            @if (participante.status === 'APROVADO') {
                              <p-button
                                icon="pi pi-ban"
                                [rounded]="true"
                                [text]="true"
                                [severity]="'danger'"
                                [outlined]="true"
                                pTooltip="Banir"
                                (onClick)="banirParticipante(participante.id)"
                              ></p-button>
                              <p-button
                                icon="pi pi-trash"
                                [rounded]="true"
                                [text]="true"
                                [severity]="'danger'"
                                pTooltip="Remover (provisório)"
                                (onClick)="removerParticipante(participante.id)"
                              ></p-button>
                            }
                            @if (participante.status === 'BANIDO') {
                              <p-button
                                icon="pi pi-check-circle"
                                [rounded]="true"
                                [text]="true"
                                severity="warn"
                                pTooltip="Desbanir"
                                (onClick)="desbanirParticipante(participante.id)"
                              ></p-button>
                            }
                          </div>
                        </td>
                      </tr>
                    </ng-template>
                  </p-table>
                }
              </p-card>
            </p-tabpanel>

            <!-- Tab 3: Fichas -->
            <p-tabpanel value="2">
              <p-card>
                @if (fichasDoJogo().length === 0) {
                  <app-empty-state
                    icon="pi-id-card"
                    message="Nenhuma ficha"
                    description="Ainda não há fichas vinculadas a este jogo"
                  ></app-empty-state>
                } @else {
                  <div class="grid">
                    @for (ficha of fichasDoJogo(); track ficha.id) {
                      <div class="col-12 md:col-6 lg:col-4">
                        <p-card>
                          <div class="flex flex-column gap-2">
                            <h4 class="font-bold text-lg m-0">{{ ficha.nome }}</h4>
                            <span class="text-sm text-color-secondary">Nível {{ ficha.nivel }}</span>
                            <p-button
                              label="Ver Ficha"
                              icon="pi pi-eye"
                              [text]="true"
                              class="w-full"
                              (onClick)="verFicha(ficha.id!)"
                            ></p-button>
                          </div>
                        </p-card>
                      </div>
                    }
                  </div>
                }
              </p-card>
            </p-tabpanel>
          </p-tabpanels>
        </p-tabs>
      }
    </div>

    <p-confirmDialog></p-confirmDialog>
  `
})
export class JogoDetailComponent implements OnInit {
  jogoFacade = inject(JogoManagementFacadeService); // público para template
  private participanteService = inject(ParticipanteBusinessService);
  private fichaService = inject(FichaBusinessService);
  private jogosStore = inject(JogosStore);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private confirmationService = inject(ConfirmationService);
  private toastService = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  readonly opcoesFiltroBotao: { label: string; value: FiltroStatus }[] = [
    { label: 'Todos', value: 'TODOS' },
    { label: 'Aprovados', value: 'APROVADO' },
    { label: 'Pendentes', value: 'PENDENTE' },
    { label: 'Rejeitados', value: 'REJEITADO' },
    { label: 'Banidos', value: 'BANIDO' },
  ];

  jogoId = signal<number | null>(null);
  activeTabIndex = signal<string>('0');
  filtroStatus = signal<FiltroStatus>('TODOS');

  /** Two-way binding helper para o SelectButton via ngModel */
  get filtroStatusModel(): FiltroStatus {
    return this.filtroStatus();
  }
  set filtroStatusModel(value: FiltroStatus) {
    this.filtroStatus.set(value);
  }

  jogo = computed(() => {
    const id = this.jogoId();
    if (!id) return null;
    return this.jogoFacade.jogos().find(j => j.id === id) || null;
  });

  participantes = computed<Participante[]>(() => {
    const id = this.jogoId();
    if (!id) return [];
    return this.jogosStore.getParticipantes(id);
  });

  participantesFiltrados = computed<Participante[]>(() => {
    const todos = this.participantes();
    const filtro = this.filtroStatus();
    if (filtro === 'TODOS') return todos;
    return todos.filter(p => p.status === filtro);
  });

  participantesAprovados = computed(() =>
    this.participantes().filter(p => p.status === 'APROVADO')
  );

  participantesPendentes = computed(() =>
    this.participantes().filter(p => p.status === 'PENDENTE')
  );

  fichasDoJogo = computed(() => {
    const id = this.jogoId();
    if (!id) return [];
    return this.fichaService.fichas().filter(f => f.jogoId === id);
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.jogoId.set(Number(id));

      this.jogoFacade.loadJogos().pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe();

      this.participanteService.loadParticipantes(Number(id)).pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe();

      this.fichaService.loadFichas(Number(id)).pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe();
    }
  }

  editarJogo() {
    this.router.navigate(['/mestre/jogos', this.jogoId(), 'edit']);
  }

  confirmarExclusao() {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir o jogo "${this.jogo()?.nome}"?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.jogoFacade.deleteJogo(this.jogoId()!).pipe(
          takeUntilDestroyed(this.destroyRef)
        ).subscribe({
          next: () => {
            this.toastService.success('Jogo excluído com sucesso');
            this.router.navigate(['/mestre/jogos']);
          },
          error: () => {
            this.toastService.error('Erro ao excluir jogo');
          }
        });
      }
    });
  }

  aprovarParticipante(participanteId: number) {
    this.participanteService.aprovarParticipante(this.jogoId()!, participanteId).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.toastService.success('Participante aprovado');
      },
      error: () => {
        this.toastService.error('Erro ao aprovar participante');
      }
    });
  }

  rejeitarParticipante(participanteId: number) {
    this.participanteService.rejeitarParticipante(this.jogoId()!, participanteId).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.toastService.success('Participante rejeitado');
      },
      error: () => {
        this.toastService.error('Erro ao rejeitar participante');
      }
    });
  }

  removerParticipante(participanteId: number) {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja remover este participante? Ele poderá solicitar participação novamente depois.',
      header: 'Confirmar Remoção',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, Remover',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.participanteService.removerParticipante(this.jogoId()!, participanteId).pipe(
          takeUntilDestroyed(this.destroyRef)
        ).subscribe({
          next: () => {
            this.toastService.success('Participante removido');
          },
          error: () => {
            this.toastService.error('Erro ao remover participante');
          }
        });
      }
    });
  }

  banirParticipante(participanteId: number) {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja banir este participante? O ban pode ser revertido depois.',
      header: 'Confirmar Banimento',
      icon: 'pi pi-ban',
      acceptLabel: 'Sim, Banir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.participanteService.banirParticipante(this.jogoId()!, participanteId).pipe(
          takeUntilDestroyed(this.destroyRef)
        ).subscribe({
          next: () => {
            this.toastService.warning('Participante banido do jogo', 'Banido');
          },
          error: () => {
            this.toastService.error('Erro ao banir participante');
          }
        });
      }
    });
  }

  desbanirParticipante(participanteId: number) {
    this.participanteService.desbanirParticipante(this.jogoId()!, participanteId).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.toastService.success('Participante desbanido');
      },
      error: () => {
        this.toastService.error('Erro ao desbanir participante');
      }
    });
  }

  verFicha(fichaId: number) {
    this.router.navigate(['/mestre/fichas', fichaId]);
  }

  getStatusLabel(ativo: boolean): string {
    return ativo ? 'Ativo' : 'Inativo';
  }

  getStatusSeverity(ativo: boolean): 'success' | 'secondary' {
    return ativo ? 'success' : 'secondary';
  }

  getParticipanteStatusLabel(status: ParticipanteStatus): string {
    const labels: Record<ParticipanteStatus, string> = {
      PENDENTE: 'Pendente',
      APROVADO: 'Aprovado',
      REJEITADO: 'Rejeitado',
      BANIDO: 'Banido'
    };
    return labels[status] ?? status;
  }

  getParticipanteStatusSeverity(status: ParticipanteStatus): 'success' | 'warn' | 'danger' | 'secondary' {
    const severities: Record<ParticipanteStatus, 'success' | 'warn' | 'danger' | 'secondary'> = {
      PENDENTE: 'warn',
      APROVADO: 'success',
      REJEITADO: 'danger',
      BANIDO: 'secondary'
    };
    return severities[status] ?? 'secondary';
  }
}
