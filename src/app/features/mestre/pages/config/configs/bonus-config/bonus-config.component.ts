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
import { BonusConfig } from '../../../../../../core/models';
import { BonusConfigService } from '../../../../../../core/services/business/config';
import { uniqueNameValidator } from '../../../../../../shared/validators/config-validators';

@Component({
  selector: 'app-bonus-config',
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
  templateUrl: './bonus-config.component.html'
})
export class BonusConfigComponent extends BaseConfigComponent<
  BonusConfig,
  BonusConfigService
> {
  protected service = inject(BonusConfigService);
  private confirmationService = inject(ConfirmationService);

  protected getEntityName(): string {
    return 'Bônus';
  }

  protected getEntityNamePlural(): string {
    return 'Bônus';
  }

  protected buildForm(): FormGroup {
    return this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      descricao: ['', [Validators.maxLength(500)]],
      valor: [0, [Validators.required]],
      tipo: ['', [Validators.required, Validators.maxLength(50)]],
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

  override openDialog(item?: BonusConfig): void {
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
