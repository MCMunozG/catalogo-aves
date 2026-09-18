import { HttpErrorResponse } from "@angular/common/http";
import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { AccountsApiService } from "../../../core/api/accounts-api.service";
import { SessionService } from "../../../core/session.service";

@Component({
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: "./auth.page.html",
  styleUrl: "./auth.page.scss",
})
/** Es dueño del estado de login/registro y retoma la ruta capturada por el guarda. */
export class AuthPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly accountsApi = inject(AccountsApiService);
  private readonly session = inject(SessionService);
  readonly view = signal<"login" | "register">("login");
  readonly submitting = signal(false);
  readonly authMessage = signal("");
  auth = { name: "", email: "", password: "", password_confirmation: "" };

  constructor() {
    this.route.data.subscribe((data) => this.view.set(data["view"]));
  }

  submitAuth(valid: boolean | null): void {
    if (!valid) {
      this.authMessage.set(
        "Revisa los datos. La contraseña debe tener al menos 12 caracteres.",
      );
      return;
    }
    this.submitting.set(true);
    this.authMessage.set("");
    const request =
      this.view() === "login"
        ? this.accountsApi.login(this.auth.email, this.auth.password)
        : this.accountsApi.register(
            this.auth.name,
            this.auth.email,
            this.auth.password,
            this.auth.password_confirmation,
          );
    request.subscribe({
      next: (session) => {
        this.session.start(session);
        this.submitting.set(false);
        const returnUrl = this.route.snapshot.queryParamMap.get("returnUrl");
        this.router.navigateByUrl(
          returnUrl?.startsWith("/") ? returnUrl : "/perfil",
        );
      },
      error: (error: HttpErrorResponse) => {
        this.authMessage.set(this.describeAuthError(error));
        this.submitting.set(false);
      },
    });
  }

  /** Convierte fallos HTTP estables en acciones que puede realizar quien usa el formulario. */
  private describeAuthError(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return "No se pudo conectar con Accounts. Confirma que el servicio local esté iniciado.";
    }

    if (error.status === 429) {
      return "Has hecho varios intentos. Espera un minuto antes de volver a intentarlo.";
    }

    const code = this.errorCode(error.error);
    if (this.view() === "login" && code === "INVALID_CREDENTIALS") {
      return "El correo o la contraseña no son correctos.";
    }

    if (error.status === 422) {
      return this.view() === "login"
        ? "El correo o la contraseña no son correctos."
        : "Revisa los datos del registro y vuelve a intentarlo.";
    }

    return "No fue posible completar la operación. Intenta de nuevo en unos momentos.";
  }

  /** Lee sólo el código público legible por máquina; no muestra mensajes backend literalmente. */
  private errorCode(body: unknown): string | null {
    if (!body || typeof body !== "object") return null;
    const code = (body as { code?: unknown }).code;
    return typeof code === "string" ? code : null;
  }
}
