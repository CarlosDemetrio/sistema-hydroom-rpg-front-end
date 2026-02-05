import { Directive, DestroyRef, OnInit, inject, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { JogoScopedConfig } from '../../../core/models/config-base.model';
import { BaseConfigService } from '../../../core/services/business/config/base-config.service';
import { IConfigComponent } from '../../interfaces/config-component.interface';
import { ToastService } from '../../../services/toast.service';
import { markFormGroupTouched } from '../../utils/form-helpers';

/**
 * Classe abstrata base para componentes de configuração
 *
 * IMPORTANTE:
 * - Loading é gerenciado pelo LoadingInterceptor (global)
 * - Erros são tratados pelo ErrorInterceptor (global)
 * - Toasts são gerenciados pelo ToastService (global)
 * - Componentes apenas delegam para services e atualizam estado local
 *
 * Implementa:
 * - Ciclo de vida padrão
 * - Métodos CRUD genéricos (sem tratamento de erro)
 * - Integração com services
 * - Gerenciamento de formulário
 * - Validação de jogo selecionado
 *
 * @template T - Tipo da configuração (AtributoConfig, etc)
 * @template S - Tipo do service (AtributoConfigService, etc)
 */
@Directive() // Usar @Directive() ao invés de @Component() para classes abstratas
export abstract class BaseConfigComponent<
  T extends JogoScopedConfig,
  S extends BaseConfigService<T>
> implements IConfigComponent<T>, OnInit {

  // Injeções comuns
  protected destroyRef = inject(DestroyRef);
  protected fb = inject(FormBuilder);
  protected toastService = inject(ToastService);

  // Service específico (cada subclasse injeta o seu)
  protected abstract service: S;

  // Estado local
  items = signal<T[]>([]);
  dialogVisible = signal(false);
  editMode = signal(false);
  currentEditId = signal<number | null>(null);

  // Referências do jogo
  hasGame = computed(() => this.service.hasCurrentGame());
  currentGameId = computed(() => this.service.currentGameId());
  currentGameName = computed(() => {
    const game = this.service.currentGame();
    return game?.nome;
  });

  // Formulário (cada subclasse implementa buildForm)
  form!: FormGroup;

  // Métodos abstratos (cada subclasse implementa)

  /** Constrói o formulário reativo */
  protected abstract buildForm(): FormGroup;

  /** Nome da entidade (singular) - Ex: "Atributo" */
  protected abstract getEntityName(): string;

  /** Nome da entidade (plural) - Ex: "Atributos" */
  protected abstract getEntityNamePlural(): string;

  /**
   * Inicialização do componente
   * Valida jogo selecionado e carrega dados
   */
  ngOnInit(): void {
    this.form = this.buildForm();

    if (!this.hasGame()) {
      this.toastService.warning(
        `Selecione um jogo no cabeçalho para gerenciar ${this.getEntityNamePlural()}`,
        'Aviso'
      );
      return;
    }

    this.loadData();
  }

  /**
   * Carrega lista de itens
   * Loading e erros são gerenciados por interceptors globais
   */
  loadData(): void {
    this.service.loadItems()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items) => {
          this.items.set(items);
        }
        // Não precisa error handler - ErrorInterceptor cuida
      });
  }

  /**
   * Abre dialog para criar ou editar item
   * @param item Item a ser editado (opcional)
   */
  openDialog(item?: T): void {
    if (item?.id) {
      this.editMode.set(true);
      this.currentEditId.set(item.id);
      this.form.patchValue(item);
    } else {
      this.editMode.set(false);
      this.currentEditId.set(null);
      this.resetForm();
    }
    this.dialogVisible.set(true);
  }

  /**
   * Fecha dialog e reseta formulário
   */
  closeDialog(): void {
    this.dialogVisible.set(false);
    this.resetForm();
  }

  /**
   * Salva item (criar ou atualizar)
   * Loading e erros são gerenciados por interceptors globais
   */
  save(): void {
    if (this.form.invalid) {
      markFormGroupTouched(this.form);
      this.toastService.warning('Preencha todos os campos obrigatórios', 'Atenção');
      return;
    }

    const data = this.form.value;
    const operation$ = this.editMode()
      ? this.service.updateItem(this.currentEditId()!, data)
      : this.service.createItem(data);

    operation$.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          const action = this.editMode() ? 'atualizado' : 'criado';
          this.toastService.success(
            `${this.getEntityName()} ${action} com sucesso`,
            'Sucesso'
          );
          this.closeDialog();
          this.loadData();
        }
        // Não precisa error handler - ErrorInterceptor cuida
      });
  }

  /**
   * Confirma exclusão do item
   * Subclasses devem sobrescrever para usar ConfirmationService
   * @param id ID do item
   */
  confirmDelete(id: number): void {
    // Implementação padrão - deleta diretamente
    // Subclasses devem sobrescrever para adicionar confirmação
    this.delete(id);
  }

  /**
   * Deleta item
   * Loading e erros são gerenciados por interceptors globais
   * @param id ID do item
   */
  delete(id: number): void {
    this.service.deleteItem(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastService.success(
            `${this.getEntityName()} excluído com sucesso`,
            'Sucesso'
          );
          this.loadData();
        }
        // Não precisa error handler - ErrorInterceptor cuida
      });
  }

  /**
   * Reseta formulário
   */
  resetForm(): void {
    this.form.reset();
    this.form.markAsUntouched();
    this.form.markAsPristine();
  }
}
