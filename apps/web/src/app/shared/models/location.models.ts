/** Lugar elegido visualmente por una persona dentro del mapa. */
export interface MapLocation {
  /** Etiqueta legible que se muestra en el formulario y se conserva como referencia general. */
  label: string;
  /** Posición interna que la API de avistamientos requiere para aplicar sus reglas de privacidad. */
  latitude: number;
  /** Posición interna que la API de avistamientos requiere para aplicar sus reglas de privacidad. */
  longitude: number;
}

/** Resultado mínimo que devuelve un proveedor de búsqueda geográfica. */
export interface LocationSearchResult extends MapLocation {
  /** Identificador del proveedor, útil para `track` y para evitar depender del texto visible. */
  id: string;
}
