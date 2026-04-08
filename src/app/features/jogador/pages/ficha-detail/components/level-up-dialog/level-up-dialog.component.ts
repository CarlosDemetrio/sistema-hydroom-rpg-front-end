import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { StepperModule } from 'primeng/stepper';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import {
  AtualizarAtributoDto,
  FichaAptidaoResponse,
  FichaAtributoResponse,
} from '@core/models/ficha.model';
import { FichasApiService } from '@core/services/api/fichas-api.service';
import { ToastService } from '@services/toast.service';
import { LevelUpAtributosStepComponent } from './steps/level-up-atributos-step/level-up-atributos-step.component';

/**
 * LevelUpDialogComponent — Smart Container
 *
 * Dialog de level-up com stepper de 3 steps:
 *   Step 1: Distribuição de pontos de atributo (implementado — T8)
 *   Step 2: Distribuição de pontos de aptidão  (placeholder — TODO T9)
 *   Step 3: Compra de vantagens                (placeholder — TODO T10)
 *
 * Ao avançar do Step 1, persiste os atributos distribuídos via
 * PUT /api/v1/fichas/{id}/atributos antes de mover o stepper.
 */
@Component({
  selector: 'app-level-up-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ConfirmationService],
  imports: [
    ButtonModule,
    ConfirmDialogModule,
    DialogModule,
    StepperModule,
    LevelUpAtributosStepComponent,
  ],
  template: `
    <p-confirmdialog />

    <p-dialog
      [visible]="true"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      [closable]="true"
      [style]="{ width: '640px', maxWidth: '95vw' }"
      (visibleChange)="onVisibleChange($event)"
    >
      <ng-template #header>
        <div class="flex align-items-center gap-2">
          <i class="pi pi-arrow-circle-up text-yellow-500 text-xl"></i>
          <span class="font-bold text-lg">
            Nível {{ nivelNovo() }} — {{ fichaNome() }}
          </span>
        </div>
      </ng-template>

      <p-stepper [value]="stepAtivo()" (valueChange)="stepAtivo.set($event ?? 0)">
        <!-- Step 1: Atributos -->
        <p-step-list>
          <p-step [value]="0">Atributos</p-step>
          <p-step [value]="1">Aptidões</p-step>
          <p-step [value]="2">Vantagens</p-step>
        </p-step-list>

        <p-step-panels>
          <!-- Step 1: Distribuição de atributos -->
          <p-step-panel [value]="0">
            <ng-template #content>
              <app-level-up-atributos-step
                [atributos]="atributos()"
                [pontosDisponiveis]="pontosAtributoDisponiveis()"
                [limitadorAtributo]="limitadorAtributo()"
                (distribuicaoChanged)="distribuicaoAtributos.set($event)"
              />

              <div class="flex justify-content-end gap-2 p-3 pt-0">
                <p-button
                  label="Cancelar"
                  [text]="true"
                  severity="secondary"
                  (onClick)="tentarFechar()"
                />
                <p-button
                  label="Próximo: Aptidões"
                  icon="pi pi-arrow-right"
                  iconPos="right"
                  [loading]="salvando()"
                  [disabled]="salvando()"
                  (onClick)="salvarAtributos()"
                />
              </div>
            </ng-template>
          </p-step-panel>

          <!-- Step 2: Aptidões (TODO T9) -->
          <p-step-panel [value]="1">
            <ng-template #content>
              <!-- TODO T9: LevelUpAptidoesStepComponent -->
              <div class="p-4 text-center text-color-secondary">
                <i class="pi pi-list text-3xl mb-3 block"></i>
                <p>Distribuição de pontos de aptidão será implementada em T9.</p>
              </div>

              <div class="flex justify-content-between gap-2 p-3 pt-0">
                <p-button
                  label="Voltar"
                  icon="pi pi-arrow-left"
                  [text]="true"
                  severity="secondary"
                  (onClick)="stepAtivo.set(0)"
                />
                <p-button
                  label="Próximo: Vantagens"
                  icon="pi pi-arrow-right"
                  iconPos="right"
                  (onClick)="stepAtivo.set(2)"
                />
              </div>
            </ng-template>
          </p-step-panel>

          <!-- Step 3: Vantagens (TODO T10) -->
          <p-step-panel [value]="2">
            <ng-template #content>
              <!-- TODO T10: LevelUpVantagensStepComponent -->
              <div class="p-4 text-center text-color-secondary">
                <i class="pi pi-star text-3xl mb-3 block"></i>
                <p>Compra de vantagens será implementada em T10.</p>
              </div>

              <div class="flex justify-content-between gap-2 p-3 pt-0">
                <p-button
                  label="Voltar"
                  icon="pi pi-arrow-left"
                  [text]="true"
                  severity="secondary"
                  (onClick)="stepAtivo.set(1)"
                />
                <p-button
                  label="Concluir"
                  icon="pi pi-check"
                  severity="success"
                  (onClick)="fechar()"
                />
              </div>
            </ng-template>
          </p-step-panel>
        </p-step-panels>
      </p-stepper>
    </p-dialog>
  `,
})
export class LevelUpDialogComponent {
  // ---- Inputs ----
  fichaId = input.required<number>();
  nivelNovo = input.required<number>();
  fichaNome = input.required<string>();
  limitadorAtributo = input.required<number>();
  pontosAtributoDisponiveis = input.required<number>();
  pontosAptidaoDisponiveis = input.required<number>();
  pontosVantagemDisponiveis = input.required<number>();
  atributos = input.required<FichaAtributoResponse[]>();
  aptidoes = input.required<FichaAptidaoResponse[]>();

  // ---- Outputs ----
  fechado = output<void>();
  distribuicaoSalva = output<void>();

  // ---- Services ----
  private fichasApiService = inject(FichasApiService);
  private toastService = inject(ToastService);
  private confirmationService = inject(ConfirmationService);

  // ---- Estado interno ----
  protected stepAtivo = signal(0);
  protected salvando = signal(false);
  protected distribuicaoAtributos = signal<Record<string, number>>({});

  protected pontosAtributoPendentes = computed(
    () =>
      this.pontosAtributoDisponiveis() -
      Object.values(this.distribuicaoAtributos()).reduce((a, b) => a + b, 0)
  );

  // ---- Handlers ----

  protected salvarAtributos(): void {
    if (Object.keys(this.distribuicaoAtributos()).length === 0) {
      this.stepAtivo.set(1);
      return;
    }
    this.salvando.set(true);
    const dto: AtualizarAtributoDto[] = this.atributos().map((a) => ({
      atributoConfigId: a.atributoConfigId,
      base: a.base,
      nivel: a.nivel + (this.distribuicaoAtributos()[a.atributoAbreviacao] ?? 0),
      outros: a.outros,
    }));
    this.fichasApiService.atualizarAtributos(this.fichaId(), dto).subscribe({
      next: () => {
        this.salvando.set(false);
        this.stepAtivo.set(1);
        this.distribuicaoSalva.emit();
      },
      error: () => {
        this.salvando.set(false);
        this.toastService.error('Erro ao salvar atributos. Tente novamente.');
      },
    });
  }

  protected tentarFechar(): void {
    if (this.pontosAtributoPendentes() > 0) {
      this.confirmationService.confirm({
        header: 'Pontos não distribuídos',
        message:
          'Você ainda tem pontos de atributo para distribuir. Fechar agora?',
        acceptLabel: 'Sim, fechar',
        rejectLabel: 'Continuar',
        accept: () => this.fechado.emit(),
      });
    } else {
      this.fechado.emit();
    }
  }

  protected fechar(): void {
    this.fechado.emit();
  }

  protected onVisibleChange(visible: boolean): void {
    if (!visible) {
      this.tentarFechar();
    }
  }
}
