import { Component, inject, signal } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { PlanningApiService } from "../../core/api/planning-api.service";
import { BirdingRoute, Place } from "../../shared/models/planning.models";
import { OpenStreetMapComponent } from "../../shared/open-street-map.component";

@Component({
  standalone: true,
  imports: [RouterLink, OpenStreetMapComponent],
  templateUrl: "./planning.page.html",
  styleUrl: "./planning.page.scss",
})
/** Muestra contenido de planificación reutilizable para lugares y rutas. */
export class PlanningPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PlanningApiService);
  readonly view = signal("places");
  readonly places = signal<Place[]>([]);
  readonly routes = signal<BirdingRoute[]>([]);
  readonly error = signal(false);
  planningCards = [
    {
      icon: "⌖",
      meta: "HUMEDAL · 4,5 KM",
      title: "Humedal de la sabana",
      text: "Mira mejores momentos y especies registradas públicamente.",
    },
    {
      icon: "⌁",
      meta: "BOSQUE · FÁCIL",
      title: "Sendero del bosque alto",
      text: "Un recorrido corto para reconocer cantos y estratos.",
    },
    {
      icon: "◒",
      meta: "PARQUE · URBANO",
      title: "Mañana de parque",
      text: "Una ruta para comenzar a registrar aves cerca de casa.",
    },
  ];

  /** Lee la variante solicitada sin duplicar el componente ni su plantilla. */
  constructor() {
    this.route.data.subscribe((data) => {
      this.view.set(data["view"]);
      if (this.view() === "places") this.api.places().subscribe({ next: (items) => { this.places.set(items); this.planningCards = items.map((item) => this.toCard(item)); this.error.set(false); }, error: () => this.error.set(true) });
      else this.api.routes().subscribe({ next: (items) => { this.routes.set(items); this.planningCards = items.map((item) => this.toCard(item)); this.error.set(false); }, error: () => this.error.set(true) });
    });
  }

  /** Abre el punto público en OpenStreetMap sin pedir coordenadas a la persona usuaria. */
  osm(latitude: number, longitude: number): string { return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`; }
  duration(minutes: number): string { return `${Math.floor(minutes / 60)} h ${minutes % 60 ? `${minutes % 60} min` : ""}`.trim(); }

  /** Recupera el punto real de la tarjeta para dibujarlo en su mini mapa. */
  cardPlace(card: { title: string }): Place | null {
    const place = this.places().find((item) => item.name === card.title);
    if (place) return place;
    const route = this.routes().find((item) => item.name === card.title);
    return route ? { id: route.id, name: route.name, municipality: "Inicio del recorrido", habitat: route.difficulty, description: route.description, latitude: route.start_latitude, longitude: route.start_longitude } : null;
  }

  /** Adapta ambos contratos de Observation a la tarjeta visual compartida. */
  private toCard(item: Place | BirdingRoute): { icon: string; meta: string; title: string; text: string } {
    if ("habitat" in item) return { icon: "⌖", meta: `${item.habitat} · ${item.municipality}`, title: item.name, text: item.description };
    return { icon: "⌁", meta: `${item.difficulty} · ${item.distance_km} km`, title: item.name, text: `${item.description} ${this.duration(item.duration_minutes)}.` };
  }
}
