import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { CommunityComment, FeedPost, Notification, PaginatedResponse } from "../../shared/models/community.models";

/** Cliente de proyecciones de Community usado por la SPA. */
@Injectable({ providedIn: "root" })
export class CommunityApiService {
  constructor(private readonly http: HttpClient) {}

  feed(page = 1, perPage = 8, postId?: string): Observable<PaginatedResponse<FeedPost>> {
    const params: Record<string, string | number> = { page, per_page: perPage };
    if (postId) params['post_id'] = postId;
    return this.http.get<PaginatedResponse<FeedPost>>("/api/community/v1/feed", { params });
  }
  /** Publica una nota general o una publicación ligada a otra entidad del producto. */
  createPost(body: string): Observable<FeedPost> {
    return this.http.post<FeedPost>("/api/community/v1/posts", { body });
  }
  /** Registra una reacción idempotente para la persona autenticada. */
  react(postId: string): Observable<{ reactions_count: number; reacted: boolean }> {
    return this.http.put<{ reactions_count: number; reacted: boolean }>(`/api/community/v1/posts/${postId}/reaction`, { reaction: "LIKE" });
  }
  /** Añade una respuesta visible en la conversación. */
  comment(postId: string, body: string): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(`/api/community/v1/posts/${postId}/comments`, { body });
  }
  comments(postId: string): Observable<CommunityComment[]> { return this.http.get<CommunityComment[]>(`/api/community/v1/posts/${postId}/comments`); }
  removeReaction(postId: string): Observable<{ reactions_count: number; reacted: boolean }> { return this.http.delete<{ reactions_count: number; reacted: boolean }>(`/api/community/v1/posts/${postId}/reaction`); }
  notifications(): Observable<PaginatedResponse<Notification>> {
    return this.http.get<PaginatedResponse<Notification>>(
      "/api/community/v1/notifications",
    );
  }
  /** Confirma que una alerta fue atendida por su propia persona destinataria. */
  markNotificationRead(notificationId: string): Observable<void> { return this.http.put<void>(`/api/community/v1/notifications/${notificationId}/read`, {}); }
  /** Quita el estado pendiente de todas las alertas de la sesión actual. */
  markAllNotificationsRead(): Observable<void> { return this.http.put<void>("/api/community/v1/notifications/read-all", {}); }
}
