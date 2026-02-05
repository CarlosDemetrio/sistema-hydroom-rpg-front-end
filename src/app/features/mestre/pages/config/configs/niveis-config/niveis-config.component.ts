import { Component, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { BaseConfigComponent } from '../../../../../../shared/components/base-config/base-config.component';
import { NivelConfig } from '../../../../../../core/models';
import { NivelConfigService } from '../../../../../../core/services/business/config';
import { progressiveValueValidator } from '../../../../../../shared/validators/config-validators';

/**
 * Componente de configuração de Níveis
 * Gerencia progressão de níveis e experiência (XP)
 */
@Component({
  selector: 'app-niveis-config',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    ConfirmDialogModule,
    DialogModule,
    InputTextModule,
    TableModule,
    InputNumberModule,
    TooltipModule,
    TagModule
  ],
  providers: [ConfirmationService],
  templateUrl: './niveis-config.component.html'
})
export class NiveisConfigComponent extends BaseConfigComponent<
  NivelConfig,
  NivelConfigService
> {
  protected service = inject(NivelConfigService);
  private confirmationService = inject(ConfirmationService);

  protected getEntityName(): string {
    return 'Nível';
  }

  protected getEntityNamePlural(): string {
    return 'Níveis';
  }

  protected buildForm(): FormGroup {
    return this.fb.group({
      nivel: [1, [Validators.required, Validators.min(1)]],
      xpMinimo: [0, [Validators.required, Validators.min(0)]],
      xpMaximo: [100, [Validators.required, Validators.min(1)]],
      bonusAtributo: [0, [Validators.required, Validators.min(0)]],
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

  override openDialog(item?: NivelConfig): void {
    super.openDialog(item);

    // Adiciona validação de progressão de XP
    const sortedItems = [...this.items()].sort((a, b) => a.nivel - b.nivel);
    const currentIndex = item ? sortedItems.findIndex(n => n.id === item.id) : sortedItems.length;

    const xpMinimoControl = this.form.get('xpMinimo');
    const xpMaximoControl = this.form.get('xpMaximo');

    if (xpMinimoControl && currentIndex > 0) {
      xpMinimoControl.addValidators([
        progressiveValueValidator(sortedItems, 'xpMinimo', currentIndex)
      ]);
      xpMinimoControl.updateValueAndValidity();
    }

    if (xpMaximoControl && currentIndex > 0) {
      xpMaximoControl.addValidators([
        progressiveValueValidator(sortedItems, 'xpMaximo', currentIndex)
      ]);
      xpMaximoControl.updateValueAndValidity();
    }
  }
}
