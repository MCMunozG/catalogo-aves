import "zone.js";
import { bootstrapApplication } from "@angular/platform-browser";
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from "@angular/common/http";
import { provideRouter, withComponentInputBinding } from "@angular/router";
import { AppComponent } from "./app/app.component";
import { routes } from "./app/app.routes";
import { authInterceptor } from "./app/core/auth.interceptor";
import {
  defaultRuntimeConfig,
  LOCATION_SEARCH_ENDPOINT,
  RuntimeConfig,
} from "./app/core/runtime-config";

/** Lee la configuración pública del despliegue sin bloquear el inicio si aún no existe. */
async function loadRuntimeConfig(): Promise<RuntimeConfig> {
  try {
    const response = await fetch("/catalogo-aves-runtime-config.json", {
      cache: "no-store",
    });
    if (!response.ok) return defaultRuntimeConfig;
    return { ...defaultRuntimeConfig, ...(await response.json()) };
  } catch {
    return defaultRuntimeConfig;
  }
}

loadRuntimeConfig()
  .then((runtimeConfig) =>
    bootstrapApplication(AppComponent, {
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
        {
          provide: LOCATION_SEARCH_ENDPOINT,
          useValue: runtimeConfig.locationSearchEndpoint,
        },
      ],
    }),
  )
  .catch(console.error);
