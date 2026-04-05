import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
  effect,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import {
  ClassePersonagem,
  GeneroConfig,
  IndoleConfig,
  PresencaConfig,
  Raca,
} from '@core/models/config.models';
import { FormPasso1 } from '../../ficha-wizard.types';

/**
 * StepIdentificacaoComponent (DUMB)
 *
 * Passo 1 do Wizard de Ficha: dados de identificacao do personagem.
 *
 * Inputs:
 * - jogoId: ID do jogo atual
 * - generos, racas, classesFiltradas, indoles, presencas: listas de opcoes
 * - isMestre: se true, exibe toggle isNpc e campo descricao NPC
 * - dadosIniciais: FormPasso1 para preenchimento inicial (retomada de rascunho)
 *
 * Outputs:
 * - formChanged: emite o estado atual do formulario a cada mudanca
 * - racaSelecionada: emite o racaId selecionado (ou null) para o wizard filtrar classes
 */
@Component({
  selector: 'app-step-identificacao',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    InputTextModule,
    SelectModule,
    TextareaModule,
    ToggleSwitchModule,
    CardModule,
    DividerModule,
  ],
  template: `
    <p-card>
      <ng-template #header>
        <div class="flex align-items-center gap-2 p-3 pb-0">
          <i class="pi pi-user text-primary text-xl"></i>
          <h3 class="text-xl font-bold m-0">Identificacao do Personagem</h3>
        </div>
      </ng-template>

      <div class="grid">

        <!-- Toggle NPC (visivel apenas para Mestre) -->
        @if (isMestre()) {
          <div class="col-12">
            <div class="flex align-items-center gap-3 p-3 border-round surface-100">
              <p-toggleswitch
                [ngModel]="isNpcLocal()"
                (ngModelChange)="onIsNpcChange($event)"
                inputId="isNpc"
              ></p-toggleswitch>
              <label for="isNpc" class="cursor-pointer font-semibold">
                Este personagem e um NPC (Non-Player Character)
              </label>
            </div>
          </div>
        }

        <!-- Nome do Personagem -->
        <div class="col-12">
          <label for="nome" class="block font-semibold mb-2">
            Nome do Personagem <span class="text-red-500">*</span>
          </label>
          <input
            id="nome"
            type="text"
            pInputText
            [ngModel]="nomeLocal()"
            (ngModelChange)="onNomeChange($event)"
            placeholder="Digite o nome do personagem"
            class="w-full"
            maxlength="100"
          />
          @if (nomeLocal().trim().length > 0 && nomeLocal().trim().length < 2) {
            <small class="text-red-500 mt-1 block">Nome deve ter pelo menos 2 caracteres</small>
          }
        </div>

        <!-- Genero -->
        <div class="col-12 md:col-6">
          <label for="genero" class="block font-semibold mb-2">
            Genero <span class="text-red-500">*</span>
          </label>
          <p-select
            inputId="genero"
            [options]="generos()"
            [ngModel]="generoIdLocal()"
            (ngModelChange)="onGeneroChange($event)"
            optionLabel="nome"
            optionValue="id"
            placeholder="Selecione um genero"
            [showClear]="true"
            class="w-full"
            styleClass="w-full"
          ></p-select>
        </div>

        <!-- Raca -->
        <div class="col-12 md:col-6">
          <label for="raca" class="block font-semibold mb-2">
            Raca <span class="text-red-500">*</span>
          </label>
          <p-select
            inputId="raca"
            [options]="racas()"
            [ngModel]="racaIdLocal()"
            (ngModelChange)="onRacaChange($event)"
            optionLabel="nome"
            optionValue="id"
            placeholder="Selecione uma raca"
            [showClear]="true"
            class="w-full"
            styleClass="w-full"
          ></p-select>
        </div>

        <!-- Classe (filtrada por raca) -->
        <div class="col-12 md:col-6">
          <label for="classe" class="block font-semibold mb-2">
            Classe <span class="text-red-500">*</span>
          </label>
          <p-select
            inputId="classe"
            [options]="classesFiltradas()"
            [ngModel]="classeIdLocal()"
            (ngModelChange)="onClasseChange($event)"
            optionLabel="nome"
            optionValue="id"
            placeholder="Selecione uma classe"
            [showClear]="true"
            [disabled]="!racaIdLocal()"
            class="w-full"
            styleClass="w-full"
          ></p-select>
          @if (!racaIdLocal()) {
            <small class="text-color-secondary mt-1 block">Selecione uma raca primeiro</small>
          }
        </div>

        <!-- Indole -->
        <div class="col-12 md:col-6">
          <label for="indole" class="block font-semibold mb-2">
            Indole <span class="text-red-500">*</span>
          </label>
          <p-select
            inputId="indole"
            [options]="indoles()"
            [ngModel]="indoleIdLocal()"
            (ngModelChange)="onIndoleChange($event)"
            optionLabel="nome"
            optionValue="id"
            placeholder="Selecione uma indole"
            [showClear]="true"
            class="w-full"
            styleClass="w-full"
          ></p-select>
        </div>

        <!-- Presenca -->
        <div class="col-12 md:col-6">
          <label for="presenca" class="block font-semibold mb-2">
            Presenca <span class="text-red-500">*</span>
          </label>
          <p-select
            inputId="presenca"
            [options]="presencas()"
            [ngModel]="presencaIdLocal()"
            (ngModelChange)="onPresencaChange($event)"
            optionLabel="nome"
            optionValue="id"
            placeholder="Selecione uma presenca"
            [showClear]="true"
            class="w-full"
            styleClass="w-full"
          ></p-select>
        </div>

        <!-- Descricao do NPC (visivel apenas quando isNpc = true) -->
        @if (isNpcLocal()) {
          <div class="col-12">
            <p-divider></p-divider>
            <label for="descricao" class="block font-semibold mb-2">
              Descricao do NPC
            </label>
            <textarea
              id="descricao"
              pTextarea
              [ngModel]="descricaoLocal()"
              (ngModelChange)="onDescricaoChange($event)"
              placeholder="Descricao opcional do NPC (backstory, notas do mestre...)"
              rows="4"
              class="w-full"
              maxlength="1000"
            ></textarea>
          </div>
        }

      </div>
    </p-card>
  `,
})
export class StepIdentificacaoComponent {
  jogoId = input.required<number>();
  generos = input.required<GeneroConfig[]>();
  racas = input.required<Raca[]>();
  classesFiltradas = input.required<ClassePersonagem[]>();
  indoles = input.required<IndoleConfig[]>();
  presencas = input.required<PresencaConfig[]>();
  isMestre = input<boolean>(false);
  dadosIniciais = input<FormPasso1 | null>(null);

  formChanged = output<FormPasso1>();
  racaSelecionada = output<number | null>();

  // Estado local dos campos (signals individuais para controle granular)
  nomeLocal = signal<string>('');
  generoIdLocal = signal<number | null>(null);
  racaIdLocal = signal<number | null>(null);
  classeIdLocal = signal<number | null>(null);
  indoleIdLocal = signal<number | null>(null);
  presencaIdLocal = signal<number | null>(null);
  isNpcLocal = signal<boolean>(false);
  descricaoLocal = signal<string | null>(null);

  constructor() {
    // Quando dadosIniciais muda, sincroniza os campos locais
    effect(() => {
      const dados = this.dadosIniciais();
      if (dados) {
        this.nomeLocal.set(dados.nome);
        this.generoIdLocal.set(dados.generoId);
        this.racaIdLocal.set(dados.racaId);
        this.classeIdLocal.set(dados.classeId);
        this.indoleIdLocal.set(dados.indoleId);
        this.presencaIdLocal.set(dados.presencaId);
        this.isNpcLocal.set(dados.isNpc);
        this.descricaoLocal.set(dados.descricao);
      }
    });
  }

  onNomeChange(valor: string): void {
    this.nomeLocal.set(valor ?? '');
    this.emitirFormChanged();
  }

  onGeneroChange(id: number | null): void {
    this.generoIdLocal.set(id);
    this.emitirFormChanged();
  }

  onRacaChange(id: number | null): void {
    this.racaIdLocal.set(id);
    this.racaSelecionada.emit(id);
    // Classe sera resetada pelo wizard via classesFiltradas; apenas emite o form
    this.emitirFormChanged();
  }

  onClasseChange(id: number | null): void {
    this.classeIdLocal.set(id);
    this.emitirFormChanged();
  }

  onIndoleChange(id: number | null): void {
    this.indoleIdLocal.set(id);
    this.emitirFormChanged();
  }

  onPresencaChange(id: number | null): void {
    this.presencaIdLocal.set(id);
    this.emitirFormChanged();
  }

  onIsNpcChange(valor: boolean): void {
    this.isNpcLocal.set(valor);
    if (!valor) {
      this.descricaoLocal.set(null);
    }
    this.emitirFormChanged();
  }

  onDescricaoChange(valor: string): void {
    this.descricaoLocal.set(valor || null);
    this.emitirFormChanged();
  }

  private emitirFormChanged(): void {
    this.formChanged.emit({
      nome: this.nomeLocal(),
      generoId: this.generoIdLocal(),
      racaId: this.racaIdLocal(),
      classeId: this.classeIdLocal(),
      indoleId: this.indoleIdLocal(),
      presencaId: this.presencaIdLocal(),
      isNpc: this.isNpcLocal(),
      descricao: this.descricaoLocal(),
    });
  }
}
