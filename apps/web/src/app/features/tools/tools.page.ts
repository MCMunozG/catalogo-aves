import { Component, inject, signal } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

@Component({
  standalone: true,
  templateUrl: "./tools.page.html",
  styleUrl: "./tools.page.scss",
})
/** Reutiliza una sola pantalla para colecciones, administración y moderación según datos de ruta. */
export class ToolsPageComponent {
  private readonly route = inject(ActivatedRoute);
  readonly view = signal("collections");
  readonly title = signal("Mis colecciones");

  /** Sincroniza título y variante visual con la ruta activa. */
  constructor() {
    this.route.data.subscribe((data) => {
      this.view.set(data["view"]);
      this.title.set(data["title"]);
    });
  }
}
