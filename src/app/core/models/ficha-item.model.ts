/**
 * Modelos de FichaItem.
 * Alinhados com backend FichaItemResponse, FichaInventarioResponse,
 * FichaItemAdicionarRequest, FichaItemCustomizadoRequest, FichaItemDuracaoRequest.
 *
 * Endpoint base: /api/v1/fichas/{fichaId}/itens
 */

// ---------------------------------------------------------------------------
// Response DTOs (alinhados com o backend)
// ---------------------------------------------------------------------------

/**
 * Item do inventario de uma ficha.
 * Alinhado com backend FichaItemResponse record.
 */
export interface FichaItemResponse {
  id: number;
  fichaId: number;
  itemConfigId: number | null;
  nome: string;
  equipado: boolean;
  duracaoAtual: number | null;
  duracaoPadrao: number | null;
  quantidade: number;
  peso: number;
  pesoEfetivo: number;
  notas: string | null;
  adicionadoPor: string;
  raridadeId: number | null;
  raridadeNome: string | null;
  raridadeCor: string | null;
  dataCriacao: string;
}

/**
 * Inventario completo de uma ficha.
 * Alinhado com backend FichaInventarioResponse record.
 */
export interface FichaInventarioResponse {
  equipados: FichaItemResponse[];
  inventario: FichaItemResponse[];
  pesoTotal: number;
  capacidadeCarga: number;
  sobrecarregado: boolean;
}

// ---------------------------------------------------------------------------
// Request DTOs
// ---------------------------------------------------------------------------

/**
 * Request para adicionar item do catalogo.
 * Alinhado com backend FichaItemAdicionarRequest record.
 */
export interface AdicionarFichaItemRequest {
  itemConfigId: number;
  quantidade: number;
  notas?: string;
  forcarAdicao: boolean;
}

/**
 * Request para adicionar item customizado (apenas Mestre).
 * Alinhado com backend FichaItemCustomizadoRequest record.
 */
export interface AdicionarFichaItemCustomizadoRequest {
  nome: string;
  raridadeId: number;
  peso: number;
  quantidade: number;
  notas?: string;
}

/**
 * Request para ajustar durabilidade de item (apenas Mestre).
 * Alinhado com backend FichaItemDuracaoRequest record.
 */
export interface AlterarDurabilidadeRequest {
  decremento: number;
  restaurar: boolean;
}

// ---------------------------------------------------------------------------
// ViewModel — enriquece FichaItemResponse para uso nos componentes
// ---------------------------------------------------------------------------

export interface FichaItemViewModel extends FichaItemResponse {
  /** Cor do chip de raridade (fallback cinza quando customizado) */
  raridadeCorEfetiva: string;
  /** Se duracaoAtual === 0 (item com durabilidade quebrado) */
  estaQuebrado: boolean;
  /** Se e item customizado (sem itemConfigId) */
  isCustomizado: boolean;
}

// ---------------------------------------------------------------------------
// Utilitarios de icone por categoria (usado no dialog de adicao)
// ---------------------------------------------------------------------------

export const CATEGORIA_ICONE: Record<string, string> = {
  ARMA: 'pi pi-hammer',
  ARMADURA: 'pi pi-shield',
  ACESSORIO: 'pi pi-star',
  CONSUMIVEL: 'pi pi-heart',
  FERRAMENTA: 'pi pi-wrench',
  AVENTURA: 'pi pi-box',
};

export function getCategoriaIcone(categoria?: string): string {
  return CATEGORIA_ICONE[categoria ?? ''] ?? 'pi pi-box';
}
