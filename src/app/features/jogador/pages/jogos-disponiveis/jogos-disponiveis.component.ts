import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { JogosApiService } from '@core/services/api/jogos-api.service';
import { CurrentGameService } from '@core/services/current-game.service';
import { JogoResumo } from '@core/models/jogo.model';
import { ToastService } from '@services/toast.service';

@Component({
  selector: 'app-jogos-disponiveis',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BadgeModule,
    ButtonModule,
    CardModule,
    MessageModule,
    SkeletonModule,
    TagModule,
    ToastModule,
  ],
  template: `
    <p-toast />

    <div class="p-4">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-2xl font-bold m-0">Jogos Disponíveis</h1>
          <p class="text-color-secondary m-0 mt-1">Seus jogos e solicitações de participação</p>
        </div>
        <p-button
          label="Atualizar"
          icon="pi pi-refresh"
          outlined
          size="small"
          [loading]="loading()"
          (onClick)="carregar()"
        />
      </div>

      <!-- Loading skeletons -->
      @if (loading()) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (_ of [1,2,3,4,5,6]; track $index) {
            <p-card>
              <div class="flex flex-col gap-3">
                <p-skeleton width="70%" height="1.25rem" />
                <p-skeleton width="50%" height="1rem" />
                <div class="flex justify-between items-center mt-2">
                  <p-skeleton width="80px" height="1.75rem" borderRadius="16px" />
                  <p-skeleton width="100px" height="2rem" borderRadius="6px" />
                </div>
              </div>
            </p-card>
          }
        </div>
      }

      <!-- Error state -->
      @if (!loading() && erro()) {
        <p-message severity="error" [text]="erro()!" styleClass="w-full mb-4" />
        <div class="text-center">
          <p-button label="Tentar novamente" icon="pi pi-refresh" outlined (onClick)="carregar()" />
        </div>
      }

      <!-- Empty state -->
      @if (!loading() && !erro() && jogos().length === 0) {
        <div class="flex flex-col items-center justify-center py-16 gap-4">
          <i class="pi pi-search" style="font-size: 4rem; color: var(--text-color-secondary)"></i>
          <h3 class="text-xl font-semibold m-0">Nenhum jogo encontrado</h3>
          <p class="text-color-secondary text-center m-0 max-w-md">
            Você ainda não está em nenhum jogo. Peça ao Mestre para te adicionar ou aguarde um convite.
          </p>
        </div>
      }

      <!-- Jogos grid -->
      @if (!loading() && !erro() && jogos().length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (jogo of jogos(); track jogo.id) {
            <p-card [style]="{'height': '100%'}">
              <div class="flex flex-col gap-3 h-full">
                <!-- Nome e ativo -->
                <div class="flex items-start justify-between gap-2">
                  <h3 class="text-lg font-semibold m-0 line-clamp-2">{{ jogo.nome }}</h3>
                  @if (!jogo.ativo) {
                    <p-tag severity="secondary" value="Inativo" />
                  }
                </div>

                <!-- Descrição -->
                @if (jogo.descricao) {
                  <p class="text-color-secondary text-sm m-0 line-clamp-2">{{ jogo.descricao }}</p>
                }

                <!-- Participantes -->
                <div class="flex items-center gap-1 text-sm text-color-secondary">
                  <i class="pi pi-users"></i>
                  <span>{{ jogo.totalParticipantes }} participante{{ jogo.totalParticipantes !== 1 ? 's' : '' }}</span>
                </div>

                <!-- Spacer -->
                <div class="flex-1"></div>

                <!-- Ações -->
                <div class="flex items-center justify-between mt-2 pt-3 border-t border-surface-200">
                  @if (jogoAtivo()?.id === jogo.id) {
                    <p-tag severity="success" icon="pi pi-check" value="Jogo atual" />
                  } @else {
                    <p-tag [severity]="roleSeverity(jogo.meuRole)" [value]="roleLabel(jogo.meuRole)" />
                  }

                  <div class="flex gap-2">
                    @if (jogo.meuRole === 'JOGADOR' && jogo.ativo) {
                      <p-button
                        label="Entrar"
                        icon="pi pi-play"
                        size="small"
                        (onClick)="selecionarJogo(jogo)"
                      />
                    }
                    @if (jogo.meuRole === 'MESTRE') {
                      <p-button
                        label="Gerenciar"
                        icon="pi pi-cog"
                        size="small"
                        outlined
                        (onClick)="irParaJogo(jogo)"
                      />
                    }
                  </div>
                </div>
              </div>
            </p-card>
          }
        </div>

        <!-- TODO: backend precisa de endpoint GET /api/v1/jogos/publicos para mostrar
             jogos disponíveis onde o usuário ainda não é participante e pode solicitar acesso.
             Atualmente listJogos() retorna apenas jogos onde o usuário já tem um role.
             Endpoint de solicitação: POST /api/v1/jogos/{jogoId}/participantes/solicitar -->
      }
    </div>
  `,
})
export class JogosDisponiveisComponent implements OnInit {
  private jogosApi = inject(JogosApiService);
  private currentGameService = inject(CurrentGameService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  protected jogos = signal<JogoResumo[]>([]);
  protected loading = signal(true);
  protected erro = signal<string | null>(null);

  protected jogoAtivo = computed(() => this.currentGameService.currentGame());

  ngOnInit(): void {
    this.carregar();
  }

  protected carregar(): void {
    this.loading.set(true);
    this.erro.set(null);

    this.jogosApi.listJogos().subscribe({
      next: (jogos) => {
        this.jogos.set(jogos);
        this.loading.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar os jogos. Verifique sua conexão.');
        this.loading.set(false);
      },
    });
  }

  protected selecionarJogo(jogo: JogoResumo): void {
    this.currentGameService.selectGame(jogo.id);
    this.toastService.success(`Jogo "${jogo.nome}" selecionado!`);
    this.router.navigate(['/jogador/fichas']);
  }

  protected irParaJogo(jogo: JogoResumo): void {
    this.router.navigate(['/mestre/jogos', jogo.id]);
  }

  protected roleSeverity(role: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    return role === 'MESTRE' ? 'warn' : 'info';
  }

  protected roleLabel(role: string): string {
    return role === 'MESTRE' ? 'Mestre' : 'Jogador';
  }
}