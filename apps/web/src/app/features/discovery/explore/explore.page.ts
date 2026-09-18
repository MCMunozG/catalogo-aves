import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";

@Component({
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: "./explore.page.html",
  styleUrl: "./explore.page.scss",
})
/** Pantalla de descubrimiento que delega la búsqueda editorial en Catalog. */
export class ExplorePageComponent {
  private readonly router = inject(Router);
  searchText = "";
  habitat = "";
  moment = "week";
  readonly highlights = [
    {
      icon: "◒",
      label: "OBSERVA",
      title: "Especies del día",
      text: "Repasa fichas y recomendaciones antes de salir.",
      link: "/especies",
    },
    {
      icon: "⌖",
      label: "EXPLORA",
      title: "Mapa con cuidado",
      text: "Consulta patrones públicos sin comprometer ubicaciones.",
      link: "/mapa",
    },
    {
      icon: "↗",
      label: "COMPARTE",
      title: "Aprende en comunidad",
      text: "Convierte una salida en una conversación útil.",
      link: "/comunidad",
    },
  ];

  /** Lleva los criterios a la lista, que es la dueña de presentar resultados de Catalog. */
  explore(): void {
    this.router.navigate(["/especies"], {
      queryParams: { q: this.searchText || null, habitat: this.habitat || null, moment: this.moment },
    });
  }
}
