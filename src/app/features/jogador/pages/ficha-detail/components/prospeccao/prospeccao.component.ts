import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import {
  ProspeccaoUsoResponse,
  ProspeccaoUsoStatus,
  ConcederProspeccaoRequest,
  UsarProspeccaoRequest,
} from '@core/models/ficha.model';
import { DadoProspeccaoConfig } from '@core/models/config.models';
import { ProspeccaoApiService } from '@core/services/api/prospeccao.api.service';
import { ConfigApiService } from '@core/services/api/config-api.service';
import { AuthService } from '@services/auth.service';

/**
 * ProspeccaoComponent — Smart Component
 *
 * Exibe e gerencia os dados de prospecção de uma ficha.
 *
 * Fluxo MESTRE:
 * - Conceder dados a uma ficha (dialog com quantidade)
 * - Ver todos os usos (PENDENTES, CONFIRMADOS, REVERTIDOS)
 * - Confirmar ou reverter usos PENDENTES
 *
 * Fluxo JOGADOR:
 * - Ver usos próprios com filtro por status
 * - Usar um dado disponível (requer confirmação)
 *
 * Inputs:
 * - fichaId: ID da ficha
 * - jogoId: ID do jogo (para carregar configs de dados)
 *
 * O componente carrega dados ao inicializar.
 */
@Component({
  selector: 'app-prospeccao',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService],
  imports: [
    FormsModule,
    BadgeModule,
    ButtonModule,
    CardModule,
    DialogModule,
    DividerModule,
    InputNumberModule,
    MessageModule,
    SelectModule,
    SkeletonModule,
    TableModule,
    TagModule,
    ToastModule,
    TooltipModule,
  ],
  template: `
    <p-toast key="prospeccao" />

    <!-- Loading -->
    @if (carregando()) {
      <div class="flex flex-col gap-3 p-3" aria-busy="true" aria-label="Carregando prospecção">
        @for (_ of [1, 2, 3]; track $index) {
          <p-skeleton height="3rem" borderRadius="8px" />
        }
      </div>
    }

    <!-- Conteúdo -->
    @if (!carregando()) {
      <div class="flex flex-col gap-4 p-3">

        <!-- Header -->
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center gap-2">
            <i class="pi pi-dice text-primary" aria-hidden="true"></i>
            <span class="font-semibold text-lg">Dados de Prospecção</span>
            @if (totalPendentes() > 0) {
              <p-badge
                [value]="totalPendentes()"
                severity="warn"
                pTooltip="Usos pendentes de revisão"
              />
            }
          </div>

          <!-- Botão conceder (Mestre only) -->
          @if (isMestre()) {
            <p-button
              label="Conceder Dado"
              icon="pi pi-plus"
              size="small"
              (onClick)="abrirDialogConceder()"
              aria-label="Conceder dado de prospecção a esta ficha"
            />
          }
        </div>

        <!-- Fluxo JOGADOR: Usar dado disponível -->
        @if (!isMestre() && dadosDisponiveis().length > 0) {
          <div class="surface-50 border-round p-3 flex flex-col gap-3">
            <span class="font-medium text-sm">Usar Dado de Prospecção</span>
            <div class="flex items-end gap-2 flex-wrap">
              <div class="flex flex-col gap-1 flex-1 min-w-0" style="min-width: 200px">
                <label for="dado-select" class="text-sm text-color-secondary">Selecionar dado</label>
                <p-select
                  inputId="dado-select"
                  [options]="dadosDisponiveis()"
                  optionLabel="nome"
                  optionValue="id"
                  [(ngModel)]="dadoSelecionadoId"
                  placeholder="Escolha um dado..."
                  class="w-full"
                  aria-label="Selecionar dado de prospecção para usar"
                />
              </div>
              <p-button
                label="Usar Dado"
                icon="pi pi-play"
                size="small"
                [disabled]="dadoSelecionadoId() === null || usando()"
                [loading]="usando()"
                (onClick)="confirmarUso()"
                aria-label="Registrar uso do dado selecionado"
              />
            </div>
          </div>
        }

        <!-- Tabela de usos -->
        @if (usos().length > 0) {
          <p-table
            [value]="usos()"
            [rows]="10"
            [paginator]="usos().length > 10"
            styleClass="p-datatable-sm"
            aria-label="Histórico de usos de dados de prospecção"
          >
            <ng-template #header>
              <tr>
                <th scope="col">Dado</th>
                <th scope="col" class="hidden sm:table-cell">Personagem</th>
                <th scope="col">Status</th>
                <th scope="col" class="hidden md:table-cell">Data</th>
                @if (isMestre()) {
                  <th scope="col" class="text-right">Ações</th>
                }
              </tr>
            </ng-template>

            <ng-template #body let-uso>
              <tr [attr.aria-label]="'Uso: ' + uso.dadoNome + ', status ' + uso.status">
                <td>
                  <span class="font-medium">{{ uso.dadoNome }}</span>
                </td>
                <td class="hidden sm:table-cell text-color-secondary">
                  {{ uso.personagemNome }}
                </td>
                <td>
                  <p-tag
                    [value]="labelStatus(uso.status)"
                    [severity]="severityStatus(uso.status)"
                    [rounded]="true"
                  />
                </td>
                <td class="hidden md:table-cell text-sm text-color-secondary">
                  {{ formatarData(uso.criadoEm) }}
                </td>
                @if (isMestre()) {
                  <td class="text-right">
                    @if (uso.status === 'PENDENTE') {
                      <div class="flex justify-end gap-1">
                        <p-button
                          icon="pi pi-check"
                          size="small"
                          severity="success"
                          text
                          [loading]="confirmandoId() === uso.usoId"
                          [disabled]="confirmandoId() !== null || revertendoId() !== null"
                          (onClick)="confirmarUsoMestre(uso)"
                          [pTooltip]="'Confirmar uso de ' + uso.dadoNome"
                          aria-label="Confirmar uso"
                        />
                        <p-button
                          icon="pi pi-undo"
                          size="small"
                          severity="warn"
                          text
                          [loading]="revertendoId() === uso.usoId"
                          [disabled]="confirmandoId() !== null || revertendoId() !== null"
                          (onClick)="reverterUsoMestre(uso)"
                          [pTooltip]="'Reverter uso de ' + uso.dadoNome"
                          aria-label="Reverter uso"
                        />
                      </div>
                    }
                  </td>
                }
              </tr>
            </ng-template>

            <ng-template #emptymessage>
              <tr>
                <td [attr.colspan]="isMestre() ? 5 : 4" class="text-center text-color-secondary p-4">
                  Nenhum uso registrado ainda.
                </td>
              </tr>
            </ng-template>
          </p-table>
        } @else {
          <!-- Estado vazio -->
          <div
            class="flex flex-col items-center justify-center gap-2 p-6 surface-50 border-round"
            role="status"
            aria-label="Nenhum uso registrado"
          >
            <i class="pi pi-inbox text-3xl text-color-secondary" aria-hidden="true"></i>
            <span class="text-color-secondary text-sm">
              @if (isMestre()) {
                Nenhum uso registrado. Conceda dados de prospecção para começar.
              } @else {
                Nenhum dado de prospecção disponível no momento.
              }
            </span>
          </div>
        }

      </div>
    }

    <!-- Dialog: Conceder Dado (Mestre) -->
    <p-dialog
      header="Conceder Dado de Prospecção"
      [visible]="showDialogConceder()"
      (visibleChange)="showDialogConceder.set($event)"
      [modal]="true"
      [style]="{width: '420px'}"
      [draggable]="false"
      [resizable]="false"
      aria-label="Dialog para conceder dado de prospecção"
    >
      <div class="flex flex-col gap-4">
        <p class="text-color-secondary m-0 text-sm">
          Selecione o dado e a quantidade a conceder para esta ficha.
        </p>

        <div class="flex flex-col gap-1">
          <label for="dado-conceder" class="font-medium text-sm">Dado de Prospecção</label>
          <p-select
            inputId="dado-conceder"
            [options]="dadosDisponiveis()"
            optionLabel="nome"
            optionValue="id"
            [(ngModel)]="dadoConcederSelecionadoId"
            placeholder="Selecione um dado..."
            class="w-full"
            [loading]="carregandoConfigs()"
            aria-label="Selecionar tipo de dado de prospecção para conceder"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label for="quantidade-conceder" class="font-medium text-sm">Quantidade</label>
          <p-inputnumber
            inputId="quantidade-conceder"
            [(ngModel)]="quantidadeConceder"
            [min]="1"
            [max]="99"
            [showButtons]="true"
            class="w-full"
            aria-label="Quantidade de dados a conceder (1 a 99)"
          />
        </div>
      </div>

      <ng-template #footer>
        <p-button
          label="Cancelar"
          text
          (onClick)="fecharDialogConceder()"
          aria-label="Cancelar concessão"
        />
        <p-button
          label="Conceder"
          icon="pi pi-check"
          [disabled]="dadoConcederSelecionadoId() === null"
          [loading]="concedendo()"
          (onClick)="executarConceder()"
          aria-label="Confirmar concessão do dado"
        />
      </ng-template>
    </p-dialog>

    <!-- Dialog: Confirmar Uso (Jogador) -->
    <p-dialog
      header="Confirmar Uso de Dado"
      [visible]="showDialogConfirmacaoUso()"
      (visibleChange)="showDialogConfirmacaoUso.set($event)"
      [modal]="true"
      [style]="{width: '380px'}"
      [draggable]="false"
      [resizable]="false"
      aria-label="Confirmação de uso de dado de prospecção"
    >
      @if (dadoParaUso()) {
        <div class="flex flex-col gap-3">
          <div class="flex items-center gap-2 p-3 surface-50 border-round">
            <i class="pi pi-exclamation-triangle text-yellow-500 text-xl" aria-hidden="true"></i>
            <div class="flex flex-col gap-1">
              <span class="font-medium">Usar dado "{{ dadoParaUso()!.nome }}"?</span>
              <span class="text-sm text-color-secondary">
                Isso gastará 1 dado de {{ dadoParaUso()!.nome }}. O Mestre precisará confirmar o uso.
              </span>
            </div>
          </div>
        </div>
      }
      <ng-template #footer>
        <p-button
          label="Cancelar"
          text
          (onClick)="showDialogConfirmacaoUso.set(false)"
          aria-label="Cancelar uso do dado"
        />
        <p-button
          label="Confirmar Uso"
          icon="pi pi-play"
          severity="warn"
          [loading]="usando()"
          (onClick)="executarUso()"
          aria-label="Confirmar uso do dado de prospecção"
        />
      </ng-template>
    </p-dialog>
  `,
})
export class ProspeccaoComponent implements OnInit {
  // ---- Inputs ----
  fichaId = input.required<number>();
  jogoId = input.required<number>();

  // ---- Services ----
  private readonly prospeccaoApi = inject(ProspeccaoApiService);
  private readonly configApi = inject(ConfigApiService);
  private readonly authService = inject(AuthService);
  private readonly messageService = inject(MessageService);

  // ---- Auth ----
  protected isMestre = computed(() => this.authService.isMestre());

  // ---- Estado de dados ----
  protected usos = signal<ProspeccaoUsoResponse[]>([]);
  protected dadosDisponiveis = signal<DadoProspeccaoConfig[]>([]);

  // ---- Estado de loading ----
  protected carregando = signal(true);
  protected carregandoConfigs = signal(false);
  protected concedendo = signal(false);
  protected usando = signal(false);
  protected confirmandoId = signal<number | null>(null);
  protected revertendoId = signal<number | null>(null);

  // ---- Estado de dialogs ----
  protected showDialogConceder = signal(false);
  protected showDialogConfirmacaoUso = signal(false);

  // ---- Estado de formulário ----
  protected dadoConcederSelecionadoId = signal<number | null>(null);
  protected quantidadeConceder = signal<number>(1);
  protected dadoSelecionadoId = signal<number | null>(null);

  // ---- Computed ----
  protected totalPendentes = computed(
    () => this.usos().filter(u => u.status === 'PENDENTE').length,
  );

  protected dadoParaUso = computed<DadoProspeccaoConfig | null>(() => {
    const id = this.dadoSelecionadoId();
    if (id === null) return null;
    return this.dadosDisponiveis().find(d => d.id === id) ?? null;
  });

  ngOnInit(): void {
    this.carregarDados();
  }

  private carregarDados(): void {
    this.carregando.set(true);
    this.prospeccaoApi.listarUsos(this.fichaId()).subscribe({
      next: (usos) => {
        this.usos.set(usos);
        this.carregando.set(false);
        this.carregarConfigs();
      },
      error: () => {
        this.carregando.set(false);
        this.messageService.add({
          key: 'prospeccao',
          severity: 'error',
          summary: 'Erro',
          detail: 'Nao foi possivel carregar os usos de prospecção.',
        });
      },
    });
  }

  private carregarConfigs(): void {
    this.carregandoConfigs.set(true);
    this.configApi.listDadosProspeccao(this.jogoId()).subscribe({
      next: (dados) => {
        this.dadosDisponiveis.set(dados);
        this.carregandoConfigs.set(false);
      },
      error: () => {
        this.carregandoConfigs.set(false);
        // Falha silenciosa — lista de dados fica vazia mas não bloqueia a UI
      },
    });
  }

  // ---- Ações MESTRE ----

  protected abrirDialogConceder(): void {
    this.dadoConcederSelecionadoId.set(null);
    this.quantidadeConceder.set(1);
    this.showDialogConceder.set(true);
  }

  protected fecharDialogConceder(): void {
    this.showDialogConceder.set(false);
  }

  protected executarConceder(): void {
    const dadoId = this.dadoConcederSelecionadoId();
    if (dadoId === null || this.concedendo()) return;

    const req: ConcederProspeccaoRequest = {
      dadoProspeccaoConfigId: dadoId,
      quantidade: this.quantidadeConceder(),
    };

    this.concedendo.set(true);
    this.prospeccaoApi.conceder(this.fichaId(), req).subscribe({
      next: () => {
        this.concedendo.set(false);
        this.showDialogConceder.set(false);
        this.messageService.add({
          key: 'prospeccao',
          severity: 'success',
          summary: 'Dado concedido',
          detail: `${req.quantidade} dado(s) concedido(s) com sucesso.`,
        });
        // Recarregar usos para refletir estado atualizado
        this.carregarDados();
      },
      error: () => {
        this.concedendo.set(false);
        this.messageService.add({
          key: 'prospeccao',
          severity: 'error',
          summary: 'Erro',
          detail: 'Nao foi possivel conceder o dado de prospecção.',
        });
      },
    });
  }

  protected confirmarUsoMestre(uso: ProspeccaoUsoResponse): void {
    if (this.confirmandoId() !== null) return;

    this.confirmandoId.set(uso.usoId);
    this.prospeccaoApi.confirmar(this.fichaId(), uso.usoId).subscribe({
      next: (atualizado) => {
        this.usos.update(lista =>
          lista.map(u => u.usoId === uso.usoId ? atualizado : u),
        );
        this.confirmandoId.set(null);
        this.messageService.add({
          key: 'prospeccao',
          severity: 'success',
          summary: 'Uso confirmado',
          detail: `Uso de "${uso.dadoNome}" confirmado com sucesso.`,
        });
      },
      error: () => {
        this.confirmandoId.set(null);
        this.messageService.add({
          key: 'prospeccao',
          severity: 'error',
          summary: 'Erro',
          detail: 'Nao foi possivel confirmar o uso.',
        });
      },
    });
  }

  protected reverterUsoMestre(uso: ProspeccaoUsoResponse): void {
    if (this.revertendoId() !== null) return;

    this.revertendoId.set(uso.usoId);
    this.prospeccaoApi.reverter(this.fichaId(), uso.usoId).subscribe({
      next: (atualizado) => {
        this.usos.update(lista =>
          lista.map(u => u.usoId === uso.usoId ? atualizado : u),
        );
        this.revertendoId.set(null);
        this.messageService.add({
          key: 'prospeccao',
          severity: 'success',
          summary: 'Uso revertido',
          detail: `Uso de "${uso.dadoNome}" revertido. Quantidade restaurada.`,
        });
      },
      error: () => {
        this.revertendoId.set(null);
        this.messageService.add({
          key: 'prospeccao',
          severity: 'error',
          summary: 'Erro',
          detail: 'Nao foi possivel reverter o uso.',
        });
      },
    });
  }

  // ---- Ações JOGADOR ----

  protected confirmarUso(): void {
    if (this.dadoSelecionadoId() === null) return;
    this.showDialogConfirmacaoUso.set(true);
  }

  protected executarUso(): void {
    const dadoId = this.dadoSelecionadoId();
    if (dadoId === null || this.usando()) return;

    const req: UsarProspeccaoRequest = { dadoProspeccaoConfigId: dadoId };

    this.usando.set(true);
    this.prospeccaoApi.usar(this.fichaId(), req).subscribe({
      next: (novoUso) => {
        this.usos.update(lista => [novoUso, ...lista]);
        this.usando.set(false);
        this.showDialogConfirmacaoUso.set(false);
        this.dadoSelecionadoId.set(null);
        this.messageService.add({
          key: 'prospeccao',
          severity: 'info',
          summary: 'Dado usado',
          detail: `Uso registrado com status PENDENTE. O Mestre irá confirmar.`,
        });
      },
      error: () => {
        this.usando.set(false);
        this.messageService.add({
          key: 'prospeccao',
          severity: 'error',
          summary: 'Erro',
          detail: 'Nao foi possivel registrar o uso. Verifique se há dados disponíveis.',
        });
      },
    });
  }

  // ---- Helpers de template ----

  protected labelStatus(status: ProspeccaoUsoStatus): string {
    const labels: Record<ProspeccaoUsoStatus, string> = {
      PENDENTE: 'Pendente',
      CONFIRMADO: 'Confirmado',
      REVERTIDO: 'Revertido',
    };
    return labels[status] ?? status;
  }

  protected severityStatus(
    status: ProspeccaoUsoStatus,
  ): 'warn' | 'success' | 'secondary' {
    const severities: Record<ProspeccaoUsoStatus, 'warn' | 'success' | 'secondary'> = {
      PENDENTE: 'warn',
      CONFIRMADO: 'success',
      REVERTIDO: 'secondary',
    };
    return severities[status] ?? 'secondary';
  }

  protected formatarData(isoString: string): string {
    if (!isoString) return '';
    try {
      return new Date(isoString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  }
}
