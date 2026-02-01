import { Component, signal, inject, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfigApiService } from '../../../../../core/services/api/config-api.service';
import { PresencaConfig } from '../../../../../core/models';

/**
 * Presenças Config Component
 *
 * CRUD completo para Presenças
 *
 * Backend endpoints:
 * - GET /api/config/presencas
 * - POST /api/config/presencas
 * - PUT /api/config/presencas/{id}
 * - DELETE /api/config/presencas/{id}
 */
@Component({
  selector: 'app-presencas-config',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    Dialog,
    InputTextModule,
    Textarea,
    ToastModule,
    ConfirmDialog
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="surface-card shadow-2 border-round p-4">
      <div class="flex align-items-center justify-content-between mb-4">
        <div>
          <h2 class="text-2xl font-bold m-0 mb-2">
            <i class="pi pi-eye text-primary mr-2"></i>
            Presenças
          </h2>
          <p class="text-color-secondary m-0">Configure as presenças disponíveis</p>
        </div>
        <p-button icon="pi pi-plus" label="Nova Presença" (onClick)="openDialog()" />
      </div>

      <p-table [value]="items()" [paginator]="true" [rows]="10">
        <ng-template #header>
          <tr>
            <th pSortableColumn="nome">Nome <p-sortIcon field="nome" /></th>
            <th>Descrição</th>
            <th>Efeito</th>
            <th style="width: 150px">Ações</th>
          </tr>
        </ng-template>
        <ng-template #body let-item>
          <tr>
            <td><span class="font-bold">{{ item.nome }}</span></td>
            <td>{{ item.descricao || '-' }}</td>
            <td>{{ item.efeito || '-' }}</td>
            <td>
              <div class="flex gap-2">
                <p-button icon="pi pi-pencil" [text]="true" [rounded]="true" (onClick)="openDialog(item)" />
                <p-button icon="pi pi-trash" [text]="true" [rounded]="true" severity="danger" (onClick)="confirmDelete(item.id)" />
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>

      <p-dialog [(visible)]="dialogVisible" [header]="editMode() ? 'Editar Presença' : 'Nova Presença'" [modal]="true" [style]="{ width: '500px' }">
        <form [formGroup]="form">
          <div class="flex flex-column gap-3">
            <div>
              <label class="block font-semibold mb-2">Nome *</label>
              <input pInputText formControlName="nome" class="w-full" />
            </div>
            <div>
              <label class="block font-semibold mb-2">Descrição *</label>
              <textarea pTextarea formControlName="descricao" class="w-full" rows="3"></textarea>
            </div>
            <div>
              <label class="block font-semibold mb-2">Efeito *</label>
              <textarea pTextarea formControlName="efeito" class="w-full" rows="2"></textarea>
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
export class PresencasConfigComponent implements OnInit {
  private fb = inject(FormBuilder);
  private configApi = inject(ConfigApiService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private destroyRef = inject(DestroyRef);

  items = signal<PresencaConfig[]>([]);
  dialogVisible = signal(false);
  editMode = signal(false);
  editId = signal<number | null>(null);

  form: FormGroup = this.fb.group({
    nome: ['', Validators.required],
    descricao: ['', Validators.required],
    efeito: ['', Validators.required]
  });

  ngOnInit() {
    this.loadItems();
  }

  loadItems() {
    this.configApi.listPresencas()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => this.items.set(data));
  }

  openDialog(item?: PresencaConfig) {
    if (item) {
      this.editMode.set(true);
      this.editId.set(item.id);
      this.form.patchValue(item);
    } else {
      this.editMode.set(false);
      this.editId.set(null);
      this.form.reset();
    }
    this.dialogVisible.set(true);
  }

  closeDialog() {
    this.dialogVisible.set(false);
    this.form.reset();
  }

  save() {
    if (this.form.invalid) return;

    const data: Partial<PresencaConfig> = this.form.value;
    const operation = this.editMode()
      ? this.configApi.updatePresenca(this.editId()!, data)
      : this.configApi.createPresenca(data);

    operation.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: this.editMode() ? 'Presença atualizada' : 'Presença criada'
      });
      this.closeDialog();
      this.loadItems();
    });
  }

  confirmDelete(id: number) {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir esta presença?',
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => this.delete(id)
    });
  }

  delete(id: number) {
    this.configApi.deletePresenca(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Presença excluída'
        });
        this.loadItems();
      });
  }
}
