/**
 * Interface base para todas as entidades de configuração
 * Todos os tipos de configuração (Atributo, Aptidão, etc) estendem desta interface
 */
export interface BaseConfig {
  /** ID da entidade (opcional na criação) */
  id?: number;

  /** Flag de ativo/inativo (soft delete) */
  ativo: boolean;

  /** Data de criação (gerenciado pelo backend) */
  createdAt?: Date;

  /** Data de atualização (gerenciado pelo backend) */
  updatedAt?: Date;

  /** Ordem de exibição na lista */
  ordemExibicao?: number;
}

/**
 * Interface para configurações que pertencem a um jogo específico
 * 99% das configs são deste tipo
 */
export interface JogoScopedConfig extends BaseConfig {
  /** ID do jogo (obrigatório no backend) */
  jogoId?: number;

  /** Objeto Jogo completo (populado pelo backend) */
  jogo?: any; // TODO: Usar tipo Jogo quando disponível
}

/**
 * Interface para configurações que têm nome
 * A maioria das configs (Atributo, Aptidão, Classe, etc) são deste tipo
 */
export interface NamedConfig extends JogoScopedConfig {
  /** Nome da configuração (obrigatório) */
  nome: string;

  /** Descrição opcional */
  descricao?: string;
}
