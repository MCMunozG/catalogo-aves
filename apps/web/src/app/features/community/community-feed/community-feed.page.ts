import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { CommunityApiService } from "../../../core/api/community-api.service";
import { SessionService } from "../../../core/session.service";
import {
  CommunityComment,
  FeedPost,
} from "../../../shared/models/community.models";

@Component({
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: "./community-feed.page.html",
  styleUrl: "./community-feed.page.scss",
})
/** Orquesta las acciones del feed sin duplicar reglas de autorización de Community. */
export class CommunityFeedPageComponent {
  private readonly api = inject(CommunityApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly session = inject(SessionService);
  readonly feed = signal<FeedPost[]>([]);
  readonly communityError = signal(false);
  readonly composerOpen = signal(false);
  readonly likedPosts = signal<Set<string>>(new Set());
  readonly commentingPostId = signal<string | null>(null);
  readonly sharedPostId = signal<string | null>(null);
  readonly commentsByPost = signal<Record<string, CommunityComment[]>>({});
  readonly actionError = signal("");
  readonly pagination = signal({
    currentPage: 1,
    lastPage: 1,
    perPage: 8,
    total: 0,
  });
  readonly perPageOptions = [8, 12, 20];
  private focusedPostId?: string;
  postBody = "";
  commentBody = "";

  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      this.focusedPostId = params.get("post") ?? undefined;
      this.loadFeed(
        this.focusedPostId ? 1 : this.pagination().currentPage,
        this.focusedPostId,
      );
    });
  }
  /** Recarga el feed público después de una mutación exitosa o al cambiar de página. */
  loadFeed(page = this.pagination().currentPage, postId?: string): void {
    const { perPage } = this.pagination();
    this.api.feed(page, perPage, postId).subscribe({
      next: ({ data, current_page, last_page, per_page, total }) => {
        this.feed.set(data);
        this.pagination.set({
          currentPage: current_page,
          lastPage: last_page,
          perPage: per_page,
          total,
        });
        this.communityError.set(false);
      },
      error: () => this.communityError.set(true),
    });
  }
  /** Navega sin reiniciar la página y evita solicitudes fuera del rango disponible. */
  goToPage(page: number): void {
    const { currentPage, lastPage } = this.pagination();
    if (page === currentPage || page < 1 || page > lastPage) return;
    if (this.focusedPostId) {
      this.pagination.update((state) => ({ ...state, currentPage: page }));
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { post: null },
        queryParamsHandling: "merge",
      });
      return;
    }
    this.loadFeed(page);
  }
  /** Ajusta cuántas notas se leen por página y vuelve al comienzo del feed. */
  changePerPage(perPage: number): void {
    this.pagination.update((state) => ({ ...state, perPage: Number(perPage) }));
    if (this.focusedPostId) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { post: null },
        queryParamsHandling: "merge",
      });
      return;
    }
    this.loadFeed(1);
  }
  /** Devuelve una ventana acotada de páginas para no saturar el control de navegación. */
  pageNumbers(): number[] {
    const { currentPage, lastPage } = this.pagination();
    const start = Math.max(1, Math.min(currentPage - 2, lastPage - 4));
    return Array.from(
      { length: Math.min(5, lastPage) },
      (_, index) => start + index,
    );
  }
  /** Abre el compositor para una sesión válida o conduce al acceso si no existe. */
  openComposer(): void {
    this.actionError.set("");
    this.session.hasToken()
      ? this.composerOpen.set(true)
      : this.router.navigate(["/ingresar"], {
          queryParams: { returnUrl: "/comunidad" },
        });
  }
  /** Publica una reflexión general, sin obligar a inventar una observación asociada. */
  publish(): void {
    const body = this.postBody.trim();
    if (!body) return;
    this.api.createPost(body).subscribe({
      next: () => {
        this.postBody = "";
        this.composerOpen.set(false);
        this.loadFeed();
      },
      error: () =>
        this.actionError.set(
          "No fue posible publicar. Tu sesión puede haber expirado.",
        ),
    });
  }
  /** Reacciona una sola vez por sesión y refleja el conteo que confirma Community. */
  like(postId: string): void {
    if (!this.session.hasToken()) return this.openComposer();

    const liked = this.likedPosts().has(postId);
    const request = liked
      ? this.api.removeReaction(postId)
      : this.api.react(postId);

    request.subscribe({
      next: ({ reacted, reactions_count }) => {
        this.likedPosts.update((likes) => {
          const next = new Set(likes);
          reacted ? next.add(postId) : next.delete(postId);
          return next;
        });
        this.feed.update((posts) =>
          posts.map((post) =>
            post.id === postId
              ? { ...post, reactions_count: Number(reactions_count) }
              : post,
          ),
        );
      },
      error: () => this.actionError.set("No fue posible guardar tu reacción."),
    });
  }
  /** Alterna el formulario de comentario para la publicación elegida. */
  toggleComment(postId: string): void {
    if (!this.session.hasToken()) return this.openComposer();
    const opening = this.commentingPostId() !== postId;
    this.commentingPostId.set(opening ? postId : null);
    this.commentBody = "";
    if (opening) this.loadComments(postId);
  }
  /** Envía un comentario corto y cierra su formulario al completar. */
  sendComment(postId: string): void {
    const body = this.commentBody.trim();
    if (!body) return;
    this.api.comment(postId, body).subscribe({
      next: () => {
        this.commentBody = "";
        this.loadComments(postId);
        this.loadFeed();
      },
      error: () => this.actionError.set("No fue posible enviar el comentario."),
    });
  }
  /** Copia una URL estable de la publicación para compartirla sin depender de una red externa. */
  share(postId: string): void {
    navigator.clipboard
      ?.writeText(`${location.origin}/comunidad#${postId}`)
      .then(() => this.sharedPostId.set(postId))
      .catch(() => this.sharedPostId.set(postId));
  }
  /** Recupera el hilo solo cuando se abre, para no descargar todos los comentarios del feed. */
  private loadComments(postId: string): void {
    this.api
      .comments(postId)
      .subscribe({
        next: (comments) =>
          this.commentsByPost.update((current) => ({
            ...current,
            [postId]: comments,
          })),
        error: () =>
          this.actionError.set("No fue posible cargar los comentarios."),
      });
  }
}
