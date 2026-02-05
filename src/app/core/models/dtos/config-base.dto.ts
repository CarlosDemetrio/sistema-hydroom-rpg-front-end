import { BaseConfig, JogoScopedConfig } from '../config-base.model';

/**
 * DTO genérico para criar qualquer tipo de configuração
 * Remove campos gerenciados pelo backend (id, createdAt, updatedAt, jogo)
 * Adiciona jogoId como obrigatório
 */
export type CreateConfigDto<T extends JogoScopedConfig> = Omit<
  T,
  'id' | 'createdAt' | 'updatedAt' | 'jogo'
> & {
  jogoId: number; // jogoId obrigatório na criação
};

/**
 * DTO genérico para atualizar qualquer tipo de configuração
 * Todos os campos são opcionais (Partial)
 * Remove campos que não podem ser atualizados
 */
export type UpdateConfigDto<T extends BaseConfig> = Partial<
  Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'jogo' | 'jogoId'>
>;
