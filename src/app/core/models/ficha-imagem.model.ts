/**
 * Tipo de imagem em uma ficha.
 * Alinhado com backend TipoImagem enum.
 *
 * AVATAR: imagem principal do personagem (apenas uma ativa por ficha)
 * GALERIA: imagens secundarias de referencia
 */
export type TipoImagem = 'AVATAR' | 'GALERIA';

/**
 * Imagem associada a uma ficha de personagem.
 * Alinhado com backend FichaImagemResponse record.
 * URL e gerenciada pelo Cloudinary — nao fornecida pelo usuario.
 */
export interface FichaImagem {
  id: number;
  fichaId: number;
  urlCloudinary: string;
  publicId: string;
  titulo: string | null;
  tipoImagem: TipoImagem;
  ordemExibicao: number;
  dataCriacao: string;
  dataUltimaAtualizacao: string;
}

/**
 * DTO para fazer upload de nova imagem.
 * Enviado como FormData (multipart/form-data), nao como JSON.
 * Montar via FormData no service antes de enviar.
 */
export interface UploadImagemDto {
  arquivo: File;
  tipoImagem: TipoImagem;
  titulo?: string;
}

/**
 * DTO para editar imagem existente (apenas metadados — nao troca o arquivo).
 * Alinhado com backend AtualizarImagemRequest record.
 * Todos os campos opcionais.
 */
export interface AtualizarImagemDto {
  titulo?: string;
  ordemExibicao?: number;
}
