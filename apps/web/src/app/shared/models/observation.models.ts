/** Proyección API segura para la SPA; las coordenadas son públicas salvo que se aniden explícitamente. */
export interface Sighting {
  id: string;
  species_id?: string | null;
  observed_at: string;
  individuals: number;
  behavior?: string | null;
  notes?: string | null;
  status: string;
  sensitivity: string;
  /** Sólo coordenadas públicas; las privadas se omiten intencionalmente del contrato de la SPA. */
  latitude?: number | null;
  longitude?: number | null;
  region?: string | null;
  private_location?: { latitude: number; longitude: number } | null;
}

/** Entrada aceptada por Observation al crear un borrador o solicitar una publicación. */
export interface CreateSightingCommand {
  species_id: string;
  observed_at: string;
  individuals: number;
  latitude: number;
  longitude: number;
  region: string;
  behavior: string;
  notes: string;
  publish: boolean;
}
