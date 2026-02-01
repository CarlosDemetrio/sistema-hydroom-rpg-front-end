import { Component, signal, inject, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfigApiService } from '../../../../../core/services/api/config-api.service';
import { NivelConfig } from '../../../../../core/models';

/**
 * Níveis Config Component
 *
 * CRUD completo para Níveis (tabela de progressão de XP)
 *
 * Backend endpoints:
 * - GET /api/config/niveis
 * - POST /api/config/niveis
 * - PUT /api/config/niveis/{id}
 * - DELETE /api/config/niveis/{id}
 */
@Component({
  selector: 'app-niveis-config',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    Dialog,
    InputNumberModule,
    ToastModule,
    ConfirmDialog
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="surface-card shadow-2 border-round p-4">
      <div class="flex align-items-center justify-content-between mb-4">
        <div>
          <h2 class="text-2xl font-bold m-0 mb-2">
            <i class="pi pi-chart-line text-primary mr-2"></i>
            Níveis
          </h2>
          <p class="text-color-secondary m-0">
            Configure a progressão de XP e bônus por nível
          </p>
        </div>
        <p-button icon="pi pi-plus" label="Novo Nível" (onClick)="openDialog()" />
      </div>

      <p-table [value]="items()" [paginator]="true" [rows]="10">
        <ng-template #header>
          <tr>
            <th pSortableColumn="nivel">Nível <p-sortIcon field="nivel" /></th>
            <th>XP Mínimo</th>
            <th>XP Máximo</th>
            <th>Bônus Atributo</th>
            <th style="width: 150px">Ações</th>
          </tr>
        </ng-template>
        <ng-template #body let-item>
          <tr>
            <td><span class="font-bold text-primary text-xl">{{ item.nivel }}</span></td>
            <td>{{ item.xpMinimo }}</td>
            <td>{{ item.xpMaximo }}</td>
            <td><span class="font-bold text-green-500">+{{ item.bonusAtributo }}</span></td>
            <td>
              <div class="flex gap-2">
                <p-button icon="pi pi-pencil" [text]="true" [rounded]="true" (onClick)="openDialog(item)" />
                <p-button icon="pi pi-trash" [text]="true" [rounded]="true" severity="danger" (onClick)="confirmDelete(item.id)" />
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>

      <p-dialog [(visible)]="dialogVisible" [header]="editMode() ? 'Editar Nível' : 'Novo Nível'" [modal]="true" [style]="{ width: '500px' }">
        <form [formGroup]="form">
          <div class="flex flex-column gap-3">
            <div>
              <label class="block font-semibold mb-2">Nível *</label>
              <p-inputnumber formControlName="nivel" class="w-full" [showButtons]="true" [min]="1"></p-inputnumber>
            </div>
            <div>
              <label class="block font-semibold mb-2">XP Mínimo *</label>
              <p-inputnumber formControlName="xpMinimo" class="w-full" [showButtons]="true" [min]="0"></p-inputnumber>
            </div>
            <div>
              <label class="block font-semibold mb-2">XP Máximo *</label>
              <p-inputnumber formControlName="xpMaximo" class="w-full" [showButtons]="true" [min]="0"></p-inputnumber>
            </div>
            <div>
              <label class="block font-semibold mb-2">Bônus Atributo *</label>
              <p-inputnumber formControlName="bonusAtributo" class="w-full" [showButtons]="true" [min]="0"></p-inputnumber>
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
export class NiveisConfigComponent implements OnInit {
  private fb = inject(FormBuilder);
  private configApi = inject(ConfigApiService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private destroyRef = inject(DestroyRef);

  items = signal<NivelConfig[]>([]);
  dialogVisible = signal(false);
  editMode = signal(false);
  editId = signal<number | null>(null);

  form: FormGroup = this.fb.group({
    nivel: [1, [Validators.required, Validators.min(1)]],
    xpMinimo: [0, [Validators.required, Validators.min(0)]],
    xpMaximo: [0, [Validators.required, Validators.min(0)]],
    bonusAtributo: [1, [Validators.required, Validators.min(0)]]
  });

  ngOnInit() {
    this.loadItems();
  }

  loadItems() {
    this.configApi.listNiveis()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => this.items.set(data));
  }

  openDialog(item?: NivelConfig) {
    if (item) {
      this.editMode.set(true);
      this.editId.set(item.id);
      this.form.patchValue(item);
    } else {
      this.editMode.set(false);
      this.editId.set(null);
      this.form.reset({ nivel: 1, xpMinimo: 0, xpMaximo: 0, bonusAtributo: 1 });
    }
    this.dialogVisible.set(true);
  }

  closeDialog() {
    this.dialogVisible.set(false);
    this.form.reset();
  }

  save() {
    if (this.form.invalid) return;

    const data: Partial<NivelConfig> = this.form.value;
    const operation = this.editMode()
      ? this.configApi.updateNivel(this.editId()!, data)
      : this.configApi.createNivel(data);

    operation.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: this.editMode() ? 'Nível atualizado' : 'Nível criado'
      });
      this.closeDialog();
      this.loadItems();
    });
  }

  confirmDelete(id: number) {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir este nível?',
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => this.delete(id)
    });
  }

  delete(id: number) {
    this.configApi.deleteNivel(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Nível excluído'
        });
        this.loadItems();
      });
  }
}
