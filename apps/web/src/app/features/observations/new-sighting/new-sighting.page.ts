import { Component, HostListener, inject, OnDestroy, signal } from "@angular/core";
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
export class NewSightingPageComponent implements OnDestroy {
  private readonly catalogApi = inject(CatalogApiService);
  private readonly observationsApi = inject(ObservationsApiService);
  private readonly session = inject(SessionService);
  readonly species = signal(seedSpecies);
  readonly submitting = signal(false);
  readonly formMessage = signal("");
  readonly formSuccess = signal(false);
  /** La posición no se muestra como números: se obtiene al buscar o pulsar el mapa. */
  readonly selectedLocation = signal<MapLocation | null>(null);
  /** Evita iniciar más de una creación automática durante la salida de la ruta. */
  private autoDraftStarted = false;
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
    this.observationsApi
      .createSighting({
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
          this.clear();
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

  /** Guarda en una navegación interna de Angular, cuando el componente deja de existir. */
  ngOnDestroy(): void {
    this.saveDraftOnExit(false);
  }

  /** Intenta terminar el guardado si la pestaña se recarga o se cierra normalmente. */
  @HostListener("window:pagehide")
  saveDraftBeforePageExit(): void {
    this.saveDraftOnExit(true);
  }

  /** Crea un borrador sólo si la persona ya eligió una ubicación y llenó datos válidos. */
  private saveDraftOnExit(isBrowserExit: boolean): void {
    const command = this.autoDraftCommand();
    if (
      this.autoDraftStarted ||
      this.submitting() ||
      !command ||
      !this.session.hasToken()
    ) {
      return;
    }

    this.autoDraftStarted = true;
    this.observationsApi.createSighting(command, {
      keepalive: isBrowserExit,
    }).subscribe({
      // La página ya no está visible; el borrador aparecerá en la bitácora al volver.
      error: () => (this.autoDraftStarted = false),
    });
  }

  /** Construye el comando privado; publish siempre es false durante un autoguardado. */
  private autoDraftCommand() {
    const location = this.selectedLocation();
    const observedAt = new Date(this.draft.observed_at);
    if (
      !location ||
      !this.draft.observed_at ||
      Number.isNaN(observedAt.getTime()) ||
      !Number.isInteger(Number(this.draft.individuals)) ||
      Number(this.draft.individuals) < 1
    ) {
      return null;
    }

    return {
      ...this.draft,
      latitude: location.latitude,
      longitude: location.longitude,
      region: this.draft.region.trim() || location.label,
      observed_at: observedAt.toISOString(),
      publish: false,
    };
  }

  /** Genera un valor local compatible con el control HTML datetime-local. */
  private nowForInput(): string {
    return new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  }

  clear() {
    this.draft = {
      species_id: "",
      observed_at: "",
      individuals: 0,
      region: "",
      behavior: "",
      notes: "",
      publish: false,
    };

    this.selectedLocation.set(null);
  }
}
