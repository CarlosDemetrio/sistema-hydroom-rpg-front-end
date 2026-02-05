import { Component, inject } from '@angular/core';
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
import { BaseConfigComponent } from '../../../../../../shared/components/base-config/base-config.component';
import { GeneroConfig } from '../../../../../../core/models';
import { GeneroConfigService } from '../../../../../../core/services/business/config';
import { uniqueNameValidator } from '../../../../../../shared/validators/config-validators';

@Component({
  selector: 'app-generos-config',
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
    TagModule
  ],
  providers: [ConfirmationService],
  templateUrl: './generos-config.component.html'
})
export class GenerosConfigComponent extends BaseConfigComponent<
  GeneroConfig,
  GeneroConfigService
> {
  protected service = inject(GeneroConfigService);
  private confirmationService = inject(ConfirmationService);

  protected getEntityName(): string {
    return 'Gênero';
  }

  protected getEntityNamePlural(): string {
    return 'Gêneros';
  }

  protected buildForm(): FormGroup {
    return this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      descricao: ['', [Validators.maxLength(500)]],
      ordemExibicao: [1, [Validators.required, Validators.min(1)]],
      ativo: [true]
    });
  }

  override confirmDelete(id: number): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir este ${this.getEntityName()}?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => this.delete(id)
    });
  }

  override openDialog(item?: GeneroConfig): void {
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
