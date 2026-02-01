import { Component, signal, inject, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { Checkbox } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfigApiService } from '../../../../../core/services/api/config-api.service';
import { VantagemConfig, CategoriaVantagem } from '../../../../../core/models';

/**
 * Vantagens Config Component
 *
 * CRUD completo para Vantagens/Perícias
 *
 * Backend endpoints:
 * - GET /api/config/vantagens
 * - POST /api/config/vantagens
 * - PUT /api/config/vantagens/{id}
 * - DELETE /api/config/vantagens/{id}
 * - GET /api/config/categorias-vantagem (para dropdown)
 */
@Component({
  selector: 'app-vantagens-config',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    Dialog,
    InputTextModule,
    InputNumberModule,
    Select,
    Textarea,
    Checkbox,
    ToastModule,
    ConfirmDialog
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="surface-card shadow-2 border-round p-4">
      <div class="flex align-items-center justify-content-between mb-4">
        <div>
          <h2 class="text-2xl font-bold m-0 mb-2">
            <i class="pi pi-plus-circle text-primary mr-2"></i>
            Vantagens
          </h2>
          <p class="text-color-secondary m-0">Configure vantagens e perícias especiais</p>
        </div>
        <p-button icon="pi pi-plus" label="Nova Vantagem" (onClick)="openDialog()" />
      </div>

      <p-table [value]="items()" [paginator]="true" [rows]="10">
        <ng-template #header>
          <tr>
            <th pSortableColumn="nome">Nome <p-sortIcon field="nome" /></th>
            <th>Categoria</th>
            <th>Custo</th>
            <th>Ativo</th>
            <th style="width: 150px">Ações</th>
          </tr>
        </ng-template>
        <ng-template #body let-item>
          <tr>
            <td><span class="font-bold">{{ item.nome }}</span></td>
            <td>{{ item.categoriaVantagem?.nome || '-' }}</td>
            <td><span class="text-primary font-bold">{{ item.custo }} XP</span></td>
            <td>
              <i [class]="item.ativo ? 'pi pi-check-circle text-green-500' : 'pi pi-times-circle text-red-500'"></i>
            </td>
            <td>
              <div class="flex gap-2">
                <p-button icon="pi pi-pencil" [text]="true" [rounded]="true" (onClick)="openDialog(item)" />
                <p-button icon="pi pi-trash" [text]="true" [rounded]="true" severity="danger" (onClick)="confirmDelete(item.id)" />
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>

      <p-dialog [(visible)]="dialogVisible" [header]="editMode() ? 'Editar Vantagem' : 'Nova Vantagem'" [modal]="true" [style]="{ width: '500px' }">
        <form [formGroup]="form">
          <div class="flex flex-column gap-3">
            <div>
              <label class="block font-semibold mb-2">Nome *</label>
              <input pInputText formControlName="nome" class="w-full" placeholder="Ex: Ambidestria" />
            </div>
            <div>
              <label class="block font-semibold mb-2">Categoria *</label>
              <p-select
                formControlName="categoriaVantagemId"
                [options]="categorias()"
                optionLabel="nome"
                optionValue="id"
                placeholder="Selecione a categoria"
                class="w-full"
              />
            </div>
            <div>
              <label class="block font-semibold mb-2">Custo (XP) *</label>
              <p-inputnumber formControlName="custo" class="w-full" [showButtons]="true" [min]="0"></p-inputnumber>
            </div>
            <div>
              <label class="block font-semibold mb-2">Descrição *</label>
              <textarea pTextarea formControlName="descricao" class="w-full" rows="3"></textarea>
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
export class VantagensConfigComponent implements OnInit {
  private fb = inject(FormBuilder);
  private configApi = inject(ConfigApiService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private destroyRef = inject(DestroyRef);

  items = signal<VantagemConfig[]>([]);
  categorias = signal<CategoriaVantagem[]>([]);
  dialogVisible = signal(false);
  editMode = signal(false);
  editId = signal<number | null>(null);

  form: FormGroup = this.fb.group({
    nome: ['', Validators.required],
    categoriaVantagemId: [null as number | null, Validators.required],
    custo: [0, [Validators.required, Validators.min(0)]],
    descricao: ['', Validators.required],
    ativo: [true]
  });

  ngOnInit() {
    this.loadCategorias();
    this.loadItems();
  }

  loadCategorias() {
    this.configApi.listCategoriasVantagem()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => this.categorias.set(data));
  }

  loadItems() {
    this.configApi.listVantagens()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => this.items.set(data));
  }

  openDialog(item?: VantagemConfig) {
    if (item) {
      this.editMode.set(true);
      this.editId.set(item.id);
      this.form.patchValue(item);
    } else {
      this.editMode.set(false);
      this.editId.set(null);
      this.form.reset({ ativo: true, custo: 0 });
    }
    this.dialogVisible.set(true);
  }

  closeDialog() {
    this.dialogVisible.set(false);
    this.form.reset();
  }

  save() {
    if (this.form.invalid) return;

    const data: Partial<VantagemConfig> = this.form.value;
    const operation = this.editMode()
      ? this.configApi.updateVantagem(this.editId()!, data)
      : this.configApi.createVantagem(data);

    operation.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: this.editMode() ? 'Vantagem atualizada' : 'Vantagem criada'
      });
      this.closeDialog();
      this.loadItems();
    });
  }

  confirmDelete(id: number) {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir esta vantagem?',
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => this.delete(id)
    });
  }

  delete(id: number) {
    this.configApi.deleteVantagem(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Vantagem excluída'
        });
        this.loadItems();
      });
  }
}
