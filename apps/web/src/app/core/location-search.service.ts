import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, map, of, throwError } from "rxjs";
import { LocationSearchResult } from "../shared/models/location.models";
import { LOCATION_SEARCH_ENDPOINT } from "./runtime-config";

interface NominatimPlace {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

/**
 * Encapsula la búsqueda de lugares para que la interfaz no dependa directamente
 * de Nominatim y pueda cambiarse de proveedor desde un único punto.
 */
@Injectable({ providedIn: "root" })
export class LocationSearchService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = inject(LOCATION_SEARCH_ENDPOINT);
  private readonly cache = new Map<string, LocationSearchResult[]>();
  private lastRequestAt = 0;

  /**
   * Busca sólo tras una acción explícita de la persona; no se usa para autocompletar.
   * El límite de una solicitud por segundo protege la instancia pública de Nominatim.
   */
  search(query: string): Observable<LocationSearchResult[]> {
    const normalizedQuery = query.trim();
    if (normalizedQuery.length < 3) {
      return throwError(
        () => new Error("LOCATION_SEARCH_QUERY_TOO_SHORT"),
      );
    }

    const cached = this.cache.get(normalizedQuery.toLocaleLowerCase());
    if (cached) return of(cached);

    if (Date.now() - this.lastRequestAt < 1000) {
      return throwError(() => new Error("LOCATION_SEARCH_RATE_LIMIT"));
    }
    this.lastRequestAt = Date.now();

    const params = new HttpParams()
      .set("format", "jsonv2")
      .set("limit", "5")
      .set("addressdetails", "1")
      .set("q", normalizedQuery);

    return this.http
      .get<NominatimPlace[]>(this.endpoint, { params })
      .pipe(
        map((places) =>
          places.map((place) => ({
            id: String(place.place_id),
            label: place.display_name,
            latitude: Number(place.lat),
            longitude: Number(place.lon),
          })),
        ),
        map((results) => {
          this.cache.set(normalizedQuery.toLocaleLowerCase(), results);
          return results;
        }),
      );
  }
}
