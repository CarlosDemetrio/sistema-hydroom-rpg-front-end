export interface ClassePontosConfig {
  id: number;
  classePersonagemId: number;
  nivel: number;
  pontosAtributo: number;
  pontosVantagem: number;
  dataCriacao: string;
  dataUltimaAtualizacao: string;
}

export interface ClassePontosConfigRequest {
  nivel: number;
  pontosAtributo: number;
  pontosVantagem: number;
}
