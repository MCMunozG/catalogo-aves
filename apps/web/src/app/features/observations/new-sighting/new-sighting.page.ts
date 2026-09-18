import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CatalogApiService } from "../../../core/api/catalog-api.service";
import { ObservationsApiService } from "../../../core/api/observations-api.service";
import { SessionService } from "../../../core/session.service";
import { MapLocation } from "../../../shared/models/location.models";
import { OpenStreetMapComponent } from "../../../shared/open-street-map.component";
import { seedSpecies } from "../../shared/seed-species";

@Component({
  standalone: true,
  imports: [FormsModule, OpenStreetMapComponent],
  templateUrl: "./new-sighting.page.html",
  styleUrl: "./new-sighting.page.scss",
})
/** Captura una observación privada; Observation, no esta página, decide su proyección pública. */
export class NewSightingPageComponent {
  private readonly catalogApi = inject(CatalogApiService);
  private readonly observationsApi = inject(ObservationsApiService);
  private readonly session = inject(SessionService);
  readonly species = signal(seedSpecies);
  readonly submitting = signal(false);
  readonly formMessage = signal("");
  readonly formSuccess = signal(false);
  /** La posición no se muestra como números: se obtiene al buscar o pulsar el mapa. */
  readonly selectedLocation = signal<MapLocation | null>(null);
  draft = {
    species_id: "",
    observed_at: this.nowForInput(),
    individuals: 1,
    region: "",
    behavior: "",
    notes: "",
    publish: true,
  };

  constructor() {
    this.catalogApi
      .species()
      .subscribe({ next: ({ data }) => this.species.set(data) });
  }

  /** Valida la interfaz, exige una ubicación visual y delega sensibilidad/privacidad a Observation. */
  submitSighting(valid: boolean | null): void {
    if (!valid) {
      this.formSuccess.set(false);
      this.formMessage.set("Completa los campos obligatorios.");
      return;
    }
    const location = this.selectedLocation();
    if (!location) {
      this.formSuccess.set(false);
      this.formMessage.set("Busca o selecciona la ubicación en el mapa.");
      return;
    }
    if (!this.session.hasToken()) {
      this.formSuccess.set(false);
      this.formMessage.set("Inicia sesión antes de guardar un avistamiento.");
      return;
    }
    this.submitting.set(true);
    this.observationsApi.createSighting({
        ...this.draft,
        latitude: location.latitude,
        longitude: location.longitude,
        region: this.draft.region.trim() || location.label,
        observed_at: new Date(this.draft.observed_at).toISOString(),
      })
      .subscribe({
        next: (created) => {
          this.formSuccess.set(true);
          this.formMessage.set(
            created.status === "DRAFT"
              ? "Avistamiento guardado como borrador privado."
              : created.sensitivity === "HIDDEN"
                ? "Avistamiento guardado con ubicación protegida; no tendrá marcador público."
                : "Avistamiento guardado y mostrado en el mapa con la privacidad correspondiente.",
          );
          this.submitting.set(false);
        },
        error: () => {
          this.formSuccess.set(false);
          this.formMessage.set(
            "No fue posible guardar. Verifica que los servicios estén iniciados.",
          );
          this.submitting.set(false);
        },
      });
  }

  /** Conserva la ubicación escogida como estado interno y prellena una referencia humana. */
  selectMapLocation(location: MapLocation): void {
    this.selectedLocation.set(location);
    if (!this.draft.region.trim()) this.draft.region = location.label;
  }
  /** Genera un valor local compatible con el control HTML datetime-local. */
  private nowForInput(): string {
    return new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  }
}
