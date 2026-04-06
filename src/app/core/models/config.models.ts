/**
 * Configuração de Pontos de Vantagem por nível.
 * Aligned with backend PontosVantagemResponse record.
 *
 * Tabela esparsa: apenas níveis com ganhos cadastrados aqui.
 * Ausência de registro = 0 pontos naquele nível.
 *
 * Endpoint: /api/jogos/{jogoId}/config/pontos-vantagem
 */
export interface PontosVantagemConfig {
  id: number;
  jogoId: number;
  nivel: number;
  pontosGanhos: number;
  dataCriacao: string;
  dataUltimaAtualizacao: string;
}

/**
 * Categoria de Vantagem.
 * Aligned with backend CategoriaVantagemResponse record.
 */
export interface CategoriaVantagem {
  id: number;
  jogoId: number;
  nome: string;
  descricao: string | null;
  cor: string | null;
  ordemExibicao: number;
  dataCriacao: string;
  dataUltimaAtualizacao: string;
}

/**
 * Bônus de atributo da Classe.
 */
export interface ClasseBonusConfig {
  id: number;
  classeId: number;
  bonusConfigId: number;
  bonusNome: string;
  valorPorNivel: number;
}

/**
 * Bônus de aptidão da Classe.
 */
export interface ClasseAptidaoBonus {
  id: number;
  classeId: number;
  aptidaoConfigId: number;
  aptidaoNome: string;
  bonus: number;
}

/**
 * Classe de Personagem.
 * Aligned with backend ClasseResponse record.
 */
export interface ClassePersonagem {
  id: number;
  jogoId: number;
  nome: string;
  descricao: string | null;
  ordemExibicao: number;
  bonusConfig: ClasseBonusConfig[];
  aptidaoBonus: ClasseAptidaoBonus[];
  dataCriacao: string;
  dataUltimaAtualizacao: string;
}

/**
 * Bônus de atributo por raça.
 */
export interface RacaBonusAtributo {
  id: number;
  racaId: number;
  atributoConfigId: number;
  atributoNome: string;
  bonus: number;
}

/**
 * Classe permitida para a raça.
 */
export interface RacaClassePermitida {
  id: number;
  racaId: number;
  classeId: number;
  classeNome: string;
}

/**
 * Raça.
 * Aligned with backend RacaResponse record.
 */
export interface Raca {
  id: number;
  jogoId: number;
  nome: string;
  descricao: string | null;
  ordemExibicao: number;
  bonusAtributos: RacaBonusAtributo[];
  classesPermitidas: RacaClassePermitida[];
  dataCriacao: string;
  dataUltimaAtualizacao: string;
}

/**
 * Configuração de Nível.
 * Aligned with backend NivelResponse record.
 */
export interface NivelConfig {
  id: number;
  jogoId: number;
  nivel: number;
  xpNecessaria: number;
  pontosAtributo: number;
  pontosAptidao: number;
  limitadorAtributo: number;
  /** Indica se este nível permite que o personagem realize um Renascimento. */
  permitirRenascimento: boolean;
  dataCriacao: string;
  dataUltimaAtualizacao: string;
}

/**
 * Configuração de Dado de Prospecção.
 * Aligned with backend DadoProspeccaoResponse record.
 */
export interface DadoProspeccaoConfig {
  id: number;
  jogoId: number;
  nome: string;
  descricao: string | null;
  numeroFaces: number;
  ordemExibicao: number;
  dataCriacao: string;
  dataUltimaAtualizacao: string;
}

/**
 * Configuração de Presença.
 * Aligned with backend PresencaResponse record.
 */
export interface PresencaConfig {
  id: number;
  jogoId: number;
  nome: string;
  descricao: string | null;
  ordemExibicao: number;
  dataCriacao: string;
  dataUltimaAtualizacao: string;
}

/**
 * Configuração de Gênero.
 * Aligned with backend GeneroResponse record.
 */
export interface GeneroConfig {
  id: number;
  jogoId: number;
  nome: string;
  descricao: string | null;
  ordemExibicao: number;
  dataCriacao: string;
  dataUltimaAtualizacao: string;
}

/**
 * Configuração de Índole.
 * Aligned with backend IndoleResponse record.
 */
export interface IndoleConfig {
  id: number;
  jogoId: number;
  nome: string;
  descricao: string | null;
  ordemExibicao: number;
  dataCriacao: string;
  dataUltimaAtualizacao: string;
}

/**
 * Configuração de Membro do Corpo.
 * Aligned with backend MembroCorpoResponse record.
 */
export interface MembroCorpoConfig {
  id: number;
  jogoId: number;
  nome: string;
  porcentagemVida: number;
  ordemExibicao: number;
  dataCriacao: string;
  dataUltimaAtualizacao: string;
}

/**
 * Configuração de Bônus.
 * Aligned with backend BonusResponse record.
 */
export interface BonusConfig {
  id: number;
  jogoId: number;
  nome: string;
  sigla: string | null;
  descricao: string | null;
  formulaBase: string | null;
  ordemExibicao: number;
  dataCriacao: string;
  dataUltimaAtualizacao: string;
}

/**
 * Item de reordenação (usado em todos os endpoints /reordenar)
 */
export interface ReordenarItem {
  id: number;
  ordemExibicao: number;
}

/**
 * Request de reordenação batch
 */
export interface ReordenarRequest {
  itens: ReordenarItem[];
}

/**
 * ProspeccaoConfig: alias for DadoProspeccaoConfig kept for backward compatibility.
 */
export type ProspeccaoConfig = DadoProspeccaoConfig;

/**
 * LimitadorConfig: removed from backend — kept as empty interface for backward compat.
 * Components that reference this will compile but have no usable endpoint.
 */
export interface LimitadorConfig {
  id?: number;
  jogoId?: number;
  nome: string;
  descricao?: string | null;
}
