/**
 * Tipos e enums de Item Config.
 * Alinhado com backend enums CategoriaItem e SubcategoriaItem.
 */
export type CategoriaItem =
  | 'ARMA'
  | 'ARMADURA'
  | 'ACESSORIO'
  | 'CONSUMIVEL'
  | 'FERRAMENTA'
  | 'AVENTURA';

export type SubcategoriaItem =
  | 'ESPADA'
  | 'ARCO'
  | 'LANCA'
  | 'MACHADO'
  | 'MARTELO'
  | 'CAJADO'
  | 'ADAGA'
  | 'ARREMESSO'
  | 'BESTA'
  | 'ARMADURA_LEVE'
  | 'ARMADURA_MEDIA'
  | 'ARMADURA_PESADA'
  | 'ESCUDO'
  | 'ANEL'
  | 'AMULETO'
  | 'BOTAS'
  | 'CAPA'
  | 'LUVAS'
  | 'POCAO'
  | 'MUNICAO'
  | 'KIT'
  | 'OUTROS';

export const CATEGORIA_LABELS: Record<CategoriaItem, string> = {
  ARMA: 'Arma',
  ARMADURA: 'Armadura',
  ACESSORIO: 'Acessório',
  CONSUMIVEL: 'Consumível',
  FERRAMENTA: 'Ferramenta',
  AVENTURA: 'Aventura',
};

export const SUBCATEGORIA_LABELS: Record<SubcategoriaItem, string> = {
  ESPADA: 'Espada',
  ARCO: 'Arco',
  LANCA: 'Lança',
  MACHADO: 'Machado',
  MARTELO: 'Martelo',
  CAJADO: 'Cajado',
  ADAGA: 'Adaga',
  ARREMESSO: 'Arremesso',
  BESTA: 'Besta',
  ARMADURA_LEVE: 'Armadura Leve',
  ARMADURA_MEDIA: 'Armadura Média',
  ARMADURA_PESADA: 'Armadura Pesada',
  ESCUDO: 'Escudo',
  ANEL: 'Anel',
  AMULETO: 'Amuleto',
  BOTAS: 'Botas',
  CAPA: 'Capa',
  LUVAS: 'Luvas',
  POCAO: 'Poção',
  MUNICAO: 'Munição',
  KIT: 'Kit',
  OUTROS: 'Outros',
};

export const SUBCATEGORIA_POR_CATEGORIA: Record<CategoriaItem, SubcategoriaItem[]> = {
  ARMA: ['ESPADA', 'ARCO', 'LANCA', 'MACHADO', 'MARTELO', 'CAJADO', 'ADAGA', 'ARREMESSO', 'BESTA'],
  ARMADURA: ['ARMADURA_LEVE', 'ARMADURA_MEDIA', 'ARMADURA_PESADA', 'ESCUDO'],
  ACESSORIO: ['ANEL', 'AMULETO', 'BOTAS', 'CAPA', 'LUVAS'],
  CONSUMIVEL: ['POCAO', 'MUNICAO'],
  FERRAMENTA: ['KIT'],
  AVENTURA: ['OUTROS'],
};

export type TagSeverity =
  | 'success'
  | 'info'
  | 'warn'
  | 'danger'
  | 'secondary'
  | 'contrast';

/** Cores das categorias para badges */
export const CATEGORIA_SEVERITY: Record<CategoriaItem, TagSeverity> = {
  ARMA: 'danger',
  ARMADURA: 'secondary',
  ACESSORIO: 'warn',
  CONSUMIVEL: 'success',
  FERRAMENTA: 'contrast',
  AVENTURA: 'info',
};

/**
 * Tipo de Item.
 * Alinhado com backend TipoItemConfigResponse record.
 *
 * Endpoint: GET/POST/PUT/DELETE /api/v1/configuracoes/tipos-item
 */
export interface TipoItemConfig {
  id: number;
  jogoId: number;
  nome: string;
  categoria: CategoriaItem;
  subcategoria?: SubcategoriaItem | null;
  requerDuasMaos: boolean;
  ordemExibicao: number;
  descricao?: string | null;
  dataCriacao: string;
  dataUltimaAtualizacao: string;
}

export interface CreateTipoItemDto {
  jogoId: number;
  nome: string;
  categoria: CategoriaItem;
  subcategoria?: SubcategoriaItem | null;
  requerDuasMaos: boolean;
  ordemExibicao: number;
  descricao?: string | null;
}

export interface UpdateTipoItemDto {
  nome?: string;
  categoria?: CategoriaItem;
  subcategoria?: SubcategoriaItem | null;
  requerDuasMaos?: boolean;
  ordemExibicao?: number;
  descricao?: string | null;
}
