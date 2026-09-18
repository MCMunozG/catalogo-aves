import { Component, inject } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { SessionService } from "./core/session.service";

@Component({
  standalone: true,
  selector: "app-root",
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
/** Contenedor compartido por cada feature diferida; expone el estado de sesión a la navegación. */
export class AppComponent {
  readonly session = inject(SessionService);

  /** Finaliza sólo el estado del navegador; revocar el refresh en servidor será una acción explícita futura. */
  logout(): void {
    this.session.end();
  }
}
