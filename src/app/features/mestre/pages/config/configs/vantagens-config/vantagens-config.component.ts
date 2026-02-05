import { Component, inject, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { BaseConfigComponent } from '../../../../../../shared/components/base-config/base-config.component';
import { VantagemConfig, CategoriaVantagem } from '../../../../../../core/models';
import { VantagemConfigService } from '../../../../../../core/services/business/config';
import { ConfigApiService } from '../../../../../../core/services/api/config-api.service';
import { uniqueNameValidator } from '../../../../../../shared/validators/config-validators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/**
 * Componente de configuração de Vantagens
 * Gerencia vantagens/perks do sistema
 */
@Component({
  selector: 'app-vantagens-config',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    ConfirmDialogModule,
    DialogModule,
    InputTextModule,
    TableModule,
    CheckboxModule,
    InputNumberModule,
    TooltipModule,
    TagModule,
    SelectModule
  ],
  providers: [ConfirmationService],
  templateUrl: './vantagens-config.component.html'
})
export class VantagensConfigComponent extends BaseConfigComponent<
  VantagemConfig,
  VantagemConfigService
> {
  protected service = inject(VantagemConfigService);
  private confirmationService = inject(ConfirmationService);
  private configApi = inject(ConfigApiService);

  categoriasVantagem = signal<CategoriaVantagem[]>([]);

  protected getEntityName(): string {
    return 'Vantagem';
  }

  protected getEntityNamePlural(): string {
    return 'Vantagens';
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.loadCategoriasVantagem();
  }

  protected buildForm(): FormGroup {
    return this.fb.group({
      nome: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50)
      ]],
      categoriaVantagemId: [null, [Validators.required]],
      custo: [0, [Validators.required, Validators.min(0)]],
      descricao: ['', [Validators.maxLength(500)]],
      ordemExibicao: [1, [Validators.required, Validators.min(1)]],
      ativo: [true]
    });
  }

  private loadCategoriasVantagem(): void {
    this.configApi.listCategoriasVantagem()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (categorias) => {
          this.categoriasVantagem.set(categorias);
        }
      });
  }

  override confirmDelete(id: number): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir esta ${this.getEntityName()}?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => this.delete(id)
    });
  }

  override openDialog(item?: VantagemConfig): void {
    super.openDialog(item);

    const nomeControl = this.form.get('nome');
    if (nomeControl) {
      const currentId = item?.id || null;
      nomeControl.setValidators([
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        uniqueNameValidator(this.items(), currentId)
      ]);
      nomeControl.updateValueAndValidity();
    }
  }
}
