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
import { AptidaoConfig, TipoAptidao } from '../../../../../../core/models';
import { AptidaoConfigService } from '../../../../../../core/services/business/config';
import { ConfigApiService } from '../../../../../../core/services/api/config-api.service';
import { uniqueNameValidator } from '../../../../../../shared/validators/config-validators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/**
 * Componente de configuração de Aptidões
 * Gerencia aptidões/habilidades do sistema (Espadas, Furtividade, etc)
 */
@Component({
  selector: 'app-aptidoes-config',
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
  templateUrl: './aptidoes-config.component.html'
})
export class AptidoesConfigComponent extends BaseConfigComponent<
  AptidaoConfig,
  AptidaoConfigService
> {
  protected service = inject(AptidaoConfigService);
  private confirmationService = inject(ConfirmationService);
  private configApi = inject(ConfigApiService);

  // Lista de tipos de aptidão (FISICO, MENTAL)
  tiposAptidao = signal<TipoAptidao[]>([]);

  protected getEntityName(): string {
    return 'Aptidão';
  }

  protected getEntityNamePlural(): string {
    return 'Aptidões';
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.loadTiposAptidao();
  }

  protected buildForm(): FormGroup {
    return this.fb.group({
      nome: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50)
      ]],
      tipoAptidaoId: [null, [Validators.required]],
      descricao: ['', [Validators.maxLength(500)]],
      ordemExibicao: [1, [Validators.required, Validators.min(1)]],
      ativo: [true]
    });
  }

  /**
   * Carrega tipos de aptidão (FISICO, MENTAL)
   */
  private loadTiposAptidao(): void {
    this.configApi.listTiposAptidao()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (tipos) => {
          this.tiposAptidao.set(tipos);
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

  override openDialog(item?: AptidaoConfig): void {
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
