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
import { AtributoConfig } from '../../../../../../core/models';
import { AtributoConfigService } from '../../../../../../core/services/business/config';
import { uppercaseValidator, uniqueNameValidator } from '../../../../../../shared/validators/config-validators';

/**
 * Componente de configuração de Atributos
 * Gerencia atributos base do sistema (FOR, DES, CON, etc)
 */
@Component({
  selector: 'app-atributos-config',
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
  templateUrl: './atributos-config.component.html'
})
export class AtributosConfigComponent extends BaseConfigComponent<
  AtributoConfig,
  AtributoConfigService
> {
  protected service = inject(AtributoConfigService);
  private confirmationService = inject(ConfirmationService);

  protected getEntityName(): string {
    return 'Atributo';
  }

  protected getEntityNamePlural(): string {
    return 'Atributos';
  }

  protected buildForm(): FormGroup {
    return this.fb.group({
      nome: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50)
      ]],
      abreviacao: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(5),
        uppercaseValidator()
      ]],
      descricao: ['', [Validators.maxLength(500)]],
      formulaImpeto: ['', [Validators.maxLength(100)]],
      descricaoImpeto: ['', [Validators.maxLength(200)]],
      valorMinimo: [null],
      valorMaximo: [null],
      ordemExibicao: [1, [Validators.required, Validators.min(1)]],
      ativo: [true]
    });
  }

  /**
   * Sobrescreve confirmDelete para usar ConfirmationService
   */
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

  /**
   * Sobrescreve openDialog para aplicar validação de nome único
   */
  override openDialog(item?: AtributoConfig): void {
    super.openDialog(item);

    // Adiciona validador de nome único após abrir o dialog
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
