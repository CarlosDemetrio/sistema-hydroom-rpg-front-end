/**
 * Raridade de Item.
 * Alinhado com backend RaridadeItemConfigResponse record.
 *
 * Endpoint: GET/POST/PUT/DELETE /api/v1/configuracoes/raridades-item
 */
export interface RaridadeItemConfig {
  id: number;
  jogoId: number;
  nome: string;
  cor: string; // hex #RRGGBB
  ordemExibicao: number;
  podeJogadorAdicionar: boolean;
  bonusAtributoMin?: number | null;
  bonusAtributoMax?: number | null;
  bonusDerivadoMin?: number | null;
  bonusDerivadoMax?: number | null;
  descricao?: string | null;
  dataCriacao: string;
  dataUltimaAtualizacao: string;
}

export interface CreateRaridadeItemDto {
  jogoId: number;
  nome: string;
  cor: string;
  ordemExibicao: number;
  podeJogadorAdicionar: boolean;
  bonusAtributoMin?: number | null;
  bonusAtributoMax?: number | null;
  bonusDerivadoMin?: number | null;
  bonusDerivadoMax?: number | null;
  descricao?: string | null;
}

export interface UpdateRaridadeItemDto {
  nome?: string;
  cor?: string;
  ordemExibicao?: number;
  podeJogadorAdicionar?: boolean;
  bonusAtributoMin?: number | null;
  bonusAtributoMax?: number | null;
  bonusDerivadoMin?: number | null;
  bonusDerivadoMax?: number | null;
  descricao?: string | null;
}
