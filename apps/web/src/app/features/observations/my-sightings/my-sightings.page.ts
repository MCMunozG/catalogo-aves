import { Component, computed, inject, signal } from "@angular/core";
import { DatePipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { CatalogApiService } from "../../../core/api/catalog-api.service";
import { ObservationsApiService } from "../../../core/api/observations-api.service";
import { SessionService } from "../../../core/session.service";
import { Species } from "../../../shared/models/catalog.models";
import { MapLocation } from "../../../shared/models/location.models";
import { CreateSightingCommand, Sighting } from "../../../shared/models/observation.models";
import { OpenStreetMapComponent } from "../../../shared/open-street-map.component";
import { seedSpecies } from "../../shared/seed-species";

type SightingDraft = Omit<CreateSightingCommand, "latitude" | "longitude">;

@Component({
  standalone: true,
  imports: [DatePipe, FormsModule, RouterLink, OpenStreetMapComponent],
  templateUrl: "./my-sightings.page.html",
  styleUrl: "./my-sightings.page.scss",
})
/** Bitácora privada con edición, publicación y retiro de los avistamientos de la sesión actual. */
export class MySightingsPageComponent {
  private readonly observationsApi = inject(ObservationsApiService);
  private readonly catalogApi = inject(CatalogApiService);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  readonly mySightings = signal<Sighting[]>([]);
  readonly species = signal<Species[]>(seedSpecies);
  readonly filter = signal<"ALL" | "DRAFT" | "PUBLIC">("ALL");
  readonly editingId = signal<string | null>(null);
  readonly deletingId = signal<string | null>(null);
  readonly selectedLocation = signal<MapLocation | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly message = signal("");
  readonly error = signal("");
  readonly visibleSightings = computed(() => this.mySightings().filter((sighting) => this.filter() === "ALL" || (this.filter() === "DRAFT" ? sighting.status === "DRAFT" : sighting.status !== "DRAFT")));
  readonly stats = computed(() => ({
    total: this.mySightings().length,
    drafts: this.mySightings().filter((sighting) => sighting.status === "DRAFT").length,
    shared: this.mySightings().filter((sighting) => sighting.status !== "DRAFT").length,
    mapVisible: this.mySightings().filter((sighting) => this.isMapVisible(sighting)).length,
  }));
  draft: SightingDraft = this.emptyDraft();

  constructor() {
    if (this.hasSession()) this.loadSightings();
    this.catalogApi.species().subscribe({ next: ({ data }) => this.species.set(data) });
  }

  /** Recupera el cuaderno privado de la identidad autenticada sin exponerlo al mapa público. */
  loadSightings(): void {
    this.loading.set(true);
    this.observationsApi.mine().subscribe({
      next: ({ data }) => { this.mySightings.set(data); this.loading.set(false); },
      error: () => { this.error.set("No fue posible cargar tu bitácora."); this.loading.set(false); },
    });
  }

  /** Abre el editor con los datos privados que sólo recibió la persona dueña del registro. */
  edit(sighting: Sighting): void {
    const location = sighting.private_location;
    if (!location) { this.error.set("No fue posible recuperar la ubicación privada de este registro."); return; }
    this.error.set(""); this.message.set(""); this.deletingId.set(null); this.editingId.set(sighting.id);
    this.draft = {
      species_id: sighting.species_id ?? "",
      observed_at: this.toLocalInput(sighting.observed_at),
      individuals: sighting.individuals,
      region: sighting.region ?? "",
      behavior: sighting.behavior ?? "",
      notes: sighting.notes ?? "",
      // Al retomar un borrador se propone compartirlo; la persona puede desmarcarlo para mantenerlo privado.
      publish: true,
    };
    this.selectedLocation.set({ ...location, label: sighting.region || "Ubicación privada guardada" });
  }

  /** Guarda la edición y deja que Observation recalcule la proyección pública sin usar coordenadas visibles. */
  save(): void {
    const id = this.editingId();
    const location = this.selectedLocation();
    if (!id || !location) { this.error.set("Selecciona una ubicación en el mapa antes de guardar."); return; }
    this.saving.set(true); this.error.set("");
    this.observationsApi.updateSighting(id, {
      ...this.draft,
      observed_at: new Date(this.draft.observed_at).toISOString(),
      latitude: location.latitude,
      longitude: location.longitude,
      region: this.draft.region.trim() || location.label,
    }).subscribe({
      next: () => { this.saving.set(false); this.editingId.set(null); this.message.set("Avistamiento actualizado."); this.loadSightings(); },
      error: () => { this.saving.set(false); this.error.set("No fue posible guardar el avistamiento."); },
    });
  }

  /** Publica un borrador existente usando su punto privado y las reglas de sensibilidad actuales. */
  publish(sighting: Sighting): void {
    const location = sighting.private_location;
    if (!location) { this.error.set("No fue posible recuperar la ubicación privada para publicar este registro."); return; }
    this.saving.set(true); this.error.set("");
    this.observationsApi.updateSighting(sighting.id, {
      species_id: sighting.species_id ?? "",
      observed_at: new Date(sighting.observed_at).toISOString(),
      individuals: sighting.individuals,
      region: sighting.region ?? "",
      behavior: sighting.behavior ?? "",
      notes: sighting.notes ?? "",
      latitude: location.latitude,
      longitude: location.longitude,
      publish: true,
    }).subscribe({
      next: (updated) => { this.saving.set(false); this.message.set(this.isMapVisible(updated) ? "Avistamiento publicado y visible en el mapa." : "Avistamiento compartido con ubicación protegida; no se muestra un marcador público."); this.loadSightings(); },
      error: () => { this.saving.set(false); this.error.set("No fue posible publicar. Intenta de nuevo cuando Catalog esté disponible."); },
    });
  }

  /** Pide confirmación explícita antes de eliminar un registro privado. */
  requestDelete(id: string): void { this.deletingId.set(id); this.editingId.set(null); }
  delete(id: string): void {
    this.saving.set(true); this.error.set("");
    this.observationsApi.deleteSighting(id).subscribe({
      next: () => { this.saving.set(false); this.deletingId.set(null); this.message.set("Avistamiento eliminado."); this.loadSightings(); },
      error: () => { this.saving.set(false); this.error.set("No fue posible eliminar el avistamiento."); },
    });
  }

  /** Abre el mapa público centrado en el registro ya autorizado para publicar. */
  viewOnMap(sighting: Sighting): void { this.router.navigate(["/mapa"], { queryParams: { sighting: sighting.id } }); }
  /** Conserva la selección del mapa en memoria y rellena la referencia sólo cuando no se escribió una. */
  selectMapLocation(location: MapLocation): void { this.selectedLocation.set(location); if (!this.draft.region.trim()) this.draft.region = location.label; }
  speciesName(id?: string | null): string { return this.species().find((species) => species.id === id)?.common_name ?? "Especie sin identificar"; }
  statusLabel(status: string, sensitivity = "HIDDEN"): string {
    if (status === "DRAFT") return "Borrador privado";
    if (status === "NEEDS_IDENTIFICATION") return "Publicado · sin identificar";
    if (sensitivity === "HIDDEN") return "Publicado · ubicación protegida";
    return sensitivity === "APPROXIMATE" ? "Publicado · zona aproximada" : "Publicado · punto autorizado";
  }
  /** Un registro compartido puede conservar su ubicación oculta si la especie lo requiere. */
  isMapVisible(sighting: Sighting): boolean { return sighting.status !== "DRAFT" && sighting.sensitivity !== "HIDDEN" && Number.isFinite(Number(sighting.latitude)) && Number.isFinite(Number(sighting.longitude)); }
  hasSession(): boolean { return this.session.hasToken(); }
  cancelEdit(): void { this.editingId.set(null); this.selectedLocation.set(null); this.draft = this.emptyDraft(); }
  private emptyDraft(): SightingDraft { return { species_id: "", observed_at: this.toLocalInput(new Date().toISOString()), individuals: 1, region: "", behavior: "", notes: "", publish: true }; }
  private toLocalInput(date: string): string { const local = new Date(date); return new Date(local.getTime() - local.getTimezoneOffset() * 60000).toISOString().slice(0, 16); }
}
