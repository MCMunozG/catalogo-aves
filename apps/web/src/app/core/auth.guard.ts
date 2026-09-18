import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { SessionService } from "./session.service";

/**
 * Redirige a usuarios anónimos al inicio de sesión y conserva la URL solicitada.
 * Es sólo experiencia de navegación, nunca un sustituto de autorización en backend.
 */
export const authenticatedGuard: CanActivateFn = (_route, state) => {
  const session = inject(SessionService);
  const router = inject(Router);

  return session.hasToken()
    ? true
    : router.createUrlTree(["/ingresar"], {
        queryParams: { returnUrl: state.url },
      });
};
