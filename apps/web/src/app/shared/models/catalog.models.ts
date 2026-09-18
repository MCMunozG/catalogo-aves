/** Proyección pública de Catalog usada por listas, detalle y formularios de avistamiento. */
export interface Species {
  id: string;
  common_name: string;
  scientific_name: string;
  sensitivity: "EXACT" | "APPROXIMATE" | "HIDDEN";
  description?: string;
  habitat?: string;
  conservation_status?: string;
}
