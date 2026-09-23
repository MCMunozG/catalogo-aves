import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import {
  CreateSightingCommand,
  Sighting,
} from "../../shared/models/observation.models";

/** Cliente de Observation. Nunca deriva ni almacena privacidad geográfica en el navegador. */
@Injectable({ providedIn: "root" })
export class ObservationsApiService {
  constructor(private readonly http: HttpClient) {}

  /** Obtiene puntos públicos; el filtro de especie se resuelve en Observation. */
  map(speciesId = ""): Observable<{ data: Sighting[] }> {
    return this.http.get<{ data: Sighting[] }>(
      "/api/observations/v1/map/sightings",
      { params: speciesId ? { species_id: speciesId } : {} },
    );
  }
  mine(): Observable<{ data: Sighting[] }> {
    return this.http.get<{ data: Sighting[] }>(
      "/api/observations/v1/sightings/mine",
    );
  }
  /**
   * Crea un borrador o publicación. keepalive se usa al abandonar el documento
   * para que el backend fetch pueda intentar completar la solicitud pendiente.
   */
  createSighting(
    command: CreateSightingCommand,
    options: { keepalive?: boolean } = {},
  ): Observable<Sighting> {
    return this.http.post<Sighting>("/api/observations/v1/sightings", command, {
      keepalive: options.keepalive,
    });
  }
  /** Edita un registro propio y recalcula su estado y ubicación pública en Observation. */
  updateSighting(id: string, command: CreateSightingCommand): Observable<Sighting> {
    return this.http.put<Sighting>(`/api/observations/v1/sightings/${id}`, command);
  }
  /** Retira definitivamente un avistamiento que pertenece a la sesión actual. */
  deleteSighting(id: string): Observable<void> {
    return this.http.delete<void>(`/api/observations/v1/sightings/${id}`);
  }
}
