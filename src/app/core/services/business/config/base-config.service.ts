import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { JogoScopedConfig } from '../../../models/config-base.model';
import { CreateConfigDto, UpdateConfigDto } from '../../../models';
import { CurrentGameService } from '../../current-game.service';
import { ConfigApiService } from '../../api/config-api.service';

/**
 * Classe abstrata base para todos os Business Services de configuração
 *
 * Implementa:
 * - Integração com CurrentGameService
 * - Validação de jogo selecionado
 * - Métodos CRUD genéricos
 * - Exposição de signals de estado
 *
 * Cada service específico apenas:
 * - Estende esta classe
 * - Define o tipo genérico T
 * - Implementa métodos abstratos
 *
 * @template T - Tipo da configuração (AtributoConfig, AptidaoConfig, etc)
 */
@Injectable()
export abstract class BaseConfigService<T extends JogoScopedConfig> {
  // Injeções comuns
  protected currentGameService = inject(CurrentGameService);
  protected configApi = inject(ConfigApiService);

  // Signals expostos (iguais para todos)
  currentGameId = this.currentGameService.currentGameId;
  hasCurrentGame = this.currentGameService.hasCurrentGame;
  currentGame = this.currentGameService.currentGame;

  // Métodos abstratos (cada service implementa)

  /**
   * Nome do endpoint (usado em mensagens de erro)
   * Ex: "Atributos", "Aptidões", "Classes"
   */
  protected abstract getEndpointName(): string;

  /**
   * Método da API para listar itens
   * Ex: (jogoId) => this.configApi.listAtributos(jogoId)
   */
  protected abstract getApiListMethod(): (jogoId: number) => Observable<T[]>;

  /**
   * Método da API para criar item
   * Ex: (data) => this.configApi.createAtributo(data)
   */
  protected abstract getApiCreateMethod(): (data: any) => Observable<T>;

  /**
   * Método da API para atualizar item
   * Ex: (id, data) => this.configApi.updateAtributo(id, data)
   */
  protected abstract getApiUpdateMethod(): (id: number, data: any) => Observable<T>;

  /**
   * Método da API para deletar item
   * Ex: (id) => this.configApi.deleteAtributo(id)
   */
  protected abstract getApiDeleteMethod(): (id: number) => Observable<void>;

  /**
   * Valida se há um jogo selecionado
   * Lança erro se não houver jogo selecionado
   * @returns ID do jogo selecionado
   * @throws Error se nenhum jogo está selecionado
   */
  protected ensureGameSelected(): number {
    const jogoId = this.currentGameId();
    if (!jogoId) {
      throw new Error(
        `Nenhum jogo selecionado. Selecione um jogo no cabeçalho para gerenciar ${this.getEndpointName()}.`
      );
    }
    return jogoId;
  }

  /**
   * Carrega lista de itens do jogo atual
   * @throws Error se nenhum jogo está selecionado
   */
  loadItems(): Observable<T[]> {
    const jogoId = this.ensureGameSelected();
    return this.getApiListMethod()(jogoId);
  }

  /**
   * Cria novo item no jogo atual
   * @param data DTO de criação
   * @throws Error se nenhum jogo está selecionado
   */
  createItem(data: CreateConfigDto<T>): Observable<T> {
    const jogoId = this.ensureGameSelected();
    // Adiciona jogoId ao data antes de enviar
    const dataWithJogoId = { ...data, jogoId };
    return this.getApiCreateMethod()(dataWithJogoId);
  }

  /**
   * Atualiza item existente
   * @param id ID do item
   * @param data DTO de atualização
   */
  updateItem(id: number, data: UpdateConfigDto<T>): Observable<T> {
    return this.getApiUpdateMethod()(id, data);
  }

  /**
   * Deleta item
   * @param id ID do item
   */
  deleteItem(id: number): Observable<void> {
    return this.getApiDeleteMethod()(id);
  }
}
