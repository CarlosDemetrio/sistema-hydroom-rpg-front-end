export interface ClasseVantagemPreDefinida {
  id: number;
  classePersonagemId: number;
  nivel: number;
  vantagemConfigId: number;
  vantagemConfigNome: string;
  dataCriacao: string;
  dataUltimaAtualizacao: string;
}

export interface ClasseVantagemPreDefinidaRequest {
  nivel: number;
  vantagemConfigId: number;
}
