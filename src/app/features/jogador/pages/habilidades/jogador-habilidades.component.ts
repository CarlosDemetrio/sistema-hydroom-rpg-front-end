import { ChangeDetectionStrategy, Component, computed, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpContext } from '@angular/common/http';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';

import { ConfigApiService } from '@core/services/api/config-api.service';
import { CurrentGameService } from '@core/services/current-game.service';
import { ToastService } from '@services/toast.service';
import { HabilidadeConfig } from '@core/models/habilidade-config.model';
import { SKIP_ERROR_INTERCEPTOR } from '@core/tokens/skip-error.token';

/**
 * JogadorHabilidadesComponent — CRUD de Habilidades do Jogo (tela do Jogador).
 *
 * MESTRE e JOGADOR têm permissões simétricas nesta entidade.
 * O Jogador pode criar, editar e deletar habilidades do jogo.
 *
 * Endpoint: /api/jogos/{jogoId}/config/habilidades
 */
@Component({
  selector: 'app-jogador-habilidades',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    ConfirmDialogModule,
    DialogModule,
    InputNumberModule,
    InputTextModule,
    TableModule,
    TextareaModule,
    TooltipModule,
  ],
  providers: [ConfirmationService],
  template: `
    <div class="p-3">

      @if (!hasGame()) {
        <p-card>
          <div class="flex align-items-center gap-3 p-4">
            <i class="pi pi-exclamation-triangle text-2xl" style="color: var(--rpg-amber-400)"></i>
            <div>
              <p class="font-semibold m-0 mb-1">Nenhum jogo selecionado</p>
              <p class="text-sm text-color-secondary m-0">
                Selecione um jogo para gerenciar as habilidades disponíveis.
              </p>
            </div>
          </div>
        </p-card>
      }

      @if (hasGame()) {
        <p-card>
          <div class="flex justify-content-between align-items-center mb-3">
            <div>
              <h2 class="m-0 text-xl font-bold">
                <i class="pi pi-bolt mr-2 text-primary"></i>
                Habilidades
              </h2>
              <p class="text-sm text-color-secondary m-0 mt-1">
                Jogo: <strong>{{ currentGameName() }}</strong>
                — Ataques, técnicas e manobras disponíveis
              </p>
            </div>
            <p-button
              label="Nova Habilidade"
              icon="pi pi-plus"
              (onClick)="openDialog()"
            />
          </div>

          <p-table
            [value]="habilidades()"
            [loading]="loading()"
            [paginator]="true"
            [rows]="10"
            [rowsPerPageOptions]="[10, 25, 50]"
            styleClass="p-datatable-sm"
            [tableStyle]="{ 'min-width': '44rem' }"
          >
            <ng-template pTemplate="header">
              <tr>
                <th style="width: 5rem">Ordem</th>
                <th>Nome</th>
                <th>Dano / Efeito</th>
                <th style="width: 8rem">Ações</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-habilidade>
              <tr>
                <td class="text-center">{{ habilidade.ordemExibicao }}</td>
                <td class="font-semibold">{{ habilidade.nome }}</td>
                <td class="text-sm">
                  @if (habilidade.danoEfeito) {
                    <span [title]="habilidade.danoEfeito">
                      {{ truncar(habilidade.danoEfeito, 60) }}
                    </span>
                  } @else {
                    <span class="text-color-secondary">—</span>
                  }
                </td>
                <td>
                  <div class="flex gap-1">
                    <p-button
                      icon="pi pi-pencil"
                      [rounded]="true"
                      [text]="true"
                      severity="secondary"
                      (onClick)="openDialog(habilidade)"
                      pTooltip="Editar"
                    />
                    <p-button
                      icon="pi pi-trash"
                      [rounded]="true"
                      [text]="true"
                      severity="danger"
                      (onClick)="confirmDelete(habilidade.id)"
                      pTooltip="Excluir"
                    />
                  </div>
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="4">
                  <div class="text-center p-4 text-color-secondary">
                    <i class="pi pi-inbox text-3xl mb-2 block"></i>
                    <p class="m-0">Nenhuma habilidade cadastrada ainda</p>
                    <p class="text-sm m-0">Crie a primeira habilidade do jogo!</p>
                  </div>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </p-card>
      }

    </div>

    <!-- Dialog de criação/edição -->
    <p-dialog
      [visible]="dialogVisible()"
      (visibleChange)="onDialogVisibleChange($event)"
      [header]="editMode() ? 'Editar Habilidade' : 'Nova Habilidade'"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      [style]="{ width: '40rem' }"
    >
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="flex flex-column gap-4 p-2">

          <!-- Nome -->
          <div class="flex flex-column gap-2">
            <label for="jhabil-nome" class="font-semibold">
              Nome <span class="text-red-400">*</span>
            </label>
            <input
              pInputText
              id="jhabil-nome"
              formControlName="nome"
              placeholder="Ex: Golpe Brutal, Chama Sagrada..."
              maxlength="100"
              [class.ng-invalid]="form.get('nome')?.invalid && form.get('nome')?.touched"
            />
            @if (form.get('nome')?.invalid && form.get('nome')?.touched) {
              <small class="text-red-400">Nome é obrigatório.</small>
            }
          </div>

          <!-- Dano / Efeito -->
          <div class="flex flex-column gap-2">
            <label for="jhabil-danoEfeito" class="font-semibold">Dano / Efeito</label>
            <input
              pInputText
              id="jhabil-danoEfeito"
              formControlName="danoEfeito"
              placeholder="Ex: 2D6+FOR de dano físico"
              maxlength="500"
            />
            <small class="text-color-secondary">
              Texto livre — descreva o efeito mecânico. Não é processado pelo sistema.
            </small>
          </div>

          <!-- Descrição -->
          <div class="flex flex-column gap-2">
            <label for="jhabil-descricao" class="font-semibold">Descrição</label>
            <textarea
              pTextarea
              id="jhabil-descricao"
              formControlName="descricao"
              placeholder="Descrição narrativa opcional..."
              [rows]="3"
              [autoResize]="true"
              maxlength="1000"
            ></textarea>
          </div>

          <!-- Ordem de Exibição -->
          <div class="flex flex-column gap-2">
            <label for="jhabil-ordem" class="font-semibold">
              Ordem de Exibição <span class="text-red-400">*</span>
            </label>
            <p-input-number
              inputId="jhabil-ordem"
              formControlName="ordemExibicao"
              [showButtons]="true"
              [min]="0"
            />
          </div>

        </div>

        @if (erroConflito()) {
          <div class="mt-3 p-3 border-round" style="background: var(--red-50); border: 1px solid var(--red-200)">
            <small class="text-red-600">
              <i class="pi pi-exclamation-circle mr-1"></i>
              Já existe uma habilidade com este nome neste jogo.
            </small>
          </div>
        }

        <div class="flex justify-content-end gap-2 mt-5 pt-4 border-top-1 surface-border">
          <p-button
            label="Cancelar"
            severity="secondary"
            [outlined]="true"
            type="button"
            (onClick)="closeDialog()"
          />
          <p-button
            [label]="editMode() ? 'Salvar Alterações' : 'Criar Habilidade'"
            icon="pi pi-check"
            type="submit"
            [loading]="saving()"
          />
        </div>
      </form>
    </p-dialog>

    <p-confirmDialog />
  `,
})
export class JogadorHabilidadesComponent implements OnInit {
  private readonly configApi = inject(ConfigApiService);
  private readonly currentGameService = inject(CurrentGameService);
  private readonly toastService = inject(ToastService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly hasGame = this.currentGameService.hasCurrentGame;
  protected readonly currentGameId = this.currentGameService.currentGameId;
  protected readonly currentGameName = computed(() => this.currentGameService.currentGame()?.nome);

  protected readonly habilidades = signal<HabilidadeConfig[]>([]);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly dialogVisible = signal(false);
  protected readonly editMode = signal(false);
  protected readonly currentEditId = signal<number | null>(null);
  protected readonly erroConflito = signal(false);

  protected form!: FormGroup;

  ngOnInit(): void {
    this.form = this.buildForm();
    if (this.hasGame()) {
      this.loadData();
    }
  }

  private buildForm(): FormGroup {
    return this.fb.group({
      nome: ['', [Validators.required, Validators.maxLength(100)]],
      danoEfeito: ['', [Validators.maxLength(500)]],
      descricao: ['', [Validators.maxLength(1000)]],
      ordemExibicao: [0, [Validators.required, Validators.min(0)]],
    });
  }

  protected loadData(): void {
    const jogoId = this.currentGameId();
    if (!jogoId) return;
    this.loading.set(true);
    this.configApi.listHabilidades(jogoId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.habilidades.set(data);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  protected openDialog(item?: HabilidadeConfig): void {
    this.form = this.buildForm();
    this.erroConflito.set(false);
    if (item) {
      this.editMode.set(true);
      this.currentEditId.set(item.id);
      this.form.patchValue({
        nome: item.nome,
        danoEfeito: item.danoEfeito ?? '',
        descricao: item.descricao ?? '',
        ordemExibicao: item.ordemExibicao,
      });
    } else {
      this.editMode.set(false);
      this.currentEditId.set(null);
      this.form.reset({ ordemExibicao: this.habilidades().length + 1 });
    }
    this.dialogVisible.set(true);
  }

  protected closeDialog(): void {
    this.dialogVisible.set(false);
    this.erroConflito.set(false);
    this.form.reset();
  }

  protected onDialogVisibleChange(visible: boolean): void {
    if (!visible) this.closeDialog();
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastService.warning('Preencha todos os campos obrigatórios', 'Atenção');
      return;
    }

    const jogoId = this.currentGameId()!;
    const { nome, danoEfeito, descricao, ordemExibicao } = this.form.value;
    const dto = {
      nome: nome.trim(),
      danoEfeito: danoEfeito?.trim() || null,
      descricao: descricao?.trim() || null,
      ordemExibicao,
    };

    const ctx = new HttpContext().set(SKIP_ERROR_INTERCEPTOR, true);
    const operation$ = this.editMode()
      ? this.configApi.updateHabilidade(jogoId, this.currentEditId()!, dto, ctx)
      : this.configApi.createHabilidade(jogoId, dto, ctx);

    this.saving.set(true);
    this.erroConflito.set(false);

    operation$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        const action = this.editMode() ? 'atualizada' : 'criada';
        this.toastService.success(`Habilidade ${action} com sucesso`, 'Sucesso');
        this.closeDialog();
        this.loadData();
        this.saving.set(false);
      },
      error: (err) => {
        this.saving.set(false);
        if (err?.status === 409) {
          this.erroConflito.set(true);
        } else {
          const msg = err?.error?.message ?? 'Erro ao salvar habilidade';
          this.toastService.error(msg, 'Erro');
        }
      },
    });
  }

  protected confirmDelete(id: number): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir esta Habilidade?',
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.delete(id),
    });
  }

  private delete(id: number): void {
    const jogoId = this.currentGameId()!;
    this.configApi.deleteHabilidade(jogoId, id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastService.success('Habilidade excluída com sucesso', 'Sucesso');
          this.loadData();
        },
        error: (err) => {
          const msg = err?.error?.message ?? 'Erro ao excluir habilidade';
          this.toastService.error(msg, 'Erro');
        },
      });
  }

  protected truncar(texto: string, limite: number): string {
    if (!texto || texto.length <= limite) return texto;
    return texto.substring(0, limite) + '...';
  }
}
