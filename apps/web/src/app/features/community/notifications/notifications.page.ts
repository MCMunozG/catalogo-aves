import { Component, computed, inject, signal } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { CommunityApiService } from "../../../core/api/community-api.service";
import { SessionService } from "../../../core/session.service";
import { Notification } from "../../../shared/models/community.models";

@Component({
  standalone: true,
  imports: [RouterLink],
  templateUrl: "./notifications.page.html",
  styleUrl: "./notifications.page.scss",
})
/** Presenta alertas accionables: abrirlas confirma la lectura y lleva al contexto relacionado. */
export class NotificationsPageComponent {
  private readonly communityApi = inject(CommunityApiService);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  readonly notifications = signal<Notification[]>([]);
  readonly loading = signal(false);
  readonly actionError = signal("");
  readonly unreadCount = computed(() => this.notifications().filter((item) => !item.read_at).length);

  constructor() { if (this.hasSession()) this.loadNotifications(); }

  /** Recupera únicamente las alertas pertenecientes a la identidad local vigente. */
  loadNotifications(): void {
    this.loading.set(true);
    this.communityApi.notifications().subscribe({
      next: ({ data }) => { this.notifications.set(data); this.loading.set(false); },
      error: () => { this.actionError.set("No fue posible cargar las notificaciones."); this.loading.set(false); },
    });
  }

  /** Marca primero la alerta y después abre la publicación que la originó. */
  openNotification(item: Notification): void {
    this.actionError.set("");
    const openTarget = () => item.reference_id
      ? this.router.navigate(["/comunidad"], { queryParams: { post: item.reference_id } })
      : undefined;

    if (item.read_at) { openTarget(); return; }
    this.communityApi.markNotificationRead(item.id).subscribe({
      next: () => {
        this.notifications.update((items) => items.map((current) => current.id === item.id ? { ...current, read_at: new Date().toISOString() } : current));
        openTarget();
      },
      error: () => this.actionError.set("No fue posible actualizar la notificación."),
    });
  }

  /** Atiende todas las alertas de la persona actual sin cambiar de pantalla. */
  markAllRead(): void {
    if (!this.unreadCount()) return;
    this.communityApi.markAllNotificationsRead().subscribe({
      next: () => this.notifications.update((items) => items.map((item) => ({ ...item, read_at: item.read_at ?? new Date().toISOString() }))),
      error: () => this.actionError.set("No fue posible marcar las notificaciones como leídas."),
    });
  }

  /** Convierte el código de evento en una etiqueta comprensible para la interfaz. */
  notificationTitle(type: string): string { return type === "COMMENT" ? "Nueva respuesta" : "Actividad de la comunidad"; }

  /** Expone una comprobación de sesión para los estados vacíos de la plantilla. */
  hasSession(): boolean { return this.session.hasToken(); }
}
