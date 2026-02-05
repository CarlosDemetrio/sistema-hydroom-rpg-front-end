import { Injectable, inject, computed } from '@angular/core';
import { CurrentGameService } from '../../current-game.service';
import {
  AtributoConfigService,
  AptidaoConfigService,
  NivelConfigService,
  LimitadorConfigService,
  ClasseConfigService,
  RacaConfigService,
  VantagemConfigService,
  ProspeccaoConfigService,
  PresencaConfigService,
  GeneroConfigService,
  IndoleConfigService,
  MembroCorpoConfigService,
  BonusConfigService
} from './index';

/**
 * Config Facade Service
 *
 * Service de fachada que agrega todos os Business Services de configuração.
 * Simplifica o acesso a múltiplas configurações e expõe signals comuns.
 *
 * Benefícios:
 * - Acesso centralizado a todos os config services
 * - Signals do jogo atual expostos
 * - Método  para carregar todas as configs básicas de uma vez (opcional)
 *
 * Uso:
 * ```typescript
 * private configFacade = inject(ConfigFacadeService);
 *
 * // Acessar services
 * const atributos$ = this.configFacade.atributos.loadItems();
 *
 * // Verificar jogo atual
 * if (!this.configFacade.hasCurrentGame()) {
 *   // Exibir mensagem
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class ConfigFacadeService {
  // Current Game Service
  private currentGameService = inject(CurrentGameService);

  // Business Services (injetados automaticamente)
  readonly atributos = inject(AtributoConfigService);
  readonly aptidoes = inject(AptidaoConfigService);
  readonly niveis = inject(NivelConfigService);
  readonly limitadores = inject(LimitadorConfigService);
  readonly classes = inject(ClasseConfigService);
  readonly racas = inject(RacaConfigService);
  readonly vantagens = inject(VantagemConfigService);
  readonly prospeccao = inject(ProspeccaoConfigService);
  readonly presencas = inject(PresencaConfigService);
  readonly generos = inject(GeneroConfigService);
  readonly indoles = inject(IndoleConfigService);
  readonly membrosCorpo = inject(MembroCorpoConfigService);
  readonly bonus = inject(BonusConfigService);

  // Signals expostos (do CurrentGameService)
  readonly currentGameId = computed(() => this.currentGameService.currentGameId());
  readonly hasCurrentGame = computed(() => this.currentGameService.hasCurrentGame());
  readonly currentGame = computed(() => this.currentGameService.currentGame());

  /**
   * Carrega todas as configurações básicas de uma vez
   * Útil para pré-carregar dados ao entrar em uma tela de configuração
   *
   * @returns Object com observables de todas as configs
   */
  loadAllBasicConfigs() {
    return {
      atributos: this.atributos.loadItems(),
      aptidoes: this.aptidoes.loadItems(),
      niveis: this.niveis.loadItems(),
      classes: this.classes.loadItems(),
      racas: this.racas.loadItems(),
      vantagens: this.vantagens.loadItems(),
      generos: this.generos.loadItems(),
      indoles: this.indoles.loadItems(),
      presencas: this.presencas.loadItems(),
      prospeccao: this.prospeccao.loadItems(),
      limitadores: this.limitadores.loadItems(),
      membrosCorpo: this.membrosCorpo.loadItems(),
      bonus: this.bonus.loadItems()
    };
  }
}
