import { Component, signal, inject, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { Select } from 'primeng/select';
import { Checkbox } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfigApiService } from '../../../../../core/services/api/config-api.service';
import { AptidaoConfig, TipoAptidao } from '../../../../../core/models';

/**
 * Aptidões Config Component
 *
 * CRUD completo para Aptidões (Perícias/Habilidades)
 *
 * Backend endpoints:
 * - GET /api/config/aptidoes
 * - POST /api/config/aptidoes
 * - PUT /api/config/aptidoes/{id}
 * - DELETE /api/config/aptidoes/{id}
 * - GET /api/config/tipos-aptidao (para dropdown FISICO/MENTAL)
 */
@Component({
  selector: 'app-aptidoes-config',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    Dialog,
    InputTextModule,
    InputNumberModule,
    Select,
    Checkbox,
    ToastModule,
    ConfirmDialog
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="surface-card shadow-2 border-round p-4">
      <!-- Header -->
      <div class="flex align-items-center justify-content-between mb-4">
        <div>
          <h2 class="text-2xl font-bold m-0 mb-2">
            <i class="pi pi-book text-primary mr-2"></i>
            Aptidões
          </h2>
          <p class="text-color-secondary m-0">
            Configure as perícias e habilidades do sistema
          </p>
        </div>
        <p-button
          icon="pi pi-plus"
          label="Nova Aptidão"
          (onClick)="openDialog()"
        />
      </div>

      <!-- Table -->
      <p-table
        [value]="items()"
        [paginator]="true"
        [rows]="10"
      >
        <ng-template #header>
          <tr>
            <th pSortableColumn="nome">Nome <p-sortIcon field="nome" /></th>
            <th>Tipo</th>
            <th pSortableColumn="ordem">Ordem <p-sortIcon field="ordem" /></th>
            <th>Ativo</th>
            <th style="width: 150px">Ações</th>
          </tr>
        </ng-template>
        <ng-template #body let-item>
          <tr>
            <td><span class="font-bold">{{ item.nome }}</span></td>
            <td>
              <span [class]="item.tipoAptidao?.nome === 'FISICO' ? 'text-red-500' : 'text-blue-500'">
                {{ item.tipoAptidao?.nome || '-' }}
              </span>
            </td>
            <td>{{ item.ordem }}</td>
            <td>
              <i [class]="item.ativo ? 'pi pi-check-circle text-green-500' : 'pi pi-times-circle text-red-500'"></i>
            </td>
            <td>
              <div class="flex gap-2">
                <p-button
                  icon="pi pi-pencil"
                  [text]="true"
                  [rounded]="true"
                  severity="info"
                  (onClick)="openDialog(item)"
                />
                <p-button
                  icon="pi pi-trash"
                  [text]="true"
                  [rounded]="true"
                  severity="danger"
                  (onClick)="confirmDelete(item.id)"
                />
              </div>
            </td>
          </tr>
        </ng-template>
        <ng-template #emptymessage>
          <tr>
            <td colspan="5" class="text-center py-6">
              <i class="pi pi-inbox text-4xl text-color-secondary mb-3 block"></i>
              <p class="text-lg">Nenhuma aptidão cadastrada</p>
            </td>
          </tr>
        </ng-template>
      </p-table>

      <!-- Dialog -->
      <p-dialog
        [(visible)]="dialogVisible"
        [header]="editMode() ? 'Editar Aptidão' : 'Nova Aptidão'"
        [modal]="true"
        [style]="{ width: '500px' }"
      >
        <form [formGroup]="form" (ngSubmit)="save()">
          <div class="flex flex-column gap-3">
            <div>
              <label class="block font-semibold mb-2">Nome *</label>
              <input pInputText formControlName="nome" class="w-full" placeholder="Ex: Espadas" />
            </div>

            <div>
              <label class="block font-semibold mb-2">Tipo *</label>
              <p-select
                formControlName="tipoAptidaoId"
                [options]="tiposAptidao()"
                optionLabel="nome"
                optionValue="id"
                placeholder="Selecione o tipo"
                class="w-full"
              />
              <small class="text-color-secondary">FISICO (físicas) ou MENTAL (mentais)</small>
            </div>

            <div>
              <label class="block font-semibold mb-2">Ordem *</label>
              <p-inputnumber formControlName="ordem"
                             class="w-full" [showButtons]="true" [min]="1" />
              <small class="text-color-secondary">Ordem de exibição na lista</small>
            </div>

            <div class="flex align-items-center gap-2">
              <p-checkbox formControlName="ativo" [binary]="true" inputId="ativo" />
              <label for="ativo" class="cursor-pointer">Ativo</label>
            </div>
          </div>
        </form>

        <ng-template #footer>
          <div class="flex gap-2 justify-content-end">
            <p-button label="Cancelar" [text]="true" (onClick)="closeDialog()" />
            <p-button label="Salvar" (onClick)="save()" [disabled]="form.invalid" />
          </div>
        </ng-template>
      </p-dialog>

      <p-toast />
      <p-confirmDialog />
    </div>
  `
})
export class AptidoesConfigComponent implements OnInit {
  private fb = inject(FormBuilder);
  private configApi = inject(ConfigApiService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private destroyRef = inject(DestroyRef);

  items = signal<AptidaoConfig[]>([]);
  tiposAptidao = signal<TipoAptidao[]>([]);
  dialogVisible = signal(false);
  editMode = signal(false);
  editId = signal<number | null>(null);

  form: FormGroup = this.fb.group({
    nome: ['', Validators.required],
    tipoAptidaoId: [null as number | null, Validators.required],
    ordem: [1, [Validators.required, Validators.min(1)]],
    ativo: [true]
  });

  ngOnInit() {
    this.loadTiposAptidao();
    this.loadItems();
  }

  loadTiposAptidao() {
    this.configApi.listTiposAptidao()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((tipos) => this.tiposAptidao.set(tipos));
  }

  loadItems() {
    this.configApi.listAptidoes()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => this.items.set(data));
  }

  openDialog(item?: AptidaoConfig) {
    if (item) {
      this.editMode.set(true);
      this.editId.set(item.id);
      this.form.patchValue({
        nome: item.nome,
        tipoAptidaoId: item.tipoAptidaoId,
        ordem: item.ordem,
        ativo: item.ativo
      });
    } else {
      this.editMode.set(false);
      this.editId.set(null);
      this.form.reset({ ativo: true, ordem: 1 });
    }
    this.dialogVisible.set(true);
  }

  closeDialog() {
    this.dialogVisible.set(false);
    this.form.reset();
  }

  save() {
    if (this.form.invalid) return;

    const data: Partial<AptidaoConfig> = {
      nome: this.form.value.nome,
      tipoAptidaoId: this.form.value.tipoAptidaoId,
      ordem: this.form.value.ordem,
      ativo: this.form.value.ativo
    };

    const operation = this.editMode()
      ? this.configApi.updateAptidao(this.editId()!, data)
      : this.configApi.createAptidao(data);

    operation.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: this.editMode() ? 'Aptidão atualizada' : 'Aptidão criada'
      });
      this.closeDialog();
      this.loadItems();
    });
  }

  confirmDelete(id: number) {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir esta aptidão?',
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => this.delete(id)
    });
  }

  delete(id: number) {
    this.configApi.deleteAptidao(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Aptidão excluída'
        });
        this.loadItems();
      });
  }
}
