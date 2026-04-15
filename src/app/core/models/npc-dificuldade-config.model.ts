/**
 * Valor de atributo definido por um nível de dificuldade de NPC.
 * Alinhado com backend NpcDificuldadeAtributoResponse.
 */
export interface NpcDificuldadeAtributo {
  atributoId: number;
  atributoNome: string;
  atributoAbreviacao: string;
  valorBase: number;
}

/**
 * Configuração de nível de dificuldade para NPCs.
 * Alinhado com backend NpcDificuldadeConfigResponse.
 *
 * Endpoint: GET /api/jogos/{jogoId}/config/npc-dificuldades
 */
export interface NpcDificuldadeConfig {
  id: number;
  nome: string;
  foco: 'FISICO' | 'MAGICO';
  valoresAtributo: NpcDificuldadeAtributo[];
}
