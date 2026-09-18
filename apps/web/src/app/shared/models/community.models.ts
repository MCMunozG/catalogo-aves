/** Publicación pública de Community; los objetos referenciados son ids opacos de otro contexto. */
export interface FeedPost {
  id: string;
  author_id: string;
  body?: string | null;
  reference_type: string;
  reference_id: string;
  created_at: string;
  reactions_count?: number;
  comments_count?: number;
}

/** Metadatos que Laravel incluye alrededor de cada conjunto paginado. */
export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

/** Comentario público asociado a una publicación del feed. */
export interface CommunityComment { id: string; post_id: string; author_id: string; body: string; created_at: string; }

/** Notificación persistida por Community para el usuario autenticado actual. */
export interface Notification {
  id: string;
  type: string;
  body: string;
  reference_id?: string | null;
  read_at?: string | null;
  created_at: string;
}
