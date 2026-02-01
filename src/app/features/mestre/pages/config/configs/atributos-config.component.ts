import { Component, signal, inject, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { Textarea } from 'primeng/textarea';
import { Checkbox } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfigApiService } from '../../../../../core/services/api/config-api.service';
import { AtributoConfig } from '../../../../../core/models';

/**
 * Atributos Config Component
 *
 * CRUD completo para Atributos (FOR, DES, CON, INT, SAB, CAR, etc.)
 *
 * Backend endpoints:
 * - GET /api/config/atributos
 * - POST /api/config/atributos
 * - PUT /api/config/atributos/{id}
 * - DELETE /api/config/atributos/{id}
 */
@Component({
  selector: 'app-atributos-config',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    Dialog,
    InputTextModule,
    InputNumberModule,
    Textarea,
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
            <i class="pi pi-star text-primary mr-2"></i>
            Atributos
          </h2>
          <p class="text-color-secondary m-0">
            Configure os atributos base do sistema (FOR, DES, CON, etc.)
          </p>
        </div>
        <p-button
          icon="pi pi-plus"
          label="Novo Atributo"
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
            <th>Abreviação</th>
            <th pSortableColumn="ordem">Ordem <p-sortIcon field="ordem" /></th>
            <th>Fórmula</th>
            <th>Ativo</th>
            <th style="width: 150px">Ações</th>
          </tr>
        </ng-template>
        <ng-template #body let-item>
          <tr>
            <td><span class="font-bold">{{ item.nome }}</span></td>
            <td><span class="text-primary font-bold">{{ item.abreviacao }}</span></td>
            <td>{{ item.ordem }}</td>
            <td><code class="text-sm">{{ item.formulaCalculo || '-' }}</code></td>
            <td>
              <i [class]="item.ativo ? 'pi pi-check-circle text-green-500' : 'pi pi-times-circle text-red-500'"></i>
            </td>
            <td>
              <div class="flex gap-2">
                <p-button
                  icon="pi pi-pencil"
                  [text]="true"
                  [rounded]="true"
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
            <td colspan="6" class="text-center py-6">
              <i class="pi pi-inbox text-4xl text-color-secondary mb-3 block"></i>
              <p class="text-lg">Nenhum atributo cadastrado</p>
            </td>
          </tr>
        </ng-template>
      </p-table>

      <!-- Dialog -->
      <p-dialog
        [(visible)]="dialogVisible"
        [header]="editMode() ? 'Editar Atributo' : 'Novo Atributo'"
        [modal]="true"
        [style]="{ width: '500px' }"
      >
        <form [formGroup]="form" (ngSubmit)="save()">
          <div class="flex flex-column gap-3">
            <div>
              <label class="block font-semibold mb-2">Nome *</label>
              <input pInputText formControlName="nome" class="w-full" placeholder="Ex: Força" />
            </div>

            <div>
              <label class="block font-semibold mb-2">Abreviação *</label>
              <input pInputText formControlName="abreviacao" class="w-full" placeholder="Ex: FOR" maxlength="5" />
              <small class="text-color-secondary">2-5 caracteres em maiúsculo</small>
            </div>

            <div>
              <label class="block font-semibold mb-2">Ordem *</label>
              <p-inputnumber formControlName="ordem" class="w-full" [showButtons]="true" [min]="1"></p-inputnumber>
              <small class="text-color-secondary">Ordem de exibição na lista</small>
            </div>

            <div>
              <label class="block font-semibold mb-2">Fórmula de Cálculo</label>
              <textarea pTextarea formControlName="formulaCalculo" class="w-full" rows="2" placeholder="Ex: (FOR + AGI) / 2"></textarea>
              <small class="text-color-secondary">Opcional: para atributos derivados</small>
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
export class AtributosConfigComponent implements OnInit {
  private fb = inject(FormBuilder);
  private configApi = inject(ConfigApiService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private destroyRef = inject(DestroyRef);

  items = signal<AtributoConfig[]>([]);
  dialogVisible = signal(false);
  editMode = signal(false);
  editId = signal<number | null>(null);

  form: FormGroup = this.fb.group({
    nome: ['', Validators.required],
    abreviacao: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(5)]],
    ordem: [1, [Validators.required, Validators.min(1)]],
    formulaCalculo: [''],
    ativo: [true]
  });

  ngOnInit() {
    this.loadItems();
  }

  loadItems() {
    this.configApi.listAtributos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => this.items.set(data));
  }

  openDialog(item?: AtributoConfig) {
    if (item) {
      this.editMode.set(true);
      this.editId.set(item.id);
      this.form.patchValue({
        nome: item.nome,
        abreviacao: item.abreviacao,
        ordem: item.ordem,
        formulaCalculo: item.formulaCalculo || '',
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

    const data: Partial<AtributoConfig> = {
      nome: this.form.value.nome,
      abreviacao: this.form.value.abreviacao,
      ordem: this.form.value.ordem,
      formulaCalculo: this.form.value.formulaCalculo || undefined,
      ativo: this.form.value.ativo
    };

    const operation = this.editMode()
      ? this.configApi.updateAtributo(this.editId()!, data)
      : this.configApi.createAtributo(data);

    operation.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: this.editMode() ? 'Atributo atualizado' : 'Atributo criado'
      });
      this.closeDialog();
      this.loadItems();
    });
  }

  confirmDelete(id: number) {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir este atributo?',
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => this.delete(id)
    });
  }

  delete(id: number) {
    this.configApi.deleteAtributo(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Atributo excluído'
        });
        this.loadItems();
      });
  }
}
