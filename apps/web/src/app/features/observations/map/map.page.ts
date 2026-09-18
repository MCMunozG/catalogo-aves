import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { CatalogApiService } from "../../../core/api/catalog-api.service";
import { ObservationsApiService } from "../../../core/api/observations-api.service";
import { OpenStreetMapComponent } from "../../../shared/open-street-map.component";
import { Sighting } from "../../../shared/models/observation.models";
import { MapLocation } from "../../../shared/models/location.models";
import { Place } from "../../../shared/models/planning.models";
import { PlanningApiService } from "../../../core/api/planning-api.service";
import { seedSpecies } from "../../shared/seed-species";

@Component({
  standalone: true,
  imports: [FormsModule, OpenStreetMapComponent],
  templateUrl: "./map.page.html",
  styleUrl: "./map.page.scss",
})
/** Muestra sólo la proyección de mapa saneada devuelta por Observation. */
export class MapPageComponent {
  private readonly catalogApi = inject(CatalogApiService);
  private readonly observationsApi = inject(ObservationsApiService);
  private readonly planningApi = inject(PlanningApiService);
  private readonly route = inject(ActivatedRoute);
  readonly species = signal(seedSpecies);
  readonly mapSightings = signal<Sighting[]>([]);
  readonly mapError = signal(false);
  readonly places = signal<Place[]>([]);
  readonly focusLocation = signal<MapLocation | null>(null);
  selectedSpeciesId = "";
  selectedPeriod = "30";

  constructor() {
    this.catalogApi
      .species()
      .subscribe({ next: ({ data }) => this.species.set(data) });
    this.loadSightings();
    this.planningApi.places().subscribe({
      next: (places) => {
        this.places.set(places);
        const selectedId = this.route.snapshot.queryParamMap.get("place");
        const selected = places.find((place) => place.id === selectedId || place.name === selectedId);
        if (selected) this.focusLocation.set({ latitude: selected.latitude, longitude: selected.longitude, label: selected.name });
      },
      error: () => this.mapError.set(true),
    });
  }

  /** Actualiza los avistamientos cuando se cambia especie o periodo desde el mapa. */
  loadSightings(): void {
    this.observationsApi.map(this.selectedSpeciesId).subscribe({
      next: ({ data }) => {
        const cutoff = this.selectedPeriod === "all" ? null : new Date(Date.now() - Number(this.selectedPeriod) * 86400000);
        const visibleSightings = cutoff ? data.filter((sighting) => new Date(sighting.observed_at) >= cutoff) : data;
        this.mapSightings.set(visibleSightings);
        const requestedSighting = this.route.snapshot.queryParamMap.get("sighting");
        const selected = visibleSightings.find((sighting) => sighting.id === requestedSighting);
        if (selected && Number.isFinite(Number(selected.latitude)) && Number.isFinite(Number(selected.longitude))) {
          this.focusLocation.set({ latitude: Number(selected.latitude), longitude: Number(selected.longitude), label: "Avistamiento seleccionado" });
        }
        this.mapError.set(false);
      },
      error: () => this.mapError.set(true),
    });
  }
}
