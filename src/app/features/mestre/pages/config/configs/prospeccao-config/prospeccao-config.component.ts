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
import { ProspeccaoConfig } from '../../../../../../core/models';
import { ProspeccaoConfigService } from '../../../../../../core/services/business/config';

@Component({
  selector: 'app-prospeccao-config',
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
  templateUrl: './prospeccao-config.component.html'
})
export class ProspeccaoConfigComponent extends BaseConfigComponent<
  ProspeccaoConfig,
  ProspeccaoConfigService
> {
  protected service = inject(ProspeccaoConfigService);
  private confirmationService = inject(ConfirmationService);

  protected getEntityName(): string {
    return 'Dado de Prospecção';
  }

  protected getEntityNamePlural(): string {
    return 'Dados de Prospecção';
  }

  protected buildForm(): FormGroup {
    return this.fb.group({
      tipoDado: ['', [Validators.required, Validators.maxLength(10)]],
      regras: ['', [Validators.required, Validators.maxLength(500)]],
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
}
