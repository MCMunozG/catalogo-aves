import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  ViewChild,
  inject,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import * as L from "leaflet";
import { LocationSearchService } from "../core/location-search.service";
import { LocationSearchResult, MapLocation } from "./models/location.models";
import { Sighting } from "./models/observation.models";
import { Place } from "./models/planning.models";
import { Species } from "./models/catalog.models";

/**
 * Mapa de OpenStreetMap construido con Leaflet. En modo selector la persona
 * busca o elige un punto visualmente; en modo exploración sólo representa
 * puntos públicos devueltos por Observation.
 */
@Component({
  standalone: true,
  selector: "app-open-street-map",
  imports: [FormsModule],
  templateUrl: "./open-street-map.component.html",
  styleUrl: "./open-street-map.component.scss",
})
export class OpenStreetMapComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  @Input() mode: "browse" | "picker" = "browse";
  @Input() sightings: Sighting[] = [];
  /** Catálogo mínimo para convertir el id del avistamiento en un nombre legible. */
  @Input() species: Species[] = [];
  /** Lugares públicos de planificación, independientes de los avistamientos. */
  @Input() places: Place[] = [];
  /** Punto que una tarjeta solicitó enfocar al abrir el mapa. */
  @Input() focusLocation: MapLocation | null = null;
  @Input() selectedLocation: MapLocation | null = null;
  @Output() locationChange = new EventEmitter<MapLocation>();
  @ViewChild("map") mapElement?: ElementRef<HTMLElement>;

  searchQuery = "";
  searchResults: LocationSearchResult[] = [];
  searching = false;
  searchError = "";
  /** Informa una degradación visual si el proveedor de teselas no puede completar el mapa. */
  mapTilesUnavailable = false;
  private readonly locationSearch = inject(LocationSearchService);
  private map?: L.Map;
  private selectedMarker?: L.Marker;
  private publicMarkers: L.Marker[] = [];

  /** Inicializa Leaflet cuando Angular ya creó el contenedor del mapa. */
  ngAfterViewInit(): void {
    if (!this.mapElement) return;

    this.map = L.map(this.mapElement.nativeElement, {
      center: [4.711, -74.072],
      zoom: this.mode === "picker" ? 12 : 7,
      scrollWheelZoom: true,
    });
    const tiles = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      },
    );
    tiles.on("tileerror", () => (this.mapTilesUnavailable = true));
    tiles.addTo(this.map);

    if (this.mode === "picker") {
      this.map.on("click", (event) =>
        this.selectLocation({
          latitude: Number(event.latlng.lat.toFixed(7)),
          longitude: Number(event.latlng.lng.toFixed(7)),
          label: "Ubicación seleccionada en el mapa",
        }),
      );
    }
    this.render();
  }

  /** Sincroniza marcadores cuando cambian los puntos públicos o la selección. */
  ngOnChanges(): void {
    this.render();
  }

  /** Libera los manejadores y nodos que Leaflet creó fuera del árbol de Angular. */
  ngOnDestroy(): void {
    this.map?.remove();
  }

  /** Solicita resultados sólo cuando la persona envía el formulario de búsqueda. */
  search(): void {
    this.searchError = "";
    this.searchResults = [];
    this.searching = true;
    this.locationSearch.search(this.searchQuery).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.searching = false;
        if (!results.length) this.searchError = "No encontramos ese lugar.";
      },
      error: (error: Error) => {
        this.searching = false;
        this.searchError = this.searchErrorMessage(error.message);
      },
    });
  }

  /** Centra el mapa y confirma el resultado escogido sin exponer coordenadas en la interfaz. */
  chooseSearchResult(result: LocationSearchResult): void {
    this.searchResults = [];
    this.selectLocation(result);
    this.map?.setView([result.latitude, result.longitude], 15);
  }

  /** Mantiene el único marcador privado y comunica al formulario la selección visual. */
  private selectLocation(location: MapLocation): void {
    this.selectedLocation = location;
    this.placeSelectedMarker();
    this.locationChange.emit(location);
  }

  /** Aplica el modo activo después de que el mapa esté listo. */
  private render(): void {
    if (!this.map) return;
    if (this.mode === "picker") this.placeSelectedMarker();
    else this.renderPublicMarkers();
  }

  /** Dibuja o reposiciona el punto privado que nunca se incorpora al mapa público. */
  private placeSelectedMarker(): void {
    if (!this.map) return;

    if (!this.selectedLocation) {
      if (this.selectedMarker) {
        this.selectedMarker.remove();
        this.selectedMarker = undefined;
      }

      return;
    }
    const position: L.LatLngExpression = [
      this.selectedLocation.latitude,
      this.selectedLocation.longitude,
    ];
    if (!this.selectedMarker) {
      this.selectedMarker = L.marker(position, { draggable: true }).addTo(
        this.map,
      );
      this.selectedMarker.on("dragend", () => {
        const positionAfterDrag = this.selectedMarker?.getLatLng();
        if (!positionAfterDrag) return;
        this.selectLocation({
          latitude: Number(positionAfterDrag.lat.toFixed(7)),
          longitude: Number(positionAfterDrag.lng.toFixed(7)),
          label: "Ubicación ajustada en el mapa",
        });
      });
    } else this.selectedMarker.setLatLng(position);
  }

  /** Reemplaza los marcadores por la proyección ya saneada del servicio Observation. */
  private renderPublicMarkers(): void {
    this.publicMarkers.forEach((marker) => marker.remove());
    const sightingMarkers = this.sightings
      .filter(
        (sighting) =>
          Number.isFinite(Number(sighting.latitude)) &&
          Number.isFinite(Number(sighting.longitude)),
      )
      .map((sighting) => {
        const marker = L.marker(
          [Number(sighting.latitude), Number(sighting.longitude)],
          { icon: this.sightingIcon() },
        ).addTo(this.map!);
        const speciesLink = sighting.species_id
          ? `<a class="map-popup-link" href="/especies/${encodeURIComponent(sighting.species_id)}">Ver ficha de la especie →</a>`
          : "";
        const species = this.species.find(
          (item) => item.id === sighting.species_id,
        );
        const speciesName = species
          ? `<em>${this.escapeHtml(species.common_name)}</em><br><small>${this.escapeHtml(species.scientific_name)}</small><br>`
          : "";
        marker.bindPopup(
          `${speciesName}<strong>Avistamiento público</strong><br>Individuos: ${sighting.individuals}<br>${speciesLink}`,
        );
        return marker;
      });
    const placeMarkers = this.places.map((place) => {
      const marker = L.marker([place.latitude, place.longitude]).addTo(
        this.map!,
      );
      marker.bindPopup(
        `<strong>${this.escapeHtml(place.name)}</strong><br>${this.escapeHtml(place.habitat)} · ${this.escapeHtml(place.municipality)}`,
      );
      return marker;
    });
    this.publicMarkers = [...sightingMarkers, ...placeMarkers];
    // Los avistamientos son interactivos y deben permanecer sobre los pines de lugares cercanos.
    sightingMarkers.forEach((marker) => marker.setZIndexOffset(500));
    if (this.focusLocation) {
      this.map?.setView(
        [this.focusLocation.latitude, this.focusLocation.longitude],
        15,
      );
      const focusedMarker = [...sightingMarkers, ...placeMarkers].find(
        (marker) =>
          marker.getLatLng().lat === this.focusLocation?.latitude &&
          marker.getLatLng().lng === this.focusLocation?.longitude,
      );
      focusedMarker?.openPopup();
    } else if (this.publicMarkers.length) {
      const bounds = L.featureGroup(this.publicMarkers).getBounds();
      if (bounds.isValid())
        this.map?.fitBounds(bounds.pad(0.18), { maxZoom: 12 });
    }
  }

  /** Crea un marcador distinto para que los avistamientos no se confundan con lugares. */
  private sightingIcon(): L.DivIcon {
    return L.divIcon({
      className: "sighting-marker-container",
      html: '<span class="sighting-marker" aria-label="Avistamiento">🐦</span>',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -18],
    });
  }

  /** Evita que datos remotos se interpreten como HTML dentro del contenido emergente de Leaflet. */
  private escapeHtml(value: string): string {
    const element = document.createElement("div");
    element.textContent = value;
    return element.innerHTML;
  }

  /** Traduce los errores técnicos de la búsqueda a instrucciones accionables. */
  private searchErrorMessage(code: string): string {
    if (code === "LOCATION_SEARCH_QUERY_TOO_SHORT")
      return "Escribe al menos tres caracteres para buscar.";
    if (code === "LOCATION_SEARCH_RATE_LIMIT")
      return "Espera un segundo antes de hacer otra búsqueda.";
    return "No fue posible buscar el lugar. Inténtalo de nuevo.";
  }
}
