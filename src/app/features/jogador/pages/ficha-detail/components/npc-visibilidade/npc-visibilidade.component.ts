import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { MultiSelectModule } from 'primeng/multiselect';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import {
  JogadorAcessoItem,
  NpcVisibilidadeUpdate,
} from '@core/models/ficha.model';
import { FichaVisibilidadeApiService } from '@core/services/api/ficha-visibilidade.api.service';
import { JogosApiService } from '@core/services/api/jogos-api.service';
import { Participante } from '@core/models/participante.model';

interface ParticipanteOption {
  label: string;
  value: number;
  nomePersonagem: string;
}

/**
 * NpcVisibilidadeComponent — DUMB/SMART hybrid
 *
 * Painel de controle de visibilidade de NPC para o Mestre.
 * - Toggle global: todos os jogadores veem os stats
 * - MultiSelect: quais jogadores têm acesso granular
 * - Botão "Salvar" habilitado somente quando há alterações pendentes
 *
 * Inputs:
 * - fichaId: ID do NPC (obrigatório)
 * - jogoId: ID do jogo (obrigatório) para carregar participantes aprovados
 * - visivelGlobalmente: estado inicial (sincronizado da ficha)
 * - jogadoresComAcesso: IDs iniciais dos jogadores com acesso granular
 *
 * Output:
 * - visibilidadeAtualizada: emitido ao salvar com sucesso
 */
@Component({
  selector: 'app-npc-visibilidade',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService],
  imports: [
    FormsModule,
    ButtonModule,
    CardModule,
    DividerModule,
    MultiSelectModule,
    TagModule,
    ToastModule,
    ToggleSwitchModule,
    TooltipModule,
  ],
  template: `
    <p-toast key="npc-vis" />

    <div class="flex flex-col gap-3" aria-label="Painel de visibilidade do NPC">

      <!-- Header -->
      <div class="flex items-center gap-2">
        <i class="pi pi-eye text-primary" aria-hidden="true"></i>
        <span class="font-semibold text-lg">Visibilidade para Jogadores</span>
      </div>

      <p-divider />

      <!-- Toggle: Visível Globalmente -->
      <div class="flex items-center justify-between gap-3">
        <div class="flex flex-col gap-1">
          <span class="font-medium">Visível globalmente</span>
          <span class="text-sm text-color-secondary">
            Todos os jogadores veem os stats deste NPC
          </span>
        </div>
        <p-toggleswitch
          [(ngModel)]="visivelGlobalmenteLocal"
          (ngModelChange)="onToggleGlobal($event)"
          [attr.aria-label]="'Visibilidade global: ' + (visivelGlobalmenteLocal() ? 'ativa' : 'inativa')"
        />
      </div>

      <!-- MultiSelect: Acesso Granular (somente quando não visível globalmente) -->
      @if (!visivelGlobalmenteLocal()) {
        <div class="flex flex-col gap-2">
          <label class="font-medium" for="jogadores-acesso">
            Jogadores com acesso aos stats
          </label>
          <p-multiselect
            inputId="jogadores-acesso"
            [options]="participantesOptions()"
            [(ngModel)]="jogadoresSelecionados"
            (ngModelChange)="onJogadoresChange($event)"
            optionLabel="label"
            optionValue="value"
            placeholder="Selecionar jogadores..."
            [loading]="carregandoParticipantes()"
            [showClear]="true"
            class="w-full"
            aria-label="Selecionar jogadores com acesso granular aos stats"
          >
            <ng-template #item let-option>
              <div class="flex flex-col">
                <span class="font-medium">{{ option.label }}</span>
                @if (option.nomePersonagem) {
                  <span class="text-sm text-color-secondary">
                    Personagem: {{ option.nomePersonagem }}
                  </span>
                }
              </div>
            </ng-template>
          </p-multiselect>

          <!-- Lista de jogadores com acesso atual -->
          @if (jogadoresComAcessoDetalhado().length > 0) {
            <div class="flex flex-col gap-1 mt-1">
              <span class="text-xs text-color-secondary font-medium uppercase">
                Com acesso atual ({{ jogadoresComAcessoDetalhado().length }})
              </span>
              @for (jogador of jogadoresComAcessoDetalhado(); track jogador.jogadorId) {
                <div class="flex items-center gap-2">
                  <p-tag
                    value="Acesso"
                    severity="success"
                    [rounded]="true"
                    styleClass="text-xs"
                  />
                  <span class="text-sm">{{ jogador.jogadorNome }}</span>
                  @if (jogador.nomePersonagem) {
                    <span class="text-sm text-color-secondary">({{ jogador.nomePersonagem }})</span>
                  }
                </div>
              }
            </div>
          }
        </div>
      }

      @if (visivelGlobalmenteLocal()) {
        <div class="flex items-center gap-2 p-3 surface-100 border-round">
          <i class="pi pi-info-circle text-blue-500" aria-hidden="true"></i>
          <span class="text-sm text-color-secondary">
            Todos os jogadores aprovados podem ver os stats deste NPC.
          </span>
        </div>
      }

      <p-divider />

      <!-- Botão Salvar -->
      <div class="flex justify-end">
        <p-button
          label="Salvar visibilidade"
          icon="pi pi-save"
          [disabled]="!houveAlteracao()"
          [loading]="salvando()"
          (onClick)="salvar()"
          aria-label="Salvar configurações de visibilidade do NPC"
        />
      </div>
    </div>
  `,
})
export class NpcVisibilidadeComponent implements OnInit {
  // ---- Inputs ----
  fichaId = input.required<number>();
  jogoId = input.required<number>();
  visivelGlobalmente = input<boolean>(false);
  jogadoresComAcesso = input<JogadorAcessoItem[]>([]);

  // ---- Outputs ----
  visibilidadeAtualizada = output<NpcVisibilidadeUpdate>();

  // ---- Services ----
  private readonly visibilidadeApi = inject(FichaVisibilidadeApiService);
  private readonly jogosApi = inject(JogosApiService);
  private readonly messageService = inject(MessageService);

  // ---- Estado local (espelha os inputs com alterações pendentes) ----
  protected visivelGlobalmenteLocal = signal<boolean>(false);
  protected jogadoresSelecionados = signal<number[]>([]);

  // ---- Estado auxiliar ----
  protected salvando = signal<boolean>(false);
  protected carregandoParticipantes = signal<boolean>(false);
  protected participantes = signal<Participante[]>([]);

  // ---- Estado original (para detectar alterações) ----
  private visivelOriginal = signal<boolean>(false);
  private jogadoresOriginais = signal<number[]>([]);

  // ---- Computed ----
  protected participantesOptions = computed<ParticipanteOption[]>(() =>
    this.participantes()
      .filter(p => p.status === 'APROVADO' && p.role === 'JOGADOR')
      .map(p => ({
        label: p.nomeUsuario,
        value: p.usuarioId,
        nomePersonagem: '',
      }))
  );

  protected jogadoresComAcessoDetalhado = computed<JogadorAcessoItem[]>(() =>
    this.jogadoresComAcesso()
  );

  protected houveAlteracao = computed<boolean>(() => {
    const globalMudou = this.visivelGlobalmenteLocal() !== this.visivelOriginal();
    const idsSelecionados = [...this.jogadoresSelecionados()].sort((a, b) => a - b);
    const idsOriginais = [...this.jogadoresOriginais()].sort((a, b) => a - b);
    const jogadoresMudaram =
      idsSelecionados.length !== idsOriginais.length ||
      idsSelecionados.some((id, idx) => id !== idsOriginais[idx]);
    return globalMudou || jogadoresMudaram;
  });

  ngOnInit(): void {
    // Sincronizar estado local com os inputs
    const global = this.visivelGlobalmente();
    const ids = this.jogadoresComAcesso().map(j => j.jogadorId);
    this.visivelGlobalmenteLocal.set(global);
    this.visivelOriginal.set(global);
    this.jogadoresSelecionados.set(ids);
    this.jogadoresOriginais.set(ids);

    // Carregar participantes aprovados do jogo
    this.carregarParticipantes();
  }

  private carregarParticipantes(): void {
    this.carregandoParticipantes.set(true);
    this.jogosApi.listParticipantes(this.jogoId(), 'APROVADO').subscribe({
      next: (lista) => {
        this.participantes.set(lista);
        this.carregandoParticipantes.set(false);
      },
      error: () => {
        this.carregandoParticipantes.set(false);
        // Falha silenciosa — multiselect fica vazio mas não bloqueia o toggle global
      },
    });
  }

  protected onToggleGlobal(value: boolean): void {
    this.visivelGlobalmenteLocal.set(value);
    // Ao ativar visibilidade global, limpamos a seleção granular local
    if (value) {
      this.jogadoresSelecionados.set([]);
    }
  }

  protected onJogadoresChange(ids: number[]): void {
    this.jogadoresSelecionados.set(ids ?? []);
  }

  protected salvar(): void {
    if (!this.houveAlteracao() || this.salvando()) return;

    const fichaId = this.fichaId();
    const visivelGlobalmente = this.visivelGlobalmenteLocal();
    const jogadoresSelecionados = this.jogadoresSelecionados();

    this.salvando.set(true);

    // Se o toggle global mudou, envia PATCH primeiro
    if (visivelGlobalmente !== this.visivelOriginal()) {
      this.visibilidadeApi.atualizarGlobal(fichaId, visivelGlobalmente).subscribe({
        next: () => {
          this.visivelOriginal.set(visivelGlobalmente);
          this.sincronizarAcessosGranulares(fichaId, jogadoresSelecionados, visivelGlobalmente);
        },
        error: () => {
          this.salvando.set(false);
          this.messageService.add({
            key: 'npc-vis',
            severity: 'error',
            summary: 'Erro',
            detail: 'Nao foi possivel alterar a visibilidade global.',
          });
        },
      });
    } else {
      this.sincronizarAcessosGranulares(fichaId, jogadoresSelecionados, visivelGlobalmente);
    }
  }

  private sincronizarAcessosGranulares(
    fichaId: number,
    idsSelecionados: number[],
    visivelGlobalmente: boolean,
  ): void {
    const idsOriginais = this.jogadoresOriginais();
    const adicionados = idsSelecionados.filter(id => !idsOriginais.includes(id));
    const removidos = idsOriginais.filter(id => !idsSelecionados.includes(id));

    if (adicionados.length === 0 && removidos.length === 0) {
      this.finalizarSalvamento(visivelGlobalmente, idsSelecionados);
      return;
    }

    // Sincroniza adições
    const adicionarPromessas = adicionados.map(jogadorId =>
      new Promise<void>((resolve, reject) => {
        this.visibilidadeApi.atualizarVisibilidade(fichaId, { jogadorId, temAcesso: true }).subscribe({
          next: () => resolve(),
          error: (err) => reject(err),
        });
      })
    );

    // Sincroniza remoções
    const removerPromessas = removidos.map(jogadorId =>
      new Promise<void>((resolve, reject) => {
        this.visibilidadeApi.revogarAcesso(fichaId, jogadorId).subscribe({
          next: () => resolve(),
          error: (err) => reject(err),
        });
      })
    );

    Promise.all([...adicionarPromessas, ...removerPromessas])
      .then(() => {
        this.finalizarSalvamento(visivelGlobalmente, idsSelecionados);
      })
      .catch(() => {
        this.salvando.set(false);
        this.messageService.add({
          key: 'npc-vis',
          severity: 'error',
          summary: 'Erro parcial',
          detail: 'Algumas alteracoes de acesso nao foram salvas. Tente novamente.',
        });
      });
  }

  private finalizarSalvamento(
    visivelGlobalmente: boolean,
    jogadoresComAcesso: number[],
  ): void {
    this.salvando.set(false);
    this.visivelOriginal.set(visivelGlobalmente);
    this.jogadoresOriginais.set([...jogadoresComAcesso]);

    this.messageService.add({
      key: 'npc-vis',
      severity: 'success',
      summary: 'Visibilidade salva',
      detail: 'Configuracao de visibilidade do NPC atualizada com sucesso.',
    });

    this.visibilidadeAtualizada.emit({
      visivelGlobalmente,
      jogadoresComAcesso,
    });
  }
}
