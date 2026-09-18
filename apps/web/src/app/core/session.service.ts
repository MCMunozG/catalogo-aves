import { Injectable, signal } from "@angular/core";
import { SessionResponse, SessionUser } from "../shared/models/accounts.models";

export type { SessionUser } from "../shared/models/accounts.models";

/**
 * Conserva la sesión de corta duración de la SPA en sessionStorage y refleja sólo el resumen de usuario como signal.
 * Es una decisión de transporte del MVP; un BFF futuro debe reemplazarla con cookies HttpOnly.
 */
@Injectable({ providedIn: "root" })
export class SessionService {
  readonly user = signal<SessionUser | null>(this.readUser());

  /** Persiste ambos tokens juntos para que la UI no observe una sesión iniciada parcialmente. */
  start(session: SessionResponse): void {
    sessionStorage.setItem("catalogo_aves_access_token", session.access_token);
    sessionStorage.setItem("catalogo_aves_refresh_token", session.refresh_token);
    sessionStorage.setItem("catalogo_aves_user", JSON.stringify(session.user));
    this.user.set(session.user);
  }

  /** Limpia el estado local; revocar refresh tokens en servidor sigue siendo responsabilidad de Accounts. */
  end(): void {
    sessionStorage.removeItem("catalogo_aves_access_token");
    sessionStorage.removeItem("catalogo_aves_refresh_token");
    sessionStorage.removeItem("catalogo_aves_user");
    this.user.set(null);
  }

  hasToken(): boolean {
    return !!sessionStorage.getItem("catalogo_aves_access_token");
  }

  private readUser(): SessionUser | null {
    try {
      const raw = sessionStorage.getItem("catalogo_aves_user");
      if (!raw) return null;

      const user = JSON.parse(raw) as SessionUser;
      // Migra la única sesión local creada antes del cambio de nombre del proyecto.
      if (user.email === "admin@catalogo-aves.local" && user.name === "Cénit Admin") {
        const migrated = { ...user, name: "Catálogo de Aves Admin" };
        sessionStorage.setItem("catalogo_aves_user", JSON.stringify(migrated));
        return migrated;
      }
      return user;
    } catch {
      return null;
    }
  }
}
