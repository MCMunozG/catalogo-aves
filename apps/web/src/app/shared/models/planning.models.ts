/** Lugar público disponible para planear una visita. */
export interface Place { id: string; name: string; municipality: string; habitat: string; description: string; latitude: number; longitude: number; }
/** Recorrido público y su punto de inicio. */
export interface BirdingRoute { id: string; name: string; difficulty: string; duration_minutes: number; distance_km: number; description: string; start_latitude: number; start_longitude: number; }
