import { Signal, WritableSignal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { JogoScopedConfig } from '../../core/models/config-base.model';

/**
 * Interface que define o contrato para componentes de configuração
 * Garante consistência entre todos os componentes
 *
 * IMPORTANTE:
 * - Loading é gerenciado pelo LoadingInterceptor (global)
 * - Erros são tratados pelo ErrorInterceptor (global)
 * - Toasts são gerenciados pelo ToastService (global)
 *
 * @template T - Tipo da configuração (AtributoConfig, AptidaoConfig, etc)
 */
export interface IConfigComponent<T extends JogoScopedConfig> {
  // Estado local
  /** Lista de itens */
  items: Signal<T[]>;

  /** Visibilidade do dialog */
  dialogVisible: WritableSignal<boolean>;

  /** Modo edição ou criação */
  editMode: Signal<boolean>;

  /** Formulário reativo */
  form: FormGroup;

  // Referências do jogo
  /** Se há jogo selecionado */
  hasGame: Signal<boolean>;

  /** ID do jogo atual */
  currentGameId: Signal<number | null>;

  /** Nome do jogo atual */
  currentGameName: Signal<string | undefined>;

  // Métodos de ciclo de vida
  ngOnInit(): void;

  // Métodos CRUD (sem tratamento de erro - delegado para interceptors)
  /** Carrega lista */
  loadData(): void;

  /** Abre dialog (criar ou editar) */
  openDialog(item?: T): void;

  /** Fecha dialog */
  closeDialog(): void;

  /** Salva (create ou update) */
  save(): void;

  /** Confirma exclusão */
  confirmDelete(id: number): void;

  /** Executa exclusão */
  delete(id: number): void;

  // Utilitários
  /** Reseta o formulário */
  resetForm(): void;
}
