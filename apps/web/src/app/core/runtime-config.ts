import { InjectionToken } from "@angular/core";

/** Configuración no secreta que el servidor entrega junto con la SPA. */
export interface RuntimeConfig {
  /** URL del proveedor de búsqueda de lugares, intercambiable sin recompilar Angular. */
  locationSearchEndpoint: string;
}

/** Valor seguro cuando el archivo de configuración aún no está disponible en desarrollo. */
export const defaultRuntimeConfig: RuntimeConfig = {
  locationSearchEndpoint: "https://nominatim.openstreetmap.org/search",
};

/** Dependencia explícita para evitar que componentes conozcan el proveedor de geocodificación. */
export const LOCATION_SEARCH_ENDPOINT = new InjectionToken<string>(
  "LOCATION_SEARCH_ENDPOINT",
);
