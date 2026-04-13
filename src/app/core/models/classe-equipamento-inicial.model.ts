/**
 * Equipamento Inicial de Classe.
 * Alinhado com backend ClasseEquipamentoInicialResponse record.
 *
 * Endpoint: GET/POST/PUT/DELETE /api/v1/configuracoes/classes/{classeId}/equipamentos-iniciais
 */
export interface ClasseEquipamentoInicial {
  id: number;
  classeId: number;
  classeNome: string;
  itemConfigId: number;
  itemConfigNome: string;
  itemRaridade: string;
  itemRaridadeCor: string;
  itemCategoria: string;
  obrigatorio: boolean;
  grupoEscolha?: number | null;
  quantidade: number;
  dataCriacao: string;
}

export interface CreateClasseEquipamentoInicialDto {
  itemConfigId: number;
  obrigatorio: boolean;
  grupoEscolha?: number | null;
  quantidade: number;
}

export interface UpdateClasseEquipamentoInicialDto {
  quantidade?: number;
  obrigatorio?: boolean;
  grupoEscolha?: number | null;
}
